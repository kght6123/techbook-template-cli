import fs from "fs";
import Handlebars from "handlebars";
import {
  handlebarCompileOptions,
  profileDistPath,
  profileTemplateHtmlPath,
  config,
} from "./constants";

export const profileCompile = () => {
  // HTMLのテンプレートをHandlebarsで読み込む
  const profileTemplateHtml = Handlebars.compile(
    fs.readFileSync(profileTemplateHtmlPath).toString(),
    handlebarCompileOptions,
  );

  // HTMLのテンプレートへ埋め込む
  const html = profileTemplateHtml({ config });
  fs.writeFileSync(profileDistPath, html);
};
