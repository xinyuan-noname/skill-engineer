import Handlebars from "https://esm.sh/handlebars@4.7.8";
Handlebars.registerHelper("filter", function (...data: any[]) {
  const options = data.at(-1);
  return `filter(event, player){\n${options.fn()}},\n`;
});
Handlebars.registerHelper("content", function (...data: any[]) {
  const options = data.at(-1);
  if (options.hash.async === true) {
    return `async content(event, trigger, player){\n${options.fn()}},\n`;
  } else {
    return `content(){\n${options.fn()}},\n`;
  }
});
Handlebars.registerHelper("cost", function (...data: any[]) {
  const options = data.at(-1);
  return `async cost(event, trigger, player){\n${options.fn()}},\n`;
});
Handlebars.registerHelper(
  "a",
  function (name: string, content: string, options: any) {
    const context = options.data.root;
    if (context[name]) {
      switch (content) {
        case "await":
          return "await ";
        case "insert":
          return context?.[name]?.gen?.(options.hash.players);
        case "getIndex:num":
          return `getIndex(event){\nreturn event.num},\n`
        default:
          return options.fn();
      }
    }
  },
);
Handlebars.registerHelper(
  "d",
  function (name: string, options: any) {
    const context = options.data.root;
    if (context[name] === false) return "";
    return options.fn();
  },
);
Handlebars.registerHelper(
  "r",
  function (name: string, options: any) {
    const context = options.data.root;
    if (context[name]) return options.fn();
    return options.inverse?.() || "";
  },
);
Handlebars.registerPartial(
  "p-m",
  `{{#if player}}{{#if method}}{{#if args}}{{{player}}}.{{{method}}}({{args}});{{/if}}{{/if}}{{/if}}\n`,
);
export default Handlebars;