#!/usr/bin/env python3
"""Cache an auditable OpenAlex candidate search; no keys or paid calls required."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

SOURCE_ID = "S4210172589"
AI = re.compile(r"\b(artificial intelligence|machine learning|deep learning|neural networks?|natural language processing|large language models?|language models?|generative ai|chatgpt|finbert|fingpt|reinforcement learning|random forests?|gradient boosting|support vector machines?|textual analysis|text analysis|nlp|llms?)\b", re.I)
FINANCE = re.compile(r"\b(finance|financial|financing|banks?|banking|stocks?|stock markets?|equity|equities|assets?|asset pricing|portfolios?|investments?|investors?|investing|credit|creditworthy|creditworthiness|loans?|lending|trading|traders?|bonds?|derivatives?|insurance|insurers?|hedging|hedge funds?|mortgages?|securities|securitization|cryptocurrencies|cryptocurrency|bitcoin|fintech|accounting|earnings|monetary|central banks?|risk premia|risk premium|option pricing)\b", re.I)
FINANCE_TITLE = '(finance OR financial OR stock OR equity OR asset OR portfolio OR banking OR bank OR credit OR lending OR investor OR investment OR returns OR trading OR markets OR accounting OR bond OR insurance OR hedge OR derivative OR volatility OR currency OR capital OR earnings OR analyst OR mortgage OR fintech)'
QUERIES = [
    '("machine learning" OR "artificial intelligence" OR "deep learning" OR "neural network") AND (finance OR financial OR stock OR asset OR credit OR portfolio OR bank)',
    '("large language model" OR ChatGPT OR "generative AI" OR FinBERT OR FinGPT OR "natural language processing") AND (finance OR financial OR stock OR credit OR bank OR investment)',
    '("reinforcement learning" OR "random forest" OR "gradient boosting" OR "support vector machine") AND (finance OR financial OR trading OR portfolio OR credit OR asset)',
    '("textual analysis" OR "text analysis" OR "machine learning") AND (earnings OR accounting OR disclosure OR corporate OR insurance OR mortgage)',
]


def read_abstract(work):
    inverted = work.get("abstract_inverted_index") or {}
    words = [(position, word) for word, positions in inverted.items() for position in positions]
    return " ".join(word for _, word in sorted(words))


def ssrn_ids(work):
    values = [work.get("doi") or ""]
    for location in work.get("locations") or []:
        values += [location.get("doi") or "", location.get("landing_page_url") or "", location.get("id") or ""]
    found = set()
    for value in values:
        found.update(re.findall(r"(?:ssrn[./]|abstract(?:_id)?[=/])([0-9]+)", value, re.I))
    return sorted(found, key=int)


def normalize(work, retrieved_at):
    abstract = read_abstract(work)
    text = f"{work.get('title', '')} {abstract}"
    ids = ssrn_ids(work)
    locations = work.get("locations") or []
    oa_urls = []
    for location in [work.get("best_oa_location") or {}, *locations]:
        for field in ("pdf_url", "landing_page_url"):
            url = location.get(field)
            if url and (location.get("is_oa") or field == "pdf_url") and url not in oa_urls:
                oa_urls.append(url)
    return {
        "openalex_id": work["id"],
        "title": work.get("title"),
        "authors": [a["author"]["display_name"] for a in work.get("authorships", [])],
        "doi": work.get("doi"),
        "ssrn_ids": ids,
        "ssrn_urls": [f"https://papers.ssrn.com/sol3/papers.cfm?abstract_id={i}" for i in ids],
        "publication_date_indexed": work.get("publication_date"),
        "publication_year": work.get("publication_year"),
        "ssrn_first_posted_date": None,
        "date_verification_status": "unverified: indexed publication date is not SSRN first-post date",
        "citation_count": work.get("cited_by_count"),
        "citation_source": "OpenAlex cited_by_count",
        "citation_scope": "all-time indexed citations to this OpenAlex work record; not citations received only in the five-year window",
        "citation_retrieved_at": retrieved_at,
        "openalex_url": work["id"],
        "oa_urls": oa_urls,
        "is_retracted": work.get("is_retracted", False),
        "topics": [t.get("display_name") for t in work.get("topics", [])],
        "ai_matches": sorted(set(m.group(0).lower() for m in AI.finditer(text))),
        "finance_matches": sorted(set(m.group(0).lower() for m in FINANCE.finditer(text))),
        "has_abstract": bool(abstract),
        "reading_status": "not_read",
        "eligibility_status": "candidate: requires human topic and first-release review",
    }


def fetch(url, cache):
    key = hashlib.sha256(url.encode()).hexdigest()[:20]
    path = cache / f"openalex-{key}.json"
    if path.exists():
        return json.loads(path.read_text()), path
    request = urllib.request.Request(url, headers={"User-Agent": "PaperObservatoryResearch/1.0 (source discovery; metadata only)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                result = json.load(response)
            path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
            return result, path
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                raise
            time.sleep(min(2 ** attempt * 2, 8))
    raise RuntimeError("OpenAlex request failed")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from-date", default="2021-11-14")
    parser.add_argument("--through-date", default="2026-11-14")
    parser.add_argument("--pages-per-query", type=int, default=3)
    parser.add_argument("--title-finance", action="store_true", help="Require finance terms in title; use title/abstract rather than full-text AI search")
    parser.add_argument("--cache", type=Path, default=Path(".cloud-input/research-finance-ai"))
    parser.add_argument("--output", type=Path, default=Path("docs/research/finance-ai-2026-11-14/candidates.json"))
    args = parser.parse_args()
    for value in [args.from_date, args.through_date]:
        datetime.strptime(value, "%Y-%m-%d")
    if args.from_date > args.through_date or not 1 <= args.pages_per_query <= 5:
        parser.error("Dates must be ordered and pages-per-query must be between 1 and 5")
    args.cache.mkdir(parents=True, exist_ok=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    retrieved_at = datetime.now(timezone.utc).isoformat()
    works = {}
    queries = []
    for term in QUERIES:
        for page in range(1, args.pages_per_query + 1):
            parameters = {
                "filter": f"locations.source.id:{SOURCE_ID},from_publication_date:{args.from_date},to_publication_date:{args.through_date}",
                "search": term,
                "sort": "cited_by_count:desc",
                "per-page": "200",
                "page": str(page),
            }
            if args.title_finance:
                parameters.pop("search")
                parameters["filter"] += f",title.search:{FINANCE_TITLE},title_and_abstract.search:{term}"
            url = "https://api.openalex.org/works?" + urllib.parse.urlencode(parameters)
            result, path = fetch(url, args.cache)
            records = result.get("results", [])
            for work in records:
                works[work["id"]] = work
            queries.append({"url": url, "cached_response": str(path), "matched_count": result.get("meta", {}).get("count"), "returned_count": len(records), "page": page})
            print(f"[research] query={len(queries)} returned={len(records)} unique={len(works)}", flush=True)
            # Publish an intermediate metadata file after every page for parallel reviewers.
            candidates = [normalize(work, retrieved_at) for work in works.values()]
            candidates = [c for c in candidates if c["ssrn_ids"] and c["ai_matches"] and c["finance_matches"]]
            candidates.sort(key=lambda c: (-c["citation_count"], c["openalex_id"]))
            for rank, candidate in enumerate(candidates, 1):
                candidate["candidate_citation_rank"] = rank
            output = {
                "method": "Citation-sorted multi-query SSRN-location search with title/abstract AI and finance lexical screening; candidate list requires human review",
                "from_date": args.from_date, "through_date": args.through_date,
                "retrieved_at": retrieved_at, "source_id": SOURCE_ID,
                "exhaustive_global_top_100": False,
                "queries": queries, "raw_unique_record_count": len(works),
                "candidate_count": len(candidates), "candidates": candidates,
            }
            temporary = args.output.with_suffix(".tmp")
            temporary.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
            temporary.replace(args.output)
            abstracts = {wid: {"title": work.get("title"), "abstract": read_abstract(work)} for wid, work in works.items()}
            (args.cache / "abstracts.json").write_text(json.dumps(abstracts, ensure_ascii=False, indent=2) + "\n")
            full_metadata = []
            for candidate in candidates:
                work = works[candidate["openalex_id"]]
                full_metadata.append({**candidate, "abstract": read_abstract(work), "abstract_inverted_index": work.get("abstract_inverted_index"), "publication_date": work.get("publication_date"), "counts_by_year": work.get("counts_by_year"), "ids": work.get("ids"), "locations": work.get("locations"), "best_oa_location": work.get("best_oa_location"), "open_access": work.get("open_access")})
            (args.cache / "candidates-full-metadata.json").write_text(json.dumps(full_metadata, ensure_ascii=False, indent=2) + "\n")
            if len(records) < 200:
                break
    print(f"[research] saved {len(candidates)} screened candidates to {args.output}", flush=True)


if __name__ == "__main__":
    main()
