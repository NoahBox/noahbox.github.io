---
title: "【COC相关】交互式COC调查员角色卡创建工具"
published: 2026-08-18
description: ""
image: "https://files.seeusercontent.com/2026/08/18/3Vxz/Screenshot-2026-08-18-at-11-05-2.png"
tags: [COC资源, 扩展资料, 在线工具]
category: "TRPG规则"
draft: false
---

# 交互式COC调查员角色卡创建工具

克苏鲁的呼唤（Call of Cthulhu）TRPG 第七版调查员角色卡交互式创建网页。

使用 Vue 3 + Vite 构建。

前几年大模型代码生成还不怎么好用的时候，手搓了一半的 COC 车卡工具，让 Agent 接着搓出来的工具。

之前架子搭的还算多，基本功能算是能用，之后再慢慢更新吧。

## 快速开始

该工具目前未对竖屏设备进行优化，推荐电脑、平板等横屏设备使用。

[COC Investigator Wizard](/tools/coc-investigator-wizard.html)

该工具为单网页构建，可以保存到本地后离线使用。或者从最新的 Release 下载构建好的 html 文件。

### 从源码构建

GitHub 开源地址：https://github.com/NoahBox/coc-investigator-wizard

自行构建：

```bash
git clone https://github.com/NoahBox/coc-investigator-wizard
cd coc-investigator-wizard
npm install
npm run build
```

构建产物位于 `dist/index.html`。

## 已支持的功能

### 基础功能

- 交互式调查员角色卡创建
- 调查员角色卡导出，支持：
    - 本工具支持的 Json 格式
    - 适用于印刷的 PDF 及图片
    - 兼容“TRPG SAIKO 调查员车卡工具”的 Base64 串
    - 骰娘属性设置字符串（.st）
- 调查员角色卡导入，支持：
    - 本工具支持的 Json 格式
    - 来自“TRPG SAIKO 调查员车卡工具”的 Base64 串
- 属性分配模式
    - 购点
    - 随机生成
    - 快速开始（《COC 7th 快速开始规则》）
- 规则书中的数据
    - 职业
    - 武器

### 扩展功能

- 调查员经历包
- 中国/日本调查员的资产自动换算
- 扩展职业
    - 日本 COC 扩展职业（新克苏鲁神话2026, 新克苏鲁神话2020, 克苏鲁神话2015, 克苏鲁神话2010，TRPG-JAPAN）
    - 纸浆克苏鲁扩展职业

## 开发计划

- [ ] 使用 LevelDB 对角色卡进行持久化保存
- [ ] 调查员背景的随机生成表
- [ ] 导出到 FVTT COC7th 系统可用的格式
- [ ] 《克苏鲁时空穿梭（Cthulhu Through the Ages）》中的扩展职业和时代特性


## 更新历史

### v1.0.2 26-08-18

- 增加功能
    - COC 日本扩展和《纸浆克苏鲁》中的扩展职业
- 体验优化
    - 在技能点分配界面将调查员经验包提供的技能调整显示在成长栏中
    - 优化界面布局
    - 优化调查员头像编辑弹窗
- Bug 修复
    - 修复“调查员经验包中的技能和属性调整无效”的问题

### v1.0.1 26-08-17

- 增加功能
    - 老卡模式
    - 自定义武器
    - 自定义技能
- Bug 修复
    - 修复“开启经验包后，即使将其关闭，经验包的效果依然保留”的问题

### v1.0.0 26-08-17

- 初版发布
