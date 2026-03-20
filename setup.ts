import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

import { $ } from "bun";

const HOME = process.env.HOME ?? "";
const DOTFILES = dirname(new URL(import.meta.url).pathname);

interface SetupEntry {
  src: string;
  dest: string;
  dir?: boolean;
}

const entries: SetupEntry[] = [
  // zsh
  { dest: join(HOME, ".zshrc"), src: "shell/.zshrc" },
  { dest: join(HOME, ".zprofile"), src: "shell/.zprofile" },
  { dest: join(HOME, ".p10k.zsh"), src: "shell/.p10k.zsh" },

  // starship
  {
    dest: join(HOME, ".config", "starship.toml"),
    src: "config/starship/starship.toml",
  },

  // warp
  { dest: join(HOME, ".warp", "themes"), dir: true, src: "warp/themes" },

  // zed
  {
    dest: join(HOME, ".config", "zed", "settings.json"),
    src: "editors/zed/settings.json",
  },

  // brewfile
  { dest: join(HOME, "Brewfile"), src: "Brewfile" },
];

const installBrew = async () => {
  if (
    await $`command -v brew`
      .quiet()
      .then(() => true)
      .catch(() => false)
  ) {
    console.log("  brew  already installed");
  } else {
    console.log("  brew  installing...");
    await $`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
    await $`eval "$(/opt/homebrew/bin/brew shellenv)"`;
  }

  const brewfilePath = join(DOTFILES, "Brewfile");
  if (existsSync(brewfilePath)) {
    console.log("  brew  installing packages from Brewfile...");
    await $`brew bundle --file=${brewfilePath}`.nothrow();
  }
};

const placeFiles = async () => {
  let placed = 0;
  let skipped = 0;

  for (const entry of entries) {
    const src = join(DOTFILES, entry.src);
    const { dest } = entry;

    if (!existsSync(src)) {
      console.log(`  skip  ${entry.src} (not in dotfiles)`);
      skipped += 1;
      continue;
    }

    mkdirSync(dirname(dest), { recursive: true });

    if (existsSync(dest)) {
      await $`cp -r ${dest} ${dest}.bak`.quiet().nothrow();
      console.log(`  back  ${dest} -> ${dest}.bak`);
    }

    if (entry.dir) {
      await $`rm -rf ${dest}`.quiet();
      await $`cp -r ${src} ${dest}`.quiet();
    } else {
      await $`cp ${src} ${dest}`.quiet();
    }

    console.log(`  ok    ${entry.src} -> ${dest}`);
    placed += 1;
  }

  console.log(`\n${placed} placed, ${skipped} skipped`);
};

console.log("==> Installing Homebrew & packages...\n");
await installBrew();

console.log("\n==> Placing config files...\n");
await placeFiles();

console.log("\n==> Done! Manual step:");
console.log("  - Fonts: install JetBrainsMono & Iosevka Nerd Fonts");
