import fs from "fs";

import {
  config,
  customCssPath,
  globalCssDistPath,
  globalCssSrcDir,
  utilitiesCssPath,
} from "./constants";

const GLOBAL_CSS_FILE_MAP = {
  "JIS-B5": "global.css",
  "105mm 173mm": "global-105x173.css",
} as const;

export const globalCssSrcPath = `${globalCssSrcDir}/${
  GLOBAL_CSS_FILE_MAP[config.size] ?? GLOBAL_CSS_FILE_MAP["JIS-B5"]
}`;

/**
 * 組版用のCSSを dist/global.css へ書き出す。
 * 利用者が本のプロジェクト直下に custom.css を置いていれば、最後に連結して上書きできるようにする。
 */
export default function writeGlobalCss(customCss = customCssPath) {
  const parts = [utilitiesCssPath, globalCssSrcPath].map((path) =>
    fs.readFileSync(path, "utf8"),
  );

  if (fs.existsSync(customCss)) {
    parts.push(fs.readFileSync(customCss, "utf8"));
  }

  fs.writeFileSync(globalCssDistPath, parts.join("\n"));
}
