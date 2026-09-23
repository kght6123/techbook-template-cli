import { Plugin } from "unified";
import { Node } from "unist";
import { visit } from "unist-util-visit";

interface TextNode extends Node {
  type: "text";
  value: string;
}

interface HeadingNode extends Node {
  type: "heading";
  depth: number;
  children?: Node[];
  data?: {
    hProperties?: Record<string, string>;
  };
}

/** 見出しの末尾に書かれた `{#id}` 形式の明示的なID */
export const CUSTOM_ID_PATTERN = /\s*\{#([^}\s]+)\}\s*$/;

/**
 * 見出しの末尾の `{#id}` を取り除き、その値をHTMLのid属性として扱う。
 *
 * remark-rehypeがdata.hPropertiesをHTMLの属性へ引き継ぐため、
 * rehype-slugは既にidを持つ見出しには手を加えず、明示的なIDが優先される。
 */
const headingCustomIdPlugin: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", (visited) => {
      const node = visited as HeadingNode;
      const lastChild = node.children?.[node.children.length - 1];
      if (lastChild?.type !== "text") return;

      const textNode = lastChild as TextNode;
      const matched = textNode.value.match(CUSTOM_ID_PATTERN);
      if (!matched) return;

      textNode.value = textNode.value.replace(CUSTOM_ID_PATTERN, "");
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id: matched[1] },
      };
    });
  };
};

export default headingCustomIdPlugin;
