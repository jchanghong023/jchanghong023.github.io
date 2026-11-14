# 在现有项目中使用 OpenSpec {#openspec}

**你不需要一开始就记录整个代码库。你只为即将改动的内容编写 spec。** 这是在现有项目中采用 OpenSpec 时最重要的一点，也是 OpenSpec 采用 brownfield-first（优先面向既有代码库）设计的原因。

一种常见的担忧是这样的：“我的应用有 8 万行历史代码。我是否必须为所有代码写完 spec，OpenSpec 才有用？”不是的。你会讨厌那样做，我们也是。OpenSpec 让 spec 随着一次次 change 逐渐生长。你的第一个 change 记录它所触及的那一部分，下一个 change 记录它自己触及的那一部分，几个月之后，spec 就会自然地围绕你实际做的工作填补完整。

本指南展示如何在第一天就开始，而不必一口吃成胖子。

## 三十秒速览版 {#existing-projects-2}

```bash
$ cd your-existing-project
$ openspec init          # adds openspec/ and your AI tool's commands
```

然后，在你的 AI 对话中：

```text
/opsx:explore            # optional: have the AI read the area you'll touch
/opsx:propose <a real, small change you actually need>
/opsx:apply
/opsx:archive
```

现在，你的 spec 精确描述了该 change 所触及的那部分系统，仅此而已。这就是正确的做法。你不用再为另外 8 万行代码担心了。

## 为什么 delta 先行就是全部诀窍 {#delta}

OpenSpec 的 change 以 **delta**（增量）形式编写：`ADDED`、`MODIFIED`、`REMOVED`。delta 描述的是相对于当前行为发生了什么变化，而不是整个系统。

这正是 brownfield 工作所需要的。你很少从零开始构建。你是在添加一个字段、修复一个重定向、收紧一个超时。delta 让你能够精确地说明那一个 change，而无需先围绕它写出一份 40 页的 spec。

所以你的 `openspec/specs/` 目录一开始并不是满满当当、完整无缺的。它一开始几乎是空的，然后逐渐累积。每个被 archive 的 change 会合并它的 delta。`auth/` 的 spec 只有在你做了若干次 auth 相关的 change 之后才会变得详尽，而那正是你希望它详尽的时候。

如果你想了解更深入的机制，请参见 [Concepts: Delta Specs](concepts.md#delta-specs)。

## 在真实代码库上的第一个 change {#change}

挑一件小而真实的事情。不要玩具式示例，也不要重写。选一个你这周本来就要做的 change。首个 change 做得小一些，能让你以很低的代价学会这套工作流。

**第 1 步：让 AI 阅读相关区域。** 在不熟悉或庞大的代码库上，这正是 `/opsx:explore` 发挥价值的地方。把它指向你即将改动的部分，让它在提出任何建议之前先弄清它是如何运作的。

```text
You: /opsx:explore

AI:  What would you like to explore?

You: I need to add rate limiting to our public API, but I'm not sure
     how requests currently flow through the middleware.

AI:  Let me trace it... [reads the router, middleware stack, and config]
     Requests hit Express, pass through auth middleware, then your
     controllers. There's no rate-limiting layer today. The cleanest
     insertion point is a middleware right after auth. Want me to scope it?
```

注意，AI 现在已经理解了你的实际结构，因此它写出的 proposal 会贴合你的代码，而不是一个通用模板。在大型代码库上，仅这一个习惯就能省去最多的痛苦。参见 [Explore First](explore.md)。

**第 2 步：提出 change。** proposal 及其 delta spec 只捕获这一个 change。

```text
You: /opsx:propose add-api-rate-limiting
```

**第 3 步：构建并 archive**，使用 `/opsx:apply` 和 `/opsx:archive`，与任何 change 相同。archive 之后，你就拥有了关于限流行为的真实 spec，它诞生于一个你本来就需要做的 change。

## 更喜欢引导式教学？使用 onboard {#onboard}

如果你更愿意看着整个循环在你自己的代码上伴随讲解发生，扩展命令 `/opsx:onboard` 正是这么做的：它扫描你的代码库，找出一个小而安全的改进，然后带你走完 propose、构建和 archive 的全过程，并逐步解释。

先开启扩展命令：

```bash
$ openspec config profile      # select the expanded workflows
$ openspec update              # apply them to this project
```

然后在对话中：

```text
/opsx:onboard
```

这是真实项目上最温和的入门方式，而且它会给你留下一个真实的（小）change，你可以保留也可以丢弃。参见 [Commands: `/opsx:onboard`](commands.md#opsxonboard)。

## “但我已经有需求文档了” {#existing-projects-6}

也许你有 PRD、SRS、正式 spec，甚至 TLA+ 模型。很好。你不必把它们整批导入，也不必把它们丢掉。

把已有的文档当作**探索用的素材**，而不是要转换成 spec 的东西。当你开始一个 change 时，把相关章节粘贴出来或指给 AI，让它据此塑造一个聚焦的 OpenSpec delta。delta 以 OpenSpec 可测试的 requirement 与 scenario 形式，捕获你此刻正在改动的行为。你的原始文档照旧留在原处，作为背景资料。

坦率的原因在于：OpenSpec 的 spec 刻意以行为为先，并限定于 change 的范围。一份 40 页的 PRD 是另一种 artifact，承担另一种职责。强行做一次性批量转换，往往会产生一份庞大、过时、没人信任的 spec。让 spec 从真实的 change 中生长，才能保持准确。

```text
You: /opsx:explore
You: Here's the section of our PRD about checkout. I'm implementing the
     "guest checkout" requirement next.
     [paste the relevant requirement]
AI:  [reads it, asks clarifying questions, then helps scope a change]
You: /opsx:propose add-guest-checkout
```

## 在大型代码库中组织 spec {#spec}

spec 放在 `openspec/specs/` 下，按 **domain**（领域）分组：domain 是一个逻辑区域，与你团队思考系统的方式一致。你不必一开始就设计好整个分类体系。当你在某个领域的第一个 change 需要时，再创建该领域的文件夹。

划分 domain 的常见方式：

- **按功能区域：** `auth/`、`payments/`、`search/`
- **按组件：** `api/`、`frontend/`、`workers/`
- **按限界上下文：** `ordering/`、`fulfillment/`、`inventory/`

选择任何能让新来者点头认可的划分方式。你以后还可以调整。参见 [Concepts: Specs](concepts.md#specs)。

## Monorepo 与跨仓库的工作 {#monorepo}

对于 monorepo，最简单的模型是在仓库根目录放一个 `openspec/` 目录，其中的 domain 对应你的各个包或服务。这足以覆盖大多数团队。

如果你的工作确实跨越**多个仓库**（或者你视作独立的多个包），OpenSpec 提供了一个 beta 的 **stores** 特性：规划放在它自己的独立仓库中，你任意一个代码仓库都可以引用它，因此规划不必放在某一个仓库的 `openspec/` 文件夹里。它仍是 beta，所以请把它的命令和状态视为仍在演进。先从 [Stores User Guide](stores-beta/user-guide.md) 了解心智模型和最小可用路径。

## 几点坦诚的提醒 {#existing-projects-9}

- **抵制把所有东西都回填的冲动。** 为你并不改动的代码写 spec 感觉很有效率，但通常并非如此。那些 spec 会过时，因为没有任何力量迫使它们跟随现实。让真实的 change 来驱动你的 spec。
- **让早期的 change 保持小。** 你最初几个 change 的重点与其说是交付，不如说是学习节奏。紧凑的范围让循环更快，让经验教训的代价更低。
- **把 `openspec/` 提交到 git。** 你的 spec 和 archive 应当与它们所描述的代码一起纳入版本控制。
- **给 AI 提供上下文。** 在约定强烈的大型代码库上，填写 `openspec/config.yaml` 的 `context:`，让每个 proposal 都尊重你的技术栈和模式。参见 [Customization](customization.md#project-configuration)。

## 接下来去哪 {#existing-projects-10}

- [Explore First](explore.md) - 在改动代码之前理解代码的关键习惯
- [Getting Started](getting-started.md) - 完整的第一个 change 演练
- [Editing & Iterating on a Change](editing-changes.md) - 随着理解加深而调整 change
- [Concepts: Delta Specs](concepts.md#delta-specs) - 为什么 delta 能让 brownfield 工作变得清晰
- [Customization](customization.md) - 把项目的约定教给 OpenSpec
