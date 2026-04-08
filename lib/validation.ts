/**
 * Input validation utilities for API routes
 * Prevents XSS, SQL injection, and invalid data
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates a string input
 * - Checks for minimum/maximum length
 * - Prevents common injection patterns
 */
export function validateString(
  value: unknown,
  options: {
    fieldName: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
  }
): { valid: boolean; error?: ValidationError } {
  const { fieldName, minLength = 1, maxLength = 255, pattern, allowEmpty = false } = options;

  // Check if empty
  if (!value && !allowEmpty) {
    return {
      valid: false,
      error: { field: fieldName, message: `${fieldName} is required` },
    };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: { field: fieldName, message: `${fieldName} must be a string` },
    };
  }

  const trimmed = value.trim();

  // Check length
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: {
        field: fieldName,
        message: `${fieldName} must be at least ${minLength} characters`,
      },
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: {
        field: fieldName,
        message: `${fieldName} must be no more than ${maxLength} characters`,
      },
    };
  }

  // Check pattern if provided
  if (pattern && !pattern.test(trimmed)) {
    return {
      valid: false,
      error: { field: fieldName, message: `${fieldName} has an invalid format` },
    };
  }

  return { valid: true };
}

/**
 * Validates a numeric input
 * - Checks type and range
 */
export function validateNumber(
  value: unknown,
  options: {
    fieldName: string;
    min?: number;
    max?: number;
    isInteger?: boolean;
  }
): { valid: boolean; error?: ValidationError } {
  const { fieldName, min, max, isInteger = false } = options;

  if (value === null || value === undefined) {
    return {
      valid: false,
      error: { field: fieldName, message: `${fieldName} is required` },
    };
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num)) {
    return {
      valid: false,
      error: { field: fieldName, message: `${fieldName} must be a number` },
    };
  }

  if (isInteger && !Number.isInteger(num)) {
    return {
      valid: false,
      error: { field: fieldName, message: `${fieldName} must be an integer` },
    };
  }

  if (min !== undefined && num < min) {
    return {
      valid: false,
      error: {
        field: fieldName,
        message: `${fieldName} must be at least ${min}`,
      },
    };
  }

  if (max !== undefined && num > max) {
    return {
      valid: false,
      error: {
        field: fieldName,
        message: `${fieldName} must be no more than ${max}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates an email address
 */
export function validateEmail(value: unknown, fieldName: string = 'email'): { valid: boolean; error?: ValidationError } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(value, {
    fieldName,
    minLength: 5,
    maxLength: 254,
    pattern: emailRegex,
  });
}

/**
 * Validates a product SKU
 */
export function validateSKU(value: unknown, fieldName: string = 'sku'): { valid: boolean; error?: ValidationError } {
  // SKU: alphanumeric, hyphens, underscores only
  const skuRegex = /^[A-Z0-9_-]+$/i;
  return validateString(value, {
    fieldName,
    minLength: 3,
    maxLength: 50,
    pattern: skuRegex,
  });
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeString(value: string): string {
  return value
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Validates batch of fields
 */
export function validateFields(data: Record<string, unknown>, rules: Record<string, unknown>): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const ruleConfig = rule as any;

    // You can extend this with different validation types
    if (ruleConfig.type === 'string') {
      const result = validateString(value, {
        fieldName: field,
        ...ruleConfig,
      });
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    } else if (ruleConfig.type === 'number') {
      const result = validateNumber(value, {
        fieldName: field,
        ...ruleConfig,
      });
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    } else if (ruleConfig.type === 'email') {
      const result = validateEmail(value, field);
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
