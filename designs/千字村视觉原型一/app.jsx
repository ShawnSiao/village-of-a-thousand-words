const { useEffect, useMemo, useState } = React;

const prototypeStorageKey = "千字村视觉原型一";

function readSavedPrototype() {
  try {
    return JSON.parse(localStorage.getItem(prototypeStorageKey) || "null");
  } catch (_) {
    return null;
  }
}

function findCard(memoryData, id) {
  return memoryData.cards.find((card) => card.id === id);
}

function findVariant(card, variantId) {
  return card?.variants.find((variant) => variant.id === variantId);
}

function createInitialSelections(memoryData) {
  return Object.fromEntries(
    memoryData.initialCards.map((id) => {
      const card = findCard(memoryData, id);
      return [id, card.initialVariant];
    })
  );
}

function Topbar({ round, onReset }) {
  return (
    <div className="topbar">
      <div className="brand-block">
        <span className="brand">千字村</span>
        <span className="chapter-label">第一幕 · 文字似乎只是记录</span>
      </div>
      <div className="top-actions">
        {round ? <span className="chapter-label">第 {round} / 5 回合</span> : null}
        <a className="text-link" href="纸面卡组.html">查看纸面卡组</a>
        <button className="quiet-button" type="button" onClick={onReset}>重新开始</button>
      </div>
    </div>
  );
}

function DirectPrompt({ prompt, value, onChange }) {
  if (!prompt) return null;
  return (
    <div className="direct-prompt">
      <span className="prompt-speaker">{prompt.speaker}向守字人发问</span>
      <p>{prompt.question}</p>
      <div className="prompt-choices">
        {prompt.choices.map((choice) => (
          <button
            className={`prompt-choice ${value === choice.id ? "selected" : ""}`}
            key={choice.id}
            type="button"
            onClick={() => onChange(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EventScreen({ story, directValue, onDirectChange, onEnterEditor, onReset }) {
  const needsAnswer = Boolean(story.prompt);
  return (
    <section className="screen event-layout" data-screen-label={`回合${story.round}事件`}>
      <Topbar round={story.round} onReset={onReset} />
      <div className="event-art">
        <img src={story.image} alt={`${story.title}场景`} />
        <div className="event-caption">
          <span className="year-mark">{story.year}</span>
          <h1>{story.title}</h1>
          <p>{story.summary}</p>
        </div>
      </div>
      <aside className="testimony-panel">
        <span className="panel-kicker">亲历者证词</span>
        <h2>同一件事，三种留下方式</h2>
        <div className="testimony-list">
          {story.testimony.map((item) => (
            <article className="testimony" key={item.name}>
              <span className="speaker-seal">{item.name.slice(0, 1)}</span>
              <p><strong>{item.name}</strong>{item.text}</p>
            </article>
          ))}
        </div>
        <DirectPrompt prompt={story.prompt} value={directValue} onChange={onDirectChange} />
        <div className="event-footer">
          <button
            className="primary-button"
            type="button"
            disabled={needsAnswer && !directValue}
            onClick={onEnterEditor}
          >
            整理本年碑文
          </button>
        </div>
      </aside>
    </section>
  );
}

function Capacity({ total, capacity }) {
  const ratio = Math.min(1, total / capacity);
  const over = total > capacity;
  return (
    <div className="capacity-head">
      <div className="capacity-row">
        <span>{over ? `超出 ${total - capacity} 字` : `尚余 ${capacity - total} 字`}</span>
        <strong>{total} / {capacity} 字</strong>
      </div>
      <div className="capacity-track">
        <div className={`capacity-fill ${over ? "over" : ""}`} style={{ width: `${ratio * 100}%` }}></div>
      </div>
    </div>
  );
}

function MemoryRail({ memoryData, visibleIds, selections, currentEventId, selectedId, onSelect }) {
  const activeIds = visibleIds.filter((id) => selections[id] !== null);
  const lostCount = visibleIds.length - activeIds.length;
  return (
    <aside className="memory-rail">
      <div className="rail-title">
        <span>碑上现存记忆</span>
        <strong>{activeIds.length} 段</strong>
      </div>
      <div className="memory-scroll">
        {activeIds.map((id) => {
          const card = findCard(memoryData, id);
          const variantId = selections[id];
          const variant = variantId ? findVariant(card, variantId) : null;
          const isDraft = id === currentEventId && !variantId;
          return (
            <button
              className={`memory-entry ${selectedId === id ? "active" : ""} ${id === currentEventId ? "new" : ""}`}
              type="button"
              key={id}
              onClick={() => onSelect(id)}
            >
              <span>
                <span className="entry-title">{card.title}</span>
                <span className="entry-version">{isDraft ? "本年未定稿" : window.variantLabels[variantId]}</span>
              </span>
              <span className="entry-cost">{variant ? `${variant.cost} 字` : "待定"}</span>
            </button>
          );
        })}
      </div>
      <div className="lost-count">碑外残字：{lostCount} 段不可恢复</div>
    </aside>
  );
}

function StelePreview({ card, variant, isDraft, showHints }) {
  const shownVariant = variant || card.variants[0];
  return (
    <main className="stone-stage">
      <article className="stele">
        <div className="stele-meta">
          <span>{card.source === "initial" ? "旧碑文" : "本年新事"}</span>
          <span>{isDraft ? "尚未封存" : `${window.variantLabels[shownVariant.id]} · ${shownVariant.cost} 字`}</span>
        </div>
        <h2>{card.title}</h2>
        <p className="stele-text">{shownVariant.text}</p>
        <p className="stele-note">
          {isDraft
            ? "完整记录已由亲历者证词生成。选择一种记述方式后，文字才会刻入公共记忆。"
            : showHints
              ? window.variantHints[`${card.id}:${shownVariant.id}`] || "这一版本已经成为村民共同记得的说法。"
              : "封存之后，失去的细节无法恢复。"}
        </p>
      </article>
    </main>
  );
}

function VariantPanel({ card, selectedVariantId, isCurrentEvent, currentEventReady, total, capacity, onChoose, onSeal }) {
  const isSealedShort = !isCurrentEvent && selectedVariantId && selectedVariantId !== "full";
  const variants = isSealedShort
    ? card.variants.filter((variant) => variant.id === selectedVariantId)
    : card.variants;
  const canSeal = currentEventReady && total <= capacity;
  return (
    <aside className="variant-panel">
      <div className="variant-head">
        <span>{isCurrentEvent ? "决定本年记述" : "重新整理旧事"}</span>
        <h3>{card.title}</h3>
      </div>
      <div className="variant-list">
        {variants.map((variant) => (
          <article
            className={`variant-card ${selectedVariantId === variant.id ? "selected" : ""}`}
            key={variant.id}
            onClick={() => onChoose(variant.id)}
          >
            <div className="variant-title">
              <span>{window.variantLabels[variant.id]}</span>
              <span>{variant.cost} 字</span>
            </div>
            <p className="variant-text">{variant.text}</p>
            <p className="variant-hint">{window.variantHints[`${card.id}:${variant.id}`] || (variant.id === "full" ? "保留当前完整记录。" : "这一版本会永久舍弃部分细节。")}</p>
          </article>
        ))}
        {!isCurrentEvent ? (
          <article className="variant-card delete" onClick={() => onChoose(null)}>
            <div className="variant-title"><span>从碑上删去</span><span>释放全部字数</span></div>
            <p className="variant-text">亲历者仍可能暂时记得。数年之后，这段事情将退出公共记忆。</p>
            <p className="variant-hint">删除后不能恢复。本次封存前仍可撤销。</p>
          </article>
        ) : null}
      </div>
      <div className="variant-footer">
        {total > capacity ? <p className="overflow-warning">石面已满。还需让其他记忆缩短 {total - capacity} 字。</p> : null}
        <button className="primary-button" type="button" disabled={!canSeal} onClick={onSeal}>封存本年</button>
      </div>
    </aside>
  );
}

function EditorScreen({ memoryData, story, visibleIds, selections, total, selectedId, onSelect, onChoose, onSeal, onReset }) {
  const selectedCard = findCard(memoryData, selectedId);
  const selectedVariantId = selections[selectedId];
  const selectedVariant = selectedVariantId ? findVariant(selectedCard, selectedVariantId) : null;
  return (
    <section className="screen editor-screen" data-screen-label={`回合${story.round}碑文编辑`}>
      <header className="editor-header">
        <div className="editor-brand-wrap"><span className="editor-brand">千字碑</span><button className="editor-reset" type="button" onClick={onReset}>重新开始</button></div>
        <div className="round-indicator">{story.year} · {story.title}</div>
        <Capacity total={total} capacity={memoryData.capacity} />
      </header>
      <div className="editor-grid">
        <MemoryRail
          memoryData={memoryData}
          visibleIds={visibleIds}
          selections={selections}
          currentEventId={story.id}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        <StelePreview
          card={selectedCard}
          variant={selectedVariant}
          isDraft={selectedId === story.id && !selectedVariantId}
          showHints={true}
        />
        <VariantPanel
          card={selectedCard}
          selectedVariantId={selectedVariantId}
          isCurrentEvent={selectedId === story.id}
          currentEventReady={Boolean(selections[story.id])}
          total={total}
          capacity={memoryData.capacity}
          onChoose={onChoose}
          onSeal={onSeal}
        />
      </div>
    </section>
  );
}

function ReactionScreen({ story, versionLabel, reaction, isLast, onContinue }) {
  return (
    <section
      className="screen reaction-screen"
      data-screen-label={`回合${story.round}封存反馈`}
      style={{ backgroundImage: `url(${story.image})` }}
    >
      <article className="reaction-sheet">
        <span className="reaction-seal">封</span>
        <h2>本年已经写定</h2>
        <span className="reaction-version">{story.title} · {versionLabel}</span>
        <p className="reaction-copy">{reaction}</p>
        <button className="paper-button" type="button" onClick={onContinue}>{isLast ? "查看第一幕结果" : "进入下一回合"}</button>
      </article>
    </section>
  );
}

function EndingScreen({ memoryData, selections, total, directAnswers, onReset }) {
  const keptCount = Object.values(selections).filter(Boolean).length;
  const lostCount = Object.values(selections).filter((value) => value === null).length;
  const promiseAccepted = directAnswers.E05 === "accept";
  const finalVersion = selections.E05;
  const broken = promiseAccepted && finalVersion === "myth";
  return (
    <section className="screen ending-screen" data-screen-label="第一幕结果" style={{ backgroundImage: "url(assets/scene-05-song.png)" }}>
      <article className="ending-sheet">
        <span className="reaction-seal">五</span>
        <h2>第一幕·碑上仍有余温</h2>
        <p className="reaction-copy">
          {broken
            ? "守字人接受了祝婆的托付，却在同一夜把真相重新写成神话。小满记住了这次失约。"
            : promiseAccepted
              ? "守字人接受了祝婆的托付。那根红线仍系在碑文旁，等待下一次字数不足。"
              : "守字人没有作出无法保证的承诺。祝婆把七个姓名留到下一次开口。"}
        </p>
        <div className="ending-stats">
          <div className="ending-stat"><strong>{total}</strong><span>现有字数</span></div>
          <div className="ending-stat"><strong>{keptCount}</strong><span>碑上记忆</span></div>
          <div className="ending-stat"><strong>{lostCount}</strong><span>碑外残字</span></div>
        </div>
        <div className="ending-actions">
          <a className="paper-link" href="纸面卡组.html">打开纸面卡组</a>
          <button className="paper-button" type="button" onClick={onReset}>重新试玩</button>
        </div>
      </article>
    </section>
  );
}

function Settings({ open, onToggle, showHints, compact, onHints, onCompact }) {
  return (
    <>
      {open ? (
        <aside className="settings-panel">
          <h4>原型设置</h4>
          <div className="setting-row">
            <span>显示影响提示</span>
            <button className={`switch ${showHints ? "on" : ""}`} type="button" onClick={() => onHints(!showHints)}><span></span></button>
          </div>
          <div className="setting-row">
            <span>紧凑碑文</span>
            <button className={`switch ${compact ? "on" : ""}`} type="button" onClick={() => onCompact(!compact)}><span></span></button>
          </div>
        </aside>
      ) : null}
      <button className="settings-toggle" type="button" onClick={onToggle}>{open ? "收起设置" : "原型设置"}</button>
    </>
  );
}

function App() {
  const [memoryData, setMemoryData] = useState(null);
  const saved = useMemo(() => readSavedPrototype(), []);
  const [roundIndex, setRoundIndex] = useState(saved?.roundIndex ?? 0);
  const [phase, setPhase] = useState(saved?.phase ?? "scene");
  const [selections, setSelections] = useState(saved?.selections ?? {});
  const [directAnswers, setDirectAnswers] = useState(saved?.directAnswers ?? {});
  const [selectedId, setSelectedId] = useState(saved?.selectedId ?? "E01");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    fetch("data/memory-cards.json")
      .then((response) => response.json())
      .then((data) => {
        setMemoryData(data);
        if (!saved?.selections || Object.keys(saved.selections).length === 0) {
          setSelections(createInitialSelections(data));
        }
      });
  }, []);

  useEffect(() => {
    if (!memoryData) return;
    localStorage.setItem(prototypeStorageKey, JSON.stringify({ roundIndex, phase, selections, directAnswers, selectedId }));
  }, [memoryData, roundIndex, phase, selections, directAnswers, selectedId]);

  const story = window.roundStories[roundIndex];
  const visibleIds = useMemo(() => {
    if (!memoryData) return [];
    return [...memoryData.initialCards, ...window.roundStories.slice(0, roundIndex + 1).map((item) => item.id)];
  }, [memoryData, roundIndex]);

  const total = useMemo(() => {
    if (!memoryData) return 0;
    return Object.entries(selections).reduce((sum, [id, variantId]) => {
      if (!variantId) return sum;
      const card = findCard(memoryData, id);
      const variant = findVariant(card, variantId);
      return sum + (variant?.cost || 0);
    }, 0);
  }, [memoryData, selections]);

  function resetPrototype() {
    if (!memoryData) return;
    localStorage.removeItem(prototypeStorageKey);
    setRoundIndex(0);
    setPhase("scene");
    setSelections(createInitialSelections(memoryData));
    setDirectAnswers({});
    setSelectedId("E01");
  }

  function enterEditor() {
    setSelectedId(story.id);
    setPhase("editor");
  }

  function chooseVariant(variantId) {
    setSelections((current) => ({ ...current, [selectedId]: variantId }));
    if (variantId === null) setSelectedId(story.id);
  }

  function sealRound() {
    if (!selections[story.id] || total > memoryData.capacity) return;
    setPhase("reaction");
  }

  function continueRound() {
    if (roundIndex === window.roundStories.length - 1) {
      setPhase("ending");
      return;
    }
    const nextIndex = roundIndex + 1;
    setRoundIndex(nextIndex);
    setSelectedId(window.roundStories[nextIndex].id);
    setPhase("scene");
  }

  if (!memoryData || Object.keys(selections).length === 0) {
    return <div className="loading-screen">正在展开千字碑……</div>;
  }

  const currentVariantId = selections[story.id];
  const currentVariant = findVariant(findCard(memoryData, story.id), currentVariantId);
  const reaction = story.reaction[currentVariantId] || "这段碑文已经成为村庄共同记得的版本。";

  return (
    <div className="app-shell" data-hints={showHints} data-compact={compact}>
      {phase === "scene" ? (
        <EventScreen
          story={story}
          directValue={directAnswers[story.id]}
          onDirectChange={(value) => setDirectAnswers((current) => ({ ...current, [story.id]: value }))}
          onEnterEditor={enterEditor}
          onReset={resetPrototype}
        />
      ) : null}
      {phase === "editor" ? (
        <EditorScreen
          memoryData={memoryData}
          story={story}
          visibleIds={visibleIds}
          selections={selections}
          total={total}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChoose={chooseVariant}
          onSeal={sealRound}
          onReset={resetPrototype}
        />
      ) : null}
      {phase === "reaction" ? (
        <ReactionScreen
          story={story}
          versionLabel={window.variantLabels[currentVariantId]}
          reaction={reaction}
          isLast={roundIndex === window.roundStories.length - 1}
          onContinue={continueRound}
        />
      ) : null}
      {phase === "ending" ? (
        <EndingScreen
          memoryData={memoryData}
          selections={selections}
          total={total}
          directAnswers={directAnswers}
          onReset={resetPrototype}
        />
      ) : null}
      <Settings
        open={settingsOpen}
        onToggle={() => setSettingsOpen((value) => !value)}
        showHints={showHints}
        compact={compact}
        onHints={setShowHints}
        onCompact={setCompact}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
