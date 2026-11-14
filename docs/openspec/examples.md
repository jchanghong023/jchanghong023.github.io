# 示例与配方 {#examples-1}

真实的 change，从开始到结束。每个配方都展示你会输入的命令以及会看到的回应，这样你可以把自己的处境对应到某个模式并照着做。这些配方使用默认的 **core** 命令（`propose`、`explore`、`apply`、`update`、`sync`、`archive`）；在扩展命令集会更有帮助的地方，会加以说明。

开始之前再提醒一次：像 `/opsx:propose` 这样的斜杠命令输入在 **AI 助手的聊天**中，而 `openspec` 命令输入在 **终端**中。如果这对你来说还是新东西，先读 [命令如何工作](how-commands-work.md)。在下面的对话记录中，`You:` 和 `AI:` 表示聊天，以 `$` 开头的行表示终端。

> **还不确定要构建什么？** 这些配方中的大多数，如果先以 `/opsx:explore` 思考清楚，会更有锐度。[配方 3](#recipe-3-exploring-before-you-commit) 展示了它的实际用法，而 [先探索](explore.md) 指南给出了完整的论证。

## 配方 1：小功能，快速路径 {#examples-2}

**何时使用：** 你知道自己想要什么，而且这是一块范围有限的工作。这是最常见的配方。

整个过程是三条命令。提出、构建、归档。

```text
You: /opsx:propose add-logout-button

AI:  Created openspec/changes/add-logout-button/
     ✓ proposal.md — why and what
     ✓ specs/      — the new requirement and its scenarios
     ✓ design.md   — technical approach
     ✓ tasks.md    — implementation checklist
     Ready for implementation. Run /opsx:apply.
```

现在读一读计划。打开 proposal 和 delta spec。这正是 OpenSpec 为之而生的时刻：在错误假设还只是一段话、而不是 400 行代码时抓住它。如果有哪里不对，直接编辑任何 artifact，然后继续。

```text
You: /opsx:apply

AI:  Working through tasks...
     ✓ 1.1 Add logout button to header
     ✓ 1.2 Clear session on click
     ✓ 1.3 Add confirmation dialog
     All tasks complete!

You: /opsx:archive

AI:  Archiving add-logout-button...
     ✓ Merged specs into openspec/specs/auth/spec.md
     ✓ Moved to openspec/changes/archive/2026-06-22-add-logout-button/
     Done. Ready for the next change.
```

就这样。登出行为现在已成为你的 specs 的一部分，而这个 change 连同其完整上下文一起归档保存。

## 配方 2：缺陷修复 {#examples-3}

**何时使用：** 有东西坏了，而你想把修复记录为一次有意为之的行为变更，而不是一次神秘的提交。

缺陷修复的工作方式与功能完全一样。区别在于你如何构架 proposal 的表述：描述 _正确_ 的行为，而不只是“修复这个 bug”。

```text
You: /opsx:propose fix-login-redirect-loop

AI:  Created openspec/changes/fix-login-redirect-loop/
     The proposal captures the current broken behavior and the
     intended behavior. The delta spec MODIFIES the redirect
     requirement so it's now precise and testable.
     Ready for implementation.
```

因为修复是以一条 `MODIFIED` 的 requirement 加上全新的 scenario 落地的，下一个人（或下一个 AI 会话）看到的不仅是你修好了它，还有“正确”意味着什么。接着照常用 `/opsx:apply` 和 `/opsx:archive`。

提示：对于修复而言，一个好的 scenario 就是用文字写成的回归测试。“GIVEN a logged-out user, WHEN they submit valid credentials, THEN they land on the dashboard and are not redirected again.” 把它写下来，实现就有了明确的目标。

## 配方 3：在投入之前先探索 {#recipe-3-exploring-before-you-commit}

**何时使用：** 你有一个问题，但还没有计划。你不确定要构建什么，或者哪种方案才是对的。

从 `/opsx:explore` 开始。它是一位没有结构约束的思考伙伴。它从不写代码，也不会写其他任何内容，除非你请它记录你们决定了什么，或者在它主动提议时你说好。它会阅读你的代码库并帮助你做决定。

```text
You: /opsx:explore

AI:  What would you like to explore?

You: Page loads feel slow but I don't know where the time goes.

AI:  Let me look... I found three likely culprits:
     1. Large unoptimized images on the product list
     2. Synchronous data fetching that blocks render
     3. Re-renders triggered by context changes
     Which should we tackle first?

You: The data fetching one.

You: /opsx:propose optimize-product-list-fetching

AI:  Created the change, with a proposal informed by what we just
     found. Ready for implementation.
```

探索在你为一个想法花费一个 change 之前 _先_ 把思路理清。当洞见成形时，就 propose，AI 会把上下文延续下去。

## 配方 4：同时应付两个 change {#examples-5}

**何时使用：** 你正在做一个功能做到一半，一个紧急修复插队进来。

change 是彼此独立的文件夹，因此并行工作不会冲突。开始修复、交付它，然后回到你先前离开的功能上。

```text
You: I'm partway through add-dark-mode, but I need to fix a login bug now.

You: /opsx:propose fix-login-redirect

AI:  Created openspec/changes/fix-login-redirect/. Ready for implementation.

You: /opsx:apply

AI:  Implemented the fix. All tasks complete.

You: /opsx:archive

AI:  ✓ Archived fix-login-redirect.

You: Back to dark mode.

You: /opsx:apply add-dark-mode

AI:  Resuming add-dark-mode. Picking up at task 2.3: Update Header...
```

在 `/opsx:apply add-dark-mode` 中点名 change，是当有不止一个 change 处于活动状态时把 AI 指向某个特定 change 的方式。因为 task 在 `tasks.md` 中跟踪完成情况，AI 确切知道你在哪里停下。

当多个 change 同时完成时，扩展的 `/opsx:bulk-archive` 会把它们一起归档，并通过核对实际实现了什么来消解 spec 冲突。参见 [工作流](workflows.md#parallel-changes)。

## 配方 5：不改变行为的重构 {#recipe-5-a-refactor-with-no-behavior-change}

**何时使用：** 你在重构代码，而对外可见的行为应保持完全一致。

这是有趣的情形，因为纯粹的重构对于你的 specs 而言 _没有任何东西可添加_。行为契约没有变化，只有实现变了。因此工作落在 design 和 tasks 中，而 spec delta 为空或不存在。

```text
You: /opsx:propose refactor-payment-module

AI:  Created the change. The proposal states the goal (split the
     payment module, no behavior change) and the design captures
     the new structure. No spec changes, since behavior is identical.
     Ready for implementation.
```

通过在 change 的 `.openspec.yaml` 中设置 `skip_specs: true` 来显式声明空的 delta：

```yaml
schema: spec-driven
skip_specs: true
```

没有这个标记时，`openspec validate` 会拒绝一个零 delta 的 change（这样被遗忘的 specs 阶段仍然会被抓到）；有了它，校验通过，并且 `openspec status` 会把 specs 阶段显示为明确跳过而非待处理。如果重构最终确实改变了行为，就从 `.openspec.yaml` 中移除 `skip_specs` 并编写 delta specs——校验把该标记与 spec 文件同时存在视为冲突，所以过时的标记不会悄悄残留。

归档一个带标记的 change 无需额外参数（没有 delta 需要合并）。另外，`--skip-specs` 参数告诉终端命令显式跳过 spec 步骤：

```bash
$ openspec archive refactor-payment-module --skip-specs
```

同一个参数也适用于工具化、CI 和仅文档改动。原则是：specs 描述行为，所以如果行为没有变化，spec 也不应该变。参见 [核心概念](concepts.md#what-a-spec-is-and-is-not)。

## 配方 6：分步控制（扩展命令） {#examples-7}

**何时使用：** 一个复杂或有风险的 change，你希望在继续之前逐个审查每个 artifact。

核心的 `/opsx:propose` 一次性起草全部内容。当你更愿意一步一步来时，启用扩展命令：

```bash
$ openspec config profile      # select the expanded workflows
$ openspec update              # apply them to this project
```

现在你可以增量地搭建和构建：

```text
You: /opsx:new add-2fa

AI:  Created openspec/changes/add-2fa/. Ready to create: proposal.

You: /opsx:continue

AI:  Created proposal.md. Now available: specs, design.

You: /opsx:continue

AI:  Created specs/auth/spec.md. Now available: design.
```

在每个 artifact 落地时审查它，随意编辑，满意时再继续。当你想要其余部分一次性起草时，`/opsx:ff` 会快进完成剩下的规划类 artifact。归档之前，`/opsx:verify` 会检查实现是否确实与 specs 相符。参见 [工作流](workflows.md#opsxff-vs-opsxcontinue)。

## 配方 7：亲手学习整个循环 {#examples-8}

**何时使用：** 你已经安装了 OpenSpec，想要在 _自己的_ 代码上 _感受_ 工作流，而不是看玩具示例。

启用扩展命令（见配方 6），然后：

```text
You: /opsx:onboard

AI:  Welcome to OpenSpec! I'll walk you through a complete change
     using your actual codebase. Let me scan for a small, safe
     improvement we can make together...
```

`/opsx:onboard` 会找到一个真实的（小）改进，为它创建一个 change，实现它，并归档它，同时讲解每一步。它需要 15 到 30 分钟，最后会留下一个你可以保留或丢弃的真实 change。这是最温和的学习方式。参见 [命令](commands.md#opsxonboard)。

## 从终端检查你的工作 {#examples-9}

任何时候，你都可以从终端查看当前状态：

```bash
$ openspec list                      # active changes
$ openspec show add-dark-mode        # one change in detail
$ openspec validate add-dark-mode    # check structure
$ openspec view                      # interactive dashboard
```

这些是读取和检查类的工具。propose 与构建仍然通过聊天中的斜杠命令进行。完整细节见 [CLI 参考](cli.md)。

## 接下来去哪里 {#examples-10}

- [先探索](explore.md)：当你还不确定时推荐的起步方式
- [工作流](workflows.md)：上述各种模式，并附有关于何时使用哪种的决策指引
- [命令](commands.md)：每个斜杠命令的详细说明
- [快速开始](getting-started.md)：标准的首次 change 演练
- [核心概念](concepts.md)：为什么各部分会以这样的方式契合在一起
