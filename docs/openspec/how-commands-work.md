# 命令如何工作 {#how-commands-work-1}

**唯一需要知道的是：OpenSpec 有两类命令，它们运行在两个不同的地方。**

- `openspec ...` 命令在你的**终端**里运行。（例如：`openspec init`。）
- `/opsx:...` 命令在你的**AI 助手的聊天窗口**里运行。（例如：`/opsx:propose`。）

如果你曾经在终端里输入 `/opsx:propose` 却什么也没有发生，原因就在这里。你在跟 OpenSpec 的另一半说话。斜杠命令不是终端命令，它们是你交给 AI 编码助手的指令，输入的位置就是你平时输入“加一个登录表单”的同一个聊天框。

这个简单的区分是新用户最常见的绊脚石，所以我们把它讲得再清楚不过。

## 两半 {#how-commands-work-2}

OpenSpec 是同一个项目戴着两顶帽子。

**CLI（终端那一半）。** 一个名为 `openspec` 的程序，由你安装并在 shell 中运行。它初始化你的项目，列出并校验 change，显示仪表盘，并归档已完成的工作。你在 iTerm、VS Code 终端、PowerShell 中输入这些命令——任何你运行 `git` 或 `npm` 的地方。

```bash
openspec init        # set up OpenSpec in this project
openspec list        # see active changes
openspec view        # open the interactive dashboard
```

**斜杠命令（聊天那一半）。** 像 `/opsx:propose` 和 `/opsx:apply` 这样的简短命令，输入到你的 AI 助手里。它们告诉 AI 遵循 OpenSpec workflow：起草 proposal、编写 spec、依据 task 列表构建、完成后 archive。你在 Claude Code、Cursor、Devin Desktop、Copilot，或任何你使用的助手中输入这些命令。

```text
/opsx:propose add-dark-mode    (typed in your AI chat)
/opsx:apply                    (typed in your AI chat)
/opsx:archive                  (typed in your AI chat)
```

一幅图说明心智模型：

```text
        YOUR TERMINAL                         YOUR AI ASSISTANT'S CHAT
   ┌──────────────────────┐               ┌──────────────────────────────┐
   │  $ openspec init     │   installs    │  /opsx:propose add-dark-mode  │
   │  $ openspec list     │  ──────────►  │  /opsx:apply                  │
   │  $ openspec view     │   commands    │  /opsx:archive                │
   └──────────────────────┘    & skills   └──────────────────────────────┘
        run openspec here                       run /opsx:* here
```

注意那个箭头。在终端里运行 `openspec init`，正是把斜杠命令*安装*到你的 AI 工具中的动作。终端那一半负责搭好聊天那一半。此后，日常的推进大多发生在聊天里。

## “我该怎么启动交互模式？” {#how-commands-work-3}

**没有单独的交互模式需要启动。** 这个问题出现得很多，所以值得给一个直白的回答。

你不需要进入什么特殊的 OpenSpec 模式。你只需像平时一样打开 AI 编码助手，然后在聊天里输入一条斜杠命令。斜杠命令*就是*你“进入”OpenSpec 的方式。你的助手会识别它，加载对应的 OpenSpec skill，并开始遵循 workflow。

所以真正的操作步骤是：

1. 在你的项目里打开 AI 编码助手（Claude Code、Cursor、Devin Desktop 等等）。
2. 在它的聊天里输入 `/opsx:propose`，也就是你输入任何其他请求的同一个地方。
3. 留意自动补全：如果 OpenSpec 已安装，当你输入斜杠时会看到 `/opsx:propose`、`/opsx:apply` 之类出现。

就这样。没有模式要切换，没有守护进程要启动，没有单独的窗口。

确实有一件*真正*交互式的东西位于终端：`openspec view`。它打开一个仪表盘，用于浏览你的 spec 和 change。但那是一个查看器，不是用来 propose 和构建的东西。构建通过聊天里的斜杠命令完成。

## 为什么要分成两半 {#how-commands-work-4}

这值得理解，因为它解释了为什么 OpenSpec 能与 30 多种不同的 AI 工具配合工作。

CLI 是**引擎**。它掌握规则：一个 change 文件夹长什么样、哪些 artifact 依赖哪些、如何把 delta spec 合并进你的事实来源。它在任何地方都一样。

斜杠命令是**方向盘**，而每个 AI 工具的方向盘都略有不同。Claude Code 称它们为 commands。Cursor 和 Devin Desktop 有各自的格式。有些工具称它们为 skills。当你运行 `openspec init` 时，OpenSpec 会为你选中的每个工具生成对应类型的文件，因此无论你偏好哪个助手，相同的 `/opsx:propose` 意图都能工作。

这个设计的优势：你学一次 workflow，就能跨工具带走。代价：命令的确切语法在不同工具间可能略有差异，这就是下一节的内容。

## 各工具的斜杠命令语法 {#how-commands-work-5}

意图在所有地方都相同。拼写取决于你的工具加载的文件。

| 工具     | 如何输入            |
| -------- | ------------------- |
| Oh My Pi | `/openspec-propose` |

Oh My Pi 直接读取共享的 skills，因此 `/openspec-propose` 及其他
skill 名称就是调用形式。“Getting started”那行 `openspec init`
打印出的内容才是权威的。

## 命令是怎么到那里的：skills 与 commands {#skills-commands}

当你运行 `openspec init`（或 `openspec update`）时，OpenSpec 会把一些小文件写入你的项目，以便 AI 工具找到 workflow。取决于你的工具和设置，这些文件是 **skills**、**commands**，或者两者兼有。

- **Skills** 位于 `.claude/skills/openspec-*/SKILL.md` 之类的位置。它们是正在兴起的跨工具标准：一个指令文件夹，由你的助手自动检测。
- **Commands** 位于 `.cursor/commands/opsx-<id>.md` 或 `.claude/commands/opsx/<id>.md` 之类的位置——目录布局由工具决定，也由它决定你如何输入命令。它们是较早的按工具划分的斜杠命令文件。Codex 不会生成 command 文件；请使用 `.agents/skills/openspec-*`。

你不必关心你的工具使用哪一种。你只要输入斜杠命令，它就能工作。但知道这些文件的存在有助于排错：如果你的命令消失了，通常意味着这些文件缺失或过期，而 `openspec update` 会重新生成它们。

每个工具的确切路径见 [Supported Tools](supported-tools.md)，skills 如何取代较早的仅命令方案见 [Migration Guide](migration-guide.md)。

## 确认已安装 {#how-commands-work-7}

快速检查，由快到慢：

1. **在你的 AI 聊天里输入斜杠。** 开始输入 `/opsx`，留意自动补全建议。如果它们出现了，你就没问题了。在仅支持 skills 的工具上（Codex、Kimi Code、CodeArts、ForgeCode、Hermes、Mistral Vibe、Zed Agent，或共享的 `.agents` 目标），即使安装正常，`/opsx` 也永远不会补全——请改用上表中的 skill 名称。
2. **查找文件。** 对于 Claude Code，检查 `.claude/skills/` 是否包含 `openspec-*` 文件夹。其他工具使用各自的目录（[Supported Tools](supported-tools.md) 列出了它们）。
3. **重新运行初始化。** 在项目根目录运行 `openspec update`。它会为你配置过的工具重新生成 skill 和 command 文件。
4. **重启你的助手。** 许多工具在启动时扫描 skills 和 commands，所以开一个新窗口可能就是缺失的那一步。

## 我到底有哪些命令？ {#how-commands-work-8}

默认情况下，OpenSpec 安装**核心**斜杠命令集：

- `/opsx:explore`：在投入一个 change 之前，与 AI 一起把想法想清楚（当你不确定时，这是很棒的第一步）
- `/opsx:propose`：一步创建 change 并起草它的全部规划 artifact
- `/opsx:apply`：通过逐项完成 task 列表来构建 change
- `/opsx:update`：修订 change 的规划 artifact 并保持它们前后一致
- `/opsx:sync`：把 change 的 spec 更新合并进你的主 spec（通常是自动的）
- `/opsx:archive`：结束一个 change 并将其归档

一个好的默认节奏：当你在弄清要做什么时用 `explore`，然后 `propose`、`apply`、`archive`。[Explore First](explore.md) 指南解释了为什么这个开场步骤是值得的。

还有一套**扩展**命令集，供想要更精细控制的人使用（`/opsx:new`、`/opsx:continue`、`/opsx:ff`、`/opsx:verify`、`/opsx:bulk-archive`、`/opsx:onboard`）。用 `openspec config profile` 打开它，再用 `openspec update` 应用。

对这一切都不熟悉？`/opsx:onboard`（位于扩展集）会带你自己的代码库上走完一个完整的 change，并逐步讲解。它是最友好的入门方式。

每条命令的详细作用见 [Commands](commands.md)。至于何时该用哪条，见 [Workflows](workflows.md)。

## 一次干净的首跑 {#how-commands-work-9}

把它们串起来，下面是完整流程，每一步都标注了它发生在哪里。

```text
TERMINAL   $ npm install -g @fission-ai/openspec@latest
TERMINAL   $ cd your-project
TERMINAL   $ openspec init
              (installs slash commands into your AI tool)

AI CHAT      /opsx:explore
              (optional: think the idea through with the AI first)

AI CHAT      /opsx:propose add-dark-mode
              (AI drafts proposal, specs, design, tasks)

AI CHAT      /opsx:apply
              (AI builds it, checking off tasks)

AI CHAT      /opsx:archive
              (change is merged into your specs and filed away)
```

两个终端步骤完成设置。之后你就生活在聊天里了。这就是那个节奏。

## 相关 {#how-commands-work-10}

- [Getting Started](getting-started.md)：完整的第一条 change 演练
- [Commands](commands.md)：每条斜杠命令的详细说明
- [CLI](cli.md)：每条终端命令的详细说明
- [Supported Tools](supported-tools.md)：各工具的语法与文件位置
- [FAQ](faq.md)：更多快速解答
- [Troubleshooting](troubleshooting.md)：命令不出现时的修复办法
