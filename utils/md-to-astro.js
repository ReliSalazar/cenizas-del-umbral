import fs from "fs";
import path from "path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Uso: node md-to-astro.js input.md output.astro");
  process.exit(1);
}

const md = fs.readFileSync(inputPath, "utf-8");

const lines = md.split("\n");

let title = "";
let meta = [];
let body = [];
let terminals = [];

let currentTerminal = null;
let pendingModifiers = {};

for (let raw of lines) {
  const line = raw.trim();

  // Título
  if (line.startsWith("# ")) {
    title = line.replace("# ", "");
    continue;
  }

  // Meta
  if (line === ":::meta") {
    currentTerminal = "meta";
    continue;
  }
  if (line === ":::") {
    currentTerminal = null;
    continue;
  }
  if (currentTerminal === "meta") {
    if (line) meta.push(line);
    continue;
  }

  // Terminal
  if (line === "> :::terminal") {
    currentTerminal = [];
    terminals.push(currentTerminal);
    continue;
  }
  if (line === "> :::") {
    currentTerminal = null;
    continue;
  }

  if (currentTerminal) {
    const content = line.replace(/^>\s?/, "");

    if (content.startsWith("<!--")) {
      const opts = content
        .replace("<!--", "")
        .replace("-->", "")
        .trim()
        .split(" ");

      opts.forEach((o) => {
        const [k, v] = o.split(":");
        pendingModifiers[k] = v ?? true;
      });
    } else if (content) {
      currentTerminal.push({
        text: content,
        ...pendingModifiers,
      });
      pendingModifiers = {};
    }
    continue;
  }

  // Texto normal
  if (line) body.push(line);
}

const astro = `
---
import PostLayout from "../../layouts/PostLayout.astro";
import Terminal from "../../components/Terminal.svelte";
---

<PostLayout>
  <div class="prose prose-invert max-w-none">
    <header class="mb-8">
      <p class="text-sm text-text-secondary mb-2">
        [Archivo recuperado // Última transmisión: ${title}]
      </p>
      <h1 class="text-3xl md:text-4xl font-bold text-primary-accent mb-4">
        ${title}
      </h1>
      <div class="border-l-2 border-primary-accent pl-4 my-6">
        <p class="text-text-primary">
          ${meta.map((m) => `<span class="block">${m}</span>`).join("")}
        </p>
      </div>
    </header>

    <div class="space-y-6">
      ${body
        .map((p) => `<p class="text-text-primary leading-relaxed">${p}</p>`)
        .join("\n")}

      ${terminals
        .map(
          (t) => `
        <div class="my-8">
          <Terminal client:load lines={${JSON.stringify(
            t.map((l) => ({
              parts: [
                {
                  text: l.text,
                  class: [
                    l.color === "danger" ? "text-red-500" : "text-text-primary",
                    l.anim ? l.anim : "",
                  ].join(" "),
                },
              ],
              delayAfter: l.delay ? Number(l.delay) : undefined,
            })),
          )}} lastPrompt />
        </div>
      `,
        )
        .join("")}
    </div>
  </div>
</PostLayout>
`;

fs.writeFileSync(outputPath, astro.trim());
console.log("✔ Astro generado:", outputPath);
