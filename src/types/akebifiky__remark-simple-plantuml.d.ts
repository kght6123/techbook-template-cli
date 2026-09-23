// @akebifiky/remark-simple-plantuml は型定義を同梱していないため、
// このプロジェクトで使う範囲だけを宣言する。
declare module "@akebifiky/remark-simple-plantuml" {
  import type { Plugin } from "unified";

  interface SimplePlantUMLOptions {
    baseUrl?: string;
  }

  const simplePlantUML: Plugin<[SimplePlantUMLOptions?]>;
  export default simplePlantUML;
}
