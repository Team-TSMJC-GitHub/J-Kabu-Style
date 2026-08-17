# J-KABU TYPE（日本株投資家性格診断）

性格・価値観・行動特性に関する30問の質問に答えることで、16タイプの日本株投資家タイプを診断するWebサイトです。

- フロントエンドのみ（HTML / CSS / Vanilla JavaScript, ESモジュール）
- バックエンド・データベース・アカウント機能なし
- ビルド不要（バンドラー不使用）。そのまま静的ホスティング可能
- 無料で GitHub Pages にデプロイして誰でも利用できる構成

## 主な機能

- トップページ：Hero、16タイプ紹介ギャラリー（クリックで詳細ページへ）、診断へのCTA
- タイプ詳細ページ：`#/types/{CODE}` のURLハッシュでルーティング（例: `#/types/HLAC`）。ブックマーク・共有・リロードに対応
- 性格診断（24問・○の大きさで回答する視覚的7段階スケール）→ セクター適性診断（6問）→ 診断結果（16タイプ判定・投資家DNA・シェア）

## ファイル構成

```
index.html          エントリーポイント
css/style.css        スタイル一式
js/data.js            質問・16タイプ・代表投資家などのデータ定義
js/score.js           回答から16タイプを判定するロジック
js/radar.js           投資家DNAレーダーチャート（依存ライブラリなしのSVG描画）
js/app.js             画面遷移（ルーティング含む）・イベント制御（コントローラー）
docs/                 仕様ドキュメント（画面遷移図・質問回答マトリックス・簡易仕様書）
images/types/         キャラクター画像の配置場所（下記参照）
```

## キャラクター画像の差し替え方法

16タイプのうち、**14タイプの画像が実装済み**です（`images/types/` 配下）。未実装は **HTVW（トレンドハンター）・HTVC（勝負師）** の2タイプのみで、これらは今後画像が提供され次第、以下のパスに配置するだけで自動的にプレースホルダーから差し替わります（コード修正不要）。

```
images/types/HTVW.webp
images/types/HTVC.webp
```

パスは相対パス（先頭に `/` を付けない）にしてあるため、GitHub Pages でリポジトリ名込みのURL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）で公開してもそのまま動作します。

画像が存在しない間は、タイプごとのアクセントカラーを使った仮のプレースホルダー（絵文字・タイプコード）が表示されます。

### 画像を追加する際の推奨サイズ

読み込み速度とスマートフォンでの体感を優先するため、正方形〜4:3程度の比率にトリミングし、長辺 900px 程度・WebP形式（品質80前後）に変換してから配置することを推奨します（元のPNGが数MBある場合、変換後は数百KB程度まで軽量化できます）。

## ローカルでの動作確認

ESモジュール（`type="module"`）を使用しているため、`file://` で直接開くとブラウザによっては動作しない場合があります。簡易サーバーで確認してください。

```bash
# Python がある場合
python3 -m http.server 8080
# → http://localhost:8080 にアクセス

# Node.js がある場合
npx serve .
```

## GitHub Pages への無料デプロイ手順

1. このフォルダの中身をそのまま GitHub リポジトリの直下（ルート）にコミット & プッシュする
   ```bash
   git init
   git add .
   git commit -m "Initial commit: J-KABU TYPE"
   git branch -M main
   git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```
2. GitHub のリポジトリページで **Settings → Pages** を開く
3. **Source** を `Deploy from a branch` に設定
4. **Branch** を `main` / `/ (root)` に設定して **Save**
5. 数分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

アカウント登録・データベース・サーバー費用は一切不要です。

## データ・ロジックの拡張方法

- 質問を追加・変更する場合は `js/data.js` の `MAIN_QUESTIONS` / `SECTOR_QUESTIONS` を編集してください（画面側の実装変更は不要です）。
- 16タイプの説明文や代表的投資家を変更する場合は `js/data.js` の `TYPES` を編集してください。
- 判定ロジックを変更する場合は `js/score.js` のみを編集してください（データ定義から独立しています）。

## GA4（Google Analytics 4）計測

`index.html` の `<head>` に GA4 タグ（測定ID: `G-990KPVYYC9`）を設置済みです。以下のイベントを匿名で計測します（氏名・メール・電話番号などの個人情報は一切送信しません）。

| イベント名 | 発火タイミング | 主なパラメータ |
|---|---|---|
| `diagnosis_start` | 「診断する」系ボタンを押したとき | `start_position`（home_hero / home_cta / type_detail） |
| `diagnosis_complete` | 診断結果画面が表示されたとき | `type_code`, `type_name` |
| `type_detail_view` | タイプ詳細ページ（`#/types/CODE`）を表示したとき | `type_code`, `type_name` |
| `broker_click` | 診断結果画面の証券会社リンクをクリックしたとき | `broker_name`, `type_code`, `type_name`, `link_position` |
| `line_click` | 診断結果画面のLINEボタンをクリックしたとき | `type_code`, `type_name`, `link_position` |
| `share_click` | 「結果をシェアする」ボタンを押したとき | `type_code`, `type_name`, `link_position` |
| `page_view` | Hash Routerでの画面遷移時（ブラウザの実ページ遷移を伴わないため手動送信） | `page_path`, `page_title` |

計測ロジックは `js/analytics.js` に共通化しており、新しい送客リンク（メール登録・その他サービス等）を追加する場合は、既存の `broker-link` / `line-link` と同様に `trackOutboundClick({ category, name, typeCode, typeName, position })` を呼び出すだけで対応できます。

### 証券会社・LINEリンクの差し替え方

`js/data.js` の `BROKER_LINKS` ・ `BROKER_LINKS_COMING_SOON` ・ `LINE_LINK` を書き換えるだけで、診断結果画面のリンク先が切り替わります（クリック計測のコードは変更不要です）。

- `BROKER_LINKS`：実際に掲載する証券会社。通常のテキストリンク（`{ name, label, url }`）と、ASP（A8.netなど）指定のバナー広告タグ（`{ name, type: "banner", label, url, bannerImg, bannerWidth, bannerHeight, impressionPixel }`）の両方に対応。バナー広告は提携先が指定した画像URL・幅高さ・`rel="nofollow"`・インプレッション計測用ピクセルをそのまま使用する必要があるため、差し替える際は提携先から発行されたタグの値をそのまま設定してください。
- `BROKER_LINKS_COMING_SOON`：まだリンクが用意できていない提携先（審査中など）を「近日公開」として表示する枠。承認が下りたら該当エントリを削除し、`BROKER_LINKS` に追加してください。

```js
export const BROKER_LINKS = [
  {
    name: "Partner_1",
    type: "banner",
    label: "証券口座を開設する",
    url: "https://px.a8.net/svt/ejp?a8mat=...",
    bannerImg: "https://www25.a8.net/svt/bgt?...",
    bannerWidth: 100,
    bannerHeight: 60,
    impressionPixel: "https://www14.a8.net/0.gif?a8mat=...",
  },
];
export const BROKER_LINKS_COMING_SOON = [
  { label: "証券会社B（提携申請中）" },
];
export const LINE_LINK = "https://example.com/line";
```

## 免責事項

本サイトは性格・価値観に基づいて投資スタイルの傾向を提示するものであり、特定の銘柄の購入を推奨するものではありません。投資の最終判断はご自身の責任で行ってください。
