<!-- 命名規則・フォーマッタ・linter設定・言語別のルールを記載 -->

# コーディング規約

## フォーマッタ / Linter

| 対象 | ツール | 設定ファイル |
|---|---|---|
| フォーマット | Prettier | `.prettierrc.json` / `.prettierignore` |
| Lint | ESLint（`typescript-eslint` recommended） | `eslint.config.js` |
| 型チェック | TypeScript strict系オプション | `tsconfig.json` |

コミット前に `devbox run lint`, `devbox run format:check`, `devbox run typecheck` を通すこと。

## TypeScript

- `any` は使用しない。型不明な値は `unknown` を使い、絞り込みを行う
- セミコロンなし・シングルクォート（Prettier設定に準拠、手で調整しない）
- 関数型アプローチを優先し、副作用（DOM操作・カメラ制御等）は境界を明確にした関数に閉じ込める
