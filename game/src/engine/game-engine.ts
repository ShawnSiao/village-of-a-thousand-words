export interface MemoryVariant {
  id: string;
  cost: number;
  text?: string;
}

export interface MemoryCard {
  id: string;
  initialVariant?: string;
  variants: MemoryVariant[];
}

export interface MemoryData {
  capacity: number;
  initialCards: string[];
  cards: MemoryCard[];
}

export type Selections = Record<string, string | null | undefined>;

export function findMemoryCard(memoryData: MemoryData, id: string): MemoryCard | undefined {
  return memoryData.cards.find((card) => card.id === id);
}

export function findMemoryVariant(card: MemoryCard | undefined, variantId: string | null | undefined): MemoryVariant | undefined {
  if (!card || !variantId) return undefined;
  return card.variants.find((variant) => variant.id === variantId);
}

export function calculateSelectionTotal(memoryData: MemoryData, selections: Selections): number {
  return Object.entries(selections).reduce((sum, [id, variantId]) => {
    const variant = findMemoryVariant(findMemoryCard(memoryData, id), variantId);
    return sum + (variant?.cost ?? 0);
  }, 0);
}

export function getVisibleMemoryIds(initialCards: string[], storyIds: string[], roundIndex: number): string[] {
  return initialCards.concat(storyIds.slice(0, roundIndex + 1));
}

export function variantDisplayLabel(variantId: string | null | undefined, labels: Record<string, string>): string {
  if (variantId == null) return "从碑上删去";
  return labels[variantId] ?? "未命名版本";
}

export function calculateOverflow(capacity: number, total: number): number {
  return Math.max(0, total - capacity);
}
