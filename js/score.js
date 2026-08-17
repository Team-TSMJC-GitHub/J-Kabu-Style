import { MAIN_QUESTIONS, SCALE_MAX } from "./data.js?v=20260817";

/**
 * mainAnswers: { [questionId]: aPoints(0-SCALE_MAX) }
 * returns: { GH: {a,b}, LT: {a,b}, AV: {a,b}, WC: {a,b} }  (percentages 0-100)
 */
export function computeAxisPercents(mainAnswers) {
  const totals = { GH: { a: 0, b: 0 }, LT: { a: 0, b: 0 }, AV: { a: 0, b: 0 }, WC: { a: 0, b: 0 } };
  MAIN_QUESTIONS.forEach((q) => {
    const aPts = mainAnswers[q.id];
    if (aPts === undefined) return;
    totals[q.axis].a += aPts;
    totals[q.axis].b += SCALE_MAX - aPts;
  });
  const pct = {};
  Object.entries(totals).forEach(([axis, { a, b }]) => {
    const total = a + b || 1;
    pct[axis] = { a: Math.round((a / total) * 100), b: Math.round((b / total) * 100) };
  });
  return pct;
}

// 4軸それぞれ優勢な方の文字を採用して16タイプコードを決定する
export function computeTypeCode(pct) {
  const gh = pct.GH.a >= pct.GH.b ? "G" : "H";
  const lt = pct.LT.a >= pct.LT.b ? "L" : "T";
  const av = pct.AV.a >= pct.AV.b ? "A" : "V";
  const wc = pct.WC.a >= pct.WC.b ? "W" : "C";
  return gh + lt + av + wc;
}

export function computeDNA(pct) {
  const G = pct.GH.a, H = pct.GH.b, L = pct.LT.a, T = pct.LT.b;
  const A = pct.AV.a, V = pct.AV.b, W = pct.WC.a, C = pct.WC.b;
  return [
    { key: "攻撃性", value: H },
    { key: "防衛性", value: G },
    { key: "長期志向", value: L },
    { key: "短期志向", value: T },
    { key: "分析志向", value: A },
    { key: "先見志向", value: V },
    { key: "分散志向", value: W },
    { key: "集中志向", value: C },
    { key: "成長志向", value: Math.round((H + V) / 2) },
    { key: "配当志向", value: Math.round((G + A) / 2) },
    { key: "アクティブ度", value: T },
    { key: "暴落耐性", value: G },
  ];
}

export function computeSectorTop(sectorCounts) {
  const arr = Object.entries(sectorCounts).map(([sector, count]) => ({ sector, count }));
  arr.sort((x, y) => y.count - x.count);
  return arr;
}
