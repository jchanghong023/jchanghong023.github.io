# Linux offline、备份与人工恢复 {#offline-shm}

适合无公网、项目在网络文件系统上的Linux环境。它是“shm运行＋周期备份”，**不是透明缓存或自动恢复系统**。源索引对CentOS专项仍标阻塞，实际shm/NFS、多机及恢复未完整验收；下文说明契约，不把实现当通过。

## 适用条件和启动环境 {#scope}

仅Linux且OMP_OFFLINE为1/true/yes/on（忽略大小写/首尾空白）生效。非Linux/非offline直接用原始数据根，不建shm或备份。需要已有可写/dev/shm，不用sudo，不改挂载/Swap，不使用其他本地盘回退。

bash/sh：

```sh
export OMP_OFFLINE=1
export OMP_CONFIG_ROOT="$HOME/omp-data"
omp -P work
```

tcsh：

```tcsh
setenv OMP_OFFLINE 1
setenv OMP_CONFIG_ROOT "$HOME/omp-data"
omp -P work
```

OMP_CONFIG_ROOT保留原始持久位置，**不要改成shm路径**。有效绝对根优先，否则上游默认目录解析；目录名不写死，尾分隔符等价路径不应派生不同域。共享Skill另用OMP_SKILLS_DIR，其加载与offline独立。公司模型认证和启动前置见[快速开始](./getting-started#linux-install)。

## 哪些数据在shm，哪些仍访问项目 {#data-routing}

运行根形如`/dev/shm/omp-<uid>-<domainId>/<原始根目录名>`，由主机/用户/原始根确定，profile保留内部相对布局。同域多进程复用，不在退出时删除有效缓存。目录与含认证的数据保持用户私有。

运行根包括配置/认证、模型缓存、本地技能管理数据、会话/附件、Goal/任务/计划状态、Wiki/Repo/记忆数据库及WAL/SHM、日志/native展开/缓存/临时文件/锁/IPC。安装程序位置、项目源码、项目级.omp、显式项目输出和外部EDA产物不搬。Claude配置、共享Skill等外部输入仍原位读取，因此**不承诺启动零NFS I/O**，也不改变工具访问项目的能力。

自定义session-dir在此模式下作为命名空间映射进profile运行域，不读取原外部目录。显式resume/session指向外部文件会拒绝，必须人工把会话和必要附件恢复到运行域，再用恢复后路径。符号链接、含symlink/..路径和锁sidecar也不能绕过边界。非文件会话后端的目录是 opaque key，不应被当磁盘目录扫描。

## 启动不等备份，也不恢复 {#startup}

TUI可交互、RPC可收请求、ACP输入reader已建立后才启后台周期；不等initialize、首响应、会话创建或NFS检查。启动不搬旧数据、不补齐、不预热、不在缓存未命中时回源。空shm就是新环境，原持久树仍保留，但旧配置/会话/索引不会自动出现。

shm不可用、空间不足或不可写要明确失败，不静默改NFS活动写入。native通常沿用普通shm映像；只有noexec等导致不可执行才尝试memfd/procfs后备，需Linux x64/arm64、Bun FFI、glibc libc.so.6、支持memfd/sealing的内核（3.17起或backport）及安全策略许可，无musl后备。不把这些统一加到普通加载前提，也不改挂载/自动装依赖/落持久可执行副本绕过。CentOS普通加载与noexec后备须分别实测，WSL现代内核不能证明3.10内核支持。

## 十分钟异步备份 {#schedule}

前台就绪满十分钟才首次备份，之后每十分钟触发。独立执行上下文，不同步阻塞输入/模型流/工具/RPC。同数据域最多一轮，未完触发合并而不堆积，进程/Worker/子Agent协调且继承同原始根，不重复映射或调度。退出不等NFS、不做最终同步，不新增长驻系统服务；短命命令可能一次备份都没有。

备份保存完整可恢复范围：配置/认证、会话及附件、任务状态、DB、日志、可持久缓存。socket/管道/PID/进程锁/临时快照排除，但bun.lock/package-lock.json/yarn.lock等依赖锁仍是持久数据，不能仅按扩展名排除。

SQLite逐库一致性快照，不直接复制正在写的.db/WAL。普通文件稳定后发布，追加JSONL/log仅保存完整换行前缀；普通未变文件可复用，但每库仍快照。这不是跨所有文件/DB的同一时刻全局事务。内部符号链接按链接存，相对target保持，绝对内部链接转换域内相对，外部链接排除并记manifest，不读取外部目标。

## 隔离域、完成版本和保留 {#generations}

备份只写原始根内的隔离域，不覆盖原根旧活动数据：

```text
<原始持久根>/.offline-shm-backups/<domain hash>/
  current.json
  generations/<id>/
    manifest.json
    data/
```

current指最新完成版本，previous如存在指上一完成版本。manifest应有status complete、generation、domainId、persistentRoot、runtimeRoot、完成时间、条目、mode和排除范围。运行路径domainId与备份domain hash不能混用。新轮失败不损坏旧完整版，不无限积累失败临时物。

共享容器创建时sticky01777，管理员可提供可访问sticky01770；域及版本/data目录用户拥有且0700，普通文件仅所有者读写，保留所有者执行位。不能由第二用户接管他人0700容器或修改权限。不同用户/主机分域，**不建设跨机共写活动数据库**。

每版本只代表当前运行根可备份内容，不是原NFS树全集。同一runtime incarnation的删除可记录，重启后空树不代表旧持久数据已删除，不据此清空原树。

## 人工恢复：先停进程，再选完整版本 {#manual-restore}

没有恢复命令或向导，不能写一个猜测的omp restore替代。操作对象包含认证和会话，必须由该域用户执行；以下为有明确前置检查的人工流程，不应跳过后直接复制：

1. 停止对应域**所有**OMP、Worker、子Agent及后台任务，确认没有运行域写入或备份。
2. 在正确原始根查current.json，选current或previous指向的generations/id，核对manifest的complete、generation、主机/用户域、persistentRoot/runtimeRoot。不要选staging或改写备份。
3. 使用manifest.runtimeRoot所指、未被占用且**为空**的目标运行根；不要合并活动树、覆盖原始根或其他域。换主机/用户不属于自动路径迁移。
4. 复制选定版本**data/里面的内容（含隐藏项）**，不是把data目录或manifest拷进去；保留私有所有权、0700目录、普通文件仅所有者读写及原执行位。符号链接复制为链接，保留相对target，不解引用。
5. 核对恢复内容/权限后，以相同OMP_CONFIG_ROOT和需要的profile启动。旧单会话也要带附件入运行域后再用真实路径resume，不能拼活动DB/WAL/SHM。

未提供一键cp命令，是因为源契约要求从实际manifest定位正确域、停止全部写入并保持权限/链接；泛用覆盖命令可能写错活动根。没有成功完成版本就不承诺新增数据可恢复。

## 失败、丢失风险与诊断 {#failures}

NFS不可达、无权限、空间不足只使备份失败，前台继续shm，旧完成版本保留；后续正常周期再试，不阻塞即时重试。错误需非阻塞有界提示，并由现有logger记开始/终态/最近成功时间，ACP提示走stderr不污染JSON-RPC stdout。

可丢失范围从最近成功备份算起，**不保证最多十分钟**，连续失败可更久。重启/断电/卸载/外部清理可能丢shm，退出也不补备份；tmpfs可能Swap，不能宣传绝不落盘。

明确不做：自动恢复/回填/缺失回源、启动迁移、同步写穿/退出同步、sudo/系统部署、搬项目或其他程序数据。来源：[完整离线契约](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/offline-shm.md)。

## 验收应该观察什么 {#validation}

须分别验证平台/四真值、无NFS启动等待、空shm不清旧树、全部真实CLI/TUI/RPC数据路由、native普通与noexec后备、ACP生命周期、自定义会话/符号链接边界、真实十分钟备份和人工恢复、多进程/多用户、失败/中断保全、退出资源及同环境启动/交互对照。逐库快照不冒充全局事务，局部性能不冒充企业提升。源索引仍有CentOS/native/离线依赖阻塞和Windows EPERM历史；真实NFS、多机、恢复和当前源码公开入口的缺口必须保留。本站未执行产品测试。
