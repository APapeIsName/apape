import { headers } from "next/headers";

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getRequestId(): Promise<string> {
  try {
    const headerList = await headers();
    return headerList.get("x-request-id") ?? generateRequestId();
  } catch {
    return generateRequestId();
  }
}
