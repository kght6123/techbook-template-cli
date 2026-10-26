import fs from 'fs';
import path from 'path';

const MARKER = "__vivSpine";
const RUNNING_ELEMENT_LOOKUP = /let (\w+)=(\w+)&&(\w+)\.querySelectorAll\(`\[\$\{(\w+)\}="\$\{\2\}"\]`\);(if\(!\1\|\|(?:\1\.length===0|0===\1\.length)\)return null;)let (\w+)=\1\[\1\.length-1\]/;
const TARGET_FILES = [
  "@vivliostyle/core/lib/vivliostyle.js",
  "@vivliostyle/viewer/lib/js/vivliostyle-viewer.js"
];
function findTargets(cwd) {
  const found = /* @__PURE__ */ new Set();
  const visit = (nodeModules, depth) => {
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
function patchSource(source) {
  if (source.includes(MARKER)) return null;
  const match = RUNNING_ELEMENT_LOOKUP.exec(source);
  if (!match) return null;
  const list = match[1];
  const guard = match[5];
  const filter = `if(${list}&&${list}.length>1&&this.currentPage){let ${MARKER}=String(this.currentPage.spineIndex),__vivPage=this.currentPage.container,__vivF=Array.from(${list}).filter(__x=>{let __c=__x.closest("[data-vivliostyle-page-container]");return __c&&(__c===__vivPage||__c.getAttribute("data-vivliostyle-spine-index")===${MARKER})});__vivF.length&&(${list}=__vivF)}`;
  const replaced = match[0].replace(guard, filter + guard);
  return source.slice(0, match.index) + replaced + source.slice(match.index + match[0].length);
}
function patchVivliostyle(cwd = process.cwd()) {
  for (const file of findTargets(cwd)) {
    const source = fs.readFileSync(file, "utf-8");
    if (source.includes(MARKER)) continue;
    const patched = patchSource(source);
    if (patched === null) {
      console.warn(`patchVivliostyle: ${file} \u306E\u4FEE\u6B63\u7B87\u6240\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\uFF08\u672C\u5BB6\u3067\u76F4\u3063\u305F\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\uFF09\u3002`);
      continue;
    }
    fs.writeFileSync(file, patched);
    console.info(`patchVivliostyle: ${file} \u3092\u4FEE\u6B63\u3057\u307E\u3057\u305F\u3002`);
  }
}

export { patchVivliostyle as default, patchSource };
