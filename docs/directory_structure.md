<!-- プロジェクトのディレクトリ構成と各フォルダの役割を記載 -->

# ディレクトリ構成

```
.
├── src/                       # フロントエンド（TypeScript）
│   ├── main.ts                # エントリーポイント（カメラ起動・分類ループ・結果表示）
│   ├── classifier.ts          # ONNX Runtime Webによる画像分類ラッパー
│   ├── kana.ts                 # 音ラベル→ひらがな変換、濁点/半濁点の適用
│   └── style.css              # 単一画面レイアウト（上部カメラプレビュー / 下部結果表示）
├── public/
│   ├── models/                 # 学習済みONNXモデル・クラス一覧（デプロイ対象）
│   │   ├── sound.onnx / sound_classes.json
│   │   └── dice.onnx / dice_classes.json
│   └── favicon.svg
├── index.html                  # PWAのHTMLエントリー
├── vite.config.ts               # Vite設定（vite-plugin-pwaでService Worker生成、
│                                #   onnxruntime-webのwasmはVite標準のアセット解決で自動配置）
├── tsconfig.json
├── eslint.config.js
├── .prettierrc.json
├── training/                    # モデル訓練用Pythonプロジェクト（uv管理、独立した仮想環境）
│   ├── data/                    # 学習データ（.gitignore対象、ローカルのみ保持）
│   │   ├── sound/                # {段}_{行}_{連番}.png のフラット構成
│   │   └── dice/{dakuten,handakuten}/
│   ├── models/                   # 訓練済み .pt / .onnx（中間生成物、.gitignore対象）
│   ├── dataset.py                 # train/val分割・データ拡張込みのDataset定義
│   ├── model.py                   # MobileNetV3-Smallベースのモデル構築
│   ├── train_sound.py / train_dice.py
│   ├── export_onnx.py             # .pt → .onnx 変換
│   └── pyproject.toml
├── docs/                        # プロジェクトドキュメント
└── devbox.json                  # Devbox環境定義・統一コマンド
```

各フォルダ/ファイルの役割:

| パス | 役割 |
|---|---|
| `src/main.ts` | カメラ起動（`getUserMedia`）、画面DOM構築、一定間隔での分類ループ、結果表示 |
| `src/classifier.ts` | ONNX Runtime Webのセッション初期化・前処理（正規化）・推論実行 |
| `src/kana.ts` | soundラベル（`a_ka`等）→ひらがな変換、濁点/半濁点の適用ロジック |
| `src/style.css` | 単一画面レイアウト（画面遷移なし） |
| `vite.config.ts` | PWAマニフェスト・Service Worker（オフライン対応）の設定 |
| `public/models/` | デプロイ対象の学習済みモデル（training/models/からコピー） |
| `training/` | モデル訓練用Pythonプロジェクト。devboxの`uv@latest`で管理、フロントエンドとは独立した`.venv` |
| `docs/requirements.md` | プロダクト要件（言語仕様・機能要件・開発フェーズ） |
| `docs/architecture.md` | 技術スタック・画面構成・データフロー |

サイコロ（濁点/半濁点）分類器の呼び出しと、文字領域検出ロジックはまだ`main.ts`に組み込まれていない（[#6](https://github.com/tobakuro/LanguageAnalysysAI/issues/6), [#8](https://github.com/tobakuro/LanguageAnalysysAI/issues/8)参照）。現状はカメラフレーム全体をsound分類器にかけるだけの動作検証段階。
