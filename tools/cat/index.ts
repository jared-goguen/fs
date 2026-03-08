import { readFileSync } from "fs";
import { resolve } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const filePath = input.path as string;
  
  if (!filePath) {
    return {
      content: [
        {
          type: "text",
          text: "Error: path parameter is required",
        },
      ],
    };
  }

  try {
    const absolutePath = resolve(filePath);
    const content = readFileSync(absolutePath, "utf-8");
    
    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
