import {
  validateString,
  validateNumber,
  validateEmail,
  validateSKU,
  sanitizeString,
} from '@/lib/validation';

describe('Input Validation', () => {
  describe('validateString', () => {
    it('should accept valid strings', () => {
      const result = validateString('hello', { fieldName: 'test' });
      expect(result.valid).toBe(true);
    });

    it('should reject empty strings when not allowed', () => {
      const result = validateString('', { fieldName: 'test', allowEmpty: false });
      expect(result.valid).toBe(false);
    });

    it('should enforce minimum length', () => {
      const result = validateString('hi', { fieldName: 'test', minLength: 3 });
      expect(result.valid).toBe(false);
    });

    it('should enforce maximum length', () => {
      const result = validateString('a'.repeat(300), {
        fieldName: 'test',
        maxLength: 255,
      });
      expect(result.valid).toBe(false);
    });

    it('should validate pattern', () => {
      const result = validateString('ABC-123', {
        fieldName: 'test',
        pattern: /^[A-Z0-9-]+$/,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateNumber', () => {
    it('should accept valid numbers', () => {
      const result = validateNumber(42, { fieldName: 'test' });
      expect(result.valid).toBe(true);
    });

    it('should enforce minimum value', () => {
      const result = validateNumber(5, { fieldName: 'test', min: 10 });
      expect(result.valid).toBe(false);
    });

    it('should enforce maximum value', () => {
      const result = validateNumber(100, { fieldName: 'test', max: 50 });
      expect(result.valid).toBe(false);
    });

    it('should validate integers', () => {
      const result = validateNumber(3.14, { fieldName: 'test', isInteger: true });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateSKU', () => {
    it('should accept valid SKU', () => {
      const result = validateSKU('IPHONE-15-PRO');
      expect(result.valid).toBe(true);
    });

    it('should reject SKU with invalid characters', () => {
      const result = validateSKU('IPHONE@15!');
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove angle brackets', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove javascript protocol', () => {
      const result = sanitizeString('javascript:alert("xss")');
      expect(result).not.toContain('javascript:');
    });

    it('should trim whitespace', () => {
      const result = sanitizeString('  hello  ');
      expect(result).toBe('hello');
    });
  });
});
