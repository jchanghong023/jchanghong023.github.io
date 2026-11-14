# 迁移到 OPSX {#opsx}

本指南帮助你从旧的 OpenSpec 工作流过渡到 OPSX。此次迁移被设计得尽量平滑——你现有的工作会得到保留，而新系统提供了更多灵活性。

## 有什么变化？ {#migration-guide-2}

OPSX 用一个流动的、基于动作的方式取代了旧的阶段锁定式工作流。下面是核心转变：

| 方面       | 旧版                                                         | OPSX                                                                                                                           |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **命令**   | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive` | 默认：`/opsx:propose`、`/opsx:explore`、`/opsx:apply`、`/opsx:update`、`/opsx:sync`、`/opsx:archive`（扩展工作流命令为可选项） |
| **工作流** | 一次性创建所有 artifact                                      | 增量创建或一次性创建——由你决定                                                                                                 |
| **回退**   | 别扭的阶段关卡                                               | 自然——可随时更新任何 artifact                                                                                                  |
| **自定义** | 固定结构                                                     | schema 驱动，完全可改造                                                                                                        |
| **配置**   | 带标记的 `CLAUDE.md` + `project.md`                          | `openspec/config.yaml` 中的简洁配置                                                                                            |

**理念上的变化：** 工作并不是线性的。OPSX 不再假装它是。

---

## 开始之前 {#migration-guide-3}

### 你现有的工作是安全的 {#migration-guide-4}

迁移过程在设计上就考虑了保留：

- **`openspec/changes/` 中的活动 change** —— 完全保留。你可以用 OPSX 命令继续它们。
- **已归档的 change** —— 不动。你的历史保持完整。
- **`openspec/specs/` 中的主 spec** —— 不动。它们是你的事实来源。
- **你在 CLAUDE.md、AGENTS.md 等文件中的内容** —— 保留。只会移除 OpenSpec 标记块；你写的一切都会留下。

### 会被移除的内容 {#migration-guide-5}

只有那些被替换掉的、由 OpenSpec 管理的文件：

| 内容                                          | 原因                  |
| --------------------------------------------- | --------------------- |
| 旧的斜杠命令目录/文件                         | 由新的 skill 系统取代 |
| `openspec/AGENTS.md`                          | 已过时的工作流触发器  |
| `CLAUDE.md`、`AGENTS.md` 等中的 OpenSpec 标记 | 不再需要              |

**按工具划分的旧命令位置**（示例——你的工具可能不同）：

- Claude Code：`.claude/commands/openspec/`
- Cursor：`.cursor/commands/openspec-*.md`
- Devin Desktop，原 Windsurf：`.windsurf/workflows/openspec-*.md`
- Cline：`.clinerules/workflows/openspec-*.md`
- Roo：`.roo/commands/openspec-*.md`
- GitHub Copilot：`.github/prompts/openspec-*.prompt.md`（仅 IDE 扩展；Copilot CLI 中不支持）
- Codex：OpenSpec 现在使用规范的 `.agents/skills/openspec-*` 路径。原 `.codex/skills` 路径下由 OpenSpec 管理的 `SKILL.md` 文件，仅在替换文件存在之后才会被对齐；自定义文件和有差异的副本保持原样。如果未标记的 `.agents` 目录树中已包含 OpenSpec skill，OpenSpec 会保留其现有的 Codex（`$openspec-*`）或通用（`/openspec-*`）渲染方式，而不会根据旧目录去猜测。使用 `openspec init` 显式选择 `codex` 以切换归属。旧 prompt 的清理仍然只针对 `$CODEX_HOME/prompts` 或 `~/.codex/prompts` 中 OpenSpec 白名单内的文件名。
- 以及其他（Augment、Continue、Amazon Q 等）

迁移会检测你已配置的工具，并清理它们的旧文件。

移除列表看起来可能有点长，但这些全都是 OpenSpec 最初创建的文件。你自己的内容绝不会被删除。

### 需要你关注的内容 {#migration-guide-6}

有一个文件需要手动迁移：

**`openspec/project.md`** —— 这个文件不会被自动删除，因为它可能包含你写下的项目上下文。你需要：

1. 检查其内容
2. 将有价值的上下文移到 `openspec/config.yaml`（参见下面的指引）
3. 准备好后再删除该文件

**我们为什么做这个改动：**

旧的 `project.md` 是被动的——agent 可能会读它，也可能不读，还可能读过之后忘掉。我们发现其可靠性并不稳定一致。

新的 `config.yaml` 上下文会被**主动注入到每一个 OpenSpec 规划请求中**。这意味着当 AI 在创建 artifact 时，你的项目约定、技术栈和规则始终在场。可靠性更高。

**代价：**

由于上下文会被注入到每个请求中，你会希望它保持简洁。聚焦于真正重要的内容：

- 技术栈和关键约定
- AI 需要了解的非显而易见的约束
- 以前经常被忽略的规则

不必担心做得完美。我们仍在摸索什么在这里最有效，随着不断试验，我们会改进上下文注入的工作方式。

---

## 运行迁移 {#migration-guide-7}

`openspec init` 和 `openspec update` 都会检测旧文件，并引导你走同一套清理流程。根据你的情况选择一个即可：

- 全新安装默认使用 `core` profile（`propose`、`explore`、`apply`、`update`、`sync`、`archive`）。
- 迁移安装会在需要时写入 `custom` profile，以保留你此前安装的工作流。

### 使用 `openspec init` {#openspec-init}

如果你想添加新工具或重新配置已设置的工具，请运行：

```bash
openspec init
```

init 命令会检测旧文件并引导你完成清理：

```
Upgrading to the new OpenSpec

OpenSpec now uses agent skills, the emerging standard across coding
agents. This simplifies your setup while keeping everything working
as before.

Files to remove
No user content to preserve:
  • .claude/commands/openspec/
  • openspec/AGENTS.md

Files to update
OpenSpec markers will be removed, your content preserved:
  • CLAUDE.md
  • AGENTS.md

Needs your attention
  • openspec/project.md
    We won't delete this file. It may contain useful project context.

    The new openspec/config.yaml has a "context:" section for planning
    context. This is included in every OpenSpec request and works more
    reliably than the old project.md approach.

    Review project.md, move any useful content to config.yaml's context
    section, then delete the file when ready.

? Upgrade and clean up legacy files? (Y/n)
```

**当你选择 yes 时会发生什么：**

1. 旧的斜杠命令目录被移除
2. OpenSpec 标记会从 `CLAUDE.md`、`AGENTS.md` 等文件中剥离（你的内容保留）
3. `openspec/AGENTS.md` 被删除
4. 新的 skill 被安装到 `.claude/skills/`
5. `openspec/config.yaml` 以默认 schema 被创建

### 使用 `openspec update` {#openspec-update}

如果你只想迁移并把现有工具刷新到最新版本，请运行：

```bash
openspec update
```

update 命令同样会检测并清理旧产物，然后把生成的 skill/命令刷新到与当前 profile 和交付设置相匹配。

### 非交互式 / CI 环境 {#ci}

用于脚本化迁移：

```bash
openspec init --force --tools claude
```

`--force` 标志会跳过提示并自动接受清理。

这也包括清理全局 Codex prompt 目录中由 OpenSpec 管理的 Codex prompt 文件。清理只针对 OpenSpec 白名单内的旧 Codex prompt 文件名，只有在替换用的 `.agents/skills/openspec-*` skill 存在后才会移除它们，并保留所有其他文件。

---

## 把 project.md 迁移到 config.yaml {#migrating-projectmd-to-configyaml}

旧的 `openspec/project.md` 是一个自由格式的 markdown 文件，用于存放项目上下文。新的 `openspec/config.yaml` 是结构化的，而且关键在于——它会被**注入到每一个规划请求中**，因此当 AI 工作时，你的约定始终在场。

### 之前（project.md） {#projectmd}

```markdown
# Project Context

This is a TypeScript monorepo using React and Node.js.
We use Jest for testing and follow strict ESLint rules.
Our API is RESTful and documented in docs/api.md.

## Conventions

- All public APIs must maintain backwards compatibility
- New features should include tests
- Use Given/When/Then format for specifications
```

### 之后（config.yaml） {#configyaml}

```yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  Testing: Jest with React Testing Library
  API: RESTful, documented in docs/api.md
  We maintain backwards compatibility for all public APIs

rules:
  proposal:
    - Include rollback plan for risky changes
  specs:
    - Use Given/When/Then format for scenarios
    - Reference existing patterns before inventing new ones
  design:
    - Include sequence diagrams for complex flows
```

### 关键差异 {#migration-guide-14}

| project.md        | config.yaml                                                  |
| ----------------- | ------------------------------------------------------------ |
| 自由格式 markdown | 结构化 YAML                                                  |
| 一整块文本        | 分开的上下文与按 artifact 划分的规则                         |
| 何时被使用不明确  | 上下文出现在所有 artifact 中；规则只出现在匹配的 artifact 中 |
| 没有 schema 选择  | 显式的 `schema:` 字段设定默认工作流                          |

### 该保留什么，该舍弃什么 {#migration-guide-15}

迁移时要有选择性。问问自己：“AI 在*每一次*规划请求中都需要这个吗？”

**适合放进 `context:` 的候选**

- 技术栈（语言、框架、数据库）
- 关键架构模式（monorepo、微服务等）
- 非显而易见的约束（“我们不能用 X 库，因为……”）
- 经常被忽略的关键约定

**改为放进 `rules:`**

- 特定 artifact 的格式要求（“在 spec 中使用 Given/When/Then”）
- 评审标准（“proposal 必须包含回滚计划”）
- 这些只会出现在匹配的 artifact 中，从而让其他请求更轻量

**完全省略**

- AI 已经知道的通用最佳实践
- 可以概括的冗长解释
- 不影响当前工作的历史背景

### 迁移步骤 {#migration-guide-16}

1. **创建 config.yaml**（如果 init 尚未创建）：

   ```yaml
   schema: spec-driven
   ```

2. **添加你的上下文**（保持简洁——它会进入每一个请求）：

   ```yaml
   context: |
     Your project background goes here.
     Focus on what the AI genuinely needs to know.
   ```

3. **添加按 artifact 划分的规则**（可选）：

   ```yaml
   rules:
     proposal:
       - Your proposal-specific guidance
     specs:
       - Your spec-writing rules
   ```

4. **删除 project.md**，一旦你已把有用的内容全部移走。

**不要过度思考。** 从要点开始，然后迭代。如果你注意到 AI 漏掉了重要内容，就补上。如果上下文显得臃肿，就裁剪。这是一份活的文档。

### 需要帮助？使用这个 prompt {#prompt}

如果你不确定如何提炼你的 project.md，可以问你的 AI 助手：

```
I'm migrating from OpenSpec's old project.md to the new config.yaml format.

Here's my current project.md:
[paste your project.md content]

Please help me create a config.yaml with:
1. A concise `context:` section (this gets injected into every planning request, so keep it tight—focus on tech stack, key constraints, and conventions that often get ignored)
2. `rules:` for specific artifacts if any content is artifact-specific (e.g., "use Given/When/Then" belongs in specs rules, not global context)

Leave out anything generic that AI models already know. Be ruthless about brevity.
```

AI 会帮助你辨别哪些是必要的、哪些可以裁剪。

---

## 新命令 {#migration-guide-18}

命令是否可用取决于 profile：

**默认（`core` profile）：**

| 命令            | 用途                                         |
| --------------- | -------------------------------------------- |
| `/opsx:propose` | 一步创建 change 并生成规划 artifact          |
| `/opsx:explore` | 在无结构约束下梳理想法                       |
| `/opsx:apply`   | 实现 tasks.md 中的任务                       |
| `/opsx:update`  | 修订 change 的规划 artifact 并保持其连贯一致 |
| `/opsx:sync`    | 把 delta spec 合并进主 spec                  |
| `/opsx:archive` | 完成并归档 change                            |

**扩展工作流（自定义选择）：**

| 命令                 | 用途                            |
| -------------------- | ------------------------------- |
| `/opsx:new`          | 启动一个新的 change 脚手架      |
| `/opsx:continue`     | 创建下一个 artifact（一次一个） |
| `/opsx:ff`           | 快进——一次性创建规划 artifact   |
| `/opsx:verify`       | 校验实现与 spec 是否一致        |
| `/opsx:bulk-archive` | 一次性归档多个 change           |
| `/opsx:onboard`      | 引导式端到端上手工作流          |

用 `openspec config profile` 启用扩展命令，然后运行 `openspec update`。

### 旧命令到新命令的映射 {#migration-guide-19}

| 旧版                 | OPSX 对应命令                                                 |
| -------------------- | ------------------------------------------------------------- |
| `/openspec:proposal` | `/opsx:propose`（默认）或先 `/opsx:new` 再 `/opsx:ff`（扩展） |
| `/openspec:apply`    | `/opsx:apply`                                                 |
| `/openspec:archive`  | `/opsx:archive`                                               |

### 新能力 {#migration-guide-20}

这些能力属于扩展工作流命令集的一部分。

**细粒度 artifact 创建：**

```
/opsx:continue
```

基于依赖关系一次创建一个 artifact。当你希望逐步评审时使用它。

**探索模式：**

```
/opsx:explore
```

在确定要做一个 change 之前，与搭档一起把想法梳理清楚。

---

## 理解新架构 {#migration-guide-21}

### 从阶段锁定到流动式 {#migration-guide-22}

旧工作流强制线性推进：

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   PLANNING   │ ───► │ IMPLEMENTING │ ───► │   ARCHIVING  │
│    PHASE     │      │    PHASE     │      │    PHASE     │
└──────────────┘      └──────────────┘      └──────────────┘

If you're in implementation and realize the design is wrong?
Too bad. Phase gates don't let you go back easily.
```

OPSX 使用动作，而不是阶段：

```
         ┌───────────────────────────────────────────────┐
         │           ACTIONS (not phases)                │
         │                                               │
         │     new ◄──► continue ◄──► apply ◄──► archive │
         │      │          │           │             │   │
         │      └──────────┴───────────┴─────────────┘   │
         │                    any order                  │
         └───────────────────────────────────────────────┘
```

### 依赖图 {#migration-guide-23}

artifact 构成一个有向图。依赖是促成者，而不是关卡：

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

当你运行 `/opsx:continue` 时，它会检查哪些已经就绪，并给出下一个 artifact。你也可以按任意顺序创建多个已就绪的 artifact。

### Skill 与命令 {#skill}

旧系统使用与工具相关的命令文件：

```
.claude/commands/openspec/
├── proposal.md
├── apply.md
└── archive.md
```

OPSX 使用新兴的 **skill** 标准：

```
.claude/skills/
├── openspec-explore/SKILL.md
├── openspec-new-change/SKILL.md
├── openspec-continue-change/SKILL.md
├── openspec-apply-change/SKILL.md
└── ...
```

skill 可被多种 AI 编码工具识别，并提供更丰富的元数据。

在 OPSX 中，Codex 只支持 skill。OpenSpec 不再生成 Codex 自定义 prompt 文件；请改用生成的 `.agents/skills/openspec-*` 目录。

---

## 继续现有的 change {#change}

你进行中的 change 可以与 OPSX 命令无缝配合。

**有一个来自旧工作流的活动 change？**

```
/opsx:apply add-my-feature
```

OPSX 会读取现有的 artifact，并从你停下的地方继续。

**想给已有的 change 添加更多 artifact？**

```
/opsx:continue add-my-feature
```

基于已经存在的内容，显示哪些可以创建。

**需要查看状态？**

```bash
openspec status --change add-my-feature
```

---

## 新的配置系统 {#migration-guide-26}

### config.yaml 结构 {#configyaml-2}

```yaml
# Required: Default schema for new changes
schema: spec-driven

# Optional: Project context (max 50KB)
# Injected into ALL artifact instructions
context: |
  Your project background, tech stack,
  conventions, and constraints.

# Optional: Per-artifact rules
# Only injected into matching artifacts
rules:
  proposal:
    - Include rollback plan
  specs:
    - Use Given/When/Then format
  design:
    - Document fallback strategies
  tasks:
    - Break into 2-hour maximum chunks
```

### schema 解析 {#schema}

在决定使用哪个 schema 时，OPSX 按顺序检查：

1. **CLI 标志**：`--schema <name>`（最高优先级）
2. **change 元数据**：change 目录中的 `.openspec.yaml`
3. **项目配置**：`openspec/config.yaml`
4. **默认**：`spec-driven`

### 可用的 schema {#schema-2}

| Schema        | artifact                          | 最适合     |
| ------------- | --------------------------------- | ---------- |
| `spec-driven` | proposal → specs → design → tasks | 大多数项目 |

列出所有可用的 schema：

```bash
openspec schemas
```

### 自定义 schema {#schema-3}

创建你自己的 schema：

```bash
openspec schema init my-workflow
```

或从现有 schema 分叉：

```bash
openspec schema fork spec-driven my-workflow
```

详情参见 [Customization](customization.md)。

---

## 故障排查 {#migration-guide-31}

### “Legacy files detected in non-interactive mode”（非交互模式下检测到旧文件） {#legacy-files-detected-in-non-interactive-mode}

你正在 CI 或非交互式环境中运行。请使用：

```bash
openspec init --force
```

### 迁移后命令没有出现 {#migration-guide-33}

重启你的 IDE。skill 在启动时被检测。

### “Unknown artifact ID in rules”（rules 中的 artifact ID 未知） {#unknown-artifact-id-in-rulesrules-artifact-id}

检查你的 `rules:` 键是否与 schema 的 artifact ID 匹配：

- **spec-driven**：`proposal`、`specs`、`design`、`tasks`

运行以下命令查看有效的 artifact ID：

```bash
openspec schemas --json
```

### 配置没有被应用 {#migration-guide-35}

1. 确认文件位于 `openspec/config.yaml`（不是 `.yml`）
2. 校验 YAML 语法
3. 配置改动会立即生效——无需重启

### project.md 未被迁移 {#projectmd-2}

系统有意保留 `project.md`，因为它可能包含你的自定义内容。请手动检查它，把有用的部分移到 `config.yaml`，然后删除它。

### 想看看会被清理什么？ {#migration-guide-37}

运行 init 并在清理提示处选择拒绝——你将看到完整的检测摘要，而不会做任何改动。

---

## 快速参考 {#migration-guide-38}

### 迁移后的文件 {#migration-guide-39}

```
project/
├── openspec/
│   ├── specs/                    # Unchanged
│   ├── changes/                  # Unchanged
│   │   └── archive/              # Unchanged
│   └── config.yaml               # NEW: Project configuration
├── .claude/
│   └── skills/                   # NEW: OPSX skills
│       ├── openspec-propose/     # default core profile
│       ├── openspec-explore/
│       ├── openspec-apply-change/
│       ├── openspec-update-change/
│       ├── openspec-sync-specs/
│       ├── openspec-archive-change/
│       └── ...                   # expanded profile adds new/continue/ff/etc.
├── CLAUDE.md                     # OpenSpec markers removed, your content preserved
└── AGENTS.md                     # OpenSpec markers removed, your content preserved
```

### 已消失的内容 {#migration-guide-40}

- `.claude/commands/openspec/` —— 由 `.claude/skills/` 取代
- `openspec/AGENTS.md` —— 已过时
- `openspec/project.md` —— 迁移到 `config.yaml`，然后删除
- `CLAUDE.md`、`AGENTS.md` 等中的 OpenSpec 标记块

### 命令速查表 {#migration-guide-41}

```text
/opsx:propose      Start quickly (default core profile)
/opsx:apply        Implement tasks
/opsx:archive      Finish and archive

# Expanded workflow (if enabled):
/opsx:new          Scaffold a change
/opsx:continue     Create next artifact
/opsx:ff           Create planning artifacts
```

---

## 获取帮助 {#migration-guide-42}

- **Discord**：[discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues**：[github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **文档**：[docs/opsx.md](opsx.md) 获取完整的 OPSX 参考
