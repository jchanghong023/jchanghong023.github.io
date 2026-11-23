# Rust Knowledge Server {#start}

Rust Knowledge Server 是面向内网的 Markdown 技术知识库。通过 Web 导入技术手册、规范和故障记录，开发者和 Agent 都能搜索同一批已发布资料，定位并核对原文。

## 项目特点 {#features}

- **按技术词查原文。** 严格模式保留符号和词序，区分 `March C-` 与 `March C+`，也能用完整参数 `-xprop=tmerge` 或报错原文检索。没有完整匹配就返回空，不用弱相关结果补足。
- **优先展示能回答问题的正文。** 同为字面命中，有正文支撑的小节标题优先于普通提及，目录和索引靠后。查询 `IEEE 1149.1 TRST optional` 这类“标准号 + 主题”时，优先展示同时支持目标标准和所查主题的段落。
- **命中可核对，原文可续读。** 结果返回原文摘录、相对路径和行号。MCP 区分精确命中与相关参考，并提供实际命中行和可核实的章节标题。搜索结果可翻页，也能按引用向前或向后补读同一发布版本的连续原文。重复摘录合并展示，各出处仍可独立回读。
- **重导不中断旧版查询。** 新索引建好后才整体切换；重导失败时旧版仍可查。一次查询不会混用新旧版本，失效的原文引用也不会跳到新版的同一行。
- **单个可执行文件即可部署。** Web、只读 MCP 和索引运行在同一进程，无需单独部署数据库。关键词检索无需模型；可按需配置语义检索和重排。

## 启动 {#launch}

### Windows x64 {#windows}

在可执行文件所在目录打开 PowerShell：

```powershell
.\rust-knowledge-server.exe
```

数据保存在 `~/.rust-knowledge-server`，机器重启后保留。

### CentOS 7 x64 {#centos}

从 [GitHub Releases](https://github.com/jchanghong023/rust-knowledge-server/releases) 下载 `rust-knowledge-server-centos7-x86_64.tar.gz` 并解压。

```sh
./rust-knowledge-server
```

数据保存在 `/dev/shm/rust-knowledge-server`，重启服务保留，**重启机器清空**。请另存原始 Markdown。

本机 Web 地址：<http://10.239.93.104:9333/>。

## Web {#web}

- **知识库管理**：创建、删除知识库；支持上传 UTF-8 Markdown 文件或文件夹，也支持从服务器可读的绝对路径导入。重新导入会替换整个库。
- **导入状态**：显示上传、索引和发布进度；已发布的库可查看收录文件。
- **搜索**：支持按知识库和相对路径筛选，返回原文摘录、文件路径和行号。
- **活动记录**：操作按自报工号留痕，不验证身份。任何能访问网页的人都能查看最近 30 天的登记工号及其保留的操作记录。

服务器路径按服务进程权限读取，不检查访问者个人的文件权限。

## MCP {#mcp}

`/mcp` 提供两个只读工具，无需登记工号：

- `knowledge_search`：搜索已发布的知识库，返回原文和出处。
- `knowledge_fetch`：按搜索命中的 `ref` 补读附近原文。

**Claude Code**（在项目终端运行）：

```sh
claude mcp add --transport http knowledge http://10.239.93.104:9333/mcp
```

**OMP**：配套版本无需配置；其他版本在 OMP 会话内输入：

```text
/mcp add knowledge --url http://10.239.93.104:9333/mcp
```

远程部署时，两个命令中的地址都换成服务的实际 `/mcp` 地址。

[技术方案](https://github.com/jchanghong023/rust-knowledge-server/blob/main/openspec/changes/add-standalone-knowledge-server/design.md) · [部署与验收](https://github.com/jchanghong023/rust-knowledge-server/blob/main/openspec/changes/add-standalone-knowledge-server/tasks.md#4-%E9%83%A8%E7%BD%B2%E9%AA%8C%E6%94%B6) · [MCP 接口](https://github.com/jchanghong023/rust-knowledge-server/blob/main/openspec/changes/add-standalone-knowledge-server/specs/knowledge-mcp/spec.md)

## OMP 多人协作：`/collab2` {#collab2}

需使用支持 `/collab2` 的 OMP 版本。在 Windows 或 CentOS 7 的 OMP 终端中：

1. A 输入 `/collab2 xxx`，用房间号 `xxx` 分享当前会话。
2. B、C 各自输入 `/collab2 join xxx`。不用工号，三人都能向 A 的 Agent 发消息。
3. A 输入 `/collab2 stop` 或切换会话后，旧房间不能再加入。

同机无需配置，OMP 默认连接 `127.0.0.1:9333`。跨机时，三人在启动 OMP 前都将 `OMP_COLLAB2_IP` 设为知识库的同一个内网 IP，端口仍是 `9333`。

OMP_OFFLINE 环境变量下，默认为10.239.93.104

知识库 Web、MCP 和房间查询用 HTTP，协作用 WS，无需 HTTPS 或证书。只在可信隔离内网使用，并只把房间号分享给信任的同事。
