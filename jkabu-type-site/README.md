# J-KABU TYPE（日本株投資家性格診断）

性格・価値観・行動特性に関する30問の質問に答えることで、16タイプの日本株投資家タイプを診断するWebサイトです。

- フロントエンドのみ（HTML / CSS / Vanilla JavaScript, ESモジュール）
- バックエンド・データベース・アカウント機能なし
- ビルド不要（バンドラー不使用）。そのまま静的ホスティング可能
- 無料で GitHub Pages にデプロイして誰でも利用できる構成

## ファイル構成

```
index.html          エントリーポイント
css/style.css        スタイル一式
js/data.js            質問・16タイプ・代表投資家などのデータ定義
js/score.js           回答から16タイプを判定するロジック
js/radar.js           投資家DNAレーダーチャート（依存ライブラリなしのSVG描画）
js/app.js             画面遷移・イベント制御（コントローラー）
docs/                 仕様ドキュメント（画面遷移図・質問回答マトリックス・簡易仕様書）
```

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

## 免責事項

本サイトは性格・価値観に基づいて投資スタイルの傾向を提示するものであり、特定の銘柄の購入を推奨するものではありません。投資の最終判断はご自身の責任で行ってください。
