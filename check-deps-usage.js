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

// === DIRECTORIES TO SCAN (based on your project tree) ===
const SCAN_DIRS = ["src", "templates", "."]; // root files included

const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "logs",
  ".vscode",
  ".idea",
  "dist",
  "build",
];

const VALID_EXT = [".js", ".mjs", ".cjs", ".ts", ".jsx", ".tsx"];

// --- scan function ---
function scanFiles(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry)) {
        results.push(...scanFiles(full));
      }
    } else {
      if (VALID_EXT.includes(path.extname(entry))) {
        results.push(full);
      }
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

files = [...new Set(files)]; // unique

// --- search usage ---
function checkUsage(packageName, filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const patterns = [
    new RegExp(`from ['"]${packageName}['"]`, "g"),
    new RegExp(`require\\(['"]${packageName}['"]\\)`, "g"),
    new RegExp(`import\\(['"]${packageName}['"]\\)`, "g"),
  ];

  return patterns.some((re) => re.test(content));
}

// --- main process ---
const usageMap = {};

for (const pkg of allPackages) {
  usageMap[pkg] = [];

  for (const file of files) {
    if (checkUsage(pkg, file)) {
      usageMap[pkg].push(file.replace(projectDir + "/", ""));
    }
  }
}

// --- output ---
console.log("\n=== Dependency Usage Report ===\n");

for (const pkg of allPackages) {
  const used = usageMap[pkg];

  if (used.length === 0) {
    console.log(`❌ ${pkg}: TIDAK DIPAKAI`);
  } else {
    console.log(`✅ ${pkg}: Dipakai di ${used.length} file:`);
    used.forEach((f) => console.log(`   - ${f}`));
  }

  console.log("");
}
