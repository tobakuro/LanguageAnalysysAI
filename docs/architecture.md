<!-- システム全体のアーキテクチャ・構成図・使用技術スタックを記載 -->

# アーキテクチャ

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | TypeScript + PWA |
| カメラ制御 | WebAPI（getUserMedia） |
| 画像前処理 | Canvas API |
| AI推論 | ONNX Runtime Web（Wasmバックエンド） |
| モデル訓練 | Python（PyTorch）→ ONNX形式で書き出し |
| モデルアーキテクチャ | MobileNetV3等の軽量CNN（要検討） |
| ホスティング | 未定（Vercel, Cloudflare Pages等） |

## データフロー

1. スマホカメラでリアルタイムプレビューを表示
2. 撮影ボタンまたは自動検出でキャプチャ
3. Canvas APIで画像の前処理（リサイズ、正規化等）
4. ONNX Runtime Webで文字領域の検出・分類（ブラウザ内で完結、通信なし）
5. 分類結果を日本語文字に変換し、画面に即座に表示

詳細な要件は [requirements.md](./requirements.md) を参照。
