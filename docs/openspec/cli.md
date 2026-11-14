# CLI 参考 {#cli}

OpenSpec CLI（`openspec`）提供用于项目初始化、校验、状态查看和管理的终端命令。这些命令是 [Commands](commands.md) 中记录的 AI 斜杠命令（如 `/opsx:propose`）的补充。

## 概览 {#cli-2}

| 类别                               | 命令                                                                                              | 用途                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **初始化**                         | `init`、`update`                                                                                  | 在项目中初始化并更新 OpenSpec            |
| **Stores（独立的 OpenSpec 仓库）** | `store setup`、`store register`、`store unregister`、`store remove`、`store list`、`store doctor` | 管理 store——你已注册的独立 OpenSpec 仓库 |
| **健康检查**                       | `doctor`                                                                                          | 报告解析出的根目录的关系健康状况         |
| **工作上下文**                     | `context`                                                                                         | 组装工作集（根目录 + 被引用的 store）    |
| **个人 workset**                   | `workset create`、`workset list`、`workset open`、`workset remove`                                | 在你的工具中保存并打开个人的本地工作视图 |
| **浏览**                           | `list`、`view`、`show`                                                                            | 浏览 change 与 spec                      |
| **校验**                           | `validate`                                                                                        | 检查 change 与 spec 中的问题             |
| **生命周期**                       | `archive`                                                                                         | 收尾已完成的 change                      |
| **工作流**                         | `new change`、`status`、`instructions`、`templates`、`schemas`                                    | 由 artifact 驱动的工作流支持             |
| **Schema**                         | `schema init`、`schema fork`、`schema validate`、`schema which`                                   | 创建并管理自定义工作流                   |
| **配置**                           | `config`                                                                                          | 查看和修改设置                           |
| **实用工具**                       | `feedback`、`completion`                                                                          | 反馈与 shell 集成                        |

---

## 面向人类与面向 agent 的命令 {#agent}

大多数 CLI 命令是为终端中的**人类使用**而设计的。部分命令还通过 JSON 输出支持 **agent/脚本使用**。

### 仅限人类的命令 {#cli-4}

这些命令是交互式的，为终端使用而设计：

| 命令                           | 用途                                                |
| ------------------------------ | --------------------------------------------------- |
| `openspec init`                | 初始化项目（交互式提示）                            |
| `openspec view`                | 交互式仪表盘                                        |
| `openspec workset open <name>` | 打开已保存的 workset（编辑器窗口或终端 agent 会话） |
| `openspec config edit`         | 在编辑器中打开配置                                  |
| `openspec feedback`            | 通过 GitHub 提交反馈                                |
| `openspec completion install`  | 安装 shell 补全                                     |

### 兼容 agent 的命令 {#agent-2}

这些命令支持 `--json` 输出，供 AI agent 和脚本以编程方式使用：

| 命令                             | 人类用法                      | agent 用法                                                            |
| -------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| `openspec list`                  | 浏览 change/spec              | `--json` 获取结构化数据                                               |
| `openspec show <item>`           | 阅读内容                      | `--json` 便于解析                                                     |
| `openspec validate`              | 检查问题                      | `--all --json` 进行批量校验                                           |
| `openspec status`                | 查看 artifact 进度            | `--json` 获取结构化状态                                               |
| `openspec instructions`          | 获取后续步骤                  | `--json` 获取 agent 指令                                              |
| `openspec templates`             | 查找模板路径                  | `--json` 解析路径                                                     |
| `openspec schemas`               | 列出可用 schema               | `--json` 进行 schema 发现；`--store <id>` 选择已注册的根目录          |
| `openspec store setup <id>`      | 创建并注册本地 store          | `--json` 配合显式输入，获得结构化 setup 输出                          |
| `openspec store register <path>` | 注册已有的 store              | `--json` 获取结构化注册输出                                           |
| `openspec store unregister <id>` | 忘记一个本地 store 注册       | `--json` 获取结构化清理输出                                           |
| `openspec store remove <id>`     | 删除已注册的本地 store 文件夹 | `--yes --json` 进行非交互删除                                         |
| `openspec store list`            | 浏览已注册的 store            | `--json` 获取结构化注册信息                                           |
| `openspec store doctor`          | 检查本地 store 设置           | `--json` 获取结构化诊断                                               |
| `openspec new change <id>`       | 创建仓库内的 change 脚手架    | `--json`，外加 `--store <id>` 以将已注册的 store 作为 OpenSpec 根目录 |
| `openspec workset create [name]` | 组合个人的工作视图            | `--member <path> --json` 进行非交互组合                               |
| `openspec workset list`          | 浏览已保存的 workset          | `--json` 获取结构化视图                                               |
| `openspec workset remove <name>` | 删除已保存的视图              | `--yes --json` 进行非交互删除                                         |

---

## 全局选项 {#cli-6}

这些选项适用于所有命令：

| 选项              | 描述         |
| ----------------- | ------------ |
| `--version`、`-V` | 显示版本号   |
| `--no-color`      | 禁用彩色输出 |
| `--help`、`-h`    | 显示命令帮助 |

---

## 初始化命令 {#cli-7}

### `openspec init` {#openspec-init}

在项目中初始化 OpenSpec。创建文件夹结构并配置 AI 工具集成。

默认行为使用全局配置的默认值：profile 为 `core`，delivery 为 `both`，workflows 为 `propose, explore, apply, update, sync, archive`。

```
openspec init [path] [options]
```

使用 `--language <language>` 可为新项目的
`openspec/config.yaml` 添加语言指令。对于已有项目，请编辑配置的 `context`
字段，这样 OpenSpec 就永远不会覆盖项目专属的指引。

**参数：**

| 参数   | 必填 | 描述                       |
| ------ | ---- | -------------------------- |
| `path` | 否   | 目标目录（默认：当前目录） |

**选项：**

| 选项                    | 描述                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| `--tools <list>`        | 以非交互方式配置 AI 工具。使用 `all`、`none`，或以逗号分隔的列表 |
| `--language <language>` | 创建新配置时以此语言写入 artifact                                |
| `--force`               | 自动清理旧文件而不提示                                           |
| `--profile <profile>`   | 覆盖本次 init 运行的全局 profile（`core` 或 `custom`）           |
| `--no-animation`        | 显示静态欢迎界面而非动画版本                                     |

`--profile custom` 使用全局配置中当前选定的任何 workflow（`openspec config profile`）。

当设置了 `OPENSPEC_NO_ANIMATION` 环境变量（任意值，包括空值）、`NO_COLOR` 被设为非空值，或操作系统启用了减弱动效偏好（macOS 的“减弱动态效果”、GNOME 动画被禁用）时，欢迎动画同样会被跳过。

**支持的工具 ID（`--tools`）** — `oh-my-pi`（本 vendored 副本不附带其他目标）

> 该列表与 `src/core/config.ts` 中的 `AI_TOOLS` 保持一致。各工具的 skill 与命令路径请参见 [Supported Tools](supported-tools.md)。

**示例：**

```bash
# Interactive initialization
openspec init

# Initialize in a specific directory
openspec init ./my-project

# Non-interactive: configure Oh My Pi
openspec init --tools oh-my-pi

# Configure for all supported tools
openspec init --tools all

# Override profile for this run
openspec init --profile core

# Skip prompts and auto-cleanup legacy files
openspec init --force
```

**它会创建：**

```
openspec/
├── specs/              # Your specifications (source of truth)
├── changes/            # Proposed changes
└── config.yaml         # Project configuration

.claude/skills/         # Claude Code skills (if claude selected)
.cursor/skills/         # Cursor skills (if cursor selected)
.cursor/commands/       # Cursor OPSX commands (if delivery includes commands)
.agents/skills/         # Shared skills for AGENTS.md-compatible tools (if agents selected)
... (other tool configs)
```

---

### `openspec update` {#openspec-update}

在升级 CLI 之后更新 OpenSpec 指令文件。使用你当前的全局 profile、选定的 workflow 和 delivery 模式重新生成 AI 工具配置文件。

```
openspec update [path] [options]
```

**参数：**

| 参数   | 必填 | 描述                       |
| ------ | ---- | -------------------------- |
| `path` | 否   | 目标目录（默认：当前目录） |

**选项：**

| 选项        | 描述                                                |
| ----------- | --------------------------------------------------- |
| `--force`   | 即使文件已是最新也强制更新                          |
| `--dry-run` | 报告更新会改动什么，不写入任何内容                  |
| `--json`    | 与 `--dry-run` 一起使用时，以 JSON 打印计划中的改动 |

**示例：**

```bash
# Update instruction files after npm upgrade
npm install -g @fission-ai/openspec@latest
openspec update
```

**预览更新：**

`--dry-run` 会报告更新将新增、更改或删除的文件，且不写入任何内容。路径相对于项目；项目之外的文件（主目录中的 skill）会以 `~/` 前缀显示。

```bash
openspec update --dry-run --json
```

```json
{
  "changes": [
    {
      "path": ".claude/skills/openspec-explore/SKILL.md",
      "action": "update",
      "tool": "claude"
    },
    {
      "path": "~/.minimax/skills/openspec-propose/SKILL.md",
      "action": "add",
      "tool": "minimax-code"
    }
  ],
  "notes": [],
  "failures": []
}
```

该计划即非交互运行会做的事，并列出它会触及的每一个文件：对于 profiles 出现之前安装的版本，包括保存全局配置；以及在指定 `--force` 时清理旧 artifact。属于 OpenSpec 本身而非某个工具的文件，其 `tool` 为 `"openspec"`。`notes` 标记终端用户会被询问的步骤，每项带有一个稳定的 `code`：`legacy-tool-directories`（列为已执行的移动）和 `legacy-artifacts`（未加 `--force` 时更新会保留不动的旧布局文件）。`failures` 列出真实更新会失败的工具，包括它无法完成的写入（文件位置上却是目录、没有写权限）；对于该工具，计划会在更新会停下的地方停下，而一个坏掉的工具不会让你失去计划的其余部分。对于一次普通刷新，两者都为空。
完整参考见 [openspec.dev/docs/cli](https://openspec.dev/docs/cli)。

`--dry-run --json` 失败时仍会精确打印一个 JSON 文档——空计划加一个 `status` 数组——并以非零码退出。

请先升级软件包。指令文件由已安装的 CLI 生成，因此对过期的安装运行 `openspec update` 会报告一切已是最新，却不会添加较新版本附带的新 workflow。

为了让这一点可见，`openspec update` 会向 npm registry 查询是否已发布了更新的 CLI。当你的版本落后时，它会提议升级：

```text
A newer OpenSpec CLI is available (v1.6.0 → v1.7.0).
  Running from: /usr/local/lib/node_modules/@fission-ai/openspec
? Upgrade to v1.7.0 now? (Y/n)
```

回答 yes，它会运行 `npm install -g @fission-ai/openspec@latest`，然后用新 CLI 重新运行更新，使新 workflow 在同一条命令中落地。它通过询问已安装二进制文件的版本来确认升级，而不是信任 npm 的退出码，因此如果 `PATH` 中更靠前的另一个安装仍在响应，它会告知你，而不是声称成功。回答 no，它会打印该命令，并用你现有的 CLI 执行更新。Ctrl-C 会中止该命令。

该提议只出现在交互式终端中，且只在 npm 拥有该安装时出现——这是 `npm install -g` 真正能修复的唯一情形。其他情况会得到与安装方式相匹配的命令：

| OpenSpec 的安装方式                | 你会得到                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 全局 npm 安装                      | 该提示，并为你运行升级——在交互式终端中；管道输出则得到打印出来的命令                                                      |
| 全局 pnpm、bun、yarn 或 volta 安装 | 该管理器自己的命令：`pnpm add -g …@latest`、`bun add -g …@latest`、`yarn global add …@latest` 或 `volta install …@latest` |
| 项目的某个依赖                     | 一条更新该依赖的提示，因为其包管理器掌管 lockfile                                                                         |
| `npx` / `dlx` 缓存                 | `npx @fission-ai/openspec@latest update`——该命令本身就是更新，因此没有第二步                                              |
| git clone                          | 什么都不给——你的版本就是该分支所声明的版本                                                                                |

只要打印了任何内容，它都会指出当前运行的 CLI 是从哪个目录加载的——这正是当你确实升级了、但某个过期的 shim 仍占据 `PATH` 时需要检查的地方。

当 npm 导出 `npm_config_registry` 时，它向该变量中的 registry 查询，否则查询 `https://registry.npmjs.org`。它不读取 `.npmrc`：让文件内容决定出站请求的去向是一种值得避免的流程，而项目的 `.npmrc` 会随仓库一起传播。在私有镜像上，请导出 `npm_config_registry`——或者设置 `OPENSPEC_NO_UPDATE_CHECK` 完全跳过该检查。当 `CI` 被设为任何值（明确的关闭值 `false`、`0`、`no`、`off` 或空值除外）时、在 `NODE_ENV=test` 下、以及只要设置了 `OPENSPEC_NO_UPDATE_CHECK`（任意值）、`DO_NOT_TRACK=1` 或 `OPENSPEC_TELEMETRY=0` 时，该检查都会被跳过。它在更新之前运行，最多可将其延迟 1.5 秒——超过之后它就会放弃，即使网络在静默丢弃数据包，并且在 registry 不可达时保持沉默。

**如何判定“已是最新”：** skill 文件会记录生成它们的版本，
因此 OpenSpec 将其与已安装的 CLI 比较。命令文件不带版本戳，因此对于有命令但
没有 skill 的工具（delivery 为
`commands`），OpenSpec 会将文件内容与它当前会生成的内容比较——对这些文件的编辑即被视为漂移并被覆盖。当 delivery 为
`skills` 或 `both` 时，只检查记录的版本，因此版本仍匹配的手工编辑文件会被保留；请使用 `--force` 重写它。无论哪种方式，生成的文件都归 OpenSpec 所有——请把你的自有指令放在别处。

---

## Stores（独立的 OpenSpec 仓库） {#stores-openspec}

> **Beta。** Stores 以及构建于其上的功能（references、工作上下文、worksets）都是新的；命令名称、选项、文件格式和 JSON 输出可能在不同版本之间改变形态。问题导向的演练请参见 [stores 指南](stores-beta/user-guide.md)。

store 是你在本机注册的独立 OpenSpec 仓库——例如规划仓库或契约仓库。注册 store 之后，常规命令（`list`、`show`、`status`、`validate`、`new change`、`archive` 等）可以通过传入 `--store <id>`，在任何地方对它进行操作。

### `openspec store setup` {#openspec-store-setup}

创建并注册一个本地 store。在终端中不带参数运行时，
OpenSpec 会引导用户完成设置。agent 和脚本应传入显式
输入并使用 `--json`。

```bash
openspec store setup [id] [options]
```

**选项：**

| 选项             | 描述                                           |
| ---------------- | ---------------------------------------------- |
| `--path <path>`  | store 应存放的文件夹（例如 `~/openspec/<id>`） |
| `--remote <url>` | 在新 store 的 `store.yaml` 中记录规范 remote   |
| `--init-git`     | 初始化一个 Git 仓库并创建初始提交（默认）      |
| `--no-init-git`  | 跳过所有 Git 动作：不初始化，也不创建初始提交  |
| `--json`         | 输出 JSON                                      |

非交互运行（`--json`、脚本、agent）必须同时传入 store id 和 `--path`。在交互式终端中，setup 会在一个可见且归用户所有的位置（例如 `~/openspec/<id>`）提示输入位置，并提供可编辑的建议值；它绝不会默认使用 OpenSpec 托管的数据目录。

示例：

```bash
openspec store setup
openspec store setup team-context
openspec store setup team-context --path ~/openspec/team-context --no-init-git
openspec store setup team-context --path ~/openspec/team-context --no-init-git --json
```

### `openspec store register` {#openspec-store-register}

注册一个已有的本地 store 文件夹。在 stores beta 期间，根目录可以在任何
change 存在、spec 已被应用或 change 已被 archive 之前就注册；在这种情况下，
`openspec/changes/`、`openspec/specs/` 和
`openspec/changes/archive/` 可能在常规命令创建它们之前并不存在。
一个仅含配置、声明了 `store: <id>` 的仓库仍然是对另一个
store 的指针，除非移除该指针，否则不会被注册为 store 根目录。

```bash
openspec store register [path] [options]
```

**选项：**

| 选项        | 描述                                              |
| ----------- | ------------------------------------------------- |
| `--id <id>` | store id；默认为 store 元数据或文件夹名           |
| `--yes`     | 确认为健康的 OpenSpec 根目录创建 store 身份元数据 |
| `--json`    | 输出 JSON                                         |

### `openspec store unregister` {#openspec-store-unregister}

忘记一个本地 store 注册，而不删除文件。

```bash
openspec store unregister <id> [--json]
```

当某个 store 被移动、被克隆到别处，或不应再在这台机器上
由 OpenSpec 显示时，请使用它。

### `openspec store remove` {#openspec-store-remove}

忘记一个本地 store 注册并删除其本地文件夹。

```bash
openspec store remove <id> [--yes] [--json]
```

`remove` 在交互式终端中会在删除前显示确切的文件夹。
Agent、脚本和 JSON 调用者必须传入 `--yes` 以确认删除。
对于不包含匹配 store 元数据的文件夹，OpenSpec 会拒绝删除。

### `openspec store list` {#openspec-store-list}

列出本地已注册的 store。

```bash
openspec store list [--json]
openspec store ls [--json]
```

### `openspec store doctor` {#openspec-store-doctor}

检查本地 store 的注册、元数据和 Git 存在情况。

```bash
openspec store doctor [id] [--json]
```

doctor 仅作诊断；它报告缺失的根目录、元数据不匹配和无效的本地注册表状态，而不修改该 store。

### 从项目引用 store {#store}

项目仓库可以在 `openspec/config.yaml` 中声明其工作所依据的 store：

```yaml
schema: spec-driven
references:
  - team-context
```

此后，该仓库中 `openspec instructions` 的输出（无论是按 artifact 的输出面还是 `apply`
输出面，无论 JSON 还是人类模式）都会携带一个索引，包含每个被引用 store 的 spec——spec id、取自每个
spec 的 Purpose 部分的一行摘要，以及获取命令（`openspec show <spec-id> --type spec --store <id>`）。该索引在每次运行时都从已注册的检出实时构建；spec 内容绝不会被复制进输出。

references 是只读上下文。它们从不改变命令的作用位置：工作始终留在仓库自己的根目录中，写入被引用的 store 仍然需要显式的 `--store` 操作。无法解析的 reference（例如该 store 未在本机注册）会在索引中降级为一条带确切修复方案的警告，而 instructions 仍会生成。`openspec doctor` 在一个地方报告 reference 健康状况。

### 记录 store 的克隆来源 {#store-2}

store 可以在其提交的身份文件中记录规范克隆来源，从而让新手引导不会止步于“请注册该 store”：

```bash
openspec store setup team-context --path ~/openspec/team-context \
  --remote git@github.com:acme/team-context.git
```

该 remote 会写入初始提交中的 `.openspec-store/store.yaml`，因此每一次克隆天生就知道它。对于已有的 store，请手工编辑 `store.yaml` 并提交。`store doctor` 会显示记录的 remote（以及检出所观察到的 Git origin）；setup/register 的共享指引会指出它；register 会把检出的 origin 记录到本机本地注册表中。

reference 声明也可以携带克隆来源，这样尚未拥有该 store 的队友就能得到一条完整、可直接粘贴的修复方案（`git clone <remote> <path> && openspec store register <path> --id <id>`）：

```yaml
references:
  - { id: team-context, remote: 'git@github.com:acme/team-context.git' }
```

记录 remote 并不等于同步：OpenSpec 从不自行克隆、拉取或推送。

### 声明默认 store {#store-3}

如果一个仓库的规划完全外置——没有本地 `openspec/specs/` 或 `openspec/changes/`——它可以一次性声明其 store，而不必在每条命令上传递 `--store`：

```yaml
# openspec/config.yaml (the only file under openspec/)
store: team-context
```

此后常规命令会自动解析到所声明的 store；根目录横幅和 JSON 的 `root` 块报告 `source: "declared"` 并附带 store id，而打印出的提示仍带有 `--store <id>`。该声明是回退，绝不是覆盖：显式的 `--store` 总是优先，而带有真实规划文件夹的目录会忽略该指针（并给出警告）。要把一个指针仓库转换为本地 OpenSpec 根目录，请删除 `store:` 行并运行 `openspec init`——当声明存在时，init 会拒绝创建脚手架。

机器级别的变体可一次性覆盖所有仓库：`openspec config set defaultStore <id>`（见配置章节）。只有在 `--store`、本地根目录和项目指针都解析失败之后，才会考虑它；此时根目录横幅和 JSON 的 `root` 块会报告 `source: "global_default"`。

## Doctor（关系健康） {#doctor}

一个只读的问题，一个集中的位置：OpenSpec 根目录是否健康，它引用的 store 在这台机器上是否可用？

```bash
openspec doctor [--store <id>] [--json]
```

报告将根目录健康、store 元数据健康（当记录的 remote 与检出的 origin 发生分歧时会给出提示，当 store 检出落后于其最后拉取的上游跟踪引用时也会给出提示）以及 reference 健康（与 instructions 展示的相同诊断，针对未解析的 reference 附带克隆修复方案）区分开来。任何严重程度和健康发现都以 0 退出——agent 读取 `status` 数组；只有命令失败（无根目录、未知 store）才以 1 退出。doctor 从不克隆、同步或修复。要获取组装出的集合本身而非其健康状况，请使用 `openspec context`。

## 工作上下文（组装出的集合） {#cli-21}

本次工作通过 OpenSpec 声明所关联的一切，汇于一个工作集：OpenSpec 根目录及其引用的 store。

```bash
openspec context [--store <id>] [--json] [--code-workspace <path> [--force]]
```

JSON 简报可供 agent 使用（每个可用的被引用 store 都携带其获取配方；未解析的成员携带与 instructions 和 doctor 展示的相同修复方案）。`--code-workspace` 还会写出一个 VS Code 工作区文件，其中包含根目录以及可用的被引用 store（`ref:<id>` 文件夹）——这是该命令唯一的写入，若文件已存在且未加 `--force` 则会被拒绝。不可用的成员会被报告，绝不会被猜测。

“工作上下文”是组装出的集合；`openspec/config.yaml` 中的 `context:` 字段是注入到 instructions 中的项目背景——两者截然不同。`openspec doctor` 回答该集合是否健康；`openspec context` 回答该集合是什么。

## 个人 workset {#workset}

> **Beta。** Workset 属于新的 beta 面；命令、选项和文件格式可能在不同版本之间改变形态。演练请参见 [stores 指南](stores-beta/user-guide.md#worksets-reopen-the-folders-you-work-on-together)。

workset 是对你一起使用的文件夹的、个人的具名视图——一个规划根目录加上你选择的其他任何内容——保存在你的机器上，并可按名称在你的工具中重新打开。它纯属本地：从不提交、从不共享、从不从声明派生，删除一个 workset 也绝不会触及成员文件夹。

```bash
openspec workset create [name] [--member <path> | --member <name>=<path>]... [--tool <id>] [--json]
openspec workset list [--json]
openspec workset open <name> [--tool <id>]
openspec workset remove <name> [--yes] [--json]
```

`create` 运行一个简短的引导流程（或以非交互方式接受 `--member` 选项；第一个成员是主成员——会话在那里启动）。`open` 启动所选工具：编辑器（VS Code、Cursor）会打开一个包含所有成员的窗口然后返回；CLI agent（Claude Code、codex）会接管此终端，作为一个附加了所有成员的会话，且不预填任何提示，在你退出时结束。打开时缺失的成员文件夹会被跳过并给出说明；其余仍会打开。保存的工具偏好可在每次 open 时用 `--tool` 覆盖。

支持新工具属于配置而非代码。每个工具都是两种启动风格之一——`workspace-file`（用生成的 `.code-workspace` 启动）或 `attach-dirs`（每个成员一个附加选项）——全局 `config.json` 中的 `openers` 键（用 `openspec config edit` 打开它）可按字段添加工具或调整内置工具：

```json
{
  "openers": {
    "zed": { "style": "workspace-file" },
    "claude": { "attach_flag": "--dir" }
  }
}
```

所有 workset 状态都位于全局数据目录的 `worksets/` 文件夹下（保存的视图加上生成的 `<name>.code-workspace` 文件，后者在每次 open 时重新生成）；删除该文件夹即移除所有痕迹。

---

## 浏览命令 {#cli-23}

### `openspec list` {#openspec-list}

列出项目中的 change 或 spec。

```
openspec list [options]
```

**选项：**

| 选项             | 描述                              |
| ---------------- | --------------------------------- |
| `--specs`        | 列出 spec 而非 change             |
| `--changes`      | 列出 change（默认）               |
| `--sort <order>` | 按 `recent`（默认）或 `name` 排序 |
| `--json`         | 以 JSON 输出                      |

**示例：**

```bash
# List all active changes
openspec list

# List all specs
openspec list --specs

# JSON output for scripts
openspec list --json
```

**输出（文本）：**

```
Changes:
  add-dark-mode     No tasks      just now
```

---

### `openspec view` {#openspec-view}

显示用于浏览 spec 和 change 的交互式仪表盘。

```
openspec view
```

打开一个基于终端的界面，用于导航项目的 spec 和 change。

---

### `openspec show` {#openspec-show}

显示某个 change 或 spec 的详情。

```
openspec show [item-name] [options]
```

**参数：**

| 参数        | 必填 | 描述                                  |
| ----------- | ---- | ------------------------------------- |
| `item-name` | 否   | change 或 spec 的名称（省略时会提示） |

**选项：**

| 选项               | 描述                                             |
| ------------------ | ------------------------------------------------ |
| `--type <type>`    | 指定类型：`change` 或 `spec`（无歧义时自动检测） |
| `--json`           | 以 JSON 输出                                     |
| `--no-interactive` | 禁用提示                                         |

**change 专属选项：**

| 选项            | 描述                           |
| --------------- | ------------------------------ |
| `--deltas-only` | 仅显示 delta spec（JSON 模式） |

**spec 专属选项：**

| 选项                     | 描述                                               |
| ------------------------ | -------------------------------------------------- |
| `--requirements`         | 仅显示 requirement，排除 scenario（JSON 模式）     |
| `--no-scenarios`         | 排除 scenario 内容（JSON 模式）                    |
| `-r, --requirement <id>` | 按从 1 开始的索引显示特定 requirement（JSON 模式） |

**示例：**

```bash
# Interactive selection
openspec show

# Show a specific change
openspec show add-dark-mode

# Show a specific spec
openspec show auth --type spec

# JSON output for parsing
openspec show add-dark-mode --json
```

---

## 校验命令 {#cli-27}

### `openspec validate` {#openspec-validate}

校验 change 与 spec 的结构性问题，并将 change 的 MODIFIED requirement 与其将要替换的主 spec 进行比对。

```
openspec validate [item-name] [options]
```

没有任何 spec delta 的 change 会校验失败，除非其 `.openspec.yaml` 声明了 `skip_specs: true`（用于纯重构、工具或文档工作——见 [Recipe 5](examples.md#recipe-5-a-refactor-with-no-behavior-change)）。

**参数：**

| 参数        | 必填 | 描述                             |
| ----------- | ---- | -------------------------------- |
| `item-name` | 否   | 要校验的特定条目（省略时会提示） |

**选项：**

| 选项                | 描述                                                            |
| ------------------- | --------------------------------------------------------------- |
| `--all`             | 校验所有 change 和 spec                                         |
| `--changes`         | 校验所有 change                                                 |
| `--specs`           | 校验所有 spec                                                   |
| `--archived`        | 校验已 archive 的 change 是否已完成所有 task（用于提交前 lint） |
| `--type <type>`     | 名称有歧义时指定类型：`change` 或 `spec`                        |
| `--strict`          | 启用严格校验模式                                                |
| `--json`            | 以 JSON 输出                                                    |
| `--concurrency <n>` | 最大并行校验数（默认：6，或 `OPENSPEC_CONCURRENCY` 环境变量）   |
| `--no-interactive`  | 禁用提示                                                        |

`--archived` 是独立的作用域：它不校验 spec delta（在 archive 时已应用），而是核实 `changes/archive/` 下的每个 change 的 `tasks.md` 中所有复选框都已勾选，只要有未勾选项就以非零码退出。这能捕获那些带着未完成工作被 archive 的 change——在提交前钩子中很方便。

**示例：**

```bash
# Interactive validation
openspec validate

# Validate a specific change
openspec validate add-dark-mode

# Validate all changes
openspec validate --changes

# Validate everything with JSON output (for CI/scripts)
openspec validate --all --json

# Strict validation with increased parallelism
openspec validate --all --strict --concurrency 12

# Fail if any archived change still has unchecked tasks
openspec validate --archived
```

**输出（文本）：**

```
Validating add-dark-mode...
  ✓ proposal.md valid
  ✓ specs/ui/spec.md valid
  ⚠ design.md: missing "Technical Approach" section

1 warning found
```

**输出（JSON）：**

```json
{
  "version": "1.0.0",
  "results": {
    "changes": [
      {
        "name": "add-dark-mode",
        "valid": true,
        "warnings": ["design.md: missing 'Technical Approach' section"]
      }
    ]
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "invalid": 0
  }
}
```

---

## 生命周期命令 {#cli-29}

### `openspec archive` {#openspec-archive}

archive 一个已完成的 change，并将 delta spec 合并进主 spec。

```
openspec archive [change-name] [options]
```

**参数：**

| 参数          | 必填 | 描述                                                                     |
| ------------- | ---- | ------------------------------------------------------------------------ |
| `change-name` | 否   | 要 archive 的 change（省略时会提示；当没有任何东西能应答提示时则为必填） |

**选项：**

| 选项            | 描述                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-y, --yes`     | 跳过确认提示。当没有任何东西能应答提示时必需——AI agent、CI 任务，或任何 stdin 已关闭的运行                                                        |
| `--skip-specs`  | 在一次 archive 运行中跳过 spec 更新。永久没有 spec delta 的 change 应在其 `.openspec.yaml` 中声明 `skip_specs: true`——这样 archive 时无需任何选项 |
| `--no-validate` | 跳过校验（需要确认）。同时禁用 capability 退役——没有校验器的裁决，就不会有东西被退役                                                              |

**示例：**

```bash
# Interactive archive (asks which change, then confirms)
openspec archive

# Archive specific change
openspec archive add-dark-mode

# Archive without prompts (agents, CI, scripts)
openspec archive add-dark-mode --yes

# Archive a tooling change that doesn't affect specs
openspec archive update-ci-config --skip-specs
```

**退役一个 capability：** 将退役标记加入 change 元数据：

```yaml
# openspec/changes/retire-legacy/.openspec.yaml
schema: spec-driven
retire_capabilities: true
```

然后照常 archive 该 change：

```bash
openspec archive retire-legacy --yes
```

**保留你自己的元数据：** 以小写 `x-` 开头的顶层键
归你所有。OpenSpec 从不读取、写入或报告它，因此对于一个携带
工具专属数据的 change，`openspec validate
--strict` 仍会保持通过：

```yaml
# openspec/changes/add-dark-mode/.openspec.yaml
schema: spec-driven
x-tracker: SB-5497
x-jiraKey: ABC-1
```

前缀之后的名称由你选择，大小写或拼写随意，只要它不为空
且不含空白字符即可。有两条限制：前缀本身必须小写，因此 `X-Tracker` 仍会被报告；扩展仅限顶层——
`initiative:` 内部的键无论叫什么都会被拒绝。任何其他无法识别的顶层键仍会被报告为没有效果。

当该 change 移除了 capability 的最后一个 requirement 时，OpenSpec 会删除其
现行的 `spec.md`。同一 change 中其他 capability 的 delta 仍会更新其
主 spec。没有该标记时，archive 会在改动任何文件之前停下，并
告知你添加它。

**它会做什么：**

1. 校验该 change（除非指定 `--no-validate`）
2. 提示确认（除非指定 `--yes`）
3. 在改动任何主 spec 之前占住 archive 目标位置
4. 校验并将活动 delta spec 合并到 `openspec/specs/`——若某 capability 的最后一个 requirement 被该 change 移除，它会被退役且其 spec 文件被删除，但仅当该 change 的 `.openspec.yaml` 在其 `schema:` 旁声明了 `retire_capabilities: true` 时才如此
5. 将 change 文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`
6. 如果在完成 archive 之前 spec 变更或最终移动失败，则恢复 spec，并将该 change 留在或返回到其活动路径
7. 如果已完成的经核验回退副本成功，但暂存源清理失败，则保留完整的 archive 和已提交的 spec 状态以便恢复

**没有终端时：** AI agent、CI 任务，或任何 stdin 已关闭的运行都无法
应答第 2 步，因此 archive 会在触碰任何东西之前停下，以 1 退出，并指出
要重新运行的命令——`openspec archive <name> --yes`，并带上你传入的其他任何选项。请预先传入 `--yes`（以及 change 名称）以跳过这一往返。

---

## 工作流命令 {#cli-31}

这些命令支持由 artifact 驱动的 OPSX workflow。它们既适合人类查看进度，也适合 agent 确定后续步骤。

### `openspec new change` {#openspec-new-change}

在解析出的 OpenSpec 根目录中创建 change 目录以及可选的随仓库提交的元数据。

```bash
openspec new change <name> [options]
```

change 名称必须使用小写 kebab-case：小写字母、数字和
单个连字符。它们不能包含空格、下划线、大写字母、
连续连字符，或首尾连字符。允许以数字开头，
因此你可以给名称加前缀来排序或分级 change，例如 `100-add-feature`
或 `00001-add-auth`。

**选项：**

| 选项                   | 描述                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| `--description <text>` | 添加到 `README.md` 的描述                                               |
| `--goal <text>`        | 可选的 goal 元数据，与 change 一起存储                                  |
| `--schema <name>`      | 要使用的工作流 schema                                                   |
| `--store <id>`         | 用作 OpenSpec 根目录的 store id（store 是你已注册的独立 OpenSpec 仓库） |
| `--json`               | 输出 JSON                                                               |

示例：

```bash
openspec new change add-billing-api
openspec new change add-billing-api --store team-context --json
```

### `openspec status` {#openspec-status}

显示某个 change 的 artifact 完成状态。

```
openspec status [options]
```

**选项：**

| 选项              | 描述                                    |
| ----------------- | --------------------------------------- |
| `--change <id>`   | change 名称（省略时会提示）             |
| `--schema <name>` | schema 覆盖（从 change 的配置自动检测） |
| `--json`          | 以 JSON 输出                            |

**示例：**

```bash
# Interactive status check
openspec status

# Status for specific change
openspec status --change add-dark-mode

# JSON for agent use
openspec status --change add-dark-mode --json
```

**输出（文本）：**

```
Change: add-dark-mode
Schema: spec-driven
Progress: 2/4 artifacts complete

[x] proposal
[x] specs
[ ] design
[-] tasks (blocked by: design)
```

声明了 `skip_specs: true` 的 change 会将其 specs 阶段显示为 `[~] specs (skipped: change declares skip_specs)`，并将其排除在进度计数之外。

**输出（JSON）：**

```json
{
  "changeName": "add-dark-mode",
  "schemaName": "spec-driven",
  "isPlanningComplete": false,
  "isComplete": false,
  "applyRequires": ["tasks"],
  "artifacts": [
    {
      "id": "proposal",
      "outputPath": "proposal.md",
      "status": "done",
      "requires": []
    },
    {
      "id": "specs",
      "outputPath": "specs/**/*.md",
      "status": "done",
      "requires": ["proposal"]
    },
    {
      "id": "design",
      "outputPath": "design.md",
      "status": "ready",
      "requires": ["proposal"]
    },
    {
      "id": "tasks",
      "outputPath": "tasks.md",
      "status": "blocked",
      "requires": ["specs", "design"],
      "missingDeps": ["design"]
    }
  ]
}
```

`isPlanningComplete` 报告每个未被跳过的规划 artifact 是否都已存在；
被跳过的 artifact 计为已满足而无需创建。它不报告
实现 task 是否完成。`isComplete` 作为具有相同值的
兼容性别名保留。

artifact 按依赖顺序列出——依赖项绝不会出现在需要它的东西之后——而
同时变为就绪的 artifact（spec-driven 的 `specs` 和 `design` 都只需要
`proposal`）会保持 schema 声明它们的顺序，而非字母顺序。因此第一个 `ready` 条目
就是接下来要写的 artifact。

---

### `openspec instructions` {#openspec-instructions}

获取用于创建 artifact 或应用 task 的增强指令。AI agent 用它来了解接下来该创建什么。

```
openspec instructions [artifact] [options]
```

**参数：**

| 参数       | 必填 | 描述                                              |
| ---------- | ---- | ------------------------------------------------- |
| `artifact` | 否   | artifact ID，或工作流输入面：`apply` 或 `archive` |

**选项：**

| 选项              | 描述                            |
| ----------------- | ------------------------------- |
| `--change <id>`   | change 名称（非交互模式下必填） |
| `--schema <name>` | schema 覆盖                     |
| `--json`          | 以 JSON 输出                    |

**特殊情况：** 使用 `apply` 获取 task 实现指令。使用
`archive` 可为一个有效的 change 获取当前的只读 archive 输入（`context` 和
`operationGuidance`）；它不会 archive 或更动任何东西。

**示例：**

```bash
# Get instructions for next artifact
openspec instructions --change add-dark-mode

# Get specific artifact instructions
openspec instructions design --change add-dark-mode

# Get apply/implementation instructions
openspec instructions apply --change add-dark-mode

# Get current archive operation inputs without archiving
openspec instructions archive --change add-dark-mode --json

# JSON for agent consumption
openspec instructions design --change add-dark-mode --json
```

**输出包含：**

- artifact 的模板内容
- 来自配置的项目上下文
- 来自依赖 artifact 的内容
- 来自配置的按 artifact 规则
- 对于 `apply`/`archive`，当前项目上下文以及匹配的操作指引

操作输入在每次调用时都从解析出的仓库或选定的 store 读取。项目上下文是
必需的提示级输入：agent 会阅读它并应用相关的项目事实、约定和约束。操作指引是
可选、增补性的建议：agent 会考虑每一条，只遵循那些适用且
与内置 workflow 兼容的条目。这两个字段都与显式用户选择、CLI 控制的状态、内置指令
以及 artifact 规则保持分离。冲突的上下文会被报告；冲突或不适用的
指引不会被遵循，并会解释原因。这些是针对生成式 agent 的行为契约，而非可强制执行的 CLI 检查。`instructions archive`
仅返回选定的 change、可选输入和根目录元数据；它不
包含静态的 archive workflow。

对于通过 `skip_specs: true` 跳过的 artifact，输出只是一条警告（JSON 会增加 `skipped`/`warning` 字段）——该 artifact 不得被创建。

---

### `openspec templates` {#openspec-templates}

显示 schema 中所有 artifact 的已解析模板路径。

```
openspec templates [options]
```

**选项：**

| 选项              | 描述                                   |
| ----------------- | -------------------------------------- |
| `--schema <name>` | 要检查的 schema（默认：`spec-driven`） |
| `--json`          | 以 JSON 输出                           |

**示例：**

```bash
# Show template paths for default schema
openspec templates

# Show templates for custom schema
openspec templates --schema my-workflow

# JSON for programmatic use
openspec templates --json
```

**输出（文本）：**

```
Schema: spec-driven

Templates:
  proposal  → ~/.openspec/schemas/spec-driven/templates/proposal.md
  specs     → ~/.openspec/schemas/spec-driven/templates/specs.md
  design    → ~/.openspec/schemas/spec-driven/templates/design.md
  tasks     → ~/.openspec/schemas/spec-driven/templates/tasks.md
```

---

### `openspec schemas` {#openspec-schemas}

列出可用的 workflow schema，及其描述和 artifact 流程。

```
openspec schemas [options]
```

**选项：**

| 选项           | 描述                                    |
| -------------- | --------------------------------------- |
| `--json`       | 以 JSON 输出                            |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录 |

**示例：**

```bash
openspec schemas
```

**输出：**

```
Available schemas:

  spec-driven (package)
    The default spec-driven development workflow
    Flow: proposal → specs → design → tasks

  my-custom (project)
    Custom workflow for this project
    Flow: research → proposal → tasks
```

---

## Schema 命令 {#schema-commands}

用于创建和管理自定义 workflow schema 的命令。

### `openspec schema init` {#openspec-schema-init}

创建一个新的项目本地 schema。

```
openspec schema init <name> [options]
```

**参数：**

| 参数   | 必填 | 描述                      |
| ------ | ---- | ------------------------- |
| `name` | 是   | schema 名称（kebab-case） |

**选项：**

| 选项                   | 描述                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `--description <text>` | schema 描述                                                   |
| `--artifacts <list>`   | 逗号分隔的 artifact ID（默认：`proposal,specs,design,tasks`） |
| `--default`            | 设为项目默认 schema                                           |
| `--no-default`         | 不提示设为默认                                                |
| `--force`              | 覆盖已存在的 schema                                           |
| `--json`               | 以 JSON 输出                                                  |

**示例：**

```bash
# Interactive schema creation
openspec schema init research-first

# Non-interactive with specific artifacts
openspec schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

**它会创建：**

```
openspec/schemas/<name>/
├── schema.yaml           # Schema definition
└── templates/
    ├── proposal.md       # Template for each artifact
    ├── specs.md
    ├── design.md
    └── tasks.md
```

---

### `openspec schema fork` {#openspec-schema-fork}

将已有 schema 复制到你的项目以便自定义。

```
openspec schema fork <source> [name] [options]
```

**参数：**

| 参数     | 必填 | 描述                                      |
| -------- | ---- | ----------------------------------------- |
| `source` | 是   | 要复制的 schema                           |
| `name`   | 否   | 新 schema 名称（默认：`<source>-custom`） |

**选项：**

| 选项      | 描述             |
| --------- | ---------------- |
| `--force` | 覆盖已存在的目标 |
| `--json`  | 以 JSON 输出     |

**示例：**

```bash
# Fork the built-in spec-driven schema
openspec schema fork spec-driven my-workflow
```

---

### `openspec schema validate` {#openspec-schema-validate}

校验 schema 的结构和模板。

```
openspec schema validate [name] [options]
```

**参数：**

| 参数   | 必填 | 描述                              |
| ------ | ---- | --------------------------------- |
| `name` | 否   | 要校验的 schema（省略时校验所有） |

**选项：**

| 选项        | 描述               |
| ----------- | ------------------ |
| `--verbose` | 显示详细的校验步骤 |
| `--json`    | 以 JSON 输出       |

**示例：**

```bash
# Validate a specific schema
openspec schema validate my-workflow

# Validate all schemas
openspec schema validate
```

---

### `openspec schema which` {#openspec-schema-which}

显示 schema 从何处解析而来（对调试优先级很有用）。

```
openspec schema which [name] [options]
```

**参数：**

| 参数   | 必填 | 描述        |
| ------ | ---- | ----------- |
| `name` | 否   | schema 名称 |

**选项：**

| 选项     | 描述                     |
| -------- | ------------------------ |
| `--all`  | 列出所有 schema 及其来源 |
| `--json` | 以 JSON 输出             |

**示例：**

```bash
# Check where a schema comes from
openspec schema which spec-driven
```

**输出：**

```
spec-driven resolves from: package
  Source: /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven
```

**Schema 优先级：**

1. 项目：`openspec/schemas/<name>/`
2. 用户：`~/.local/share/openspec/schemas/<name>/`
3. 包：内置 schema

---

## 配置命令 {#cli-42}

### `openspec config` {#openspec-config}

查看和修改全局 OpenSpec 配置。

```
openspec config <subcommand> [options]
```

**子命令：**

| 子命令              | 描述                                      |
| ------------------- | ----------------------------------------- |
| `path`              | 显示配置文件位置                          |
| `list`              | 显示所有当前设置                          |
| `get <key>`         | 获取特定值                                |
| `set <key> <value>` | 设置值                                    |
| `unset <key>`       | 移除键                                    |
| `reset`             | 重置为默认值                              |
| `edit`              | 在 `$EDITOR` 中打开                       |
| `profile [preset]`  | 以交互方式或通过预设配置 workflow profile |

**示例：**

```bash
# Show config file path
openspec config path

# List all settings
openspec config list

# Get a specific value
openspec config get telemetry.enabled

# Set a value (disable anonymous usage telemetry)
openspec config set telemetry.enabled false

# Set a string value explicitly
openspec config set user.name "My Name" --string

# Remove a custom setting
openspec config unset user.name

# Set a machine-level default store (fallback root when no --store,
# local root, or project store: pointer resolves)
openspec config set defaultStore team-plans

# Reset all configuration
openspec config reset --all --yes

# Edit config in your editor
openspec config edit

# Configure profile with action-based wizard
openspec config profile

# Fast preset: switch workflows to core (keeps delivery mode)
openspec config profile core
```

**停用遥测：** 未设置时 `telemetry.enabled` 默认为开启（opt-out 模型）。
将其设为 `false` 可禁用匿名使用统计和 `openspec update` 版本检查。
环境变量优先于配置：`OPENSPEC_TELEMETRY=0`、`DO_NOT_TRACK=1`，
以及为真的 `CI` 值（例如 `true`/`1`/`yes`）无论配置值如何，都会禁用遥测。

`openspec config profile` 以当前状态摘要开始，然后让你选择：

- 更改 delivery + workflow
- 仅更改 delivery
- 仅更改 workflow
- 保留当前设置（退出）

如果你保留当前设置，则不会写入任何更改，也不会显示更新提示。
如果没有配置更改，但当前项目文件与你的全局 profile/delivery 不同步，OpenSpec 会显示一条警告并建议运行 `openspec update`。
按下 `Ctrl+C` 也会干净地取消该流程（无堆栈跟踪）并以代码 `130` 退出。
在 workflow 清单中，`[x]` 表示该 workflow 已在全局配置中被选中。要将这些选择应用到项目文件，请运行 `openspec update`（或在项目内被提示时选择 `Apply changes to this project now?`）。

**交互式示例：**

```bash
# Delivery-only update
openspec config profile
# choose: Change delivery only
# choose delivery: Skills only

# Workflows-only update
openspec config profile
# choose: Change workflows only
# toggle workflows in the checklist, then confirm
```

---

## 实用命令 {#cli-44}

### `openspec feedback` {#openspec-feedback}

提交关于 OpenSpec 的反馈。创建一个 GitHub issue。

```
openspec feedback <message> [options]
```

**参数：**

| 参数      | 必填 | 描述                                                        |
| --------- | ---- | ----------------------------------------------------------- |
| `message` | 是   | 反馈摘要；长文本会在 issue 标题中被缩短，并完整保留在正文中 |

**选项：**

| 选项            | 描述                     |
| --------------- | ------------------------ |
| `--body <text>` | 在摘要之后附加的更多细节 |

**要求：** 必须安装并认证 GitHub CLI（`gh`）。

**示例：**

```bash
openspec feedback "Add support for custom artifact types" \
  --body "I'd like to define my own artifact types beyond the built-in ones."
```

---

### `openspec completion` {#openspec-completion}

管理 OpenSpec CLI 的 shell 补全。

```
openspec completion <subcommand> [shell]
```

**子命令：**

| 子命令              | 描述                    |
| ------------------- | ----------------------- |
| `generate [shell]`  | 将补全脚本输出到 stdout |
| `install [shell]`   | 为你的 shell 安装补全   |
| `uninstall [shell]` | 移除已安装的补全        |

**支持的 shell：** `bash`、`zsh`、`fish`、`powershell`

**示例：**

```bash
# Install completions (auto-detects shell)
openspec completion install

# Install for specific shell
openspec completion install zsh

# Generate script for manual installation (bash)
openspec completion generate bash > ~/.bash_completion.d/openspec

# Uninstall
openspec completion uninstall
```

**Windows（PowerShell）：** 为当前 PowerShell 宿主安装补全：

```powershell
$env:PROFILE = $PROFILE
openspec completion install powershell
. $PROFILE
```

`$env:PROFILE` 告诉 OpenSpec 在此会话中要配置哪个 profile。安装程序会创建缺失的 profile 目录，并添加一个加载
`OpenSpecCompletion.ps1` 的受管代码块。重新加载 profile 即可立即启用补全。

要从当前宿主卸载，请运行：

```powershell
$env:PROFILE = $PROFILE
openspec completion uninstall powershell
```

卸载后请重启 PowerShell，以清除当前会话中的补全。

补全是选择加入的。CLI 会在你第一次于交互式终端中运行命令时，在 stderr 上提示一次，之后不再提示——如果你已安装了补全，它也会保持沉默。设置 `OPENSPEC_NO_COMPLETIONS=1` 可完全抑制该提示。

---

## 退出码 {#cli-47}

| 代码 | 含义                         |
| ---- | ---------------------------- |
| `0`  | 成功                         |
| `1`  | 错误（校验失败、文件缺失等） |

---

## 环境变量 {#cli-48}

| 变量                       | 描述                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPENSPEC_TELEMETRY`       | 设为 `0` 以禁用遥测和 `openspec update` 版本检查（覆盖全局配置中的 `telemetry.enabled`）                                                             |
| `DO_NOT_TRACK`             | 设为 `1` 以禁用遥测和 `openspec update` 版本检查（标准 DNT 信号；覆盖配置）                                                                          |
| `OPENSPEC_CONCURRENCY`     | 批量校验的默认并发数（默认：6）                                                                                                                      |
| `EDITOR` 或 `VISUAL`       | `openspec config edit` 使用的编辑器                                                                                                                  |
| `NO_COLOR`                 | 设置后禁用彩色输出                                                                                                                                   |
| `OPENSPEC_NO_ANIMATION`    | 设置后禁用 `openspec init` 的欢迎动画                                                                                                                |
| `OPENSPEC_NO_COMPLETIONS`  | 设为 `1` 以抑制关于 shell 补全的一次性提示                                                                                                           |
| `OPENSPEC_NO_UPDATE_CHECK` | 设置后（任意值，包括空值）禁用 `openspec update` 对更新已发布 CLI 的检查。当 `CI` 已设置（`false`/`0`/`no`/`off` 除外）或 `NODE_ENV=test` 时也会跳过 |
| `npm_config_registry`      | `openspec update` 版本检查所查询的 registry。必须是 `http(s)` URL，否则回退到 `https://registry.npmjs.org`。不会读取 `.npmrc` 文件                   |

---

## 相关文档 {#cli-49}

- [Commands](commands.md) - AI 斜杠命令（`/opsx:propose`、`/opsx:apply` 等）
- [Workflows](workflows.md) - 常见模式以及何时使用各条命令
- [Customization](customization.md) - 创建自定义 schema 和模板
- [Getting Started](getting-started.md) - 首次设置指南
