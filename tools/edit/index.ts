import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export async function handler(input: Record<string, unknown>): Promise<{
  content: Array<{ type: string; text: string }>;
}> {
  const filePath = input.path as string;
  const oldString = input.oldString as string;
  const newString = input.newString as string;
  
  if (!filePath || oldString === undefined || newString === undefined) {
    return {
      content: [
        {
          type: "text",
          text: "Error: path, oldString, and newString parameters are required",
        },
      ],
    };
  }

  try {
    const absolutePath = resolve(filePath);
    const content = readFileSync(absolutePath, "utf-8");
    
    // Count occurrences
    const count = (content.match(new RegExp(oldString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    
    if (count === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Error: oldString not found in content`,
          },
        ],
      };
    }
    
    if (count > 1) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Found multiple matches for oldString. Provide more surrounding lines in oldString to identify the correct match.`,
          },
        ],
      };
    }
    
    // Replace the single occurrence
    const updated = content.replace(oldString, newString);
    writeFileSync(absolutePath, updated, "utf-8");
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully updated ${absolutePath}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error editing file: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
