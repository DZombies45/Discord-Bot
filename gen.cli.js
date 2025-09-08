#!/usr/bin/env node
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { select, text, confirm, intro, outro, isCancel } from "@clack/prompts";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ========= LOAD CONFIG ========= */
const CONFIG_PATH = path.join(process.cwd(), "generator.config.json");

if (!fs.existsSync(CONFIG_PATH)) {
  console.error(chalk.red("❌ generator.config.json tidak ditemukan."));
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

/* ========= LOGGING ========= */
const log = {
  success: (msg) => console.log(`${chalk.green("✅")} ${msg}`),
  error: (msg) => console.log(`${chalk.red("❌")} ${msg}`),
  info: (msg) => console.log(`${chalk.blue("ℹ️")} ${msg}`),
};

/* ========= UTILS ========= */
function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    log.success(`Folder dibuat: ${folderPath}`);
  }
}

function loadTemplate(templatePath) {
  const absolutePath = path.isAbsolute(templatePath)
    ? templatePath
    : path.join(process.cwd(), templatePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template file tidak ditemukan: ${absolutePath}`);
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function createFile(filePath, content) {
  fs.writeFileSync(filePath, content.trim(), "utf8");
  log.success(`File dibuat: ${path.relative(process.cwd(), filePath)}`);
}

/* ========= MAIN CLI ========= */
async function main() {
  intro(chalk.cyan.bold("✨ File Generator CLI"));

  // 1. Pilih tipe file dari config
  const fileType = await select({
    message: "📂 Pilih tipe file yang ingin digenerate:",
    options: config.types.map((t) => ({
      value: t.value,
      label: t.name,
    })),
  });

  if (isCancel(fileType)) {
    outro(chalk.yellow("❌ Dibatalkan."));
    return;
  }

  const selectedType = config.types.find((t) => t.value === fileType);
  if (!selectedType) {
    outro(chalk.red("❌ Konfigurasi untuk tipe file ini tidak ditemukan."));
    return;
  }

  const baseFolder = path.join(process.cwd(), selectedType.target);
  ensureFolderExists(baseFolder);

  let finalFolder = baseFolder;

  /* ======== 2. Jika scanSubfolders true ======== */
  if (selectedType.scanSubfolders) {
    let subfolders = fs
      .readdirSync(baseFolder)
      .filter((item) => fs.statSync(path.join(baseFolder, item)).isDirectory());

    if (subfolders.length === 0) {
      const createNew = await confirm({
        message: `Tidak ada subfolder di "${selectedType.target}". Buat subfolder baru?`,
      });

      if (createNew) {
        const newFolderName = await text({
          message: "Masukkan nama subfolder:",
          validate: (val) =>
            val.trim() ? undefined : "Nama subfolder tidak boleh kosong",
        });

        if (isCancel(newFolderName)) {
          outro(chalk.red("❌ Dibatalkan."));
          return;
        }

        const newFolderPath = path.join(baseFolder, newFolderName);
        fs.mkdirSync(newFolderPath, { recursive: true });
        log.success(`Subfolder dibuat: ${newFolderName}`);
        subfolders = [newFolderName];
      } else {
        outro(chalk.red("❌ Dibatalkan."));
        return;
      }
    }

    // Pilih subfolder
    const subfolderChoice = await select({
      message: "📂 Pilih subfolder:",
      options: [
        ...subfolders.map((folder) => ({
          value: folder,
          label: folder,
        })),
        { value: "new", label: "➕ Buat subfolder baru" },
      ],
    });

    if (isCancel(subfolderChoice)) {
      outro(chalk.red("❌ Dibatalkan."));
      return;
    }

    if (subfolderChoice === "new") {
      const newSubfolderName = await text({
        message: "Masukkan nama subfolder baru:",
        validate: (val) =>
          val.trim() ? undefined : "Nama subfolder tidak boleh kosong",
      });

      if (isCancel(newSubfolderName)) {
        outro(chalk.red("❌ Dibatalkan."));
        return;
      }

      finalFolder = path.join(baseFolder, newSubfolderName);
      fs.mkdirSync(finalFolder, { recursive: true });
      log.success(`Subfolder baru dibuat: ${newSubfolderName}`);
    } else {
      finalFolder = path.join(baseFolder, subfolderChoice);
    }
  }

  /* ======== 3. Nama file ======== */
  const fileName = await text({
    message: "📝 Masukkan nama file (tanpa ekstensi):",
    validate: (val) =>
      val.trim() ? undefined : "Nama file tidak boleh kosong",
  });

  if (isCancel(fileName)) {
    outro(chalk.red("❌ Dibatalkan."));
    return;
  }

  /* ======== 4. Generate file ======== */
  const finalPath = path.join(finalFolder, `${fileName}.js`);

  if (fs.existsSync(finalPath)) {
    outro(chalk.yellow(`⚠️ File sudah ada: ${finalPath}`));
    return;
  }

  const templateContent = loadTemplate(selectedType.template).replace(
    /\$NAME/g,
    fileName,
  );
  createFile(finalPath, templateContent);

  outro(chalk.green("🎉 Selesai! File berhasil digenerate."));
}

await main();
