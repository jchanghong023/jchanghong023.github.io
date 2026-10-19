# JCH 技能清单 {#jch-skills}

[JCH](https://github.com/jchanghong023/jch) 提供可复用的 Agent 技能。使用时明确点名技能；测试、推送等操作仍按项目授权执行。

## jch-* 技能（26 项） {#jch-catalog}

| 技能名称                                                                                                                                      | 功能                                                         | 使用场景                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| [jch-ai-code-quality-gate](https://github.com/jchanghong023/jch/blob/main/skills/jch-ai-code-quality-gate/SKILL.md)                           | 建立 Rust、Python 质量门禁，检查并修复问题。                 | 给 AI 开发的项目补齐质量基线。                              |
| [jch-benchmark-cpu](https://github.com/jchanghong023/jch/blob/main/skills/jch-benchmark-cpu/SKILL.md)                                         | 测量 CPU 单进程与多进程处理能力。                            | 比较机器性能与并行效率。                                    |
| [jch-clarify-dft-requirement](https://github.com/jchanghong023/jch/blob/main/skills/jch-clarify-dft-requirement/SKILL.md)                     | 只读调查代码和文档，解释 DFT 需求。                          | 新人需要理解芯片测试需求与改动方向。                        |
| [jch-code-simplification](https://github.com/jchanghong023/jch/blob/main/skills/jch-code-simplification/SKILL.md)                             | 不改变行为，精简代码和重复逻辑。                             | 功能正常，但代码难以维护。                                  |
| [jch-codebase-map](https://github.com/jchanghong023/jch/blob/main/skills/jch-codebase-map/SKILL.md)                                           | 梳理目录、入口和架构，生成中文导读。                         | 接手陌生代码库。                                            |
| [jch-compare-directories](https://github.com/jchanghong023/jch/blob/main/skills/jch-compare-directories/SKILL.md)                             | 比较目录中的相同、缺失、改名和修改文件。                     | 核对两份工程或交付物。                                      |
| [jch-directory-space-report](https://github.com/jchanghong023/jch/blob/main/skills/jch-directory-space-report/SKILL.md)                       | 统计目录和文件的逻辑大小并排名。                             | 查找占用较大的目录。                                        |
| [jch-expert-file-review-and-fix-loop](https://github.com/jchanghong023/jch/blob/main/skills/jch-expert-file-review-and-fix-loop/SKILL.md)     | 并行逐文件审查修复，支持进度恢复。                           | 大范围逐文件检查，中断后还要继续。                          |
| [jch-expert-review-and-fix-loop](https://github.com/jchanghong023/jch/blob/main/skills/jch-expert-review-and-fix-loop/SKILL.md)               | 审查、最小修复，再独立复核。                                 | 需要完整的缺陷修复闭环。                                    |
| [jch-fastcheck-fulltest-slowtest-gates](https://github.com/jchanghong023/jch/blob/main/skills/jch-fastcheck-fulltest-slowtest-gates/SKILL.md) | 建立三级测试，增量复用通过结果，先测高风险项，失败立即停止。 | 整理项目测试流程，减少重复等待；见[使用说明](#test-gates)。 |
| [jch-git-file-uploader](https://github.com/jchanghong023/jch/blob/main/skills/jch-git-file-uploader/SKILL.md)                                 | 将准备好的 7-Zip 分卷逐文件提交推送。                        | Windows 下上传分卷，或恢复中断上传。                        |
| [jch-grill-me](https://github.com/jchanghong023/jch/blob/main/skills/jch-grill-me/SKILL.md)                                                   | 逐个提问并给推荐答案，审视方案取舍。                         | 实现前把设计想清楚。                                        |
| [jch-gui-android-tui-e2e-repair](https://github.com/jchanghong023/jch/blob/main/skills/jch-gui-android-tui-e2e-repair/SKILL.md)               | 经真实 GUI、Android 或 TUI 复现和修复。                      | 排查实际界面问题并沿原路径回归。                            |
| [jch-handoff-prompt](https://github.com/jchanghong023/jch/blob/main/skills/jch-handoff-prompt/SKILL.md)                                       | 整理进度、约束和下一步的接力提示词。                         | 换会话或换 Agent 继续任务。                                 |
| [jch-large-scale-bug-review](https://github.com/jchanghong023/jch/blob/main/skills/jch-large-scale-bug-review/SKILL.md)                       | 并行只读审查，输出有证据的缺陷。                             | 大型代码库排查，不执行代码或修复。                          |
| [jch-logging-init](https://github.com/jchanghong023/jch/blob/main/skills/jch-logging-init/SKILL.md)                                           | 初始化或复用日志基础设施。                                   | 项目缺少统一日志，不顺带埋业务日志。                        |
| [jch-parallel-review-fix](https://github.com/jchanghong023/jch/blob/main/skills/jch-parallel-review-fix/SKILL.md)                             | 编排并行审查修复，最终测试独立进行。                         | 多模块同时修复，分开实现与验收。                            |
| [jch-project-init](https://github.com/jchanghong023/jch/blob/main/skills/jch-project-init/SKILL.md)                                           | 建立或更新 Agent 规则与权威需求目录。                        | 新项目初始化，或补齐旧项目文档。                            |
| [jch-qu-ai-wei](https://github.com/jchanghong023/jch/blob/main/skills/jch-qu-ai-wei/SKILL.md)                                                 | 减少中文稿件的 AI 腔，保留事实与语气。                       | 文字生硬、套路化，需要自然改写。                            |
| [jch-requirements-interview-rebuild](https://github.com/jchanghong023/jch/blob/main/skills/jch-requirements-interview-rebuild/SKILL.md)       | 逐项访谈用户，重建真实需求文档。                             | 旧需求与用户实际想法有偏差。                                |
| [jch-rust-perf-tracing](https://github.com/jchanghong023/jch/blob/main/skills/jch-rust-perf-tracing/SKILL.md)                                 | 添加可由 Cargo feature 关闭的性能计时。                      | 为 Rust 项目搭建长期性能观测基础。                          |
| [jch-test-timing-report](https://github.com/jchanghong023/jch/blob/main/skills/jch-test-timing-report/SKILL.md)                               | 为现有测试补充逐条 JUnit 耗时报告。                          | 找出慢测试，不更换测试框架。                                |
| [jch-tests](https://github.com/jchanghong023/jch/blob/main/skills/jch-tests/SKILL.md)                                                         | 补齐公开接口测试，精简低价值旧用例。                         | 功能缺少测试，或测试体系需要整理。                          |
| [jch-upstream-pr-convergence](https://github.com/jchanghong023/jch/blob/main/skills/jch-upstream-pr-convergence/SKILL.md)                     | 跟进本人上游 PR，处理冲突与 CI 问题。                        | 让多个待合并 PR 保持可审查状态。                            |
| [jch-upstream-pr-extractor](https://github.com/jchanghong023/jch/blob/main/skills/jch-upstream-pr-extractor/SKILL.md)                         | 从 Fork 差异中提取通用修复并提交 PR。                        | 将自有改动中适合的修复贡献上游。                            |
| [jch-upstream-sync](https://github.com/jchanghong023/jch/blob/main/skills/jch-upstream-sync/SKILL.md)                                         | 同步真实上游，保留本地需求及镜像分支。                       | 持续跟进上游开发分支。                                      |

## dft-* 技能（13 项） {#dft-catalog}

| 技能名称                                                                                                                              | 功能                                      | 使用场景                               |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------- |
| [dft-ai-code-quality-gate](https://github.com/jchanghong023/jch/blob/main/skills/dft-ai-code-quality-gate/SKILL.md)                   | 建立 Rust、Python 质量门禁并修复问题。    | 给 AI 维护的工程建立质量基线。         |
| [dft-clarify-requirement](https://github.com/jchanghong023/jch/blob/main/skills/dft-clarify-requirement/SKILL.md)                     | 结合代码、Wiki、Repo 只读澄清 DFT 需求。  | 新人需要理解需求背景、术语与改动方向。 |
| [dft-code-simplification](https://github.com/jchanghong023/jch/blob/main/skills/dft-code-simplification/SKILL.md)                     | 保持行为不变，精简代码。                  | 工程重复逻辑多、维护容易遗漏。         |
| [dft-codebase-map](https://github.com/jchanghong023/jch/blob/main/skills/dft-codebase-map/SKILL.md)                                   | 梳理代码结构，生成中文新人导读。          | 快速熟悉陌生工程。                     |
| [dft-compare-directories](https://github.com/jchanghong023/jch/blob/main/skills/dft-compare-directories/SKILL.md)                     | 比较目录内容，报告缺失、改名和修改。      | 核对工程副本或交付目录。               |
| [dft-directory-space-report](https://github.com/jchanghong023/jch/blob/main/skills/dft-directory-space-report/SKILL.md)               | 统计文件逻辑大小和目录排名。              | 定位大目录，不等同于实际磁盘占用。     |
| [dft-handoff-prompt](https://github.com/jchanghong023/jch/blob/main/skills/dft-handoff-prompt/SKILL.md)                               | 生成包含进度和待办的接力提示词。          | 跨会话或换 Agent 继续工作。            |
| [dft-knowledge-pipeline-evaluation](https://github.com/jchanghong023/jch/blob/main/skills/dft-knowledge-pipeline-evaluation/SKILL.md) | 评估文档解析、索引、检索、耗时和内存。    | 核对真实知识处理链路的质量与成本。     |
| [dft-logging-init](https://github.com/jchanghong023/jch/blob/main/skills/dft-logging-init/SKILL.md)                                   | 初始化日志，处理团队存储与多用户归属。    | 内网共享工程需要统一日志基础。         |
| [dft-project-init](https://github.com/jchanghong023/jch/blob/main/skills/dft-project-init/SKILL.md)                                   | 建立或更新工程规则和需求目录。            | 初始化 AI 开发工程或补齐文档。         |
| [dft-st-minimal-circuit-validation](https://github.com/jchanghong023/jch/blob/main/skills/dft-st-minimal-circuit-validation/SKILL.md) | 为 ST 目标构建最小有效电路并验证结果。    | 减少大电路测试开销。                   |
| [dft-test-timing-report](https://github.com/jchanghong023/jch/blob/main/skills/dft-test-timing-report/SKILL.md)                       | 为既有测试添加耗时报告，适配 EDA 运行器。 | 查找内网工程中的慢测试。               |
| [dft-tests](https://github.com/jchanghong023/jch/blob/main/skills/dft-tests/SKILL.md)                                                 | 补齐公开入口测试，整理遗留用例。          | 为 DFT 工程补充有效行为保护。          |

## 三级测试：少重复，先测风险，失败就停 {#test-gates}

`jch-fastcheck-fulltest-slowtest-gates` 用来为项目建立或调整测试流程，保留原有检查和通过标准。

### 三个级别有什么区别 {#test-levels}

| 级别        | 做什么                                                                      |
| ----------- | --------------------------------------------------------------------------- |
| `fastcheck` | 静态检查、格式和编译，不运行测试。                                          |
| `fulltest`  | 包含快速检查，再运行本机适用的自动化测试。                                  |
| `slowtest`  | 包含完整测试；项目需要且环境可用时，再加 WSL 测试。否则与完整测试范围相同。 |

### 这次更新了什么 {#test-improvements}

1. **增量测试，避免重复跑。** 相关代码、配置和依赖没变，已通过的有效结果可以复用；受改动影响、没测过、上次失败或中断的部分重新跑。不是只看本次改了哪些文件，更不会漏掉必需测试。
2. **容易出错的先测。** 优先检查最近失败过的、本次改动风险较大的，以及容易出错的接口和配置；不是简单按耗时排序。能安全并行的仍然并行，尽早发现问题。
3. **失败就停整轮。** 任何阶段出错，立即停止后续测试，并停止本轮其他并行任务；不等整套跑完，不在本轮自动重试。没跑或被取消的部分不会算作通过。

结果会分清哪些是本次实际运行、哪些复用了通过结果，以及哪些还没完成。

### 怎么使用 {#use-test-gates}

需要给项目搭建或更新测试流程时，直接对 Agent 说：

```text
使用 jch-fastcheck-fulltest-slowtest-gates 更新当前项目的三级测试流程：保留现有测试和检查标准，支持增量复用，优先运行高风险项，任何失败立即停止。
```

项目已有测试入口，只想运行时，直接说“运行 fulltest”或“运行 slowtest”，不需要重新搭建。完整和慢速测试需明确要求执行；测试本身不包含发布、触发 CI 或接管你的鼠标。
