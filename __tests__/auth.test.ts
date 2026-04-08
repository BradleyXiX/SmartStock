import { generateToken, verifyToken, hashPassword, verifyPassword } from '@/lib/auth';

describe('Authentication', () => {
  describe('JWT Tokens', () => {
    it('should generate valid token', () => {
      const token = generateToken(
        {
          userId: '123',
          username: 'testuser',
          role: 'user',
        },
        3600
      );

      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('should verify valid token', () => {
      const token = generateToken(
        {
          userId: '123',
          username: 'testuser',
          role: 'admin',
        },
        3600
      );

      const verification = verifyToken(token);
      expect(verification.valid).toBe(true);
      expect(verification.payload?.userId).toBe('123');
      expect(verification.payload?.role).toBe('admin');
    });

    it('should reject invalid token signature', () => {
      const token = generateToken(
        {
          userId: '123',
          username: 'testuser',
          role: 'user',
        },
        3600
      );

      // Tamper with token
      const parts = token.split('.');
      const tamperedToken = [parts[0], parts[1], 'invalidsignature'].join('.');

      const verification = verifyToken(tamperedToken);
      expect(verification.valid).toBe(false);
    });

    it('should reject expired token', () => {
      // Create token that expired 1 second ago
      const token = generateToken(
        {
          userId: '123',
          username: 'testuser',
          role: 'user',
        },
        -1
      );

      const verification = verifyToken(token);
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain('expired');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', () => {
      const password = 'mysecurepassword';
      const { hash, salt } = hashPassword(password);

      expect(hash).toBeTruthy();
      expect(salt).toBeTruthy();
      expect(hash).not.toBe(password);
    });

    it('should verify correct password', () => {
      const password = 'mysecurepassword';
      const { hash, salt } = hashPassword(password);

      const isValid = verifyPassword(password, hash, salt);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const { hash, salt } = hashPassword('correct-password');

      const isValid = verifyPassword('wrong-password', hash, salt);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', () => {
      const password = 'same-password';
      const result1 = hashPassword(password);
      const result2 = hashPassword(password);

      expect(result1.hash).not.toBe(result2.hash);
      expect(result1.salt).not.toBe(result2.salt);
    });
  });
});
