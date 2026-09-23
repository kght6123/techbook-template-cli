import { Element } from "hast";
import { Plugin } from "unified";
import { Node, Parent } from "unist";
import { visit } from "unist-util-visit";

import { slug } from "github-slugger";
import {
  isTitleForComment,
  parseTitleForCodeMeta,
  parseTitleForComment,
} from "./utility";

const codeBlockApplyTitlePlugin: Plugin = () => {
  return (tree: Node) => {
    visit(
      tree as Parent,
      ["element", "raw"],
      (node, index, parent) => {
        // コメントからタイトルを取得して、コードブロックに適用する
        if (
          // コメントのチェック
          node.type === "raw" &&
          "value" in node &&
          typeof node.value === "string" &&
          isTitleForComment(node.value) &&
          // 親のチェック
          index !== undefined &&
          parent &&
          parent.children.length > index + 2
        ) {
          const titleText = parseTitleForComment(node.value);
          if (titleText) {
            const nextNode = parent.children[index + 2] as Element;
            if (nextNode && nextNode.tagName === "pre") {
              // 次の要素がpreの場合、タイトルを適用する
              const titleElement: Element = {
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
                      id: slug(`code-${titleText}`),
                    },
                    children: [{ type: "text", value: titleText }],
                  },
                ],
              };
              parent.children[index + 2] = titleElement;
            }
          }
        }
        // コードブロックのmetaからタイトルを取得して、コードブロックに適用する
        const pre = node.type === "element" ? (node as Element) : undefined;
        const code = pre?.children[0];
        if (
          // pre タグのチェック
          pre &&
          pre.tagName === "pre" &&
          // code タグのチェック
          code &&
          code.type === "element" &&
          code.tagName === "code" &&
          // code タグのdataのチェック
          code.data &&
          "meta" in code.data &&
          typeof code.data.meta === "string" &&
          // 親のチェック
          index !== undefined &&
          parent
        ) {
          const titleText = parseTitleForCodeMeta(code.data.meta);
          if (titleText) {
            const titleElement: Element = {
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
                    id: slug(`code-${titleText}`, true),
                  },
                  children: [{ type: "text", value: titleText }],
                },
              ],
            };
            parent.children[index] = titleElement;
          }
        }
      },
    );
  };
};

export default codeBlockApplyTitlePlugin;
