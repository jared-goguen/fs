import { readdirSync, statSync } from "fs";
import { resolve, join } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const searchPath = input.path as string;
  const pattern = input.pattern as string;
  const maxDepth = (input.maxDepth as number) || 5;
  
  if (!searchPath || !pattern) {
    return {
      content: [
        {
          type: "text",
          text: "Error: path and pattern parameters are required",
        },
      ],
    };
  }

  try {
    const absolutePath = resolve(searchPath);
    const results: string[] = [];
    
    function searchDir(dir: string, currentDepth: number) {
      if (currentDepth > maxDepth) return;
      
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          // Check if matches pattern (simple glob-like matching)
          if (matchPattern(entry.name, pattern)) {
            results.push(fullPath);
          }
          
          // Recurse into directories
          if (entry.isDirectory()) {
            searchDir(fullPath, currentDepth + 1);
          }
        }
      } catch (err) {
        // Skip directories we can't read
      }
    }
    
    searchDir(absolutePath, 0);
    
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
          text: `Error searching directory: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

function matchPattern(name: string, pattern: string): boolean {
  // Simple glob-like pattern matching
  if (pattern === "*") return true;
  if (pattern.startsWith("*.")) {
    const ext = pattern.substring(1);
    return name.endsWith(ext);
  }
  if (pattern.endsWith("*")) {
    const prefix = pattern.substring(0, pattern.length - 1);
    return name.startsWith(prefix);
  }
  return name.includes(pattern);
}
