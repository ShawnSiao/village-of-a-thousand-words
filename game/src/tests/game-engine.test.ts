import { describe, expect, it } from "vitest";
import {
  calculateOverflow,
  calculateSelectionTotal,
  getVisibleMemoryIds,
  variantDisplayLabel,
  type MemoryData
} from "../engine/game-engine";

const memoryData: MemoryData = {
  capacity: 1000,
  initialCards: ["M00", "M01"],
  cards: [
    { id: "M00", variants: [{ id: "full", cost: 90 }, { id: "short", cost: 28 }] },
    { id: "M01", variants: [{ id: "full", cost: 40 }] },
    { id: "E01", variants: [{ id: "warning", cost: 38 }] }
  ]
};

describe("千字碑规则", () => {
  it("只统计仍在碑上的版本", () => {
    expect(calculateSelectionTotal(memoryData, { M00: "short", M01: null, E01: "warning" })).toBe(66);
  });

  it("按回合逐步开放公共记忆", () => {
    expect(getVisibleMemoryIds(memoryData.initialCards, ["E01", "E02", "E03"], 1)).toEqual(["M00", "M01", "E01", "E02"]);
  });

  it("容量超限不会产生负数", () => {
    expect(calculateOverflow(1000, 1012)).toBe(12);
    expect(calculateOverflow(1000, 983)).toBe(0);
  });

  it("内部版本通过中文名称进入界面", () => {
    expect(variantDisplayLabel("warning", { warning: "预警版本" })).toBe("预警版本");
    expect(variantDisplayLabel(null, {})).toBe("从碑上删去");
  });
});
