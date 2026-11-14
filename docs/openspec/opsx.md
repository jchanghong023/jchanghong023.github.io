# OPSX 工作流 {#opsx}

> 欢迎在 [Discord](https://discord.gg/YctCnvvshC) 上提供反馈。

## 它是什么？ {#opsx-2}

OPSX 现在是 OpenSpec 的标准 workflow。

它是一种面向 OpenSpec change 的**流动式、迭代式 workflow**。不再有僵化的阶段——只有你随时可以采取的动作。

## 为什么需要它 {#opsx-3}

旧版 OpenSpec workflow 是能用的，但它是**锁死的**：

- **指令是硬编码的**——埋在 TypeScript 里，你无法修改
- **全有或全无**——一条大命令创建所有内容，无法单独测试各个部分
- **结构固定**——所有人用同一套 workflow，没有自定义空间
- **黑盒**——当 AI 的输出不好时，你无法调整提示词

**OPSX 把它打开了。** 现在任何人都可以：

1. **试验指令**——改一个模板，看看 AI 是否表现更好
2. **细粒度测试**——独立验证每个 artifact 的指令
3. **自定义 workflow**——定义你自己的 artifact 与依赖
4. **快速迭代**——改模板、立即测试，无需重新构建

```
Legacy workflow:                      OPSX:
┌────────────────────────┐           ┌────────────────────────┐
│  Hardcoded in package  │           │  schema.yaml           │◄── You edit this
│  (can't change)        │           │  templates/*.md        │◄── Or this
│        ↓               │           │        ↓               │
│  Wait for new release  │           │  Instant effect        │
│        ↓               │           │        ↓               │
│  Hope it's better      │           │  Test it yourself      │
└────────────────────────┘           └────────────────────────┘
```

**这是面向所有人的：**

- **团队**——创建符合你们实际工作方式的 workflow
- **高级用户**——针对你的代码库调整提示词，得到更好的 AI 输出
- **OpenSpec 贡献者**——无需等待发版就能试验新方法

我们都还在摸索什么方法最好。OPSX 让我们可以一起学习。

## 用户体验 {#opsx-4}

**线性 workflow 的问题：**
你先"处于规划阶段"，然后"处于实现阶段"，然后"完成"。但真实的工作不是这样运转的。你实现了一些东西，发现设计错了，需要更新 spec，然后继续实现。线性阶段与工作的真实发生方式相冲突。

**OPSX 的做法：**

- **动作，而非阶段**——create、implement、update、archive——任何时候都可以做其中任何一个
- **依赖是使能者**——它们展示什么是可能的，而不是接下来必须做什么

```
  proposal ──→ specs ──→ design ──→ tasks ──→ implement
```

## 初始化设置 {#opsx-5}

```bash
# Make sure you have openspec installed — skills are automatically generated
openspec init
```

这会在 `.claude/skills/`（或等价位置）创建 skill，AI 编码助手会自动检测到它们。

默认情况下，OpenSpec 使用 `core` workflow profile（`propose`、`explore`、`apply`、`update`、`sync`、`archive`）。如果你想要扩展的 workflow 命令（`new`、`continue`、`ff`、`verify`、`bulk-archive`、`onboard`），用 `openspec config profile` 配置它们，再用 `openspec update` 应用。

在设置过程中，系统会提示你创建 **项目配置**（`openspec/config.yaml`）。这是可选的，但推荐创建。

## 项目配置 {#opsx-6}

项目配置让你设置默认值，并把项目特定的 context 注入到所有 artifact 中。

### 创建配置 {#opsx-7}

Config 在 `openspec init` 期间创建，也可以手动创建：

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  API conventions: RESTful, JSON responses
  Testing: Vitest for unit tests, Playwright for e2e
  Style: ESLint with Prettier, strict TypeScript

rules:
  proposal:
    - Include rollback plan
    - Identify affected teams
  specs:
    - Use Given/When/Then format for scenarios
  design:
    - Include sequence diagrams for complex flows
```

### 配置字段 {#opsx-8}

| 字段      | 类型   | 说明                                          |
| --------- | ------ | --------------------------------------------- |
| `schema`  | string | 新 change 的默认 schema（例如 `spec-driven`） |
| `context` | string | 注入到所有 artifact 指令中的项目 context      |
| `rules`   | object | 按 artifact 划分的规则，以 artifact ID 为键   |

### 工作原理 {#opsx-9}

**Schema 优先级**（从高到低）：

1. CLI 标志（`--schema <name>`）
2. Change 元数据（change 目录下的 `.openspec.yaml`）
3. 项目配置（`openspec/config.yaml`）
4. 默认值（`spec-driven`）

**Context 注入：**

- Context 会被前置到每个 artifact 的指令中
- 用 `<context>...</context>` 标签包裹
- 帮助 AI 理解你的项目约定

**Rules 注入：**

- Rules 只会被注入到匹配的 artifact
- 用 `<rules>...</rules>` 标签包裹
- 出现在 context 之后、模板之前

### 按 Schema 划分的 Artifact ID {#schema-artifact-id}

**spec-driven**（默认）：

- `proposal` — 提案
- `specs` — 规范文档
- `design` — 技术设计
- `tasks` — 实现任务

### 配置校验 {#opsx-11}

- `rules` 中未知的 artifact ID 会产生警告
- Schema 名称会针对可用的 schema 进行校验
- Context 有 50KB 的大小限制
- 无效的 YAML 会被报告并附带行号

### 故障排查 {#opsx-12}

**"Unknown artifact ID in rules: X"**

- 检查 artifact ID 是否与你的 schema 匹配（见上方列表）
- 运行 `openspec schemas --json` 查看每个 schema 的 artifact ID

**配置未生效：**

- 确认文件位于 `openspec/config.yaml`（不是 `.yml`）
- 用校验器检查 YAML 语法
- 配置改动立即生效（无需重启）

**Context 过大：**

- Context 限制为 50KB
- 改为精简摘要或链接到外部文档

## 命令 {#opsx-13}

| 命令                 | 作用                                                |
| -------------------- | --------------------------------------------------- |
| `/opsx:propose`      | 一步创建 change 并生成规划 artifact（默认快捷路径） |
| `/opsx:explore`      | 梳理想法、排查问题、厘清需求                        |
| `/opsx:new`          | 启动一个新的 change 脚手架（扩展 workflow）         |
| `/opsx:continue`     | 创建下一个 artifact（扩展 workflow）                |
| `/opsx:ff`           | 快进生成规划 artifact（扩展 workflow）              |
| `/opsx:apply`        | 实现 task，并按需更新 artifact                      |
| `/opsx:update`       | 修订某个 change 的规划 artifact，并保持它们一致     |
| `/opsx:verify`       | 按 artifact 校验实现（扩展 workflow）               |
| `/opsx:sync`         | 把 delta spec 合并进主 spec（可选）                 |
| `/opsx:archive`      | 完成后归档                                          |
| `/opsx:bulk-archive` | 归档多个已完成的 change（扩展 workflow）            |
| `/opsx:onboard`      | 端到端 change 的引导式演示（扩展 workflow）         |

## 用法 {#opsx-14}

### 探索一个想法 {#opsx-15}

```
/opsx:explore
```

梳理想法、排查问题、比较方案。不需要任何结构——只是一个思考伙伴。当见解清晰成形后，转到 `/opsx:propose`（默认）或 `/opsx:new`/`/opsx:ff`（扩展）。

### 开始一个新的 change {#change}

```
/opsx:propose
```

创建 change，并生成实现前所需的规划 artifact。

如果你已启用扩展 workflow，也可以改用：

```text
/opsx:new        # scaffold only
/opsx:continue   # create one artifact at a time
/opsx:ff         # create all planning artifacts at once
```

### 创建 artifact {#artifact}

```
/opsx:continue
```

根据依赖关系显示哪些内容已就绪、可以创建，然后创建一个 artifact。反复使用即可逐步构建你的 change。

```
/opsx:ff add-dark-mode
```

一次性创建所有规划 artifact。当你对要构建的东西已有清晰画面时使用。

### 实现（流动的那部分） {#opsx-18}

```
/opsx:apply
```

逐个处理 task，边做边勾选。如果你同时忙于多个 change，可以运行 `/opsx:apply <name>`；否则它应当从对话中推断，若无法判断则提示你选择。

### 更新一个 change {#change-2}

```
/opsx:update add-dark-mode - we're storing the theme in a cookie now
```

修订该 change 已有的规划 artifact，并让它们在任意方向上保持一致（对 design 的修改可能反向波及 proposal）。它从不编辑代码。每次编辑都会先与你确认。关于它在文件缺失时如何避免新建 artifact，见[update 参考](commands.md#opsxupdate)。

如果该 change 已经实现，它会建议运行 `/opsx:apply`，让代码跟上修订后的计划。如果你的修订改变了该 change 的 _intent_，那就重新开始。见[何时更新 vs. 重新开始](#when-to-update-vs-start-fresh)。

### 同步 delta spec {#delta-spec}

```text
/opsx:sync
```

把当前 change 的 delta spec 合并进你的主 `openspec/specs/`，且不归档——该 change 保持活跃。它会应用整个 delta：`## REMOVED` 下的 requirement 会从主 spec 中删除，被重命名的 requirement 则在原处改标题，而 delta 未提及的内容保持不动。同步是可选的——如果你还没同步，归档时会先提示你同步。当你希望在归档前更新主 spec、当并行的 change 需要基于这个 change 刚新增的 spec 继续构建，或当你希望在归档前审阅合并后的主 spec 时，就该用它。

### 收尾 {#opsx-21}

```
/opsx:archive   # Move to archive when done (prompts to sync specs if needed)
```

## 何时更新 vs. 重新开始 {#when-to-update-vs-start-fresh}

在实现之前，你总能编辑自己的 proposal 或 spec。但精炼到什么程度就变成了"这是另一件工作了"？

### Proposal 记录了哪些内容 {#proposal}

一个 proposal 定义三件事：

1. **Intent** ——你在解决什么问题？
2. **Scope** ——什么在范围内、什么在范围外？
3. **Approach** ——你打算怎么解决？

问题在于：哪一个变了，变了多少？

### 在这些情况下更新已有的 change： {#change-3}

**Intent 相同，执行细化**

- 你发现了之前没考虑到的边界情况
- 方案需要微调，但目标未变
- 实现暴露出设计略有偏差

**Scope 收窄**

- 你意识到完整 scope 太大，想先交付 MVP
- "添加暗色模式" → "添加暗色模式开关（v2 支持系统偏好）"

**由学习驱动的修正**

- 代码库的结构与你原先设想的不同
- 某个依赖的表现不如预期
- "使用 CSS 变量" → "改用 Tailwind 的 dark: 前缀"

### 在这些情况下开始一个新的 change： {#change-4}

**Intent 根本改变**

- 问题本身现在已经不同了
- "添加暗色模式" → "添加完整的主题系统，支持自定义颜色、字体、间距"

**Scope 爆炸**

- change 膨胀到本质上已是另一件工作
- 原始 proposal 经多次更新后面目全非
- "修复登录 bug" → "重写认证系统"

**原始的 change 可以完成了**

- 原始 change 可以标记为"完成"
- 新工作独立存在，不是对它的精炼
- 完成"添加暗色模式 MVP" → 归档 → 新建 change "增强暗色模式"

### 判断启发式 {#opsx-26}

```
                        ┌─────────────────────────────────────┐
                        │     Is this the same work?          │
                        └──────────────┬──────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
             Same intent?      >50% overlap?      Can original
             Same problem?     Same scope?        be "done" without
                    │                  │          these changes?
                    │                  │                  │
          ┌────────┴────────┐  ┌──────┴──────┐   ┌───────┴───────┐
          │                 │  │             │   │               │
         YES               NO YES           NO  NO              YES
          │                 │  │             │   │               │
          ▼                 ▼  ▼             ▼   ▼               ▼
       UPDATE            NEW  UPDATE       NEW  UPDATE          NEW
```

| 测试           | 更新                     | 新 change                      |
| -------------- | ------------------------ | ------------------------------ |
| **Identity**   | "同一件事，只是精炼"     | "不同的工作"                   |
| **Scope 重叠** | 重叠 >50%                | 重叠 <50%                      |
| **完成度**     | 没有这些改动就无法"完成" | 能完成原始工作，新工作独立存在 |
| **Story**      | 更新链能讲出连贯的故事   | 打补丁会让人更困惑而非更清晰   |

### 原则 {#opsx-27}

> **更新保留 context，新 change 提供清晰度。**
>
> 当你思考的历史有价值时，选择更新。
> 当重新开始比打补丁更清晰时，选择新建。

可以把它想成 git 分支：

- 在做同一个功能时持续提交
- 当确实是新工作时，开一个新分支
- 有时先合并部分完成的功能，然后为第二阶段重新开始

## 有哪些不同？ {#opsx-28}

|              | 旧版（`/openspec:proposal`）         | OPSX（`/opsx:*`）                |
| ------------ | ------------------------------------ | -------------------------------- |
| **结构**     | 一份大的 proposal 文档               | 带依赖关系的离散 artifact        |
| **Workflow** | 线性阶段：plan → implement → archive | 流动的动作——任何时候做任何事     |
| **迭代**     | 回退很别扭                           | 随认知更新 artifact              |
| **自定义**   | 结构固定                             | Schema 驱动（自己定义 artifact） |

**关键洞见：** 工作不是线性的。OPSX 不再假装它是。

## 架构深入剖析 {#opsx-29}

本节解释 OPSX 在内部如何工作，以及它与旧版 workflow 的对比。
本节示例使用扩展命令集（`new`、`continue` 等）；默认的 `core` 用户可以把同样的流程映射为 `propose → apply → sync → archive`。

### 理念：阶段 vs 动作 {#vs}

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEGACY WORKFLOW                                      │
│                    (Phase-Locked, All-or-Nothing)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐             │
│   │   PLANNING   │ ───► │ IMPLEMENTING │ ───► │   ARCHIVING  │             │
│   │    PHASE     │      │    PHASE     │      │    PHASE     │             │
│   └──────────────┘      └──────────────┘      └──────────────┘             │
│         │                     │                     │                       │
│         ▼                     ▼                     ▼                       │
│   /openspec:proposal   /openspec:apply      /openspec:archive              │
│                                                                             │
│   • Creates ALL artifacts at once                                          │
│   • Can't go back to update specs during implementation                    │
│   • Phase gates enforce linear progression                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            OPSX WORKFLOW                                     │
│                      (Fluid Actions, Iterative)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              ┌────────────────────────────────────────────┐                 │
│              │           ACTIONS (not phases)             │                 │
│              │                                            │                 │
│              │   new ◄──► continue ◄──► apply ◄──► archive │                 │
│              │    │          │           │           │    │                 │
│              │    └──────────┴───────────┴───────────┘    │                 │
│              │              any order                     │                 │
│              └────────────────────────────────────────────┘                 │
│                                                                             │
│   • Create artifacts one at a time OR fast-forward                         │
│   • Update specs/design/tasks during implementation                        │
│   • Dependencies enable progress, phases don't exist                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 组件架构 {#opsx-31}

**旧版 workflow** 在 TypeScript 中使用硬编码的模板：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LEGACY WORKFLOW COMPONENTS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Hardcoded Templates (TypeScript strings)                                  │
│                    │                                                        │
│                    ▼                                                        │
│   Tool-specific configurators/adapters                                      │
│                    │                                                        │
│                    ▼                                                        │
│   Generated Command Files (.claude/commands/openspec/*.md)                  │
│                                                                             │
│   • Fixed structure, no artifact awareness                                  │
│   • Change requires code modification + rebuild                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**OPSX** 使用外部 schema 和一个依赖图引擎：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPSX COMPONENTS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Schema Definitions (YAML)                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  name: spec-driven                                                  │   │
│   │  artifacts:                                                         │   │
│   │    - id: proposal                                                   │   │
│   │      generates: proposal.md                                         │   │
│   │      requires: []              ◄── Dependencies                     │   │
│   │    - id: specs                                                      │   │
│   │      generates: specs/**/*.md  ◄── Glob patterns                    │   │
│   │      requires: [proposal]      ◄── Enables after proposal           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                    │                                                        │
│                    ▼                                                        │
│   Artifact Graph Engine                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  • Topological sort (dependency ordering)                           │   │
│   │  • State detection (filesystem existence)                           │   │
│   │  • Rich instruction generation (templates + context)                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                    │                                                        │
│                    ▼                                                        │
│   Skill Files (.claude/skills/openspec-*/SKILL.md)                          │
│                                                                             │
│   • Cross-editor compatible (Claude Code, Cursor, Devin)                    │
│   • Skills query CLI for structured data                                    │
│   • Fully customizable via schema files                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 依赖图模型 {#opsx-32}

Artifact 构成有向无环图（DAG）。依赖是**使能者**，不是闸门：

```
                              proposal
                             (root node)
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
                 specs                       design
              (requires:                  (requires:
               proposal)                   proposal)
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                               tasks
                           (requires:
                           specs, design)
                                  │
                                  ▼
                          ┌──────────────┐
                          │ APPLY PHASE  │
                          │ (requires:   │
                          │  tasks)      │
                          └──────────────┘
```

**状态转移：**

```
   BLOCKED ────────────────► READY ────────────────► DONE
      │                        │                       │
   Missing                  All deps               File exists
   dependencies             are DONE               on filesystem
```

### 信息流 {#opsx-33}

**旧版 workflow** ——agent 收到的是静态指令：

```
  User: "/openspec:proposal"
           │
           ▼
  ┌─────────────────────────────────────────┐
  │  Static instructions:                   │
  │  • Create proposal.md                   │
  │  • Create tasks.md                      │
  │  • Create design.md                     │
  │  • Create delta spec files              │
  │                                         │
  │  No awareness of what exists or         │
  │  dependencies between artifacts         │
  └─────────────────────────────────────────┘
           │
           ▼
  Agent creates ALL artifacts in one go
```

**OPSX** ——agent 查询丰富的 context：

```
  User: "/opsx:continue"
           │
           ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Step 1: Query current state                                             │
  │  ┌────────────────────────────────────────────────────────────────────┐  │
  │  │  $ openspec status --change "add-auth" --json                      │  │
  │  │                                                                    │  │
  │  │  {                                                                 │  │
  │  │    "artifacts": [                                                  │  │
  │  │      {"id": "proposal", "status": "done"},                         │  │
  │  │      {"id": "specs", "status": "ready"},      ◄── First ready      │  │
  │  │      {"id": "design", "status": "ready"},                          │  │
  │  │      {"id": "tasks", "status": "blocked",                          │  │
  │  │       "missingDeps": ["specs", "design"]}                          │  │
  │  │    ]                                                               │  │
  │  │  }                                                                 │  │
  │  └────────────────────────────────────────────────────────────────────┘  │
  │                                                                          │
  │  Step 2: Get rich instructions for ready artifact                        │
  │  ┌────────────────────────────────────────────────────────────────────┐  │
  │  │  $ openspec instructions specs --change "add-auth" --json          │  │
  │  │                                                                    │  │
  │  │  {                                                                 │  │
  │  │    "template": "# Specification\n\n## ADDED Requirements...",      │  │
  │  │    "dependencies": [{"id": "proposal", "path": "...", "done": true}│  │
  │  │    "unlocks": ["tasks"]                                            │  │
  │  │  }                                                                 │  │
  │  └────────────────────────────────────────────────────────────────────┘  │
  │                                                                          │
  │  Step 3: Read dependencies → Create ONE artifact → Show what's unlocked  │
  └──────────────────────────────────────────────────────────────────────────┘
```

### 迭代模型 {#opsx-34}

**旧版 workflow** ——迭代很别扭：

```
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │/proposal│ ──► │ /apply  │ ──► │/archive │
  └─────────┘     └─────────┘     └─────────┘
       │               │
       │               ├── "Wait, the design is wrong"
       │               │
       │               ├── Options:
       │               │   • Edit files manually (breaks context)
       │               │   • Abandon and start over
       │               │   • Push through and fix later
       │               │
       │               └── No official "go back" mechanism
       │
       └── Creates ALL artifacts at once
```

**OPSX** ——自然的迭代：

```
  /opsx:new ───► /opsx:continue ───► /opsx:apply ───► /opsx:archive
      │                │                  │
      │                │                  ├── "The design is wrong"
      │                │                  │
      │                │                  ▼
      │                │            Just edit design.md
      │                │            and continue!
      │                │                  │
      │                │                  ▼
      │                │         /opsx:apply picks up
      │                │         where you left off
      │                │
      │                └── Creates ONE artifact, shows what's unlocked
      │
      └── Scaffolds change, waits for direction
```

### 自定义 Schema {#schema}

使用 schema 管理命令创建自定义 workflow：

```bash
# Create a new schema from scratch (interactive)
openspec schema init my-workflow

# Or fork an existing schema as a starting point
openspec schema fork spec-driven my-workflow

# Validate your schema structure
openspec schema validate my-workflow

# See where a schema resolves from (useful for debugging)
openspec schema which my-workflow
```

Schema 存放在 `openspec/schemas/`（项目本地、纳入版本控制）或 `~/.local/share/openspec/schemas/`（用户全局）。

**Schema 结构：**

```
openspec/schemas/research-first/
├── schema.yaml
└── templates/
    ├── research.md
    ├── proposal.md
    └── tasks.md
```

**示例 schema.yaml：**

```yaml
name: research-first
artifacts:
  - id: research # Added before proposal
    generates: research.md
    requires: []

  - id: proposal
    generates: proposal.md
    requires: [research] # Now depends on research

  - id: tasks
    generates: tasks.md
    requires: [proposal]
```

**依赖图：**

```
   research ──► proposal ──► tasks
```

### 小结 {#opsx-36}

| 方面           | 旧版                              | OPSX                 |
| -------------- | --------------------------------- | -------------------- |
| **模板**       | 硬编码在 TypeScript 中            | 外部 YAML + Markdown |
| **依赖**       | 无（一次性全部创建）              | 带拓扑排序的 DAG     |
| **状态**       | 基于阶段的心智模型                | 文件系统存在性       |
| **自定义**     | 改源码、重新构建                  | 创建 schema.yaml     |
| **迭代**       | 阶段锁定                          | 流动式，什么都能改   |
| **编辑器支持** | 各工具专用的 configurator/adapter | 单一 skills 目录     |

## Schemas {#schemas}

Schema 定义存在哪些 artifact 以及它们之间的依赖关系。当前可用：

- **spec-driven**（默认）：proposal → specs → design → tasks

```bash
# List available schemas
openspec schemas

# See all schemas with their resolution sources
openspec schema which --all

# Create a new schema interactively
openspec schema init my-workflow

# Fork an existing schema for customization
openspec schema fork spec-driven my-workflow

# Validate schema structure before use
openspec schema validate my-workflow
```

## 提示 {#opsx-38}

- 在投入一个 change 之前，用 `/opsx:explore` 把想法理清楚
- 明确知道要什么时用 `/opsx:ff`，探索过程中用 `/opsx:continue`
- 在 `/opsx:apply` 期间，如果发现哪里不对——就去修那个 artifact，然后继续
- Task 通过 `tasks.md` 中的复选框跟踪进度
- 任何时候都可以查看状态：`openspec status --change "name"`

## 反馈 {#opsx-39}

这东西还很粗糙。这是有意为之——我们正在摸索什么方法有效。

发现了 bug？有想法？来 [Discord](https://discord.gg/YctCnvvshC) 找我们，或在 [GitHub](https://github.com/Fission-AI/openspec/issues) 上开一个 issue。
