#!/usr/bin/env python3
"""Merge candidate discovery and primary seed evidence; cache Crossref date checks."""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import json
from pathlib import Path
import time
import urllib.error
import urllib.request

from discover_openalex import fetch, normalize, read_abstract


def date_value(parts):
    if not parts or not parts.get("date-parts") or not parts["date-parts"][0]:
        return None
    values = parts["date-parts"][0]
    return "-".join([str(values[0]), *[f"{value:02d}" for value in values[1:]]])


def crossref(ssrn_id, cache):
    cache_file = cache / f"crossref-ssrn-{ssrn_id}.json"
    url = f"https://api.crossref.org/works/10.2139/ssrn.{ssrn_id}"
    if cache_file.exists():
        return ssrn_id, json.loads(cache_file.read_text())
    request = urllib.request.Request(url, headers={"User-Agent": "PaperObservatoryResearch/1.0 (public metadata date verification)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                payload = json.load(response)
            item = payload["message"]
            result = {
                "ssrn_id": ssrn_id, "metadata_evidence_url": url,
                "title": (item.get("title") or [None])[0],
                "crossref_created_date": (item.get("created", {}).get("date-time") or "")[:10] or None,
                "crossref_posted_date": date_value(item.get("posted")),
                "crossref_issued_date": date_value(item.get("issued")),
                "crossref_updated_date": (item.get("deposited", {}).get("date-time") or "")[:10] or None,
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "date_interpretation": "Created is DOI metadata registration, not SSRN first posting; deposited is an update. Year-only posted dates remain year-only.",
            }
            cache_file.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
            time.sleep(0.25)
            return ssrn_id, result
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                return ssrn_id, {"ssrn_id": ssrn_id, "metadata_evidence_url": url, "error": f"HTTP {error.code}"}
            time.sleep(2 * (attempt + 1))
        except (OSError, ValueError) as error:
            if attempt == 2:
                return ssrn_id, {"ssrn_id": ssrn_id, "metadata_evidence_url": url, "error": type(error).__name__}
    raise RuntimeError("Unreachable retry state")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--research-dir", type=Path, default=Path("docs/research/finance-ai-2026-11-14"))
    parser.add_argument("--cache", type=Path, default=Path(".cloud-input/research-finance-ai"))
    parser.add_argument("--date-check-count", type=int, default=250)
    parser.add_argument("--from-date", default="2021-11-14")
    args = parser.parse_args()
    if not 0 <= args.date_check_count <= 1000:
        parser.error("date-check-count must be between 0 and 1000")
    try:
        datetime.strptime(args.from_date, "%Y-%m-%d")
    except ValueError:
        parser.error("from-date must be a YYYY-MM-DD date")
    records = {}
    for metadata_file in [args.cache / "candidates-full-metadata.json", args.cache / "targeted/candidates-full-metadata.json"]:
        for record in json.loads(metadata_file.read_text()):
            records[record["openalex_id"]] = record
    seeds = json.loads((args.research_dir / "scout-seeds.json").read_text())
    known = {str(seed["ssrn_id"]): seed for seed in seeds["papers"]}
    excluded = {str(seed["ssrn_id"]): seed for seed in seeds["excluded_or_unresolved"] if seed.get("ssrn_id")}
    represented = {ssrn_id for record in records.values() for ssrn_id in record["ssrn_ids"]}
    lookup_failures = []
    for ssrn_id in known:
        if ssrn_id in represented:
            continue
        url = f"https://api.openalex.org/works/https://doi.org/10.2139/ssrn.{ssrn_id}"
        try:
            work, _ = fetch(url, args.cache)
            record = normalize(work, datetime.now(timezone.utc).isoformat())
            record.update({"abstract": read_abstract(work), "abstract_inverted_index": work.get("abstract_inverted_index"), "publication_date": work.get("publication_date"), "counts_by_year": work.get("counts_by_year"), "ids": work.get("ids"), "locations": work.get("locations"), "best_oa_location": work.get("best_oa_location"), "open_access": work.get("open_access"), "discovery_method": "Primary-source scout seed resolved by exact SSRN DOI"})
            records[record["openalex_id"]] = record
            print(f"[research] exact DOI seed added={ssrn_id} citations={record['citation_count']}", flush=True)
        except (urllib.error.HTTPError, OSError, ValueError, KeyError) as error:
            lookup_failures.append({"ssrn_id": ssrn_id, "lookup_url": url, "error": str(error), "citation_count": None})
    (args.research_dir / "seed-lookup-failures.json").write_text(json.dumps(lookup_failures, ensure_ascii=False, indent=2) + "\n")
    candidates = sorted(records.values(), key=lambda c: (-c["citation_count"], c["openalex_id"]))
    ids = sorted({sid for record in candidates[:args.date_check_count] for sid in record["ssrn_ids"]})
    evidence = {}
    date_cache = args.cache / "date-evidence"
    date_cache.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as pool:
        for future in as_completed([pool.submit(crossref, ssrn_id, date_cache) for ssrn_id in ids]):
            ssrn_id, result = future.result()
            evidence[ssrn_id] = result
            if len(evidence) % 25 == 0:
                print(f"[research] date metadata checked={len(evidence)}/{len(ids)}", flush=True)
    for rank, record in enumerate(candidates, 1):
        record["candidate_citation_rank"] = rank
        record["date_evidence"] = [evidence[sid] for sid in record["ssrn_ids"] if sid in evidence]
        record["excluded_known_old"] = False
        record["exclusion_reason"] = None
        for ssrn_id in record["ssrn_ids"]:
            seed = known.get(ssrn_id)
            if seed:
                record["ssrn_first_posted_date"] = seed.get("ssrn_posted_date")
                record["ssrn_date_evidence_url"] = seed.get("metadata_evidence_url")
                record["date_verification_status"] = "SSRN posted date checked against indexed primary page; earlier other-source release still requires review"
                record["scout_notes"] = seed.get("eligibility_note")
                for url in seed.get("fulltext_candidate_urls", []):
                    if url not in record["oa_urls"]:
                        record["oa_urls"].append(url)
            old = excluded.get(ssrn_id)
            if old:
                record["scout_exclusion_evidence"] = old
            check = evidence.get(ssrn_id, {})
            created = check.get("crossref_created_date")
            posted = check.get("crossref_posted_date")
            if (created and created < args.from_date) or (posted and (len(posted) == 10 and posted < args.from_date or len(posted) == 4 and posted < args.from_date[:4])):
                record["excluded_known_old"] = True
                record["exclusion_reason"] = f"SSRN DOI existed before window: Crossref created {created}; posted {posted}. This proves the record predates the requested period; latest journal/revision dates cannot restore eligibility."
    private_output = args.cache / "candidates-merged-full-metadata.json"
    private_output.write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + "\n")
    private_fields = {"abstract", "abstract_inverted_index", "locations", "best_oa_location", "open_access"}
    public = [{key: value for key, value in record.items() if key not in private_fields} for record in candidates]
    (args.research_dir / "candidates-merged.json").write_text(json.dumps({"candidate_count": len(public), "method": "Union of broad and finance-title SSRN-location searches; citation-sorted. Not an exhaustive global top 100. Human substantive-topic and first-release review required.", "citation_scope": "all-time indexed citations to OpenAlex work, retrieval snapshot; separate preprint/publication records may split citations", "candidates": public}, ensure_ascii=False, indent=2) + "\n")
    (args.research_dir / "date-evidence.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    print(f"[research] merged={len(candidates)} known_old={sum(c['excluded_known_old'] for c in candidates)} output={private_output}", flush=True)


if __name__ == "__main__":
    main()
