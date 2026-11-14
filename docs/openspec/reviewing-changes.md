# 审查一个 change {#change}

OpenSpec 的全部承诺在于：你和你的 AI **在写下任何代码之前就先就"要构建什么"达成一致。** 只有当你确实阅读了 AI 起草的内容，这份一致才有意义。本页讲的就是你阅读它的那两分钟——打开什么、按什么顺序打开、以及该找什么。

这个赌注很简单：在一段计划里发现走错了方向，几乎不费什么成本；在 300 行代码里发现同一个错误，代价就大了。审查就是你兑现这个赌注的地方。

## 你需要审查的两个时刻 {#reviewing-changes-2}

恰好有两个：

```
/opsx:propose ──► REVIEW THE PLAN ──► /opsx:apply ──► REVIEW THE CODE ──► /opsx:archive
                  (before any code)                    (/opsx:verify)
```

1. **在 `/opsx:propose`**（或 `/opsx:ff`）**之后**、`/opsx:apply` 之前——趁计划还只是文字时阅读它。
2. **在构建完成之后**，用 `/opsx:verify`——检查代码是否真的做到了计划所说的事。

第一次审查最能帮你省下成本，也正是人们最容易跳过的那一次。本页的大部分篇幅都花在那里。

## 按这个顺序阅读 {#reviewing-changes-3}

一个 change 就是 `openspec/changes/<name>/` 下装着若干纯 Markdown 文件的文件夹。按能让你最早发现问题的顺序来读——哪里不对就立刻停下：

```
openspec/changes/add-dark-mode/
├── proposal.md      1. the intent and scope   ← if this is wrong, stop here
├── specs/…/spec.md  2. the requirements       ← the heart of the review
├── design.md        (only for bigger changes) — the technical approach
└── tasks.md         3. the plan of work
```

你不需要逐行读完。你需要回答三个问题，每个文件对应一个。

## proposal：这是不是正确的问题？ {#proposal}

先打开 `proposal.md`。它承载"为什么"和"做什么"——意图、范围，以及一两段话讲清做法。

**做得好的样子：** 只有一个清晰的意图、一个你认得出来的范围，以及一个说明为什么现在值得做这件事的理由。

**危险信号：**

- 它解决的是和你所要求的问题*略有不同*的问题。
- 范围膨胀了——你只要求一个主题切换，proposal 却"顺手"还动了 auth。
- 内容含糊。"改进设置页面"不是一个范围；"新增一个遵循操作系统偏好的深色模式开关"才是。

**需要回答的问题：** _这与我实际提出的要求一致吗？有没有什么东西悄悄混了进来？_ 如果答案是否定的，就停下——不要再往下读，先修 proposal（见 [Pushing back](#pushing-back-is-cheap)）。

## spec delta：对"完成"的定义正确吗？ {#spec-delta}

这是审查的核心。`specs/` 下的 delta spec 说明了这个 change 交付后哪些事情会*为真*——以 requirement 和证明它们的 scenario 的形式：

```markdown
## ADDED Requirements

### Requirement: Dark Mode Toggle

The system SHALL let a user switch between light and dark themes.

#### Scenario: Respects the OS preference on first load

- GIVEN a user who has never set a theme
- WHEN they open the app on a device set to dark mode
- THEN the app renders in dark mode
```

**好的 requirement 是什么样：** 一句清晰的 `SHALL`/`MUST` 陈述，可以直接交给测试人员；并且至少有一个 scenario，其 GIVEN/WHEN/THEN 真正地检验了这句陈述。

**危险信号：**

- **含糊的 requirement。** "The system SHALL be fast" 既无法构建也无法测试。多快才算快？
- **没有 scenario 的 requirement**，或者某个 scenario 并没有检验它所属的那个 requirement。
- **最有价值的发现：遗漏了什么。** AI 忠实地写下了你*说过的*内容。你的工作是注意你*忘了说*的内容。如果你最关心的是操作系统偏好这种情况，而没有任何 scenario 提到它，那这次审查就已经值回票价了。

读 delta 时要问：_如果系统正好——且仅仅——做到这些，我会满意吗？_ 此阶段还不涉及代码，所以改动成本依然很低。

## tasks：这份工作计划是否合理？ {#tasks}

最后打开 `tasks.md`。它是 AI 将要逐项完成的实现清单。

**做得好的样子：** 步骤有序，每一歩都能追溯到某个 requirement，没有莫名其妙的内容。

**危险信号：**

- 某个 task 找不到对应的 requirement（这是从哪来的？）。
- 一个巨大的"实现该功能"task，把所有真正的决策都藏了起来。
- 某个 task 碰到了你刚刚批准的范围之外的东西。

这里你不是在做估算或微观管理——你是在检查这份计划是否与你已经接受的 requirement 一致。

## 提出异议的成本很低 {#pushing-back-is-cheap}

如果三个问题中任何一个的答案不对，就说出来。这里没有阶段划分，什么都没有被锁定——你改掉它，然后继续。有两种做法，与 [Editing a change](editing-changes.md) 中完全相同：

- **自己编辑文件。** 它就是纯 Markdown；改改范围那句话、收紧一个 requirement、删掉一个 task。
- **告诉 AI 哪里不对**，让它来修订：_"去掉 auth 相关的改动——超出范围，"_ _"补一个用户已经选过主题时的 scenario，"_ _"把 task 3 拆成 schema 和 UI 两部分。"_

然后重读你改动的那部分。反复起草，直到它成为一份你愿意署名的计划。这种来回往复*正是*产品在起作用。

## 代码之后：verify {#verify}

工作构建完成后，`/opsx:verify` 就是你的第二次审查。它会重新读取 artifact 和代码，并从三个维度报告不一致之处：

| 维度             | 检查内容                                                     |
| ---------------- | ------------------------------------------------------------ |
| **Completeness** | 每个 task 都完成、每个 requirement 都实现、scenario 都被覆盖 |
| **Correctness**  | 实现符合 spec 的意图，边界情况已处理                         |
| **Coherence**    | 设计决策确实体现在代码中                                     |

```
You: /opsx:verify

AI:  Verifying add-dark-mode...

     COMPLETENESS
     ✓ All 8 tasks in tasks.md are checked
     ✓ All requirements in specs have corresponding code
     ⚠ Scenario "Respects the OS preference on first load" has no test coverage
```

它把问题标记为 CRITICAL、WARNING 或 SUGGESTION，并且**不会**阻止归档——它只是把缺口摆出来，判断留给你。这就是"AI 写了代码"与"AI 建成了我们约定的东西"之间的差别。

`/opsx:verify` 属于 expanded profile。如果你没有它，用 `openspec config profile` 打开（然后 `openspec update`），或者干脆自己重读这个 change 和 diff。

## 审查要按规模来定 {#reviewing-changes-9}

并非每个 change 都值得完整过一遍。改一个错别字，花二十秒扫一眼就够了。而一个触及 auth、支付或无法恢复的数据的 change，上面每一个问题都值得问。这从来不是为了走形式——而是把注意力花在出错代价高昂的地方，在代价不高的时候略过。

## 两分钟清单 {#reviewing-changes-10}

- [ ] proposal 的意图与我提出的一致。
- [ ] 范围里没有混进多余的东西。
- [ ] 每个 requirement 都足够具体、可以测试。
- [ ] 每个 requirement 都有一个真正检验它的 scenario。
- [ ] 我最在意的那种情况已被覆盖。
- [ ] task 能对应到 requirement；没有莫名其妙或超出范围的内容。
- [ ] 如果 AI 正好只构建这些、不多不少，我会感到放心。

如果七项全部通过，就放心地运行 `/opsx:apply`。如果有任何一项没通过，那不是挫折——那正是这两分钟在发挥作用。

## 接下来去哪里 {#reviewing-changes-11}

- [Writing Good Specs](writing-specs.md) — 另一面：如何起草值得批准的 requirement 和 scenario。
- [Editing & Iterating on a Change](editing-changes.md) — 在开始之后修改计划的机制。
- [Workflows](workflows.md) — 审查在更大循环中的位置。
