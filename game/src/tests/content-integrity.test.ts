import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import memoryData from "../../public/data/memory-cards.json";

const expectedRounds = Array.from({ length: 15 }, (_, index) => `E${String(index + 1).padStart(2, "0")}`);
const sourceRoot = resolve(import.meta.dirname, "..");
const dataSource = readFileSync(resolve(sourceRoot, "content/data.js"), "utf8");
const narrativeSource = readFileSync(resolve(sourceRoot, "content/narrative.js"), "utf8");

describe("十五回合内容完整性", () => {
  it("记忆卡包含十五段回合记忆", () => {
    const roundCardIds = memoryData.cards.filter((card) => /^E\d{2}$/.test(card.id)).map((card) => card.id);
    expect(roundCardIds).toEqual(expectedRounds);
  });

  it("每个回合都有事件、候选碑文与场景图", () => {
    for (const id of expectedRounds) {
      expect(dataSource).toContain(`id: "${id}"`);
      expect(dataSource).toMatch(new RegExp(`${id.replace("E", "scene-")}[^\\n]*\\.webp|scene-${id.slice(1)}[^\\n]*\\.webp`));
      expect(memoryData.cards.find((card) => card.id === id)?.variants.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("每个回合都有扩写叙事与封存场景", () => {
    for (const id of expectedRounds) {
      expect(narrativeSource).toContain(`${id}: {`);
    }
    expect((narrativeSource.match(/sealSetting:/g) ?? []).length).toBe(15);
  });

  it("所有玩家可见流程只提供人工编写的选择", () => {
    expect(dataSource).not.toContain("contenteditable");
    expect(dataSource).not.toContain("textarea");
    expect(dataSource).not.toContain("生成式");
  });
});
