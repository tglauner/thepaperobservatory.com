import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { papers } from "../shared/catalog.js";
import { site, campaignUrl } from "../shared/site-config.js";

export function socialPack(paper) {
  const concept = JSON.parse(readFileSync(new URL(`../content/social/${paper.slug}/concept.json`, import.meta.url), "utf8"));
  if (!concept) throw new Error(`No source-grounded social concept registered for ${paper.slug}.`);
  const base = `${site.origin}/${paper.slug}/`;
  const draft = {
    paper: paper.slug, source_doc_ref: `SSRN:${paper.ssrnId}`, source_hash: paper.sourceHash,
    title: concept.hook, status: "draft", disclosure: "AI-generated educational explanation; synthetic or reconstructed models; no investment recommendations.",
    format: { video: "9:16 MP4, H.264 + AAC", thumbnail: "PNG", captions: "SRT or VTT" },
    narration: concept.narration, shots: concept.shots, carousel: concept.carousel,
    channels: Object.fromEntries(["tiktok", "instagram", "youtube", "linkedin"].map(channel => [channel, {
      caption: `${concept.hook} Explore the free interactive companion to ${paper.paperTitle}. ${concept.hashtags.map(tag => `#${tag}`).join(" ")}`,
      cta: "Open the free paper experiment. Continue with an optional related course.",
      url: campaignUrl(base, { source: channel, medium: "organic-social", campaign: paper.slug, content: "concept-01" }),
    }])),
    publication: "Not posted. Review the source claims and captions before publishing through the owner's account.",
  };
  const hash = createHash("sha256").update(JSON.stringify(draft)).digest("hex");
  return { asset_id: `social-${paper.ssrnId}-${hash.slice(0, 12)}`, type: "social-draft-pack", revision: concept.revision, hash, ...draft };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const directory of ["content/social", "collection/public/share-packs"]) mkdirSync(new URL(`../${directory}/`, import.meta.url), { recursive: true });
  for (const paper of papers) {
    const output = JSON.stringify(socialPack(paper), null, 2) + "\n";
    for (const directory of ["content/social", "collection/public/share-packs"]) writeFileSync(new URL(`../${directory}/${paper.slug}.json`, import.meta.url), output);
  }
  console.log(`[social-packs] Generated ${papers.length} source-attributed draft packs. No content posted.`);
}
