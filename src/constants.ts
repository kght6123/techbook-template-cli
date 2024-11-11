import simplePlantUML from "@akebifiky/remark-simple-plantuml";
import rehypeShiki from "@shikijs/rehype";
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRenderWhitespace,
} from "@shikijs/transformers";
import rehypeMermaid from "rehype-mermaid";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { VFile } from "remark-rehype/lib";
import { Node } from "unified/lib";
import { matter } from "vfile-matter";
import addLinkToQRCode from "./addLinkToQRCode";
import codeBlockApplyTitlePlugin from "./codeBlockApplyTitlePlugin";
import imageApplyAttributesFromTitlePlugin from "./imageApplyAttributesFromTitlePlugin";
import imageAttributesToTitlePlugin from "./imageAttributesToTitlePlugin";
import mermaidApplyTitlePlugin from "./mermaidApplyTitlePlugin";
import tableApplyTitlePlugin from "./tableApplyTitlePlugin";

// Handlebarsのオプション
export const handlebarCompileOptions: CompileOptions = {
  noEscape: true, // HTMLエスケープをしない
};

const cwd = process.cwd();

export const distDir = cwd + "/dist";
export const docsDir = cwd + "/docs";

export const lockFileSrcPath = "src/lockfile";
export const lockFileDistPath = distDir + "/lockfile";

export const chapterTemplateHtmlPath = "src/chapter-template.html";
export const simpleChapterTemplateHtmlPath = "src/simplechapter-template.html";

export const appendixTitle = "Appendix";
export const appendixDistPath = distDir + "/appendix.dist.html";
export const appendixTemplateHtmlPath = "src/appendix-template.html";

export const colophonTitle = "奥付";
export const colophonDistPath = distDir + "/colophon.dist.html";
export const colophonTemplateHtmlPath = "src/colophon-template.html";

export const profileTitle = "著者プロフィール";
export const profileDistPath = distDir + "/profile.dist.html";
export const profileTemplateHtmlPath = "src/profile-template.html";

export const introductionDocPath = docsDir + "/_introduction.md";
export const finallyDocPath = docsDir + "/_finally.md";
export const introductionDistPath = distDir + "/_introduction.dist.html";
export const finallyDistPath = distDir + "/_finally.dist.html";
export const introductionTemplateHtmlPath = "src/introduction-template.html";
export const simpleIntroductionTemplateHtmlPath = "src/simpleintroduction-template.html";

export const tocDistPath = distDir + "/toc.dist.html";

export const coverTemplateHtmlPath = "src/cover-template.html";
export const frontCoverDistPath = distDir + "/front-cover.dist.html";
export const backCoverDistPath = distDir + "/back-cover.dist.html";
export const startCoverDistPath = distDir + "/start-cover.dist.html";
export const endCoverDistPath = distDir + "/end-cover.dist.html";

// unifiedのプロセッサを作成する
export const processorRehype = unified()
  .use(remarkParse)
  // DOCS: https://github.com/remarkjs/remark-frontmatter
  .use(remarkFrontmatter, { type: "yaml", marker: "-" })
  .use(() => (_tree: Node, file: VFile) => {
    matter(file, { strip: true });
  })
  .use(remarkGfm)
  // .use(remarkToc, { ordered: false })
  // DOCS: https://github.com/akebifiky/remark-simple-plantuml
  .use(simplePlantUML)
  .use(imageAttributesToTitlePlugin)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(imageApplyAttributesFromTitlePlugin)
  .use(rehypeSlug)
  // DOCS: https://github.com/remcohaszing/rehype-mermaid
  .use(rehypeMermaid, {
    strategy: "img-png",
    // strategy: 'pre-mermaid'
  })
  .use(codeBlockApplyTitlePlugin)
  .use(mermaidApplyTitlePlugin)
  .use(tableApplyTitlePlugin)
  // DOCS: https://shiki.style/packages/rehype
  .use(rehypeShiki, {
    themes: {
      light: "min-light",
      dark: "min-light",
    },
    transformers: [
      // DOCS: https://shiki.style/packages/transformers
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationWordHighlight(),
      transformerNotationFocus(),
      transformerNotationErrorLevel(),
      transformerRenderWhitespace(),
      transformerMetaHighlight(),
      transformerMetaWordHighlight(),
    ],
  })
  .use(addLinkToQRCode);

export const processor = processorRehype.use(rehypeStringify, {
  allowDangerousHtml: true,
});
