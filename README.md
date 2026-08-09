# 千字村

一座村庄能记住什么，就会成为什么。

《千字村》是一款 20～40 分钟、支持多周目的中文叙事决策游戏。玩家以「守字人」的身份，在只能容纳一千字的公共记忆中，决定哪些事实、关系、方法与信仰能够继续传给后来者。

## 公开试玩

[进入《千字村》十五回合公开试玩版](https://shawnsiao.github.io/village-of-a-thousand-words/)

游戏包含完整 15 回合、浏览器本地存档、移动端适配、红线托付、延迟后果、灾后村庄与最终《村志》。不需要账号，不收集玩家输入；存档只保存在当前浏览器。

## 本地运行

```powershell
cd game
npm ci
npm run dev
```

完整检查：

```powershell
cd game
npm run check:all
```

## 发布

`main` 分支更新后，GitHub Actions 会执行类型检查、规则测试、正式构建、十五回合端到端通关和响应式检查；全部完成后将 `game/dist` 发布到 GitHub Pages。
