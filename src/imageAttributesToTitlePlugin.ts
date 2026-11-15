import { Plugin } from "unified";
import { Node } from "unist";
import { visit } from "unist-util-visit";

interface ImageNode extends Node {
  type: "image";
  alt?: string;
  title?: string;
  url: string;
}

const extractAttributes = (
  altText: string,
): [string, Record<string, string>] => {
  const attributes: Record<string, string> = {};
  const altParts: string[] = [];

  for (const part of altText.split(",")) {
    // 「className:qrcode」の形だけを属性と見なす。
    // 「https://...」のような URL は「:」の後が「//」で始まるので、alt の文字として残す
    const match = part.trim().match(/^([A-Za-z][\w-]*):(?!\/\/)(.+)$/);
    if (match) {
      attributes[match[1]] = match[2].trim();
    } else {
      // この部分が画像の実際のaltテキストとして扱われます
      altParts.push(part.trim());
    }
  }
  return [altParts.join(","), attributes];
};

const imageAttributesToTitlePlugin: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "image", (visited) => {
      const node = visited as ImageNode;
      if (!node.alt) return;
      const [cleanAlt, attributes] = extractAttributes(node.alt);
      node.alt = cleanAlt;
      node.title = Object.entries(attributes)
        .map(([key, value]) => `${key}=${value}`)
        .join("|");
    });
  };
};

export default imageAttributesToTitlePlugin;
