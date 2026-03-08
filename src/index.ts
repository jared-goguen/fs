import { startServer } from "mcp-core";

// Convention-aware filesystem wrapper for the monorepo
// This server knows about our project structure and conventions:
// - Monorepo root: ~/source
// - Config: ~/source/opencode.json
// - Temp artifacts: /tmp

await startServer({
  name: "fs",
  version: "0.1.0",
});
