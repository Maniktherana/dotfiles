export PATH=/opt/homebrew/bin:$PATH
export DJANGOPROJECT_DATA_DIR=~/.djangoproject
 source $(brew --prefix nvm)/nvm.sh
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
eval "$(starship init zsh)"

# Created by `pipx` on 2023-02-16 14:08:38
export PATH="$PATH:$HOME/.local/bin"
export PATH="/opt/homebrew/sbin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

# bun completions
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# pnpm
export PNPM_HOME="$HOME/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

export GOPATH=$HOME/go
export PATH=$GOPATH/bin:$PATH


export PATH="/opt/homebrew/opt/go@1.22/bin:$PATH"

# The next line updates PATH for the Google Cloud SDK.
if [ -f '$HOME/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '$HOME/Downloads/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '$HOME/Downloads/google-cloud-sdk/completion.zsh.inc' ]; then . '$HOME/Downloads/google-cloud-sdk/completion.zsh.inc'; fi
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="/opt/homebrew/opt/e2fsprogs/bin:$PATH"
export PATH="/opt/homebrew/opt/e2fsprogs/sbin:$PATH"
eval "$(zoxide init zsh)"

source <(fzf --zsh)

export PATH=$PATH:~/Library/Android/sdk/platform-tools
export PATH=$PATH:~/Library/Android/sdk/platform-tools

# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Added by Antigravity
export PATH="$HOME/.antigravity/antigravity/bin:$PATH"

alias claudetml="CLAUDE_CONFIG_DIR=~/.claude-turboml claude"
alias claudem="CLAUDE_CONFIG_DIR=~/.claude-personal claude"

# Vite+ bin (https://viteplus.dev)
. "$HOME/.vite-plus/env"
