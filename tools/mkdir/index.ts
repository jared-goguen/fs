import { mkdirSync } from "fs";
import { resolve } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const dirPath = input.path as string;
  const recursive = (input.recursive as boolean) ?? true;
  
  if (!dirPath) {
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
    const absolutePath = resolve(dirPath);
    mkdirSync(absolutePath, { recursive });
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully created directory: ${absolutePath}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating directory: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
