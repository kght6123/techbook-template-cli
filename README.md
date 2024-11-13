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
├── postcss.config.cjs
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
│   ├── global.css <-- グローバルCSS
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
├── tailwind.config.ts
├── tsconfig.json
└── vivliostyle.config.cjs <-- VivlioStyleの設定ファイル（自動生成）
```

## Build and Start

```bash
npm run build
npm run start -- dev
npm run start -- build
npm run start -- viewer
npm run start -- tailwind
npm run start -- browser
```


## ChangeLog

- v0.1 11/13 プロジェクト作成
