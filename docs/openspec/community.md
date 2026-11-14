# 社区展示 {#community-1}

一份由社区维护的精选列表，收录使用 OpenSpec 构建以及为 OpenSpec 构建的项目与资源。欢迎工具、集成、workflow 和学习资源。社区成员通过提交 issue 来丰富这份展示，由维护者添加条目。

所列项目由各自的维护者独立维护。被收录并不意味着 OpenSpec 的官方支持或认可。有关安装与支持，请参阅各项目的文档和 issue tracker。

## 项目与资源 {#community-2}

- **[OpenSpec Workbench](https://github.com/VeryComplexAndLongName/OpenSpec-UI)**：在 OpenSpec change 上运行并监督 agent。
- **[openspec-guard](https://github.com/guillaume-flambard/spec-guard)**：CLI 与 GitHub Action，报告哪些 OpenSpec scenario 已被 Vitest 或 Jest 测试覆盖，而无需运行测试。

## 托管服务 {#community-3}

提供 CLI 所不具备的某项 OpenSpec capability 的托管产品。每个条目都会说明其账户、付费和数据处理的条款。

- **[MySpec](https://myspec.dev)**：云端 beta（需要账户；免费档，无需信用卡），以引导式访谈的方式进行 spec 访谈，并导出四文件包或 OpenSpec 兼容的 change。它的 MCP 服务器（`@myspec/mcp-server`）和 [Claude Code 插件](https://github.com/myspecs/claude-plugins)让编码 agent 能够读取这些 spec、写入 OpenSpec change，并逐个 task 地实现它们。该服务会将提交的内容发送给第三方 AI 提供商，并非为敏感数据而设计。
- **[Entalpa](https://entalpa.com/en/openspec)**：将公开 GitHub 仓库的 `openspec/specs/`（最多 300 个 requirement）导入为可浏览的项目，添加干系人（stakeholder）、story 和标记为推断的 open question，并将结果导出为 `openspec/specs/` 目录树；它从不写入该仓库。导入与阅读无需账户；保存或编辑需要账户，且 AI 功能消耗付费额度。导入的内容会被发送给第三方 AI 提供商。
- **[OpenSpec Review](https://skillgild.dev/skills/openspec-review) 与 [OpenSpec Compact](https://skillgild.dev/skills/openspec-compact)**：来自 SkillGild 的托管 skill，适用于 Claude Code、Codex、Cursor、Gemini CLI 或任何 MCP 客户端。Review 将 change 发布为一个链接，任何持有该链接的人无需账户即可批准、请求修改或按 requirement 评论，展示 `openspec archive` 写入后的主 spec，并标记出其他未关闭 change 也涉及的 requirement。Compact 在主 spec 中查找词面上相似的 requirement 和重复的 scenario，并将清理工作写成一个 OpenSpec change。两者都需要 SkillGild CLI 和一个免费账户（每个 skill 每月 25 次运行）。两者都会将 spec 内容发送到 SkillGild 的服务器，这些服务器运行闭源代码且不调用 AI 模型；Review 还会发送 proposal、design 和 tasks，并将该 change 保留 30 天。

## 添加你的项目 {#community-4}

提交一个 issue，写上一行你希望添加的内容：你的项目名称、一个直接链接，以及一段简短描述，说明它与 OpenSpec 的关系。维护者会把它添加到本文件中。

- 让条目聚焦于用 OpenSpec 构建、或支持 OpenSpec 使用的东西，而不是一般性的产品广告。
- 描述人们可以如何使用它。避免宣传性说法、推荐链接和跟踪链接。
- 若存在付费功能或必需账户，请在条目中说明。
- 托管或付费服务只有在提供了 CLI 尚不具备的 OpenSpec capability，并且有免费的试用途径时，才会列入“托管服务”。重新打包 OpenSpec 自带 skill 或命令的服务不予收录。

也欢迎对现有条目提出更正和更新。
