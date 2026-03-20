import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { $ } from "bun";

const HOME = process.env.HOME ?? "";
const DOTFILES = dirname(new URL(import.meta.url).pathname);

interface SyncEntry {
  src: string;
  dest: string;
  dir?: boolean;
  sanitize?: boolean;
}

const SENSITIVE_VARS = new Set([
  "api_key",
  "apikey",
  "secret",
  "password",
  "passwd",
  "token",
  "credential",
  "auth",
  "private_key",
  "access_key",
  "aws_access_key_id",
  "aws_secret_access_key",
  "gh_token",
  "ghp_",
  "github_token",
  "openai_api_key",
  "anthropic_api_key",
  "slack_token",
  "stripe_key",
  "stripe_secret",
]);

const isSensitiveVar = (name: string): boolean => {
  const lower = name.toLowerCase();
  return [...SENSITIVE_VARS].some(
    (pattern) =>
      lower.includes(pattern) ||
      lower.endsWith("_key") ||
      lower.endsWith("_secret") ||
      lower.endsWith("_token")
  );
};

const sanitizeShell = (content: string): string =>
  content
    .split("\n")
    .map((line) => {
      const exportMatch = line.match(
        /^\s*(export\s+)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/
      );
      if (exportMatch) {
        const [, exportPart, varName] = exportMatch;
        if (varName !== undefined && isSensitiveVar(varName)) {
          return `# ${exportPart}${varName}=<redacted>  # set locally`;
        }
      }
      return line;
    })
    .join("\n");

const sanitizeJson = (content: string): string => {
  const sensitiveKeys =
    /"(api[_-]?key|secret|password|token|credential|auth)"\s*:\s*"[^"]*"/gi;
  return content.replace(sensitiveKeys, (match) =>
    match.replace(/:\s*"[^"]*"/, ': "<redacted>"')
  );
};

const abstractHomePath = (content: string, home: string): string => {
  if (home.length === 0) {
    return content;
  }
  const normalized = home.replace(/\/$/, "");
  return content.split(normalized).join("$HOME");
};

const isShellExt = (ext: string): boolean =>
  [".zsh", ".zshrc", ".bashrc", ".profile", ".zprofile"].some(
    (e) => ext === e || ext.endsWith(e)
  );

const sanitize = (content: string, ext: string, home: string): string => {
  if (ext === ".json") {
    return sanitizeJson(content);
  }
  if (isShellExt(ext)) {
    return abstractHomePath(sanitizeShell(content), home);
  }
  return content;
};

const entries: SyncEntry[] = [
  // zsh
  { dest: "shell/.zshrc", sanitize: true, src: join(HOME, ".zshrc") },
  { dest: "shell/.zprofile", sanitize: true, src: join(HOME, ".zprofile") },
  { dest: "shell/.p10k.zsh", sanitize: true, src: join(HOME, ".p10k.zsh") },

  // starship
  {
    dest: "config/starship/starship.toml",
    src: join(HOME, ".config", "starship.toml"),
  },

  // warp
  { dest: "warp/themes", dir: true, src: join(HOME, ".warp", "themes") },

  // zed
  {
    dest: "editors/zed/settings.json",
    sanitize: true,
    src: join(HOME, ".config", "zed", "settings.json"),
  },

  // brewfile
  { dest: "Brewfile", src: join(HOME, "Brewfile") },
];

let synced = 0;
let skipped = 0;
let failed = 0;

for (const entry of entries) {
  const dest = join(DOTFILES, entry.dest);

  if (!existsSync(entry.src)) {
    console.log(`  skip  ${entry.src} (not found)`);
    skipped += 1;
    continue;
  }

  mkdirSync(dirname(dest), { recursive: true });

  try {
    if (entry.dir) {
      await $`rm -rf ${dest}`.quiet();
      await $`cp -r ${entry.src} ${dest}`.quiet();
    } else if (entry.sanitize) {
      const content = readFileSync(entry.src, "utf8");
      const ext = entry.dest.slice(entry.dest.lastIndexOf("."));
      const sanitized = sanitize(content, ext, HOME);
      writeFileSync(dest, sanitized);
    } else {
      await $`cp ${entry.src} ${dest}`.quiet();
    }
    console.log(
      `  sync  ${entry.src} -> ${entry.dest}${entry.sanitize ? " (sanitized)" : ""}`
    );
    synced += 1;
  } catch (error) {
    console.error(`  FAIL  ${entry.src}: ${error}`);
    failed += 1;
  }
}

console.log(`\n${synced} synced, ${skipped} skipped, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
