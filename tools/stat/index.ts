import { statSync } from "fs";
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
    const stat = statSync(absolutePath);
    
    const metadata = {
      path: absolutePath,
      type: stat.isDirectory() ? "directory" : stat.isFile() ? "file" : "other",
      size: stat.size,
      sizeKB: (stat.size / 1024).toFixed(2),
      created: new Date(stat.birthtime).toISOString(),
      modified: new Date(stat.mtime).toISOString(),
      accessed: new Date(stat.atime).toISOString(),
      permissions: stat.mode.toString(8).slice(-3),
    };
    
    const formatted = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    
    return {
      content: [
        {
          type: "text",
          text: formatted,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting file stat: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
