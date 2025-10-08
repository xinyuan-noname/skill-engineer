import { getIndentLen, strToSpliced } from "../utils/string.ts";
const findAnthorBrace = (str = "", count = 1) => {
  for (const match of str.matchAll(/\{|(?:\},?)/g)) {
    const [m] = match;
    m === "{" ? count++ : count--;
    if (count === 0) return { index: match.index, len: m.length };
  }
  return { index: -1, len: 0 };
};
const replaceFunToOrder = (raw: string) => {
  let result = raw;
  const replaceBlock = (
    pattern: RegExp,
    replacerStart: (hasAsync: boolean) => string,
    blockName: string,
  ): void => {
    const match = result.match(pattern);
    if (!match || match.index == null) return;

    const fullMatch = match[0];
    const hasAsync = !!match[1];
    const startTag = replacerStart(hasAsync);

    result = strToSpliced(result, match.index, fullMatch.length, startTag);

    const afterStart = result.slice(match.index + startTag.length);
    const { index: braceIndex, len: braceLen } = findAnthorBrace(afterStart, 1);

    if (braceIndex !== -1) {
      const closePos = match.index + startTag.length + braceIndex;
      result = strToSpliced(result, closePos, braceLen, `{{/${blockName}}}`);
    }
  };
  replaceBlock(
    /(async)?\s*content\(.*?\)\s*{/,
    (hasAsync) => `{{#content${hasAsync ? " async=true" : ""}}}`,
    "content",
  );
  replaceBlock(
    /filter\(.*?\)\s*{/,
    () => "{{#filter}}",
    "filter",
  );
  replaceBlock(
    /async\s* cost\(.*?\)\s*{/,
    () => "{{#cost}}",
    "cost",
  );
  return result;
};
const clearFuncAndObject = (raw: string) => {
  let result = raw;
  const clearBlock = (
    pattern: RegExp,
  ): void => {
    const match = result.match(pattern);
    if (!match || match.index == null) return;
    const [fullMatch] = match;
    const { index: braceIndex, len: braceLen } = findAnthorBrace(
      result.slice(match.index + fullMatch.length),
      1,
    );
    if (braceIndex !== -1) {
      result = strToSpliced(
        result,
        match.index,
        match.index + fullMatch.length + braceIndex + braceLen,
        "",
      );
    }
  };
  clearBlock(/check\(.*?\):\s*{/);
  clearBlock(/audioname2:\s*{/);
  // clearBlock(/ai:\s*{/);
  return result;
};
const itemList = Deno.readDir("./skill/raw");
for await (const item of itemList) {
  if (item.isFile && item.name.endsWith(".txt")) {
    const skillName = item.name.replace(".txt", "");
    Deno.readTextFile(`./skill/raw/${item.name}`).then((text) => {
      let content = text;
      const indentLen = getIndentLen(content);
      if (indentLen) {
        content = content.replace(new RegExp(`^\\t{${indentLen}}`, "gm"), "");
      }
      content = content.replace(/^audio(name)?:.*$/gm, "");
      content = content.replace(/([a-zA-Z0-9_$]*):\s*function/g, "$1");
      content = content.replace(
        /([a-zA-Z0-9_$]*):\s*async\s*function/g,
        "async $1",
      );
      content = content.replace(
        /([a-zA-Z0-9_$]*):\s*(\(.*?\))\s*=>\s*{/g,
        "$1$2 {",
      );
      content = content.replace(
        /([a-zA-Z0-9_$]*):\s*async\s*(\(.*?\))\s*=>\s*{/g,
        "async $1$2 {",
      );
      content = content.replace(/\s*\/\/.*/g, "");
      content = clearFuncAndObject(content);
      content = replaceFunToOrder(content);
      content = content.replace(
        /#a-([0-9a-zA-Z_$]+)-await\s/g,
        '{{#a "$1" "await"}}{{/a}}',
      );
      content = content.replace(
        /#a-([0-9a-zA-Z_$]+)-insert:([^\s]*)\s/g,
        '{{#a "$1" "insert" players="$2"}}{{/a}}',
      );
      content = content.replace(/^\s*$/gm, "");
      content = content.replace(/^\s*|\s*$/g, "");
      Deno.writeTextFile(`./skill/template/${skillName}.tp`, content);
    });
  }
}
