const itemList = Deno.readDir("./skill/template");
for await (const item of itemList) {
  if (item.isFile && item.name.endsWith(".tp")) {
    const skillName = item.name.replace(".tp", "");
    Deno.readTextFile(`./skill/template/${item.name}`).then((text) => {
      const data = {
        name: skillName,
        content: text.replace(/^[\t ]*/gm,"").split(/\r?\n/),
      };
      Deno.writeTextFile(`./skill/data/${skillName}.json`, JSON.stringify(data, null, 2))
    });
  }
}
