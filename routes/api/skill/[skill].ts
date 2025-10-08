import { Handlers } from "$fresh/server.ts";
import * as prettier from "npm:prettier@3";
import Handlebars from "../../../skill/index.ts";

interface Params {
  skill: string;
}
const genSkillCode = async (skill: string, config: Record<string, string>) => {
  const template = Handlebars.compile(
    Deno.readTextFileSync(`./skill/template/${skill}.tp`),
  );
  const code = `const ${skill}={\n${template(config)}}`;
  const formatted = await prettier.format(code, {
    parser: "babel",
    semi: true,
    singleQuote: true,
    printWidth: 80,
  });
  return formatted;
};
export const handler: Handlers<undefined, Params> = {
  async GET(req, ctx) {
    try {
      const skill = ctx.params.skill;
      if (!/^[a-zA-Z0-9-_$]*$/.test(skill)) throw new Deno.errors.NotFound("");
      const config = Object.fromEntries(new URL(req.url).searchParams);
      const code = await genSkillCode(skill, config);
      return new Response(
        JSON.stringify({ name: skill, code }, null, 2),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      );
    } catch (e) {
      console.error(e);
      if (e instanceof Deno.errors.NotFound) {
        return new Response(
          JSON.stringify({ error: "Invalid skill name" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: e }),
        {
          headers: { "Content-Type": "application/json" },
          status: 404,
        },
      );
    }
  },
  async POST(req, ctx) {
    try {
      const skill = ctx.params.skill;
      if (!/^[a-zA-Z0-9-_$]*$/.test(skill)) throw new Deno.errors.NotFound("");
      const config = Object.assign(
        Object.fromEntries(new URL(req.url).searchParams),
        await (async () => {
          try {
            return await req.json();
          } catch (_) {
            return {};
          }
        })(),
      );
      const code = await genSkillCode(skill, config);
      return new Response(
        JSON.stringify({ name: skill, code }, null, 2),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      );
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return new Response(
          JSON.stringify({ error: "Invalid skill name" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: e }),
        {
          headers: { "Content-Type": "application/json" },
          status: 404,
        },
      );
    }
  },
};
