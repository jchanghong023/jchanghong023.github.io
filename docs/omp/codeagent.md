# 黄区 CodeAgent 怎么用 {#codeagent}

**Windows 黄区使用：先下载 JchTools，登录公司 CodeAgent，再让 OMP 使用内置 CodeAgent 模型。** 需要能访问公司服务的网络与有效账号；不是红区 `OMP_OFFLINE` 用法。

使用 Ascend 密钥的同事，直接看 [黄区 Ascend 启动步骤](/omp/#ascend)，不需要下面的 JchTools 和 CodeAgent 登录流程。

## 1. 下载 JchTools，完成登录 {#prepare}

- 从 [JchTools Releases](https://github.com/jchanghong023/JchTools/releases) 下载 Windows 安装包或便携 ZIP，安装或完整解压后打开。
- 在公司提供的 **CodeAgent 客户端**中完成登录。JchTools 不代替登录，只维护已有登录凭据。
- CodeAgent、JchTools 和 OMP 要在**同一 Windows 用户**下运行；凭据不能直接从别人的电脑或账号复制过来使用。
- 本文假设已安装本 Fork 的 `omp`；未安装时见 [OMP 下载与安装](https://github.com/jchanghong023/oh-my-pi)。

## 2. 打开 Token 自动维护 {#token}

在 JchTools 左侧选择 **开发 → CodeAgent**。打开页面就会启动或连接独立后台，不需要另敲服务命令。

等待首次检查，确认后台正在运行，最近结果为：

- **已更新注册表 Token**，或
- **Token 未变化，无需写入**。

默认每 **60 秒**检查一次，可在页面修改间隔。JchTools 将当前用户的本地凭据解密后维护到当前用户注册表，OMP 自动读取，**不用手工复制 Token、设置 API Key 或填写模型地址**。

关闭 JchTools 窗口后后台仍会运行；重启电脑后，先重新打开一次这个页面。该功能本身只做本地凭据维护，不调用模型。

## 3. 启动 OMP，选择模型 {#start}

打开项目目录的 **PowerShell**，确保这次启动不使用红区模式：

```powershell
$env:OMP_OFFLINE = '0'
omp
```

这只修改当前 PowerShell 及其随后启动进程的环境，不改系统设置。

在 OMP 中按 **Ctrl+T**，选择：

```text
codeagent/DeepSeek-V4-Flash-0731-CodeAgent
```

无需再在 OMP 中登录，也不用在 `models.yml` 新建 `codeagent` provider。先发送一个只读任务确认能正常返回：

> 阅读当前项目的 README，说明项目用途和主要入口，不修改文件。

## 遇到问题先看这里 {#help}

- **找不到模型：** 确认是 Windows 上的本 Fork，且本次进程没有启用 `OMP_OFFLINE`；改环境后重新启动 OMP。
- **读取凭据或解密失败：** 回到公司 CodeAgent 客户端确认登录，再看 JchTools 的最近检查结果；不要打印、截图或分享 Token。
- **认证失败：** 先确认登录有效、JchTools 检查成功。OMP 支持读取更新后的 Token，通常不需要重启或切模型；只有 Token 已变化、请求尚未输出且未取消时才会自动重试一次，不会无限重试或重放已有输出。
- **仍无法连接：** 检查公司服务的访问条件与账号权限。JchTools 检查成功只表示本地凭据维护成功，不代表远端认证或模型请求已经通过。

## 不要与「模型服务」混淆 {#difference}

这里用的是 **JchTools 的 CodeAgent 页面 + OMP 的 `codeagent/…` 内置模型**，工具仍由 OMP 执行。**不需要开启 JchTools「模型服务」、配置 ACP Agent 或填写本机 HTTP 端口**；`jchtools/…` 是另一种后端 Agent 模式。

说明依据：[OMP CodeAgent 契约](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/fork.md#codeagent-内置模型)与 [JchTools CodeAgent 需求](https://github.com/jchanghong023/JchTools/blob/main/docs/requirements/CODEAGENT.md)。需使用包含该功能的版本；本次仅验证网页，未读取真实凭据或调用公司模型。
