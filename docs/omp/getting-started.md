# 安装与第一轮任务 {#getting-started}

想用图形界面可直接阅读 [OmpCode 安装指南](/ompcode/getting-started)；本页面向直接使用 OMP 终端的同事。命令块分别标明系统终端与 OMP 输入框，不能混用。

## 下载来源与平台 {#platforms}

只从 [jchanghong023/oh-my-pi Releases](https://github.com/jchanghong023/oh-my-pi/releases) 取得本 Fork。不要照抄上游 npm、Homebrew 或 `omp.sh` 安装来替代。源码支持和本 Fork 二进制分发范围不是同一个承诺。

公开 Release API 本次查询到 `v18.11.1+fork.321`，资产如下；这只是查询时的版本，安装器运行时会重新解析最新发布版，源码需求可能更新于此版本。

| 平台               | 二进制资产             |
| ------------------ | ---------------------- |
| Linux x64，glibc   | `omp-linux-x64`        |
| Linux arm64，glibc | `omp-linux-arm64`      |
| Linux x64，musl    | `omp-linux-musl-x64`   |
| Linux arm64，musl  | `omp-linux-musl-arm64` |
| Windows x64        | `omp-windows-x64.exe`  |

同版还包含 `SHA256SUMS.txt`、`LICENSE`、`THIRD-PARTY-NOTICES.txt` 和 `omp-browser-relay-extension.zip`；浏览器扩展不是运行 OMP 的必装项。此 Fork 不发布 macOS 或 Windows arm64 二进制。Linux 安装器在 macOS 联网前拒绝。Alpine/musl 的发布物还依赖 `libstdc++`、`libgcc`，须按主机管理规范准备，不能把“单个二进制”理解为零系统依赖。

## 安装前先看网络风险 {#network-safety}

::: warning 这是该 Fork 的安全取舍，不是通用安全建议
安装器下载阶段默认放宽 TLS 证书检查。运行时在没有显式设置时也默认 `NODE_TLS_REJECT_UNAUTHORIZED=0`、`GIT_SSL_NO_VERIFY=true`。这会削弱端点身份验证，网络被劫持时有凭据泄露风险。只在已获许可的受控环境使用；版本字符串核对不是密码学来源认证。
:::

运行 OMP 时可显式恢复严格校验，但这**不改变安装脚本自身的放宽策略**。如无法接受安装器策略，应按组织分发流程取得已核验的资产，而不是不加判断执行下载脚本。

PowerShell 运行时严格校验：

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED = '1'
$env:GIT_SSL_NO_VERIFY = 'false'
```

Linux bash/sh 运行时严格校验：

```sh
export NODE_TLS_REJECT_UNAUTHORIZED=1
export GIT_SSL_NO_VERIFY=false
```

Windows 下载优先显式代理环境变量，否则尝试当前用户系统静态代理；curl 遵循 `NO_PROXY`，失败时回退兼容 PowerShell 5.1 的下载路径。PAC/WPAD、socks-only 系统配置并不在该静态代理解析保证内。运行时优先级和限制见 [代理与 TLS](./fork#network)。不要把实际内网地址、Token 或完整代理配置贴到公开问题里。

## Windows x64 安装 {#windows-install}

在 PowerShell 执行源 README 提供的安装入口；它会修改用户 PATH，并可能在无法重命名旧映像时终止安装路径对应的 OMP 进程。先保存正在进行的工作。

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/jchanghong023/oh-my-pi/main/scripts/install.ps1))) -Binary
```

CMD 等价入口：

```bat
curl -fsSL -o "%TEMP%\install-omp.ps1" https://raw.githubusercontent.com/jchanghong023/oh-my-pi/main/scripts/install.ps1 && powershell -NoProfile -ExecutionPolicy Bypass -File "%TEMP%\install-omp.ps1" -Binary
```

默认安装目录是 `%LOCALAPPDATA%\omp`，可在运行安装器前用 `PI_INSTALL_DIR` 指定目录。固定 Release 使用 PowerShell 安装器的 `-Ref`，不是换到上游下载地址。新开终端后核对：

```powershell
omp --version
```

## Linux 安装与离线准备 {#linux-install}

以下在 bash/sh 系统终端执行，自动识别 x64/arm64 和 glibc/musl：

```sh
curl -fsSL https://raw.githubusercontent.com/jchanghong023/oh-my-pi/main/scripts/install.sh | sh -s -- --binary
omp --version
```

默认安装到 `$HOME/.local/bin`，可提前设置 `PI_INSTALL_DIR`；固定版本使用 `--ref`。安装器只安装预编译资产，不替你从源码构建。无公网主机不能运行上述联网下载，应从允许联网的受控机器取得适配目标的发布资产、许可和校验资料，按组织规定传入，再确认执行权限、依赖和 PATH。

内网 Linux/tcsh 的启动环境示例（目录是通用示例，须改为自己的已存在且可访问位置）：

```tcsh
setenv OMP_OFFLINE 1
setenv OMP_CONFIG_ROOT "$HOME/omp-data"
setenv OMP_SKILLS_DIR "$HOME/team-skills"
cd "$HOME/projects/demo"
omp -P work
```

共享 Skill 可选，目录不存在不阻断原有发现。环境已提供 IDE/模型代理启动器时，先按管理员说明启动代理；不要凭本站推断内部模块名或服务地址。OMP 复用已有 Claude Code 配置的 `settings.json` 中 `env.ANTHROPIC_BASE_URL`、`env.ANTHROPIC_AUTH_TOKEN`，默认配置目录 `~/.claude`，可用 `CLAUDE_CONFIG_DIR` 覆盖；不要求再手工复制 Token 到 OMP。修改这些已有配置后要重启 OMP。

::: danger Linux offline 会改变实际数据落点
启用后 OMP 自有数据在 `/dev/shm`，不是直接写 `OMP_CONFIG_ROOT`。启动不恢复旧配置和会话；退出不做最终备份。首次后台备份在就绪十分钟后。使用前阅读 [完整备份和人工恢复步骤](./offline-shm)，不要把它当作透明无损缓存。
:::

## 认证、项目与首次会话 {#first-session}

普通联网场景先确认组织允许使用的 Provider 与已有认证；需要账号绑定的 Provider 使用 TUI 的 `/login`，模型选择使用 `Ctrl+T` 或 `/model`，不在命令行或截图里粘贴真实密钥。模型可用性按上游规则处理，不存在“本站提供免费模型账号”的承诺。

从可信项目目录启动。以下路径仅为示例，目录应已存在：

```powershell
omp --cwd C:\work\demo -P work
```

```sh
omp --cwd "$HOME/projects/demo" -P work
```

`-P work` 等同 `--profile work`，隔离认证、会话、设置、缓存及索引；`-p` 小写是非交互 print，不是 profile。默认允许在主目录启动，但不建议把未知任务直接放到包含私人文件的目录。项目中的规则、扩展、hooks、工具、技能和 MCP 配置属于信任边界，应先确认仓库来源。

在 OMP 输入框先发送一个明确只读任务：

```text
只读查看当前项目 README 和主要入口，说明如何运行及现有验证入口；不要修改文件、运行脚本或安装依赖。无法确认的内容列为未知。
```

观察是否收到模型文本和真实工具结果。普通回复、工具执行成功和任务验收是不同证据。要改文件时另发范围明确的任务；不要用无人值守模式代替第一次权限确认。输入 `/` 看实际命令补全，`@` 选择文件。

## 常用操作与停止 {#session-controls}

| 操作                  | 入口                                                       |
| --------------------- | ---------------------------------------------------------- |
| 继续当前项目最近会话  | 系统终端 `omp -P work -c`                                  |
| 新建/恢复/历史分支    | OMP `/new`、`/resume`、`/tree`                             |
| 只读计划              | `Shift+Tab` 或 `/plan`                                     |
| 当前会话临时模型      | `Ctrl+T` 或 `/switch`；role 用 `/model`                    |
| 中断当前主会话        | `Esc`；Loop 会暂停重复提交                                 |
| 排队补充/引导当前任务 | 运行时 `Ctrl+Q` 排队，普通 `Enter` 引导；详情看 `/hotkeys` |
| 看工具详情            | `/display detailed` 后 `Ctrl+O`                            |
| 压缩/上下文           | `/compact`、`/context`                                     |
| 待办/子代理           | `/todo`、`/hub`                                            |
| 退出                  | `/quit`                                                    |

Team 是后台讨论，按其运行提示或后台任务取消入口停止；主会话一次 `Esc` 不代表所有讨论已停止。Goal 请显式 `/goal-autopilot pause` 或相应 Goal 管理命令。回退对话不撤销已经发生的文件修改。

## 更新、故障与来源 {#update-and-help}

```sh
omp update --stable
omp --version
```

更新走本 Fork Release。`+fork.N` 表示构建号；旧 `-fork.N` 安装（build ≤35）可能拒绝新 tag，需要用安装器重装，不是反复执行旧更新器。`canary` 不适用于此 Fork。运行中的旧进程通常继续使用旧映像，重开才生效；PATH 指向不同文件时按更新器告警核对。

安装失败先保留失败阶段、错误码和安装器给出的恢复命令。验证失败保留旧安装；已验证下载在替换失败时可能保留，PATH 失败可能是“部分完成”，不能一律视为已安装。不要手动删除整个数据根或所有临时文件来试错。诊断日志的安全收集见 [日志与验证边界](./fork#diagnostics)。

来源：[根 README](https://github.com/jchanghong023/oh-my-pi/blob/main/README.md)、[安装器 PowerShell](https://github.com/jchanghong023/oh-my-pi/blob/main/scripts/install.ps1)、[安装器 POSIX](https://github.com/jchanghong023/oh-my-pi/blob/main/scripts/install.sh)、[快速指南](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/quick-start-intranet.md)。本次仅核对公开资产与源文档，没有执行安装器、模型调用或产品验证。
