import { readdirSync, statSync } from "fs";
import { resolve } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const dirPath = input.path as string;
  
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
    const entries = readdirSync(absolutePath, { withFileTypes: true });
    
    const formatted = entries
      .map((entry) => {
        const stat = statSync(resolve(absolutePath, entry.name));
        const type = entry.isDirectory() ? "dir" : "file";
        const size = entry.isFile() ? ` (${stat.size} bytes)` : "";
        const modified = new Date(stat.mtime).toISOString();
        
        return `${type === "dir" ? "📁" : "📄"} ${entry.name}${size} [${modified}]`;
      })
      .join("\n");
    
    return {
      content: [
        {
          type: "text",
          text: formatted || "(empty directory)",
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing directory: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
