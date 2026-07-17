# 410 考研冲刺台

面向电子科技大学 858 信号与系统、数学一、英语一和政治的静态备考控制台。

## 在线使用

- 主入口：[打开 410 考研冲刺台](https://uestc-410-war-room.jc6fmxkms7.chatgpt.site/)
- GitHub Pages 备用入口：[xinchenda.github.io/kaoyan-war-room](https://xinchenda.github.io/kaoyan-war-room/)
- 源码与运行状态：[GitHub 仓库](https://github.com/xinchenda/kaoyan-war-room)

若所在网络无法连接 `github.io`，使用主入口；两处发布均来自本仓库的同一份代码。

## 当前规划

- 目标分数：数一 135、858 130、英一 75、政治 70，总分 410。
- 基线：高数推进至高阶线性微分方程；858、英语系统训练、政治尚未开始。
- 7 月 17 日至 8 月 3 日完成压缩一轮，8 月完成诊断和重点二轮。
- 9 月起进入三轮、真题专题与政治学习；10 月真题系统化，11 月套卷，12 月保温。

## 使用与数据

直接打开 `index.html` 即可使用。学习记录保存在浏览器 `localStorage`，可在设置中导入或导出 JSON。

`data/updates.js` 保存招生与政治情报，因此本地文件模式也能展示最近一次同步结果。

## 自动更新

GitHub Actions 每天北京时间约 06:20 执行 `npm run sync:intel`：

- 巡检电子科技大学研招网、信息与通信工程学院、中国研招网等招生来源。
- 汇总新华网时政和中国政府网条目，并按政治命题主题生成标签。
- 只接受电子科大、中国研招网、新华网和中国政府网官方域名，逐条保留原文链接。
- 每个来源自动重试，并提供 IPv4 备用传输；目标学校来源整体不可用时任务会明确失败。
- 抓取失败时保留上次结果但标记为陈旧，不会把旧数据冒充成新数据。
- 政治主题是关键词自动复习归类，页面明确区分于官方原文和真实命题结论。
- 数据更新后自动触发 GitHub Pages 重新发布。

每 6 小时执行线上访问、资源完整性、数据新鲜度、测试和构建巡检。失败时自动创建 GitHub Issue，恢复后自动关闭；Dependabot 每周检查工作流与依赖更新。

## 本地验证

```bash
npm install
npm run sync:intel
npm run check:feed
npm test
npm run build
```
