/**
 * GA4 計測用の共通モジュール。
 *
 * 個人を特定できる情報（氏名・メール・電話番号・LINE ID等）は一切送信しない。
 * 送信するのは匿名の行動データ（診断開始/完了、タイプコード、クリックしたリンクの種別）のみ。
 *
 * gtag（Google Tag Manager のグローバル関数）は index.html の <head> で読み込んでいる。
 * ここでは window.gtag が未定義の場合（広告ブロッカー等で読み込みに失敗した場合を含む）でも
 * アプリ本体が壊れないよう、必ず存在チェックしてから呼び出す。
 */

function gtagSafe(...args) {
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

/** 汎用のGA4イベント送信 */
export function trackEvent(eventName, params = {}) {
  gtagSafe("event", eventName, params);
}

/**
 * Hash Router（#/types/CODE など）はブラウザの実ページ遷移を伴わないため、
 * gtag('config', ...) が自動送信する page_view だけでは画面遷移を追いきれない。
 * ハッシュが変わるたびに明示的に page_view を送る。
 */
export function trackPageView(path, title) {
  gtagSafe("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: location.origin + location.pathname + path,
  });
}

/**
 * 外部リンク・CTAクリックの共通トラッキング関数。
 * 証券会社・LINE・SNSシェアなど、今後追加されるあらゆる送客導線はこの関数経由で計測する。
 *
 * trackOutboundClick({
 *   category: 'broker' | 'line' | 'sns' | 'email' | 'other',
 *   name: 'Broker_A',       // リンク先の識別名（任意）
 *   typeCode: 'HTAW',       // 診断結果のタイプコード（分かる場合）
 *   typeName: '戦略家',      // 診断結果のタイプ名（分かる場合）
 *   position: 'result_page' // ボタンが設置されている画面
 * })
 */
const CATEGORY_EVENT_MAP = {
  broker: "broker_click",
  line: "line_click",
  sns: "share_click",
  email: "email_signup_click",
};

export function trackOutboundClick({ category, name, typeCode, typeName, position } = {}) {
  const eventName = CATEGORY_EVENT_MAP[category] || "outbound_click";
  const params = { link_position: position };

  if (category === "broker") {
    params.broker_name = name;
  } else if (name) {
    params.link_name = name;
  }
  if (typeCode) params.type_code = typeCode;
  if (typeName) params.type_name = typeName;

  trackEvent(eventName, params);
}
