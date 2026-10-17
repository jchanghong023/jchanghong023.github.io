# OmpCode 使用指南 {#overview}

OmpCode 将 OMP 的模型、工具和会话能力接入 ZCode 风格的图形工作区。它面向需要看见执行过程、文件变化和多代理协作的使用者，不是上游 ZCode 的全功能复刻，也不是手机远控服务。

正式产品名是 **OmpCode**。源码目录名、内部包名或少数协议标识仍可能带有 ZCode；下载和报告问题请认准 [jchanghong023/OmpCode](https://github.com/jchanghong023/OmpCode)。安装包自带 OMP，无需额外安装一份 OMP；配置、凭据和会话仍由 OMP 持有。

## 按工作目标阅读 {#guides}

| 目标                                 | 指南                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ |
| 下载、校验、打开第一个项目并发送消息 | [安装与快速开始](./getting-started)                                      |
| 了解支持平台、取消项和上游差异       | [产品范围](./fork)                                                       |
| 理解会话核心、问答、审批与辅助对话   | [核心与交互](./omp-core-integration)                                     |
| 使用斜杠命令、索引和编排面板         | [原生命令](./omp-native-commands)                                        |
| 选择 Profile、模型角色、离线根与备份 | [模型与数据](./models-and-commands)                                      |
| 临时模型、草稿、上下文、Git 状态     | [输入区](./composer)                                                     |
| 找到和调用真实可执行技能             | [技能](./skills)                                                         |
| 查看子代理、Todo、附件、扩展与自动化 | [原生集成](./integrations)                                               |
| 阅读代理通信而不改变执行             | [Agent 交互](./agent-interactions)                                       |
| 找回历史、理解队列和故障             | [会话恢复](./session-recovery)                                           |
| 排查长会话卡顿                       | [性能](./performance)与[日志](./logging)                                 |
| 在 CentOS 7 启动兼容包               | [CentOS 7 分发](./centos7-release)与[无 GPU 性能](./centos7-performance) |
| 维护和记录验证边界                   | [三级门禁](./test-gates)与[真实桌面专项](./e2e)                          |

需要命令行工作方式时，可阅读 [OMP 指南](/omp/)；文件整理、格式转换等独立桌面任务见 [JchTools](/jchtools/)。三者不是同一安装包。

## 先分清功能与证据 {#evidence}

本站将源需求整理为使用说明。功能规则、源码中存在实现、某个历史版本测试通过，是三种不同事实；本站建设没有运行 OmpCode、真实模型或产品验收。源文档中的 Windows 历史结果不能自动应用到当前工作树、最新 Release 或 CentOS 包。

当前 AI 测试入口仅面向 Windows，CentOS/Linux/WSL、VM、远程桌面目标环境专项已取消。**取消测试不等于取消 CentOS 7 产品支持，更不等于该环境通过验证。** 完整性校验、桌面专项、模型凭据与发布均有独立边界。

源需求由[官方 Fork 需求索引](https://github.com/jchanghong023/OmpCode/blob/main/docs/requirements/README.md)维护；本站的[来源覆盖表](/coverage)仅证明文档覆盖。索引涉及的核心验收范围为 `Z01` 至 `Z17`，实际定义与缺口见[核心与交互](./omp-core-integration#acceptance)。
