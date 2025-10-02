// Node script: sync PROJECT_NAME with manifest header.name and rename pack folders
const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return JSON.parse(text);
}

function writeEnv(projectName) {
  const envPath = path.resolve(__dirname, "..", ".env");

  // 读取现有的 .env 文件内容
  let existingContent = "";
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, "utf8");
  }

  // 解析现有的环境变量
  const lines = existingContent.split("\n");
  const envVars = {};
  const otherLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        envVars[key] = value;
      } else {
        otherLines.push(line);
      }
    } else {
      otherLines.push(line);
    }
  }

  // 更新 PROJECT_NAME
  envVars.PROJECT_NAME = `"${projectName}"`;

  // 重新构建 .env 文件内容
  const newContent =
    [
      ...otherLines.filter((line) => line.trim() !== ""),
      ...Object.entries(envVars).map(([key, value]) => `${key}=${value}`),
    ].join("\n") + "\n";

  fs.writeFileSync(envPath, newContent, "utf8");
}

function findSingleSubdir(dir) {
  const full = path.resolve(dir);
  if (!fs.existsSync(full)) return undefined;
  const entries = fs
    .readdirSync(full, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  if (entries.length === 0) return undefined;
  // Prefer a directory that contains a manifest.json
  const withManifest = entries.find((name) => fs.existsSync(path.join(full, name, "manifest.json")));
  return withManifest || entries[0];
}

function ensureRenamed(parentDir, currentName, targetName) {
  if (!currentName) return;
  if (currentName === targetName) return;
  const src = path.resolve(parentDir, currentName);
  const dst = path.resolve(parentDir, targetName);
  if (!fs.existsSync(src)) return;
  // If destination exists and is different, remove or move aside?
  if (fs.existsSync(dst)) {
    // If already correct, nothing to do
    return;
  }
  fs.renameSync(src, dst);
}

(function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const resourcePacksDir = path.join(projectRoot, "resource_packs");
  const behaviorPacksDir = path.join(projectRoot, "behavior_packs");

  const currentResourceDirName = findSingleSubdir(resourcePacksDir);
  const currentBehaviorDirName = findSingleSubdir(behaviorPacksDir);

  const resourceManifestPath = currentResourceDirName
    ? path.join(resourcePacksDir, currentResourceDirName, "manifest.json")
    : undefined;
  const behaviorManifestPath = currentBehaviorDirName
    ? path.join(behaviorPacksDir, currentBehaviorDirName, "manifest.json")
    : undefined;

  const candidates = [];
  if (resourceManifestPath && fs.existsSync(resourceManifestPath)) {
    const stat = fs.statSync(resourceManifestPath);
    candidates.push({ kind: "resource", path: resourceManifestPath, mtimeMs: stat.mtimeMs });
  }
  if (behaviorManifestPath && fs.existsSync(behaviorManifestPath)) {
    const stat = fs.statSync(behaviorManifestPath);
    candidates.push({ kind: "behavior", path: behaviorManifestPath, mtimeMs: stat.mtimeMs });
  }

  if (candidates.length === 0) {
    console.warn("[sync-project-name] 未找到任一 manifest.json，跳过");
    return;
  }

  // 选取最近修改的 manifest 作为真值来源
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const chosen = candidates[0];

  const manifest = readJson(chosen.path);
  const header = manifest && manifest.header;
  const targetName = header && header.name;
  if (!targetName || typeof targetName !== "string") {
    console.warn("[sync-project-name] manifest.header.name 缺失或无效，跳过");
    return;
  }

  // 若另一侧的 manifest 存在，则同步其 header.name
  const otherManifestPath = chosen.kind === "resource" ? behaviorManifestPath : resourceManifestPath;
  if (otherManifestPath && fs.existsSync(otherManifestPath)) {
    try {
      const otherManifest = readJson(otherManifestPath);
      if (!otherManifest.header || typeof otherManifest.header !== "object") {
        otherManifest.header = {};
      }
      if (otherManifest.header.name !== targetName) {
        otherManifest.header.name = targetName;
        fs.writeFileSync(otherManifestPath, JSON.stringify(otherManifest, null, 2) + "\n", "utf8");
        console.log(`[sync-project-name] 已同步另一侧 manifest: ${otherManifestPath}`);
      }
    } catch (e) {
      console.warn(`[sync-project-name] 同步另一侧 manifest 失败: ${otherManifestPath}`, e);
    }
  }

  // 1) 写入 .env
  writeEnv(targetName);

  // 2) 重命名两个目录
  ensureRenamed(resourcePacksDir, currentResourceDirName, targetName);
  ensureRenamed(behaviorPacksDir, currentBehaviorDirName, targetName);

  console.log(`[sync-project-name] 来源: ${chosen.kind}, 已同步为: ${targetName}`);
})();
