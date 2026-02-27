import { describe, it, expect } from 'vitest';
import {
  createArticleSchema,
  updateArticleSchema,
  createAiArticleSchema,
} from '@/lib/validators/article';

describe('createArticleSchema', () => {
  it('should parse valid input successfully', () => {
    const input = { title: 'Test Title', content: 'Test Content' };
    const result = createArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Title');
      expect(result.data.content).toBe('Test Content');
    }
  });

  it('should fail when title is empty', () => {
    const input = { title: '', content: 'Test Content' };
    const result = createArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when content is empty', () => {
    const input = { title: 'Test Title', content: '' };
    const result = createArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when title exceeds 120 characters', () => {
    const input = { title: 'a'.repeat(121), content: 'Test Content' };
    const result = createArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should accept title with exactly 120 characters', () => {
    const input = { title: 'a'.repeat(120), content: 'Test Content' };
    const result = createArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should fail when content exceeds 100,000 characters', () => {
    const input = { title: 'Test Title', content: 'a'.repeat(100001) };
    const result = createArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should accept content with exactly 100,000 characters', () => {
    const input = { title: 'Test Title', content: 'a'.repeat(100000) };
    const result = createArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe('updateArticleSchema', () => {
  it('should parse valid input with both fields', () => {
    const input = { title: 'Updated Title', content: 'Updated Content' };
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated Title');
      expect(result.data.content).toBe('Updated Content');
    }
  });

  it('should parse when only title is provided', () => {
    const input = { title: 'Updated Title' };
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated Title');
      expect(result.data.content).toBeUndefined();
    }
  });

  it('should parse when only content is provided', () => {
    const input = { content: 'Updated Content' };
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Updated Content');
      expect(result.data.title).toBeUndefined();
    }
  });

  it('should parse when no fields are provided', () => {
    const input = {};
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should fail when optional title is empty string', () => {
    const input = { title: '' };
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when optional title exceeds 120 characters', () => {
    const input = { title: 'a'.repeat(121) };
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when optional content is empty string', () => {
    const input = { content: '' };
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when optional content exceeds 100,000 characters', () => {
    const input = { content: 'a'.repeat(100001) };
    const result = updateArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('createAiArticleSchema', () => {
  it('should parse valid topic', () => {
    const input = { topic: 'Artificial Intelligence' };
    const result = createAiArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topic).toBe('Artificial Intelligence');
    }
  });

  it('should fail when topic is empty', () => {
    const input = { topic: '' };
    const result = createAiArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when topic exceeds 200 characters', () => {
    const input = { topic: 'a'.repeat(201) };
    const result = createAiArticleSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should accept topic with exactly 200 characters', () => {
    const input = { topic: 'a'.repeat(200) };
    const result = createAiArticleSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
