import OpenCC from "opencc";

const converter = new OpenCC("s2t.json");

/**
 * 将简体中文转换为繁体中文
 */
export async function toTraditional(text: string): Promise<string> {
  return converter.convertPromise(text);
}

/**
 * 根据最大宽度对单行文本进行自动换行
 */
export function wrapTextLine(
  ctx: { measureText: (text: string) => { width: number } },
  text: string,
  maxWidth: number,
): string[] {
  if (!text || ctx.measureText(text).width <= maxWidth) return [text];
  const result: string[] = [];
  let current = "";
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      result.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) result.push(current);
  return result;
}
