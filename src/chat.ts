import Handlebars from "handlebars";

export const chatRegisterHelper = () => {
  Handlebars.registerHelper(
    "chat",
    (...children) =>
      // 行頭の空白や空行を残すと、直前の箇条書きの続きとして Markdown に解釈され、
      // 吹き出しがリストの中に入ってインデントされる。行頭から書き、空行を挟まない
      new Handlebars.SafeString(
        `\n<ul class="chat">\n${children
          .slice(0, -1)
          .map((child) => String(child).trim())
          .join("\n")}\n</ul>\n`,
      ),
  );

  Handlebars.registerHelper(
    "chat-header",
    (title) =>
      new Handlebars.SafeString(`
  <li class="chat-header">
    <div>${title}</div>
  </li>
  `),
  );

  Handlebars.registerHelper(
    "chat-left",
    (message, name, className, faceiconPath) =>
      new Handlebars.SafeString(`
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
  `),
  );

  Handlebars.registerHelper(
    "chat-right",
    (message, name, className, faceiconPath) =>
      new Handlebars.SafeString(`
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
  `),
  );

  Handlebars.registerHelper(
    "repeat-chat-right",
    (message, className) =>
      new Handlebars.SafeString(`
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
  `),
  );

  Handlebars.registerHelper(
    "repeat-chat-left",
    (message, className) =>
      new Handlebars.SafeString(`
  <li class="chat-left-invisible">
    <div class="chat-faceicon">
      <img />
      <span class="chat-faceicon-name"></span>
    </div>
    <div class="chat-contents">
      <div class="${className}">
        <div class="trianle-left"></div>
        <div class="balloon-contents">${
          message.startsWith("http")
            ? `<a href="${message}" class="${className}" target="_blank">${message}</a>`
            : message
        }</div>
      </div>
    </div>
  </li>
  `),
  );
};
