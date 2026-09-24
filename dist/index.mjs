import { Command } from 'commander';
import simplePlantUML from '@akebifiky/remark-simple-plantuml';
import rehypeShiki from '@shikijs/rehype';
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight, transformerNotationFocus, transformerNotationErrorLevel, transformerRenderWhitespace, transformerMetaHighlight, transformerMetaWordHighlight } from '@shikijs/transformers';
import rehypeMermaid from 'rehype-mermaid';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { matter } from 'vfile-matter';
import QRCode from 'qrcode';
import { visit } from 'unist-util-visit';
import { slug } from 'github-slugger';
import { createJiti } from 'jiti';
import path from 'path';
import { fileURLToPath } from 'url';

const qrCodeCommentPrefix = "<!-- qrcode: ";
const rehypeAddQRToComments = () => {
  return async (tree) => {
    const promises = [];
    const nodesToAdd = [];
    visit(tree, "raw", (node, index, parent) => {
      const rawNode = node;
      const rawValue = String(rawNode.value).trim();
      if (rawValue.startsWith(qrCodeCommentPrefix)) {
        const url = rawValue.substring(qrCodeCommentPrefix.length).replace("-->", "").trim();
        if (url.startsWith("https://")) {
          const promise = generateQRCodeNode(url).then((qrCodeNode) => {
            if (qrCodeNode) {
              nodesToAdd.push({
                index,
                parent,
                node: qrCodeNode
              });
            }
          });
          promises.push(promise);
        }
      }
    });
    await Promise.all(promises);
    for (const { index, parent, node } of nodesToAdd) {
      if (Array.isArray(parent.children)) {
        parent.children.splice(index + 1, 0, node);
      }
    }
  };
};
async function generateQRCodeNode(url) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url);
    const qrCodeNode = {
      type: "element",
      tagName: "figure",
      properties: {
        className: ["qrcode-figure"],
        style: "display: flex; flex-direction: row; align-items: center; margin: 0.5rem 0; break-inside: avoid;"
      },
      children: [
        {
          type: "element",
          tagName: "img",
          properties: {
            src: qrCodeDataURL,
            alt: `QR code for ${url}`,
            width: 70,
            height: 70,
            style: "width: 70px; height: 70px; flex-shrink: 0;"
          },
          children: []
        },
        {
          type: "element",
          tagName: "figcaption",
          properties: {
            style: "margin-left: 8px; word-break: break-all; overflow-wrap: anywhere; font-size: 0.7em;"
            // Sets space between the image and text
          },
          children: [
            {
              type: "element",
              tagName: "a",
              properties: {
                href: url
              },
              children: [
                {
                  type: "text",
                  value: url
                }
              ]
            }
          ]
        }
      ]
    };
    return qrCodeNode;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return null;
  }
}

const parseTitleForCodeMeta = (meta) => meta.split(" ").find((value) => value.startsWith("title:"))?.replace("title:", "");
const isTitleForComment = (comment) => typeof comment === "string" && comment.includes("<!-- title:");
const parseTitleForComment = (comment) => comment.replace(/<!-- title: (.*?) -->/, "$1");

const codeBlockApplyTitlePlugin = () => {
  return (tree) => {
    visit(
      tree,
      ["element", "raw"],
      (node, index, parent) => {
        if (
          // コメントのチェック
          node.type === "raw" && "value" in node && typeof node.value === "string" && isTitleForComment(node.value) && // 親のチェック
          index !== void 0 && parent && parent.children.length > index + 2
        ) {
          const titleText = parseTitleForComment(node.value);
          if (titleText) {
            const nextNode = parent.children[index + 2];
            if (nextNode && nextNode.tagName === "pre") {
              const titleElement = {
                type: "element",
                tagName: "div",
                properties: { className: ["embedCode"] },
                children: [
                  nextNode,
                  {
                    type: "element",
                    tagName: "div",
                    properties: {
                      className: "embedCodeCaption",
                      id: slug(`code-${titleText}`)
                    },
                    children: [{ type: "text", value: titleText }]
                  }
                ]
              };
              parent.children[index + 2] = titleElement;
            }
          }
        }
        const pre = node.type === "element" ? node : void 0;
        const code = pre?.children[0];
        if (
          // pre タグのチェック
          pre && pre.tagName === "pre" && // code タグのチェック
          code && code.type === "element" && code.tagName === "code" && // code タグのdataのチェック
          code.data && "meta" in code.data && typeof code.data.meta === "string" && // 親のチェック
          index !== void 0 && parent
        ) {
          const titleText = parseTitleForCodeMeta(code.data.meta);
          if (titleText) {
            const titleElement = {
              type: "element",
              tagName: "div",
              properties: { className: ["embedCode"] },
              children: [
                pre,
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: "embedCodeCaption",
                    id: slug(`code-${titleText}`, true)
                  },
                  children: [{ type: "text", value: titleText }]
                }
              ]
            };
            parent.children[index] = titleElement;
          }
        }
      }
    );
  };
};

const CUSTOM_ID_PATTERN = /\s*\{#([^}\s]+)\}\s*$/;
const headingCustomIdPlugin = () => {
  return (tree) => {
    visit(tree, "heading", (visited) => {
      const node = visited;
      const lastChild = node.children?.[node.children.length - 1];
      if (lastChild?.type !== "text") return;
      const textNode = lastChild;
      const matched = textNode.value.match(CUSTOM_ID_PATTERN);
      if (!matched) return;
      textNode.value = textNode.value.replace(CUSTOM_ID_PATTERN, "");
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id: matched[1] }
      };
    });
  };
};

const imageApplyAttributesFromTitlePlugin = () => {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "img" && node.properties?.title && typeof node.properties.title === "string") {
        const attributes = node.properties.title.split("|");
        for (const attr of attributes) {
          const [key, value] = attr.split("=");
          if (key && value) {
            if (key === "className") {
              if (typeof node.properties.className === "string") {
                node.properties.className += ` embedImage ${value}`;
              } else {
                node.properties.className = `embedImage ${value}`;
              }
            } else {
              node.properties[key] = value;
            }
          }
        }
        node.properties.title = void 0;
      }
      if (node.tagName === "img" && typeof index === "number" && parent && node.properties.src && typeof node.properties.src === "string" && node.properties.alt && typeof node.properties.alt === "string") {
        const figcaption = {
          type: "element",
          tagName: "figcaption",
          properties: {
            className: "embedImageCaption",
            id: slug(`image-${node.properties?.alt}`)
          },
          children: [{ type: "text", value: node.properties?.alt || "" }]
        };
        const figure = {
          type: "element",
          tagName: "figure",
          properties: {
            className: "embedImageFigure"
          },
          children: [node, figcaption]
        };
        parent.children.splice(index, 1, figure);
      }
    });
  };
};

const extractAttributes = (altText) => {
  const attributes = {};
  let cleanAltText = altText;
  const attributeParts = altText.split(",");
  for (const part of attributeParts) {
    const [key, value] = part.split(":");
    if (key && value) {
      attributes[key.trim()] = value.trim();
    } else {
      cleanAltText = part.trim();
    }
  }
  return [cleanAltText, attributes];
};
const imageAttributesToTitlePlugin = () => {
  return (tree) => {
    visit(tree, "image", (visited) => {
      const node = visited;
      if (!node.alt) return;
      const [cleanAlt, attributes] = extractAttributes(node.alt);
      node.alt = cleanAlt;
      node.title = Object.entries(attributes).map(([key, value]) => `${key}=${value}`).join("|");
    });
  };
};

const mermaidApplyTitlePlugin = () => {
  return (tree) => {
    visit(
      tree,
      ["element", "raw"],
      (node, index, parent) => {
        if (
          // コメントのチェック
          node.type === "raw" && "value" in node && typeof node.value === "string" && isTitleForComment(node.value) && // 親のチェック
          index !== void 0 && parent && parent.children.length > index + 2
        ) {
          const titleText = parseTitleForComment(node.value);
          if (titleText) {
            const nextNode = parent.children[index + 2];
            if (nextNode && nextNode.tagName === "img") {
              const figcaption = {
                type: "element",
                tagName: "figcaption",
                properties: {
                  id: slug(`mermaid-${titleText}`),
                  className: "embedImageCaption"
                },
                children: [{ type: "text", value: titleText }]
              };
              const figure = {
                type: "element",
                tagName: "figure",
                properties: {
                  className: "embedImageFigure"
                },
                children: [nextNode, figcaption]
              };
              parent.children[index + 2] = figure;
            }
          }
        }
      }
    );
  };
};

const tableApplyTitlePlugin = () => {
  return (tree) => {
    visit(
      tree,
      ["element", "raw"],
      (node, index, parent) => {
        if (
          // コメントのチェック
          node.type === "raw" && "value" in node && typeof node.value === "string" && isTitleForComment(node.value) && // 親のチェック
          index !== void 0 && parent && parent.children.length > index + 2
        ) {
          const titleText = parseTitleForComment(node.value);
          if (titleText) {
            const nextNode = parent.children[index + 2];
            if (nextNode && nextNode.tagName === "table") {
              nextNode.children.push({
                type: "element",
                tagName: "caption",
                properties: {
                  id: slug(`table-${titleText}`)
                },
                children: [{ type: "text", value: titleText }]
              });
            }
          }
        }
      }
    );
  };
};

const jiti = createJiti(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const handlebarCompileOptions = {
  noEscape: true
  // HTMLエスケープをしない
};
const cwd = process.cwd();
const vivliostyleConfig = "./vivliostyle.config.cjs";
const publicationJson = "./dist/publication.json";
const distDir = "./dist";
const docsDir = "./docs";
const lockFileDistPath = distDir + "/lockfile";
const utilitiesCssPath = __dirname + "/../src/tailwind-utilities.css";
const globalCssSrcDir = __dirname + "/../src";
const globalCssDistPath = distDir + "/global.css";
const customCssPath = "./custom.css";
const chapterTemplateHtmlPath = __dirname + "/../src/chapter-template.html";
const simpleChapterTemplateHtmlPath = __dirname + "/../src/simplechapter-template.html";
const appendixTitle = "Appendix";
const appendixDistPath = distDir + "/appendix.dist.html";
const appendixTemplateHtmlPath = __dirname + "/../src/appendix-template.html";
const colophonDistPath = distDir + "/colophon.dist.html";
const colophonTemplateHtmlPath = __dirname + "/../src/colophon-template.html";
const profileDistPath = distDir + "/profile.dist.html";
const profileTemplateHtmlPath = __dirname + "/../src/profile-template.html";
const introductionDocPath = docsDir + "/_introduction.md";
const finallyDocPath = docsDir + "/_finally.md";
const introductionDistPath = distDir + "/_introduction.dist.html";
const finallyDistPath = distDir + "/_finally.dist.html";
const introductionTemplateHtmlPath = __dirname + "/../src/introduction-template.html";
const simpleIntroductionTemplateHtmlPath = __dirname + "/../src/simpleintroduction-template.html";
const tocDistPath = distDir + "/toc.dist.html";
const coverTemplateHtmlPath = __dirname + "/../src/cover-template.html";
const frontCoverDistPath = distDir + "/front-cover.dist.html";
const backCoverDistPath = distDir + "/back-cover.dist.html";
const startCoverDistPath = distDir + "/start-cover.dist.html";
const endCoverDistPath = distDir + "/end-cover.dist.html";
const processorRehype = unified().use(remarkParse).use(remarkFrontmatter, { type: "yaml", marker: "-" }).use(() => (_tree, file) => {
  matter(file, { strip: true });
}).use(remarkGfm).use(simplePlantUML).use(imageAttributesToTitlePlugin).use(headingCustomIdPlugin).use(remarkRehype, { allowDangerousHtml: true }).use(imageApplyAttributesFromTitlePlugin).use(rehypeSlug).use(rehypeMermaid, {
  strategy: "img-png"
  // strategy: 'pre-mermaid'
}).use(codeBlockApplyTitlePlugin).use(mermaidApplyTitlePlugin).use(tableApplyTitlePlugin).use(rehypeShiki, {
  themes: {
    light: "min-light",
    dark: "min-light"
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
    transformerMetaWordHighlight()
  ]
}).use(rehypeAddQRToComments);
const processor = processorRehype.use(rehypeStringify, {
  allowDangerousHtml: true
});
const config = await jiti.import(process.cwd() + "/techbook.config.ts", { default: true });

const program = new Command();
program.name("techbook-template-cli").description("TechBook Template CLI utilities.").version((await import('./chunks/package.mjs')).version);
program.command("dev").description("techbook dev").option("-ph, --h3-port <port>", "h3 server port number", "3000").option("-ps, --sync-port <port>", "sync port number", "3001").option("-kdp, --kindle-direct-print", "kindle direct print mode", "false").option("-cc, --custom-css <customCss>", "custom css file name", customCssPath).action(
  async ({ h3Port, syncPort, customCss }) => {
    console.info("dev", h3Port, syncPort, customCss);
    const main = (await import('./chunks/main.mjs')).default;
    const writeGlobalCss = (await import('./chunks/css.mjs')).default;
    main();
    writeGlobalCss(customCss);
    (await import('chokidar')).watch(["docs/"]).on("change", async (event, path) => {
      console.info(event, path);
      main();
    });
    (await import('chokidar')).watch([customCss]).on("change", (event, path) => {
      console.info(event, path);
      writeGlobalCss(customCss);
    });
  }
);
program.command("build").description("techbook build").option("-kdp, --kindle-direct-print", "kindle direct print mode", "false").option("-cc, --custom-css <customCss>", "custom css file name", customCssPath).option("-vt, --vivliostyle-timeout <vivliostyleTimeout>", "vivliostyle build timeout (seconds)", "600").action(
  async ({ customCss, vivliostyleTimeout }) => {
    console.info("build", customCss, vivliostyleTimeout);
    const main = (await import('./chunks/main.mjs')).default;
    await main();
    (await import('./chunks/css.mjs')).default(customCss);
    (await import('cross-spawn')).default.sync("npx", ["--yes", "@vivliostyle/cli", "build", "--style", "./dist/global.css", "--timeout", vivliostyleTimeout], { stdio: "inherit" });
  }
);
program.command("viewer").description("techbook viewer").option("-p, --port <port>", "express server port number", "3000").action(async ({ port }) => {
  console.info("viewer");
  await (await import('./chunks/viewer.mjs')).default({ port: parseInt(port) });
});
program.command("browser").description("techbook browser").option("-p, --port <port>", "browser sync port number", "3001").option("-pp, --proxy-port <proxyPort>", "browser proxy port number", "3000").action(async ({ port, proxyPort }) => {
  console.info("browser");
  await (await import('wait-on')).default({
    interval: 500,
    resources: [
      "./dist/global.css",
      "./dist/lockfile"
    ]
  });
  const bs = await import('browser-sync');
  bs.init({
    ui: false,
    port: parseInt(port),
    files: [
      "dist/lockfile",
      "dist/global.css",
      "images/*"
    ],
    reloadDelay: 4e3,
    reloadThrottle: 4e3,
    startPath: "/index.html#src=/dist/publication.json&bookMode=true&renderAllPages=true&style=/dist/global.css",
    browser: "google chrome",
    injectChanges: false,
    proxy: {
      target: `localhost:${proxyPort}`,
      proxyReq: [
        (proxyReq) => {
          proxyReq.setHeader("X-Special-Proxy-Header", "foobar");
        }
      ],
      proxyRes: [
        (proxyRes, req, res) => {
          res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0"
          );
          res.setHeader("Pragma", "no-cache");
        }
      ]
    }
  });
});
program.parse();

export { introductionDocPath as A, processor as B, CUSTOM_ID_PATTERN as C, finallyDocPath as D, profileTemplateHtmlPath as E, simpleChapterTemplateHtmlPath as F, chapterTemplateHtmlPath as G, lockFileDistPath as H, utilitiesCssPath as I, globalCssDistPath as J, customCssPath as K, globalCssSrcDir as L, cwd as M, appendixTemplateHtmlPath as a, appendixTitle as b, appendixDistPath as c, colophonTemplateHtmlPath as d, config as e, colophonDistPath as f, coverTemplateHtmlPath as g, handlebarCompileOptions as h, frontCoverDistPath as i, backCoverDistPath as j, endCoverDistPath as k, docsDir as l, distDir as m, parseTitleForCodeMeta as n, isTitleForComment as o, processorRehype as p, parseTitleForComment as q, introductionDistPath as r, startCoverDistPath as s, tocDistPath as t, finallyDistPath as u, profileDistPath as v, vivliostyleConfig as w, publicationJson as x, simpleIntroductionTemplateHtmlPath as y, introductionTemplateHtmlPath as z };
