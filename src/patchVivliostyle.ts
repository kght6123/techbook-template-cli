import fs from "fs";
import path from "path";

/**
 * Vivliostyle の不具合を、組版の前に node_modules 内で直す。
 *
 * 柱（running element）の中身は、ビューアー全体の DOM から
 * data-adapt-eloff（要素の通し番号）だけで探され、最後に見つかった要素が使われる。
 * 通し番号は文書（章）ごとに 0 から振られるため、別の章へのページ番号つき参照
 * （target-counter）でページが描き直されると、別の章の同じ番号の要素を拾い、
 * 柱が空白になったり別の章の色になったりする。
 *
 * 描画中のページと同じ文書（spine）のページに絞って探すよう書き換える。
 * 本家で直ったら、この処理は外してよい。
 */
const MARKER = "__vivSpine";

// ミニファイの違い（`x.length===0` と `0===x.length`）の両方に合わせる
const RUNNING_ELEMENT_LOOKUP =
  /let (\w+)=(\w+)&&(\w+)\.querySelectorAll\(`\[\$\{(\w+)\}="\$\{\2\}"\]`\);(if\(!\1\|\|(?:\1\.length===0|0===\1\.length)\)return null;)let (\w+)=\1\[\1\.length-1\]/;

const TARGET_FILES = [
  "@vivliostyle/core/lib/vivliostyle.js",
  "@vivliostyle/viewer/lib/js/vivliostyle-viewer.js",
];

/** cwd から見える node_modules（入れ子を含む）の中の対象ファイルを集める */
function findTargets(cwd: string): string[] {
  const found = new Set<string>();
  const visit = (nodeModules: string, depth: number) => {
    if (depth > 3 || !fs.existsSync(nodeModules)) return;
    for (const target of TARGET_FILES) {
      const file = path.join(nodeModules, target);
      if (fs.existsSync(file)) found.add(file);
    }
    for (const pkg of ["@vivliostyle/cli", "techbook-template-cli"]) {
      visit(path.join(nodeModules, pkg, "node_modules"), depth + 1);
    }
  };
  visit(path.join(cwd, "node_modules"), 0);
  return [...found];
}

export function patchSource(source: string): string | null {
  if (source.includes(MARKER)) return null;
  const match = RUNNING_ELEMENT_LOOKUP.exec(source);
  if (!match) return null;
  const list = match[1];
  const guard = match[5];
  const filter =
    `if(${list}&&${list}.length>1&&this.currentPage){` +
    `let ${MARKER}=String(this.currentPage.spineIndex),__vivPage=this.currentPage.container,` +
    `__vivF=Array.from(${list}).filter(__x=>{let __c=__x.closest("[data-vivliostyle-page-container]");` +
    `return __c&&(__c===__vivPage||__c.getAttribute("data-vivliostyle-spine-index")===${MARKER})});` +
    `__vivF.length&&(${list}=__vivF)}`;
  const replaced = match[0].replace(guard, filter + guard);
  return source.slice(0, match.index) + replaced + source.slice(match.index + match[0].length);
}

export default function patchVivliostyle(cwd = process.cwd()): void {
  for (const file of findTargets(cwd)) {
    const source = fs.readFileSync(file, "utf-8");
    if (source.includes(MARKER)) continue;
    const patched = patchSource(source);
    if (patched === null) {
      console.warn(`patchVivliostyle: ${file} の修正箇所が見つかりませんでした（本家で直った可能性があります）。`);
      continue;
    }
    fs.writeFileSync(file, patched);
    console.info(`patchVivliostyle: ${file} を修正しました。`);
  }
}
