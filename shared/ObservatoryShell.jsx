import React, { useEffect, useRef, useState } from "react";
import { papers, getPaper, sourceUrl } from "./catalog.js";
import { site, recommendedCourseForPaper, campaignUrl } from "./site-config.js";
import { advertisingConfig, mountAdvertisement } from "./advertising.js";
import "./observatory.css";

export function ObservatoryNav({ slug }) {
  return <nav className="observatory-nav" aria-label="Paper Observatory">
    <a className="observatory-wordmark" href="/"><span aria-hidden="true">◎</span> The Paper Observatory</a>
    <div className="observatory-nav-links"><a href="/#library">Paper library</a><a href="/learn/">Courses</a><a href="/about/">About</a><a href={site.repository} target="_blank" rel="noreferrer">Open source ↗</a></div>
    <span className="observatory-paper-index">PAPER {String(papers.findIndex(paper => paper.slug === slug) + 1).padStart(2, "0")}</span>
  </nav>;
}

export function Advertisement() {
  const container = useRef(null);
  useEffect(() => {
    try { return mountAdvertisement(container.current, advertisingConfig(import.meta.env)); }
    catch (error) { console.error("Advertising configuration:", error.message); }
  }, []);
  return <aside ref={container} className="observatory-advertisement" aria-label="Advertisements" hidden />;
}

export function PaperContinuation({ slug }) {
  const paper = getPaper(slug);
  const related = papers.find(item => item.slug !== slug);
  const course = recommendedCourseForPaper(slug);
  const [shareStatus, setShareStatus] = useState("");
  const [manualLink, setManualLink] = useState(false);
  const canonical = `${site.origin}/${slug}/`;
  async function copyLink() {
    try { await navigator.clipboard.writeText(canonical); setShareStatus("Paper link copied."); setManualLink(false); }
    catch { setManualLink(true); setShareStatus("Select and copy the link below."); }
  }
  return <section className="observatory-continuation" aria-label="Continue learning">
    <div className="observatory-provenance"><span>AI-GENERATED · SOURCE-LINKED</span><p>An original educational companion to <em>{paper.paperTitle}</em> by {paper.authors}. Read the <a href={sourceUrl(slug)} target="_blank" rel="noreferrer">original on SSRN</a> and the <a href="/about/#method">generation method</a>.</p></div>
    <div className="observatory-next-grid">
      {related && <a className="observatory-next-card" href={`/${related.slug}/`}><span>EXPLORE ANOTHER PAPER</span><h2>{related.title} <b aria-hidden="true">↗</b></h2><p>{related.summary}</p><small>{related.labs} interactive experiments · Foundation + Advanced</small></a>}
      {course && <div className="observatory-course-card"><span>CONTINUE WITH A PAID COURSE</span><h2>{course.title}</h2><p>{course.description}</p><a href={campaignUrl(course.url, { campaign: slug, content: "paper-footer" })} rel="sponsored noopener" target="_blank">Explore the course ↗</a><small>Offered by this site's publisher, TG Investments and Research. Enrollment is optional.</small></div>}
    </div>
    <div className="observatory-sharing"><span>Keep the idea moving.</span><button type="button" onClick={copyLink}>Copy paper link</button><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`} target="_blank" rel="noreferrer">Share on LinkedIn ↗</a><a href={`/channels/#${slug}`}>Short video & carousel scripts</a><p role="status">{shareStatus}</p>{manualLink && <input aria-label="Paper link to copy" readOnly value={canonical} onFocus={event => event.target.select()} />}</div>
    <div className="observatory-fineprint"><a href="/privacy/">Privacy & commercial disclosure</a><a href="/channels/">TikTok · Instagram · YouTube</a><span>Educational models. No investment recommendations.</span></div>
    <Advertisement />
  </section>;
}
