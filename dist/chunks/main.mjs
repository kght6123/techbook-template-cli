import fs from 'fs';
import Handlebars from 'handlebars';
import { a as appendixTemplateHtmlPath, h as handlebarCompileOptions, b as appendixTitle, c as appendixDistPath, d as colophonTemplateHtmlPath, e as config, f as colophonDistPath, g as coverTemplateHtmlPath, i as frontCoverDistPath, j as backCoverDistPath, s as startCoverDistPath, k as endCoverDistPath, l as docsDir, m as distDir, p as processorRehype, n as githubSluggerExports, o as parseTitleForCodeMeta, q as isTitleForComment, r as parseTitleForComment, t as tocDistPath, u as introductionDistPath, v as finallyDistPath, w as profileDistPath, x as vivliostyleConfig, y as publicationJson, z as simpleIntroductionTemplateHtmlPath, A as introductionTemplateHtmlPath, B as introductionDocPath, C as processor, D as finallyDocPath, E as profileTemplateHtmlPath, F as simpleChapterTemplateHtmlPath, G as chapterTemplateHtmlPath, H as lockFileDistPath } from '../shared/techbook-template-cli.DuMOLJA7.mjs';
import path from 'path';
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
import 'jiti';

const appendixMap = /* @__PURE__ */ new Map();
const templateHtml$1 = Handlebars.compile(
  fs.readFileSync(appendixTemplateHtmlPath).toString(),
  handlebarCompileOptions
);
const createHyperLink = (filePath) => filePath.replaceAll(".md", ".html").replaceAll("dist/", "");
const appendixRegisterHelper = () => {
  Handlebars.registerHelper(
    "appendix",
    (filePath, id, text) => {
      appendixMap.set(`${createHyperLink(filePath)}#${id}`, text);
      return new Handlebars.SafeString(
        `<span id="${id}" class="appendix">&nbsp;${text}&nbsp;</span>`
      );
    }
  );
  Handlebars.registerHelper(
    "appendix-hidden",
    (filePath, id, text) => {
      appendixMap.set(`${createHyperLink(filePath)}#${id}`, text);
      return new Handlebars.SafeString(`<span id="${id}"></span>`);
    }
  );
};
const appendixCompile = () => {
  const sortedByAppendixMap = new Map(
    [...appendixMap].sort((e1, e2) => e1[1].localeCompare(e2[1]))
  );
  const sortedByAppendixMapKeys = [...sortedByAppendixMap.keys()];
  if (sortedByAppendixMap.size < 1) return;
  const html = templateHtml$1({
    body: `
    <h1 class="text-2xl font-bold p-0 block mb-3">${appendixTitle}</h1>
    <div id="appendix">
      ${sortedByAppendixMapKeys.map(
      (key, index) => `<a class="print--text-black after--target-counter-page after--text-[8px] block no-underline hover:underline text-sm py-1" href="${key}">${sortedByAppendixMap.get(
        key
      )}</a>`
    ).join("")}
    </div>`,
    inlineStyle: ""
  });
  fs.writeFileSync(appendixDistPath, html);
};

const pageBreakRegisterHelper = () => {
  Handlebars.registerHelper(
    "page-break",
    () => new Handlebars.SafeString(`<div class="break-bf-page"></div>`)
  );
  Handlebars.registerHelper(
    "left-break",
    () => new Handlebars.SafeString(`<div class="break-bf-left"></div>`)
  );
  Handlebars.registerHelper(
    "right-break",
    () => new Handlebars.SafeString(`<div class="break-bf-right"></div>`)
  );
};

const chatRegisterHelper = () => {
  Handlebars.registerHelper(
    "chat",
    (...children) => new Handlebars.SafeString(`
  <ul class="chat">
    ${children.length > 0 ? children.slice(0, children.length - 1).join("") : ""}
  </ul>
  `)
  );
  Handlebars.registerHelper(
    "chat-header",
    (title) => new Handlebars.SafeString(`
  <li class="chat-header">
    <div>${title}</div>
  </li>
  `)
  );
  Handlebars.registerHelper(
    "chat-left",
    (message, name, className, faceiconPath) => new Handlebars.SafeString(`
  <li class="chat-left">
    <div class="chat-faceicon">
      <img src="../images/${faceiconPath}" />
      <span class="chat-faceicon-name">${name}</span>
    </div>
    <div class="chat-contents">
      <div class="${className}">
        <div class="trianle-left"></div>
        <div class="balloon-contents">${message}</div>
      </div>
    </div>
  </li>
  `)
  );
  Handlebars.registerHelper(
    "chat-right",
    (message, name, className, faceiconPath) => new Handlebars.SafeString(`
  <li class="chat-right">
    <div class="chat-contents">
      <div class="${className}">
        <div class="trianle-right"></div>
        <div class="balloon-contents">${message}</div>
      </div>
    </div>
    <div class="chat-faceicon">
      <img src="../images/${faceiconPath}" />
      <span class="chat-faceicon-name">${name}</span>
    </div>
  </li>
  `)
  );
  Handlebars.registerHelper(
    "repeat-chat-right",
    (message, className) => new Handlebars.SafeString(`
  <li class="chat-right-invisible">
    <div class="chat-contents">
      <div class="${className}">
      <div class="trianle-right"></div>
      <div class="balloon-contents">${message}</div>
    </div>
    </div>
    <div class="chat-faceicon">
      <img />
      <span class="chat-faceicon-name"></span>
    </div>
  </li>
  `)
  );
  Handlebars.registerHelper(
    "repeat-chat-left",
    (message, className) => new Handlebars.SafeString(`
  <li class="chat-left-invisible">
    <div class="chat-faceicon">
      <img />
      <span class="chat-faceicon-name"></span>
    </div>
    <div class="chat-contents">
      <div class="${className}">
        <div class="trianle-left"></div>
        <div class="balloon-contents">${message.startsWith("http") ? `<a href="${message}" class="${className}" target="_blank">${message}</a>` : message}</div>
      </div>
    </div>
  </li>
  `)
  );
};

const colophonCompile = () => {
  const colophonTemplateHtml = Handlebars.compile(
    fs.readFileSync(colophonTemplateHtmlPath).toString(),
    handlebarCompileOptions
  );
  const html = colophonTemplateHtml({ config });
  fs.writeFileSync(colophonDistPath, html);
};

const templateHtml = Handlebars.compile(
  fs.readFileSync(coverTemplateHtmlPath).toString(),
  handlebarCompileOptions
);
const coverCompile = (isKDP) => {
  const edition = config.editions[config.editions.length - 1];
  {
    const html = templateHtml({
      kind: "front",
      coverImage: isKDP ? void 0 : config.cover.front,
      title: config.title,
      publisher: config.publisher,
      author: config.author,
      lastEdition: edition
    });
    fs.writeFileSync(frontCoverDistPath, html);
  }
  {
    const html = templateHtml({
      kind: "back",
      coverImage: isKDP ? void 0 : config.cover.back,
      title: config.title,
      publisher: config.publisher,
      author: config.author,
      lastEdition: edition
    });
    fs.writeFileSync(backCoverDistPath, html);
  }
  {
    const html = templateHtml({
      kind: "start",
      coverImage: isKDP ? void 0 : config.cover.start,
      title: config.title,
      publisher: config.publisher,
      author: config.author,
      lastEdition: edition
    });
    fs.writeFileSync(startCoverDistPath, html);
  }
  {
    const html = templateHtml({
      kind: "end",
      coverImage: isKDP ? void 0 : config.cover.end,
      title: config.title,
      publisher: config.publisher,
      author: config.author,
      lastEdition: edition
    });
    fs.writeFileSync(endCoverDistPath, html);
  }
};

const docsHeadingList = await Promise.all(
  fs.readdirSync(docsDir, { withFileTypes: true }).filter((dirent) => dirent.isFile()).map((dirent) => {
    const src = path.join(docsDir, dirent.name);
    const srcParsed = path.parse(src);
    const html = `${srcParsed.name}.dist.html`;
    const dist = path.join(distDir, `${srcParsed.name}.dist.html`);
    return { src, html, dist, fileName: srcParsed.name };
  }).filter(
    ({ fileName }) => fileName !== "_introduction" && fileName !== "_finally"
  ).map(async ({ src, html, dist, fileName }) => {
    const input = fs.readFileSync(src, "utf-8");
    const root = processorRehype.parse(input);
    const headings = root.children.filter(
      (node) => node.type === "heading" && // frontmatterをh2として扱わない
      !(node.depth === 2 && node.position?.start.line <= 2)
    ).map((node) => {
      const heading = node;
      heading.text = heading.children?.[0]?.value;
      heading.id = githubSluggerExports.slug(heading.text, false);
      return heading;
    });
    const captions = root.children.map((node) => {
      if (node.type === "code" && node.meta) {
        const title = parseTitleForCodeMeta(node.meta);
        return { title, id: githubSluggerExports.slug(title, false) };
      }
      if (node.type === "html" && isTitleForComment(node.value)) {
        const title = parseTitleForComment(node.value);
        return { title, id: githubSluggerExports.slug(title, false) };
      }
      if (node.type === "paragraph" && node.children?.some((node2) => node2.type === "image")) {
        const image = node.children?.find((node2) => node2.type === "image");
        const alt = image?.alt?.split(",")?.[0];
        return { title: alt, id: githubSluggerExports.slug(alt, false) };
      }
      return void 0;
    }).filter((caption) => caption?.title);
    return { src, html, headings, dist, fileName, captions };
  })
);
const rightPillarChapterList = [
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 },
  { html: "", chapterCount: 0 }
];
docsHeadingList.forEach(({ html }, index) => {
  rightPillarChapterList[index] = { html, chapterCount: index + 1 };
});
const tocCompile = () => {
  const html = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body id="toc-body">
    <h1>Table of Contents</h1>
    <nav id="toc">
      <ol class="list-none p-0 mb-3">
        <li>
          <a
            href="_introduction.dist.html"
            class="print--text-black after--target-counter-page after--text-[10px] flex flex-row justify-between no-underline hover:underline mt-4 items-center"
          >
            <div class="flex flex-col">
              <div class="text-2xl font-bold" data-href="_introduction.dist.html">\u306F\u3058\u3081\u306B</div>
            </div>
          </a>
        </li>
        ${docsHeadingList.map(({ html: html2, headings }) => {
    return headings.map((heading) => {
      const text = heading.children?.[0]?.value;
      const id = githubSluggerExports.slug(text, false);
      return `<li>
            <a
              href="${html2}#${id}"
              class="print--text-black after--target-counter-page after--text-[10px] flex flex-row justify-between no-underline hover:underline ${heading.depth === 1 ? "mt-4 items-center" : "mt-1 items-end"}"
            >
              <div class="flex flex-col">
                <div class="${heading.depth === 1 ? "text-2xl font-bold" : heading.depth === 2 ? "header2 text-lg font-semibold pl-4" : heading.depth === 3 ? "header3 text-base font-base pl-8" : heading.depth === 4 ? "header4 text-base font-base pl-12" : heading.depth === 5 ? "header5 text-base font-base pl-16" : ""}" data-href="${html2}#${id}">${text}</div>
                ${heading.depth === 1 ? `<div class="header1 pl-3 text-[10px] leading-loose font-bold" data-href="${html2}#${id}"></div>` : ""}
              </div>
            </a>
          </li>`;
    }).join("");
  }).join("")}
        <li>
          <a
            href="_finally.dist.html"
            class="print--text-black after--target-counter-page after--text-[10px] flex flex-row justify-between no-underline hover:underline mt-4 items-center"
          >
            <div class="flex flex-col">
              <div class="text-2xl font-bold" data-href="_finally.dist.html">\u3055\u3044\u3054\u306B</div>
            </div>
          </a>
        </li>
        ${config.appendix !== false ? `
        <li>
          <a
            href="appendix.dist.html"
            class="print--text-black after--target-counter-page after--text-[10px] flex flex-row justify-between no-underline hover:underline mt-4 items-center"
          >
            <div class="flex flex-col">
              <div class="text-2xl font-bold" data-href="appendix.dist.html">Appendix</div>
            </div>
          </a>
        </li>
        ` : ""}
      </ol>
    </nav>
    <div class="break-bf-left"></div>
  </body>
</html>`;
  fs.writeFileSync(tocDistPath, html);
};

const docrefRegisterHelper = () => {
  Handlebars.registerHelper("chapref", (filePathPrefix) => {
    const toc = docsHeadingList.find(
      (toc2) => toc2.html.startsWith(filePathPrefix)
    );
    if (toc === void 0) {
      console.error(`chapref: ${filePathPrefix} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`);
      return "";
    }
    const { html, headings } = toc;
    const heading = headings.find((heading2) => heading2.depth === 1);
    return new Handlebars.SafeString(`
<a class="chapref" href="${html}#${heading.id}">${heading.text}</a>
`);
  });
  Handlebars.registerHelper("headref", (filePathPrefix, titleOrId) => {
    const toc = docsHeadingList.find(
      (toc2) => toc2.html.startsWith(filePathPrefix)
    );
    if (toc === void 0) {
      console.error(`headref: ${filePathPrefix} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`);
      return "";
    }
    const heading = toc.headings.find(
      ({ text, id: id2 }) => text.startsWith(titleOrId) || id2.startsWith(titleOrId)
    );
    if (heading === void 0) {
      console.error(
        `headref: ${filePathPrefix} \u306B ${titleOrId} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`
      );
      return "";
    }
    const { html, headings } = toc;
    const { text: ctitle } = headings.find((heading2) => heading2.depth === 1);
    const { id, text: htitle } = heading;
    return new Handlebars.SafeString(`
<a class="h2ref" href="${html}#${id}">${ctitle}<a href="${html}#${id}" class="h2title">${htitle}</a></a>
`);
  });
  Handlebars.registerHelper("imageref", (filePathPrefix, titleOrId) => {
    const toc = docsHeadingList.find(
      (toc2) => toc2.html.startsWith(filePathPrefix)
    );
    if (toc === void 0) {
      console.error(`imageref: ${filePathPrefix} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`);
      return "";
    }
    const caption = toc.captions.find(
      ({ title, id }) => title.startsWith(titleOrId) || id.startsWith(titleOrId)
    );
    if (caption === void 0) {
      console.error(
        `imageref: ${filePathPrefix} \u306B ${titleOrId} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`
      );
      return "";
    }
    const { html } = toc;
    return new Handlebars.SafeString(
      `<a class="imageref" href="${html}#image-${caption.id}">${caption.title}</a>`
    );
  });
  Handlebars.registerHelper("coderef", (filePathPrefix, titleOrId) => {
    const toc = docsHeadingList.find(
      (toc2) => toc2.html.startsWith(filePathPrefix)
    );
    if (toc === void 0) {
      console.error(`coderef: ${filePathPrefix} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`);
      return "";
    }
    const caption = toc.captions.find(
      ({ title, id }) => title.startsWith(titleOrId) || id.startsWith(titleOrId)
    );
    if (caption === void 0) {
      console.error(
        `coderef: ${filePathPrefix} \u306B ${titleOrId} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`
      );
      return "";
    }
    const { html } = toc;
    return new Handlebars.SafeString(
      `<a class="coderef" href="${html}#code-${caption.id}">${caption.title}</a>`
    );
  });
  Handlebars.registerHelper("tableref", (filePathPrefix, titleOrId) => {
    const toc = docsHeadingList.find(
      (toc2) => toc2.html.startsWith(filePathPrefix)
    );
    if (toc === void 0) {
      console.error(`tableref: ${filePathPrefix} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`);
      return "";
    }
    const caption = toc.captions.find(
      ({ title, id }) => title.startsWith(titleOrId) || id.startsWith(titleOrId)
    );
    if (caption === void 0) {
      console.error(
        `tableref: ${filePathPrefix} \u306B ${titleOrId} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002`
      );
      return "";
    }
    const { html } = toc;
    return new Handlebars.SafeString(
      `<a class="tableref" href="${html}#table-${caption.id}">${caption.title}</a>`
    );
  });
};

const footnoteRegisterHelper = () => {
  Handlebars.registerHelper(
    "footnote-inline",
    (footnote) => new Handlebars.SafeString(`
<span class="footnote-inline">(<span>${footnote}</span>)</span>
`)
  );
  Handlebars.registerHelper(
    "footnote",
    (footnote) => new Handlebars.SafeString(`
<span class="footnote">${footnote}</span>
`)
  );
};

function generateVivlioStyleConfig({
  isKDP
}) {
  const { title, author, size } = config;
  const docsEntryList = docsHeadingList.map(({ headings, dist }) => ({
    path: dist,
    title: headings?.find((v) => v.depth === 1)?.text
  }));
  const _config = {
    title,
    author,
    language: "ja",
    size,
    entryContext: ".",
    entry: [
      isKDP ? void 0 : frontCoverDistPath,
      startCoverDistPath,
      tocDistPath,
      introductionDistPath,
      ...docsEntryList,
      finallyDistPath,
      config.appendix !== false ? appendixDistPath : void 0,
      profileDistPath,
      colophonDistPath,
      endCoverDistPath,
      isKDP ? void 0 : backCoverDistPath
    ].filter((v) => !!v),
    workspaceDir: ".vivliostyle",
    toc: false
  };
  fs.writeFileSync(
    vivliostyleConfig,
    `module.exports = ${JSON.stringify(_config, null, 0).replace(
      /"([^"]+)":/g,
      "$1:"
    )}`
  );
  const readingOrderList = docsHeadingList.map(({ headings, dist }) => ({
    url: dist,
    name: headings?.find((v) => v.depth === 1)?.text
  }));
  const manifest = {
    "@context": ["https://schema.org", "https://www.w3.org/ns/pub-context"],
    type: "Book",
    conformsTo: "https://github.com/kght6123/techbook-template",
    name: title,
    author,
    inLanguage: "ja",
    dateModified: (/* @__PURE__ */ new Date()).toISOString(),
    readingOrder: [
      isKDP ? void 0 : { url: frontCoverDistPath },
      { url: startCoverDistPath },
      { url: tocDistPath },
      { url: introductionDistPath },
      ...readingOrderList,
      { url: finallyDistPath },
      config.appendix !== false ? { url: appendixDistPath } : void 0,
      { url: profileDistPath },
      { url: colophonDistPath },
      { url: endCoverDistPath },
      isKDP ? void 0 : { url: backCoverDistPath }
    ].filter((v) => !!v),
    resources: [],
    links: []
  };
  fs.writeFileSync(publicationJson, JSON.stringify(manifest));
}

const introductionTemplateHtml = Handlebars.compile(
  fs.readFileSync(config.size === "105mm 173mm" ? simpleIntroductionTemplateHtmlPath : introductionTemplateHtmlPath).toString(),
  handlebarCompileOptions
);
const introductionCompile = () => {
  const markdown = fs.readFileSync(introductionDocPath);
  const templateMarkdown = Handlebars.compile(
    markdown.toString(),
    handlebarCompileOptions
  );
  const result = templateMarkdown({ filePath: introductionDistPath });
  processor.process(result).then((v) => {
    const html = introductionTemplateHtml({
      body: v.toString(),
      inlineStyle: "",
      slug: "_introduction",
      title: "\u306F\u3058\u3081\u306B",
      distPath: "_introduction",
      rightPillarChapterList,
      // TODO: この目次リストもPlugin化してdataへ格納すると良いかも
      data: v.data
    });
    fs.writeFileSync(introductionDistPath, html);
  });
};
const finallyCompile = () => {
  const markdown = fs.readFileSync(finallyDocPath);
  const templateMarkdown = Handlebars.compile(
    markdown.toString(),
    handlebarCompileOptions
  );
  const result = templateMarkdown({ filePath: finallyDistPath });
  processor.process(result).then((v) => {
    const html = introductionTemplateHtml({
      body: v.toString(),
      inlineStyle: "",
      slug: "_finally",
      title: "\u3055\u3044\u3054\u306B",
      distPath: "_finally",
      rightPillarChapterList,
      // TODO: この目次リストもPlugin化してdataへ格納すると良いかも
      data: v.data
    });
    fs.writeFileSync(finallyDistPath, html);
  });
};

const profileCompile = () => {
  const profileTemplateHtml = Handlebars.compile(
    fs.readFileSync(profileTemplateHtmlPath).toString(),
    handlebarCompileOptions
  );
  const html = profileTemplateHtml({ config });
  fs.writeFileSync(profileDistPath, html);
};

Handlebars.registerHelper(
  "split",
  (value, index, separator, limit) => value?.split(separator, limit)?.[index]
);

const __switch_stack__ = [];
Handlebars.registerHelper("switch", function(value, options) {
  __switch_stack__.push({
    switch_match: false,
    switch_value: value
  });
  const html = options.fn(this);
  __switch_stack__.pop();
  return html;
});
Handlebars.registerHelper("case", function(...caseValues) {
  const options = caseValues.pop();
  const stack = __switch_stack__[__switch_stack__.length - 1];
  if (stack.switch_match || // 完全一致を許可する
  (caseValues.some((v) => v === stack.switch_value) || // 前方一致を許可する
  caseValues.some(
    (v) => v !== "" && stack.switch_value !== "" && typeof v === "string" && typeof stack.switch_value === "string" && v.startsWith(stack.switch_value)
  ) || // 後方一致を許可する
  caseValues.some(
    (v) => v !== "" && stack.switch_value !== "" && typeof v === "string" && typeof stack.switch_value === "string" && v.endsWith(stack.switch_value)
  )) === false) {
    return "";
  }
  stack.switch_match = true;
  return options.fn(this);
});
Handlebars.registerHelper("default", function(options) {
  const stack = __switch_stack__[__switch_stack__.length - 1];
  if (!stack.switch_match) {
    return options.fn(this);
  }
});

function main() {
  const isKDP = process.argv.indexOf("-kdp") >= 0;
  if (isKDP) console.log("run kindle direct publishing mode.");
  chatRegisterHelper();
  docrefRegisterHelper();
  appendixRegisterHelper();
  footnoteRegisterHelper();
  pageBreakRegisterHelper();
  const chapterTemplateHtml = Handlebars.compile(
    fs.readFileSync(
      config.size === "105mm 173mm" ? simpleChapterTemplateHtmlPath : chapterTemplateHtmlPath
    ).toString(),
    handlebarCompileOptions
  );
  generateVivlioStyleConfig({ isKDP });
  const preCompile = (src, dist, slug, headings) => {
    const h1Heading = headings?.find((v) => v.depth === 1);
    const h2HeadingList = headings?.map((v) => v.depth === 2 && v).filter((v) => v);
    const markdown = fs.readFileSync(src);
    const templateMarkdown = Handlebars.compile(
      markdown.toString(),
      handlebarCompileOptions
    );
    const result = templateMarkdown({ filePath: dist });
    processor.process(result).then((v) => {
      const html = chapterTemplateHtml({
        body: v.toString(),
        inlineStyle: "",
        slug,
        title: h1Heading?.text,
        h2HeadingList,
        distPath: dist,
        rightPillarChapterList,
        // TODO: この目次リストもPlugin化してdataへ格納すると良いかも
        data: v.data
      });
      fs.writeFileSync(dist, html);
    });
  };
  console.log("start preCompile.");
  coverCompile({ isKDP });
  tocCompile();
  introductionCompile();
  finallyCompile();
  colophonCompile();
  profileCompile();
  console.log("complete!!! init coverCompile, tocCompile.");
  for (const { src, dist, fileName, headings } of docsHeadingList) {
    preCompile(src, dist, fileName, headings);
    console.log("complete!!! init preCompile.", src, dist);
  }
  if (config.appendix !== false) {
    appendixCompile();
    console.log("complete!!! init appendixCompile.");
  }
  fs.writeFileSync(lockFileDistPath, "");
  console.log("complete!!! all process.");
}

export { main as default };
