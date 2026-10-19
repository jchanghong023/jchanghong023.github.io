# OMP 中文快速指南 {#quick-start}

OMP 是终端里的研发助手：用中文描述任务，让它读取代码、解释问题、修改文件并运行命令。本页面向已安装 OMP 的公司 Linux / tcsh 环境。

想了解无人值守、Wiki、Repo、Team、显示模式及红区性能优化，见 [Fork 自有功能](/omp/features)。

## 1. 在项目目录启动 {#start}

**红区启动必须同时设置 `OMP_OFFLINE` 和 `OMP_CONFIG_ROOT`，缺一不可。** 先在系统终端设置，再启动公司 IDE 与模型代理：

```tcsh
setenv OMP_OFFLINE 1
setenv OMP_CONFIG_ROOT "$HOME/omp-data"
ma dmas_ide
ide agent
```

代理就绪后，进入自己的项目目录。将示例路径替换为实际路径：

```tcsh
cd /path/to/project
omp
```

- OMP 复用已有 Claude Code 公司模型配置，不需要另填一份 OMP 凭据；前提是模型代理和认证已就绪。配置改动后需重启 OMP。
- `OMP_CONFIG_ROOT` 必须设置。`$HOME/omp-data` 是示例，请换成管理员认可、你有写权限的持久目录，不要填 `/dev/shm`；以后启动继续使用同一路径，换目录不会自动搬迁旧会话。
- 继续当前项目最近会话：`omp -c`。需要隔离聊天记录和设置时：`omp -P work`；继续该 profile 的最近会话：`omp -P work -c`。
- 若团队提供共享技能，可选设置 `setenv OMP_SKILLS_DIR "/path/to/shared/skills"`，替换为实际共享目录；不使用时无需设置。

## 2. 直接用中文提任务 {#first-task}

以下内容输入 **OMP 输入框**，按 `Enter` 发送。输入 `@` 可选择文件，输入 `/` 可补全命令；不必自己拼工具调用参数。

先从只读任务开始：

```text
阅读当前项目的 README 和主要入口，解释项目怎么运行。只调查，不修改文件。
```

需要修改时，把范围和完成条件说清楚：

```text
分析这个报错的原因，先给证据，再做最小修复并运行相关测试。不要修改无关文件；说明实际运行的命令和结果。
```

OMP 可以真实读写文件、执行终端命令；“让它解释”和“让它实施”是不同任务。运行中按普通 `Enter` 追加消息会引导当前任务；希望本轮结束后再处理，可用 `Ctrl+Q` 排队发送。

## 3. 记住这几个操作 {#commands}

下表命令均在 **OMP 输入框**使用，不是在系统终端执行。

| 操作                           | 用途                       |
| ------------------------------ | -------------------------- |
| `Ctrl+T` 或 `/switch`          | 临时切换当前会话模型       |
| `Shift+Tab` 或 `/plan`         | 切换计划模式，先讨论方案   |
| `/display`                     | 切换干净、紧凑、详细显示   |
| `/display detailed` + `Ctrl+O` | 查看并展开／收起工具详情   |
| `/new` / `/resume`             | 新建会话／恢复历史会话     |
| `/context` / `/compact`        | 查看上下文占用／压缩上下文 |
| `/skill:技能名 任务`           | 从补全中选择技能并调用     |
| `/hotkeys`                     | 查看当前快捷键             |
| `Esc`                          | 在主会话中中断当前任务     |
| `/quit`                        | 退出 OMP                   |

查资料时用 `/wiki` 查看已导入的知识库；查代码时可用 `/repo` 建立当前项目索引，再让助手定位实现。两者都不是首次对话的必需步骤。

## 4. 使用边界 {#boundaries}

- **内网模式不是断网沙箱。** 公司模型仍通过网络接收请求；只提供任务必需的材料，不粘贴密码或 Token，也不要要求访问公网。
- **中断不会撤销已完成的操作。** 重要修改先保留 Git 提交或备份；删除、覆盖、提交与推送等操作应明确限定范围。
- **Linux 内网模式的会话数据在 `/dev/shm`。** 前台就绪满 10 分钟后才首次异步备份，退出不做最终同步，启动也不自动恢复。重启或清理 shm 可能丢失最近成功备份后的记录，备份失败时风险更大；项目源码仍在原位置。

需要安装说明、资料导入或数据恢复细节时，查看[源码仓库中文指南](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/quick-start-intranet.md)；下载入口见[项目 README](https://github.com/jchanghong023/oh-my-pi/blob/main/README.md)。
