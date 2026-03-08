import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const filePath = input.path as string;
  const content = input.content as string;
  
  if (!filePath || content === undefined) {
    return {
      content: [
        {
          type: "text",
          text: "Error: path and content parameters are required",
        },
      ],
    };
  }

  try {
    const absolutePath = resolve(filePath);
    const dir = dirname(absolutePath);
    
    // Create parent directories if they don't exist
    mkdirSync(dir, { recursive: true });
    
    writeFileSync(absolutePath, content, "utf-8");
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully wrote ${content.length} characters to ${absolutePath}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error writing file: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
