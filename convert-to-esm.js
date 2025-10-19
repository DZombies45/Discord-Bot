import fs from "fs";
import path from "path";

const root = process.cwd();

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Skip node_modules or already converted files
  if (filePath.includes("node_modules") || content.includes("import ")) return;

  // Backup
  fs.writeFileSync(filePath + ".bak", content);

  // Convert dotenv
  content = content.replace(
    /require\(['"]dotenv['"]\)\.config\(\);?/g,
    'import "dotenv/config";',
  );

  // Convert require() to import (basic pattern)
  content = content.replace(
    /const\s+(\{?[\w\d_,\s]+\}?)\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
    (match, vars, mod) => {
      if (mod.startsWith(".")) {
        if (!mod.endsWith(".js")) mod += ".js";
      }
      return `import ${vars.includes("{") ? vars : `{ ${vars} }`} from "${mod}";`;
    },
  );

  // Convert module.exports
  content = content.replace(
    /module\.exports\s*=\s*(\{?[\s\S]*?\}?);?/g,
    (match, exp) => {
      if (exp.includes("{")) {
        return `export ${exp}`;
      }
      return `export default ${exp}`;
    },
  );

  // Clean up double imports or spacing
  content = content.replace(/\n{3,}/g, "\n\n");

  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅ Converted:", filePath);
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === "node_modules" || file.startsWith(".")) continue;
      walk(fullPath);
    } else if (file.endsWith(".js")) {
      convertFile(fullPath);
    }
  }
}

console.log("🚀 Converting project to ESM...");
walk(root);
console.log("✅ Conversion complete!");
