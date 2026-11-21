# Rust Knowledge Server {#start}

把 Markdown 资料导入知识库，在网页搜索，或用 Claude Code、OMP 查询。结果附原文片段、文件路径和行号。 [项目仓库与部署说明](https://github.com/jchanghong023/rust-knowledge-server)

## 在本机启动 {#launch}

从管理员处取得对应平台的可执行文件，在文件所在目录运行。

**Windows x64（PowerShell）**

```powershell
.\rust-knowledge-server.exe --listen 127.0.0.1:9333
```

**CentOS 7 x64**

```sh
./rust-knowledge-server --listen 127.0.0.1:9333
```

启动后打开 `http://127.0.0.1:9333`。使用共享服务时，向管理员获取访问地址。工号仅用于留痕，共享服务的访问范围由管理员限制。

## 导入和搜索 {#search}

1. 在网页登记 8 位数字工号，创建知识库。
2. 上传 UTF-8 编码的 Markdown 文件或文件夹。
3. 等待导入成功，在网页输入问题或关键词。

重新导入会替换整个知识库，请上传要保留的全部文件。CentOS 7 上机器重启会清空知识库，请保存原始 Markdown，重启后重新导入。

## 在编码助手里查询 {#mcp}

使用配套 OMP 时，启动知识库服务后可直接提问。使用 Claude Code 连接本机服务时，在项目目录运行以下命令，再用 `/mcp` 检查连接。

```sh
claude mcp add --transport http knowledge http://127.0.0.1:9333/mcp
```
