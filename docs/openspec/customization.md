# 定制 {#customization-1}

OpenSpec 提供三个层级的定制：

| 层级              | 作用                           | 最适合         |
| ----------------- | ------------------------------ | -------------- |
| **项目配置**      | 设置默认值、注入 context/rules | 大多数团队     |
| **自定义 Schema** | 定义你自己的 workflow artifact | 流程独特的团队 |
| **全局覆盖**      | 在所有项目间共享 schema        | 高级用户       |

---

## 项目配置 {#project-configuration}

`openspec/config.yaml` 文件是为团队定制 OpenSpec 最简便的方式。它让你可以：

- **设置默认 schema**——无需在每条命令上都写 `--schema`
- **注入项目 context**——AI 能看到你的技术栈、约定等
- **添加按 artifact 的 rules**——针对特定 artifact 的自定义规则
- **添加按操作的 guidance**——为 apply 和 archive 工作提供建议性偏好

### 快速设置 {#customization-3}

```bash
openspec init
```

这条命令会以交互方式引导你创建配置。你也可以手动创建一份：

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js, PostgreSQL
  API style: RESTful, documented in docs/api.md
  Testing: Jest + React Testing Library
  We value backwards compatibility for all public APIs

rules:
  proposal:
    - Include rollback plan
    - Identify affected teams
  specs:
    - Use Given/When/Then format
    - Reference existing patterns before inventing new ones

operations:
  apply:
    guidance:
      - Run focused tests before the full suite
  archive:
    guidance:
      - Keep the completion summary concise
```

### 工作原理 {#customization-4}

**默认 schema：**

```bash
# Without config
openspec new change my-feature --schema spec-driven

# With config - schema is automatic
openspec new change my-feature
```

**context 与 rules 注入：**

生成任何 artifact 时，你的 context 和 rules 都会被注入 AI 提示词：

```xml
<context>
Tech stack: TypeScript, React, Node.js, PostgreSQL
...
</context>

<rules>
- Include rollback plan
- Identify affected teams
</rules>

<template>
[Schema's built-in template]
</template>
```

- **Context** 出现在所有 artifact 中
- **Rules** 仅出现在与之匹配的 artifact 中

**操作 guidance：**

`operations.apply.guidance` 和 `operations.archive.guidance` 都是可选数组，
包含关于 agent 应如何执行这些操作的指导性说明。它们与 `rules` 相互独立：
操作 guidance 不约束 artifact 的内容，artifact rules 也绝不会被重新标记为
操作 guidance。

Apply 和 archive 会在执行时获取这些输入：

```bash
openspec instructions apply --change my-feature --json
openspec instructions archive --change my-feature --json
```

这两种接口面都会返回当前项目的 `context` 以及匹配的
`operationGuidance`，各自作为独立的可选字段。每次调用都从解析后的根目录读取
最新快照。当指定 `--store <id>` 时，change、context 和 guidance 均来自该
store 而非当前仓库。archive 指令命令是只读的：它不会检查或合并 delta
specs、不会写入主 specs、不会移动 change，也不会运行静态 archive workflow。

项目 context 是提示词层面必需的输入。生成的工作流会读取它，并应用相关的项目
事实、约定和约束。操作 guidance 是可选的附加建议：工作流会考虑每一条条目，
并遵循那些适用且与内置 workflow 兼容的条目。

这两个字段始终与 CLI 控制的状态、解析后的路径、内置步骤、显式用户选择以及
artifact rules 保持分离。工作流在保留控制值的同时报告 context 冲突。它不会
遵循不适用或冲突的 guidance，并会说明原因。这两个字段都不是可强制执行的检查，
工作流也不会把它们的文本复制进实现文件、specs、change artifacts 或摘要中，
除非用户另行要求该内容。

**Archive 与 spec 同步的输入安全性：**

Archive、批量 archive 和独立同步使用 `openspec status --json` 中的
`artifactPaths.specs.existingOutputPaths` 作为唯一的 delta spec 来源。没有
`specs` artifact 的 schema，或其具体输出列表为空的 change，没有任何内容需要
同步；其他 artifact 不会用于推断 delta specs。

在语义合并写入主 spec 之前，workflow 会消费当前的
`openspec instructions specs --change <name> --json` 输出。返回的
`specs` rules 只约束由该次合并产生的主 specs。单次 archive
会把该快照传入内联同步，独立同步则直接获取该快照，而
批量 archive 会在首次写入 spec 之前获取所有必需的快照。archive/specs 指令
响应返回非零或 JSON 无效即属于查找失败，而不是空输入：workflow 会在受影响的
spec 写入或 change 移动之前停止（对于批量 archive，则在任何批量写入或移动之前）。

此配置不会改变 archive 的执行阶段、用户提示、文件系统操作、语义合并的归属、
直接调用 `openspec archive` 命令，也不会改变 artifact `rules` 的结构与输出。

### Schema 解析顺序 {#schema}

当 OpenSpec 需要 schema 时，会按以下顺序检查：

1. CLI 标志：`--schema <name>`
2. Change 元数据（change 文件夹中的 `.openspec.yaml`）
3. 项目配置（`openspec/config.yaml`）
4. 默认值（`spec-driven`）

---

## 自定义 Schema {#custom-schemas}

当项目配置不够用时，就创建一个拥有完全自定义 workflow 的 schema。自定义 schema 存放在你项目的 `openspec/schemas/` 目录中，并随代码一起纳入版本控制。

```text
your-project/
├── openspec/
│   ├── config.yaml        # Project config
│   ├── schemas/           # Custom schemas live here
│   │   └── my-workflow/
│   │       ├── schema.yaml
│   │       └── templates/
│   └── changes/           # Your changes
└── src/
```

### Fork 现有 Schema {#fork-schema}

最快的定制方式是对内置 schema 执行 fork：

```bash
openspec schema fork spec-driven my-workflow
```

该命令会把整个 `spec-driven` schema 复制到 `openspec/schemas/my-workflow/`，你可以在那里自由编辑。

**你会得到：**

```text
openspec/schemas/my-workflow/
├── schema.yaml           # Workflow definition
└── templates/
    ├── proposal.md       # Template for proposal artifact
    ├── spec.md           # Template for specs
    ├── design.md         # Template for design
    └── tasks.md          # Template for tasks
```

现在编辑 `schema.yaml` 来改变 workflow，或编辑 templates 来改变 AI 生成的内容。

### 从零创建 Schema {#schema-2}

如果需要完全全新的 workflow：

```bash
# Interactive
openspec schema init research-first

# Non-interactive
openspec schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

### Schema 结构 {#schema-3}

schema 定义 workflow 中的 artifacts 以及它们相互依赖的方式：

```yaml
# openspec/schemas/my-workflow/schema.yaml
name: my-workflow
version: 1
description: My team's custom workflow

artifacts:
  - id: proposal
    generates: proposal.md
    description: Initial proposal document
    template: proposal.md
    instruction: |
      Create a proposal that explains WHY this change is needed.
      Focus on the problem, not the solution.
    requires: []

  - id: design
    generates: design.md
    description: Technical design
    template: design.md
    instruction: |
      Create a design document explaining HOW to implement.
    requires:
      - proposal # Can't create design until proposal exists

  - id: tasks
    generates: tasks.md
    description: Implementation checklist
    template: tasks.md
    requires:
      - design

apply:
  requires: [tasks]
  tracks: tasks.md
```

**关键字段：**

| 字段          | 用途                                         |
| ------------- | -------------------------------------------- |
| `id`          | 唯一标识符，用于命令和 rules 中              |
| `generates`   | 输出文件名（支持 `specs/**/*.md` 这类 glob） |
| `template`    | `templates/` 目录中的模板文件                |
| `instruction` | 用于创建该 artifact 的 AI 指令               |
| `requires`    | 依赖关系——哪些 artifacts 必须先存在          |

按你希望写入的顺序列出 artifacts。`requires` 决定什么是可行的；当多个
artifacts 同时就绪时，`artifacts:` 列表的顺序决定哪个先来。

### Templates {#templates}

Templates 是引导 AI 的 markdown 文件。创建对应 artifact 时，它们会被注入提示词。

```markdown
<!-- templates/proposal.md -->

## Why

<!-- Explain the motivation for this change. What problem does this solve? -->

## What Changes

<!-- Describe what will change. Be specific about new capabilities or modifications. -->

## Impact

<!-- Affected code, APIs, dependencies, systems -->
```

Templates 可以包含：

- 供 AI 填写的章节标题
- 带有给 AI 指导的 HTML 注释
- 展示预期结构的示例格式

### 校验你的 Schema {#schema-4}

使用自定义 schema 之前，先校验它：

```bash
openspec schema validate my-workflow
```

这会检查：

- `schema.yaml` 语法是否正确
- 所有引用的模板是否存在
- 是否存在循环依赖
- Artifact ID 是否有效

### 使用自定义 Schema {#schema-5}

创建之后，通过以下方式使用你的 schema：

```bash
# Specify on command
openspec new change feature --schema my-workflow

# Or set as default in config.yaml
schema: my-workflow
```

### 调试 Schema 解析 {#schema-6}

不确定当前使用的是哪个 schema？用以下命令查看：

```bash
# See where a specific schema resolves from
openspec schema which my-workflow

# List all available schemas
openspec schema which --all
```

输出会显示它来自你的项目、用户目录还是包内：

```text
Schema: my-workflow
Source: project
Path: /path/to/project/openspec/schemas/my-workflow
```

---

> **注意：** OpenSpec 还支持位于 `~/.local/share/openspec/schemas/` 的用户级 schema，以便跨项目共享；但推荐使用 `openspec/schemas/` 中的项目级 schema，因为它们会随你的代码纳入版本控制。

---

## 示例 {#customization-14}

### 快速迭代 Workflow {#workflow}

用于快速迭代的最小 workflow：

```yaml
# openspec/schemas/rapid/schema.yaml
name: rapid
version: 1
description: Fast iteration with minimal overhead

artifacts:
  - id: proposal
    generates: proposal.md
    description: Quick proposal
    template: proposal.md
    instruction: |
      Create a brief proposal for this change.
      Focus on what and why, skip detailed specs.
    requires: []

  - id: tasks
    generates: tasks.md
    description: Implementation checklist
    template: tasks.md
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

### 添加 Review Artifact {#review-artifact}

Fork 默认 schema 并添加一个 review 步骤：

```bash
openspec schema fork spec-driven with-review
```

然后编辑 `schema.yaml`，添加：

```yaml
- id: review
  generates: review.md
  description: Pre-implementation review checklist
  template: review.md
  instruction: |
    Create a review checklist based on the design.
    Include security, performance, and testing considerations.
  requires:
    - design

- id: tasks
  # ... existing tasks config ...
  requires:
    - specs
    - design
    - review # Now tasks require review too
```

---

## 社区 Schema {#schema-7}

OpenSpec 还支持通过独立仓库分发的社区维护 schema。这些 schema 提供有明确主张的 workflow，将 OpenSpec 与其他工具或系统集成，类似于 [github/spec-kit's community extension catalog](https://github.com/github/spec-kit/tree/main/extensions) 为 spec-kit 所起的作用。

社区 schema 不会内置（vendored）到 OpenSpec 核心中——它们位于各自仓库，拥有各自独立的发布节奏。要使用其中一个，请把 schema 包复制到你项目的 `openspec/schemas/<schema-name>/` 目录（每个仓库的 README 都有安装说明）。

| Schema               | 维护者          | 仓库                                                                                                                                 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intent-driven`      | @harikrishnan83 | [intent-driven-dev/openspec-schemas](https://github.com/intent-driven-dev/openspec-schemas/tree/main/openspec/schemas/intent-driven) | 在实现之前捕获 change 意图、可观察行为、技术设计和持久的架构决策。新增 change 局部的 ADR 评审清单，并将符合条件的长久决策写为不可变、可被取代的 ADR。                                                                                                                                                                                                                                                                                                                                                               |
| `superpowers-bridge` | @JiangWay       | [JiangWay/openspec-schemas](https://github.com/JiangWay/openspec-schemas/tree/main/superpowers-bridge)                               | 将 OpenSpec 的 artifact 治理与 [obra/superpowers](https://github.com/obra/superpowers) 执行 skills（头脑风暴、编写计划、通过子代理进行 TDD、代码评审、收尾）集成。新增 evidence-first（证据优先）的 `retrospective` artifact，填补 Superpowers 原生未覆盖的空白。                                                                                                                                                                                                                                                   |
| `nanopm`             | @nmrtn          | [nmrtn/nanopm](https://github.com/nmrtn/nanopm/tree/main/openspec-schema)                                                            | PM 优先的 workflow。在实现的上游运行 [nanopm](https://github.com/nmrtn/nanopm) 的规划流水线（audit → strategy → roadmap → PRD）。将产品规划桥接到 OpenSpec 的 spec 驱动工程 workflow。若存在 `.nanopm/`，artifacts 会从中读取——proposal 取材于 audit，design 取材于 strategy，tasks 取材于 PRD 拆解。                                                                                                                                                                                                               |
| `e2e-runbooks`       | @Lukk17         | [Lukk17/openspec-schemas](https://github.com/Lukk17/openspec-schemas/tree/master/openspec/schemas/e2e-runbooks)                      | capability 级别的端到端测试 runbook。每个 capability 得到一份不可变 spec、一份不可变 tasks-template，以及每次执行一份带时间戳的运行记录。断言只针对可观察行为（HTTP status、响应 body、持久化状态——绝不使用日志子串）；每次运行记录 UTC 起止时间、耗时以及最佳估算的 LLM token 消耗。                                                                                                                                                                                                                               |
| `anvil`              | @jikkujoyce     | [jikkujoyce/openspec-schemas](https://github.com/jikkujoyce/openspec-schemas/tree/main/schemas/anvil)                                | 带有 TDD 纪律和对抗式评审步骤的 spec 驱动 workflow。流程：`proposal` → `specs` → `design` → `review` → `test-plan` → `tasks` → `apply` → `verify`。`review` 由具备全新上下文的只读评审者撰写（在可用时使用第二个模型），并输出一行 `VERDICT:`，告知 agent 对 `test-plan`、`tasks` 和 `apply` 设卡；OpenSpec 只检查 artifacts 是否存在，因此需用你自己的 CI 或 hook 来强制执行该关卡。`test-plan` 将每个 spec scenario 映射到一个具名测试，并兼作由 `verify` 审计的红/绿台账。                                       |
| `ml-research`        | @tsenst         | [idealo/openspec-schemas](https://github.com/idealo/openspec-schemas/tree/main/openspec/schemas/ml-research)                         | 机器学习实验 workflow。流程：`proposal` → `design` → `evaluation` → `tasks` → `apply` → `specs`。`evaluation` 在运行之前固定指标、成功标准和证伪条件；`apply` 写入 `results.md`；`specs` 只记录有证据支撑的发现（包括被否证的假设），形式为带关联 `Evidence:` 块的 `Finding:` requirements。                                                                                                                                                                                                                        |
| `epic-driven`        | @ivanferic      | [IvanFeric/openspec-epic-driven](https://github.com/IvanFeric/openspec-epic-driven/tree/main/openspec/schemas/epic-driven)           | Epic 驱动的 workflow。流程：`explore`（可选）→ `epic-propose` → `epic-next` 选择一个子 story → 子 `apply` → 子 `archive` → `epic-sync`。epic 没有 `apply` 阶段，且仅在其 stories 全部完成后才归档。`epic-propose` 创建愿景、stories 和 roadmap；`epic-next` 推荐一个子 story，`epic-next <story> start` 将子级规划委托给常规的 `openspec-propose` workflow；`epic-status` 显示 epic 中所有 stories 的当前状态；`epic-replan` 可以在保留当前活动或已完成 stories 的同时更改计划；`epic-sync` 更新 story 完成指示器。 |

> 想贡献社区 schema？打开一个 issue，附上你仓库的链接和一行描述，维护者就会添加对应行。

---

## 另见 {#customization-18}

- [CLI 参考：Schema 命令](cli.md#schema-commands) - 完整的命令文档
