# forkZcode 内网启动 {#start}

产品名是 **OmpCode**，自带 OMP 核心，不需要另装 Node 或 OMP。先向管理员取得对应平台的安装包和内网模型配置；外网下载入口：[OmpCode Releases](https://github.com/jchanghong023/OmpCode/releases)。

## CentOS 7 {#centos7}

在有图形桌面的终端中，解压管理员提供的 CentOS 7 x64 ZIP，进入解压后的目录。**红区启动必须同时设置 `OMP_OFFLINE` 和 `OMP_CONFIG_ROOT`，缺一不可。**

```bash
export OMP_OFFLINE=1
export OMP_CONFIG_ROOT="$HOME/omp-data"
./bin/ompcode-centos7
```

使用 tcsh / csh 时：

```csh
setenv OMP_OFFLINE 1
setenv OMP_CONFIG_ROOT "$HOME/omp-data"
./bin/ompcode-centos7
```

`$HOME/omp-data` 是示例，请换成管理员认可、你有写权限的持久目录，用于确定数据与备份位置；**不要填 `/dev/shm`**。以后启动继续使用同一路径。

需要指定 OMP 配置档时，在命令后加 `--profile 配置档名`。无需 root；只打开可信项目。离线模式使用内存目录，**退出登录、重启或清空共享内存后不会自动恢复历史**。

## Windows {#windows}

运行管理员提供的 Windows x64 安装包，安装后从开始菜单打开 **OmpCode**。模型使用管理员提供的内网配置；上述 CentOS 桌面离线锁定不适用于 Windows。

## 打开项目 {#project}

选择项目目录 → 新建会话 → 确认模型 → 输入任务，例如：

> 只读分析这个项目，说明主要入口，不修改文件。

没有模型或出现认证错误时，先核对 OMP 配置与 Profile，不必登录旧 ZCode 账号。
