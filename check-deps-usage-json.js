import fs from "fs";
import path from "path";

const projectDir = process.cwd();
const pkgJsonPath = path.join(projectDir, "package.json");

if (!fs.existsSync(pkgJsonPath)) {
  console.error("package.json tidak ditemukan!");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
const dependencies = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
};

const allPackages = Object.keys(dependencies);

// Directories to scan
const SCAN_DIRS = ["src", "templates", "."];
const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "logs",
  "dist",
  "build",
  ".vscode",
  ".idea",
];
const VALID_EXT = [".js", ".mjs", ".cjs", ".ts", ".jsx", ".tsx"];

// Scan all valid files
function scanFiles(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry)) {
        results.push(...scanFiles(full));
      }
    } else if (VALID_EXT.includes(path.extname(entry))) {
      results.push(full);
    }
  }

  return results;
}

let files = [];
for (const dir of SCAN_DIRS) {
  const full = path.join(projectDir, dir);
  if (fs.existsSync(full)) {
    files.push(...scanFiles(full));
  }
}
files = [...new Set(files)];

// Find usage with line number
function findUsage(packageName, filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const patterns = [
    new RegExp(`from ['"]${packageName}['"]`),
    new RegExp(`require\\(['"]${packageName}['"]\\)`),
    new RegExp(`import\\(['"]${packageName}['"]\\)`),
  ];

  const matches = [];

  lines.forEach((line, index) => {
    if (patterns.some((re) => re.test(line))) {
      matches.push({
        file: filePath.replace(projectDir + "/", ""),
        line: index + 1, // human readable
        code: line.trim(),
      });
    }
  });

  return matches;
}

// MAIN
const usageMap = {};

for (const pkg of allPackages) {
  usageMap[pkg] = [];

  for (const file of files) {
    const found = findUsage(pkg, file);
    if (found.length > 0) {
      usageMap[pkg].push(...found);
    }
  }
}

// OUTPUT

console.log("\n=== Dependency Usage Report (with line numbers) ===\n");

for (const pkg of allPackages) {
  const used = usageMap[pkg];

  if (used.length === 0) {
    console.log(`❌ ${pkg}: TIDAK DIPAKAI\n`);
    continue;
  }

  console.log(`✅ ${pkg}: ${used.length} pemanggilan:\n`);
  used.forEach((u) => {
    console.log(` - ${u.file}:${u.line}`);
    console.log(`     ${u.code}`);
  });
  console.log("");
}

// Write JSON
const jsonPath = path.join(projectDir, "deps-usage.json");
fs.writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      dependencies: usageMap,
    },
    null,
    2,
  ),
);

console.log(`JSON saved → deps-usage.json\n`);
