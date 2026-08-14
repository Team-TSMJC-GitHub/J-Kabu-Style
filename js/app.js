import { MAIN_QUESTIONS, SCALE, SECTOR_QUESTIONS, TYPES, TOTAL_STEPS } from "./data.js";
import { computeAxisPercents, computeTypeCode, computeDNA, computeSectorTop } from "./score.js";
import { renderRadarSVG } from "./radar.js";

const root = document.getElementById("app");

const state = {
  view: "home", // home | main | sector | result | typeDetail
  mainIndex: 0,
  sectorIndex: 0,
  mainAnswers: {},
  sectorCounts: {},
  typeCode: null, // 詳細ページで表示中のタイプコード
};

function esc(s) {
  if (s === undefined || s === null) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ------------------------------ navigation ------------------------------- */

function goHome() {
  location.hash = "";
}

function goToType(code) {
  location.hash = `#/types/${code}`;
}

function startQuiz() {
  state.view = "main";
  state.mainIndex = 0;
  state.sectorIndex = 0;
  state.mainAnswers = {};
  state.sectorCounts = {};
  if (location.hash) location.hash = ""; // URLを整えるだけで、hashchangeでの二重描画は起きない設計
  render();
}

/* ---------------------------- progress bar ---------------------------- */

function progressBarHTML(current, total) {
  const pct = Math.round((current / total) * 100);
  return `
    <div class="progress">
      <div class="progress__row">
        <span class="mono accent">質問 ${current} / ${total}</span>
        <span class="mono muted">${pct}%</span>
      </div>
      <div class="progress__track"><div class="progress__fill" style="width:${pct}%"></div></div>
    </div>`;
}

/* --------------------------- type image / card --------------------------- */

// 画像プレースホルダー。/images/types/{CODE}.webp が配置されれば自動でそちらが表示される。
function typeImageHTML(code, type, { big = false } = {}) {
  const sizeClass = big ? "type-image--big" : "";
  return `
    <div class="type-image ${sizeClass}" style="--type-color:${type.color}">
      <div class="type-image__placeholder">
        <span class="type-image__emoji">${type.emoji}</span>
        <span class="mono type-image__ph-label">CHARACTER PLACEHOLDER</span>
        <span class="mono type-image__ph-code">${code}</span>
      </div>
      <img
        src="${esc(type.image)}"
        alt="${esc(type.jp)}のキャラクター画像"
        loading="lazy"
        onerror="this.remove()"
      />
    </div>`;
}

function typeCardHTML(code, type) {
  return `
    <button class="type-card" data-code="${code}" style="--type-color:${type.color}">
      ${typeImageHTML(code, type)}
      <div class="type-card__body">
        <div class="type-card__title-row">
          <span class="type-card__emoji">${type.emoji}</span>
          <div>
            <p class="type-card__jp">${esc(type.jp)}</p>
            <p class="mono type-card__en">${esc(type.en)}</p>
          </div>
        </div>
        <p class="mono type-card__code">${code}</p>
        <p class="type-card__catch">${esc(type.catchphrase)}</p>
        <p class="type-card__link mono">詳細を見る →</p>
      </div>
    </button>`;
}

function bindTypeCards() {
  root.querySelectorAll(".type-card").forEach((el) => {
    el.addEventListener("click", () => goToType(el.dataset.code));
  });
}

/* -------------------------------- home ---------------------------------- */

function renderHome() {
  const cards = Object.entries(TYPES).map(([code, t]) => typeCardHTML(code, t)).join("");

  root.innerHTML = `
    <div class="screen screen--wide screen--home">
      <div class="home-hero">
        <div class="eyebrow mono">
          <span class="rule"></span>J-STOCK PERSONALITY DIAGNOSIS<span class="rule"></span>
        </div>
        <h1 class="display">株<span class="accent-text">TYPE</span></h1>
        <p class="mono sub">J-KABU TYPE</p>
        <p class="display concept">あなたは、どんな日本株投資家？</p>
        <p class="lead">性格・価値観・行動から、あなたに合った日本株投資スタイルを診断します。</p>
        <button id="start-btn" class="btn btn--primary">3分で診断する <span class="chev">›</span></button>
        <p class="mono meta">30 QUESTIONS · 16 TYPES</p>
      </div>

      <section class="type-gallery">
        <p class="mono accent center label label--lg">16 TYPES</p>
        <h2 class="display center gallery-heading">日本株投資家には、16のタイプがある。</h2>
        <p class="lead center gallery-sub">気になるタイプをタップすると、詳しいプロフィールを見ることができます。</p>
        <div class="type-grid">${cards}</div>
      </section>

      <section class="cta-block">
        <h2 class="display cta-title">あなたは、どのタイプ？</h2>
        <button id="cta-diagnose-btn" class="btn btn--primary">自分の投資家タイプを診断してみる <span class="chev">›</span></button>
      </section>

      <div class="home-footer">
        <p class="lead center">投資に正解はない。<br />自分に合った投資を見つけよう。</p>
      </div>
    </div>`;

  document.getElementById("start-btn").addEventListener("click", startQuiz);
  document.getElementById("cta-diagnose-btn").addEventListener("click", startQuiz);
  bindTypeCards();
}

/* ----------------------------- type detail -------------------------------- */

function renderTypeDetail(code) {
  const type = TYPES[code];
  if (!type) {
    goHome();
    return;
  }

  const featureItems = type.features.map((f) => `<li>✦ ${esc(f)}</li>`).join("");
  const cautionItems = type.cautions.map((c) => `<li>⚠️ ${esc(c)}</li>`).join("");
  const styleItems = type.styles.map((s, i) => `
    <div class="style-row">
      <span class="mono gold">${["🥇", "🥈", "🥉"][i]}</span><span>${esc(s)}</span>
    </div>`).join("");

  root.innerHTML = `
    <div class="screen screen--wide type-detail">
      <button id="back-btn" class="back-link mono">← 16タイプ一覧へ戻る</button>

      <div class="type-detail__hero" style="--type-color:${type.color}">
        ${typeImageHTML(code, type, { big: true })}
        <div class="type-detail__intro">
          <p class="mono type-detail__code">${code}</p>
          <p class="type-detail__emoji">${type.emoji}</p>
          <h1 class="display type-detail__jp">${esc(type.jp)}</h1>
          <p class="mono gold type-detail__en">${esc(type.en)}</p>
          <p class="lead type-detail__catch">${esc(type.catchphrase)}</p>
        </div>
      </div>

      <div class="type-detail__body">
        <p class="mono accent label">${esc(type.jp)}とは？</p>
        <p class="lead type-detail__desc">${esc(type.desc)}</p>

        <p class="mono accent label">投資家としての特徴</p>
        <ul class="plain-list">${featureItems}</ul>

        <p class="mono accent label">相性の良い日本株投資スタイル</p>
        <div class="style-list">${styleItems}</div>

        <p class="mono danger label">注意したいこと</p>
        <ul class="plain-list">${cautionItems}</ul>

        <div class="rep-block">
          <p class="mono accent label">代表的な投資家</p>
          <p class="display rep-name">${esc(type.rep)}</p>
          <p class="disclaimer">※あくまで投資スタイルをイメージするための参考例です。投資哲学・行動特性が近い例として紹介しており、本人・機関が本診断タイプに該当すると公言しているものではありません。</p>
        </div>

        <div class="action-stack">
          <button id="diagnose-cta" class="btn btn--primary btn--block">あなたのタイプを診断する</button>
          <button id="back-btn-2" class="btn btn--outline btn--block">← 16タイプ一覧へ戻る</button>
        </div>
      </div>
    </div>`;

  document.getElementById("back-btn").addEventListener("click", goHome);
  document.getElementById("back-btn-2").addEventListener("click", goHome);
  document.getElementById("diagnose-cta").addEventListener("click", startQuiz);

  requestAnimationFrame(() => {
    root.querySelector(".type-detail__hero").classList.add("type-detail__hero--in");
  });
}

/* ------------------------------ main quiz -------------------------------- */

function renderMain() {
  const q = MAIN_QUESTIONS[state.mainIndex];
  const circles = SCALE.map(
    (s) => `<button class="circle-btn" data-value="${s.value}" style="--size:${s.size}px" aria-label="${s.value}"></button>`
  ).join("");

  root.innerHTML = `
    <div class="screen">
      ${progressBarHTML(state.mainIndex + 1, TOTAL_STEPS)}
      <div class="quiz-body">
        <p class="mono muted center small">性格診断</p>
        <div class="statement-card">
          <span class="mono accent">A</span>
          <p class="display statement">${esc(q.a)}</p>
        </div>
        <div class="statement-card">
          <span class="mono gold">B</span>
          <p class="display statement">${esc(q.b)}</p>
        </div>

        <div class="circle-scale">
          <span class="mono circle-scale__label">Aに近い</span>
          <div class="circle-scale__row">${circles}</div>
          <span class="mono circle-scale__label">Bに近い</span>
        </div>
      </div>
    </div>`;

  let locked = false;
  root.querySelectorAll(".circle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      btn.classList.add("circle-btn--selected");
      setTimeout(() => {
        state.mainAnswers[q.id] = Number(btn.dataset.value);
        if (state.mainIndex + 1 < MAIN_QUESTIONS.length) {
          state.mainIndex += 1;
        } else {
          state.view = "sector";
        }
        render();
      }, 200);
    });
  });
}

/* ----------------------------- sector quiz -------------------------------- */

function renderSector() {
  const q = SECTOR_QUESTIONS[state.sectorIndex];
  const stepNumber = MAIN_QUESTIONS.length + state.sectorIndex + 1;
  const options = q.options
    .map((opt) => `<button class="option-btn" data-sector="${esc(opt.sector)}">${esc(opt.label)}</button>`)
    .join("");

  root.innerHTML = `
    <div class="screen">
      ${progressBarHTML(stepNumber, TOTAL_STEPS)}
      <div class="quiz-body">
        <p class="mono muted center small">セクター適性診断</p>
        <h2 class="display sector-q">${esc(q.q)}</h2>
        <div class="option-stack">${options}</div>
      </div>
    </div>`;

  root.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sector = btn.dataset.sector;
      state.sectorCounts[sector] = (state.sectorCounts[sector] || 0) + 1;
      if (state.sectorIndex + 1 < SECTOR_QUESTIONS.length) {
        state.sectorIndex += 1;
      } else {
        state.view = "result";
      }
      render();
    });
  });
}

/* -------------------------------- result ---------------------------------- */

function renderResult() {
  const pct = computeAxisPercents(state.mainAnswers);
  const code = computeTypeCode(pct);
  const type = TYPES[code];
  const dna = computeDNA(pct);
  const sectorTop = computeSectorTop(state.sectorCounts);

  const radarData = [
    { axis: "G", value: pct.GH.a }, { axis: "H", value: pct.GH.b },
    { axis: "L", value: pct.LT.a }, { axis: "T", value: pct.LT.b },
    { axis: "A", value: pct.AV.a }, { axis: "V", value: pct.AV.b },
    { axis: "W", value: pct.WC.a }, { axis: "C", value: pct.WC.b },
  ];

  const dnaBars = dna.map((d) => `
    <div class="score-bar">
      <div class="score-bar__row mono">
        <span>${d.key}</span><span class="gold">${d.value}</span>
      </div>
      <div class="score-bar__track"><div class="score-bar__fill" style="width:${d.value}%"></div></div>
    </div>`).join("");

  const featureItems = type.features.map((f) => `<li>✦ ${esc(f)}</li>`).join("");
  const cautionItems = type.cautions.map((c) => `<li>⚠️ ${esc(c)}</li>`).join("");
  const styleItems = type.styles.map((s, i) => `
    <div class="style-row">
      <span class="mono gold">${["🥇", "🥈", "🥉"][i]}</span><span>${esc(s)}</span>
    </div>`).join("");

  const sectorRows = sectorTop.slice(0, 3).map((s, i) => `
    <div class="sector-row">
      <span class="mono muted">${i + 1}</span>
      <span class="sector-row__name">${esc(s.sector)}</span>
      <div class="sector-row__track"><div class="sector-row__fill" style="width:${Math.min(100, (s.count / 3) * 100)}%"></div></div>
    </div>`).join("");

  const shareText = `私の日本株投資家タイプは「${type.emoji} ${type.jp} (${type.en} / ${code})」でした。 #JKABUTYPE`;

  root.innerHTML = `
    <div class="screen result">
      <p class="mono muted center small">DIAGNOSIS RESULT</p>

      <div class="hanko" id="hanko">
        <div class="hanko__ring mono">${code}</div>
      </div>

      ${typeImageHTML(code, type, { big: true })}

      <p class="center result-emoji">${type.emoji}</p>
      <h1 class="display center result-name">${esc(type.jp)}</h1>
      <p class="mono gold center result-en">${esc(type.en)}</p>
      <p class="lead center result-desc">${esc(type.catchphrase)}</p>

      <p class="mono accent label">投資家DNA</p>
      <div class="radar-wrap" id="radar-wrap"></div>
      <div class="dna-list">${dnaBars}</div>

      <p class="mono accent label">あなたの特徴</p>
      <ul class="plain-list">${featureItems}</ul>

      <p class="mono accent label">相性の良い日本株投資スタイル</p>
      <div class="style-list">${styleItems}</div>

      <p class="mono danger label">注意したいこと</p>
      <ul class="plain-list">${cautionItems}</ul>

      <p class="mono accent label">得意になりやすい日本株セクター</p>
      <div class="sector-list">${sectorRows}</div>

      <div class="rep-block">
        <p class="mono accent label">代表的な投資家</p>
        <p class="display rep-name">${esc(type.rep)}</p>
        <p class="disclaimer">※代表例は投資スタイルをイメージするための参考です。投資哲学・行動特性が近い例として紹介しており、本人・機関が本診断タイプに該当すると公言しているものではありません。</p>
      </div>

      <div class="action-stack">
        <button id="type-page-btn" class="btn btn--outline btn--block">${esc(type.jp)}の詳細ページを見る</button>
        <button id="share-btn" class="btn btn--primary btn--block">結果をシェアする</button>
        <button id="restart-btn" class="btn btn--outline btn--block">もう一度診断する</button>
      </div>

      <p class="footnote">本サイトは特定の銘柄の購入を推奨するものではありません。<br />投資の最終判断はご自身の責任で行ってください。</p>
    </div>`;

  document.getElementById("radar-wrap").innerHTML = renderRadarSVG(radarData, { size: 300 });

  requestAnimationFrame(() => {
    document.getElementById("hanko").classList.add("hanko--stamped");
  });

  document.getElementById("type-page-btn").addEventListener("click", () => goToType(code));

  document.getElementById("share-btn").addEventListener("click", async () => {
    const btn = document.getElementById("share-btn");
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
        return;
      }
    } catch (e) {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(shareText);
      btn.textContent = "コピーしました";
      setTimeout(() => (btn.textContent = "結果をシェアする"), 2000);
    } catch (e) {
      /* no-op: clipboard unavailable */
    }
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    state.view = "home";
    render();
  });
}

/* --------------------------------- router --------------------------------- */

function render() {
  window.scrollTo(0, 0);
  if (state.view === "home") renderHome();
  else if (state.view === "main") renderMain();
  else if (state.view === "sector") renderSector();
  else if (state.view === "result") renderResult();
  else if (state.view === "typeDetail") renderTypeDetail(state.typeCode);
}

// URLハッシュ（#/types/CODE）でタイプ詳細ページに直接リンクできるようにする。
// GitHub Pages 等の静的ホスティングでもサーバー設定なしでリロード・共有が可能。
function handleHashChange() {
  const match = location.hash.match(/^#\/types\/([A-Za-z]+)$/);
  if (match && TYPES[match[1]]) {
    state.view = "typeDetail";
    state.typeCode = match[1];
    render();
    return;
  }
  if (location.hash === "" || location.hash === "#/") {
    if (state.view === "typeDetail") {
      state.view = "home";
      render();
    }
  }
}

window.addEventListener("hashchange", handleHashChange);

// 初回表示：ハッシュ付きでアクセスされた場合はそのタイプ詳細ページを直接表示する。
handleHashChange();
if (!location.hash) render();
