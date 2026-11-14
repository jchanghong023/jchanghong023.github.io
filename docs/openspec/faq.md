# FAQ {#faq}

对大家最常提出的问题给出快速解答。如果你的问题实际上是“某个东西坏了”，那么 [Troubleshooting](troubleshooting.md) 是更合适的页面。如果你想查某个术语的定义，请参阅 [Glossary](glossary.md)。

## 基础 {#faq-2}

### 用一句话说，OpenSpec 是什么？ {#openspec}

它是一个轻量的中间层，让你和你的 AI 编程助手在写任何代码之前，先以书面形式就“要构建什么”达成一致。

### 我为什么需要它？ {#faq-4}

因为 AI 助手即使在出错时也表现得信心十足。当需求只存在于一段聊天记录里时，AI 会用猜测去填补空白，而你往往要等代码写完之后才发现问题。OpenSpec 把达成一致的环节提前到错误还很廉价就能修正的阶段。完整论述见 [Core Concepts at a Glance](overview.md)。

### 所有事情都必须用它吗？ {#faq-5}

不必。在需要达成一致的地方使用它，也就是大多数非平凡的工作。对于修正一个字符的拼写错误，这套流程大概不值得，这也没问题。

### 我可以在大型的既有代码库上使用它，还是只能用于新项目？ {#faq-6}

既有代码库才是主战场。OpenSpec 是 brownfield 优先的：你不必事先为整个应用写文档。你只需为每个 change 触及的内容编写 spec，你的 spec 会随着你实际开展的工作逐步补齐。有一份专门的指南：[Using OpenSpec in an Existing Project](existing-projects.md)。

### 它绑定某一个 AI 工具吗？ {#ai}

这份 vendor（内置副本）只配置 Oh My Pi。上游项目还支持其他助手，但它们的集成并未打包在这里；请参阅 [Supported Tools](supported-tools.md)。

## 运行命令 {#faq-8}

### 我该在哪里输入 `/opsx:propose`？ {#opsxpropose}

在 AI 助手的聊天窗口里，而不是在终端里。这是最常见的困惑点，所以它单独占一页：[How Commands Work](how-commands-work.md)。简而言之：`openspec ...` 在终端运行，`/opsx:...` 在聊天中运行。

### 我如何“进入交互模式”？ {#faq-10}

并没有一个需要单独启动的模式。你像平常一样打开 AI 助手，在它的聊天中输入一条斜杠命令。斜杠命令就是你“进入”OpenSpec 的方式。（终端里唯一真正交互式的功能是 `openspec view`，一个用于浏览 spec 和 change 的仪表盘。）完整说明见 [How Commands Work](how-commands-work.md)。

### 我输入了斜杠命令，但什么都没发生。为什么？ {#faq-11}

最可能的情况是：你在终端而不是 AI 聊天里输入了它，你用了你的工具并未注册的拼写，或者这些命令还没有被安装。如果文件缺失——或者你从未设置过该工具——运行 `openspec init`；`openspec update` 只会刷新已经存在的文件。然后重启你的助手，并使用“Getting started”下方打印的形式——见 [How To Invoke](supported-tools.md#how-to-invoke)。完整清单在 [Troubleshooting](troubleshooting.md#commands-dont-show-up)。

### 为什么在一个工具中语法是 `/opsx:propose`，而在另一个工具中是 `/opsx-propose`？ {#opsxpropose-opsx-propose}

这份副本配置的是 Oh My Pi，它直接读取共享的 skill。请以
`/openspec-propose`、`/openspec-apply-change` 等形式调用某个
workflow。`openspec init` 打印的“Getting started”那一行才是权威依据。

### skill 和 command 有什么区别？ {#skill-command}

两者都是 OpenSpec 写出的文件，供你的助手运行 workflow。skill（`.../skills/openspec-*/SKILL.md`）是较新的跨工具标准；command（`.../commands/opsx-*`）是较旧的按工具区分的斜杠命令文件。你不需要做选择。你只需输入斜杠命令，OpenSpec 会安装你的工具所用的那一种。

## 工作流 {#faq-14}

### 如果我还不确定要构建什么，应该从哪里开始？ {#faq-15}

从 `/opsx:explore` 开始。它是一个没有风险包袱的思考伙伴，会阅读你的代码库、列出各种选项，并把模糊的问题转化为具体的计划，而这一切都发生在写任何代码之前。它位于默认 profile 中，所以始终可用。当计划清晰后，它会移交给 `/opsx:propose`。这是最值得养成的习惯，因为它能阻止一个过于热心的 AI 自信满满地构建错误的东西。见 [Explore First](explore.md)。

### 最简单的流程是什么样的？ {#faq-16}

```text
/opsx:explore (optional)   then   /opsx:propose <what you want>   then   /opsx:apply   then   /opsx:archive
```

用 explore 把事情想清楚，用 propose 起草计划，用 apply 构建它，用 archive 将其归档。当你已经确切知道自己想要什么时，可以跳过 explore。

### `/opsx:propose` 和 `/opsx:new` 有什么区别？ {#opsxpropose-opsxnew}

`/opsx:propose` 是默认的一步式命令：它创建 change 并一次性起草所有规划 artifact。`/opsx:new` 属于扩展命令集，只搭建一个空的 change 骨架，由你用 `/opsx:continue` 逐个创建 artifact（或用 `/opsx:ff` 一次性全部创建）。除非你想要一步一步地控制，否则请使用 propose。见 [Commands](commands.md)。

### `core` 和 expanded profile 是什么？ {#core-expanded-profile}

profile 决定安装哪些斜杠命令。**Core**（默认）给你 `propose`、`explore`、`apply`、`update`、`sync`、`archive`。**expanded** 集合则额外增加 `new`、`continue`、`ff`、`verify`、`bulk-archive` 和 `onboard`，以便更精细地控制。用 `openspec config profile` 切换，然后用 `openspec update` 应用。

### 我需要运行 `/opsx:sync` 吗？ {#opsxsync}

通常不需要。sync 会把某个 change 的 delta spec 合并进你的主 spec，而 `/opsx:archive` 会主动为你完成这一步。只有当你希望在归档之前就合并 spec 时才手动运行 sync，例如对于一个长期运行的 change。见 [Commands](commands.md#opsxsync)。

### 开始之后，我如何编辑 proposal、spec 或 task？ {#proposalspec-task}

直接编辑文件即可。每个 artifact 都是 `openspec/changes/<name>/` 下的纯 Markdown，没有锁定的阶段，也没有特殊的编辑模式。你既可以手动修改，也可以让 AI 来修订（“把 design 改成使用队列”），然后继续推进。AI 始终基于文件当前的内容工作。完整指南：[Editing & Iterating on a Change](editing-changes.md)。

### 已经实现了一部分之后，我还能回头修改计划吗？ {#faq-21}

可以，任何时候都行。workflow 是流动的，review 和编辑并不是你会被锁在门外的阶段。编辑 artifact，然后继续。如果你想要一次结构化检查，确认代码仍然符合计划，运行 `/opsx:verify`。见 [Editing & Iterating on a Change](editing-changes.md#how-do-i-go-back-to-review-after-implementing)。

### 我手动改了代码。如何让它与 spec 保持一致？ {#spec}

在归档之前让它们重新同步，因为归档会让你的 spec 成为事实记录。如果代码现在是对的，就更新 delta spec 以匹配你实际交付的内容；如果 spec 是对的，就继续构建直到代码与之一致。`/opsx:verify` 会把不匹配之处暴露出来。见 [Editing & Iterating on a Change](editing-changes.md#i-edited-the-code-by-hand-how-do-i-reconcile-that-with-openspec)。

### 什么时候应该更新已有的 change，而不是新建一个？ {#change}

当它们是同一项工作的细化和调整时，更新。当意图发生了根本变化，或范围膨胀成了另一项不同的工作时，重新开始。在 [Workflows](workflows.md#when-to-update-vs-start-fresh) 中有决策流程图和示例。

### 如果我的会话上下文用完了，或者需求在实现中途发生了变化怎么办？ {#faq-24}

这正是 spec 发挥价值的地方。因为计划存在于文件中（而不仅仅在聊天历史里），你可以清空上下文、开启一个全新的 AI 会话，并用 `/opsx:apply` 接着做；它会读取 artifact，并从第一个未勾选的 task 继续。如果需求变化了，就编辑 artifact 以匹配新的现实并继续。保持干净的上下文窗口也能带来更好的结果；在开始实现前先清空它。

### 我应该把 `openspec/` 目录提交到 git 吗？ {#should-i-commit-the-openspec-folder-to-git}

应该。你的 spec、活跃的 change 和 archive 都是项目历史的一部分。像对待其他源码一样提交它们。archive 尤其会成为一份持久记录，说明你的系统为何是这样运作的。

## Spec 与 change {#spec-change}

### spec 和 design 分别放什么？ {#spec-design}

spec 描述可观察的行为：系统做什么、它的输入、输出和错误条件。design 描述你将如何构建它：技术方案、架构决策、文件改动。如果实现可以改变而不改变外部可见行为，那它就属于 design，而不属于 spec。[Concepts](concepts.md#what-a-spec-is-and-is-not) 有更深入的说明。

### 什么是 delta spec？ {#delta-spec}

一种只描述正在变化的部分的 spec，使用 `ADDED`、`MODIFIED` 和 `REMOVED` 小节，而不是重述整份 spec。OpenSpec 正是以这种方式干净地处理对既有系统的修改。见 [Concepts](concepts.md#delta-specs)。

### 归档的 change 去了哪里？ {#change-2}

去 `openspec/changes/archive/YYYY-MM-DD-<name>/`，所有 change artifact 都被保留。该 change 会从你的活跃列表中移出。显式声明 `retire_capabilities: true` 的 change，在移除了某个 capability 的最后一条 requirement 时，也可以删除该 capability 的主 spec。

## 配置与自定义 {#faq-30}

### 我如何告诉 AI 我的技术栈？ {#ai-2}

把它写进 `openspec/config.yaml` 的 `context:` 下。那段文本会被注入到每一次规划请求中，因此 AI 始终知道你的技术栈和约定。见 [Customization](customization.md#project-configuration)。

### 我可以用英语之外的语言生成 spec 吗？ {#spec-2}

可以。在你的配置的 `context:` 中加一条语言指令。[Multi-Language](multi-language.md) 提供了多种语言的可复制粘贴片段。

### 我可以修改 workflow 本身吗？ {#workflow}

可以，借助自定义 schema。schema 定义存在哪些 artifact，以及它们之间如何相互依赖。用 `openspec schema fork spec-driven my-workflow` 分叉默认配置，然后编辑它。见 [Customization](customization.md#custom-schemas)。

## 模型、隐私与升级 {#faq-34}

### 我应该使用哪个 AI 模型？ {#ai-3}

OpenSpec 在高推理能力的模型上表现最好。README 推荐在规划和实现中都使用 Codex 5.5 和 Opus 4.7 之类的模型。此外要保持上下文窗口干净：在开始实现前清空它，以获得最佳结果。

### OpenSpec 会收集数据吗？ {#openspec-2}

它会收集匿名使用统计：仅命令名称和版本。不收集参数、路径、内容或个人信息，并且在 CI 中会自动关闭。可用 `export OPENSPEC_TELEMETRY=0` 或 `export DO_NOT_TRACK=1` 退出。

### 我如何升级？ {#faq-37}

两步。升级包（`npm install -g @fission-ai/openspec@latest`），然后在每个项目中运行 `openspec update` 以刷新生成的 skill 和 command。

### 我如何卸载 OpenSpec？ {#openspec-3}

没有卸载命令，因为它只是一个全局包加上你项目里的文件。移除该包（`npm uninstall -g @fission-ai/openspec`），并可选择删除 `openspec/` 目录和生成的工具文件。分步说明（包括哪些内容可以安全保留）见 [Installation: Uninstalling](installation.md#uninstalling)。

## 获取帮助 {#faq-39}

### 我在哪里提问或报告 bug？ {#bug}

- **Discord：** [discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues：** [github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **从你的终端：** `openspec feedback "your message"` 会为你打开一个 GitHub issue。

### 这些文档有错或难以理解。我该怎么办？ {#faq-41}

告诉我们。请提交一个 [docs issue](https://github.com/Fission-AI/OpenSpec/issues/new?template=docs.yml)，说明是哪一页以及哪里有问题——文档修复是我们收到的最有用的反馈之一。
