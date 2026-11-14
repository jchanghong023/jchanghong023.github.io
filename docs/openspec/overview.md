# 核心概念一览 {#overview-1}

**OpenSpec 是你与你的 AI 之间的一层轻量共识层。** 你写下某个 change 应该做什么，AI 起草细节，你们双方看到的是同一份计划，只有到那时才开始写代码。本页用一屏篇幅呈现完整的心智模型。当你想要详尽版本时，[Concepts](concepts.md) 里有。

整个理念用五个词概括：**先达成共识，再自信构建。**

## 五个核心思想 {#overview-2}

OpenSpec 中的一切都由五个概念构建而成。学会这些，其余都只是细节。

**1. Spec 就是事实。** spec 描述你的系统*当前*的行为方式。它位于 `openspec/specs/`，按领域组织（`auth/`、`payments/`、`ui/`）。spec 由 requirement（“系统 SHALL 在 30 分钟后使会话过期”）与 scenario（具体的 given/when/then 示例）组成。把 spec 当作对“这个软件做什么？”这一问题唯一的、已达成共识的答案。

**2. change 是一个工作单元。** 当你想新增、修改或移除某种行为时，你创建一个 change：`openspec/changes/` 下的一个文件夹，把与这项工作相关的所有内容集中在一处。一份 proposal、一份 design、一份 task 列表，以及 spec 的修改。一个 change、一个文件夹、一个功能。

**3. Delta spec 描述正在变化的部分，而不是整个世界。** 在一个 change 内部，你不必重写整个 spec。你写一个小的 delta：`ADDED` 这个 requirement，`MODIFIED` 那个，`REMOVED` 另一个。正是这个技巧让 OpenSpec 擅长编辑既有系统，而不只是全新项目。你描述的是差异，而不是终点。

**4. 各 artifact 层层递进。** 一个 change 包含若干文档，按自然顺序创建，每一个都为下一个提供输入：

```text
proposal ──► specs ──► design ──► tasks ──► implement
   why        what       how       steps      do it
```

你可以随时回头修改其中任何一个。它们是助推器，而不是关卡。（详见下文。）

**5. archive 把 change 折回事实之中。** 工作完成后，你将该 change 归档。它的 delta spec 合并进你的主 spec，change 文件夹则以日期戳移动到 `changes/archive/`。现在你的 spec 描述的是新的现实，你也准备好迎接下一个 change。循环闭合。

## 全景图 {#overview-3}

```text
┌─────────────────────────────────────────────────────────────────┐
│                          openspec/                              │
│                                                                 │
│   ┌──────────────────┐         ┌──────────────────────────┐    │
│   │     specs/       │         │        changes/          │    │
│   │                  │ ◄─────  │                          │    │
│   │ source of truth  │  merge  │ one folder per change    │    │
│   │ how things work  │  on     │ proposal · design ·      │    │
│   │ today            │ archive │ tasks · delta specs      │    │
│   └──────────────────┘         └──────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

两个文件夹。`specs/` 是当前成立的事实。`changes/` 是你正在提议的内容。archive 会把一份 proposal 移入事实。

## 你实际会跑的循环 {#overview-4}

在默认设置下，你的一天是这样的。可以选择先想清楚；然后一条命令起草计划，你阅读它，下一条命令构建它，最后一条把它归档。

```text
/opsx:explore                   →  (optional) think it through with the AI first
/opsx:propose add-dark-mode     →  AI drafts proposal, specs, design, tasks
        (you read and adjust the plan)
/opsx:apply                     →  AI builds it, checking off tasks
/opsx:archive                   →  specs updated, change archived
```

**拿不准时，先从 explore 开始。** `/opsx:explore` 是一位无风险的思考伙伴：它阅读你的代码，列出各种选项，并在写任何代码之前把一个模糊的想法转化为具体计划。面对一个否则就会凭含糊提示去构建*某些东西*的 AI，这是最好的解药。已经明确知道自己想要什么？直接跳到 `/opsx:propose`。无论哪种方式，explore 都包含在默认 profile 中，因此它始终可用。参见 [Explore guide](explore.md)。

那些是斜杠命令，在你的 AI 助手聊天中输入。设置（`openspec init`）在你的终端中进行。如果这种区分对你是新的，请先阅读 [How Commands Work](how-commands-work.md)；这是最常见的困惑点。

## “助推器，而非关卡” {#enablers-not-gates}

这句话在 OpenSpec 中随处可见，所以这里用平实的话解释它的含义。

老派的 spec 流程是瀑布式的：完成规划，*然后*你才被允许实现，而回头是痛苦的。OpenSpec 拒绝这种做法。`proposal → specs → design → tasks` 的顺序展示的是下一步*可以*做什么，而不是你*被强制*做什么。

在实现过程中发现 design 错了？编辑 `design.md` 然后继续。意识到范围应该缩小？更新 proposal。没有任何东西会被锁死。这些依赖关系的存在只是为了给 AI 提供它所需的上下文（没有 spec 作为依据，你写不出好的 task），而不是把你框住。

这里的优势在于诚实：真实的工作本就是杂乱且迭代的，OpenSpec 让它可以如此。代价是纪律：因为没有任何东西强迫你前进，所以让 change 保持聚焦而不是放任其蔓延，就靠你自己了。[Workflows](workflows.md) 指南中有这方面的好习惯。

## 为什么这点小开销是值得的 {#overview-6}

坦白说：OpenSpec 增加了一个步骤。你在构建前先写一份简短的计划。那么你从中得到了什么？

- **你在走错路付出代价之前就发现了它。** 在一段话的 proposal 中修正一个误解是免费的。等 AI 写完 400 行再修正就不是了。
- **计划与代码留在同一个 repo 中。** 六个月后，spec 会告诉你（以及下一个 AI 会话）系统为何如此工作。
- **change 是可审查的。** 一个 change 文件夹是一个整洁的包裹：读 proposal、浏览 delta、检查 task。无需在聊天记录里做考古。
- **它适配既有代码库。** delta 意味着你可以为 50,000 行的应用指定一项 change，而无需先把整个应用文档化。

还有诚实的取舍：对于真正微不足道的一行修复，这些仪式可能并不划算，这没关系。OpenSpec 设计得轻量，但并非零成本。在共识重要的地方使用它，而当你与一个会自信地按照你含糊的请求去构建任何东西的 AI 协作时，大多数时候都是如此。

## 接下来去哪里 {#overview-7}

- 初来乍到？[Getting Started](getting-started.md) 完整走完第一个 change。
- 还不确定要构建什么？[Explore First](explore.md) 是起点。
- 搞不清命令在哪里运行？[How Commands Work](how-commands-work.md)。
- 想要上面所有内容的深入版本？[Concepts](concepts.md)。
- 通过示例学习？[Examples & Recipes](examples.md)。
- 需要某个术语的定义？[Glossary](glossary.md)。
