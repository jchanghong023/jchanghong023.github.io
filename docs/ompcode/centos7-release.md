# CentOS 7 兼容包 {#overview}

## 下载与运行 {#install}

CentOS 7 唯一分发格式是自包含 x64 ZIP 和对应 SHA256，来自 [OmpCode Releases](https://github.com/jchanghong023/OmpCode/releases)，不是旧 RPM/PRoot 方案。具体已核对资产与校验命令见[快速开始](./getting-started#download)。以普通用户解压到自己的目录，执行包内 `bin/ompcode-centos7`，不需要 root、宿主安装 Node/OMP、PRoot、ptrace、bind mount 或替换 glibc。

包内应包括 Electron 28.3.3、OMP、兼容 node-pty、SSH/搜索工具、必要 C++/GUI 库和可再分发中文字体及许可；仍要求图形 X11/Wayland 会话有实际可用的桌面能力。应用直接在宿主 glibc 2.17/Linux 3.10 上运行，不包含 Ubuntu userspace。移动目录后仍要保留可执行权限和符号链接。

::: warning 安全限制
兼容启动器使用 `--no-sandbox`；Electron 28 与 CentOS 7 已停止维护，避免不可信项目。默认 `--disable-gpu` 维持软件绘制。glibc 兼容不证明图形服务器 XKB/GLX、输入法或远程桌面可用；目标环境仍有未验证项。
:::

## 启动参数和模型环境 {#launcher}

```bash
"$HOME/OmpCode-3.14.3-centos7-x64/bin/ompcode-centos7" --help
"$HOME/OmpCode-3.14.3-centos7-x64/bin/ompcode-centos7" --profile work
```

`--help`/`-h` 在包检查、数据目录创建和 Electron 前打印帮助退出。`--profile <name>` 或 `--profile=<name>` 验证后覆盖本次应用设置，其他桌面参数透传；缺失/无效名称应在启动 Electron 前失败。默认简体中文只在没保存语言时采用，不改 LANG/LC_ALL/LANGUAGE，用户保存的语言优先。

旧 `--home` 和 `--offline` 已取消。配置根由继承环境 `OMP_CONFIG_ROOT`/`PI_CONFIG_DIR` 解析，启动器不创建用户根链接、不迁移数据。活动根与 `_ompcode` 兄弟根见[模型与数据](./models-and-commands#roots)，offline shm 的无自动恢复、易失性和备份另见[离线存储](./models-and-commands#offline)。

## 离线锁定不等于另一个界面 {#offline}

CentOS 启动器读取 `OMP_OFFLINE`：去空白、忽略大小写的 `1/true/yes/on` 启用，原值传给 OMP，再派生桌面本地锁定信号。Windows 不派生该信号；不要手动把内部变量当跨平台开关。

锁定时：

- 只有 OMP 可访问其配置允许的模型 API；企业 SSH 工作区保留。
- 内嵌浏览器可打开仅解析到私有地址的文档，其他桌面 HTTP(S)/WebSocket 限回环；回环重定向到公网也不能绕过出口策略。
- 公网更新、配置、帮助、社区、反馈、外部浏览器、遥测及在线 bot 后端关闭；适用保留入口禁用并解释「离线锁定中已关闭」，不能静默消失。
- 推荐任务/图标来自包内资源，不需要公网下载。已全局取消的账号/分享/手机/市场不能因「保留入口」规则复活。

未启用时与 Windows 基准功能一致；两平台同一 UI，不删除入口。渲染减动效是构建策略，与 offline 独立。日志级别以[当前日志域](./logging)为准，不能按旧离线 error-only 描述关闭 DEBUG。

## 中文输入与启动失败 {#ibus}

启动器只选择当前 UID、初始 DISPLAY 完全匹配的 IBus；读取进程环境作为数据，不 source。候选总线必须是本地 Unix 会话总线，且 IBus 服务 owner PID 与守护进程一致。已匹配调用者优先，否则只采纳唯一验证候选，歧义/工具缺失/探测失败会警告，不猜测替换。

同 UID 完全没有 ibus-daemon 且无显式 IBUS_ADDRESS 时，才可能在锁与重新检查后启动用户 IBus。它保留已有守护进程、其他 DISPLAY、父 shell 与持久输入法设置，不 `--replace`、不强设引擎、不接管全局 XIM。成功会话由用户会话持有，应用退出不主动停止。显式替代输入法变量保留。

遇到无法输入中文，检查脱敏启动警告、当前图形会话、总线 owner 与输入法选择，不能仅看到引擎/光标通知就判断按键处理成功。历史主机手工对齐总线的成功不等于当前自动启动器验收。

| 现象                  | 应检查                                                      |
| --------------------- | ----------------------------------------------------------- |
| 提示缺资源/ELF 不兼容 | 包完整性、平台资产与权限，不从另一发行版随意补二进制        |
| 图形启动失败          | DISPLAY、标准图形库、XKB/GLX 能力；不据此要求升级宿主 glibc |
| 无中文字体            | 是否完整保留包内字体/许可，不把空框视为内容不存在           |
| Host 输出 EBADF/EPIPE | 专用管道与结构化日志链路，不应让普通日志终止 Host           |
| 空历史/设置           | 当前 Profile、根环境、offline 空 shm；不会自动回源恢复      |

## 打包完整性与维护 {#packaging}

两平台共享 OMP/协议/UI，Windows Electron 44，CentOS 发布时精确切换到 28.3.3 和 Node 18 兼容依赖，包括 undici 6.23.0、better-sqlite3 9.6.0。Node 24/pnpm 负责应用构建，glibc 2.17 构建器用固定 Node 20.19.0/GCC 11 产原生资产，构建 Node 不进 ZIP。SQLite 由统一封装选择 node:sqlite 或 better-sqlite3，不创建双写数据。

兼容 API 包括 webUtils/File.path、navigationHistory、fs/promises.glob 和 node:sqlite 的等价回退；不得借兼容性删除拖拽附件或浏览器导航。可选 sshcrypto.node 不分发，SSH 用 ssh2/Electron crypto。

独立 `release-centos7.yml` 从 main 的触发提交构建；应用与原生资产可并行，以 tar 保留权限/链接，再组装。每次重新构建原生资产，不缓存最终 ZIP 或解包桌面；必需资源、GLIBC≤2.17、布局、SSH 回环握手、归档与 checksum 检查通过才发布。workflow 无自定义输入，Tag 使用统一自动规则；成功发布不是产品测试。

## 实际验证边界 {#evidence}

CentOS 专属 UT、启动器/VM/Linux GUI、远程 X 目标测试已取消，不能把旧 VM 结果称为当前 ZIP 或目标环境通过；构建完整性仍必须保留。源记录的 IBus 自动启动调整只做过静态检查，未构建/发布或验收目标主机。Windows 文件路径回退和日志排空的适用回归也不是 CentOS 真机测试。本站没有安装或执行兼容包。

来源：[CentOS 7 分发需求](https://github.com/jchanghong023/OmpCode/blob/main/docs/requirements/centos7-release.md)。
