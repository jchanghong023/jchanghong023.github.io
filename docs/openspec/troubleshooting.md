# 疑难解答 {#troubleshooting-1}

针对具体问题的具体修复方案。每条都点明症状、用一句话解释可能的原因，并给出修复办法。如果这里没有你的问题，[FAQ](faq.md) 可能有用，而 [Discord](https://discord.gg/YctCnvvshC) 一定有用。

## 安装与配置 {#troubleshooting-2}

### `openspec: command not found` {#openspec-command-not-found}

CLI 没有安装，或者你的 shell 找不到它。全局安装并检查：

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

如果装了却仍然找不到，很可能你的全局 npm bin 目录不在 `PATH` 上。运行 `npm prefix -g` 查看全局包所在位置：在 macOS 和 Linux 上二进制文件位于该目录的 `bin/` 下，在 Windows 上则直接位于该目录中。确认该路径在 `PATH` 上。（`npm bin -g` 在 npm 9 中已被移除。）

如果你使用的是 [AI 辅助安装](installation.md#install-with-your-ai-assistant)，这就是预期的交接点：那个提示词会让你的助手把 `PATH` 的改动展示给你，而不是自行编辑你的 shell 启动文件。

### "Requires Node.js 22.12.0 or higher" {#requires-nodejs-22120-or-higher}

OpenSpec 运行在 Node 22.12.0+ 上（Node 20 已于 2026 年 4 月停止维护，不再受支持）。检查你的版本，必要时升级：

```bash
node --version
```

如果你用 bun 安装 OpenSpec，请注意 OpenSpec 仍然*运行*在 Node 上，因此无论怎样你都需要 `PATH` 上有可用的 Node 22.12.0+。参见[安装](installation.md)。

如果你无法升级 Node，Homebrew 是一个选择：它依然在 Node 上运行 OpenSpec，但会作为依赖为你安装并管理一个当前的 Node.js。

### `openspec init` 没有配置我的 AI 工具 {#openspec-init-ai}

Init 会询问要设置哪些工具。如果你跳过了自己的工具或想添加另一个，再运行一次即可，或者使用非交互形式：

```bash
openspec init --tools claude,cursor
```

工具 ID 的完整列表见[支持的工具](supported-tools.md)。使用 `--tools all` 表示全部，使用 `--tools none` 跳过工具设置。

## 命令不显示 {#commands-dont-show-up}

如果 `/opsx:propose`（或你所用工具的等价形式）没有出现或没有任何作用，请按下面的清单逐条排查。它们按检查速度从快到慢排列。

1. **你可能在错误的地方。** 斜杠命令要到你的 AI 助手的对话里输入，而不是终端。如果你把 `/opsx:propose` 敲进了 shell，那就是问题所在。参见[命令如何工作](how-commands-work.md)。

2. **重新生成文件。** 在项目根目录执行：

   ```bash
   openspec update
   ```

   这会为你配置过的每个工具重写 skill 与命令文件。

   指令文件来自*已安装*的 CLI，因此过时的 CLI 会报告一切已是最新，却从不写入更新的 workflow。`openspec update` 现在会检查这种情况并提议升级——看到就接受。

3. **重启你的助手。** 大多数工具在启动时扫描 skill 与命令。开个新窗口通常就能解决。

4. **确认文件存在。** 对 Claude Code，检查 `.claude/skills/` 中是否包含 `openspec-*` 文件夹。其他工具使用各自的目录，全部列在[支持的工具](supported-tools.md)中。

5. **确认你初始化了本项目。** skill 是按项目写入的。如果你克隆了仓库或切换了文件夹，就在那里运行 `openspec init`（或 `openspec update`）。

6. **确认你的工具支持命令文件。** Codex、CodeArts、ForgeCode、Hermes、Kimi Code、Mistral Vibe、Zed Agent 以及共享的 `.agents` 目标不会生成 `opsx-*` 命令文件；它们改用基于 skill 的调用方式，因此 `/opsx` 永远不会为它们自动补全。在 Codex 中输入 `$openspec-propose`，在 Kimi Code 中输入 `/skill:openspec-propose`，其余工具输入 `/openspec-propose`。共享的 `.agents` 目标是厂商中立的，因此 `/openspec-propose` 是常见形式而非保证可用的形式——如果你的助手不响应它，就查看其自身文档了解它如何调用 skill。Amazon Q 确实会获得命令文件，但会把它们加载进提示词库而不是斜杠菜单——在那里输入 `@opsx-propose`，而不是 `/opsx`。每个工具的形式都列在[如何调用](supported-tools.md#how-to-invoke)中。

## 使用 change {#change}

### "Change not found" {#change-not-found}

命令无法判断你指的是哪个 change。显式指定名称，或者查看存在哪些：

```bash
openspec list                    # see active changes
/opsx:apply add-dark-mode        # name the change in chat
```

同时确认你在正确的项目目录中。

### "No artifacts ready" {#no-artifacts-ready}

每个 artifact 要么已经创建，要么正在等待某个依赖而被阻塞。查看是什么在阻塞：

```bash
openspec status --change <name>
```

然后先创建缺失的依赖。记住顺序：proposal 使 specs 与 design 可用；specs 与 design 一起使 tasks 可用。

### `openspec validate` 报告警告或错误 {#openspec-validate}

验证会检查你的 specs 与 changes 的结构问题。阅读消息：它会指出文件和问题所在。

```bash
openspec validate <name>           # validate one item
openspec validate --all            # validate everything
openspec validate --all --strict   # stricter checks, good for CI
openspec validate --archived       # fail if archived changes have unchecked tasks
```

常见原因是缺少必需的章节（例如一个没有 scenario 的 spec）或 delta 头部格式错误。修复文件后重新运行。[CLI 参考](cli.md#openspec-validate)文档说明了输出格式。

有一条消息值得单独说明：

```text
MODIFIED "<requirement>" omits scenario(s) the current spec still has: "<scenario>"
```

`MODIFIED` 类型的 requirement 会替换整个 requirement 块，因此它必须携带该 change 之后仍然存在的每一个 scenario，而不仅仅是你编辑过的那些。把消息中点名的 scenario 从 `openspec/specs/<capability-path>/spec.md` 复制回 delta，并保留路径中任何域目录。这个问题常常出现在某个较旧的 change 上，原因是他人的 change 给同一个 requirement 添加了 scenario——无论哪种情况 archive 都会拒绝该 change，而现在验证会在你实施之前就告诉你。

### AI 创建的 artifact 不完整或有误 {#ai-artifact}

AI 没有足够的上下文。几个有效的手段：

- 在 `openspec/config.yaml` 中添加项目上下文，让你的技术栈与约定被注入到每个请求中。参见[自定义](customization.md#project-configuration)。
- 添加按 artifact 生效的 `rules:`，用于只适用于比如 specs 的指引。
- 在 propose 时给出更详细的描述。
- 使用带展开的 `/opsx:continue` 一次创建一个 artifact 并逐个审查，而不是让 `/opsx:ff` 一次性全部完成。

### Archive 无法完成，或警告存在未完成的任务 {#archive}

Archive 不会因未完成的任务而*阻塞*，但会警告你，因为归档通常意味着工作已完成。如果任务是刻意保留的（你在提交一个部分完成的 change），继续即可。否则先完成任务。如果你尚未同步，Archive 还会提示将 delta specs 同步到主 specs；除非你有理由拒绝，否则选择同意。

### "User force closed the prompt with 0 null" {#user-force-closed-the-prompt-with-0-null}

某个地方运行了 `openspec archive`，但那里没有任何东西能回答提问——比如 AI agent 从工具中调用它、CI 任务，或者任何 stdin 已关闭的 shell。Archive 最多会询问三次确认，而无法回答的确认过去会以那条原始消息失败。

传入 `--yes` 提前回答这些确认：

```bash
openspec archive <change-name> --yes
```

保留你原本传递的任何标志——`--skip-specs` 和 `--no-validate` 会改变 archive 的行为，所以裸的 `--yes` 重跑并不等于同一条命令。当前版本会替你指出该标志，并打印一行你可以直接粘贴的 `Fix:`。如果你本来想从列表中挑选，请显式传入 change 名称：选择器同样需要回答。

如果你改为把 archive 的输出重定向到文件或由工具捕获，并且*确实*通过管道传入了回答（`printf 'y\n' | openspec archive …`），旧版本在绘制提示词时会把终端转义码写进该捕获内容——在某些环境中足以让文件严重膨胀。当前版本只要 stdout 不是终端，就会把确认提示当作纯文本读取，而不带参数的 `openspec archive`（否则会绘制交互式 change 选择器）会要求你提前传入 change 名称，而不是把菜单渲染进捕获内容。无论哪种方式，重定向与 agent 运行都保持干净；传入 `--yes`（同时带上 change 名称）则完全跳过提示。

## 配置 {#troubleshooting-14}

### 我的 `config.yaml` 没有生效 {#configyaml}

三个常见嫌疑：

1. **文件名错误。** 必须是 `openspec/config.yaml`，而不是 `.yml`。
2. **YAML 无效。** 用任意 YAML 校验器检查；CLI 也会报告带行号的语法错误。
3. **你以为需要重启。** 不需要。配置改动立即生效。

### "Unknown artifact ID in rules: X" {#unknown-artifact-id-in-rules-x}

`rules:` 下的某个键与你的 schema 中的任何 artifact 都不匹配。对于默认的 `spec-driven` schema，有效 ID 是 `proposal`、`specs`、`design`、`tasks`。查看任意 schema 的 ID：

```bash
openspec schemas --json
```

### "Context too large" {#context-too-large}

`context:` 字段上限为 50KB，这是有意的，因为它会被注入到每个请求中。将其精简概括，或者链接到更长的文档而不是粘贴它们。精简的上下文也会产生更好、更快的结果。

### "Schema not found" {#schema-not-found}

你引用的 schema 名称不存在。列出可用的并检查拼写：

```bash
openspec schemas                    # list available schemas
openspec schema which <name>        # see where a schema resolves from
openspec schema init <name>         # create a custom one
```

参见[自定义](customization.md#custom-schemas)。

## 从旧版 workflow 迁移 {#workflow}

### "Legacy files detected in non-interactive mode" {#legacy-files-detected-in-non-interactive-mode}

你处于 CI 或非交互式 shell 中，OpenSpec 发现了可清理的旧文件但无法提示你。自动批准：

```bash
openspec init --force
```

对 Codex，OpenSpec 可能会检测到 `$CODEX_HOME/prompts` 或 `~/.codex/prompts` 中的旧受管提示词文件。该清理仅限于 OpenSpec 白名单内的旧 Codex 提示词文件名，并且非交互式 `openspec init` 只删除那些存在替代 `.agents/skills/openspec-*` skill 的文件。非交互式 `openspec update` 不会改动任何旧文件清理，除非你传入 `--force`。

### 迁移后命令没有出现 {#troubleshooting-21}

重启你的 IDE。skill 在启动时被检测。如果它们仍未出现，运行 `openspec update` 并检查[支持的工具](supported-tools.md)中的文件位置。

### 我旧的 `project.md` 没有被迁移 {#projectmd}

这是有意为之。OpenSpec 从不自动删除 `project.md`，因为它可能包含你编写的上下文。把有用的部分移入 `config.yaml` 的 `context:` 段，然后自行删除它。[迁移指南](migration-guide.md#migrating-projectmd-to-configyaml)详细讲解了这一点，包括一段可以交给 AI 代为提炼的提示词。

## 还是卡住了？ {#troubleshooting-23}

- **Discord：** [discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues：** [github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **从你的终端：** `openspec feedback "what went wrong"` 会替你开一个 issue。

报告问题时，请包含你的 OpenSpec 版本（`openspec --version`）、Node 版本（`node --version`）、你使用的 AI 工具，以及确切的命令与输出。这能让帮助快得多。
