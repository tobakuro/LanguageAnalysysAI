<!-- 開発でよく使うコマンドをまとめて記載 -->

# よく使うコマンド集

すべて `devbox shell` に入った状態、またはリポジトリ直下から `devbox run <script>` で実行する。

| コマンド | 内容 |
|---|---|
| `devbox run setup` | 依存インストール（`pnpm install`） |
| `devbox run dev` | 開発サーバー起動（Vite） |
| `devbox run build` | 本番ビルド（`tsc && vite build`） |
| `devbox run lint` | ESLintでチェック |
| `devbox run lint:fix` | ESLintで自動修正 |
| `devbox run format` | Prettierで整形 |
| `devbox run format:check` | Prettierの整形チェック（CI用） |
| `devbox run typecheck` | 型チェック（`tsc --noEmit`） |
| `devbox run test` | 【未導入】テストフレームワーク導入後に接続 |

## スマホ実機でのカメラ確認

`getUserMedia` はHTTPS（またはlocalhost）必須のため、LAN上のスマホから確認する場合はHTTPS化が必要。

```bash
pnpm dev -- --host
```
