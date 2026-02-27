import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '@/lib/markdown';

describe('markdownToHtml', () => {
  it('should convert heading to h1', async () => {
    const result = await markdownToHtml('# heading');
    expect(result).toContain('<h1>heading</h1>');
  });

  it('should convert bold text to strong', async () => {
    const result = await markdownToHtml('**bold**');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('should convert italic text to em', async () => {
    const result = await markdownToHtml('*italic*');
    expect(result).toContain('<em>italic</em>');
  });

  it('should strip script tags for XSS prevention', async () => {
    const result = await markdownToHtml("<script>alert('xss')</script>");
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('should remove onerror attribute from img tags for XSS prevention', async () => {
    const result = await markdownToHtml(
      '<img onerror="alert(\'xss\')" src="x">'
    );
    expect(result).not.toContain('onerror');
  });

  it('should handle empty string', async () => {
    const result = await markdownToHtml('');
    expect(result).toBe('');
  });

  it('should convert h2 heading', async () => {
    const result = await markdownToHtml('## subheading');
    expect(result).toContain('<h2>subheading</h2>');
  });

  it('should convert unordered list', async () => {
    const result = await markdownToHtml('- item1\n- item2');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>item1</li>');
    expect(result).toContain('<li>item2</li>');
  });
});
