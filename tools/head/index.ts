import { readFileSync } from "fs";
import { resolve } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const filePath = input.path as string;
  const lines = (input.lines as number) ?? 10;
  
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
    const allLines = content.split("\n");
    const headLines = allLines.slice(0, lines).join("\n");
    
    return {
      content: [
        {
          type: "text",
          text: headLines,
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
