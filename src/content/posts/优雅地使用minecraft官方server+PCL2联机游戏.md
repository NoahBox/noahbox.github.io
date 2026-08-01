---
title: 优雅地使用 minecraft 官方 server + PCL2 联机游戏
published: 2021-09-07
description: 最近学了《数字电路与逻辑分析》，想起来去年某学长考试前靠 MC 的红石电路复习，然后，本着学习数电摸鱼的目的，搭了一个 MC 的服务器（便于大家交流学习（逃
image: ""
tags: [摸鱼, 游戏]
category: 运维
draft: false
---

最近学了《数字电路与逻辑分析》，想起来去年某学长考试前靠 MC 的红石电路复习，然后，本着~~学习数电~~摸鱼的目的，搭了一个 MC 的服务器（便于大家交流学习（逃

<!--more-->

## 服务端

<font style="color: white; background-color: #B10DC9"> 如果你是玩家，请直接查看<a href="#客户端">客户端</a>部分。这部分雨女无瓜。</font>

---

### 0x0 服务器

首先你需要一台云服务器，各种云服务器供应商都可以（当然，前提是没有被伟大的 `GWF` 拦截，`Amazon AWS` 似乎不行）。
本人使用的是腾讯云的轻量型应用服务器，配置如下供参考：

| 项目 | 配置 |
| :----: | :----: |
| OS | Debian 10 buster |
| CPU | Intel Xeon Platinum 8255C @ 2x 2.494GHz |
| RAM | 4G |
| ROM | 80G SSD |
| 带宽 | 8M |

对于 `minecraft` 服务端的搭建而言，服务器配置的重要程度大致为： `公网带宽` > `CPU` > `RAM`  > `ROM`。
我的服务器在跑服务端正常游戏的时候，系统占用基本上 CPU 20%， 内存 2GB， 带宽占用取决于游戏人数，基本上每人 1M 左右。

---

### 0x1 服务器配置

> 我是用的镜像是腾讯云提供的 `Debian 10.2 64bit` 系统镜像，接下来的操作均在该系统上。
> 使用其他操作系统的情况下，部分步骤可能会有所不同。



#### 0x1.1 服务器账户配置

`Mojang` 官方推荐的服务器搭建教程建议使用 `root` 账户并将 `minecraft` 的服务器本体 `server.jar` 及配置文件放置在 `/opt` 目录下，但由于我不是很喜欢直接用 root 账户，所以我选择使用普通用户 `noah` 并将文件放置在 `/home/noah/minecraft` 目录下。并没有遇到什么问题。

> 如果你想使用 `root` 账户搭建服务端，直接跳到 <a href="#0x2-安装OpenJDK">0x2 安装 Openjdk</a>。

首先添加一个新的账户：

```shell
groupadd noah
useradd -m noah -g noah -s /bin/bash -d /home/noah
passwd noah
```

更新软件源、安装vim并赋予新用户sudo权限：

```shell
apt upgrade
apt update
apt install vim
vim /etc/sudoers
```

在 `sudoers` 中添加一行：

```shell
noah	ALL(=ALL)	ALL
```

接着切换到新的用户：

```shell
su noah
```



#### 0x1.2 安装 `screen`

> `GNU Screen` 是一款由 GNU 计划开发的用于命令行终端切换的自由软件。用户可以通过该软件同时连接多个本地或远程的命令行会话，并在其间自由切换。
> `GNU Screen` 可以看作是窗口管理器的命令行界面版本。它提供了统一的管理多个会话的界面和相应的功能。

```shell
sudo apt install screen
```

在运行 `minecraft server` 的时候会用到 `screen`。



#### 0x1.3安装一个更好看的shell

我个人喜欢用 `fish`， `zsh` 运行有些慢。

```shell
sudo apt install fish
chsh -s /usr/bin/fish
```

---

### 0x2 安装OpenJDK

> `Debian 10` 的默认 `JDK` 版本为 `OpenJDK 11`， 对于` minecraft server 1.17.1` 及以上的版本，需要使用 `OpenJDK 16` 及以上的版本。

安装通过 HTTPS 添加新存储库所需的依赖项：

```shell
sudo apt install apt-transport-https ca-certificates wget dirmngr gnupg software-properties-common
```

使用 `wget` 命令导入存储库的 GPG 密钥：

```shell
wget -qO - https://adoptopenjdk.jfrog.io/adoptopenjdk/api/gpg/key/public | sudo apt-key add -
```

添加 `AdoptOpenJDK APT` 存储库到你的系统：

```shell
sudo add-apt-repository --yes https://adoptopenjdk.jfrog.io/adoptopenjdk/deb/
```

更新 `apt` 源软件列表，启用存储库，安装 `OpenJDK 16`：

```shell
sudo apt update
sudo apt install adoptopenjdk-16-hotspot
```

---

### 0x3 下载、启动并配置 minecraft server

#### 官方版 server

下载官方的 `server.jar`，最新版本的下载地址可以在 [Download server for Minecraft | Minecraft](https://www.minecraft.net/zh-hans/download/server) 找到：

```shell
wget https://launcher.mojang.com/v1/objects/a16d67e5807f57fc4e550299cf20226194497dc2/server.jar
```

但是在国内下载的话速度有点慢，可以挂代理下载或者本机下好之后传到服务器上。

我将 `server.jar` 放在了 `/home/noah/minecraft` 目录下，这里将来还会生成数个配置文件：

```shell
mkdir /home/noah/minecraft
mv server.jar /home/noah/minecraft
cd /home/noah/minecraft
```

为了方便运行，在这里新建一个 shell 脚本，并赋予它可执行权限：

```shell
vim run.sh
chmod +x run.sh
```

并将以下内容写入脚本：

```bash
#!/bin/sh
cd "$(dirname "$0")"
exec java -Xms1G -Xmx1G -jar server.jar --nogui
```

运行一次 server 以生成配置文件：

```shell
./run.sh
```

这次运行会因为未同意 `eula` 而异常退出。修改当前目录下生成的 `eula.txt` 文件，将其中的 `eula=false` 改为 `eula=true`。

接着再运行一次 server， 等出现 `[Server thread/INFO]: Done (39.937s)! For help, type "help"` 的提示时 server 就算第一次正常运行了。第一次启动 server 耗时较长（大约 60 秒，具体取决于服务器的 CPU 配置），并且在启动的过程中会出现连续的许多 `[Worker-Main-2/INFO]: Preparing spawn area: 0%` 提示，这是正常情况。

输入 `stop` 终止 server 运行，此时，目录下应该存在以下文件：

![image-20210907232928633](https://i.loli.net/2021/09/07/yLMbuldmxPrjZKH.png)

修改配置文件 `server.properties`，其中需要修改的有：

```shell
motd=Noah Minecraft Server # 服务器名称，不能带有部分特殊符号
online-mode=false          # 是否验证正版，false为不验证，true为验证
```

其余的配置可以在控制台或游戏内通过 `op` 指令修改。

通过在控制台输入 `op NoahTie` 设置 `op` (游戏内管理员)。将其中的 `NoahTie` 替换为你将要在游戏中使用的用户名。



#### Forge 版  server

<font style="color: white; background-color: red">建议没有 Forge 使用经验的用户使用下面的 Fabric 版 server</font>

下载 `Forge Installer`： [Downloads for Minecraft Forge for Minecraft](https://files.minecraftforge.net/net/minecraftforge/forge/)

将 `Forge Installer` 放在安装目录下，并执行：

```shell
sudo java -jar forge-1.17.1-installer.jar nogui --installServer
```

运行一次 universal 版本，参照 官方版 server 修改 `eula.txt` 及 `server.properties`：

```shell
java -jar forge-1.17.1-universal.jar nogui
```

新建 shell 脚本并写入以下内容：

```shell
#!/bin/bash
java -server -d64 -Xms1150M -Xmx1150M -Xss228k -XX:NewSize=150m -XX:MaxNewSize=200m -XX:+UseParNewGC -XX:+CMSIncrementalPacing -XX:+UseFastAccessorMethods -XX:+UseConcMarkSweepGC -XX:MaxGCPauseMillis=100 -XX:+CMSParallelRemarkEnabled -XX:ParallelGCThreads=4 -jar forge-1.17.1-37.0.53.jar nogui
```

添加 mod 时，需要将 mod 文件放入 `/home/noah/minecraft/mod` 目录中，客户端需要安装相同版本的 `Forge` 和 mod 才能连接服务器。



#### Fabric 版 server

下载 `fabric installer` 并运行：

```shell
wget -O fabric-installer-0.7.4.jar https://maven.fabricmc.net/net/fabricmc/fabric-installer/0.7.4/fabric-installer-0.7.4.jar
sudo java -jar ./fabric-installer-0.7.4.jar server -downloadMinecraft
```

稍作等待即可完成安装，此时目录下应该有 `fabric-server-launcher.jar` 文件，运行它：

```shell
java -jar fabric-server-launcher.jar
```

这次运行会因为未同意 `eula` 而异常退出。修改当前目录下生成的 `eula.txt` 文件，将其中的 `eula=false` 改为 `eula=true`。

再次运行，会生成配置文件。参照 **官方版 server** 中的方法，修改 `server.properties` 文件。文件夹中应该有以下文件。

安装 mod 时只需要将 `jar` 文件放进 `mods` 目录即可。

![image-20210909174753155](https://i.loli.net/2021/09/09/XrdOxtMugawjnef.png)



---

### 0x4 在 screen 页面中运行 server

执行以下指令：

```shell
screen -S mc
screen -r mc
```

这两条指令新建了一个叫做 `mc` 的 screen 页面，并进入了这个页面。在这个 screen 页面中运行 server，等到 server 完全启动之后，依次按下 `Ctrl + a` 和 `d` 键以退出页面，此时 server 将在后台保持运行。之后可以通过 `screen -r mc` 指令返回页面。

至此，一个 `minecraft 1.17.1` 纯净版的生存服务器就搭建好了。

在 screen 页面中运行 shell 脚本启动服务器。

---

---



## 客户端

---

### 0x0 下载启动器



#### 正版玩家

在 mojang 官网上下载 `java` 版的 `minecraft` 启动器并下载游戏。



#### 盗版玩家

下载 `PCL2` 或其他 mc 启动器。大部分启动器已经集成游戏本体及 `jre` 下载功能。按照提示下载 `1.17.1` 版本游戏即可。

以 `PCL2` 为例：

1. 启动 `PCL2` 之后进入下载标签页，选择 `1.17.1` 版本。

   ![image-20210907234953807](https://i.loli.net/2021/09/07/JkeHwubrYWzFg4G.png)

2. 选择你需要的功能，并点击下载。如果服务端使用了 `Forge` 或 `Fabric` 运行了 mod，客户端需要安装版本 **完全相同** 的 `Forge` 或 `Fabric`。

   ![image-20210907235221545](https://i.loli.net/2021/09/07/XOrguyelxIoL78Q.png)

3. 等待游戏下载完成后，进入启动标签页，选择离线选项并进入游戏。进入游戏后选择 多人游戏 -> 添加服务器，在服务器地址一栏输入服务器的 `ip` 地址或域名，点击完成。

4. 点击服务器 -> 加入服务器。

如果出现验证错误，请确认 `server.properties` 中 `online-mode` 的值已设置为 `false`。

---

### 0x1 添加 mod

首先需要在 `PCL2` 中下载与服务器相同版本的 `Forge` 或 `Fabric` 版客户端。



#### Forge

在 启动标签页 -> 版本选择 -> `Forge` 版本 选择 `1.17.1-Forge xx.x.xx`。

在 启动标签页 -> 版本设置 -> mod 管理 ->  打开 mod 文件夹。

将服主发来的 `mod.zip` 解压到打开的文件夹里。

![](https://i.loli.net/2021/09/08/7OSWBhofVqweubX.png)



#### Fabric

在 启动标签页 -> 版本选择 -> `Fabric` 版本 选择 `0.11.6`。

在 启动标签页 -> 版本选择 -> `Fabric API` 版本 选择 `0.40.0`。

在 启动标签页 -> 版本设置 -> mod 管理 ->  打开 mod 文件夹。

将服主发来的 `mod.zip` 解压到打开的文件夹里。

<img src="https://i.loli.net/2021/09/09/6Cn9ELGO5Ky4WS7.png" alt="image-20210909183610441" style="zoom: 80%;" />
