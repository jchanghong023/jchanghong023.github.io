# OpenSpec 文档 {#openspec}

> [!WARNING]
> 这些页面属于旧版内容，其中部分已经过时。当前文档位于 **[openspec.dev/docs](https://openspec.dev/docs)**。此离线副本只保留了旧版文档树。

欢迎。这里是 OpenSpec 一切内容的家园。

OpenSpec 帮助你和你的 AI 编程助手**在写下任何代码之前就先就"要构建什么"达成一致。** 你描述这次 change，AI 起草一份简短的 spec 和一份 task 清单，你们双方看到的是同一个计划，然后工作才开始发生。再也不会做到一半才发现 AI 建错了东西。

如果你只读两页，请读这两页：

1. [快速开始](getting-started.md)：安装、初始化，并交付你的第一个 change。
2. [命令如何运作](how-commands-work.md)：你实际在哪里输入 `/opsx:propose`（提示：在 AI 聊天里，而不是终端里）。这一点几乎每个人都会遇上一次。

第二页比看上去更重要。OpenSpec 有两个半边：一个你在终端里运行的命令行工具，以及你交给 AI 助手的 slash 命令。搞清楚哪个是哪个，能帮你省掉最常见的困惑时刻。

> **最值得先养成的习惯：当你不确定要构建什么时，从 `/opsx:explore` 开始。** 它是一个零风险的思考伙伴，会阅读你的代码、权衡各种选项，并在写下任何代码之前把一个模糊的想法打磨成具体计划。[先探索](explore.md)指南说明了理由。

## 选择你的路径 {#index-2}

**我完全是新手。** 从[快速开始](getting-started.md)入手，然后略读[核心概念速览](overview.md)。当某处让你觉得神秘时，[FAQ](faq.md) 和[术语表](glossary.md)就在旁边。

**我有一个问题，但还没有计划。** 这是最常见的情况，而且有专门的答案：[先探索](explore.md)。在做出任何承诺之前，用 `/opsx:explore` 和 AI 一起把它想清楚。

**我有一个庞大的既有代码库。** 你不需要为它全部写文档。[在既有项目中使用 OpenSpec](existing-projects.md)展示了如何在真实的棕地代码上起步，而不必一口吃成胖子。

**我只想让它跑起来。** [安装](installation.md)，运行 `openspec init`，然后阅读[命令如何运作](how-commands-work.md)，这样你的第一条 slash 命令就能落在正确的位置。或者把安装交给你的助手，使用[AI 辅助安装提示词](installation.md#install-with-your-ai-assistant)。

**我通过例子学习。**[示例与配方](examples.md)页面从头到尾走完了真实的 change：一个小功能、一个 bug 修复、一次重构、一次探索。

**AI 刚起草了计划——然后呢？** 读它。[审查 change](reviewing-changes.md)展示了两分钟的检查流程，能在走错方向还很便宜的时候抓住它；[写好 spec](writing-specs.md)则讲了值得批准的计划由什么构成。

**我在团队中工作。**[团队中的 OpenSpec](team-workflow.md)展示了 change 如何映射到分支和 pull request，以及队友如何在代码之前审查计划。

**我来自旧工作流。**[迁移指南](migration-guide.md)解释了改变了什么、为什么改变，并承诺你现有的工作安全无虞。

**我想让它贴合我团队的流程。**[定制](customization.md)涵盖项目配置、自定义 schema 和共享上下文。

**有东西坏了。**[故障排查](troubleshooting.md)收集了人们真正会遇到的失败及相应的修复方法。

## 完整地图 {#index-3}

### 从这里开始 {#index-4}

| 文档                                 | 它给你什么                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| [快速开始](getting-started.md)       | 安装、初始化，并端到端地运行你的第一个 change                                   |
| [先探索](explore.md)                 | 使用 `/opsx:explore` 在承诺之前把想法想透                                       |
| [命令如何运作](how-commands-work.md) | slash 命令在哪里运行、"交互模式"是什么意思、终端与聊天的区别                    |
| [核心概念速览](overview.md)          | 一页纸的完整心智模型：spec、change、delta、archive                              |
| [安装](installation.md)              | npm、pnpm、yarn、bun、Nix，一段把安装交给 AI 助手的提示词，以及如何验证安装成功 |

### 日常使用 {#index-5}

| 文档                                              | 它给你什么                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| [工作流](workflows.md)                            | 常见模式，以及何时该用哪个命令                                          |
| [示例与配方](examples.md)                         | 真实 change 的完整演练，可复制粘贴                                      |
| [写好 spec](writing-specs.md)                     | 强的 requirement 和 scenario 长什么样，以及如何为 change 确定合适的规模 |
| [审查 change](reviewing-changes.md)               | 在写下任何代码之前，对起草好的计划进行的两分钟检查                      |
| [团队中的 OpenSpec](team-workflow.md)             | change 如何契合分支、pull request 和评审                                |
| [在既有项目中使用 OpenSpec](existing-projects.md) | 在大型棕地代码库上采用 OpenSpec                                         |
| [编辑与迭代 change](editing-changes.md)           | 更新 artifact、回退、协调手动修改                                       |
| [命令](commands.md)                               | 每个 `/opsx:*` slash 命令的参考                                         |
| [CLI](cli.md)                                     | 每个 `openspec` 终端命令的参考                                          |

### 深入理解 {#index-6}

| 文档                   | 它给你什么                                              |
| ---------------------- | ------------------------------------------------------- |
| [概念](concepts.md)    | 对 spec、change、artifact、schema 和 archive 的长篇解释 |
| [OPSX 工作流](opsx.md) | 为什么工作流是流动的而非按阶段锁定的，外加架构深度剖析  |
| [术语表](glossary.md)  | 在一处定义每一个术语                                    |

### 打造你自己的版本 {#index-7}

| 文档                             | 它给你什么                                           |
| -------------------------------- | ---------------------------------------------------- |
| [定制](customization.md)         | 项目配置、自定义 schema、共享上下文                  |
| [多语言](multi-language.md)      | 用英语之外的语言生成 artifact                        |
| [支持的工具](supported-tools.md) | OpenSpec 集成的 30 多款 AI 工具，以及文件落在哪里    |
| [社区展示](community.md)         | 用 OpenSpec 构建的、以及为 OpenSpec 构建的项目与资源 |

### 需要帮助时 {#index-8}

| 文档                           | 它给你什么                   |
| ------------------------------ | ---------------------------- |
| [FAQ](faq.md)                  | 对人们最常问的问题的快速解答 |
| [故障排查](troubleshooting.md) | 针对具体失败的具体修复方法   |
| [迁移指南](migration-guide.md) | 从旧工作流迁移到 OPSX        |

### 跨仓库协作（beta） {#beta}

| 文档                                          | 它给你什么                                         |
| --------------------------------------------- | -------------------------------------------------- |
| [Stores：用户指南](stores-beta/user-guide.md) | 当你的工作跨越仓库或团队时，在独立的仓库中进行规划 |
| [Agent 契约](agent-contract.md)               | agent 所驱动的机器可读 CLI 接口                    |

## 三十秒版本 {#index-10}

```text
1. Install        npm install -g @fission-ai/openspec@latest
2. Initialize     cd your-project && openspec init
3. Explore        (in your AI chat)  /opsx:explore           ← optional, but a great habit
4. Propose        (in your AI chat)  /opsx:propose add-dark-mode
5. Build          (in your AI chat)  /opsx:apply
6. Archive        (in your AI chat)  /opsx:archive
```

第 1 步和第 2 步发生在你的终端里（Windows 或 npm，见[安装](installation.md)）。其余步骤发生在 AI 助手的聊天里。这个分界是唯一值得记住的东西，而[命令如何运作](how-commands-work.md)确切解释了原因。第 3 步是可选的，但在你不确定时以 `/opsx:explore` 起步，是最值得养成的习惯。

## 还能在哪里获得帮助 {#index-11}

- **Discord：**[discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)，用于提问、交流想法和寻求帮助。
- **GitHub Issues：**[github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)，用于提交 bug 和功能请求。
- **`openspec feedback "your message"`** 直接从你的终端发送反馈（它会打开一个 GitHub issue）。

发现这些文档中有错误、过时或令人困惑的地方？那就是一个 bug——请开一个 [docs issue](https://github.com/Fission-AI/OpenSpec/issues/new?template=docs.yml)。
