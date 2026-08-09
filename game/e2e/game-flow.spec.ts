import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(async () => page.evaluate(() => {
    return document.documentElement.scrollWidth - window.innerWidth;
  })).toBeLessThanOrEqual(1);
}

async function chooseFirstDirectAnswers(page: Page) {
  const prompts = page.locator(".direct-prompt");
  for (let index = 0; index < await prompts.count(); index += 1) {
    const prompt = prompts.nth(index);
    if (await prompt.locator("button.selected").count() === 0) {
      await prompt.locator("button").first().click();
    }
  }
}

async function finishRound(page: Page, round: number) {
  await expect(page.locator("[data-screen-label]")).toHaveAttribute("data-screen-label", `第${round}回合开场`);
  await page.getByRole("button", { name: "继续看", exact: true }).click();
  await page.getByRole("button", { name: "继续看", exact: true }).click();
  await page.getByRole("button", { name: "听取证词", exact: true }).click();

  await expect(page.locator("[data-screen-label]")).toHaveAttribute("data-screen-label", `回合${round}事件`);
  await expect(page.locator(".testimony-card.expanded")).toHaveCount(await page.locator(".testimony-card").count());
  await chooseFirstDirectAnswers(page);
  await page.getByRole("button", { name: "整理本年碑文", exact: true }).click();

  await expect(page.locator("[data-screen-label]")).toHaveAttribute("data-screen-label", `回合${round}碑文编辑`);
  const currentVariants = page.locator(".variant-panel.mobile-active .variant-card:not(.delete)");
  await expect(currentVariants).not.toHaveCount(0);
  await currentVariants.nth(Math.min(1, await currentVariants.count() - 1)).click();

  let releasedMemories = 0;
  while (await page.locator(".capacity.over").count()) {
    await page.getByRole("button", { name: "选择记忆", exact: true }).click();
    const editable = page.locator(".memory-rail-item.editable-over");
    await expect(editable).not.toHaveCount(0);
    await editable.first().click();
    await page.locator(".variant-panel.mobile-active .variant-card.delete").click();
    releasedMemories += 1;
    expect(releasedMemories).toBeLessThanOrEqual(5);
  }

  const seal = page.locator(".variant-panel.mobile-active .variant-action .primary-button");
  await expect(seal).toBeEnabled();
  await seal.click();

  await expect(page.locator("[data-screen-label]")).toHaveAttribute("data-screen-label", `回合${round}封存反馈`);
  await page.getByRole("button", { name: "查看当夜反应", exact: true }).click();
  await page.getByRole("button", { name: "查看记忆回声", exact: true }).click();
  await expect(page.locator(".echo-fact-grid article")).toHaveCount(4);
  await expect(page.locator(".echo-trace")).toContainText(`第 ${round} 回合`);

  if (round === 15) {
    await page.getByRole("button", { name: "走进洪水后的村庄", exact: true }).click();
    return;
  }

  if (round === 5 || round === 10) {
    await page.getByRole("button", { name: "看看村庄这些年", exact: true }).click();
    await page.getByRole("button", { name: "看下一处", exact: true }).click();
    await page.getByRole("button", { name: "看下一处", exact: true }).click();
    await page.getByRole("button", { name: "走到下一年", exact: true }).click();
    return;
  }

  await page.getByRole("button", { name: "走到下一年", exact: true }).click();
}

test("手机端从接过红线走完十五回合与反向凝视终局", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "千字村", exact: true })).toBeVisible();
  await expect(page.getByText("你不能替村庄选择未来。", { exact: true })).toBeVisible();
  await expect(page.getByText("你只能决定，它带着哪些记忆走向未来。", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const initialResources = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  expect(initialResources.some((url) => /\/scenes\/scene-\d+/.test(url))).toBe(false);
  const startButton = page.getByRole("button", { name: "接过红线", exact: true });
  expect(await startButton.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(48);

  await startButton.click();
  await expect(page.getByText("你的身份：守字人", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "继续", exact: true }).click();
  await page.getByRole("button", { name: "继续", exact: true }).click();
  await page.getByRole("button", { name: "继续", exact: true }).click();
  await page.getByRole("button", { name: "走到千字碑前", exact: true }).click();

  await expect(page.getByRole("heading", { name: "最初的千字碑", exact: true })).toBeVisible();
  await expect(page.locator(".old-full-memory")).toHaveCount(10);
  await page.getByRole("button", { name: "我已读完最初的碑文", exact: true }).click();
  await page.getByRole("button", { name: "了解碑片更替", exact: true }).click();
  await page.getByRole("button", { name: "查看四步操作", exact: true }).click();
  await page.getByRole("button", { name: "进入第一回合", exact: true }).click();

  for (let round = 1; round <= 15; round += 1) {
    await finishRound(page, round);
    await expectNoHorizontalOverflow(page);
  }

  await expect(page.locator("[data-screen-label]")).toHaveAttribute("data-screen-label", "终局村民凝视");
  const expectedGazeHeadings = [
    "你回到碑前。",
    "钟声及时响了。",
    "村庄记得一种功劳",
    "至少有姓名穿过了三十年。",
    "被磨去的没有回来。",
    "小满没有问你"
  ];
  for (let beat = 0; beat < expectedGazeHeadings.length; beat += 1) {
    await expect(page.locator(".gaze-ending-copy h1")).toContainText(expectedGazeHeadings[beat]);
    await expectNoHorizontalOverflow(page);
    if (beat < expectedGazeHeadings.length - 1) {
      await page.locator(".gaze-ending-actions .primary-button").click();
    }
  }

  await page.getByRole("button", { name: "走进村庄，核对村志", exact: true }).click();
  await expect(page.locator("[data-screen-label]")).toHaveAttribute("data-screen-label", "洪水后的千字村");
  for (let place = 1; place < 5; place += 1) {
    await page.getByRole("button", { name: "前往下一处", exact: true }).click();
  }
  await expect(page.getByText("已走过 5 / 5 处", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "打开村志附录", exact: true }).click();

  await expect(page.getByText("十五次记忆回声", { exact: true })).toBeVisible();
  await expect(page.getByText("六个人的尾声", { exact: true })).toBeVisible();
  await expect(page.getByText("四次红线托付", { exact: true })).toBeVisible();
  await expect(page.getByText("碑外残响", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /碑应留下事实，也留下它曾被改写/ }).click();
  await expect(page.getByText(/她继承的是你让哪些答案仍有资格被问起/)).toBeVisible();
});

for (const viewport of [
  { name: "平板", width: 768, height: 1024 },
  { name: "桌面", width: 1440, height: 900 }
]) {
  test(`${viewport.name}尺寸可完整呈现终局凝视`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("./?ending-preview=1");
    await expect(page.locator("[data-screen-label]")).toHaveAttribute("data-screen-label", "终局村民凝视");
    await expect(page.getByRole("img", { name: /六名村民/ })).toBeVisible();
    await expect(page.locator(".gaze-ending-actions button")).toHaveCount(2);
    await expectNoHorizontalOverflow(page);
  });
}
