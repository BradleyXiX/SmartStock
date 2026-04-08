/**
 * Environment variable validation
 * Ensures all required environment variables are present and valid
 */

interface EnvConfig {
  [key: string]: {
    required: boolean;
    default?: string;
    validate?: (value: string) => boolean;
    description: string;
  };
}

const envConfig: EnvConfig = {
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL database connection URL',
    validate: (value: string) => value.includes('postgresql://') || value.includes('postgres://'),
  },
  NODE_ENV: {
    required: false,
    default: 'development',
    description: 'Node environment (development, production, test)',
    validate: (value: string) => ['development', 'production', 'test'].includes(value),
  },
  NEXT_PUBLIC_API_BASE_URL: {
    required: false,
    default: 'http://localhost:3000',
    description: 'Public API base URL',
    validate: (value: string) => value.startsWith('http://') || value.startsWith('https://'),
  },
  JWT_SECRET: {
    required: false,
    description: 'Secret key for JWT signing',
    validate: (value: string) => value.length >= 32,
  },
};

/**
 * Validates all environment variables
 * Throws error if validation fails
 */
export function validateEnv(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(envConfig)) {
    const value = process.env[key] || config.default;

    // Check if required
    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${key}`);
      continue;
    }

    // Validate format if provided
    if (value && config.validate && !config.validate(value)) {
      errors.push(`Invalid format for environment variable ${key}: ${config.description}`);
    }

    // Warn about security issues
    if (key === 'JWT_SECRET' && !value && process.env.NODE_ENV === 'production') {
      warnings.push(`Warning: ${key} not set in production. JWT authentication will be disabled.`);
    }
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error(`Environment validation failed with ${errors.length} error(s)`);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  console.log('✅ Environment validation passed');
}

/**
 * Gets an environment variable with type safety
 */
export function getEnv(key: keyof typeof envConfig): string {
  const value = process.env[key] || envConfig[key].default;

  if (!value && envConfig[key].required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || '';
}

/**
 * Validates a single environment variable
 */
export function validateEnvVar(key: string, value: string): { valid: boolean; error?: string } {
  const config = envConfig[key];

  if (!config) {
    return { valid: true }; // Unknown var is OK
  }

  if (config.required && !value) {
    return { valid: false, error: `${key} is required` };
  }

  if (value && config.validate && !config.validate(value)) {
    return { valid: false, error: `Invalid format for ${key}: ${config.description}` };
  }

  return { valid: true };
}

export default envConfig;
