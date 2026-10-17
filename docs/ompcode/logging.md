# 日志、级别与故障证据 {#overview}

## 只用 JCH_LOG_LEVEL {#level}

应用继承 `JCH_LOG_LEVEL`，去首尾空白、忽略大小写，接受 `debug`、`info`、`warning`、`error`，未设/空/无效默认 INFO。特别注意 `warn` 不是有效配置值，内部事件沿用 warn 不改变此解析规则。

| 配置    | 输出范围                            |
| ------- | ----------------------------------- |
| debug   | DEBUG、INFO、WARNING、ERROR，不采样 |
| info    | INFO 及以上                         |
| warning | WARNING、ERROR                      |
| error   | ERROR                               |

在 PowerShell 中只给随后从**该终端**启动的应用进程继承诊断设置：

```powershell
$env:JCH_LOG_LEVEL = 'debug'
```

Linux shell 使用：

```bash
export JCH_LOG_LEVEL=debug
```

随后正常启动所需实例。这些示例不永久修改用户配置；已经启动的父进程/应用不会自动继承新值。生产构建、offline 模式都遵循此级别，不另行压到 error；诊断级别不改变联网策略、连接进度或业务结果。

## 去哪里找当前运行日志 {#files}

日志位于本次实际应用配置目录的 `logs`，先在只读数据目录界面确认活动根；根/Profile、offline 与 `_ompcode` 的区别见[模型与数据](./models-and-commands)。不要按旧 `.zcode` 或固定个人绝对路径寻找。

Main 每次启动生成独立运行标识（启动时间、PID、随机 UUID），活动文件为 `YYYY-MM-DD.<运行标识>.log`，轮转带数字序号；同日重跑或并发 Main 不追加别人的文件。Host/Renderer/服务/OMP 适配器走既有中继汇入 Main，原来源 PID/事件仍保留；协议 stdout 不写日志，适配器诊断走 stderr。

单文件最多 1,048,576 字节，活动加 writer 拥有的历史最多十个，并保留十四天年龄限制。按 UTF-8 完整记录轮转，不截断旧历史；只清理严格匹配命名的普通文件，不删除无关文件、目录或符号链接。日志保留是有界诊断，不是完整审计或长期备份。

## 日志自身失败时 {#failure}

共享模块负责无 IO 的级别解析，Main 独占异步 writer：25ms 合批、有界队列、正常退出共用一秒 flush。过载丢弃会报告数量，不是 DEBUG 采样；强杀/磁盘失败可能丢尾部。

普通日志目录失败后仅尝试一次既有用户级 fallback，再保留 stderr，日志异常不改变业务返回或无限递归。隔离测试目录不能逃逸到日常根。Host 原始输出遇到 EBADF/EPIPE 不终止进程，仍经结构化通道；其他错误保留安全类型/代码。Web/Renderer 无 Node process 时使用浏览器 sink，不补造 PID 或访问 stderr。

## 向维护者提供什么 {#diagnosis}

记录操作入口、平台、应用/OMP 版本、当前运行根/Profile（公开前泛化路径）、稳定 session ID、请求/事件关联和最早失败阶段。OMP 对接日志应能串起 started→result、耗时、进程实例与安全计数，区别启动、发送、超时、解码、取消和退出。

日志不应含用户输入、模型正文、问答答案、附件字节、全量环境、完整协议或请求/响应正文；异常消息、URL 查询、Authorization、Cookie 等须脱敏限长。提交问题前仍人工移除秘密与私有项目内容，不要上传整个配置根或认证数据库。

若文件日志不存在，先看启动 stderr 和目录/权限错误；不能因日志缺失认定模型没执行，也不能为生成样例主动写日常用户数据。

## 验证范围 {#evidence}

源记录包含级别、fallback、多字节轮转、进程独立文件与隐藏 Electron 转发的隔离短验证；部分跨日、链接保护和删除失败分支只有静态核对，未代表完整桌面、真实 OMP 或 CentOS 验收。日志能写只证明该链路，不证明业务调用成功。本站没有执行日志样例、产品或模型。

来源：[日志基础设施需求](https://github.com/jchanghong023/OmpCode/blob/main/docs/requirements/logging.md)。
