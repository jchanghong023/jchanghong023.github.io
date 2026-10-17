# 主目录会话与遥测默认值 {#defaults-1016}

本页对应[1016默认行为需求](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/%E6%96%B0%E5%A2%9E%E9%9C%80%E6%B1%821016.md)，是默认行为说明，不是本次产品验收记录。

## 在主目录启动 {#home-sessions}

从用户主目录启动CLI时，OMP默认保留该目录作为会话工作目录，不再自动换临时目录，也不要求`--allow-home`。显式传该参数仍兼容；`--cwd`始终优先。为了不让任务误触私人文件，日常建议从可信项目目录或指定cwd开始。

系统终端示例，目录须已存在：

```powershell
omp --cwd C:\work\demo
```

```sh
omp --cwd "$HOME/projects/demo"
```

“允许主目录会话”不表示工具已获得删除、上传或任意处理家目录的授权，仍须明确任务范围并遵循现有审批。

## OTLP默认不导出 {#otlp}

内置`telemetry.otlpExportEnabled=false`。没有显式开启时，即使环境中有`OTEL_*`导出端点，也不通过OTLP发送跟踪、日志或指标。已有保存配置和本次显式配置高于内置默认；显式true后沿用上游端点、协议及禁用开关，不改写用户配置。

这不等于所有网络请求已关闭，不等于本地诊断日志停用，也不是模型调用零数据出境的声明。模型Provider、插件、工具和项目输入应分别审查；[offline边界](./offline-shm)也不是网络沙箱。

## 如何判断该行为已验证 {#verification}

源验收要求从真实CLI观察：无allow-home留在主目录，cwd优先；默认及显式false时已配置的OTLP接收端零请求，显式true时收到实际跟踪。仅看到配置键存在或编译成功不够。源索引保留Windows定向证据，Linux/WSL不能由此推定通过；当前状态查[需求索引](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/README.md)。本站未运行这些验证。
