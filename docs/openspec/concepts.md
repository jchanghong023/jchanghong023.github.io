# 概念 {#concepts-1}

本指南介绍 OpenSpec 背后的核心思想以及它们如何组合在一起。实际使用请参见[入门](getting-started.md)和[工作流](workflows.md)。

## 理念 {#concepts-2}

OpenSpec 围绕四项原则构建：

```
fluid not rigid         — no phase gates, work on what makes sense
iterative not waterfall — learn as you build, refine as you go
easy not complex        — lightweight setup, minimal ceremony
brownfield-first        — works with existing codebases, not just greenfield
```

### 这些原则为何重要 {#concepts-3}

**流动而非僵化。** 传统的 spec 系统会把你锁进各个阶段：先规划，再实现，然后就结束了。OpenSpec 更灵活——你可以按任何对你的工作有意义的顺序创建 artifact。

**迭代而非瀑布。** 需求会变。理解会加深。开始时看起来不错的方案，在看到代码库之后可能就站不住脚。OpenSpec 拥抱这一现实。

**简单而非复杂。** 有些 spec 框架要求大量初始化、僵化的格式或重量级流程。OpenSpec 不会挡你的路。几秒钟完成初始化，立即开始工作，只在需要时才定制。

**brownfield 优先。** 大多数软件工作不是从零构建——而是修改既有系统。OpenSpec 基于 delta 的方法让你可以轻松地为既有行为的变化编写 spec，而不只是描述新系统。

## 全景图 {#concepts-4}

OpenSpec 把你的工作组织到两个主要区域：

```
┌────────────────────────────────────────────────────────────────────┐
│                        openspec/                                   │
│                                                                    │
│   ┌─────────────────────┐      ┌───────────────────────────────┐   │
│   │       specs/        │      │         changes/              │   │
│   │                     │      │                               │   │
│   │  Source of truth    │◄─────│  Proposed modifications       │   │
│   │  How your system    │ merge│  Each change = one folder     │   │
│   │  currently works    │      │  Contains artifacts + deltas  │   │
│   │                     │      │                               │   │
│   └─────────────────────┘      └───────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Specs** 是事实来源（source of truth）——它们描述你的系统当前的行为方式。

**Changes** 是提议的修改——它们存放在独立的文件夹中，直到你准备好合并它们。

这种分离是关键。你可以并行处理多个 change 而不会冲突。你可以在 change 影响主 specs 之前先审查它。而当你归档一个 change 时，它的 delta 会干净地合并进事实来源。

## Specs {#specs}

Specs 使用结构化的 requirement 和 scenario 来描述系统的行为。

### 结构 {#concepts-6}

```
openspec/specs/
├── auth/
│   └── spec.md           # Authentication behavior
├── payments/
│   └── spec.md           # Payment processing
├── notifications/
│   └── spec.md           # Notification system
└── ui/
    └── spec.md           # UI behavior and themes
```

按 domain 组织 specs——即对你的系统有意义的逻辑分组。常见模式：

- **按功能领域**：`auth/`、`payments/`、`search/`
- **按组件**：`api/`、`frontend/`、`workers/`
- **按限界上下文**：`ordering/`、`fulfillment/`、`inventory/`

### Spec 格式 {#spec}

一个 spec 包含若干 requirement，每个 requirement 又有若干 scenario：

```markdown
# Auth Specification

## Purpose

Authentication and session management for the application.

## Requirements

### Requirement: User Authentication

The system SHALL issue a JWT token upon successful login.

#### Scenario: Valid credentials

- GIVEN a user with valid credentials
- WHEN the user submits login form
- THEN a JWT token is returned
- AND the user is redirected to dashboard

#### Scenario: Invalid credentials

- GIVEN invalid credentials
- WHEN the user submits login form
- THEN an error message is displayed
- AND no token is issued

### Requirement: Session Expiration

The system MUST expire sessions after 30 minutes of inactivity.

#### Scenario: Idle timeout

- GIVEN an authenticated session
- WHEN 30 minutes pass without activity
- THEN the session is invalidated
- AND the user must re-authenticate
```

**关键要素：**

| 要素               | 用途                                         |
| ------------------ | -------------------------------------------- |
| `## Purpose`       | 对此 spec 所属 domain 的高层描述             |
| `### Requirement:` | 系统必须具备的具体行为                       |
| `#### Scenario:`   | 该 requirement 在实际运行中的具体示例        |
| SHALL/MUST/SHOULD  | RFC 2119 关键字，表示 requirement 的强制程度 |

### 为何这样组织 Specs {#specs-2}

**Requirements 是“做什么”**——它们说明系统应当做什么，而不指定实现方式。

**Scenarios 是“何时”**——它们提供可被验证的具体示例。好的 scenario：

- 可测试（你能为它编写自动化测试）
- 同时覆盖正常路径与边界情况
- 使用 Given/When/Then 或类似的结构化格式

**RFC 2119 关键字**（SHALL、MUST、SHOULD、MAY）表达意图：

- **MUST/SHALL**——绝对要求
- **SHOULD**——建议，但存在例外
- **MAY**——可选

### Spec 是什么（以及不是什么） {#what-a-spec-is-and-is-not}

Spec 是**行为契约**，而不是实现计划。

好的 spec 内容：

- 用户或下游系统所依赖的可观察行为
- 输入、输出和错误条件
- 外部约束（安全性、隐私、可靠性、兼容性）
- 可被测试或被显式验证的 scenario

spec 中应避免：

- 内部的类/函数名
- 库或框架的选型
- 分步的实现细节
- 详细的执行计划（这些属于 `design.md` 或 `tasks.md`）

快速检验：

- 如果实现可以改变而不改变外部可见行为，那么它很可能不应写进 spec。

### 保持轻量：渐进式严谨 {#concepts-10}

OpenSpec 力求避免官僚流程。使用仍能让 change 可验证的最轻量级别。

**轻量 spec（默认）：**

- 简短、以行为为先的 requirement
- 清晰的范围与非目标
- 少量具体的验收检查

**完整 spec（用于较高风险）：**

- 跨团队或跨仓库的 change
- API/契约变更、迁移、安全/隐私问题
- 歧义很可能导致昂贵返工的 change

大多数 change 应当停留在轻量模式。

### 人类 + Agent 协作 {#agent}

在许多团队中，人类负责探索，agent 负责起草 artifact。预期的循环是：

1. 人类提供意图、上下文与约束。
2. Agent 将其转化为以行为为先的 requirement 与 scenario。
3. Agent 把实现细节留在 `design.md` 和 `tasks.md` 中，而不是 `spec.md`。
4. 在实现之前，通过校验确认结构与清晰度。

这样能让 spec 对人有可读性，对 agent 有一致性。

## Changes {#changes}

change 是对你的系统提出的一项修改，被打包成一个文件夹，其中包含理解与实现它所需的一切。

### Change 结构 {#change}

```
openspec/changes/add-dark-mode/
├── proposal.md           # Why and what
├── design.md             # How (technical approach)
├── tasks.md              # Implementation checklist
├── .openspec.yaml        # Change metadata (optional): schema, created, skip_specs, retire_capabilities, plus your own x-* keys
└── specs/                # Delta specs
    └── ui/
        └── spec.md       # What's changing in ui/spec.md
```

每个 change 都是自包含的。它包含：

- **Artifacts**——记录意图、设计与任务的文档
- **Delta specs**——说明要新增、修改或移除什么内容的规格
- **Metadata**——针对该特定 change 的可选配置

### 为何 Change 是文件夹 {#change-2}

把 change 打包为文件夹有几个好处：

1. **一切都在一处。** proposal、design、tasks 和 specs 都放在同一个地方。无需在不同位置间翻找。

2. **并行工作。** 多个 change 可以同时存在而不相互冲突。你可以在 `fix-auth-bug` 仍在进行的同时处理 `add-dark-mode`。

3. **干净的历史。** 归档时，change 会移动到 `changes/archive/`，并保留其完整上下文。你可以回溯理解不仅改了什么，而且为什么改。

4. **便于评审。** change 文件夹很容易评审——打开它，读 proposal，检查 design，查看 spec delta。

## Artifacts {#artifacts}

Artifact 是 change 内部用于指导工作的文档。

### Artifact 流程 {#artifact}

```
proposal ──────► specs ──────► design ──────► tasks ──────► implement
    │               │             │              │
   why            what           how          steps
 + scope        changes       approach      to take
```

Artifact 之间层层构建。每个 artifact 都为下一个提供上下文。

### Artifact 类型 {#artifact-2}

#### Proposal（`proposal.md`） {#proposalproposalmd}

proposal 在高层面上记录**意图**、**范围**和**方法**。

```markdown
# Proposal: Add Dark Mode

## Intent

Users have requested a dark mode option to reduce eye strain
during nighttime usage and match system preferences.

## Scope

In scope:

- Theme toggle in settings
- System preference detection
- Persist preference in localStorage

Out of scope:

- Custom color themes (future work)
- Per-page theme overrides

## Approach

Use CSS custom properties for theming with a React context
for state management. Detect system preference on first load,
allow manual override.
```

**何时更新 proposal：**

- 范围变化（收窄或扩大）
- 意图更清晰（对问题有了更好的理解）
- 方法发生根本性转变

#### Specs（`specs/` 中的 delta specs） {#specsspecs-delta-specs}

Delta specs 描述相对于当前 specs 而言**正在变化什么**。见下文 [Delta Specs](#delta-specs)。

#### Design（`design.md`） {#designdesignmd}

design 记录**技术方法**和**架构决策**。

````markdown
# Design: Add Dark Mode

## Technical Approach

Theme state managed via React Context to avoid prop drilling.
CSS custom properties enable runtime switching without class toggling.

## Architecture Decisions

### Decision: Context over Redux

Using React Context for theme state because:

- Simple binary state (light/dark)
- No complex state transitions
- Avoids adding Redux dependency

### Decision: CSS Custom Properties

Using CSS variables instead of CSS-in-JS because:

- Works with existing stylesheet
- No runtime overhead
- Browser-native solution

## Data Flow

```
ThemeProvider (context)
       │
       ▼
ThemeToggle ◄──► localStorage
       │
       ▼
CSS Variables (applied to :root)
```

## File Changes

- `src/contexts/ThemeContext.tsx` (new)
- `src/components/ThemeToggle.tsx` (new)
- `src/styles/globals.css` (modified)
````

**何时更新 design：**

- 实现过程中发现该方案行不通
- 发现了更好的解决方案
- 依赖或约束发生变化

#### Tasks（`tasks.md`） {#taskstasksmd}

Task 是**实现检查清单**——带复选框的具体步骤。

```markdown
# Tasks

## 1. Theme Infrastructure

- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence
- [ ] 1.4 Add system preference detection

## 2. UI Components

- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
- [ ] 2.3 Update Header to include quick toggle

## 3. Styling

- [ ] 3.1 Define dark theme color palette
- [ ] 3.2 Update components to use CSS variables
- [ ] 3.3 Test contrast ratios for accessibility
```

**Task 最佳实践：**

- 将相关 task 归组在标题之下
- 使用层级编号（1.1、1.2 等）
- 让每个 task 小到可以在一次会话内完成
- 说明每个 task 如何验证（一个测试、命令或可观察结果）
- 把每组工作所需的测试与文档放进该组内，而不是放到最后的收尾组
- 完成一个 task 就勾掉一个

## Delta Specs {#delta-specs}

Delta specs 是让 OpenSpec 适用于 brownfield 开发的关键概念。它们描述**正在变化什么**，而不是重述整个 spec。

### 格式 {#concepts-23}

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication

The system MUST support TOTP-based two-factor authentication.

#### Scenario: 2FA enrollment

- GIVEN a user without 2FA enabled
- WHEN the user enables 2FA in settings
- THEN a QR code is displayed for authenticator app setup
- AND the user must verify with a code before activation

#### Scenario: 2FA login

- GIVEN a user with 2FA enabled
- WHEN the user submits valid credentials
- THEN an OTP challenge is presented
- AND login completes only after valid OTP

## MODIFIED Requirements

### Requirement: Session Expiration

The system MUST expire sessions after 15 minutes of inactivity.
(Previously: 30 minutes)

#### Scenario: Idle timeout

- GIVEN an authenticated session
- WHEN 15 minutes pass without activity
- THEN the session is invalidated

## REMOVED Requirements

### Requirement: Remember Me

(Deprecated in favor of 2FA. Users should re-authenticate each session.)
```

### Delta 各章节 {#delta}

| 章节                       | 含义                       | 归档时会发生什么                                                                                                                 |
| -------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `## ADDED Requirements`    | 新增行为                   | 追加到主 spec                                                                                                                    |
| `## MODIFIED Requirements` | 变更的行为                 | 替换既有 requirement                                                                                                             |
| `## REMOVED Requirements`  | 弃用的行为                 | 从主 spec 中删除；当 change 声明 `retire_capabilities: true` 时，删除最后一个 requirement 会退役该 capability 并删除其 spec 文件 |
| `## Purpose`               | 一个全新 capability 的用途 | 作为正在创建的主 spec 的 Purpose 种子；若 spec 已存在则忽略                                                                      |

### 为何用 Delta 而不是完整 Spec {#delta-spec}

**清晰。** delta 精确展示正在变化什么。读一份完整 spec，你得在脑子里把它与当前版本做 diff。

**避免冲突。** 两个 change 可以触及同一个 spec 文件而不冲突，只要它们修改的是不同的 requirement。

**评审效率。** 评审者看到的是变化，而不是未变的上下文。聚焦于真正重要的东西。

**契合 brownfield。** 大多数工作是在修改既有行为。delta 让修改成为一等公民，而不是事后补充。

## Schemas {#schemas}

Schema 定义一个 workflow 的 artifact 类型及其依赖关系。

### Schema 如何工作 {#schema}

```yaml
# openspec/schemas/spec-driven/schema.yaml
name: spec-driven
artifacts:
  - id: proposal
    generates: proposal.md
    requires: [] # No dependencies, can create first

  - id: specs
    generates: specs/**/*.md
    requires: [proposal] # Needs proposal before creating

  - id: design
    generates: design.md
    requires: [proposal] # Can create in parallel with specs

  - id: tasks
    generates: tasks.md
    requires: [specs, design] # Needs both specs and design first
```

**Artifacts 构成一张依赖图：**

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
```

**依赖是使能条件，不是关卡。** 它们展示可以创建什么，而不是你必须接着创建什么。不需要 design 就可以跳过它。你可以在 design 之前或之后创建 specs——两者都只依赖 proposal。

### 内置 Schema {#schema-2}

**spec-driven**（默认）

spec 驱动开发的标准 workflow：

```
proposal → specs → design → tasks → implement
```

最适合：大多数希望在实现之前就 specs 达成一致的功能开发。

### 自定义 Schema {#schema-3}

为你的团队 workflow 创建自定义 schema：

```bash
# Create from scratch
openspec schema init research-first

# Or fork an existing one
openspec schema fork spec-driven research-first
```

**自定义 schema 示例：**

```yaml
# openspec/schemas/research-first/schema.yaml
name: research-first
artifacts:
  - id: research
    generates: research.md
    requires: [] # Do research first

  - id: proposal
    generates: proposal.md
    requires: [research] # Proposal informed by research

  - id: tasks
    generates: tasks.md
    requires: [proposal] # Skip specs/design, go straight to tasks
```

创建与使用自定义 schema 的完整细节，请参见[定制](customization.md)。

## Archive {#archive}

归档（archive）通过把 change 的 delta specs 合并到主 specs 中来完成该 change，并保留该 change 作为历史。

### 归档时会发生什么 {#concepts-31}

```
Before archive:

openspec/
├── specs/
│   └── auth/
│       └── spec.md ◄────────────────┐
└── changes/                         │
    └── add-2fa/                     │
        ├── proposal.md              │
        ├── design.md                │ merge
        ├── tasks.md                 │
        └── specs/                   │
            └── auth/                │
                └── spec.md ─────────┘


After archive:

openspec/
├── specs/
│   └── auth/
│       └── spec.md        # Now includes 2FA requirements
└── changes/
    └── archive/
        └── 2025-01-24-add-2fa/    # Preserved for history
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── specs/
                └── auth/
                    └── spec.md
```

### 归档流程 {#concepts-32}

1. **合并 delta。** 每个 delta spec 章节（ADDED/MODIFIED/REMOVED）都应用到对应的主 spec 上。

2. **移动到归档。** change 文件夹移动到 `changes/archive/`，并加上日期前缀以便按时间排序。

3. **保留上下文。** 所有 artifact 在归档中保持完整。你随时可以回溯理解某个 change 为何被做出。

### 归档为何重要 {#concepts-33}

**干净的状态。** 活跃的 changes（`changes/`）只显示进行中的工作。已完成的工作会移走。

**审计轨迹。** 归档保存每个 change 的完整上下文——不仅是改了什么，还有解释原因的 proposal、解释方式的 design，以及展示已完成工作的 tasks。

**Spec 演进。** 随着 change 被归档，specs 有机地成长。每次归档都会合并它的 delta，随时间累积出一份全面的规格。

## 各部分如何协同 {#concepts-34}

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              OPENSPEC FLOW                                   │
│                                                                              │
│   ┌────────────────┐                                                         │
│   │  1. START      │  /opsx:propose (core) or /opsx:new (expanded)           │
│   │     CHANGE     │                                                         │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  2. CREATE     │  /opsx:ff or /opsx:continue (expanded workflow)         │
│   │     ARTIFACTS  │  Creates proposal → specs → design → tasks              │
│   │                │  (based on schema dependencies)                         │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  3. IMPLEMENT  │  /opsx:apply                                            │
│   │     TASKS      │  Work through tasks, checking them off                  │
│   │                │◄──── Update artifacts as you learn                      │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  4. VERIFY     │  /opsx:verify (optional)                                │
│   │     WORK       │  Check implementation matches specs                     │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐     ┌──────────────────────────────────────────────┐    │
│   │  5. ARCHIVE    │────►│  Delta specs merge into main specs           │    │
│   │     CHANGE     │     │  Change folder moves to archive/             │    │
│   └────────────────┘     │  Specs are now the updated source of truth   │    │
│                          └──────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**良性循环：**

1. Specs 描述当前行为
2. Changes 提出修改（以 delta 形式）
3. 实现让这些 change 真正落地
4. 归档把 delta 合并进 specs
5. Specs 现在描述新的行为
6. 下一个 change 建立在更新后的 specs 之上

## 术语表 {#concepts-35}

| 术语                | 定义                                                          |
| ------------------- | ------------------------------------------------------------- |
| **Artifact**        | change 内的一份文档（proposal、design、tasks 或 delta specs） |
| **Archive**         | 完成一个 change 并将其 delta 合并进主 specs 的过程            |
| **Change**          | 对系统提出的一项修改，以包含 artifact 的文件夹形式打包        |
| **Delta spec**      | 相对于当前 specs 描述变化（ADDED/MODIFIED/REMOVED）的 spec    |
| **Domain**          | spec 的逻辑分组（例如 `auth/`、`payments/`）                  |
| **Requirement**     | 系统必须具备的具体行为                                        |
| **Scenario**        | requirement 的具体示例，通常采用 Given/When/Then 格式         |
| **Schema**          | 对 artifact 类型及其依赖关系的定义                            |
| **Spec**            | 描述系统行为的规格，包含 requirement 与 scenario              |
| **Source of truth** | `openspec/specs/` 目录，包含当前已达成的共识行为              |

## 后续步骤 {#concepts-36}

- [入门](getting-started.md) - 实际的第一步
- [工作流](workflows.md) - 常见模式以及各自适用场景
- [命令](commands.md) - 完整命令参考
- [定制](customization.md) - 创建自定义 schema 并配置你的项目
