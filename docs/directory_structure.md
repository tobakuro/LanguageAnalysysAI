<!-- プロジェクトのディレクトリ構成と各フォルダの役割を記載 -->

# ディレクトリ構成

```
.
├── src/                  # フロントエンド（TypeScript）
│   ├── main.ts           # エントリーポイント（カメラ起動・結果表示の初期化）
│   └── style.css         # 単一画面レイアウト（上部カメラプレビュー / 下部結果表示）
├── public/                # 静的アセット（favicon等）
├── index.html             # PWAのHTMLエントリー
├── vite.config.ts          # Vite設定（vite-plugin-pwaでService Worker生成）
├── tsconfig.json
├── eslint.config.js
├── .prettierrc.json
├── docs/                   # プロジェクトドキュメント
└── devbox.json             # Devbox環境定義・統一コマンド
```

各フォルダ/ファイルの役割:

| パス | 役割 |
|---|---|
| `src/main.ts` | カメラ起動（`getUserMedia`）、画面DOM構築、結果表示の初期化 |
| `src/style.css` | 単一画面レイアウト（画面遷移なし） |
| `vite.config.ts` | PWAマニフェスト・Service Worker（オフライン対応）の設定 |
| `docs/requirements.md` | プロダクト要件（言語仕様・機能要件・開発フェーズ） |
| `docs/architecture.md` | 技術スタック・画面構成・データフロー |

AIモデル訓練用のPythonコード（`requirements.md` Phase 1）は今後 `training/` 等のディレクトリに追加予定。
