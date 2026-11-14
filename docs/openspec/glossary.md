# 术语表 {#glossary-1}

OpenSpec 的每一个术语都集中在这里，用平实的语言给出定义。通读一遍，之后阅读其他文档就会快得多。

术语按主题分组，每组内部按字母顺序排列。

## 核心名词 {#glossary-2}

**Spec。** 描述你的系统某一部分如何行为的文档。spec 位于 `openspec/specs/`，按 domain 组织，由 requirement 和 scenario 构成。spec 是对于“这个软件做什么？”这一问题的共识答案。参见 [Concepts](concepts.md#specs)。

**Source of truth（事实来源）。** 指整个 `openspec/specs/` 目录。它保存着你的系统当前、已达成共识的行为。change 提出对它的修改；archive 则把修改应用上去。

**Change。** 一个工作单元，以 `openspec/changes/<name>/` 下的文件夹形式打包。change 包含该工作的全部内容：它的 proposal、design、tasks，以及它引入的 spec 修改。一个 change，一个功能或修复。

**Artifact。** change 内部的文档。标准 artifact 包括 proposal、delta specs、design 和 tasks。它们按依赖顺序创建，并相互供给。

**Delta spec。** change 内部的 spec，只描述正在变化的内容，使用 `ADDED`、`MODIFIED` 和 `REMOVED` 小节，而不是重述整个 spec。正是这一点让 OpenSpec 能干净地编辑既有系统。参见 [Concepts](concepts.md#delta-specs)。

**Domain。** spec 的逻辑分组，例如 `auth/`、`payments/` 或 `ui/`。你可以按自己理解系统的方式来选择 domain。

## Spec 内部 {#spec}

**Requirement。** 系统必须具备的单个行为，通常使用 RFC 2119 关键字书写：“The system SHALL expire sessions after 30 minutes.”。requirement 陈述的是*做什么*，而不是*怎么做*。

**Scenario。** 对某个 requirement 在实际运行中的具体、可测试的示例，通常采用 Given/When/Then 形式。scenario 让 requirement 可验证：你可以据此编写一个自动化测试。

**RFC 2119 keywords。** 即 MUST、SHALL、SHOULD 和 MAY 这几个词，它们携带关于 requirement 严格程度的标准化含义。MUST 和 SHALL 是绝对的。SHOULD 是推荐的，但留有例外空间。MAY 是可选的。该名称来自定义这些词的互联网标准文档。

## 各类 artifact {#artifact}

**Proposal（`proposal.md`）。** change 的*为什么*和*做什么*：它的意图、范围和高层方案。这是你创建的第一个 artifact。

**Design（`design.md`）。** _怎么做_：技术方案、架构决策，以及你预计会改动的文件。对简单 change 而言是可选的。

**Tasks（`tasks.md`）。** 实现清单，带有复选框。AI 在 `/opsx:apply` 期间逐项推进，并一边进行一边勾选条目。

## 生命周期 {#glossary-5}

**Archive。** 完成一个 change 的行为。它的 delta specs 合并进主 specs，change 文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`。归档之后，你的 specs 描述的就是新的现实。参见 [Concepts](concepts.md#archive)。

**Sync。** 把 change 的 delta specs 合并进主 specs，但*不*归档该 change。通常是自动的（archive 会主动提出执行它），但也可以单独使用 `/opsx:sync` 来处理长期运行的 change。参见 [Commands](commands.md#opsxsync)。

## 工作流与命令 {#glossary-6}

**OPSX。** 当前标准的 OpenSpec workflow，围绕流畅的动作而非僵硬的阶段构建。它的斜杠命令都以 `/opsx:` 开头。参见 [OPSX Workflow](opsx.md)。

**Slash command（斜杠命令）。** 你在 AI 助手的聊天中输入的命令，例如 `/opsx:propose`。斜杠命令驱动 workflow。它们不是终端命令。参见 [How Commands Work](how-commands-work.md)。

**Explore（`/opsx:explore`）。** 思考搭档命令。它阅读你的代码库、比较各种选项，并把模糊的想法澄清为具体的计划。它从不写代码，也不会写其他内容，除非你要求它把这次探索捕获为一个 change，或者当它主动提出时你表示同意。只要你有问题但还没有计划，这就是推荐的起点。参见 [Explore First](explore.md)。

**CLI。** 你在终端中运行的 `openspec` 程序。它负责初始化项目、列出并校验 change、打开 dashboard，以及归档。它是 OpenSpec 的终端那一半。参见 [CLI](cli.md)。

**Skill。** 一个指令文件夹（`.../skills/openspec-*/SKILL.md`），你的 AI 助手会自动检测并遵循它。skill 是把 OpenSpec workflow 交付给你的助手的新兴跨工具标准。

**Command file（命令文件）。** 按工具区分的斜杠命令文件（`.../commands/opsx-*`）。这是较早的交付机制，仍然与 skill 并存支持。你很少会直接接触这些文件。

**Profile。** 安装在你项目中的斜杠命令集合。**Core**（默认）是 `propose`、`explore`、`apply`、`update`、`sync`、`archive`。**expanded** 集合额外增加 `new`、`continue`、`ff`、`verify`、`bulk-archive`、`onboard`。用 `openspec config profile` 修改它。

**Delivery。** 指 OpenSpec 为你的工具安装 skill、命令文件，还是两者都安装。在全局配置，并通过 `openspec update` 应用。

## 自定义 {#glossary-7}

**Schema。** 定义一个 workflow 拥有哪些 artifact，以及它们之间如何相互依赖。内置默认值是 `spec-driven`（proposal → specs → design → tasks）。你可以 fork 它，或编写自己的 schema。参见 [Customization](customization.md#custom-schemas)。

**Template。** schema 内部的一个 Markdown 文件，用来塑造 AI 针对某个给定 artifact 生成的内容。编辑 template 会立即改变 AI 的输出，无需重新构建。

**Project config（`openspec/config.yaml`）。** 按项目区分的设置：默认 schema、注入到每个规划请求中的 `context:`，以及按 artifact 区分的 `rules:`。这是让 OpenSpec 了解你的技术栈和约定最简便的方式。参见 [Customization](customization.md#project-configuration)。

**Context injection（上下文注入）。** 把项目背景放入 `config.yaml` 的 `context:` 字段，使其自动加入 AI 生成的每个 artifact。这比指望 AI 去读一个单独的文件更可靠。

**Dependency graph（依赖图）。** 由 artifact 的 `requires:` 关系形成的有向图。它是一个 DAG（有向无环图：箭头只指向前方，绝不形成环），OpenSpec 用它来判断你下一步可以创建什么。

**Enablers, not gates（是使能项，不是关卡）。** 这一原则指的是：artifact 依赖展示的是下一步什么会变得*可能*，而不是下一步什么*必须*做。你可以随时回顾并编辑任何 artifact。参见 [Core Concepts at a Glance](overview.md#enablers-not-gates)。

## 跨仓库协同（beta） {#beta}

这些术语仅当你的规划跨越多个仓库时才适用。它们处于 beta 阶段。大多数用户可以直接忽略。参见 [Stores User Guide](stores-beta/user-guide.md)。

**Store。** 一个独立仓库，它的全部职责就是规划。它具有你已经熟悉的 `openspec/` 结构（specs 和 changes），外加一个小型身份文件。你在自己的机器上按名称注册它一次，此后任何 OpenSpec 命令都可以从任意位置在其中工作。

**Reference。** 在代码仓库的 `openspec/config.yaml` 中，声明该仓库所引用的某个 store。reference 是只读的：仓库保留自己的根目录，而 `openspec instructions` 会获得一个被引用 store 的 specs 索引，每一项都附带获取它的确切命令。

**Working context（工作上下文）。** `openspec context` 为当前仓库汇集的内容：它的 OpenSpec 根目录，加上它引用的每一个 store，以及各自如何获取。“我正在跟什么一起工作？”的答案。

**Workset。** 一套个人的、仅在本机存在的文件夹集合，你会一起打开它们（一个 store 以及你正在处理的代码仓库）。通过 `openspec workset create` 显式创建；这些本地路径不会提交到共享的规划仓库中。

## 另见 {#glossary-9}

- [Core Concepts at a Glance](overview.md)：五个核心概念，尽在一页
- [Concepts](concepts.md)：长篇解释
- [How Commands Work](how-commands-work.md)：斜杠命令与 CLI 的对比
