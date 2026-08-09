const { useEffect, useMemo, useState } = React;

const storageKey = "千字村十五回合叙事情感原型九存档";

function readStoredGame() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch (_) {
    return null;
  }
}

function findCard(memoryData, id) {
  return memoryData.cards.find(function (card) { return card.id === id; });
}

function findVariant(card, variantId) {
  return card && card.variants.find(function (variant) { return variant.id === variantId; });
}

function createInitialSelections(memoryData) {
  return Object.fromEntries(memoryData.initialCards.map(function (id) {
    const card = findCard(memoryData, id);
    return [id, card.initialVariant];
  }));
}

function createFreshGame(memoryData) {
  return {
    view: "prologue",
    prologueStep: 0,
    overviewStep: 0,
    oldSelectedId: "M00",
    roundIndex: 0,
    selections: createInitialSelections(memoryData),
    directAnswers: {},
    selectedId: "E01",
    history: [],
    echoes: [],
    roundSnapshot: null,
    lastRoundChanges: []
  };
}

function calculateTotal(memoryData, selections) {
  return Object.entries(selections).reduce(function (sum, entry) {
    const id = entry[0];
    const variantId = entry[1];
    if (!variantId) return sum;
    const variant = findVariant(findCard(memoryData, id), variantId);
    return sum + (variant ? variant.cost : 0);
  }, 0);
}

function getVisibleIds(memoryData, roundIndex) {
  return memoryData.initialCards.concat(
    window.roundStories.slice(0, roundIndex + 1).map(function (story) { return story.id; })
  );
}

function labelForVariant(variantId) {
  if (variantId === null) return "从碑上删去";
  return window.variantLabels[variantId] || "未命名版本";
}

function AppHeader(props) {
  return (
    <header className="app-header">
      <button className="wordmark" type="button" onClick={props.onHome} aria-label="返回标题页">
        <span>千字村</span>
        <small>十五回合叙事情感原型九</small>
      </button>
      <div className="header-progress">
        {props.round ? <span>当前：第 {props.round} / 15 回合</span> : <span>完整篇章：15 回合</span>}
      </div>
      <button className="text-button" type="button" onClick={props.onReset}>重新开始</button>
    </header>
  );
}

function TitleScreen(props) {
  return (
    <section className="screen title-screen" data-screen-label="标题页">
      <img className="full-bleed-image" src="assets/imagegen/01-入口标题图片原型.png" alt="" />
      <div className="title-vignette"></div>
      <div className="title-content">
        <span className="eyebrow">中文叙事决策游戏</span>
        <h1>千字村</h1>
        <p className="subtitle">一座村庄能记住什么，就会成为什么。</p>
        <blockquote className="title-thesis">
          <strong>你不能替村庄选择未来。</strong>
          <span>你只能决定，它带着哪些记忆走向未来。</span>
        </blockquote>
        <p className="title-intro">一座村庄共享一块只能容纳一千字的公共记忆。每段新记忆进入，都可能迫使另一段旧事被压缩、改写或遗忘。</p>
        <div className="title-actions">
          <button className="primary-button large" type="button" onClick={props.onNew}>接过红线</button>
          <button className="secondary-button large" type="button" disabled={!props.hasSave} onClick={props.onContinue}>
            {props.hasSave ? "继续旧村志" : "暂无旧村志"}
          </button>
          <button className="link-button" type="button" onClick={props.onDuty}>先了解玩法</button>
        </div>
        <div className="scope-note">
          <strong>完整首版：15 回合 · 单局 20～40 分钟</strong>
          <span>本次原型开放全部 15 回合，完整验证记忆取舍、红线托付、延迟后果与最终传碑。</span>
        </div>
      </div>
    </section>
  );
}

function DutyScreen(props) {
  const roles = [
    ["守字人", "决定碑文", "听取证词、定稿新事，并在字数不足时整理旧记忆。守字人不负责亲自雕刻。"],
    ["刻字匠", "更换碑片", "按照定稿雕刻、拆换和磨平碑片，不决定哪些事实应当留下。"],
    ["守碑人", "维护碑身", "清洁、修补并看守固定碑身，不修改碑文内容。"]
  ];
  const duties = [
    ["一", "听取证词", "同一件事会有不同亲历者、不同诉求和不同说法。"],
    ["二", "决定公共说法", "从完整记录与两种压缩写法中，选择进入千字碑的版本。"],
    ["三", "整理旧记忆", "碑面不足时，压缩或删去旧事，为新记录腾出位置。"],
    ["四", "承担后果", "村民依据碑上仍然存在的知识、关系和信仰自行行动。"]
  ];
  return (
    <section className="screen duty-screen" data-screen-label="守字人的职责">
      <img className="full-bleed-image" src="assets/imagegen/03-碑片结构纯背景.png" alt="" />
      <div className="dark-wash"></div>
      <article className="duty-sheet">
        <span className="eyebrow dark">开始之前</span>
        <h1>决定文字的人，不是雕刻文字的人</h1>
        <p className="lead">守字人不替村民生活，也不直接决定谁该做什么。职责是决定哪一种过去能够继续成为全村的共同事实，再由刻字匠把定稿刻进碑片。</p>
        <div className="role-grid">
          {roles.map(function (item) {
            return <article className="role-card" key={item[0]}><span>{item[0]}</span><strong>{item[1]}</strong><p>{item[2]}</p></article>;
          })}
        </div>
        <h2 className="duty-subtitle">守字人的一年</h2>
        <div className="duty-grid">
          {duties.map(function (item) {
            return (
              <div className="duty-card" key={item[0]}>
                <span>{item[0]}</span>
                <h2>{item[1]}</h2>
                <p>{item[2]}</p>
              </div>
            );
          })}
        </div>
        <div className="duty-boundary">
          <strong>守字人不会逐字编写一千字。</strong>
          <span>所有事件、记忆和压缩版本均已写定。玩家选择的是哪一种意义被公开传给后来者。</span>
        </div>
        <button className="paper-button" type="button" onClick={props.onBack}>返回标题页</button>
      </article>
    </section>
  );
}

const prologuePages = [
  {
    kicker: "序章·守字人的清晨",
    title: "上一任守字人已经离去",
    image: "assets/imagegen/02-序章职责图片原型.png",
    body: "清晨的雨刚停，守字祠里只剩一张空椅、尚未干透的墨和一把旧刻刀。上一任守字人把红线留在椅背上，另一端系着一枚没有刻字的碑片。村里人已经在门外等候：他们带来的不是同一个故事，却都希望自己的那一段能被村庄记住。",
    roleTitle: "你的身份：守字人",
    roleBody: "从这一刻起，由你听取证词、整理旧文，并决定哪一种说法进入全村共同阅读的千字碑。",
    note: "红线代表一项具体托付。它不会阻止删改，却会记住守字人答应过什么。"
  },
  {
    kicker: "序章·守字人的职责",
    title: "你决定的不是行动，而是依据",
    image: "assets/imagegen/02-序章职责图片原型.png",
    body: "守字人不指挥耕种、迁徙或祭祀，也不能替任何人判定善恶。你要听取亲历者证词，决定新事怎样写入碑文；碑面不足时，还要保留、压缩、改写或删去旧文。村民会依据仍然可读的文字传授知识、确认关系并理解共同的过去。",
    note: "你的选择不会立刻命令村民行动，却会改变后来的人还能依据什么作出决定。"
  },
  {
    kicker: "序章·碑片更替",
    title: "整座碑不动，旧文字仍会离开",
    image: "assets/imagegen/03-碑片结构纯背景.png",
    body: "千字碑由固定碑身和许多可替换碑片组成。新文先在新片上刻定；压缩或改写旧事时，刻字匠只换下对应碑片。被删除的旧片会磨平，用来修补碑座，不再作为公开档案保存。亲历者也许仍记得，但后来者无法稳定继承。",
    structureSteps: [
      ["决定碑文", "守字人完成本年定稿。"],
      ["雕刻碑片", "刻字匠把定稿刻在新碑片上。"],
      ["更换旧片", "压缩或改写时，只替换受影响的碑片。"],
      ["磨去旧文", "被删除的旧片会磨平，用于修补碑座，不再公开保存。"]
    ],
    quote: "决定文字的是守字人；执行雕刻的是刻字匠；维护碑身的是守碑人。"
  },
  {
    kicker: "序章·任期第一年",
    title: "第一段新记忆是东桥洪水",
    image: "assets/imagegen/02-序章职责图片原型.png",
    body: "你接任时，碑上已经有开村、药方、人物往来等十段旧文。第一场春洪刚刚冲垮东桥，三名亲历者对应该留下什么各有主张。先决定本年新事「东桥洪水」怎样进入碑文；如果总字数超过一千，再整理更早的旧记忆。",
    rules: [
      "本年新事必须先选择一个公开版本。",
      "完整、压缩与改写会保留不同意义。",
      "总字数超过一千时，必须整理旧碑记忆。",
      "封存以后，被删去的细节不能恢复。"
    ],
    quote: "这是守字人任期的第一年。先处理本年新事，再决定哪段旧事需要变短。"
  }
];

function PrologueScreen(props) {
  const page = prologuePages[props.step];
  useEffect(function () {
    const sheet = document.querySelector(".prologue-copy");
    if (sheet) sheet.scrollTop = 0;
  }, [props.step]);
  return (
    <section className="screen prologue-screen" data-screen-label={"序章第" + (props.step + 1) + "页"}>
      <img className="full-bleed-image" src={page.image} alt="" />
      <div className={"prologue-copy " + (page.structureSteps ? "structure-copy" : "")}>
        <span className="eyebrow dark">{page.kicker}</span>
        <h1>{page.title}</h1>
        {page.body ? <p className="prologue-body">{page.body}</p> : null}
        {page.roleTitle ? (
          <aside className="role-handoff" aria-label="守字人身份交接">
            <span className="role-handoff-seal" aria-hidden="true">守</span>
            <div>
              <strong>{page.roleTitle}</strong>
              <p>{page.roleBody}</p>
            </div>
          </aside>
        ) : null}
        {page.note ? <p className="prologue-note">{page.note}</p> : null}
        {page.structureSteps ? (
          <div className="structure-step-list">
            {page.structureSteps.map(function (item, index) {
              return <article key={item[0]}><span>{["一", "二", "三", "四"][index]}</span><p><strong>{item[0]}</strong>{item[1]}</p></article>;
            })}
          </div>
        ) : null}
        {page.rules ? (
          <ol className="rule-list">
            {page.rules.map(function (rule, index) {
              return <li key={rule}><span>{["一", "二", "三", "四"][index]}</span><p>{rule}</p></li>;
            })}
          </ol>
        ) : null}
        {page.quote ? <blockquote>{page.quote}</blockquote> : null}
        <div className="step-footer">
          <button className="prologue-back-button" type="button" onClick={props.onBack}>
            {props.step === 0 ? "返回标题页" : "返回上一页"}
          </button>
          <span aria-label={"序章第 " + (props.step + 1) + " 页，共 4 页"}>{props.step + 1} / 4</span>
          <button className="paper-button prologue-next-button" type="button" onClick={props.onNext}>
            {props.step === 3 ? "走到千字碑前" : "继续"}
          </button>
        </div>
      </div>
    </section>
  );
}

function OldSteleScreen(props) {
  const [readMode, setReadMode] = useState("all");
  const selectedCard = findCard(props.memoryData, props.selectedId);
  const selectedVariant = findVariant(selectedCard, selectedCard.initialVariant);
  const meta = window.oldMemoryMeta[selectedCard.id];
  return (
    <section className="screen old-stele-screen" data-screen-label="阅读旧碑">
      <AppHeader onHome={props.onHome} onReset={props.onReset} />
      <div className="old-stele-backdrop">
        <img src="assets/imagegen/04-整碑阅读纯背景.png" alt="" />
      </div>
      <div className="old-stele-content">
        <aside className="old-memory-list">
          <div className="panel-heading">
            <span>最初的千字碑</span>
            <strong>10 段旧记忆 · {props.memoryData.initialCost} / {props.memoryData.capacity} 字</strong>
          </div>
          <button
            className={"old-overview-item " + (readMode === "all" ? "selected" : "")}
            type="button"
            onClick={function () { setReadMode("all"); }}
          >
            <span>整碑通读</span>
            <small>连续阅读全部 10 段旧碑文</small>
          </button>
          <div className="old-directory-label">逐段查看</div>
          <div className="old-memory-scroll">
            {props.memoryData.initialCards.map(function (id) {
              const card = findCard(props.memoryData, id);
              const variant = findVariant(card, card.initialVariant);
              const itemMeta = window.oldMemoryMeta[id];
              return (
                <button
                  className={"old-memory-item " + (readMode === "single" && props.selectedId === id ? "selected" : "")}
                  type="button"
                  key={id}
                  onClick={function () {
                    props.onSelect(id);
                    setReadMode("single");
                  }}
                >
                  <span><strong>{card.title}</strong><small>{itemMeta.year}</small></span>
                  <em>{variant.cost} 字</em>
                </button>
              );
            })}
          </div>
        </aside>
        <main className="old-stele-reader">
          <header className="old-reader-header">
            <div>
              <span className="eyebrow dark">{readMode === "all" ? "开村之初 · 旧碑拓本" : meta.year + " · 旧碑拓本"}</span>
              <h1>{readMode === "all" ? "最初的千字碑" : selectedCard.title}</h1>
              <p>{readMode === "all"
                ? "守字人接手时，碑上已经刻有以下十段文字。它们共占 911 字，也将成为以后每次取舍的起点。"
                : meta.year + " · " + meta.use
              }</p>
            </div>
            <div className="old-reader-capacity">
              <span>旧碑已用</span>
              <strong>{props.memoryData.initialCost} / {props.memoryData.capacity} 字</strong>
              <div><i style={{ width: (props.memoryData.initialCost / props.memoryData.capacity * 100) + "%" }}></i></div>
            </div>
          </header>
          {readMode === "all" ? (
            <div className="old-full-reader">
              <div className="old-full-reader-note">
                <strong>这是真正存在于碑上的最初文字。</strong>
                <span>向下通读十段旧文；以后新增任何记忆，都可能迫使其中一段变短。</span>
              </div>
              {props.memoryData.initialCards.map(function (id, index) {
                const card = findCard(props.memoryData, id);
                const variant = findVariant(card, card.initialVariant);
                const itemMeta = window.oldMemoryMeta[id];
                return (
                  <article className="old-full-memory" key={id}>
                    <div className="old-full-memory-number">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <header>
                        <span>{itemMeta.year}</span>
                        <em>{variant.cost} 字</em>
                      </header>
                      <h2>{card.title}</h2>
                      <p>{variant.text}</p>
                    </div>
                  </article>
                );
              })}
              <footer className="old-reader-finish">
                <p>十段旧文已经读完。它们不是背景资料，而是接下来能够被保留、压缩或遗忘的全部过去。</p>
                <button className="paper-button" type="button" onClick={props.onContinue}>我已读完最初的碑文</button>
              </footer>
            </div>
          ) : (
            <div className="old-single-reader">
              <div className="old-memory-meta">
                <span>相关人物：{meta.relates}</span>
                <span>可能用途：{meta.use}</span>
                <span>当前占用：{selectedVariant.cost} 字</span>
              </div>
              <p>{selectedVariant.text}</p>
              <div className="old-memory-warning">几年后，这段旧文可能必须被压缩。压缩能够保留一种作用，也会让其他细节退出公共记忆。</div>
              <button className="secondary-paper-button" type="button" onClick={function () { setReadMode("all"); }}>返回整碑通读</button>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

function OverviewScreen(props) {
  const steps = [
    ["一", "听取证词", "先了解发生了什么，以及不同的人希望后世记住什么。"],
    ["二", "选择记述", "完整记录保留更多事实；两个短版本保留不同价值。"],
    ["三", "检查容量", "总字数超过一千时，必须压缩或删去旧记忆。"],
    ["四", "封存本年", "封存后，失去的细节无法恢复，后果会在以后出现。"]
  ];
  return (
    <section className="screen overview-screen" data-screen-label={props.step === 0 ? "玩法概览首图" : props.step === 1 ? "碑片更新教学" : "玩法四步教学"}>
      <AppHeader onHome={props.onHome} onReset={props.onReset} />
      <div className="overview-body">
        <div className="overview-copy">
          <span className="eyebrow">{props.step === 0 ? "玩法全景" : props.step === 1 ? "碑文如何更新" : "守字人的一年"}</span>
          <h1>{props.step === 0 ? "每一次记录，都会挤压另一段过去" : props.step === 1 ? "更换碑片，不重刻整座石碑" : "四步完成一次公共记忆"}</h1>
          <p>{props.step === 0
            ? "左侧是事件与证词，中间是千字碑和记述版本，右侧是容量与封存。这张完整玩法全景会在正式教学中清楚出现。"
            : props.step === 1
              ? "守字人完成定稿后，刻字匠只更换受影响的碑片。被磨去的旧文不会作为第二套公开档案继续存在。"
              : "第一回合先比较三种写法；从第二回合起，字数压力逐步逼近。超限时必须整理旧记忆，封存按钮才会重新可用。"
          }</p>
          {props.step === 2 ? (
            <div className="overview-step-list">
              {steps.map(function (item) {
                return <div key={item[0]}><span>{item[0]}</span><p><strong>{item[1]}</strong>{item[2]}</p></div>;
              })}
            </div>
          ) : props.step === 1 ? (
            <div className="overview-principle">决定文字的是守字人；执行雕刻的是刻字匠；维护碑身的是守碑人。</div>
          ) : (
            <div className="overview-principle">选择不是「多留还是少留」，而是「让哪一种意义继续生效」。</div>
          )}
          <button className="primary-button" type="button" onClick={props.onNext}>
            {props.step === 0 ? "了解碑片更替" : props.step === 1 ? "查看四步操作" : "进入第一回合"}
          </button>
        </div>
        <figure className="overview-figure">
          <img
            src={props.step === 0 ? "assets/reference/核心玩法全景.png" : props.step === 1 ? "assets/imagegen/03-碑片结构纯背景.png" : "assets/imagegen/05-超限与红线图片原型.png"}
            alt={props.step === 0 ? "千字村完整玩法全景" : props.step === 1 ? "千字碑碑片更替说明" : "容量超限与红线托付界面"}
          />
          <figcaption>{props.step === 0 ? "完整玩法全景" : props.step === 1 ? "固定碑身与可替换碑片" : "一：证词　二：版本　三：容量　四：封存"}</figcaption>
        </figure>
      </div>
    </section>
  );
}

function DirectPrompt(props) {
  if (!props.prompt) return null;
  return (
    <div className="direct-prompt">
      <span>{props.prompt.speaker}向守字人发问</span>
      <p>{props.prompt.question}</p>
      <div>
        {props.prompt.choices.map(function (choice) {
          return (
            <button
              className={props.value === choice.id ? "selected" : ""}
              type="button"
              key={choice.id}
              onClick={function () { props.onChange(choice.id); }}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoundOpeningScreen(props) {
  const [step, setStep] = useState(0);
  const narrative = window.roundNarrativeV9[props.story.id];
  const labels = ["发生了什么", "谁正在承担代价", "为什么必须写碑"];
  return (
    <section className="screen round-opening-screen" data-screen-label={"第" + props.story.round + "回合开场"}>
      <AppHeader round={props.story.round} onHome={props.onHome} onReset={props.onReset} />
      <div className="round-opening-stage">
        <img src={props.story.image} alt={props.story.title + "事件场景"} />
        <div className="round-opening-shade"></div>
        <header className="round-opening-heading">
          <span>第 {props.story.round} 回合</span>
          <h1>{props.story.title}</h1>
          <p>{props.story.year}</p>
        </header>
        <div className={"round-beat round-beat-" + step} aria-live="polite">
          <div className="round-beat-index"><span>{["一", "二", "三"][step]}</span><strong>{labels[step]}</strong></div>
          <p>{narrative.beats[step]}</p>
        </div>
        <nav className="round-beat-progress" aria-label="事件开场进度">
          {labels.map(function (label, index) {
            return <button key={label} className={step === index ? "current" : step > index ? "read" : ""} type="button" onClick={function () { if (index <= step) setStep(index); }}><span>{["一", "二", "三"][index]}</span><em>{label}</em></button>;
          })}
        </nav>
        <div className="round-opening-actions">
          <button className="opening-back" type="button" onClick={props.onBack}>{props.backLabel || "返回标题页"}</button>
          <button className="primary-button large" type="button" onClick={function () {
            if (step < 2) setStep(step + 1);
            else props.onContinue();
          }}>{step < 2 ? "继续看" : "听取证词"}</button>
        </div>
      </div>
    </section>
  );
}

function EventScreen(props) {
  const story = props.story;
  const [expandedSpeaker, setExpandedSpeaker] = useState(null);
  const narrative = window.roundNarrativeV9[story.id];
  const clues = window.buildCauseClues(story.id, props.selections, props.directAnswers);
  const recitationChoices = story.recitation
    ? ["E09", "E11", "E12", "M04", "M07", "M08", "E08", "E06", "M00"].filter(function (id) {
        return props.selections[id] && findCard(props.memoryData, id);
      }).map(function (id) {
        const card = findCard(props.memoryData, id);
        return { id: id, label: card.title + " · " + labelForVariant(props.selections[id]) };
      })
    : [];
  const recitationPrompt = story.recitation ? {
    id: "main",
    speaker: "开碑宣读",
    question: "从当前碑上仍然存在的记忆中选择一段公开宣读。宣读会放大它的理由，但不会恢复已删内容。",
    choices: recitationChoices
  } : null;
  const prompts = story.prompts || (story.prompt ? [Object.assign({ id: "main" }, story.prompt)] : recitationPrompt ? [recitationPrompt] : []);
  const promptValue = function (prompt) {
    return story.prompts ? (props.directValue || {})[prompt.id] : props.directValue;
  };
  const needsAnswer = prompts.length > 0;
  const allAnswered = prompts.every(function (prompt) { return Boolean(promptValue(prompt)); });
  return (
    <section className="screen event-screen" data-screen-label={"回合" + story.round + "事件"}>
      <AppHeader round={story.round} onHome={props.onHome} onReset={props.onReset} />
      <div className="event-grid">
        <div className="event-visual">
          <img src={story.image} alt={story.title + "场景"} />
          <div className="event-title-block testimony-context">
            <span>{story.year}</span>
            <h1>{story.title}</h1>
            <p>你已经看过事件经过。现在听听亲历者各自想让村庄留下什么，以及他们为什么这样说。</p>
          </div>
          {story.round === 1 ? <div className="tutorial-pin"><span>一</span><p><strong>你是守字人。</strong>先读事件，再决定碑上留下什么。</p></div> : null}
        </div>
        <aside className="testimony-panel">
          {clues.length ? (
            <section className="cause-strip" aria-label="旧碑正在影响什么">
              <div><span>旧碑正在影响什么</span><strong>这些不是预告，而是已经生效的旧选择</strong></div>
              <div className="cause-chip-row">
                {clues.map(function (clue, index) {
                  return <article key={index}><span>{clue.source}</span><p>{clue.text}</p></article>;
                })}
              </div>
            </section>
          ) : null}
          <div className="panel-heading">
            <span>亲历者证词</span>
            <strong>{story.question}</strong>
          </div>
          {story.round === 1 ? (
            <div className="testimony-step-heading">
              <span>二</span>
              <strong>比较三个人想让村庄记住什么</strong>
            </div>
          ) : null}
          <div className="testimony-list">
            {story.testimony.map(function (item) {
              return (
                <article className={"testimony-card " + (expandedSpeaker === item.name ? "expanded" : "")} key={item.name}>
                  <span className="speaker-seal">{item.name.slice(0, 1)}</span>
                  <div>
                    <h2>{item.name}<small>{item.role}</small></h2>
                    <p>{item.text}</p>
                    {expandedSpeaker === item.name ? <p className="testimony-more">{narrative.more[item.name]}</p> : null}
                    <button className="listen-more" type="button" onClick={function () { setExpandedSpeaker(expandedSpeaker === item.name ? null : item.name); }}>{expandedSpeaker === item.name ? "收起补充证词" : "继续听"}</button>
                  </div>
                </article>
              );
            })}
          </div>
          {prompts.map(function (prompt) {
            return (
              <DirectPrompt
                key={prompt.id}
                prompt={prompt}
                value={promptValue(prompt)}
                onChange={function (value) { props.onDirectChange(prompt.id, value); }}
              />
            );
          })}
          <div className="event-action">
            {needsAnswer && !allAnswered ? <p>先完成上方回应，才能继续整理碑文。</p> : <p>证词不会自动成为公共记忆。下一步由你决定碑上的版本。</p>}
            <button className="primary-button" type="button" disabled={needsAnswer && !allAnswered} onClick={props.onEnterEditor}>
              整理本年碑文
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Capacity(props) {
  const over = props.total > props.capacity;
  return (
    <div className={"capacity " + (over ? "over" : "")}>
      <div><span>{over ? "碑面超出 " + (props.total - props.capacity) + " 字" : "碑面尚余 " + (props.capacity - props.total) + " 字"}</span><strong>{props.total} / {props.capacity} 字</strong></div>
      <div className="capacity-track"><i style={{ width: Math.min(100, props.total / props.capacity * 100) + "%" }}></i></div>
    </div>
  );
}

function PledgeNotice(props) {
  if (!props.pledge) return null;
  return (
    <div className={"pledge-notice " + props.pledge.tone + (props.compact ? " compact" : "")}>
      <span>{props.pledge.state}</span>
      <p>{props.pledge.detail}</p>
    </div>
  );
}

function OverflowBanner(props) {
  if (props.total <= props.capacity) return null;
  return (
    <section className="overflow-banner" role="alert" aria-live="assertive">
      <div>
        <span>千字碑超出 {props.total - props.capacity} 字</span>
        <strong>请选择一段标有「可整理」的旧记忆进行压缩或删除，才能封存本年。</strong>
      </div>
      {props.target ? <button type="button" onClick={props.onResolve}>先整理「{props.target.title}」</button> : null}
    </section>
  );
}

function MemoryRail(props) {
  const currentId = props.currentEventId;
  const oldIds = props.visibleIds.filter(function (id) { return id !== currentId; });
  function renderItem(id) {
    const card = findCard(props.memoryData, id);
    const variantId = props.selections[id];
    const variant = variantId ? findVariant(card, variantId) : null;
    const isCurrent = id === currentId;
    const existedAtStart = Object.prototype.hasOwnProperty.call(props.roundSnapshot || {}, id);
    const priorVariantId = existedAtStart ? props.roundSnapshot[id] : undefined;
    const deleted = variantId === null && !isCurrent;
    const newlyDeleted = deleted && priorVariantId !== null;
    const editable = !isCurrent && priorVariantId !== null;
    const pledge = window.getPledgeState(id, variantId, props.directAnswers);
    return (
      <button
        className={"memory-rail-item " + (props.selectedId === id ? "selected " : "") + (isCurrent ? "current " : "") + (deleted ? "deleted " : "") + (props.over && editable ? "editable-over " : "") + (pledge ? "entrusted" : "")}
        type="button"
        key={id}
        onClick={function () { props.onSelect(id); }}
      >
        <span><strong>{card.title}</strong><small>{isCurrent && !variantId ? "本年新事 · 等待定稿" : deleted ? newlyDeleted ? "本轮拟删除" : "此前已离开碑面" : labelForVariant(variantId)}</small></span>
        <em>{variant ? variant.cost + " 字" : deleted ? "0 字" : "待定"}</em>
        {pledge ? <b className={"pledge-chip " + pledge.tone}>红线托付 · {pledge.state}</b> : props.over && editable ? <b className="editable-chip">可整理</b> : null}
      </button>
    );
  }
  return (
    <aside className="memory-rail">
      <section className="memory-rail-section current-memory-section">
        <div className="panel-heading"><span>本年新事</span><strong>必须先定稿</strong></div>
        {props.storyRound === 1 ? <p className="first-year-guide">这是守字人任期的第一年。先决定「东桥洪水」如何进入碑文；碑面不足时，再整理更早的旧事。</p> : null}
        {renderItem(currentId)}
      </section>
      <section className="memory-rail-section old-memory-section">
        <div className="panel-heading"><span>旧碑记忆</span><strong>{props.over ? "容量不足，请比较可整理的旧文" : "碑面不足时可以整理"}</strong></div>
      <div className="memory-rail-scroll">
        {oldIds.map(renderItem)}
      </div>
      </section>
      <button className="undo-button" type="button" onClick={props.onUndo}>撤销本轮全部修改</button>
    </aside>
  );
}

function StelePreview(props) {
  const shown = props.variant || props.card.variants[0];
  return (
    <main className="stone-stage">
      <article className="stele-card">
        <div className="stele-card-meta"><span>{props.isCurrent ? "本年新事" : "旧碑文"}</span><span>{props.isDeleted ? "拟从碑上删去" : props.isDraft ? "尚未选择版本" : labelForVariant(shown.id) + " · " + shown.cost + " 字"}</span></div>
        <h1>{props.card.title}</h1>
        {props.isDeleted ? (
          <div className="deleted-preview"><span>此段文字将在封存后离开公共记忆</span><p>{shown.text}</p></div>
        ) : <p className="stele-text">{shown.text}</p>}
        <PledgeNotice pledge={props.pledge} />
        <div className="stele-explanation">
          {props.isDraft
            ? "完整记录已从证词中形成。选择一种写法后，它才会进入公共记忆。"
            : props.isDeleted
              ? "亲历者不会当场失忆，但后来者将无法从碑上知道这件事。"
              : window.variantHints[props.card.id + ":" + shown.id] || "这一版本已经成为村民共同记得的说法。"
          }
        </div>
      </article>
    </main>
  );
}

function VariantPanel(props) {
  const wasDeletedBeforeRound = !props.isCurrent && props.priorVariantId === null;
  const wasShortenedBeforeRound = !props.isCurrent && props.priorVariantId && props.priorVariantId !== "full";
  const variants = wasDeletedBeforeRound
    ? []
    : wasShortenedBeforeRound
      ? props.card.variants.filter(function (variant) { return variant.id === props.priorVariantId; })
      : props.card.variants;
  const canSeal = props.currentReady && props.total <= props.capacity;
  const currentPledge = window.getPledgeState(props.card.id, props.selectedVariantId, props.directAnswers);
  return (
    <aside className="variant-panel">
      <div className="panel-heading">
        <span>{props.isCurrent ? "决定本年记述" : "整理旧记忆"}</span>
        <strong>{props.isCurrent ? "三种写法保留不同意义" : wasDeletedBeforeRound ? "这段记忆已在此前离开碑面" : wasShortenedBeforeRound ? "此前失去的细节不能恢复" : "封存前可以反复比较和改选"}</strong>
      </div>
      {props.storyRound === 1 && props.isCurrent ? (
        <div className="guide-banner"><span>三</span><p>比较三种版本的「保留」与「失去」，不要只看字数。</p></div>
      ) : null}
      <PledgeNotice pledge={currentPledge} compact />
      <div className="variant-scroll">
        {variants.map(function (variant) {
          const pledgeImpact = props.isCurrent ? window.getPledgeState(props.card.id, variant.id, props.directAnswers) : null;
          return (
            <button
              className={"variant-card " + (props.selectedVariantId === variant.id ? "selected" : "")}
              type="button"
              key={variant.id}
              onClick={function () { props.onChoose(variant.id); }}
            >
              <div><strong>{labelForVariant(variant.id)}</strong><em>{variant.cost} 字</em></div>
              <p>{variant.text}</p>
              <small>{window.variantHints[props.card.id + ":" + variant.id] || "保留当前版本的事实与作用。"}</small>
              {pledgeImpact ? <b className={"pledge-impact " + pledgeImpact.tone}>{pledgeImpact.state}：{pledgeImpact.detail}</b> : null}
            </button>
          );
        })}
        {!props.isCurrent ? (
          <button className={"variant-card delete " + (props.selectedVariantId === null ? "selected" : "")} type="button" onClick={function () { props.onChoose(null); }}>
            <div><strong>从碑上删去</strong><em>释放全部字数</em></div>
            <p>亲历者仍可能暂时记得。数年之后，这件事将退出公共记忆。</p>
            <small>删除后不能恢复。本次封存前可以撤销全部修改。</small>
          </button>
        ) : null}
        {!props.isCurrent && !wasDeletedBeforeRound && !wasShortenedBeforeRound ? <p className="switch-choice-note">本轮尚未封存。选择一种写法后，其他候选仍会保留在这里，可以随时改选。</p> : null}
      </div>
      <div className="variant-action">
        {props.total > props.capacity ? (
          <p className="overflow-message">千字碑超出 {props.total - props.capacity} 字。请从左侧选择标有「可整理」的旧记忆，压缩或删除后才能封存。</p>
        ) : props.currentReady ? (
          <p className="ready-message">{props.storyRound === 1 ? "第一回合无需修改旧记忆。确认后即可封存。" : "碑面尚有余量，可以封存；也可以继续整理旧事。"}</p>
        ) : <p>先为本年新事选择一种写法。</p>}
        <button className="primary-button" type="button" disabled={!canSeal} onClick={props.onSeal}>
          {props.storyRound === 1 && canSeal ? "四　封存第一段新记忆" : "封存本年"}
        </button>
      </div>
    </aside>
  );
}

function EditorScreen(props) {
  const card = findCard(props.memoryData, props.selectedId);
  const variantId = props.selections[props.selectedId];
  const variant = variantId ? findVariant(card, variantId) : null;
  const isCurrent = props.selectedId === props.story.id;
  const isDeleted = variantId === null && !isCurrent;
  const over = props.total > props.memoryData.capacity;
  const firstEditableId = props.visibleIds.find(function (id) { return id !== props.story.id && props.selections[id] !== null; });
  const firstEditableCard = firstEditableId ? findCard(props.memoryData, firstEditableId) : null;
  const pledge = window.getPledgeState(card.id, variantId, props.directAnswers);
  const acceptedPledges = ["E05", "E08", "E10", "E12"].map(function (id) {
    return window.getPledgeState(id, props.selections[id], props.directAnswers);
  }).filter(Boolean);
  return (
    <section className="screen editor-screen" data-screen-label={"回合" + props.story.round + "碑文编辑"}>
      <header className="editor-header">
        <div><span>千字碑</span><small>{props.story.year} · {props.story.title}</small></div>
        <Capacity total={props.total} capacity={props.memoryData.capacity} />
        <button className="text-button" type="button" onClick={props.onReset}>重新开始</button>
      </header>
      <OverflowBanner
        total={props.total}
        capacity={props.memoryData.capacity}
        target={firstEditableCard}
        onResolve={function () { if (firstEditableId) props.onSelect(firstEditableId); }}
      />
      {props.story.unknownUse ? (
        <section className="unknown-use-banner">
          <div>
            <span>最后整理·用途未知</span>
            <strong>只显示旧记忆曾经发挥过的作用，不提前标出下一回合会读取哪一项。</strong>
          </div>
          <div className="all-pledges-row">
            {acceptedPledges.length ? acceptedPledges.map(function (item, index) {
              return <PledgeNotice key={index} pledge={item} compact />;
            }) : <p>当前没有已经接下的红线托付。</p>}
          </div>
        </section>
      ) : null}
      <div className="editor-grid">
        <MemoryRail
          memoryData={props.memoryData}
          visibleIds={props.visibleIds}
          selections={props.selections}
          currentEventId={props.story.id}
          selectedId={props.selectedId}
          over={over}
          directAnswers={props.directAnswers}
          roundSnapshot={props.roundSnapshot}
          storyRound={props.story.round}
          onSelect={props.onSelect}
          onUndo={props.onUndo}
        />
        <StelePreview card={card} variant={variant} isCurrent={isCurrent} isDraft={isCurrent && !variantId} isDeleted={isDeleted} pledge={pledge} />
        <VariantPanel
          card={card}
          selectedVariantId={variantId}
          isCurrent={isCurrent}
          storyRound={props.story.round}
          currentReady={Boolean(props.selections[props.story.id])}
          total={props.total}
          capacity={props.memoryData.capacity}
          directAnswers={props.directAnswers}
          priorVariantId={Object.prototype.hasOwnProperty.call(props.roundSnapshot || {}, card.id) ? props.roundSnapshot[card.id] : undefined}
          onChoose={props.onChoose}
          onSeal={props.onSeal}
        />
      </div>
    </section>
  );
}

function ReactionScreen(props) {
  const story = props.story;
  const [step, setStep] = useState(0);
  const narrative = window.roundNarrativeV9[story.id];
  const pledge = window.getPledgeState(story.id, props.variantId, props.directAnswers);
  const stepLabels = ["碑片发生了什么", "当夜谁作出反应", "记忆回声"];
  return (
    <section className="screen reaction-screen" data-screen-label={"回合" + story.round + "封存反馈"}>
      <img className="full-bleed-image" src="assets/imagegen/06-封存因果图片原型.png" alt="" />
      <div className="dark-wash"></div>
      <article className="reaction-sheet">
        <nav className="reaction-steps" aria-label="封存反馈进度">
          {stepLabels.map(function (label, index) { return <button className={step === index ? "current" : step > index ? "read" : ""} type="button" key={label} onClick={function () { if (index <= step) setStep(index); }}><span>{index + 1}</span><strong>{label}</strong></button>; })}
        </nav>
        <div className="reaction-heading"><span>{step + 1}</span><div><small>{story.year}</small><h1>{stepLabels[step]}</h1></div></div>
        {step === 0 ? (
          <section className="slab-change-stage">
            <article><span>本年新刻</span><h2>{story.title}</h2><p>{labelForVariant(props.variantId)}</p></article>
            <article><span>旧碑处理</span><h2>{props.changes.length ? "更换或磨去 " + props.changes.length + " 块碑片" : "没有更换旧碑片"}</h2><p>{props.changes.length ? "失去的细节会在本次封存后退出公共记忆。" : "本年新事仍能在碑面余量内完整完成。"}</p></article>
            {props.changes.length ? <div className="slab-change-list">{props.changes.map(function (change) { return <p key={change.id}><strong>{change.title}</strong><span>{change.fromLabel} → {change.toLabel}</span><small>{change.note}</small></p>; })}</div> : null}
          </section>
        ) : null}
        {step === 1 ? (
          <section className="night-reaction-stage">
            <p>{narrative.sealSetting}</p>
            <blockquote>{story.reaction[props.variantId]}</blockquote>
          </section>
        ) : null}
        {step === 2 ? (
          <>
            <PledgeNotice pledge={pledge} />
            <section className="echo-card">
              <span>这次改写改变了什么</span>
              <h2>{props.echo.title}</h2>
              <div className="echo-fact-grid">
                <article><span>碑文保留</span><p>{props.echo.kept}</p></article>
                <article><span>碑文删去</span><p>{props.echo.lost}</p></article>
                <article><span>仍然记得</span><p>{props.echo.remembered}</p></article>
                <article><span>未来影响</span><p>{props.echo.future}</p></article>
              </div>
              <div className="echo-trace"><span>因果回溯</span><p>{props.echo.source}</p></div>
            </section>
          </>
        ) : null}
        <button className="paper-button reaction-next" type="button" onClick={function () {
          if (step < 2) setStep(step + 1);
          else props.onContinue();
        }}>
          {step === 0 ? "查看当夜反应" : step === 1 ? "查看记忆回声" : story.round === 15 ? "走进洪水后的村庄" : story.round === 5 || story.round === 10 ? "看看村庄这些年" : "走到下一年"}
        </button>
      </article>
    </section>
  );
}

function VillageInterludeScreen(props) {
  const interlude = window.interludesV9[props.afterRound];
  const [placeIndex, setPlaceIndex] = useState(0);
  const place = interlude.places[placeIndex];
  return (
    <section className="screen village-interlude-screen" data-screen-label={"第" + props.afterRound + "回合后的村庄"}>
      <img className="full-bleed-image" src={props.afterRound === 5 ? "assets/scenes/scene-06-council.png" : "assets/scenes/scene-11-refugees.png"} alt="" />
      <div className="interlude-shade"></div>
      <article className="interlude-sheet">
        <span className="eyebrow dark">{interlude.kicker}</span>
        <h1>{interlude.title}</h1>
        <p className="interlude-intro">{interlude.intro}</p>
        <nav className="interlude-tabs" aria-label="查看村庄地点">
          {interlude.places.map(function (item, index) { return <button className={placeIndex === index ? "selected" : ""} type="button" key={item.title} onClick={function () { setPlaceIndex(index); }}><span>{["一", "二", "三"][index]}</span><strong>{item.title}</strong></button>; })}
        </nav>
        <section className="interlude-place" aria-live="polite">
          <span>此刻的{place.title}</span>
          <p>{place.body}</p>
          <small>{place.source}</small>
        </section>
        <div className="interlude-actions">
          <button className="secondary-paper-button" type="button" disabled={placeIndex === 0} onClick={function () { setPlaceIndex(placeIndex - 1); }}>上一处</button>
          {placeIndex < interlude.places.length - 1
            ? <button className="paper-button" type="button" onClick={function () { setPlaceIndex(placeIndex + 1); }}>看下一处</button>
            : <button className="paper-button" type="button" onClick={props.onContinue}>走到下一年</button>}
        </div>
      </article>
    </section>
  );
}

function EpilogueWalkScreen(props) {
  const locations = window.createEpilogueLocationsV9(props.selections);
  const [placeIndex, setPlaceIndex] = useState(0);
  const [visited, setVisited] = useState([0]);
  const place = locations[placeIndex];
  function visit(index) {
    setPlaceIndex(index);
    setVisited(function (current) { return current.includes(index) ? current : current.concat([index]); });
  }
  return (
    <section className="screen epilogue-walk-screen" data-screen-label="洪水后的千字村">
      <img className="epilogue-village-image" src="assets/scene-16-post-flood-village.png" alt="洪水退去后正在修复的千字村" />
      <div className="epilogue-village-shade"></div>
      <header className="epilogue-walk-heading">
        <span>第十五回合之后 · 次日清晨</span>
        <h1>走过你留下的村庄</h1>
        <p>十五次选择已经变成此刻的桥、药圃、席位、住处和碑。先看完五处，再打开村志附录。</p>
      </header>
      <nav className="epilogue-hotspots" aria-label="灾后村庄五个地点">
        {locations.map(function (item, index) {
          return <button type="button" key={item.id} className={item.hotspot + " " + (placeIndex === index ? "selected " : "") + (visited.includes(index) ? "visited" : "")} onClick={function () { visit(index); }}><span>{item.number}</span><strong>{item.title}</strong></button>;
        })}
      </nav>
      <article className="epilogue-place-sheet" aria-live="polite">
        <span>{place.number} · {place.title}</span>
        <section><h2>当下发生了什么</h2><p>{place.now}</p></section>
        <section><h2>这来自哪一次改写</h2><p>{place.source}</p></section>
        <section><h2>一个具体的人现在怎样</h2><p>{place.person}</p></section>
      </article>
      <footer className="epilogue-walk-footer">
        <button type="button" disabled={placeIndex === 0} onClick={function () { visit(placeIndex - 1); }}>返回上一处</button>
        <span>已走过 <strong>{visited.length} / 5</strong> 处</span>
        {placeIndex < locations.length - 1
          ? <button type="button" onClick={function () { visit(placeIndex + 1); }}>前往下一处</button>
          : <button type="button" disabled={visited.length < locations.length} onClick={props.onAppendix}>{visited.length < locations.length ? "还需看完其余地点" : "打开村志附录"}</button>}
      </footer>
    </section>
  );
}

function createVillageSummary(selections) {
  const floodKnowledge = ["full", "warning"].includes(selections.E01) || ["full", "warning"].includes(selections.E11) || ["full", "order"].includes(selections.E14);
  const medicineKnowledge = ["full", "recipe"].includes(selections.E03) || ["full", "treatment"].includes(selections.E07);
  const rescueNamed = ["full", "hero"].includes(selections.E01);
  const qishengBelongs = selections.E02 === "villager" || selections.E10 === "useful_lie";
  const newcomersIncluded = ["full", "refuge"].includes(selections.E11) && selections.E12 !== "authority";
  const originTruth = ["full", "principle"].includes(selections.E05) || ["full", "one_name", "principle"].includes(selections.E08);
  const mythStrong = selections.E15 === "ancestor" || selections.E14 === "omen" || selections.E05 === "myth";
  return [
    {
      title: "生存知识",
      state: floodKnowledge && medicineKnowledge ? "预警与救治仍能彼此支撑" : floodKnowledge || medicineKnowledge ? "只留下一套可直接照做的方法" : "方法已经让位给人物与解释",
      detail: floodKnowledge ? "村庄仍能从退水、水痕或撤离命令中识别危险。" : "最终行动主要依赖活人经验与统一信仰。"
    },
    {
      title: "人物关系",
      state: rescueNamed && qishengBelongs && newcomersIncluded ? "旧日恩情、新村民与后来者都获公共承认" : rescueNamed || qishengBelongs || newcomersIncluded ? "部分关系获得了公共资格" : "许多关系仍只活在亲历者心里",
      detail: newcomersIncluded ? "北方来客既参与修堤，也被写入共同撤离的人群。" : "后来者的贡献容易在灾后再次被合成无名众人。"
    },
    {
      title: "村庄信仰",
      state: originTruth && mythStrong ? "接纳历史与先祖信仰互相拉扯" : originTruth ? "共同体建立在曾被接纳的事实之上" : mythStrong ? "先祖神话主导村庄解释" : "村庄承认公共记忆并不完整",
      detail: originTruth ? "后来者仍能读到先祖也曾是外来者。" : "祝婆的七颗河石只剩亲历者知道其来历。"
    }
  ];
}

function createFloodOutcomes(selections) {
  const earlyWarning = ["full", "warning"].includes(selections.E11) && ["full", "order"].includes(selections.E14);
  const supplies = ["full", "supplies"].includes(selections.M08) && selections.E13 !== "obey";
  const treatment = ["full", "treatment"].includes(selections.E07);
  const bridge = ["full", "method"].includes(selections.E04);
  const inclusive = ["full", "refuge"].includes(selections.E11) && selections.E12 !== "authority";
  return [
    {
      phase: "第一日·预警",
      state: earlyWarning ? "在第三水痕出现前开始撤离" : "直到钟声或水势迫近才统一行动",
      source: earlyWarning ? "来源：第 11 回合退水预警 + 第 14 回合撤离命令。" : "缺口：退水证据或明确撤离触发条件已经离开碑面。"
    },
    {
      phase: "第二日·撤离",
      state: supplies && treatment ? "粮水、病者顺序与药物都能被组织" : supplies || treatment ? "物资或病者照护只有一项完整" : "物资与病者照护都出现缺口",
      source: supplies ? "北坡物资规则仍在，且征粮没有掏空全部准备。" : "北坡物资细节或备洪粮出现缺口。"
    },
    {
      phase: "第三日·桥与救援",
      state: bridge ? "东桥工法为最后一批人争取了时间" : "桥上只能依靠现场经验临时加固",
      source: bridge ? "来源：第 4 回合保留了榫卯与抬高桥基。" : "缺口：造桥方法被共建叙事或后续整理压缩。"
    },
    {
      phase: "洪水后的共同体",
      state: inclusive ? "旧村民与北方来客共同出现在救援叙述中" : "来客参与了行动，却容易再次成为无名众人",
      source: inclusive ? "来源：难民安置仍在，且河岸裁决没有排除私人口述。" : "缺口：安置事实或异议资格已经失去公共依据。"
    }
  ];
}

function createEpilogues(selections) {
  return [
    ["小满", ["full", "treatment"].includes(selections.E07) ? "以独立医者与下一任守字人的身份接碑。" : "接下碑，也接下一份无法仅靠碑文补全的药方。"],
    ["阿禾", ["full", "hero"].includes(selections.E01) ? "仍被记得曾经返船救人，但拒绝成为洪水唯一的英雄。" : "再次下水救人；这一次，他的名字是否留下由最终碑文决定。"],
    ["柳木", ["full", "method"].includes(selections.E04) ? "用碑上的工法守住桥头，承认一座桥从来不只属于柳家。" : "靠多年手感加固桥梁，却无法把完整方法交给学徒。"],
    ["祁生", selections.E02 === "villager" || selections.E10 === "useful_lie" ? "以村民身份组织水工改道，不再需要先证明自己为何有资格发言。" : "依旧用水尺救村，却仍可能在灾后名册中被称为来客。"],
    ["祝婆", ["full", "one_name"].includes(selections.E08) ? "她没有看到洪水退去，但至少有一个真实姓名穿过了三十年。" : "她留下的七颗河石仍在小满手中，碑上却只剩原则或神话。"],
    ["北方来客", ["full", "refuge"].includes(selections.E11) ? "他们修过新堤，也在洪水中带孩子走上北坡。" : "他们参与了修堤与撤离，却难以从最终村志中找到自己的来历。"]
  ];
}

function SummaryScreen(props) {
  const [inheritance, setInheritance] = useState(null);
  const summaries = createVillageSummary(props.selections);
  const floodOutcomes = createFloodOutcomes(props.selections);
  const epilogues = createEpilogues(props.selections);
  const activeIds = Object.entries(props.selections).filter(function (entry) { return Boolean(entry[1]); }).map(function (entry) { return entry[0]; });
  const lostIds = Object.entries(props.selections).filter(function (entry) { return entry[1] === null; }).map(function (entry) { return entry[0]; });
  const pledges = ["E05", "E08", "E10", "E12"].map(function (id) {
    return { id: id, state: window.getPledgeState(id, props.selections[id], props.directAnswers) };
  }).filter(function (item) { return Boolean(item.state); });
  const inheritanceOptions = [
    ["sources", "碑应留下事实，也留下它曾被改写。", "小满把来源与删改痕迹写进下一任守字人的训诫。"],
    ["survival", "碑首先要让村庄知道怎样活下去。", "小满把能否在下一次灾难中被照做，作为整理碑文的第一标准。"],
    ["consensus", "碑留下的说法，终会成为后来者拥有的事实。", "小满接受公共记忆无法容纳全部过去，也更加警惕谁拥有定稿权。"]
  ];
  return (
    <section className="screen summary-screen" data-screen-label="村志附录">
      <div className="summary-hero">
        <img src="assets/scene-16-post-flood-village.png" alt="" />
        <div>
          <span className="eyebrow">村志附录 · 第三十年传碑之秋</span>
          <h1>把亲历过的村庄，重新摊开核对</h1>
          <p>这里不是主要结局，也不计算总分。它把刚才看见的村庄逐项回溯到仍在的碑文、已经离开的过去，以及守字人兑现或违背的托付。</p>
        </div>
      </div>
      <main className="summary-content">
        <section>
          <div className="summary-heading"><span>三日洪水因果</span><strong>不以胜负遮住每一项来源与缺口</strong></div>
          <div className="flood-outcome-grid">
            {floodOutcomes.map(function (item) {
              return <article key={item.phase}><span>{item.phase}</span><h2>{item.state}</h2><p>{item.source}</p></article>;
            })}
          </div>
        </section>
        <section>
          <div className="summary-heading"><span>此刻的村庄</span><strong>不评分，只呈现你留下的现实</strong></div>
          <div className="summary-state-grid">
            {summaries.map(function (item) {
              return <article key={item.title}><span>{item.title}</span><h2>{item.state}</h2><p>{item.detail}</p></article>;
            })}
          </div>
        </section>
        <section>
          <div className="summary-heading"><span>十五次记忆回声</span><strong>每一个后果都能回到一段具体碑文</strong></div>
          <div className="echo-timeline">
            {props.echoes.map(function (echo, index) {
              return <article key={index}><span>第 {index + 1} 回合</span><h3>{echo.title}</h3><p>{echo.later}</p><small>{echo.source}</small></article>;
            })}
          </div>
        </section>
        <section>
          <div className="summary-heading"><span>六个人的尾声</span><strong>同一场洪水，不会只产生一个英雄</strong></div>
          <div className="epilogue-grid">
            {epilogues.map(function (item) {
              return <article key={item[0]}><span>{item[0]}</span><p>{item[1]}</p></article>;
            })}
          </div>
        </section>
        {pledges.length ? (
          <section className="pledge-summary">
            <div className="summary-heading"><span>四次红线托付</span><strong>承诺不会阻止删改，但会留下是否兑现的结果</strong></div>
            <div className="pledge-summary-list">
              {pledges.map(function (item) { return <PledgeNotice key={item.id} pledge={item.state} />; })}
            </div>
          </section>
        ) : null}
        <section className="chronicle-section">
          <div className="summary-heading"><span>现存村志节选</span><strong>{props.total} / {props.memoryData.capacity} 字 · {activeIds.length} 段记忆</strong></div>
          <div className="chronicle-list">
            {activeIds.map(function (id) {
              const card = findCard(props.memoryData, id);
              const variant = findVariant(card, props.selections[id]);
              return <article key={id}><span>{card.title}</span><p>{variant.text}</p><small>{labelForVariant(variant.id)} · {variant.cost} 字</small></article>;
            })}
          </div>
        </section>
        <section className="outside-section">
          <div className="summary-heading"><span>碑外残响</span><strong>只有守字人知道它们曾经存在</strong></div>
          {props.history.length ? (
            <div className="history-list">
              {props.history.map(function (change, index) {
                return <article key={index}><span>第 {change.round} 回合</span><strong>{change.title}</strong><p>{change.fromLabel} → {change.toLabel}<small>{change.note || "这一改写永久舍弃了部分细节。"}</small></p></article>;
              })}
            </div>
          ) : <p className="empty-history">你没有改写旧记忆，但完整记录正在迅速占满石面。后续回合将无法继续回避取舍。</p>}
          {lostIds.length ? <p className="lost-note">已有 {lostIds.length} 段往事完全离开碑面。亲历者仍可能记得，但后来者将无法从村志中找到它们。</p> : null}
        </section>
        <section className="inheritance-section">
          <div className="summary-heading"><span>把碑交给小满</span><strong>这不会改变已经发生的洪水，只决定下一任守字人如何理解职责</strong></div>
          <div className="inheritance-options">
            {inheritanceOptions.map(function (item) {
              return <button className={inheritance === item[0] ? "selected" : ""} key={item[0]} type="button" onClick={function () { setInheritance(item[0]); }}><strong>{item[1]}</strong><span>{item[2]}</span></button>;
            })}
          </div>
          {inheritance ? <p className="inheritance-result">小满接过红线与刻字簿。她不会继承一个答案；她继承的是你让哪些答案仍有资格被问起。</p> : <p className="inheritance-waiting">请选择一句留给下一任守字人的话。</p>}
        </section>
        <div className="summary-actions">
          <button className="primary-button large" type="button" onClick={props.onReplay}>用另一种记忆重玩</button>
          <button className="secondary-button large" type="button" onClick={props.onHome}>返回标题页</button>
        </div>
      </main>
    </section>
  );
}

function App() {
  const initialStored = useMemo(readStoredGame, []);
  const [memoryData, setMemoryData] = useState(null);
  const [hasSave, setHasSave] = useState(Boolean(initialStored));
  const [game, setGame] = useState({
    view: "title",
    prologueStep: 0,
    overviewStep: 0,
    oldSelectedId: "M00",
    roundIndex: 0,
    selections: {},
    directAnswers: {},
    selectedId: "E01",
    history: [],
    echoes: [],
    roundSnapshot: null,
    lastRoundChanges: []
  });

  useEffect(function () {
    fetch("data/memory-cards.json")
      .then(function (response) { return response.json(); })
      .then(function (data) { setMemoryData(data); })
      .catch(function () {
        document.getElementById("root").innerHTML = "<p class='fatal-message'>记忆卡读取失败。请通过本地网页服务打开原型。</p>";
      });
  }, []);

  useEffect(function () {
    if (!memoryData || game.view === "title" || game.view === "duty") return;
    localStorage.setItem(storageKey, JSON.stringify(game));
    setHasSave(true);
  }, [memoryData, game]);

  useEffect(function () {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [game.view, game.roundIndex, game.prologueStep, game.overviewStep]);

  function goHome() {
    setGame(function (current) { return Object.assign({}, current, { view: "title" }); });
  }

  function startNew() {
    if (!memoryData) return;
    const fresh = createFreshGame(memoryData);
    localStorage.setItem(storageKey, JSON.stringify(fresh));
    setHasSave(true);
    setGame(fresh);
  }

  function continueStored() {
    const stored = readStoredGame();
    if (stored) {
      const restored = Object.assign({}, stored);
      if (restored.view === "editor" && !restored.roundSnapshot) {
        restored.roundSnapshot = Object.assign({}, restored.selections);
      }
      setGame(restored);
    }
  }

  function resetGame() {
    if (!memoryData) return;
    if (window.confirm("重新开始会清除当前这篇村志。确定要从序章开始吗？")) {
      startNew();
    }
  }

  if (!memoryData) {
    return <div className="loading-screen" data-screen-label="载入中"><span>千字村</span><p>正在展开旧碑……</p></div>;
  }

  if (game.view === "title") {
    return <TitleScreen hasSave={hasSave} onNew={startNew} onContinue={continueStored} onDuty={function () { setGame(function (current) { return Object.assign({}, current, { view: "duty" }); }); }} />;
  }

  if (game.view === "duty") {
    return <DutyScreen onBack={goHome} />;
  }

  if (game.view === "prologue") {
    return <PrologueScreen step={game.prologueStep} onBack={function () {
      if (game.prologueStep > 0) {
        setGame(function (current) { return Object.assign({}, current, { prologueStep: current.prologueStep - 1 }); });
      } else {
        setGame(function (current) { return Object.assign({}, current, { view: "title" }); });
      }
    }} onNext={function () {
      if (game.prologueStep < 3) {
        setGame(function (current) { return Object.assign({}, current, { prologueStep: current.prologueStep + 1 }); });
      } else {
        setGame(function (current) { return Object.assign({}, current, { view: "oldStele" }); });
      }
    }} />;
  }

  if (game.view === "oldStele") {
    return (
      <OldSteleScreen
        memoryData={memoryData}
        selectedId={game.oldSelectedId}
        onSelect={function (id) { setGame(function (current) { return Object.assign({}, current, { oldSelectedId: id }); }); }}
        onContinue={function () { setGame(function (current) { return Object.assign({}, current, { view: "overview", overviewStep: 0 }); }); }}
        onHome={goHome}
        onReset={resetGame}
      />
    );
  }

  if (game.view === "overview") {
    return (
      <OverviewScreen
        step={game.overviewStep}
        onNext={function () {
          if (game.overviewStep < 2) {
            setGame(function (current) { return Object.assign({}, current, { overviewStep: current.overviewStep + 1 }); });
          } else {
            setGame(function (current) { return Object.assign({}, current, { view: "opening" }); });
          }
        }}
        onHome={goHome}
        onReset={resetGame}
      />
    );
  }

  const story = window.roundStories[game.roundIndex];
  const visibleIds = getVisibleIds(memoryData, game.roundIndex);
  const total = calculateTotal(memoryData, game.selections);

  if (game.view === "opening") {
    return (
      <RoundOpeningScreen
        key={story.id}
        story={story}
        backLabel={game.roundIndex === 0 ? "返回玩法说明" : "返回标题页"}
        onBack={game.roundIndex === 0 ? function () { setGame(function (current) { return Object.assign({}, current, { view: "overview", overviewStep: 2 }); }); } : goHome}
        onContinue={function () { setGame(function (current) { return Object.assign({}, current, { view: "event" }); }); }}
        onHome={goHome}
        onReset={resetGame}
      />
    );
  }

  if (game.view === "event") {
    return (
      <EventScreen
        story={story}
        memoryData={memoryData}
        selections={game.selections}
        directAnswers={game.directAnswers}
        roundSnapshot={game.roundSnapshot}
        directValue={game.directAnswers[story.id]}
        onDirectChange={function (promptId, value) {
          setGame(function (current) {
            const storedValue = story.prompts
              ? Object.assign({}, current.directAnswers[story.id] || {}, { [promptId]: value })
              : value;
            return Object.assign({}, current, { directAnswers: Object.assign({}, current.directAnswers, { [story.id]: storedValue }) });
          });
        }}
        onEnterEditor={function () {
          setGame(function (current) {
            const nextSelections = Object.assign({}, current.selections);
            if (!(story.id in nextSelections)) nextSelections[story.id] = null;
            return Object.assign({}, current, {
              view: "editor",
              selections: nextSelections,
              selectedId: story.id,
              roundSnapshot: Object.assign({}, nextSelections)
            });
          });
        }}
        onHome={goHome}
        onReset={resetGame}
      />
    );
  }

  if (game.view === "editor") {
    return (
      <EditorScreen
        memoryData={memoryData}
        story={story}
        visibleIds={visibleIds}
        selections={game.selections}
        total={total}
        selectedId={game.selectedId}
        directAnswers={game.directAnswers}
        roundSnapshot={game.roundSnapshot}
        onSelect={function (id) { setGame(function (current) { return Object.assign({}, current, { selectedId: id }); }); }}
        onChoose={function (variantId) {
          setGame(function (current) {
            return Object.assign({}, current, { selections: Object.assign({}, current.selections, { [current.selectedId]: variantId }) });
          });
        }}
        onUndo={function () {
          if (!game.roundSnapshot) return;
          setGame(function (current) {
            return Object.assign({}, current, { selections: Object.assign({}, current.roundSnapshot), selectedId: story.id });
          });
        }}
        onSeal={function () {
          const variantId = game.selections[story.id];
          if (!variantId || total > memoryData.capacity) return;
          const snapshot = game.roundSnapshot || {};
          const changes = visibleIds.filter(function (id) { return id !== story.id && snapshot[id] !== game.selections[id]; }).map(function (id) {
            const card = findCard(memoryData, id);
            return {
              id: id,
              title: card.title,
              round: story.round,
              fromLabel: labelForVariant(snapshot[id]),
              toLabel: labelForVariant(game.selections[id]),
              note: game.selections[id]
                ? window.variantHints[id + ":" + game.selections[id]] || "这一改写永久舍弃了部分细节。"
                : "整段文字离开公共记忆，亲历者离去后将无人能从碑上找回。"
            };
          });
          const echo = window.buildMemoryEcho(story.id, variantId, game.selections, game.directAnswers);
          setGame(function (current) {
            return Object.assign({}, current, {
              view: "reaction",
              history: current.history.concat(changes),
              echoes: current.echoes.concat([echo]),
              lastRoundChanges: changes,
              roundSnapshot: null
            });
          });
        }}
        onReset={resetGame}
      />
    );
  }

  if (game.view === "reaction") {
    const variantId = game.selections[story.id];
    const echo = game.echoes[game.echoes.length - 1];
    return (
      <ReactionScreen
        story={story}
        variantId={variantId}
        echo={echo}
        changes={game.lastRoundChanges}
        directAnswers={game.directAnswers}
        onContinue={function () {
          if (story.round === 15) {
            setGame(function (current) { return Object.assign({}, current, { view: "epilogue" }); });
          } else if (story.round === 5 || story.round === 10) {
            setGame(function (current) { return Object.assign({}, current, { view: "interlude" }); });
          } else {
            const nextRoundIndex = game.roundIndex + 1;
            setGame(function (current) {
              return Object.assign({}, current, {
                view: "opening",
                roundIndex: nextRoundIndex,
                selectedId: window.roundStories[nextRoundIndex].id,
                lastRoundChanges: []
              });
            });
          }
        }}
      />
    );
  }

  if (game.view === "interlude") {
    return (
      <VillageInterludeScreen
        key={story.round}
        afterRound={story.round}
        selections={game.selections}
        onContinue={function () {
          const nextRoundIndex = game.roundIndex + 1;
          setGame(function (current) {
            return Object.assign({}, current, {
              view: "opening",
              roundIndex: nextRoundIndex,
              selectedId: window.roundStories[nextRoundIndex].id,
              lastRoundChanges: []
            });
          });
        }}
      />
    );
  }

  if (game.view === "epilogue") {
    return <EpilogueWalkScreen selections={game.selections} onAppendix={function () { setGame(function (current) { return Object.assign({}, current, { view: "summary" }); }); }} />;
  }

  if (game.view === "summary") {
    return (
      <SummaryScreen
        memoryData={memoryData}
        selections={game.selections}
        total={total}
        echoes={game.echoes}
        history={game.history}
        directAnswers={game.directAnswers}
        onReplay={startNew}
        onHome={goHome}
      />
    );
  }

  return <div className="fatal-message">原型状态无法识别，请重新开始。</div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
