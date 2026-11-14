# 安装 {#installation-1}

## 安装 {#install}

OpenSpec 可从 npm 或其他包管理器安装；参见[包管理器](#package-managers)。它需要 **Node.js 22.12.0 或更高版本**。

## 借助 AI 助手安装 {#install-with-your-ai-assistant}

不想手工操作？把下面的提示词粘贴到任何能执行 shell 命令的编码助手中——Claude Code、Codex、Cursor、Gemini CLI、Copilot，以及其余[受支持的工具](supported-tools.md)。它会安装 CLI、初始化本项目，并回报实际发生了什么。

下面的手工步骤才是权威依据——提示词只是替你执行这些步骤。如果你的助手中途停下并把某些事项交还给你，这是有意设计的：它在做任何需要特权的事之前都会询问，并且绝不会编辑你的 shell 启动文件。这些零碎事项请你自己用[安装](#install)和[故障排查](troubleshooting.md)完成。

```text
在本项目中安装 OpenSpec 并为我配置好。按顺序执行以下步骤，遇到要求你停下的步骤就停下。

1. 安装。先运行 `openspec --version`。如果它打印出版本号，说明 OpenSpec 已安装：
   运行 `openspec version --check`，当它能判断安装方式时，该命令会打印对应的更新命令
   （否则按它当初的安装方式更新，例如 `brew upgrade openspec`），询问我是否执行，
   然后跳到第 3 步。否则进入第 2 步。

2. 包管理器（仅当第 1 步没有安装它时）。运行 `node --version`：这需要 Node.js
   22.12.0 或更高版本。如果 Node 缺失或过旧，请告知我并停下——不要替我安装 Node、
   切换版本或重新配置我的版本管理器。否则，使用我 PATH 上已有的那个包管理器，
   优先选 npm：
     npm install -g @fission-ai/openspec@latest
     pnpm add -g @fission-ai/openspec@latest
     bun add -g @fission-ai/openspec@latest
     yarn global add @fission-ai/openspec@latest   （仅 Yarn 1.x）
   不要依据本项目的 lockfile 来选择——全局安装与这个仓库自身依赖的安装方式无关。
   如果这四个都不可用，请停下并告诉我——不要自行发明一种安装方式。
   （如果我用的是 Nix，请把我指向 OpenSpec 安装文档中的 Nix 一节。）
   把确切命令展示给我，并在运行前让我确认；这会在项目之外安装软件，
   而我可能希望由另一个包管理器来管理它。
   如果安装需要 sudo 或管理员权限、因权限错误失败，或报告其全局 bin 目录缺失
   或未配置，请停下并再次询问我。绝不要编辑我的 shell 启动文件
   （.bashrc、.zshrc、.profile、fish、PowerShell profile），也绝不运行会替我
   修改它们的设置命令——把改动展示给我，让我自己来做。

3. PATH。运行 `openspec --version`。如果找不到该命令，它可能只是不在这个 shell 里：
   告诉我它安装在哪里（包管理器的全局 bin 目录），以及针对我的 shell 和操作系统
   如何把该目录加入 PATH，然后停下等我确认。如果它打印的版本比安装刚刚报告的版本
   更旧，说明 PATH 上有一个更早的副本遮蔽了它——告诉我这两个版本，而不是继续执行。
   如果我使用版本管理器，请直接说明，而不要绕开它去修改 PATH：使用 nvm 或 fnm 时，
   该 CLI 与安装时处于激活状态的 Node 版本绑定；使用 asdf 或 volta 时，
   可能需要重新生成 shim。

4. 初始化。询问我使用哪一个或哪些 AI 编码工具，并从 `openspec init --help` 中
   把每个工具映射到一个 id（Copilot 是 `github-copilot`，Zoo Code 是 `roocode`）。
   `--tools` 接受逗号分隔的列表，所以把它们全部列出。
   `openspec init --tools <ids>` 会自动删除旧版 OpenSpec 遗留的文件，且不会询问——
   包括我主目录中的 `opsx-*.md` 提示词文件（Codex 把它们放在 ~/.codex/prompts）。
   在运行之前，先找找这些遗留物：`.../commands/openspec/` 目录、CLAUDE.md 或
   AGENTS.md 之类文件中的 OpenSpec 标记块，以及主目录中的 `opsx-*.md` 提示词。
   把找到的全都列出来，并等我同意；如果什么也没找到，就说明这一点并直接继续，
   无需询问。已存在的 `openspec/` 目录不是问题——init 会刷新它，
   并且不会动我的 specs 和 changes。
   同时确认我在正确的目录中：init 会在它运行的地方创建 `openspec/`，
   包括 monorepo 的某个包内部。
   然后运行：openspec init --tools <ids>

5. 报告。不要假设应该存在什么——告诉我 init 实际打印了什么：它创建了多少个
   skills 和/或 commands、创建在哪里，配置文件那一行，任何“Setup required”提示，
   以及需要重启或重新加载什么。有些工具只支持 skills，创建零个 command 文件是
   正确的，所以缺少 commands 本身并不代表失败。如果 init 说没有生成任何内容，
   请转述它建议的修复办法，而不是重试。最后告诉我如何在我的工具中调用 OpenSpec，
   拼写要从 init 创建的文件中取，而不是从它的摘要行中取：不同工具的标点不同
   （有些用 /opsx:propose，有些用 /opsx-propose，Amazon Q 用 @opsx-propose），
   而获得 skills 而非 commands 的工具需按 skill 名称调用（/openspec-propose，
   或在 Codex 中用 $openspec-propose，或在 Kimi Code 中用 /skill:openspec-propose）。
```

提示词中没有任何厂商特定内容：它就是纯指令加上本页记录的同样命令。它适用于 macOS、Linux 和 Windows，并且在某一步需要你授权时，它会刻意停下而不是自行发挥。你的助手确实需要能够运行 shell 命令——少数 IDE 集成做不到这一点。

## 包管理器 {#package-managers}

用包管理器安装需要 **Node.js 22.12.0 或更高版本**（用 `node --version` 检查）。

### npm {#npm}

```bash
npm install -g @fission-ai/openspec@latest
```

### pnpm {#pnpm}

```bash
pnpm add -g @fission-ai/openspec@latest
```

### yarn {#yarn}

```bash
yarn global add @fission-ai/openspec@latest
```

Yarn 2 及更高版本（Berry）移除了 `global` 命令。在这些版本上，请改用 npm、pnpm 或 bun 安装 OpenSpec——全局 CLI 无需与你的项目共用包管理器。

### deno {#deno}

Deno 有时在解析 @latest 标签时会出问题，但初次安装时我们可以指定一个版本。
如果遇到这种情况，可以尝试把 @latest 标签换成版本号，类似 `@^1.3.1`

```bash
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@fission-ai/openspec@latest
# or
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@fission-ai/openspec@^1.3.1
```

注意：如果你的子命令会启动外部工具，例如 config edit、feedback 或 workspace open，你可能需要限定范围的 --allow-run=&lt;program&gt;。

### bun {#bun}

Bun 可以全局安装 OpenSpec，但 OpenSpec 目前运行在 Node.js 上。
你仍然需要 `PATH` 中有可用的 Node.js 22.12.0 或更高版本。

```bash
bun add -g @fission-ai/openspec@latest
```

## Nix {#nix}

无需安装，直接运行 OpenSpec：

```bash
nix run github:Fission-AI/OpenSpec -- init
```

或安装到你的 profile：

```bash
nix profile install github:Fission-AI/OpenSpec
```

或加入 `flake.nix` 中的开发环境：

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    openspec.url = "github:Fission-AI/OpenSpec";
  };

  outputs = { nixpkgs, openspec, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ openspec.packages.x86_64-linux.default ];
    };
  };
}
```

## 验证安装 {#installation-11}

```bash
openspec --version
```

## 更新 {#installation-12}

再次运行[安装命令](#install)即可升级 CLI（`npm install -g @fission-ai/openspec@latest` 或对应的 pnpm/yarn/bun 版本）。然后刷新每个项目生成的文件：

```bash
openspec update   # 在每个项目内部运行
```

`openspec update` 会为你已配置的工具重新生成 skill 和 command 文件，使你的 slash 命令与已安装版本保持同步。它还会检查是否发布了更新的 CLI 并提供升级选项，因为升级正是让新 workflow 可用的前提——参见 [CLI Reference](cli.md#openspec-update)。

## 卸载 {#uninstalling}

没有 `openspec uninstall` 命令，因为 OpenSpec 只是一个程序加上项目中的若干文件。移除它需要几个手工步骤，这里没有任何一步会碰到你的源代码。

**1. 移除 CLI。** 在终端中：

```bash
npm uninstall -g @fission-ai/openspec   # or: pnpm rm -g / yarn global remove / bun rm -g
```

**2. 从项目中移除 OpenSpec（可选）。** 如果你不再需要其中的 specs 和 changes，删除 `openspec/` 目录：

```bash
rm -rf openspec/
```

动手之前先想一想：`openspec/specs/` 和 `openspec/changes/archive/` 是系统如何行为以及为何改变的记录。如果你可能想要这段历史，即使在卸载之后也请保留该文件夹（或将其保留在 git 中）。

**3. 移除生成的 AI 工具文件（可选）。** OpenSpec 会把 skill 和 command 文件写入各工具对应的目录，例如 `.claude/skills/openspec-*/`、`.cursor/commands/opsx-*` 等。对你配置过的工具，删除其中的 `openspec-*` skills 和 `opsx-*` commands。各工具的确切路径列在[受支持的工具](supported-tools.md)中。

如果你在 `CLAUDE.md` 或 `AGENTS.md` 之类文件中还有 OpenSpec 标记块，请手动删除这些块；这些文件中你自己的内容归你保留。

## 下一步 {#installation-14}

安装完成后，在你的项目中初始化 OpenSpec：

```bash
cd your-project
openspec init
```

完整演练参见[快速开始](getting-started.md)。
