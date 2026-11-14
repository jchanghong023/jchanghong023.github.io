# 命令 {#commands-1}

这是 OpenSpec 斜杠命令的参考文档。本副本在 Oh My Pi 中调用这些命令。

关于工作流模式以及何时使用每个命令，参见 [工作流](workflows.md)。关于 CLI 命令，参见 [CLI](cli.md)。

本副本只配置 Oh My Pi。按 skill 名称调用工作流，例如
`/openspec-propose`；参见 [如何调用](supported-tools.md#how-to-invoke)。

## 快速参考 {#commands-2}

### 默认快速路径（`core` profile） {#core-profile}

| 命令            | 用途                                           |
| --------------- | ---------------------------------------------- |
| `/opsx:propose` | 一步创建 change 并生成规划 artifact            |
| `/opsx:explore` | 在确定要发起 change 之前先把想法想清楚         |
| `/opsx:apply`   | 实现 change 中的 task                          |
| `/opsx:update`  | 修订 change 的规划 artifact 并保持它们彼此一致 |
| `/opsx:sync`    | 将 delta spec 合并到主 spec 中                 |
| `/opsx:archive` | 归档已完成的 change                            |

### 扩展工作流命令（自定义工作流选择） {#commands-4}

| 命令                 | 用途                              |
| -------------------- | --------------------------------- |
| `/opsx:new`          | 启动一个新的 change 脚手架        |
| `/opsx:continue`     | 基于依赖关系创建下一个 artifact   |
| `/opsx:ff`           | 快进：一次性创建所有规划 artifact |
| `/opsx:verify`       | 验证实现与 artifact 是否一致      |
| `/opsx:bulk-archive` | 一次性归档多个 change             |
| `/opsx:onboard`      | 完整的引导式工作流教程            |

默认的全局 profile 是 `core`。要启用扩展工作流命令，请运行 `openspec config profile`，选择工作流，然后在你的项目中运行 `openspec update`。

---

## 命令参考 {#commands-5}

### `/opsx:propose` {#opsxpropose}

一步创建新的 change 并生成规划 artifact。这是 `core` profile 中的默认启动命令。

**语法：**

```text
/opsx:propose [change-name-or-description]
```

**参数：**

| 参数                         | 是否必需 | 说明                                            |
| ---------------------------- | -------- | ----------------------------------------------- |
| `change-name-or-description` | 否       | Kebab-case 名称，或用平实语言描述的 change 说明 |

**它的作用：**

- 创建 `openspec/changes/<change-name>/`
- 生成实现前所需的 artifact（对于 `spec-driven`：proposal、specs、design、tasks）
- 当 change 已准备好执行 `/opsx:apply` 时停止

**示例：**

```text
You: /opsx:propose add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md
     ✓ specs/ui/spec.md
     ✓ design.md
     ✓ tasks.md
     Ready for implementation. Run /opsx:apply.
```

**提示：**

- 这是最快的端到端路径
- 如果你想要逐步控制 artifact，请启用扩展工作流并使用 `/opsx:new` + `/opsx:continue`

---

### `/opsx:explore` {#opsxexplore}

> **不确定时从这里开始。** Explore 是一个没有风险的思考伙伴：它会读取你的代码库、比较各种方案，并在写任何代码之前把模糊的想法打磨成具体的计划。它包含在默认 profile 中。完整论述和更多示例参见 [先探索](explore.md) 指南。

在确定要发起 change 之前，把想法想清楚、调研问题、厘清需求。

**语法：**

```
/opsx:explore [topic]
```

**参数：**

| 参数    | 是否必需 | 说明                   |
| ------- | -------- | ---------------------- |
| `topic` | 否       | 你想要探索或调研的主题 |

**它的作用：**

- 开启一段探索性对话，无需任何固定结构
- 调研代码库以回答问题
- 比较各种选项和方法
- 创建可视化图表以厘清思路
- 在你要求时，或你接受它的提议时，捕获这次探索：用 `openspec new change` 搭建一个 change 的脚手架，并写入你指定的规划 artifact，或更新已有 change 的 artifact
- 当洞察逐渐明确时，可转入 `/opsx:propose`（默认）或 `/opsx:new`（扩展工作流）

**示例：**

```text
You: /opsx:explore

AI:  What would you like to explore?

You: How should we handle authentication for the mobile app?

AI:  Let me investigate your current auth setup...
     [Analyzes codebase]

     I see you're using session-based auth for the web app.
     For mobile, we have three main options:

     1. JWT tokens (stateless, works offline)
     2. OAuth2 (if you need third-party login)
     3. Extend current sessions (simpler, but requires connectivity)

     Your API already has CORS configured. Which direction interests you?

You: Let's go with JWT.

AI:  That's a decision worth keeping. Want me to start a change called
     add-jwt-auth? Just the change folder, nothing else yet.

You: Yes.

AI:  Started openspec/changes/add-jwt-auth/. Say the word and I'll
     write the proposal, specs, and tasks from what we just worked out.
```

**提示：**

- 当需求不清晰或你需要调研时使用
- 它从不写代码，除非你要求、或在它提议时你表示同意，否则它也不写任何其他内容
- 适合在决定之前比较多种方案
- 可以读取文件并搜索代码库

---

### `/opsx:new` {#opsxnew}

启动一个新的 change 脚手架。创建 change 文件夹，然后等待你用 `/opsx:continue` 或 `/opsx:ff` 生成 artifact。

此命令属于扩展工作流集合（不包含在默认的 `core` profile 中）。

**语法：**

```
/opsx:new [change-name] [--schema <schema-name>]
```

**参数：**

| 参数          | 是否必需 | 说明                                                    |
| ------------- | -------- | ------------------------------------------------------- |
| `change-name` | 否       | change 文件夹的名称（未提供时会提示输入）               |
| `--schema`    | 否       | 要使用的工作流 schema（默认：来自配置或 `spec-driven`） |

**它的作用：**

- 创建 `openspec/changes/<change-name>/` 目录
- 在 change 文件夹中创建 `.openspec.yaml` 元数据文件
- 显示第一个可供创建的 artifact 模板
- 若未提供，则提示输入 change 名称和 schema

**它创建的内容：**

```
openspec/changes/<change-name>/
└── .openspec.yaml    # Change metadata (schema, created date)
```

**示例：**

```
You: /opsx:new add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     Schema: spec-driven

     Ready to create: proposal
     Use /opsx:continue to create it, or /opsx:ff to create all artifacts.
```

**提示：**

- 使用描述性名称：`add-feature`、`fix-bug`、`refactor-module`
- 避免使用 `update`、`changes`、`wip` 之类的泛化名称
- schema 也可以设置在项目配置中（`openspec/config.yaml`）

---

### `/opsx:continue` {#opsxcontinue}

在依赖链中创建下一个 artifact。每次创建一个 artifact，以实现增量推进。

**语法：**

```
/opsx:continue [change-name]
```

**参数：**

| 参数          | 是否必需 | 说明                                          |
| ------------- | -------- | --------------------------------------------- |
| `change-name` | 否       | 要继续处理哪个 change（未提供时从上下文推断） |

**它的作用：**

- 查询 artifact 依赖图
- 显示哪些 artifact 已就绪、哪些被阻塞
- 创建第一个就绪的 artifact
- 读取依赖文件以获取上下文
- 显示创建之后有哪些 artifact 变为可用

**示例：**

```
You: /opsx:continue

AI:  Change: add-dark-mode

     Artifact status:
     ✓ proposal    (done)
     ◆ specs       (ready)
     ◆ design      (ready)
     ○ tasks       (blocked - needs: specs, design)

     Creating specs...

     [Reads proposal.md, creates specs based on requirements]

     ✓ Created openspec/changes/add-dark-mode/specs/ui/spec.md

     Now available: design
     Run /opsx:continue to create the next artifact.
```

**提示：**

- 当你希望在继续之前逐个审查 artifact 时使用
- 适合需要掌控复杂度的复杂 change
- 多个 artifact 可能同时变为就绪
- 你可以在继续之前编辑已创建的 artifact

---

### `/opsx:ff` {#opsxff}

快进 artifact 创建过程。一次性创建所有规划 artifact。

**语法：**

```
/opsx:ff [change-name]
```

**参数：**

| 参数          | 是否必需 | 说明                                          |
| ------------- | -------- | --------------------------------------------- |
| `change-name` | 否       | 要快进处理哪个 change（未提供时从上下文推断） |

**它的作用：**

- 按依赖顺序创建所有 artifact
- 通过 todo 列表跟踪进度
- 当所有 `apply-required` artifact 完成时停止
- 在创建下一个 artifact 之前读取每个依赖

**示例：**

```
You: /opsx:ff add-dark-mode

AI:  Fast-forwarding add-dark-mode...

     ✓ Creating proposal.md
     ✓ Creating specs/ui/spec.md
     ✓ Creating design.md
     ✓ Creating tasks.md

     All planning artifacts complete!
     Ready for implementation. Run /opsx:apply to begin.
```

**提示：**

- 当你对自己要构建的东西有清晰认识时使用
- 对于简单直接的 change，比 `/opsx:continue` 更快
- 之后你仍然可以编辑 artifact
- 适合中小型功能

---

### `/opsx:apply` {#opsxapply}

实现 change 中的 task。逐个处理 task 列表，编写代码并勾选条目。

**语法：**

```
/opsx:apply [change-name]
```

**参数：**

| 参数          | 是否必需 | 说明                                      |
| ------------- | -------- | ----------------------------------------- |
| `change-name` | 否       | 要实现哪个 change（未提供时从上下文推断） |

**它的作用：**

- 读取 `tasks.md` 并识别未完成的 task
- 逐个处理 task
- 按需编写代码、创建文件、运行测试
- 用复选框 `[x]` 标记 task 完成

**示例：**

```
You: /opsx:apply

AI:  Implementing add-dark-mode...

     Reading tasks.md:
     - [ ] 1.1 Create ThemeContext
     - [ ] 1.2 Add CSS custom properties
     - [ ] 1.3 Implement localStorage persistence

     Working on 1.1: Create ThemeContext...
     [Creates src/context/ThemeContext.tsx]

     ✓ 1.1 Complete

     Working on 1.2: Add CSS custom properties...
     [Updates src/styles/globals.css]

     ✓ 1.2 Complete
     ...
```

**提示：**

- 如果中断，可以从上次停下的地方继续
- 通过指定 change 名称，可用于并行处理多个 change
- 完成状态记录在 `tasks.md` 的复选框中

---

### `/opsx:update` {#opsxupdate}

修订 change 现有的规划 artifact，并使它们彼此保持一致。仅限规划 artifact —— 它从不编辑代码。

**语法：**

```text
/opsx:update [change-name]
```

**参数：**

| 参数          | 是否必需 | 说明                                      |
| ------------- | -------- | ----------------------------------------- |
| `change-name` | 否       | 要更新哪个 change（未提供时从上下文推断） |

**它的作用：**

- 通过 `openspec status --change <name> --json` 读取该 change 的 artifact
- 应用你要求的修订；如果你没有指定修订内容，则检查 artifact 之间是否存在矛盾
- 以任意方向协调其他现有 artifact（对 design 的编辑可能会反向波及 proposal）
- 在写入前逐个 artifact 与你确认每一处编辑
- 结束时推荐下一步：`/opsx:continue`（尚未创建的 artifact）、`/opsx:apply`（把修订后的计划落实到代码）或 `/opsx:archive`（全部完成）

**缺失的文件：**

- 对于 glob 形式的 artifact（如 `specs/**/*.md`）且其中至少已有一个文件时，update 可以提议补一个缺失的配套文件。它会使用 schema 的指令，并在创建前请你确认具体路径。
- 尚无任何文件的 artifact 留给 `/opsx:continue`。有意跳过的 artifact 保持不动。
- 新文件必须位于 change 目录内。如果在创建之前确认的路径上出现了文件，update 会停止，而不是覆盖它。

**示例：**

```text
You: /opsx:update add-dark-mode - we're storing the theme in a cookie now, not localStorage

AI:  Reading add-dark-mode artifacts...

     The design references localStorage in two places; tasks 1.3 covers
     localStorage persistence; the proposal doesn't mention storage.

     Proposed revisions:
     1. design.md - swap localStorage decision for cookie storage
     2. tasks.md - reword task 1.3 to cookie persistence

     Apply revision 1? (design.md)
```

**提示：**

- 它不会启动一个尚无任何文件的 artifact。要处理这种情况，请启用 `/opsx:continue`；或者如果该可选工作流未安装，则使用 `openspec status` 和 `openspec instructions`。
- 如果该 change 已经实现，请接着运行 `/opsx:apply`，使代码与修订后的计划一致
- 如果你的修订改变了该 change 的*意图*，请改为用一个新的 change 从头开始（参见 [何时更新与何时从头开始](opsx.md#when-to-update-vs-start-fresh)）

---

### `/opsx:verify` {#opsxverify}

验证实现是否与你的 change artifact 一致。检查完整性、正确性和一致性。

**语法：**

```
/opsx:verify [change-name]
```

**参数：**

| 参数          | 是否必需 | 说明                                      |
| ------------- | -------- | ----------------------------------------- |
| `change-name` | 否       | 要验证哪个 change（未提供时从上下文推断） |

**它的作用：**

- 检查实现质量的三个维度
- 在代码库中搜索实现证据
- 报告归类为 CRITICAL、WARNING 或 SUGGESTION 的问题
- 不会阻止归档，但会暴露问题

**验证维度：**

| 维度       | 验证内容                                                              |
| ---------- | --------------------------------------------------------------------- |
| **完整性** | 所有 task 均已完成、所有 requirement 均已实现、所有 scenario 均已覆盖 |
| **正确性** | 实现符合 spec 意图、边界情况已处理                                    |
| **一致性** | design 决策体现在代码中、模式保持一致                                 |

**示例：**

```
You: /opsx:verify

AI:  Verifying add-dark-mode...

     COMPLETENESS
     ✓ All 8 tasks in tasks.md are checked
     ✓ All requirements in specs have corresponding code
     ⚠ Scenario "System preference detection" has no test coverage

     CORRECTNESS
     ✓ Implementation matches spec intent
     ✓ Edge cases from scenarios are handled
     ✓ Error states match spec definitions

     COHERENCE
     ✓ Design decisions reflected in code structure
     ✓ Naming conventions consistent with design.md
     ⚠ Design mentions "CSS variables" but implementation uses Tailwind classes

     SUMMARY
     ─────────────────────────────
     Critical issues: 0
     Warnings: 2
     Ready to archive: Yes (with warnings)

     Recommendations:
     1. Add test for system preference detection
     2. Update design.md to reflect Tailwind usage, or refactor to use CSS variables
```

**提示：**

- 在归档之前运行，以便尽早发现不一致
- 警告不会阻止归档，但表明存在潜在问题
- 适合在提交之前审查 AI 的工作
- 可以揭示 artifact 与实现之间的偏差

---

### `/opsx:sync` {#opsxsync}

**可选命令。** 将 change 中的 delta spec 合并到主 spec 中。归档时如有需要会提示同步，因此通常你不需要手动运行此命令。

**语法：**

```
/opsx:sync [change-name]
```

**参数：**

| 参数          | 是否必需 | 说明                                      |
| ------------- | -------- | ----------------------------------------- |
| `change-name` | 否       | 要同步哪个 change（未提供时从上下文推断） |

**它的作用：**

- 从 change 文件夹读取 delta spec
- 解析 ADDED/MODIFIED/REMOVED/RENAMED 各节
- 将变更合并到主 `openspec/specs/` 目录
- 保留 delta 中未提及的现有内容
- 不归档该 change（保持活动状态）

**示例：**

```text
You: /opsx:sync

AI:  Syncing add-dark-mode delta specs...

     Reading: openspec/changes/add-dark-mode/specs/ui/spec.md
     Target:  openspec/specs/ui/spec.md

     Changes to apply:
     ✓ ADDED: Theme Selection requirement (2 scenarios)
     ✓ ADDED: Accessibility requirement (1 scenario)

     Merging...
     ✓ openspec/specs/ui/spec.md updated

     Change remains active. Run /opsx:archive when ready to complete.
```

**何时手动使用：**

| 场景                                              | 是否使用 sync？  |
| ------------------------------------------------- | ---------------- |
| 长期运行的 change，希望在归档前把 spec 放入主目录 | 是               |
| 多个并行 change 需要更新后的基础 spec             | 是               |
| 希望单独预览/审查合并结果                         | 是               |
| 快速 change，直接进入归档                         | 否（归档会处理） |

**提示：**

- Sync 是智能的，不是复制粘贴
- 可以向现有 requirement 添加 scenario 而不会重复
- 同步后 change 仍保持活动状态（未归档）
- 大多数用户永远不需要直接调用它——归档时如有需要会进行提示

---

### `/opsx:archive` {#opsxarchive}

归档已完成的 change。完成该 change 的收尾并将其移至归档文件夹。

**语法：**

```
/opsx:archive [change-name]
```

**参数：**

| 参数          | 是否必需 | 说明                                      |
| ------------- | -------- | ----------------------------------------- |
| `change-name` | 否       | 要归档哪个 change（未提供时从上下文推断） |

**它的作用：**

- 检查 artifact 完成状态
- 检查 task 完成情况（未完成时发出警告）
- 若 delta spec 尚未同步，则提议进行同步
- 将 change 文件夹移至 `openspec/changes/archive/YYYY-MM-DD-<name>/`
- 保留所有 artifact 以形成审计轨迹

**示例：**

```text
You: /opsx:archive

AI:  Archiving add-dark-mode...

     Artifact status:
     ✓ proposal.md exists
     ✓ specs/ exists
     ✓ design.md exists
     ✓ tasks.md exists (8/8 tasks complete)

     Delta specs: Not yet synced
     → Sync now? (recommended)

You: Yes

AI:  ✓ Synced specs to openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/

     Change archived successfully.
```

**提示：**

- 归档不会因未完成的 task 而受阻，但会发出警告
- delta spec 可以在归档期间同步，也可以提前同步
- 已归档的 change 会保留作为历史
- 先运行 `/opsx:verify` 以发现问题

---

### `/opsx:bulk-archive` {#opsxbulk-archive}

一次性归档多个已完成的 change。处理 change 之间的 spec 冲突。

**语法：**

```
/opsx:bulk-archive [change-names...]
```

**参数：**

| 参数           | 是否必需 | 说明                                      |
| -------------- | -------- | ----------------------------------------- |
| `change-names` | 否       | 要归档的特定 change（未提供时会提示选择） |

**它的作用：**

- 列出所有已完成的 change
- 在归档前验证每个 change
- 检测跨 change 的 spec 冲突
- 通过检查实际实现的内容来解决冲突
- 按时间顺序归档

**示例：**

```
You: /opsx:bulk-archive

AI:  Found 3 completed changes:
     - add-dark-mode (8/8 tasks complete)
     - fix-login-bug (3/3 tasks complete)
     - update-footer (2/2 tasks complete)

     Checking for spec conflicts...
     ⚠ add-dark-mode and update-footer both touch specs/ui/

     Inspecting codebase to resolve...
     Both changes are implemented. Will merge in chronological order:
     1. add-dark-mode (created Jan 20)
     2. update-footer (created Jan 22)

     Archive all 3 changes?

You: Yes

AI:  ✓ Archived add-dark-mode
     ✓ Archived fix-login-bug
     ✓ Archived update-footer
     Specs merged: add-dark-mode → update-footer
```

**提示：**

- 适合并行的工作流
- 冲突解决是 agentic 的（会检查代码库）
- change 按创建顺序归档
- 在覆盖 spec 内容之前会进行提示

---

### `/opsx:onboard` {#opsxonboard}

通过完整的 OpenSpec 工作流进行引导式上手。使用你实际代码库的交互式教程。

**语法：**

```
/opsx:onboard
```

**它的作用：**

- 带旁白地走完一个完整的工作流周期
- 扫描你的代码库以寻找真实的改进机会
- 创建一个真实的 change 并生成真实的 artifact
- 实现实际工作（小规模、安全的改动）
- 归档已完成的 change
- 在每一步发生时进行解释

**阶段：**

1. 欢迎与代码库分析
2. 寻找改进机会
3. 创建 change（`/opsx:new`）
4. 编写 proposal
5. 创建 spec
6. 编写 design
7. 创建 task
8. 实现 task（`/opsx:apply`）
9. 验证实现
10. 归档 change
11. 总结与下一步

**示例：**

```
You: /opsx:onboard

AI:  Welcome to OpenSpec!

     I'll walk you through the complete workflow using your actual codebase.
     We'll find something small to improve, create a proper change for it,
     implement it, and archive it.

     Let me scan your codebase for opportunities...

     [Analyzes codebase]

     I found a few things we could work on:
     1. Add input validation to the contact form
     2. Improve error messages in the auth flow
     3. Add loading states to async buttons

     Which interests you? (or suggest something else)
```

**提示：**

- 最适合学习该工作流的新用户
- 使用真实代码，而非玩具示例
- 创建一个你可以保留或丢弃的真实 change
- 完成需要 15-30 分钟

---

## 各 AI 工具的命令语法 {#ai}

不同的 AI 工具使用略有不同的命令语法。请使用与你的工具相匹配的格式：

| 工具     | 输入方式            |
| -------- | ------------------- |
| Oh My Pi | `/openspec-propose` |

此 vendored 副本只配置 Oh My Pi；它直接读取共享的 skill，因此以 `/openspec-<workflow>` 形式调用工作流。[如何调用](supported-tools.md#how-to-invoke) 是权威依据。

---

## 旧版命令 {#commands-19}

这些命令使用较旧的“一次性完成”工作流。它们仍然可用，但推荐使用 OPSX 命令。

| 命令                 | 它的作用                                                  |
| -------------------- | --------------------------------------------------------- |
| `/openspec:proposal` | 一次性创建所有 artifact（proposal、specs、design、tasks） |
| `/openspec:apply`    | 实现该 change                                             |
| `/openspec:archive`  | 归档该 change                                             |

**何时使用旧版命令：**

- 使用旧工作流的现有项目
- 不需要增量创建 artifact 的简单 change
- 偏好全有或全无方式的情况

**迁移到 OPSX：**
旧版 change 可以用 OPSX 命令继续处理。artifact 结构是兼容的。

---

## 故障排查 {#commands-20}

### “Change not found” {#change-not-found}

命令无法确定要处理哪个 change。

**解决方案：**

- 显式指定 change 名称：`/opsx:apply add-dark-mode`
- 检查 change 文件夹是否存在：`openspec list`
- 确认你位于正确的项目目录中

### “No artifacts ready” {#no-artifacts-ready}

所有 artifact 要么已完成，要么因缺少依赖而被阻塞。

**解决方案：**

- 运行 `openspec status --change <name>` 查看是什么在阻塞
- 检查所需的 artifact 是否存在
- 先创建缺失的依赖 artifact

### “Schema not found” {#schema-not-found}

指定的 schema 不存在。

**解决方案：**

- 列出可用的 schema：`openspec schemas`
- 检查 schema 名称的拼写
- 如果是自定义 schema，请创建它：`openspec schema init <name>`

### 命令无法识别 {#commands-24}

AI 工具无法识别 OpenSpec 命令。

**解决方案：**

- 确保 OpenSpec 已初始化：`openspec init`
- 重新生成 skill：`openspec update`
- 检查 `.claude/skills/` 目录是否存在（适用于 Claude Code）
- 重启你的 AI 工具以加载新的 skill

### Artifact 未能正确生成 {#artifact}

AI 创建了不完整或不正确的 artifact。

**解决方案：**

- 在 `openspec/config.yaml` 中添加项目上下文
- 为特定指导添加按 artifact 区分的规则
- 在 change 描述中提供更多细节
- 使用 `/opsx:continue` 而非 `/opsx:ff` 以获得更多控制

---

## 下一步 {#commands-26}

- [工作流](workflows.md) - 常见模式以及何时使用每个命令
- [CLI](cli.md) - 用于管理和验证的终端命令
- [自定义](customization.md) - 创建自定义 schema 和工作流
