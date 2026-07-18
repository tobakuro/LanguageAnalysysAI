<!-- テスト手順・PWA動作確認方法を記載 -->

# テスト手順

## PWAのデプロイ前テスト

PWAは通常のWeb動作確認に加え、**Service Worker・オフライン動作・インストール可能性**というPWA特有の機能確認が必要。

### 1. 基本動作確認（開発サーバー）

```bash
devbox run dev
```

`vite dev` はHMR優先でService Workerを本番同様には動かさないため、PWA機能自体の確認には使えない。UIやロジックの動作確認のみに使う。

### 2. 本番ビルド + プレビューでのPWA機能確認

```bash
devbox run build
pnpm preview
```

`vite-plugin-pwa` は `build` 時に `dist/sw.js` を生成する。`preview` はそれを配信するため、実際のService Worker登録・キャッシュ動作を再現できる。

### 3. ブラウザDevToolsでの確認項目

Chrome DevTools → **Application** タブ:

| 項目 | 確認内容 |
|---|---|
| Manifest | アイコン・名前・`display: standalone` など manifest が正しく読めているか |
| Service Workers | 登録済みか、`activated and running` になっているか |
| Cache Storage | `vite.config.ts` の `workbox.globPatterns` で指定した静的アセットがプリキャッシュされているか |

Chrome DevTools → **Lighthouse** タブ: PWAカテゴリでインストール可能性・オフライン対応のスコアを機械的にチェック。

### 4. オフライン動作の確認

1. DevTools → Network タブで「Offline」にチェック
2. ページをリロードし、Service Workerのキャッシュだけで表示されるか確認

要件「初回ロード後はオフラインで完全動作」（`docs/requirements.md` 5章）を検証する最も直接的な方法。

### 5. カメラ機能はHTTPS必須

`getUserMedia` は `localhost` 以外ではHTTPS必須。実機（スマホ）でLAN経由テストする場合、`pnpm dev -- --host` / `pnpm preview -- --host` だけではHTTP配信になりカメラが動かない。

- 簡易的には `mkcert` 等でローカル証明書を発行し、Vite側にHTTPS設定を追加する
- もしくは `localhost` のみで確認し、実機確認はデプロイ先のステージング環境（HTTPS自動付与）で行う

### 6. 実機インストールの確認

上記4のHTTPS化を行えば、デプロイ前でもLAN内のスマホからアクセスし「ホーム画面に追加」でPWAとしてのインストール動作まで確認できる。

---

**まとめ**: `devbox run build` → `pnpm preview` → Chrome DevTools（Application / Lighthouse）でオフライン・インストール可能性を確認するのが基本セット。実機のカメラ込みで確認したい場合はHTTPS化が必要。

## 単体・結合テスト

未導入。導入時にこのセクションへ追記する（`devbox run test` は現状TODO、[commands.md](./commands.md) 参照）。
