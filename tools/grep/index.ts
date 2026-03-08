import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const pattern = input.pattern as string;
  const searchPath = input.path as string;
  const recursive = (input.recursive as boolean) ?? false;
  const lineNumbers = (input.lineNumbers as boolean) ?? true;
  const ignoreCase = (input.ignoreCase as boolean) ?? false;
  
  if (!pattern || !searchPath) {
    return {
      content: [
        {
          type: "text",
          text: "Error: pattern and path parameters are required",
        },
      ],
    };
  }

  try {
    const absolutePath = resolve(searchPath);
    const results: string[] = [];
    
    // Compile regex
    const flags = ignoreCase ? "gi" : "g";
    const regex = new RegExp(pattern, flags);
    
    function searchFile(filePath: string) {
      try {
        const content = readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            const lineNum = index + 1;
            const prefix = lineNumbers ? `${lineNum}: ` : "";
            results.push(`${filePath}${prefix}${line}`);
          }
        });
      } catch (err) {
        // Skip files we can't read
      }
    }
    
    function searchDir(dir: string, isRecursive: boolean) {
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          if (entry.isFile()) {
            searchFile(fullPath);
          } else if (entry.isDirectory() && isRecursive) {
            searchDir(fullPath, isRecursive);
          }
        }
      } catch (err) {
        // Skip directories we can't read
      }
    }
    
    // Check if path is file or directory
    const stat = statSync(absolutePath);
    if (stat.isFile()) {
      searchFile(absolutePath);
    } else if (stat.isDirectory()) {
      searchDir(absolutePath, recursive);
    }
    
    const output = results.length > 0 
      ? results.join("\n")
      : `No matches found for pattern "${pattern}"`;
    
    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
