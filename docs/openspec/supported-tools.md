# 支持的工具 {#supported-tools-1}

这份内置（vendored）的 OpenSpec 副本只配置一种 AI 编码工具：**Oh My Pi**（`oh-my-pi`）。`openspec init` 仅提供该目标；上游的其他助手集成并未随包分发。

## 工作原理 {#supported-tools-2}

`openspec init` 把 OpenSpec 的 skill 写入共享的 Agent Skills 文件夹：

```text
.agents/skills/
├── .openspec-target              # 记录在本项目中已设置的工具
└── openspec-<workflow>/SKILL.md
```

Oh My Pi 直接读取 `.agents/skills/`，因此不会创建任何针对具体工具的命令文件或链接。`openspec update` 会读取 `.openspec-target`，并原地刷新同一批文件。

默认情况下，OpenSpec 使用 `core` profile，其中包含：

- `propose`
- `explore`
- `apply`
- `update`
- `sync`
- `archive`

通过 `openspec config profile` 启用扩展 workflow（`new`、`continue`、`ff`、`verify`、`bulk-archive`、`onboard`），然后运行 `openspec update`。

## 如何调用 {#how-to-invoke}

skill 按名称调用：

```text
/openspec-propose "your idea"
/openspec-apply-change
/openspec-archive-change
```

`openspec init` 之后打印的准确提示，对当前项目而言是权威依据。

## 工具目录参考 {#supported-tools-4}

| 工具（ID）            | skill 路径                           | 命令文件           |
| --------------------- | ------------------------------------ | ------------------ |
| Oh My Pi (`oh-my-pi`) | `.agents/skills/openspec-*/SKILL.md` | 不生成（仅 skill） |

## 工具选择 {#supported-tools-5}

`openspec init --tools <ids>` 接受：

- `oh-my-pi`
- `all`（目前是同一个单一目标）
- `none`（仅创建 `openspec/`）

其他任何工具 id 都会被拒绝，并给出明确的 `Invalid tool(s)` 错误；不会映射到 Oh My Pi。
