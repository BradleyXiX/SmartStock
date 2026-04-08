/**
 * Environment initialization
 * Validates all environment variables on application startup
 */

import { validateEnv } from '@/lib/env';

try {
  validateEnv();
  console.log('✅ Application initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize application');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
