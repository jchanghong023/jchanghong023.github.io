# 团队中的 OpenSpec {#openspec}

无论你是单打独斗，还是身处二十人的团队，其他指南里的内容都一样适用。团队里变化的是那些边缘问题：spec 放在哪里，队友如何评审一份计划，以及这一切如何融入我们既有的 pull request 流程？

简短的回答是：一个 change 就是一组成员文件，而 OpenSpec 从不操作 git。因此它是嵌入你现有的工作流，而不是取代它。本页详细说明了行之有效的约定。

## 一条规则：OpenSpec 不碰 git {#openspec-git}

OpenSpec 只读写 `openspec/` 下的纯 Markdown。它从不在你的项目里 commit、建分支、push 或 pull——也从不自行克隆或同步 [store](stores-beta/user-guide.md)（存储）。这意味着：

- **你像提交任何源码一样提交 `openspec/`。** spec、活跃的 change 以及 archive 都是项目历史的一部分。（是的，提交整个文件夹——参见 [FAQ](faq.md#should-i-commit-the-openspec-folder-to-git)。）
- **一个 change 就是一个像代码一样被版本管理的文件夹。** `openspec/changes/add-dark-mode/` 不过是分支上的若干文件。
- **下面所有内容都是约定，而非强制。** OpenSpec 不会强迫你这么做；它只是恰好契合得很干净。

## 日常循环 {#team-workflow-3}

行之有效的工作流是把一个 change 映射到一个分支和一个 pull request：

```
git switch -c add-dark-mode        start a branch, as usual
   │
/opsx:propose add-dark-mode        draft the plan (proposal + specs + tasks)
   │
REVIEW THE PLAN                    you read it before any code — see Reviewing a Change
   │
/opsx:apply                        build it; artifacts + code change together
   │
git commit && open a PR            the PR contains the spec delta AND the code
   │
teammate reviews, merges
   │
/opsx:archive                      fold the delta into specs/, move the change to archive/
```

计划与代码并排存在于同一个分支上，于是队友可以一起评审两者；六个月后，归档的 spec 依然能解释代码为何是现在这个样子。

## 在 pull request 中评审 spec {#pull-request-spec}

这正是团队能感受到回报的地方。当一个 PR 包含了该 change 的 delta spec 时，评审者得到的是原始 diff 永远给不了的东西：**一份用平实语言说明本次 change 意图达成什么的陈述**，而且是在读到任何一行代码之前就拿到。

对评审者而言，好的评审顺序是：

1. **读 `proposal.md`**——这是对的问题和范围吗？
2. **读 `specs/` 下的 delta**——“完成”的定义正确吗？（这就是 [Reviewing a Change](reviewing-changes.md) 里的两分钟通读，现在发生在 PR 中。）
3. **然后再读代码 diff**——它是否恰好交付了那些 requirement？

不认同*思路*的评审者可以针对 proposal 低成本地提出意见，而不必在 300 行代码上反复争论。把 delta spec 放在 PR 描述靠前的位置，或指引评审者去看 change 文件夹，让他们从那里开始。

## 何时 archive {#archive}

archive 会把 change 的 delta 归并入主 `openspec/specs/`，并把 change 文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`。由于 `specs/` 是**共享的真相来源**，在团队中时机很重要。两种可行的约定：

- **PR 合并后再 archive（推荐）。** 分支携带活跃的 change；一旦它合并到主分支，就在那里 archive（通常是一个很小的后续提交，或定期清理）。这样共享的 `specs/` 只会随着真正上线的工作向前推进。
- **在 PR 内 archive。** 对小团队更简单：同一个添加代码的 PR 同时完成 sync 和 archive。代价是你的 `specs/` diff 与代码 diff 一起落地，可能让 PR 变得更嘈杂。

选定一种并保持一致。无论哪种方式，`/opsx:archive` 都会检查 task 是否完成，并主动提出先 sync，因此不会有半成品被意外合并。

## 两个人，并行的 change {#change}

由于 change 是彼此独立的文件夹，它们不会冲突：

- **不同的 change，不同的人——没问题。** `add-dark-mode` 和 `rate-limit-login` 是不同分支上的不同文件夹；在两者都 archive 之前，它们互不相干。
- **一个 change 只有一个负责人。** 两个人编辑同一个 change 文件夹，冲突方式与两个人编辑同一个文件完全相同。把 change 保持在单一作者手里，或者拆成两个 change（这也是要[合理定规模](writing-specs.md#right-size-the-change)的另一个理由）。
- **唯一会出现冲突的地方是 `specs/`。** 如果两个 change 修改了*同一个* requirement，archive 第二个时就会在 `openspec/specs/…/spec.md` 中产生冲突——像处理任何合并冲突一样解决它，保留能反映现实的 requirement。这很罕见，而且是个特性：这是 git 在告诉你，两个 change 对系统应当如何行为存在分歧。

## 当规划超出一个仓库 {#team-workflow-7}

以上所有内容都假设计划位于代码仓库自己的 `openspec/` 文件夹中，这也是正确的默认做法。当你的规划确实横跨多个仓库或团队时——一个功能涉及三个服务，或某些 requirement 由一个团队拥有、其他团队消费——这正是 beta 版 **stores** 特性的用途：规划有了自己的仓库，任何代码仓库都可以指向它。从 [Stores 用户指南](stores-beta/user-guide.md)开始。

## 接下来去哪里 {#team-workflow-8}

- [Reviewing a Change](reviewing-changes.md)——评审通读，现在就在你的 PR 里。
- [Writing Good Specs](writing-specs.md)——包括如何合理定规模，让一个 change 适配一个分支。
- [Stores 用户指南](stores-beta/user-guide.md)——横跨仓库与团队的规划。
