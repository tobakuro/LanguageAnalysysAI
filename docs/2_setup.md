<!-- Devbox shellに入った後のフロント/バックエンドのサーバー起動手順を記載 -->

# 2. プロジェクトセットアップ手順

## 1. Devbox shellに入る

```bash
devbox shell
```

## 2. 依存関係のインストール

```bash
devbox run setup
```

## 3. 開発サーバー起動

```bash
devbox run dev
```

Viteの開発サーバーが起動します（デフォルト: http://localhost:5173）。

スマホ実機でカメラ機能を確認する場合は `pnpm dev -- --host` でLAN公開し、HTTPS環境（`getUserMedia`はHTTPS必須）でアクセスしてください。

その他のコマンドは [commands.md](./commands.md) を参照。
