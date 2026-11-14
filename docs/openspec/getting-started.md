# 快速开始 {#getting-started-1}

本指南介绍 OpenSpec 在安装并初始化之后如何运作。安装说明请参阅[主 README](index.md)或[安装指南](installation.md)。初次接触整套文档？[文档首页](index.md)梳理了全部内容。

> **这些命令该在哪里输入？** 有两个地方，混淆它们是最常见的早期失误。
>
> - `openspec ...` 命令（例如 `openspec init`）在**终端**中运行。
> - `/opsx:...` 命令（例如 `/opsx:propose`）在**AI 助手的聊天窗口**中运行，也就是你平时让它写代码的那个输入框。
>
> 不存在需要另行启动的“交互模式”。你只需在聊天中输入斜杠命令，助手会接管后续工作。完整说明见[命令如何工作](how-commands-work.md)。

## 最初五分钟 {#getting-started-2}

整个循环如下，每一步都标注了它发生的位置：

```text
TERMINAL   $ npm install -g @fission-ai/openspec@latest
TERMINAL   $ cd your-project && openspec init
AI CHAT      /opsx:explore                    (optional: think it through first)
AI CHAT      /opsx:propose add-dark-mode      (AI drafts the plan; you review it)
AI CHAT      /opsx:apply                      (AI builds it)
AI CHAT      /opsx:archive                    (specs updated, change filed away)
```

两个终端步骤完成设置，之后你就在聊天中工作。（Windows、npm 以及其他安装方式见[安装](installation.md)。）本指南的其余部分将逐一展开说明每个步骤做什么，以及你会看到什么。

**不想自己动手做终端那部分？** 把[设置提示词](installation.md#install-with-your-ai-assistant)粘贴给你的助手，它就会处理这两行命令，然后汇报它创建了什么。

> **还不确定要构建什么？从 `/opsx:explore` 开始。** 这是一个没有风险的思考伙伴，它会阅读你的代码库、权衡各种选项，把模糊的想法打磨成具体的计划，而这一切都发生在写任何代码之前。当图景清晰后，它会移交给 `/opsx:propose`。这是与 AI 协作时最值得养成的习惯，否则 AI 会自信满满地造出错误的东西。请参阅[探索指南](explore.md)。

## 工作原理 {#getting-started-3}

OpenSpec 帮助你和你的 AI 编程助手在写任何代码之前就构建内容达成一致。

**默认快速路径（core profile）：**

```text
/opsx:explore ──► /opsx:propose ──► /opsx:apply ──► /opsx:sync ──► /opsx:archive
   (optional)
```

当你在琢磨要做什么时，从 `/opsx:explore` 开始；当你已经清楚时，直接跳到 `/opsx:propose`。Explore 位于默认 profile 中，因此它始终在你需要时可用。

**扩展路径（自定义 workflow 选择）：**

```text
/opsx:new ──► /opsx:ff or /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

默认的全局 profile 是 `core`，其中包含 `propose`、`explore`、`apply`、`update`、`sync` 和 `archive`。你可以通过 `openspec config profile` 再执行 `openspec update` 来启用扩展的 workflow 命令。

## OpenSpec 会创建什么 {#openspec}

运行 `openspec init` 之后，你的项目会拥有如下结构：

```
openspec/
├── specs/              # Source of truth (your system's behavior)
│   └── <domain>/
│       └── spec.md
├── changes/            # Proposed updates (one folder per change)
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # Delta specs (what's changing)
│           └── <domain>/
│               └── spec.md
└── config.yaml         # Project configuration (optional)
```

**两个关键目录：**

- **`specs/`** - 事实来源。这些 spec 描述你的系统当前的行为。按 domain 组织（例如 `specs/auth/`、`specs/payments/`）。

- **`changes/`** - 提议的修改。每个 change 都有自己的文件夹，包含所有相关 artifact。当 change 完成后，它的 spec 会合并进主 `specs/` 目录。

## 理解 Artifact {#artifact}

每个 change 文件夹都包含指导工作的 artifact：

| Artifact      | 用途                                                  |
| ------------- | ----------------------------------------------------- |
| `proposal.md` | “为什么”和“做什么”——记录意图、范围与方法              |
| `specs/`      | 展示 ADDED/MODIFIED/REMOVED requirement 的 delta spec |
| `design.md`   | “怎么做”——技术方案与架构决策                          |
| `tasks.md`    | 带复选框的实现清单                                    |

**Artifact 之间层层构建：**

```
proposal ──► specs ──► design ──► tasks ──► implement
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            update as you learn
```

随着实现过程中了解的深入，你随时可以回过头来改进更早的 artifact。

## Delta Spec 如何工作 {#delta-spec}

Delta spec 是 OpenSpec 中的核心概念。它们展示相对于当前 spec 正在发生的变化。

### 格式 {#getting-started-7}

Delta spec 使用分节来表明 change 的类型：

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication

The system MUST require a second factor during login.

#### Scenario: OTP required

- GIVEN a user with 2FA enabled
- WHEN the user submits valid credentials
- THEN an OTP challenge is presented

## MODIFIED Requirements

### Requirement: Session Timeout

The system SHALL expire sessions after 30 minutes of inactivity.
(Previously: 60 minutes)

#### Scenario: Idle timeout

- GIVEN an authenticated session
- WHEN 30 minutes pass without activity
- THEN the session is invalidated

## REMOVED Requirements

### Requirement: Remember Me

(Deprecated in favor of 2FA)
```

### Archive 时会发生什么 {#archive}

当你 archive 一个 change 时：

1. **ADDED** 的 requirement 会追加到主 spec 中
2. **MODIFIED** 的 requirement 会替换现有版本
3. **REMOVED** 的 requirement 会从主 spec 中删除

change 文件夹会移动到 `openspec/changes/archive/` 以保留审计历史。

## 示例：你的第一个 Change {#change}

我们来演示为一个应用添加深色模式的过程。

### 1. 启动 Change（默认方式） {#getting-started-10}

```text
You: /opsx:propose add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md — why we're doing this, what's changing
     ✓ specs/       — requirements and scenarios
     ✓ design.md    — technical approach
     ✓ tasks.md     — implementation checklist
     Ready for implementation!
```

如果你已启用扩展 workflow profile，也可以分两步完成：`/opsx:new`，然后 `/opsx:ff`（或逐步使用 `/opsx:continue`）。

### 2. 生成了什么 {#getting-started-11}

**proposal.md** - 记录意图：

```markdown
# Proposal: Add Dark Mode

## Intent

Users have requested a dark mode option to reduce eye strain
during nighttime usage.

## Scope

- Add theme toggle in settings
- Support system preference detection
- Persist preference in localStorage

## Approach

Use CSS custom properties for theming with a React context
for state management.
```

**specs/ui/spec.md** - 展示新 requirement 的 delta：

```markdown
# Delta for UI

## ADDED Requirements

### Requirement: Theme Selection

The system SHALL allow users to choose between light and dark themes.

#### Scenario: Manual toggle

- GIVEN a user on any page
- WHEN the user clicks the theme toggle
- THEN the theme switches immediately
- AND the preference persists across sessions

#### Scenario: System preference

- GIVEN a user with no saved preference
- WHEN the application loads
- THEN the system's preferred color scheme is used
```

**tasks.md** - 实现清单：

```markdown
# Tasks

## 1. Theme Infrastructure

- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence

## 2. UI Components

- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
- [ ] 2.3 Update Header to include quick toggle

## 3. Styling

- [ ] 3.1 Define dark theme color palette
- [ ] 3.2 Update components to use CSS variables
```

### 3. 实现 {#getting-started-12}

```
You: /opsx:apply

AI:  Working through tasks...
     ✓ 1.1 Created ThemeContext with light/dark state
     ✓ 1.2 Added CSS custom properties to globals.css
     ✓ 1.3 Implemented localStorage persistence
     ✓ 2.1 Created ThemeToggle component
     ...
     All tasks complete!
```

在实现过程中，如果你发现 design 需要调整，只需更新相应的 artifact 然后继续即可。

### 4. Archive {#getting-started-13}

```
You: /opsx:archive

AI:  Archiving add-dark-mode...
     ✓ Merged specs into openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/
     Done! Ready for the next feature.
```

你的 delta spec 现在已成为主 spec 的一部分，记录着你的系统如何运作。

## 验证与审查 {#getting-started-14}

使用 CLI 检查你的 change：

```bash
# List active changes
openspec list

# View change details
openspec show add-dark-mode

# Validate spec formatting
openspec validate add-dark-mode

# Interactive dashboard
openspec view
```

## 后续步骤 {#getting-started-15}

- [先探索](explore.md) - 在动手之前用 `/opsx:explore` 把想法想清楚
- [审查 Change](reviewing-changes.md) - 在写任何代码之前，检查 AI 起草的计划中该看什么
- [写好 Spec](writing-specs.md) - 一个强有力的 requirement 和 scenario 长什么样
- [在现有项目中使用 OpenSpec](existing-projects.md) - 在大型遗留代码库上起步
- [编辑与迭代 Change](editing-changes.md) - 更新 artifact、回退、协调手动修改
- [核心概念速览](overview.md) - 用一页纸掌握完整心智模型
- [示例与配方](examples.md) - 真实 change 的完整流程
- [Workflow](workflows.md) - 常见模式以及何时使用每个命令
- [命令](commands.md) - 所有斜杠命令的完整参考
- [概念](concepts.md) - 深入理解 spec、change 与 schema
- [自定义](customization.md) - 让 OpenSpec 按你的方式工作
- [Store](stores-beta/user-guide.md) - 需要跨仓库或跨团队规划？把它放在自己的仓库中（beta）
- [FAQ](faq.md) 和[故障排查](troubleshooting.md) - 遇到困难时
