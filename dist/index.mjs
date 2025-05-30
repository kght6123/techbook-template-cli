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
import { createJiti } from 'jiti';
import path from 'path';
import { fileURLToPath } from 'url';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var convert_1;
var hasRequiredConvert;

function requireConvert () {
	if (hasRequiredConvert) return convert_1;
	hasRequiredConvert = 1;

	convert_1 = convert;

	function convert(test) {
	  if (test == null) {
	    return ok
	  }

	  if (typeof test === 'string') {
	    return typeFactory(test)
	  }

	  if (typeof test === 'object') {
	    return 'length' in test ? anyFactory(test) : allFactory(test)
	  }

	  if (typeof test === 'function') {
	    return test
	  }

	  throw new Error('Expected function, string, or object as test')
	}

	// Utility assert each property in `test` is represented in `node`, and each
	// values are strictly equal.
	function allFactory(test) {
	  return all

	  function all(node) {
	    var key;

	    for (key in test) {
	      if (node[key] !== test[key]) return false
	    }

	    return true
	  }
	}

	function anyFactory(tests) {
	  var checks = [];
	  var index = -1;

	  while (++index < tests.length) {
	    checks[index] = convert(tests[index]);
	  }

	  return any

	  function any() {
	    var index = -1;

	    while (++index < checks.length) {
	      if (checks[index].apply(this, arguments)) {
	        return true
	      }
	    }

	    return false
	  }
	}

	// Utility to convert a string into a function which checks a given node’s type
	// for said string.
	function typeFactory(test) {
	  return type

	  function type(node) {
	    return Boolean(node && node.type === test)
	  }
	}

	// Utility to return true.
	function ok() {
	  return true
	}
	return convert_1;
}

var color_1;
var hasRequiredColor;

function requireColor () {
	if (hasRequiredColor) return color_1;
	hasRequiredColor = 1;
	color_1 = color;
	function color(d) {
	  return '\u001B[33m' + d + '\u001B[39m'
	}
	return color_1;
}

var unistUtilVisitParents;
var hasRequiredUnistUtilVisitParents;

function requireUnistUtilVisitParents () {
	if (hasRequiredUnistUtilVisitParents) return unistUtilVisitParents;
	hasRequiredUnistUtilVisitParents = 1;

	unistUtilVisitParents = visitParents;

	var convert = requireConvert();
	var color = requireColor();

	var CONTINUE = true;
	var SKIP = 'skip';
	var EXIT = false;

	visitParents.CONTINUE = CONTINUE;
	visitParents.SKIP = SKIP;
	visitParents.EXIT = EXIT;

	function visitParents(tree, test, visitor, reverse) {
	  var step;
	  var is;

	  if (typeof test === 'function' && typeof visitor !== 'function') {
	    reverse = visitor;
	    visitor = test;
	    test = null;
	  }

	  is = convert(test);
	  step = reverse ? -1 : 1;

	  factory(tree, null, [])();

	  function factory(node, index, parents) {
	    var value = typeof node === 'object' && node !== null ? node : {};
	    var name;

	    if (typeof value.type === 'string') {
	      name =
	        typeof value.tagName === 'string'
	          ? value.tagName
	          : typeof value.name === 'string'
	          ? value.name
	          : undefined;

	      visit.displayName =
	        'node (' + color(value.type + (name ? '<' + name + '>' : '')) + ')';
	    }

	    return visit

	    function visit() {
	      var grandparents = parents.concat(node);
	      var result = [];
	      var subresult;
	      var offset;

	      if (!test || is(node, index, parents[parents.length - 1] || null)) {
	        result = toResult(visitor(node, parents));

	        if (result[0] === EXIT) {
	          return result
	        }
	      }

	      if (node.children && result[0] !== SKIP) {
	        offset = (reverse ? node.children.length : -1) + step;

	        while (offset > -1 && offset < node.children.length) {
	          subresult = factory(node.children[offset], offset, grandparents)();

	          if (subresult[0] === EXIT) {
	            return subresult
	          }

	          offset =
	            typeof subresult[1] === 'number' ? subresult[1] : offset + step;
	        }
	      }

	      return result
	    }
	  }
	}

	function toResult(value) {
	  if (value !== null && typeof value === 'object' && 'length' in value) {
	    return value
	  }

	  if (typeof value === 'number') {
	    return [CONTINUE, value]
	  }

	  return [value]
	}
	return unistUtilVisitParents;
}

var unistUtilVisit;
var hasRequiredUnistUtilVisit;

function requireUnistUtilVisit () {
	if (hasRequiredUnistUtilVisit) return unistUtilVisit;
	hasRequiredUnistUtilVisit = 1;

	unistUtilVisit = visit;

	var visitParents = requireUnistUtilVisitParents();

	var CONTINUE = visitParents.CONTINUE;
	var SKIP = visitParents.SKIP;
	var EXIT = visitParents.EXIT;

	visit.CONTINUE = CONTINUE;
	visit.SKIP = SKIP;
	visit.EXIT = EXIT;

	function visit(tree, test, visitor, reverse) {
	  if (typeof test === 'function' && typeof visitor !== 'function') {
	    reverse = visitor;
	    visitor = test;
	    test = null;
	  }

	  visitParents(tree, test, overload, reverse);

	  function overload(node, parents) {
	    var parent = parents[parents.length - 1];
	    var index = parent ? parent.children.indexOf(node) : null;
	    return visitor(node, index, parent)
	  }
	}
	return unistUtilVisit;
}

var unistUtilVisitExports = requireUnistUtilVisit();
const visit = /*@__PURE__*/getDefaultExportFromCjs(unistUtilVisitExports);

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
        style: "display: flex; align-items: center; justify-content: center;"
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
            style: "width: 70px; height: 70px;"
          },
          children: []
        },
        {
          type: "element",
          tagName: "figcaption",
          properties: {
            style: "margin-left: 5px;"
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

var regex;
var hasRequiredRegex;

function requireRegex () {
	if (hasRequiredRegex) return regex;
	hasRequiredRegex = 1;
	// This module is generated by `script/`.
	/* eslint-disable no-control-regex, no-misleading-character-class, no-useless-escape */
	regex = /[\0-\x1F!-,\.\/:-@\[-\^`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482\u0530\u0557\u0558\u055A-\u055F\u0589-\u0590\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EE\u05F3-\u060F\u061B-\u061F\u066A-\u066D\u06D4\u06DD\u06DE\u06E9\u06FD\u06FE\u0700-\u070F\u074B\u074C\u07B2-\u07BF\u07F6-\u07F9\u07FB\u07FC\u07FE\u07FF\u082E-\u083F\u085C-\u085F\u086B-\u089F\u08B5\u08C8-\u08D2\u08E2\u0964\u0965\u0970\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09F2-\u09FB\u09FD\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF0-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B54\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B70\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BF0-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C7F\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D0D\u0D11\u0D45\u0D49\u0D4F-\u0D53\u0D58-\u0D5E\u0D64\u0D65\u0D70-\u0D79\u0D80\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3F\u0E4F\u0E5A-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F01-\u0F17\u0F1A-\u0F1F\u0F2A-\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F85\u0F98\u0FBD-\u0FC5\u0FC7-\u0FFF\u104A-\u104F\u109E\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u1360-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16ED\u16F9-\u16FF\u170D\u1715-\u171F\u1735-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17D4-\u17D6\u17D8-\u17DB\u17DE\u17DF\u17EA-\u180A\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u1945\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DA-\u19FF\u1A1C-\u1A1F\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1AA6\u1AA8-\u1AAF\u1AC1-\u1AFF\u1B4C-\u1B4F\u1B5A-\u1B6A\u1B74-\u1B7F\u1BF4-\u1BFF\u1C38-\u1C3F\u1C4A-\u1C4C\u1C7E\u1C7F\u1C89-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CCF\u1CD3\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u203E\u2041-\u2053\u2055-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u20CF\u20F1-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u215F\u2189-\u24B5\u24EA-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u3004\u3008-\u3020\u3030\u3036\u3037\u303D-\u3040\u3097\u3098\u309B\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\u9FFD-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA673\uA67E\uA6F2-\uA716\uA720\uA721\uA789\uA78A\uA7C0\uA7C1\uA7CB-\uA7F4\uA828-\uA82B\uA82D-\uA83F\uA874-\uA87F\uA8C6-\uA8CF\uA8DA-\uA8DF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA954-\uA95F\uA97D-\uA97F\uA9C1-\uA9CE\uA9DA-\uA9DF\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A-\uAA5F\uAA77-\uAA79\uAAC3-\uAADA\uAADE\uAADF\uAAF0\uAAF1\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABEB\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFDFF\uFE10-\uFE1F\uFE30-\uFE32\uFE35-\uFE4C\uFE50-\uFE6F\uFE75\uFEFD-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF3E\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDD3F\uDD75-\uDDFC\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEE1-\uDEFF\uDF20-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE40-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE7-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD28-\uDD2F\uDD3A-\uDE7F\uDEAA\uDEAD-\uDEAF\uDEB2-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF51-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC47-\uDC65\uDC70-\uDC7E\uDCBB-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD40-\uDD43\uDD48-\uDD4F\uDD74\uDD75\uDD77-\uDD7F\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDFF\uDE12\uDE38-\uDE3D\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC4B-\uDC4F\uDC5A-\uDC5D\uDC62-\uDC7F\uDCC6\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDC1-\uDDD7\uDDDE-\uDDFF\uDE41-\uDE43\uDE45-\uDE4F\uDE5A-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF3A-\uDFFF]|\uD806[\uDC3B-\uDC9F\uDCEA-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD36\uDD39\uDD3A\uDD44-\uDD4F\uDD5A-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE2\uDDE5-\uDDFF\uDE3F-\uDE46\uDE48-\uDE4F\uDE9A-\uDE9C\uDE9E-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC41-\uDC4F\uDC5A-\uDC71\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF7-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD824-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83D\uD83F\uD87B-\uD87D\uD87F\uD885-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDECF\uDEEE\uDEEF\uDEF5-\uDEFF\uDF37-\uDF3F\uDF44-\uDF4F\uDF5A-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE80-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE2\uDFE5-\uDFEF\uDFF2-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD823[\uDCD6-\uDCFF\uDD09-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDC9C\uDC9F-\uDFFF]|\uD834[\uDC00-\uDD64\uDD6A-\uDD6C\uDD73-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDE41\uDE45-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC\uDFCD]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD4F-\uDEBF\uDEFA-\uDFFF]|\uD83A[\uDCC5-\uDCCF\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD83C[\uDC00-\uDD2F\uDD4A-\uDD4F\uDD6A-\uDD6F\uDD8A-\uDFFF]|\uD83E[\uDC00-\uDFEF\uDFFA-\uDFFF]|\uD869[\uDEDE-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]/g;
	return regex;
}

var githubSlugger;
var hasRequiredGithubSlugger;

function requireGithubSlugger () {
	if (hasRequiredGithubSlugger) return githubSlugger;
	hasRequiredGithubSlugger = 1;
	const regex = requireRegex();

	githubSlugger = BananaSlug;

	const own = Object.hasOwnProperty;

	function BananaSlug () {
	  const self = this;

	  if (!(self instanceof BananaSlug)) return new BananaSlug()

	  self.reset();
	}

	/**
	 * Generate a unique slug.
	 * @param  {string} value String of text to slugify
	 * @param  {boolean} [false] Keep the current case, otherwise make all lowercase
	 * @return {string}       A unique slug string
	 */
	BananaSlug.prototype.slug = function (value, maintainCase) {
	  const self = this;
	  let slug = slugger(value, maintainCase === true);
	  const originalSlug = slug;

	  while (own.call(self.occurrences, slug)) {
	    self.occurrences[originalSlug]++;
	    slug = originalSlug + '-' + self.occurrences[originalSlug];
	  }

	  self.occurrences[slug] = 0;

	  return slug
	};

	/**
	 * Reset - Forget all previous slugs
	 * @return void
	 */
	BananaSlug.prototype.reset = function () {
	  this.occurrences = Object.create(null);
	};

	function slugger (string, maintainCase) {
	  if (typeof string !== 'string') return ''
	  if (!maintainCase) string = string.toLowerCase();
	  return string.replace(regex, '').replace(/ /g, '-')
	}

	BananaSlug.slug = slugger;
	return githubSlugger;
}

var githubSluggerExports = requireGithubSlugger();

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
          index !== null && parent && parent.children.length > index + 2
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
                      id: githubSluggerExports.slug(`code-${titleText}`)
                    },
                    children: [{ type: "text", value: titleText }]
                  }
                ]
              };
              parent.children[index + 2] = titleElement;
            }
          }
        }
        if (
          // pre タグのチェック
          node.type === "element" && "tagName" in node && typeof node.tagName === "string" && node.tagName === "pre" && node.children.length > 0 && // code タグのチェック
          node.children[0].type === "element" && "tagName" in node.children[0] && typeof node.children[0].tagName === "string" && node.children[0].tagName === "code" && // code タグのdataのチェック
          node.children[0].data && "meta" in node.children[0].data && typeof node.children[0].data.meta === "string" && // 親のチェック
          index !== null && parent
        ) {
          const titleText = parseTitleForCodeMeta(node.children[0].data.meta);
          if (titleText) {
            const titleElement = {
              type: "element",
              tagName: "div",
              properties: { className: ["embedCode"] },
              children: [
                node,
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: "embedCodeCaption",
                    id: githubSluggerExports.slug(`code-${titleText}`, true)
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
            id: githubSluggerExports.slug(`image-${node.properties?.alt}`)
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
    visit(tree, "image", (node) => {
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
          index !== null && parent && parent.children.length > index + 2
        ) {
          const titleText = parseTitleForComment(node.value);
          if (titleText) {
            const nextNode = parent.children[index + 2];
            if (nextNode && nextNode.tagName === "img") {
              const figcaption = {
                type: "element",
                tagName: "figcaption",
                properties: {
                  id: githubSluggerExports.slug(`mermaid-${titleText}`),
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
          index !== null && parent && parent.children.length > index + 2
        ) {
          const titleText = parseTitleForComment(node.value);
          if (titleText) {
            const nextNode = parent.children[index + 2];
            if (nextNode && nextNode.tagName === "table") {
              nextNode.children.push({
                type: "element",
                tagName: "caption",
                properties: {
                  id: githubSluggerExports.slug(`table-${titleText}`)
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
}).use(remarkGfm).use(simplePlantUML).use(imageAttributesToTitlePlugin).use(remarkRehype, { allowDangerousHtml: true }).use(imageApplyAttributesFromTitlePlugin).use(rehypeSlug).use(rehypeMermaid, {
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

const CSS_FILE_MAP = {
  "JIS-B5": "global.css",
  "105mm 173mm": "global-105x173.css"
};
const cssSrcFileName = CSS_FILE_MAP[config.size] || "global.css";
const program = new Command();
program.name("techbook-template-cli").description("TechBook Template CLI utilities.").version((await import('./chunks/package.mjs')).version);
program.command("dev").description("techbook dev").option("-ph, --h3-port <port>", "h3 server port number", "3000").option("-ps, --sync-port <port>", "sync port number", "3001").option("-kdp, --kindle-direct-print", "kindle direct print mode", "false").action(
  async ({ h3Port, syncPort }) => {
    console.info("dev", h3Port, syncPort);
    const main = (await import('./chunks/main.mjs')).default;
    main();
    (await import('chokidar')).watch(["docs/"]).on("change", async (event, path) => {
      console.info(event, path);
      main();
    });
  }
);
program.command("build").description("techbook build").option("-kdp, --kindle-direct-print", "kindle direct print mode", "false").option("-ts, --tailwind-src <tailwindSrc>", "tailwind src file name", __dirname + "/../src/" + cssSrcFileName).option("-tc, --tailwind-config <tailwindConfig>", "tailwind config file name", __dirname + "/../tailwind.config.ts").option("-tp, --tailwind-postcss <tailwindPostcss>", "postcss config file name", __dirname + "/../postcss.config.cjs").action(
  async ({ tailwindSrc, tailwindConfig, tailwindPostcss }) => {
    console.info("build", tailwindSrc, tailwindConfig, tailwindPostcss);
    const main = (await import('./chunks/main.mjs')).default;
    await main();
    (await import('cross-spawn')).default.sync("npx", ["--yes", "tailwindcss@latest", "-i", tailwindSrc, "-o", "./dist/global.css", "--no-autoprefixer", "--postcss", tailwindPostcss, "--config", tailwindConfig], { stdio: "inherit" });
    (await import('cross-spawn')).default.sync("npx", ["--yes", "@vivliostyle/cli", "build", "--style", "./dist/global.css"], { stdio: "inherit" });
  }
);
program.command("viewer").description("techbook viewer").option("-p, --port <port>", "express server port number", "3000").action(async ({ port }) => {
  console.info("viewer");
  await (await import('./chunks/viewer.mjs')).default({ port: parseInt(port) });
});
program.command("tailwind").description("techbook tailwind").option("-ts, --tailwind-src <tailwindSrc>", "tailwind src file name", __dirname + "/../src/" + cssSrcFileName).option("-tc, --tailwind-config <tailwindConfig>", "tailwind config file name", __dirname + "/../tailwind.config.ts").option("-tp, --tailwind-postcss <tailwindPostcss>", "postcss config file name", __dirname + "/../postcss.config.cjs").action(async ({ tailwindSrc, tailwindConfig, tailwindPostcss }) => {
  console.info("tailwind");
  await (await import('wait-on')).default({
    interval: 500,
    resources: [
      "./dist/lockfile"
    ]
  });
  const result = (await import('cross-spawn')).default.sync("npx", ["--package", "tailwindcss@latest", "--yes", "tailwindcss", "-i", tailwindSrc, "-o", "./dist/global.css", "--watch", "--no-autoprefixer", "--postcss", tailwindPostcss, "--config", tailwindConfig], { stdio: "inherit" });
  console.info(result);
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

export { introductionTemplateHtmlPath as A, introductionDocPath as B, processor as C, finallyDocPath as D, profileTemplateHtmlPath as E, simpleChapterTemplateHtmlPath as F, chapterTemplateHtmlPath as G, lockFileDistPath as H, cwd as I, appendixTemplateHtmlPath as a, appendixTitle as b, appendixDistPath as c, colophonTemplateHtmlPath as d, config as e, colophonDistPath as f, coverTemplateHtmlPath as g, handlebarCompileOptions as h, frontCoverDistPath as i, backCoverDistPath as j, endCoverDistPath as k, docsDir as l, distDir as m, githubSluggerExports as n, parseTitleForCodeMeta as o, processorRehype as p, isTitleForComment as q, parseTitleForComment as r, startCoverDistPath as s, tocDistPath as t, introductionDistPath as u, finallyDistPath as v, profileDistPath as w, vivliostyleConfig as x, publicationJson as y, simpleIntroductionTemplateHtmlPath as z };
