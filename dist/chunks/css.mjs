import fs from 'fs';
import { I as utilitiesCssPath, J as globalCssDistPath, K as customCssPath, L as globalCssSrcDir, e as config } from '../index.mjs';
import 'commander';
import '@akebifiky/remark-simple-plantuml';
import '@shikijs/rehype';
import '@shikijs/transformers';
import 'rehype-mermaid';
import 'rehype-slug';
import 'rehype-stringify';
import 'remark-frontmatter';
import 'remark-gfm';
import 'remark-parse';
import 'remark-rehype';
import 'unified';
import 'vfile-matter';
import 'qrcode';
import 'unist-util-visit';
import 'github-slugger';
import 'jiti';
import 'path';
import 'url';

const GLOBAL_CSS_FILE_MAP = {
  "JIS-B5": "global.css",
  "105mm 173mm": "global-105x173.css"
};
const globalCssSrcPath = `${globalCssSrcDir}/${GLOBAL_CSS_FILE_MAP[config.size] ?? GLOBAL_CSS_FILE_MAP["JIS-B5"]}`;
function writeGlobalCss(customCss = customCssPath) {
  const parts = [utilitiesCssPath, globalCssSrcPath].map(
    (path) => fs.readFileSync(path, "utf8")
  );
  if (fs.existsSync(customCss)) {
    parts.push(fs.readFileSync(customCss, "utf8"));
  }
  fs.writeFileSync(globalCssDistPath, parts.join("\n"));
}

export { writeGlobalCss as default, globalCssSrcPath };
