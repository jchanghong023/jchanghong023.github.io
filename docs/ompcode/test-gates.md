# 维护与三级测试门禁 {#overview}

## 先分清三种活动 {#entrypoints}

日常使用不需要运行开发门禁。维护者在源码工作区使用 Node 支持范围 `>=24.0.0`、pnpm 10.33.2；mise 的 Node 24.14.0 是可复现基线，不要求系统 Node 精确相等。安装包使用者不需要安装这些工具。

| 入口                               | 包含内容                                                                                                                          | 实际限时           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `pnpm fastcheck`                   | TypeScript 增量编译、Lint、架构与格式及既有独立模块质量原语；**不跑任何测试**                                                     | 非编译 60 秒       |
| `pnpm fulltest --human-authorized` | 全部 fastcheck 原语、现存适用 Windows 测试、门禁自检、真实 OMP、当前桌面构建/组件/产品 GUI 与同根恢复、未发布本地 unpacked 完整性 | **总墙钟 900 秒**  |
| `pnpm slowtest --human-authorized` | 与 fulltest 相同完整计划仅一次；没有适用 WSL 增量                                                                                 | **总墙钟 1500 秒** |

full/slow 必须有当次明确运行授权，flag 只是授权声明，不能由代理自行赋权。门禁不授权 commit/push、真实发布、系统操作或共享鼠标。三个入口都只在 Windows 本机执行，不调用 CI、GitHub CLI、发布 workflow 或 Computer Use；拒绝 `--publish-releases`。只读 `--plan` 不是执行通过。

::: warning 当前限时优先
源根 README 和历史段落中仍有 full/slow「非编译预算」沿革文字。本页采用当前需求正文：只有 fastcheck 排除纯编译计时后限时；full/slow 包含编译、准备、测试、报告及清理的总墙钟截止。历史更长结果不能作为当前规则的合规证明。
:::

## 一次有效运行必须具备什么 {#environment}

真实 OMP 使用本机已有安装和必要凭据；未安装不为测试下载，缺模型/凭据/二进制或跳过要记录未验证，不能用 fake 或旧缓存核冒充。adapter 编译本身不依赖安装 OMP，不因真实阶段缺环境而跳过离线编译。

全量根、Profile、workspace、认证和证据由专用 fixture 隔离，不连接日常实例。GUI 使用当前真实 Main/Preload/Renderer，保持沙箱和 context isolation，首次引导走公开「跳过」入口，不能改 store 伪造就绪。隐藏不可聚焦的测试启动层、DOM/CDP 驱动和实际窗口状态证据共同证明不抢焦点；仅工具名叫 CDP 或软件渲染不构成隔离证明。

测试启动层阻止协议注册/注册表写入，这些系统集成不在该沙箱验收范围，不能将「被拒绝」写成成功。截图由同 Electron `capturePage` 取，不显示窗口以取得图像。凭据只在测试子进程，不能落截图/报告/认证库。

Electron 组件与产品 GUI 共用运行时，先串行完成 require 所需下载/解压屏障，再安全并行启动消费者，避免同时改可执行文件。已有安装直接复用。adapter staging、桌面产物和 live→同根 cold 有真实依赖屏障，不可为并行而乱序。

## 失败即停、缓存和计时 {#failure}

每次绑定 HEAD、未提交差异、内容指纹、配置和工具版本。源码变了就不能沿用旧结果，不把不同快照局部成功拼成完整 PASS。

任何编译、测试、启动、工具缺失或用例首失败立即停止调度并终止所属进程树，不等挂起同伴/整组 TAP。保留首错，取消阶段不是 PASS；硬截止在失败收尾和清理仍生效。预算参数只能收紧，不能加上限或另给清理时间。

结果统一输出 `status / total / compile_excluded / budgeted / limit`，其中 `budgeted = total - compile_excluded`。只排除实际纯编译活跃且没有非编译工作重叠的区间；Vite 懒编译混在 GUI 阶段保守计费。full/slow 限 total，不以 compile_excluded 延长时间。

复用 tsc composite/incremental、dist/out、Vite 稳定缓存，不 clean、删缓存或切配置制造重编译。独立读阶段有界并行，失败后不再生成额外快照汇总。验证 callback 发现源码变动拒绝 PASS，不能用成功清理覆盖原错。

## 怎样报告验收而不夸大 {#acceptance}

报告命令、退出码、平台、真实/模拟边界、绑定快照、五项计时和各阶段结果。真实 GUI 要证明回复、唯一稳定 UUID、两轮历史与同根重启恢复，不能按自动标题或只看页面存在。工具结果组件只是显示补充，不替代真实模型/冷恢复。

WSL 报 `SKIPPED_NOT_APPLICABLE`；这既不是 WSL 通过，也不使 CentOS 产品支持失效。CentOS/VM/远程桌面目标专项已取消，两平台发布完整性仍独立。fulltest 本地 unpacked 不等于正式安装器或两平台发布，发布成功也不代替 Windows 验收。

共享鼠标/Computer Use 的[真实桌面专项](./e2e)保留独立授权与前置，不能借门禁绕过。缺少安全 GUI/模型条件时明确受阻。

## 历史故障值得保留什么 {#evidence}

源文档按阶段保留旧 Windows-only 前后计划、发布记录、Knip/格式/夹具失败、preload 外置依赖白屏、Electron 首次准备 EBUSY、日志模块浏览器访问 process、Tooltip 复用等证据。它们用于定位失败类别，不是今天应重复执行的所有专项，也不能将历史 FAIL/TIMEOUT 改写为 PASS。

同理，旧 32 秒精简运行、后续完整 slowtest 与各定向成功都只属于其绑定快照；不能用不同版本的成功抵消完整门未通过。Node 精确版本限制已移除，保留实际版本记录、pnpm 检查与所有授权/判据。本站只整理文档，没有运行 fastcheck、fulltest、slowtest、打包或发布 OmpCode。

来源：[三级门禁需求](https://github.com/jchanghong023/OmpCode/blob/main/docs/requirements/test-gates.md)。
