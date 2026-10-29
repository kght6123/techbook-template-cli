import Handlebars from "handlebars";
import QRCode from "qrcode";

/**
 * QR を SVG の文字列にする。
 * Handlebars のヘルパーは同期で値を返す必要があるため、非同期の toDataURL ではなく
 * QRCode.create でセルの並びを受け取り、SVG を組み立てる。
 */
const qrSvg = (url: string): string => {
  // YouTube の短縮 URL（28 文字）は L なら 25×25 で収まり、M（29×29）より 1 マスが大きくなる。
  // 紙に印刷するだけで汚れや欠けを想定しないため、L で小さく刷っても読み取りやすさを優先する。
  const qr = QRCode.create(url, { errorCorrectionLevel: "L" });
  const n = qr.modules.size;
  const margin = 2;
  const size = n + margin * 2;
  let path = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.modules.get(y, x)) path += `M${x + margin} ${y + margin}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
};

/** YouTube の URL から動画 ID を取り出す。YouTube 以外なら null */
const youtubeId = (url: string): string | null => {
  const m =
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtube\.com\/(?:embed|shorts)\/([\w-]{11})/);
  return m ? m[1] : null;
};

const escape = Handlebars.Utils.escapeExpression;

/**
 * 動画を 1 つの図として差し込む。
 * {{video 'https://youtu.be/xxxx' '動画のタイトル' './../images/thumb.png'}}
 *
 * サムネイルの右側に動画への QR、左下に「▶ 動画」の小さなバッジを重ねる。
 * 中央の大きな再生マークは QR と入口が二重になるため使わない。
 * サムネイルと URL は動画へのリンクにする。紙では QR を読み取り、電子書籍ではクリックで動画を開ける。
 * サムネイルを省略すると、YouTube の URL ならそのサムネイルを使う。
 */
export const videoRegisterHelper = () => {
  Handlebars.registerHelper("video", (url: string, title: string, thumbnail?: unknown) => {
    const id = youtubeId(url);
    const thumb =
      typeof thumbnail === "string" && thumbnail !== ""
        ? thumbnail
        : id
          ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
          : "";
    return new Handlebars.SafeString(`
<figure class="video-figure">
<a class="video-link" href="${escape(url)}">
<span class="video-thumb">
${thumb ? `<img class="video-thumb-image" src="${escape(thumb)}" alt="" />` : ""}
<span class="video-badge" aria-hidden="true">動画</span>
<span class="video-qr">${qrSvg(url)}</span>
</span>
</a>
<figcaption><span class="video-title">${escape(title)}</span><a class="video-url" href="${escape(url)}">${escape(url)}</a></figcaption>
</figure>
`);
  });
};
