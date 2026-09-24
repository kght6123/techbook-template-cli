# techbook-template-cli

Remark・Rehypeのカスタムタグとカスタムプラグインで、Re:Viewと同等機能をVivlioStyleで実現するプロジェクトのCLIプログラムです。

> [!IMPORTANT]
> 現在、ベータ版的なプロジェクトです。執筆活動にともなって順次、必要な機能や不具合修正などを適用します。
> Issueに何か不具合などあれば記載ください。

## Overview

各ディレクトリ構成の説明と、各ファイルの概要を説明します。

```txt
techbook-template
├── biome.json <-- biome（formatter、lint）の設定ファイル
├── docs <-- Markdownファイルを置くディレクトリ
│   ├── _finally.md <-- おわりにのMarkdownファイル
│   └── _introduction.md <-- はじめにのMarkdownファイル
├── techbook.code-workspace <-- VS Codeのワークスペースファイル
├── techbook.config.ts <-- 設定ファイル
├── package-lock.json
├── package.json
├── custom.css <-- 任意。本のプロジェクト側で追加するCSS（あれば組版CSSの末尾に連結される）
├── dist <-- 出力ディレクトリ
├── src
│   ├── appendix-template.html <-- Appendixのテンプレート
│   ├── appendix.ts <-- Appendixカスタムタグのコード
│   ├── breakBefore.ts <-- breakBeforeカスタムタグのコード
│   ├── chapter-template.html <-- 本文のテンプレート
│   ├── chat.ts <-- Chatのカスタムタグのコード
│   ├── codeBlockApplyTitlePlugin.ts <-- コードブロックにタイトルを追加するプラグイン
│   ├── colophon-template.html <-- 奥付けのテンプレート
│   ├── colophon.ts <-- 奥付けを作成するコード
│   ├── constants.ts <-- 定数
│   ├── cover-template.html <-- 表紙や裏表紙のテンプレート
│   ├── cover.ts <-- 表紙や裏表紙を作成するコード
│   ├── docref.ts <-- リファレンスタグのカスタムタグのコード
│   ├── footnote.ts <-- 注釈のカスタムタグのコード
│   ├── generateVivlioStyleConfig.ts <-- vivliostyle.config.cjsを生成するコード
│   ├── global.css <-- グローバルCSS（JIS-B5）
│   ├── global-105x173.css <-- グローバルCSS（105mm 173mm）
│   ├── tailwind-utilities.css <-- 標準テンプレートが使うユーティリティクラス（自動生成・編集不可）
│   ├── imageApplyAttributesFromTitlePlugin.ts <-- 画像にタイトルや属性を設定するプラグイン
│   ├── imageAttributesToTitlePlugin.ts <-- 画像のaltテキストから画像の属性とタイトルを取得するプラグイン
│   ├── introduction-template.html <-- はじめにのテンプレート
│   ├── introduction.ts <-- はじめにを作成するコード
│   ├── main.ts <-- 各TypeScriptファイルを読み込んでHTMLを生成する
│   ├── mermaidApplyTitlePlugin.ts <-- Mermaidにタイトルを追加するプラグイン
│   ├── profile-template.html <-- プロフィールのテンプレート
│   ├── profile.ts <-- プロフィールを作成するコード
│   ├── split.ts <-- splitカスタムタグのコード
│   ├── switch.ts <-- switch文カスタムタグのコード
│   ├── tableApplyTitlePlugin.ts <-- テーブルにタイトルを追加するプラグイン
│   ├── toc.ts　<-- 目次を作成するコード
│   └── viewer.ts　<-- VivlioStyle Viewerのみを起動するコード
├── tsconfig.json
└── vivliostyle.config.cjs <-- VivlioStyleの設定ファイル（自動生成）
```

## Install

```bash
npm i github:kght6123/techbook-template-cli#v1.0.0-Release
```

## v1.0.0 での変更点（Tailwind CSS の廃止）

v1.0.0 で Tailwind CSS への依存をやめました。ビルドのたびに `npx tailwindcss` を取得・実行していた処理がなくなり、組版CSSは同梱の完成済みCSSをそのまま使います。ビルドが速くなり、ネットワークやTailwindのバージョン差による失敗もなくなります。

標準テンプレートの見た目は v0.21 と同一です（B5・新書とも、サンプル本のPDFが全ページ一致することを確認済み）。

v0.21 以前を使っている本のプロジェクトは、更新せずそのまま使い続けられます。更新する場合は以下の対応が必要です。

### 1. `tailwind` コマンドの廃止

`npm run dev` から `techbook-template-cli tailwind` の呼び出しを外してください。組版CSSは `dev` コマンドが `dist/global.css` へ書き出します。

```diff
-"dev": "npx --yes concurrently \"npx --yes techbook-template-cli dev\" \"npx --yes techbook-template-cli tailwind\" \"npx --yes techbook-template-cli viewer\" \"npx --yes techbook-template-cli browser\""
+"dev": "npx --yes concurrently \"npx --yes techbook-template-cli dev\" \"npx --yes techbook-template-cli viewer\" \"npx --yes techbook-template-cli browser\""
```

`build` の `--tailwind-src` / `--tailwind-config` / `--tailwind-postcss` オプションも廃止しました。

### 2. 色指定を色コードに書き換える

frontmatter の色指定に使えた `var(--tw-blue-500)` のような Tailwind のカラー変数はなくなりました。色コードで指定してください。

```diff
 color:
   primary:
-    "500": "var(--tw-blue-500)"
-    "400": "var(--tw-blue-400)"
-    "200": "var(--tw-blue-200)"
-    "50": "var(--tw-blue-50)"
+    "500": "#3b82f6"
+    "400": "#60a5fa"
+    "200": "#bfdbfe"
+    "50": "#eff6ff"
```

### 3. 独自に書いた Tailwind クラスは CSS に置き換える

Markdown 本文に自分で書いた Tailwind のユーティリティクラスは、もう生成されません。本のプロジェクト直下に `custom.css` を置くと、組版CSSの末尾に連結されます。ここへ通常のCSSで書き直してください。

```css
/* custom.css */
.my-note {
  background-color: #fef3c7;
  padding: 0.5rem 1rem;
}
```

ファイル名を変えたい場合は `--custom-css <path>` で指定できます。

なお、CLI標準のテンプレートが使うユーティリティクラス（`text-xl`、`flex`、`bg-primary-500` など）は `src/tailwind-utilities.css` として固定化して同梱しているため、その範囲のクラスは引き続き使えます。ただし固定された一覧であり、新しいクラスは増えません。

## Development

### Build and Start

```bash
git clone https://github.com/kght6123/techbook-template-cli.git
cd techbook-template-cli
npm i
npm run build
npm run start -- dev
npm run start -- build
npm run start -- viewer
npm run start -- browser
```

## ChangeLog

- v0.10 2014/11/14 プロジェクト作成
- v0.12 2015/3/9 tailwindコマンドの不具合を修正
- v1.0.0 Tailwind CSSへの依存を廃止し、同梱の完成済みCSSで組版するようにした（破壊的変更）
