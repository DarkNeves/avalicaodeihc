import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportsDirectory = path.join(root, "documentos");
const outputDirectory = path.join(root, "data");
const screenshotDirectory = path.join(root, "img", "sites");
const marker = "window.__LIGHTHOUSE_JSON__ = ";

const siteFromUrl = (url) => {
  if (url.includes("darkneves.github.io")) return "equipe";
  if (url.includes("mercadolivre.com.br")) return "mercadolivre";
  if (url.includes("gov.br")) return "govbr";
  return null;
};

const names = {
  equipe: "Tipos de Interfaces de Usuário",
  govbr: "GOV.BR",
  mercadolivre: "Mercado Livre",
};

const roundScore = (category) => Math.round((category?.score ?? 0) * 100);

const cleanNode = (item = {}) => {
  const node = item.node ?? item;
  return {
    label: node.nodeLabel ?? "",
    selector: node.selector ?? "",
    snippet: node.snippet ?? "",
    explanation: node.explanation ?? "",
    dimensions: node.boundingRect
      ? { width: node.boundingRect.width, height: node.boundingRect.height }
      : null,
  };
};

const parseReport = (html, filename) => {
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`JSON do Lighthouse não encontrado em ${filename}`);
  const jsonStart = start + marker.length;
  const jsonEnd = html.indexOf(";</script>", jsonStart);
  if (jsonEnd === -1) throw new Error(`Final do JSON não encontrado em ${filename}`);
  return JSON.parse(html.slice(jsonStart, jsonEnd));
};

const files = (await readdir(reportsDirectory)).filter((file) => file.toLowerCase().endsWith(".html"));
if (!files.length) throw new Error("Nenhum relatório HTML foi encontrado em /documentos.");

await mkdir(outputDirectory, { recursive: true });
await mkdir(screenshotDirectory, { recursive: true });

const output = {
  generatedAt: new Date().toISOString(),
  source: "Relatórios HTML originais do Lighthouse em /documentos",
  sites: {},
};

for (const filename of files) {
  const html = await readFile(path.join(reportsDirectory, filename), "utf8");
  const report = parseReport(html, filename);
  const id = siteFromUrl(report.finalUrl ?? report.requestedUrl ?? "");
  if (!id) {
    console.warn(`Relatório ignorado por URL desconhecida: ${filename}`);
    continue;
  }

  const category = report.categories.accessibility;
  const relevantAudits = category.auditRefs
    .map((reference) => ({ reference, audit: report.audits[reference.id] }))
    .filter(({ audit }) => audit && (audit.score === 0 || audit.scoreDisplayMode === "manual"))
    .map(({ reference, audit }) => ({
      id: audit.id,
      title: audit.title,
      description: audit.description,
      score: audit.score,
      weight: reference.weight,
      mode: audit.scoreDisplayMode,
      itemCount: audit.details?.items?.length ?? 0,
      examples: (audit.details?.items ?? []).slice(0, 5).map(cleanNode),
    }));

  const screenshotData = report.audits["final-screenshot"]?.details?.data;
  let screenshot = "";
  if (screenshotData) {
    const match = screenshotData.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/s);
    if (match) {
      const extension = match[1].replace("jpeg", "jpg");
      screenshot = `img/sites/${id}.${extension}`;
      await writeFile(path.join(root, screenshot), Buffer.from(match[2], "base64"));
    }
  }

  output.sites[id] = {
    id,
    name: names[id],
    requestedUrl: report.requestedUrl,
    finalUrl: report.finalUrl,
    reportFile: `documentos/${filename}`,
    screenshot,
    lighthouseVersion: report.lighthouseVersion,
    scores: {
      performance: roundScore(report.categories.performance),
      accessibility: roundScore(report.categories.accessibility),
      bestPractices: roundScore(report.categories["best-practices"]),
      seo: roundScore(report.categories.seo),
    },
    warnings: report.runWarnings ?? [],
    accessibilityAudits: relevantAudits,
  };
}

const destination = path.join(outputDirectory, "lighthouse-results.json");
await writeFile(destination, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Dados de ${Object.keys(output.sites).length} relatórios gravados em ${destination}.`);

