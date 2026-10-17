# Git 工具：逐文件提交并推送 {#git-tools}

Git 工具不是完整 Git GUI，只完成“一个逻辑文件一次提交、立即推送”。没有 Clone、分支/Tag 管理、历史浏览、Reset 或 Rebase UI。它会真的改变仓库历史并访问当前 upstream，启动前应确认远端和本次所有待处理变更均可公开到该远端。

## 前置条件与第一次启动 {#workflow}

G-01、G-02、G-17：先自行安装 Git for Windows，使 `git.exe` 可按系统 PATH 原顺序找到。JchTools 不携带、下载或初始化 Git，不从程序目录或仓库挑另一个版本；找不到 Git 只阻止此工具，其他功能不受影响。

1. 用自己的系统 Git 配置身份、认证及目标仓库，确认有检出分支并配置 upstream。未完成 merge/rebase 等中间态先在外部解决。
2. 进入「Git 工具」，选择本地仓库目录；程序验证目录、仓库、当前分支、upstream，任一无效不开始，不自动切分支或改 remote。
3. 检查页面显示的仓库、分支、upstream、待处理数量，确定这次变更都应提交，再启动。
4. 观察当前文件与 add/commit/push/fetch/merge/重试等阶段。只有该文件 push 成功，才计入完成并进入下一个。

本工具沿用同一用户、仓库、继承环境下的系统/用户/仓库/include/includeIf 配置与优先级：身份、凭据助手、SSH、签名、hooks、filters、EOL、合并策略和代理均不被 JchTools 覆盖。不会注入 Windows 代理、清代理强制直连或维护独立认证配置。Git 网络仅用户启动后的当前 upstream，不上传工具诊断日志；停止后不发新网络操作。

## 严格串行与暂存区保护 {#commits}

G-03～G-08：每次逻辑变更走 **单文件 add → 单文件 commit → 单独 push → 成功后下一项**，不能先积累多个 commit 再统一 push，也不能并发。支持新增、修改、删除与 Git 已识别重命名；rename 是一个逻辑变更，提交含旧/新两个路径。

每个 commit 必须核验只含当前变更；启动前已 staged 的其他文件不能混入，不 reset、不 clean、不 checkout 覆盖、不删 staged 内容。按路径限定提交范围，不能安全保证时立即停并说明。已有 staged 变更也应各自独立处理，而不是清空暂存区“解决”。

提交信息固定 `update: 相对路径`，分隔符 `/`；rename 用新路径。正常 push 使用当前分支已有 upstream 的 `git push`，不加另一个远端/分支参数。用户的 hooks 或签名失败仍会真实反映，不能绕过来伪造成功。

## 重试、远端更新与冲突 {#retry-merge}

G-09、G-10：可重试的 add/commit/push 失败不跳文件，当前阶段按 **5 → 10 → 20 → 40 → 80 → 80… 秒无限退避**，直到成功或用户停止。commit 已成但 push 失败只重试 push，不重新 commit。长时间重试可能来自网络、认证或 hooks，查看具体 stdout/stderr 与阶段，不把等待当已完成。

non-fast-forward/fetch-first 等远端新提交拒绝时，自动 fetch 当前 upstream 再按正常 **merge** 合并，不 rebase、不改写历史。合并被本地未提交变更阻挡就停止。`assume-unchanged`/`skip-worktree` 隐藏的本地修改若会被更新覆盖，应在不安全 merge 前检出并停止，保留文件和标记，不清标记、改 filters/EOL 或纳入逐文件清单。

G-11：实际 merge conflict 立即停，保留冲突现场，显示冲突文件、Git 输出、当前文件和阶段；不替用户选 ours/theirs，不清用户合并策略。用户在外部解决未合并条目后，可继续当前任务；合并尚未提交时工具完成无额外改动的合并提交，再 push。不要在未理解冲突前删除仓库或强制推送。

## 停止、重新打开与进度 {#stop-state}

G-12～G-16：点击停止后不再开始下一文件或下次 retry，正在运行的 Git 命令等待自然结束，再停止后续动作；不是立刻杀掉网络命令。已成功 commit 不回滚，已成功 commit+push 的仍成功。如果 commit 成功但 push 尚未成功，停止不承诺自动撤销或恢复任务；先在外部核对 Git 状态与 ahead/upstream 状态，不重复制造提交。

重新扫描以 Git 自身状态为唯一来源，只处理现存未提交变更；已完成且工作区不再显示的文件不重复提交，不另建永久进度库、不深扫所有内容。

页面应显示仓库、branch、upstream、总数/完成数、当前文件、阶段、重试次数及下次等待。当前文件还在重试不计完成；界面持续响应，日志显示真实 stdout、stderr、push/merge 返回、认证与网络原因，而不只是“失败”。

本指南没有访问用户远端或认证系统，不能据此声明真实网络、签名、hooks、认证或任意 Git 环境已经验证；本地 bare 远端测试也只证明其自身覆盖。

## 来源追溯 {#traceability}

::: details Git 与关联编号
G-01、G-02、G-03、G-04、G-05、G-06、G-07、G-08、G-09、G-10、G-11、G-12、G-13、G-14、G-15、G-16、G-17；关联 H-03、P-03。所有来源条目的行为在本页解释，编号不是远端、认证或真实 Git 验收证明。
:::
