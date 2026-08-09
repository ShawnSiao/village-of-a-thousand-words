const { useEffect, useMemo, useState } = React;

const storageKey = "千字村入口体验原型三存档";

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
        <small>入口体验原型三</small>
      </button>
      <div className="header-progress">
        {props.round ? <span>当前：第 {props.round} / 5 回合</span> : <span>完整篇章：15 回合</span>}
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
        <p className="title-intro">
          一座村庄共享着一份只能容纳一千字的公共记忆。每一次新生、灾难、友情与流言，都会迫使另一段往事被压缩、改写或遗忘。守字人决定留下哪一种说法，村庄则按照留下的文字继续生活。
        </p>
        <div className="title-actions">
          <button className="primary-button large" type="button" onClick={props.onNew}>开始新村志</button>
          <button className="secondary-button large" type="button" disabled={!props.hasSave} onClick={props.onContinue}>
            {props.hasSave ? "继续旧村志" : "暂无旧村志"}
          </button>
          <button className="link-button" type="button" onClick={props.onDuty}>了解守字人的职责</button>
        </div>
        <div className="scope-note">
          <strong>完整 MVP：15 回合 · 单局 20～40 分钟</strong>
          <span>本次原型开放前 5 回合，用于验证规则理解、记忆取舍、红线托付和因果回溯。</span>
        </div>
      </div>
      <div className="title-quote">「你不能命令村庄。你只能决定，它还记得什么。」</div>
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
      <img className="full-bleed-image" src="assets/imagegen/03-碑片结构图片原型.png" alt="" />
      <div className="dark-wash"></div>
      <article className="duty-sheet">
        <span className="eyebrow dark">开始之前</span>
        <h1>决定文字的人，不是雕刻文字的人</h1>
        <p className="lead">守字人没有命令村民的权力。职责是决定哪一种过去能够继续成为全村的共同事实，再由刻字匠把定稿刻进碑片。</p>
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
    body: "雨停后的清晨，祠堂里只剩一张空椅、未干的墨和一把旧刻刀。旧守字人把红线留在椅背上，另一端系着一枚尚未定稿的碑片。",
    note: "红线代表一项具体托付。它不会阻止删改，却会记住守字人答应过什么。"
  },
  {
    kicker: "序章·两种职责",
    title: "守字人决定，刻字匠动手",
    image: "assets/imagegen/02-序章职责图片原型.png",
    body: "守字人听取证词、定稿碑文；刻字匠只按照定稿雕刻和更换碑片。亲历者不会因为一句话被删就立刻失忆，但当他们老去，后来者只能从碑上继承仍然存在的版本。",
    note: "守字人改变的不是昨天，而是昨天还能怎样抵达明天。"
  },
  {
    kicker: "序章·碑片更替",
    title: "整座碑不动，\n旧文字仍会离开",
    image: "assets/imagegen/03-碑片结构图片原型.png",
    structureSteps: [
      ["决定碑文", "守字人完成本年定稿。"],
      ["雕刻碑片", "刻字匠把定稿刻在新碑片上。"],
      ["更换旧片", "压缩或改写时，只替换受影响的碑片。"],
      ["磨去旧文", "被删除的旧片会磨平，用于修补碑座，不再公开保存。"]
    ],
    quote: "碑身保存村庄的形状，碑片决定村庄还能读到什么。"
  },
  {
    kicker: "序章·四条规则",
    title: "刻下第一句话以前",
    image: "assets/imagegen/02-序章职责图片原型.png",
    rules: [
      "千字碑只能容纳一千字。",
      "私人记忆会消逝，碑文负责把公共说法传给后来者。",
      "新事件可以完整保留，也可以压缩成意义不同的短版本。",
      "一旦封存，被删去的细节不能恢复。"
    ],
    quote: "碑不裁断真假。碑只让留下的说法继续活下去。"
  }
];

function PrologueScreen(props) {
  const page = prologuePages[props.step];
  return (
    <section className="screen prologue-screen" data-screen-label={"序章第" + (props.step + 1) + "页"}>
      <img className="full-bleed-image" src={page.image} alt="" />
      <div className={"prologue-copy " + (page.structureSteps ? "structure-copy" : "")}>
        <span className="eyebrow dark">{page.kicker}</span>
        <h1>{page.title}</h1>
        {page.body ? <p className="prologue-body">{page.body}</p> : null}
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
          <span>{props.step + 1} / 4</span>
          <button className="paper-button" type="button" onClick={props.onNext}>
            {props.step === 3 ? "走到千字碑前" : "继续"}
          </button>
        </div>
      </div>
    </section>
  );
}

function OldSteleScreen(props) {
  const selectedCard = findCard(props.memoryData, props.selectedId);
  const selectedVariant = findVariant(selectedCard, selectedCard.initialVariant);
  const meta = window.oldMemoryMeta[selectedCard.id];
  return (
    <section className="screen old-stele-screen" data-screen-label="阅读旧碑">
      <AppHeader onHome={props.onHome} onReset={props.onReset} />
      <div className="old-stele-backdrop">
        <img src="assets/imagegen/04-旧碑阅读图片原型.png" alt="" />
      </div>
      <div className="old-stele-content">
        <aside className="old-memory-list">
          <div className="panel-heading">
            <span>交到你手中的过去</span>
            <strong>10 段旧记忆 · {props.memoryData.initialCost} / {props.memoryData.capacity} 字</strong>
          </div>
          <div className="old-memory-scroll">
            {props.memoryData.initialCards.map(function (id) {
              const card = findCard(props.memoryData, id);
              const variant = findVariant(card, card.initialVariant);
              const itemMeta = window.oldMemoryMeta[id];
              return (
                <button
                  className={"old-memory-item " + (props.selectedId === id ? "selected" : "")}
                  type="button"
                  key={id}
                  onClick={function () { props.onSelect(id); }}
                >
                  <span><strong>{card.title}</strong><small>{itemMeta.year}</small></span>
                  <em>{variant.cost} 字</em>
                </button>
              );
            })}
          </div>
        </aside>
        <main className="old-stele-center">
          <div className="stele-capacity">
            <span>旧碑已用</span>
            <strong>{props.memoryData.initialCost} / {props.memoryData.capacity} 字</strong>
            <div><i style={{ width: (props.memoryData.initialCost / props.memoryData.capacity * 100) + "%" }}></i></div>
          </div>
          <article className="stele-readback">
            <span>当前选中的碑片</span>
            <h2>{selectedCard.title}</h2>
            <p>{selectedVariant.text}</p>
          </article>
          <div className="read-only-mark"><span>只读</span><p>现在只能阅读，不能修改。先看清哪些往事已经占据碑面。</p></div>
        </main>
        <article className="old-memory-detail">
          <span className="eyebrow dark">{meta.year} · 旧碑文</span>
          <h1>{selectedCard.title}</h1>
          <div className="old-memory-meta">
            <span>相关人物：{meta.relates}</span>
            <span>可能用途：{meta.use}</span>
            <span>当前占用：{selectedVariant.cost} 字</span>
          </div>
          <p>{selectedVariant.text}</p>
          <div className="old-memory-warning">几年后，你可能必须决定：留下这段完整往事，还是只保留其中一种作用。</div>
          <button className="paper-button" type="button" onClick={props.onContinue}>我已读过碑文</button>
        </article>
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
            src={props.step === 0 ? "assets/reference/核心玩法全景.png" : props.step === 1 ? "assets/imagegen/03-碑片结构图片原型.png" : "assets/imagegen/05-超限与红线图片原型.png"}
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

function EventScreen(props) {
  const story = props.story;
  const needsAnswer = Boolean(story.prompt);
  return (
    <section className="screen event-screen" data-screen-label={"回合" + story.round + "事件"}>
      <AppHeader round={story.round} onHome={props.onHome} onReset={props.onReset} />
      <div className="event-grid">
        <div className="event-visual">
          <img src={story.image} alt={story.title + "场景"} />
          <div className="event-title-block">
            <span>{story.year}</span>
            <h1>{story.title}</h1>
            <p>{story.summary}</p>
          </div>
          {story.round === 1 ? <div className="tutorial-pin"><span>一</span><p>先读事件，弄清发生了什么。</p></div> : null}
        </div>
        <aside className="testimony-panel">
          <div className="panel-heading">
            <span>亲历者证词</span>
            <strong>{story.question}</strong>
          </div>
          <div className="testimony-list">
            {story.testimony.map(function (item, index) {
              return (
                <article className="testimony-card" key={item.name}>
                  <span className="speaker-seal">{item.name.slice(0, 1)}</span>
                  <div><h2>{item.name}<small>{item.role}</small></h2><p>{item.text}</p></div>
                  {story.round === 1 && index === 0 ? <i className="tutorial-label">二　比较他们想留下什么</i> : null}
                </article>
              );
            })}
          </div>
          <DirectPrompt
            prompt={story.prompt}
            value={props.directValue}
            onChange={props.onDirectChange}
          />
          <div className="event-action">
            {needsAnswer && !props.directValue ? <p>先回应这位村民，才能继续整理碑文。</p> : <p>证词不会自动成为公共记忆。下一步由你决定碑上的版本。</p>}
            <button className="primary-button" type="button" disabled={needsAnswer && !props.directValue} onClick={props.onEnterEditor}>
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
  return (
    <aside className="memory-rail">
      <div className="panel-heading"><span>碑上记忆</span><strong>{props.over ? "从标有「可整理」的旧记忆中选择" : "选择一段查看或整理"}</strong></div>
      <div className="memory-rail-scroll">
        {props.visibleIds.map(function (id) {
          const card = findCard(props.memoryData, id);
          const variantId = props.selections[id];
          const variant = variantId ? findVariant(card, variantId) : null;
          const isCurrent = id === props.currentEventId;
          const deleted = variantId === null && !isCurrent;
          const editable = !isCurrent && !deleted;
          const pledge = window.getPledgeState(id, variantId, props.directAnswers);
          return (
            <button
              className={"memory-rail-item " + (props.selectedId === id ? "selected " : "") + (isCurrent ? "current " : "") + (deleted ? "deleted " : "") + (props.over && editable ? "editable-over " : "") + (pledge ? "entrusted" : "")}
              type="button"
              key={id}
              onClick={function () { props.onSelect(id); }}
            >
              <span><strong>{card.title}</strong><small>{deleted ? "本轮拟删除" : variantId ? labelForVariant(variantId) : "本年未定稿"}</small></span>
              <em>{variant ? variant.cost + " 字" : deleted ? "0 字" : "待定"}</em>
              {pledge ? <b className={"pledge-chip " + pledge.tone}>红线托付 · {pledge.state}</b> : props.over && editable ? <b className="editable-chip">可整理</b> : null}
            </button>
          );
        })}
      </div>
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
  const isShortened = !props.isCurrent && props.selectedVariantId && props.selectedVariantId !== "full";
  const variants = isShortened
    ? props.card.variants.filter(function (variant) { return variant.id === props.selectedVariantId; })
    : props.card.variants;
  const canSeal = props.currentReady && props.total <= props.capacity;
  const currentPledge = window.getPledgeState(props.card.id, props.selectedVariantId, props.directAnswers);
  return (
    <aside className="variant-panel">
      <div className="panel-heading">
        <span>{props.isCurrent ? "决定本年记述" : "整理旧记忆"}</span>
        <strong>{props.isCurrent ? "三种写法保留不同意义" : "被压缩的细节以后不能恢复"}</strong>
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
      <div className="editor-grid">
        <MemoryRail
          memoryData={props.memoryData}
          visibleIds={props.visibleIds}
          selections={props.selections}
          currentEventId={props.story.id}
          selectedId={props.selectedId}
          over={over}
          directAnswers={props.directAnswers}
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
          onChoose={props.onChoose}
          onSeal={props.onSeal}
        />
      </div>
    </section>
  );
}

function ReactionScreen(props) {
  const story = props.story;
  const pledge = window.getPledgeState(story.id, props.variantId, props.directAnswers);
  return (
    <section className="screen reaction-screen" data-screen-label={"回合" + story.round + "封存反馈"}>
      <img className="full-bleed-image" src="assets/imagegen/06-封存因果图片原型.png" alt="" />
      <div className="dark-wash"></div>
      <article className="reaction-sheet">
        <div className="reaction-heading"><span>封</span><div><small>{story.year}</small><h1>碑片已经更换</h1></div></div>
        <p className="reaction-version">{story.title} · {labelForVariant(props.variantId)}</p>
        <p className="reaction-copy">{story.reaction[props.variantId]}</p>
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
        {props.changes.length ? (
          <details className="change-details" open>
            <summary>查看本轮改写的旧记忆（{props.changes.length} 段）</summary>
            {props.changes.map(function (change) {
              return <p key={change.id}><strong>{change.title}</strong><span>{change.fromLabel} → {change.toLabel}<small>{change.note}</small></span></p>;
            })}
          </details>
        ) : <p className="no-change-note">本轮没有改写旧记忆。</p>}
        <button className="paper-button" type="button" onClick={props.onContinue}>
          {story.round === 5 ? "查看前五回合总结" : "让岁月继续"}
        </button>
      </article>
    </section>
  );
}

function createVillageSummary(selections) {
  const floodKnowledge = ["full", "warning"].includes(selections.E01) || ["full", "warning"].includes(selections.M01);
  const medicineKnowledge = ["full", "recipe"].includes(selections.E03) || ["full", "dose"].includes(selections.M03);
  const rescueNamed = ["full", "hero"].includes(selections.E01);
  const qishengBelongs = selections.E02 === "villager";
  const originTruth = ["full", "principle"].includes(selections.E05);
  const mythStrong = selections.E05 === "myth" || ["full", "myth"].includes(selections.M00);
  return [
    {
      title: "生存知识",
      state: floodKnowledge && medicineKnowledge ? "两套关键方法仍可传承" : floodKnowledge || medicineKnowledge ? "只留下了一套可直接照做的方法" : "方法逐渐让位给人物与解释",
      detail: floodKnowledge ? "村庄仍知道如何识别洪水征兆。" : "第三道水痕或撤离依据已经模糊。"
    },
    {
      title: "人物关系",
      state: rescueNamed && qishengBelongs ? "救命之恩与新村民都被公共承认" : rescueNamed || qishengBelongs ? "一段关系获得了公共身份" : "许多关系仍只活在亲历者心里",
      detail: rescueNamed ? "柳木无法从碑上否认阿禾曾救过他。" : "阿禾与柳木的救援关系没有进入公共记忆。"
    },
    {
      title: "村庄信仰",
      state: originTruth && mythStrong ? "两种互相冲突的起源同时存在" : originTruth ? "接纳外来者开始成为公共原则" : mythStrong ? "先祖神话仍主导村庄解释" : "共同信仰正在失去清晰形状",
      detail: originTruth ? "先祖也曾是外来者仍能被后来者读到。" : "祝婆的旧歌没有留下可供追问的事实。"
    }
  ];
}

function SummaryScreen(props) {
  const summaries = createVillageSummary(props.selections);
  const activeIds = Object.entries(props.selections).filter(function (entry) { return Boolean(entry[1]); }).map(function (entry) { return entry[0]; });
  const lostIds = Object.entries(props.selections).filter(function (entry) { return entry[1] === null; }).map(function (entry) { return entry[0]; });
  const pledge = window.getPledgeState("E05", props.selections.E05, props.directAnswers);
  return (
    <section className="screen summary-screen" data-screen-label="前五回合总结">
      <div className="summary-hero">
        <img src="assets/scenes/scene-05-song.png" alt="" />
        <div>
          <span className="eyebrow">第七年·前五回合验证结束</span>
          <h1>村庄已经开始成为碑文的样子</h1>
          <p>这不是结局。完整最小可行版本共有 15 回合；接下来的十回合将让这些文字参与选举、疾病、身份审判与最终洪水。</p>
        </div>
      </div>
      <main className="summary-content">
        <section>
          <div className="summary-heading"><span>此刻的村庄</span><strong>不评分，只呈现你留下的现实</strong></div>
          <div className="summary-state-grid">
            {summaries.map(function (item) {
              return <article key={item.title}><span>{item.title}</span><h2>{item.state}</h2><p>{item.detail}</p></article>;
            })}
          </div>
        </section>
        <section>
          <div className="summary-heading"><span>五次记忆回声</span><strong>每一个后果都能回到一段具体碑文</strong></div>
          <div className="echo-timeline">
            {props.echoes.map(function (echo, index) {
              return <article key={index}><span>第 {index + 1} 回合</span><h3>{echo.title}</h3><p>{echo.later}</p><small>{echo.source}</small></article>;
            })}
          </div>
        </section>
        {pledge ? (
          <section className="pledge-summary">
            <div className="summary-heading"><span>红线托付</span><strong>承诺不会阻止删改，但会留下是否兑现的结果</strong></div>
            <PledgeNotice pledge={pledge} />
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
    return <PrologueScreen step={game.prologueStep} onNext={function () {
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
            setGame(function (current) { return Object.assign({}, current, { view: "event" }); });
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

  if (game.view === "event") {
    return (
      <EventScreen
        story={story}
        directValue={game.directAnswers[story.id]}
        onDirectChange={function (value) {
          setGame(function (current) {
            return Object.assign({}, current, { directAnswers: Object.assign({}, current.directAnswers, { [story.id]: value }) });
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
          if (story.round === 5) {
            setGame(function (current) { return Object.assign({}, current, { view: "summary" }); });
          } else {
            const nextRoundIndex = game.roundIndex + 1;
            setGame(function (current) {
              return Object.assign({}, current, {
                view: "event",
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
