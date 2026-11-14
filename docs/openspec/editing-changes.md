# 编辑与迭代 change {#change}

**change 中的每个 artifact 都只是一个 Markdown 文件，你随时都可以编辑它。** 这里没有锁定的“规划阶段”，没有审批关卡，也没有需要进入的特殊编辑模式。开始实现之后想改 proposal？打开 `proposal.md` 改就是了。实现到一半发现 design 不对？修正 `design.md` 然后继续。答案就是这么简单，而且这是有意为之。

本页面向的正是你冒出“等等，我能回头改那个吗？”这个念头的时刻。能。下面按常见的各类情形分别说明怎么做。

## 两种编辑方式 {#editing-changes-2}

你始终同时拥有这两种方式：

1. **直接编辑文件。** artifact 就是 `openspec/changes/<name>/` 下的普通 Markdown。在编辑器中打开 `proposal.md`、`design.md`、`tasks.md`，或 `specs/` 下的某个 delta spec 并修改即可。不需要任何其他操作。

2. **让 AI 帮你修订。** 在对话中直接说出你的要求：“把 proposal 更新一下，去掉缓存的想法，加上一节限流”，或者“design 应该用队列，而不是轮询”。AI 会以 change 的其余内容为上下文，替你编辑该 artifact。

哪种方式贴合当下就用哪种。小幅措辞调整？直接改文件。实质性重新思考？让 AI 带着完整上下文来修订。

## “开始之后我要怎么更新 proposal（或 specs）？” {#proposal-specs}

直接更新即可。还是同一个 change，只是更精炼了。

如果你使用的是扩展命令，自然的流程是：编辑 artifact，然后运行 `/opsx:continue` 从新状态继续，或者运行 `/opsx:apply` 按更新后的计划继续实现。如果你使用的是默认的 `core` 命令，编辑 artifact 后运行 `/opsx:apply` 即可；它会读取当前文件，因此是基于 artifact 此刻的内容来推进的。

心智模型：artifact 是活的计划，不是签过字的合同。AI 始终依据它们的当前内容工作，所以编辑它们就等于为工作指明方向。

```text
You: I want to change the approach in this change.

You: [edit design.md, or tell the AI:]
     Update design.md to use a background job instead of a synchronous call.

AI:  Updated design.md. The task list still fits; want me to continue applying?

You: /opsx:apply
```

这回答了一个非常常见的问题：并不存在单独的“更新 proposal”命令，因为你不需要它。文件就是唯一事实来源，编辑它（手动或通过 AI）就是更新。

## “实现完之后我要怎么回去评审？” {#how-do-i-go-back-to-review-after-implementing}

你不必“回去”，因为你从未离开。workflow 是流动的：评审、编辑和实现并不是把你困在其中的顺序阶段。

具体来说，在做了一些 `/opsx:apply` 的工作之后：

- 想重新审视计划？打开 artifact 读一读，或者在终端运行 `openspec show <change>` 查看汇总视图。
- 发现了要改的地方？编辑 artifact（或请 AI 改），然后继续。
- 想要一次结构化的检查，确认代码与计划一致？运行 `/opsx:verify`（扩展命令）。它会报告完整性、正确性和一致性，且不阻塞任何事。参见 [Workflows: Verify](workflows.md#verify-check-your-work)。

没有需要返回的“评审阶段”，因为评审是你随时都能做的事，包括实现之后。

## “我手动改了代码。要怎么和 OpenSpec 对齐？” {#i-edited-the-code-by-hand-how-do-i-reconcile-that-with-openspec}

这种情况经常发生，而且没关系。你在编辑器里调整了某个东西，现在代码和 artifact 不一致了。往真实的方向把它们同步回去：

- **代码现在是对的，spec 过期了。** 更新 delta spec（以及相关的 task，如有必要），描述你实际交付的行为。在 archive 之前，spec 应当与现实一致，因为 archive 会把 spec 合并进你的唯一事实来源。
- **spec 是对的，代码跑偏了。** 继续实现或修复，直到代码与 spec 一致。

快速暴露不一致的方式是 `/opsx:verify`：它读取你的 artifact 和代码，告诉你两者在哪些地方分歧。把它的输出当作对齐待办清单，两者一致后再 archive。

原则：在 archive 时，你的 specs 将成为记录在案的真相。所以在 archive 之前，让 specs 如实反映代码的行为。欢迎手动编辑；只是别让它们悄悄让 spec 失同步。

## 精炼一个你不满意的 proposal {#proposal}

如果生成的 proposal 没有达到预期，你有三个好选择：

- **就地迭代。** 告诉 AI 哪里不对（“范围太宽了，把管理功能去掉”），让它修订。成本最低，通常也最正确。
- **先探索，再重新提 proposal。** 如果问题在于想法本身不清楚，退回到 `/opsx:explore` 把它想透，让一个更清晰的 proposal 从中产生。参见 [Explore First](explore.md)。
- **从头开始。** 如果意图发生了根本变化，新建一个 change 可能比修补旧的更清楚。

最后一个选择有它自己的决策指南，就在下一节。

## 何时更新、何时新建 change {#change-2}

简版：**当还是同一件事的精炼时更新；当意图根本改变或范围膨胀成另一件事时新建。**

- 同一目标，更好的方案？更新。
- 范围收窄（现在先交付 MVP，之后再补）？更新，然后 archive，再为第二阶段新建一个 change。
- 问题本身变了（“加一个深色模式”变成了“构建完整的主题系统”）？新建 change。

[Workflows: When to Update vs Start Fresh](workflows.md#when-to-update-vs-start-fresh) 中有完整的流程图和实例讲解，[OPSX: When to Update vs. Start Fresh](opsx.md#when-to-update-vs-start-fresh) 中有更深入的论述。

## 关于 task 的一点说明 {#task}

`tasks.md` 是一份活的清单，不是冻结的计划。在实现过程中，你可以添加新发现的 task、删除事后证明没必要的 task，或调整它们的顺序。AI 在 `/opsx:apply` 期间会随完成情况勾选条目，如果你之后回来，它会从第一个未勾选的 task 继续。中途编辑清单是预期之中的。

## 接下来去哪 {#editing-changes-9}

- [Workflows](workflows.md) - 各种模式，以及更新还是新建的决策指南
- [Reviewing a Change](reviewing-changes.md) - 在动手实现前花两分钟过一遍计划
- [Explore First](explore.md) - 当想法需要重新思考时退回的地方
- [Commands](commands.md) - `/opsx:continue`、`/opsx:apply` 和 `/opsx:verify` 的详细说明
- [Concepts: Artifacts](concepts.md#artifacts) - 每个 artifact 的用途
