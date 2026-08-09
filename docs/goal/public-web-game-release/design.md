# 《千字村》公开 Web 游戏制作与发布设计

## 问题说明

当前十五回合原型已经能够在本地浏览器完成主要流程，但仍使用 React 开发版、浏览器内 Babel、全局脚本和原型目录中的大体积 PNG 资源。该结构适合设计验证，不适合作为公开游戏长期发布。

本目标将原型十迁移为正式的静态 Web 游戏，保留十五回合、千字碑、守字人、红线托付和记忆回声，并完成移动端适配、终局情感重构、自动化检查及 GitHub Pages 发布。

## 已确认的当前事实

- 仓库：`ShawnSiao/village-of-a-thousand-words`；
- 默认分支：`main`；
- 仓库已于 2026-08-09 改为公开；
- 当前稳定原型：`designs/千字村十五回合叙事情感原型十/`；
- 原型包含 15 回合、10 段初始记忆、红线托付、阶段反馈、灾后五地点与村志附录；
- 存档使用浏览器 `localStorage`；
- 最新原型资源总量约 67 MB，其中 29 张 PNG 约 67 MB；
- 玩家可见内容必须全部使用中文；
- 运行时不使用生成式 AI，不提供自由输入。

## 假设与边界

- 首次公开版本仍为单机单人游戏，不增加账号、云存档、排行榜或多人功能；
- GitHub Pages 只发布正式游戏构建产物，不发布 `designs/` 与 `docs/`；
- 游戏逻辑与剧情内容在浏览器端运行，公开构建产物可被技术人员检查；
- 旧原型继续保留，不在原目录上直接改写；
- 新的主要界面先通过 ImageGen 确立视觉方向，再用 Baoyu Design 实现交互；
- 不以增加回合数量替代人物与因果体验优化。

## 推荐结构

```text
game/
  package.json
  vite.config.ts
  src/
    engine/
    content/
    screens/
    components/
    save/
    styles/
    tests/
  public/assets/

.github/workflows/
  game-ci.yml
  deploy-pages.yml
```

正式游戏使用 Vite、React 和 TypeScript。内容继续由人工编写，并以类型化数据模块保存。规则计算集中在纯函数中，界面只读取派生结果。

## 风险与取舍

- 直接复制原型代码速度快，但会继续保留全局变量和难以测试的状态；本目标接受一次结构迁移，换取稳定发布与后续扩写能力。
- 29 张场景图不能全部按原始 PNG 公开加载；需要转换为 WebP，并按回合懒加载。
- 移动端不应把桌面三栏缩小塞入屏幕；记忆编辑器需要改成顺序式工作区。
- 终局不能只增加更长文案；必须以具体人物、原始选择和可回溯后果组成场景。
- GitHub Pages 不提供服务器端逻辑；本轮不实现云存档和匿名统计。

## Phase 0：仓库公开

Status: completed

Scope:
- 将 GitHub 仓库从私有改为公开。

Acceptance Criteria:
- GitHub 返回 `PUBLIC`；
- 仓库 URL 可公开访问。

Verification:
- `gh repo view ShawnSiao/village-of-a-thousand-words --json visibility,isPrivate,url`

Commit:
- 该阶段只改变 GitHub 仓库设置，不产生代码提交。

## Phase 1：视觉原型与制作基线

Status: completed

Scope:
- 生成移动端回合、记忆编辑器与终局凝视图片原型；
- 建立独立的可交互设计版本；
- 锁定正式游戏的桌面、平板与手机信息层级。

Acceptance Criteria:
- ImageGen 图片原型进入新版本目录；
- Baoyu Design 可交互原型不覆盖原型十；
- 手机正文不小于 16 px，主要触控目标不小于 44 px；
- 终局包含人物凝视、具体因果和碑外残响。

Verification:
- 在 390 × 844、768 × 1024、1440 × 900 视口检查关键页面；
- 浏览器控制台无运行错误。

Result:
- 新版本目录：`designs/千字村公开游戏原型十一/`；
- ImageGen 已生成手机端构图、终局村民凝视和应用图标三项视觉原型；
- Baoyu Design 已完成证词、候选碑文、旧文整理、封存反馈与终局凝视交互；
- 已在 390 × 844、768 × 1024、1440 × 900 视口完成真实浏览器检查。

Commit:
- Expected commit message: `design: 完成公开游戏移动端与终局原型`

## Phase 2：正式游戏工程与规则迁移

Status: in_progress

Scope:
- 建立 `game/` Vite + React + TypeScript 应用；
- 迁移十五回合、记忆卡、托付、回声和存档；
- 将选择、容量、封存和结局计算改为可测试的纯函数；
- 保留原型十的完整可玩流程。

Acceptance Criteria:
- `npm run build` 成功；
- 不再从 CDN 加载 React 或在浏览器运行 Babel；
- 15 回合均可进入并封存；
- 刷新页面可恢复存档；
- 所有内部状态均通过中文显示名称进入界面。

Verification:
- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`

Commit:
- Expected commit message: `feat: 迁移十五回合正式游戏工程`

## Phase 3：移动端与终局情感体验

Status: pending

Scope:
- 移动端采用顺序式阅读与编辑流程；
- 优化横竖屏、触控、滚动、返回和容量警告；
- 将终局改为灾后五地点、人物凝视、碑外残响、传碑与村志分享；
- 人物命运直接引用本局选择，不使用通用统计文案替代场景。

Acceptance Criteria:
- 360 px 宽度下没有横向溢出、遮挡或不可触达操作；
- 终局至少回溯一项保留、一项删除、一次托付和一个人物命运；
- 村民凝视场景先于村志附录；
- 同一主结局内部可因人物关系与知识差异产生不同尾声。

Verification:
- `npm run test:e2e -- --project=mobile-chrome`
- `npm run test:e2e -- --project=desktop-chrome`

Commit:
- Expected commit message: `feat: 完成移动端流程与反向凝视终局`

## Phase 4：优化与自动化检查

Status: pending

Scope:
- 将场景图转换为 WebP，按回合加载；
- 增加类型检查、内容完整性、规则单元测试和关键流程端到端测试；
- 配置持续集成工作流。

Acceptance Criteria:
- 首屏不加载全部回合图片；
- 所有 15 回合都存在证词、候选碑文、反应和回声；
- 容量、不可恢复删除、托付和终局选择器具备测试；
- GitHub Actions 在 Pull Request 与 `main` 推送时运行检查和构建。

Verification:
- `npm run check`
- `npm run test:e2e`
- `npm run build`

Commit:
- Expected commit message: `ci: 增加游戏检查与资源优化`

## Phase 5：GitHub Pages 发布与线上验收

Status: pending

Scope:
- 配置 GitHub Pages 使用 GitHub Actions；
- 发布 `game/dist`；
- 验证公开 URL、刷新存档、手机页面与十五回合入口。

Acceptance Criteria:
- Pages 公开地址返回 200；
- 桌面与手机浏览器可进入游戏；
- 资源路径在项目子路径下正确；
- Actions 构建与部署均通过；
- 远端 `main` 包含全部已验证实现。

Verification:
- `gh run list --workflow deploy-pages.yml`
- `gh api repos/ShawnSiao/village-of-a-thousand-words/pages`
- 使用真实浏览器访问公开 URL。

Commit:
- Expected commit message: `deploy: 发布千字村公开试玩版`

## 最终完成标准

- 仓库公开；
- 正式游戏包含完整 15 回合；
- 桌面与手机可玩；
- 终局能够回溯具体人物与选择；
- 自动化构建、检查和部署通过；
- GitHub Pages 公开试玩地址完成真实浏览器验收。
