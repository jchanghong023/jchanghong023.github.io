# OMP Fork：项目简介与内网快启 {#quick-start}

## 1. 与上游的差异和贡献 {#upstream}

截至 2026-11-22，[本 Fork](https://github.com/jchanghong023/oh-my-pi) 的 `main`（`28fdf1a48d`）比[上游](https://github.com/can1357/oh-my-pi) `main`（`e1a9f4b41d`）领先 **1,573 个提交**（含合并提交），落后 0 个。`jchanghong023` 向上游提交了 [**81 个 PR**](https://github.com/can1357/oh-my-pi/pulls?q=is%3Apr+author%3Ajchanghong023)。

## 2. 项目哲学 {#philosophy}

做一个个人开箱即用的 Agent：从红区 CentOS 7 到黄区 Windows 和自己的 Linux 机器，都用同一个 OMP。**默认零配置**：模型服务和凭据就绪后，无需手写 OMP 配置文件。

## 3. 下载 {#download}

- [CNB Releases](https://cnb.cool/jchanghong/bin/-/releases)：优先下载，发布更快。
- [GitHub Releases](https://github.com/jchanghong023/oh-my-pi/releases)：定期同步。

## 4. 红区快速使用 {#red-zone}

在 CentOS 7 上将 `omp-linux-x64` 安装为 `PATH` 上的 `omp`。红区必配 `OMP_OFFLINE` 和 `OMP_CONFIG_ROOT`；在 tcsh 中执行，代理就绪后再运行 `omp`：

```tcsh
setenv OMP_OFFLINE 1
setenv OMP_CONFIG_ROOT "$HOME/omp-data"
ma dmas_ide
ide agent
cd /path/to/project
omp
```

### 环境变量与数据 {#environment}

- `OMP_CONFIG_ROOT`：持久数据目录，存放配置、凭据和会话；可换成其他可写的绝对路径，旧数据不会自动迁移。
- `OMP_CACHE_DIR`：可选性能目录；红区 Linux 默认使用 `/dev/shm/omp-<UID>`，缓存、统计、日志和运行依赖可能在重启后丢失，不放唯一副本。
- `OMP_SKILLS_DIR`：可选团队共享技能目录，例如 `setenv OMP_SKILLS_DIR "/path/to/shared/skills"`；用 `/extensions` 查看或启停共享技能，不改共享文件。

红区模式会暂时关闭 Web Search、Browser（含 `/crawl`）、AST Edit 和 Fetch；本地文件和已配置、可达的内网服务仍可使用。[更多运行约定](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/fork-runtime/spec.md)

## 5. 黄区快速使用 {#yellow-zone}

- `OMP_OFFLINE`：不设置。
- `OMP_CONFIG_ROOT`：可选，指定持久数据目录。
- `ASCEND_API_KEY`：仅使用 Ascend 时设置。

## 6. 本 Fork 的主要功能 {#features}

### 启动与交互 {#startup}

- **更轻的启动与红区 NFS 优化**：在上游基础上省掉默认更新检查、延后 Python 检查；红区把高频缓存移到 `/dev/shm`，减少目录扫描和终端重绘。[运行规格](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/fork-runtime/spec.md)
- **中文终端与三种显示模式**：常用设置、模型选择和授权界面用中文；`/display clean` 专注聊天，`/display compact`（默认）显示活动与本轮 Diff，`/display detailed` 查看完整工具记录。[界面规格](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/tui-presentation/spec.md)
- **内网群聊**：主持人 `/collab2 1234`，同事 `/collab2 join 1234`，多人向同一个 Agent 发消息；跨机时各端 `OMP_COLLAB2_IP` 填同一个配套知识库服务的 IP（端口 `9333`），仅限可信隔离内网。来宾用 `/leave` 退出，主持人用 `/collab2 stop` 关房。

### 内置开源工具与技能 {#tools-and-skills}

- **[OpenSpec](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/spec-driven-orchestration/spec.md)**：无需另装工具，用 `omp openspec init` 初始化项目，再用 `/skill:openspec-propose` 把需求变成可评审、可实施的变更，产物正文默认用中文。
- **[OpenWiki](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/openwiki/spec.md)**：在仓库运行 `omp openwiki code --init` 生成中文代码 Wiki，之后用 `omp openwiki code --update` 更新；聊天里可查已有 Wiki，再核对关键源码。
- **Superpowers 与常用技能**：用 `/skill:brainstorming` 梳理方案、`/skill:jch-grill-me` 追问澄清、`/skill:jch-grill-todo` 生成任务清单、`/skill:jch-codebase-design` 讨论接口和模块设计。

### 多代理与无人值守 {#multi-agent}

- **[Team](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/team-discussion/spec.md)**：`/team 比较两种可行方案并给出证据`，让多个代理独立调查、交叉审查并汇总，只读不实施；用 `/team configure` 选成员模型。
- **[Goal Autopilot](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/goal-autopilot/spec.md)**：退出计划模式后，用 `/goal-autopilot 按清单实施并完成必要验证` 运行长任务；用 `/goal-autopilot pause` 暂停，不绕过工具权限或预算。
- **按清单执行**：先用 `/todoloop tasks.md --check` 预检，再用 `/todoloop tasks.md` 按组执行 Markdown 待办；按 `Esc` 停止，已完成项保留。
- **按需编排**：`/orchestrate 拆分独立任务并行实现并统一验证` 分派子代理，`/workflowz 按模块并行调查并汇总证据` 组织批量工作，`/ultrathink 分析故障根因` 先做深入分析。

### 其他常用入口 {#other-commands}

- **两区通用**：`omp -c` 续会话，`omp -P work` 用独立档案；`/` 找命令，`@` 找文件，`Ctrl+T` 换模型，`Shift+Tab` 进计划模式；终端可用 `omp read ./README.md` 读取文件。
- **内置单测和画布**：`/dt` 生成或修复单测；`/sketch` 手绘或贴图标注后添加为附件，红区需手动打开显示的完整地址。
- **工作区和循环**：`/workspace` 提醒 Agent 限定写入范围（不是沙箱），`/minimal` 要求最小改动和验证，`/loopn "检查" "复核"` 轮换提示词（`Esc` 停止）；Linux IBus/X11 输入异常可试 `/jchime`。[命令规格](https://github.com/jchanghong023/oh-my-pi/blob/main/openspec/specs/personal-commands/spec.md)
- **沿用上游的入口**：`/advisor on` 开启第二模型复审；`/loop 2 检查当前改动` 首轮后最多再跑两轮（`Esc` 暂停，再输 `/loop` 关闭）；`/goal 修复当前项目的构建错误` 设置普通目标（`/goal pause` 暂停）。

浏览器聊天沿用上游：[原生 `/collab`](https://github.com/jchanghong023/oh-my-pi/blob/main/docs/collab.md#web-client) 可通过邀请链接让浏览器加入已有会话，[Chrome 侧栏](https://github.com/jchanghong023/oh-my-pi/blob/main/packages/browser-relay/README.md#setup)也能发起聊天；本 Fork 已移除独立 WebGUI，`/collab2` 是终端入口。
