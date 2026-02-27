import { describe, it, expect } from 'vitest';
import {
  createCommentSchema,
  updateCommentSchema,
} from '@/lib/validators/comment';

describe('createCommentSchema', () => {
  it('should parse valid content', () => {
    const input = { content: 'This is a valid comment' };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('This is a valid comment');
    }
  });

  it('should fail when content is empty', () => {
    const input = { content: '' };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when content exceeds 2000 characters', () => {
    const input = { content: 'a'.repeat(2001) };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should accept content with exactly 2000 characters', () => {
    const input = { content: 'a'.repeat(2000) };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should accept content with exactly 1 character', () => {
    const input = { content: 'a' };
    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe('updateCommentSchema', () => {
  it('should parse valid content', () => {
    const input = { content: 'Updated comment content' };
    const result = updateCommentSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Updated comment content');
    }
  });

  it('should fail when content is empty', () => {
    const input = { content: '' };
    const result = updateCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when content exceeds 2000 characters', () => {
    const input = { content: 'a'.repeat(2001) };
    const result = updateCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should accept content with exactly 2000 characters', () => {
    const input = { content: 'a'.repeat(2000) };
    const result = updateCommentSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
