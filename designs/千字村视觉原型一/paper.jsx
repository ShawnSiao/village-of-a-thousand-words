const { useEffect, useState } = React;

const sceneImages = {
  E01: "assets/scene-01-flood.png",
  E02: "assets/scene-02-outsider.png",
  E03: "assets/scene-03-herbs.png",
  E04: "assets/scene-04-bridge.png",
  E05: "assets/scene-05-song.png"
};

function PaperCard({ card }) {
  const isEvent = card.source !== "initial";
  return (
    <article className="paper-card" data-screen-label={card.title}>
      {isEvent ? <img className="card-image" src={sceneImages[card.id]} alt={`${card.title}场景`} /> : null}
      <span className="cut-mark">{isEvent ? "新" : "旧"}</span>
      <header className="card-head">
        <h2>{card.title}</h2>
        <span className="card-kind">{isEvent ? "第一幕事件记忆" : "开局旧记忆"}</span>
      </header>
      <div className="variant-stack">
        {card.variants.map((variant) => (
          <section className="paper-variant" key={variant.id}>
            <div className="variant-head">
              <strong>{window.variantLabels[variant.id]}</strong>
              <span>{variant.cost} 字</span>
            </div>
            <p>{variant.text}</p>
            <p className="hint">{window.variantHints[`${card.id}:${variant.id}`] || (variant.id === "full" ? "保留当前完整记录。" : "这一版本会永久舍弃部分细节。")}</p>
          </section>
        ))}
      </div>
    </article>
  );
}

function PaperApp() {
  const [memoryData, setMemoryData] = useState(null);
  const [view, setView] = useState("initial");

  useEffect(() => {
    fetch("data/memory-cards.json").then((response) => response.json()).then(setMemoryData);
  }, []);

  if (!memoryData) return <div className="empty-state">正在铺开纸面卡组……</div>;
  const ids = view === "initial" ? memoryData.initialCards : memoryData.roundCards;
  const cards = ids.map((id) => memoryData.cards.find((card) => card.id === id));

  return (
    <div className="paper-app">
      <header className="paper-topbar">
        <span className="paper-brand">千字村·第一幕纸面卡组</span>
        <div className="paper-actions">
          <button className={view === "initial" ? "active" : ""} type="button" onClick={() => setView("initial")}>开局旧记忆</button>
          <button className={view === "rounds" ? "active" : ""} type="button" onClick={() => setView("rounds")}>回合事件记忆</button>
          <a href="千字村第一幕.html">进入交互原型</a>
          <button type="button" onClick={() => window.print()}>打印当前卡组</button>
        </div>
      </header>
      <main className="paper-main">
        <section className="paper-intro">
          <div>
            <h1>{view === "initial" ? "开局旧记忆" : "第一幕事件记忆"}</h1>
            <p>{view === "initial" ? "10 张旧记忆以完整版本开局。玩家在后续回合中可以保留、压缩或删除；一旦封存，失去的细节不能恢复。" : "5 张事件记忆对应第一幕五个回合。每张卡包含完整记录与两种价值不同的压缩方式。"}</p>
          </div>
          <div className="capacity-block">
            <div><strong>{view === "initial" ? memoryData.initialCost : "5 回合"}</strong><span>{view === "initial" ? `开局占用／容量 ${memoryData.capacity}` : "第一幕测试范围"}</span></div>
          </div>
        </section>
        <section className="card-grid">
          {cards.map((card) => <PaperCard card={card} key={card.id} />)}
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PaperApp />);
