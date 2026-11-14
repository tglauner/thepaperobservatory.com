#!/usr/bin/env python3
"""Build citation and exhibit registers from the public SSRN research records."""

import argparse
import csv
import json
from pathlib import Path


WEIGHTS = {
    "mechanism": 25,
    "interaction": 20,
    "misconception_transfer": 20,
    "source_fidelity": 15,
    "feasibility": 10,
    "collection_value": 10,
}


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SystemExit(f"[research] cannot read valid JSON from {path}: {error}") from error


def write_csv(path, fields, rows):
    with path.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def citation_candidates(candidates):
    ranked = []
    skipped = 0
    for candidate in candidates:
        count = candidate.get("citation_count")
        if not isinstance(count, int) or count < 0:
            skipped += 1
            continue
        ranked.append(candidate)

    ranked.sort(key=lambda row: (-row["citation_count"], row["openalex_id"]))
    seen_ssrn_ids = set()
    unique = []
    for candidate in ranked:
        ids = [str(value) for value in candidate.get("ssrn_ids", [])]
        if not ids or any(value in seen_ssrn_ids for value in ids):
            continue
        seen_ssrn_ids.update(ids)
        unique.append(candidate)
    return unique, skipped


def date_fields(ssrn_id, dates, scout_dates):
    record = dates.get(ssrn_id)
    if record:
        return (
            record.get("ssrn_posted_date"),
            record.get("date_status", "not_verified"),
            record.get("evidence_url"),
        )
    record = scout_dates.get(ssrn_id)
    if record:
        return (
            record.get("ssrn_first_posted_date"),
            "ssrn_posted_date_verified; earlier_release_unchecked",
            record.get("source_url"),
        )
    return None, "not_verified", None


def topic_fields(ssrn_id, reviews, exclusions, borderline):
    if ssrn_id in exclusions:
        return "excluded_topic", exclusions[ssrn_id]
    if ssrn_id in borderline:
        return "borderline_scope", borderline[ssrn_id]
    if ssrn_id in reviews:
        return "editorial_screened", "Included in the 52-record editorial review; see separate reading status."
    return (
        "needs_substantive_screen",
        "Search match only; finance-and-AI relevance has not been manually verified.",
    )


def candidate_rows(candidates, limit, reviews, dates, scout_dates, exclusions, borderline):
    fields = [
        "citation_search_rank", "title", "authors", "ssrn_id", "ssrn_url",
        "openalex_id", "openalex_publication_date", "ssrn_posted_date",
        "ssrn_date_status", "ssrn_date_evidence_url", "citation_count",
        "citation_provider", "citation_entity_id", "citation_retrieved_at",
        "citation_scope", "finance_term_hits", "ai_term_hits",
        "topic_screen_status", "topic_screen_note", "reading_status",
        "applicability_score", "score_provisional", "proposed_exhibit",
        "experiment_concept", "source_caveat", "evidence_pages",
    ]
    rows = []
    for rank, candidate in enumerate(candidates[:limit], 1):
        ssrn_id = str(candidate["ssrn_ids"][0])
        review = reviews.get(ssrn_id)
        posted, date_status, date_url = date_fields(ssrn_id, dates, scout_dates)
        topic, topic_note = topic_fields(ssrn_id, reviews, exclusions, borderline)
        ssrn_urls = candidate.get("ssrn_urls") or []
        rows.append({
            "citation_search_rank": rank,
            "title": candidate.get("title"),
            "authors": "; ".join(candidate.get("authors") or []),
            "ssrn_id": ssrn_id,
            "ssrn_url": ssrn_urls[0] if ssrn_urls else f"https://ssrn.com/abstract={ssrn_id}",
            "openalex_id": candidate["openalex_id"],
            "openalex_publication_date": candidate.get("publication_date_indexed"),
            "ssrn_posted_date": posted,
            "ssrn_date_status": date_status,
            "ssrn_date_evidence_url": date_url,
            "citation_count": candidate["citation_count"],
            "citation_provider": "OpenAlex",
            "citation_entity_id": candidate["openalex_id"],
            "citation_retrieved_at": candidate.get("citation_retrieved_at"),
            "citation_scope": candidate.get("citation_scope"),
            "finance_term_hits": "; ".join(candidate.get("finance_matches") or []),
            "ai_term_hits": "; ".join(candidate.get("ai_matches") or []),
            "topic_screen_status": topic,
            "topic_screen_note": topic_note,
            "reading_status": review.get("read_status") if review else "not_attempted",
            "applicability_score": review.get("score_total") if review else None,
            "score_provisional": review.get("score_provisional") if review else None,
            "proposed_exhibit": review.get("proposed_exhibit_title") if review else None,
            "experiment_concept": review.get("experiment_concept") if review else None,
            "source_caveat": review.get("caveat") if review else None,
            "evidence_pages": "; ".join(map(str, review.get("evidence_pages") or [])) if review else None,
        })
    return fields, rows


def editorial_rows(review_records, citation_rank, sources, dates, scout_dates, exclusions, borderline):
    fields = [
        "applicability_rank", "score_total", "ssrn_id", "title", "authors",
        "canonical_ssrn_url", "citation_rank_in_title_finance_search",
        "citation_count", "citation_provider", "citation_entity_id",
        "citation_retrieved_at", "citation_scope", "ssrn_posted_date",
        "ssrn_date_status", "ssrn_date_evidence_url", "topic_screen_status",
        "topic_screen_note", "score_provisional", "read_status",
        "evidence_confidence", "build_readiness", "next_action",
        "mechanism_0_5", "interaction_0_5", "misconception_transfer_0_5",
        "source_fidelity_0_5", "feasibility_0_5", "collection_value_0_5",
        "proposed_exhibit", "experiment_concept", "learning_outcome",
        "caveat", "evidence_pages",
    ]
    ranked = sorted(review_records, key=lambda row: (-row["score_total"], str(row["ssrn_id"])))
    rows = []
    for rank, review in enumerate(ranked, 1):
        ssrn_id = str(review["ssrn_id"])
        source_reference = sources.get(ssrn_id, {})
        target = source_reference.get("title_finance_search_record") or {}
        source = target or source_reference.get("merged_record") or {}
        citation = target or source_reference.get("merged_record") or {}
        components = review["score_components"]
        score = round(sum(WEIGHTS[key] * components[key] / 5 for key in WEIGHTS))
        if score != review["score_total"]:
            raise SystemExit(f"[research] score arithmetic mismatch for SSRN {ssrn_id}")
        posted, date_status, date_url = date_fields(ssrn_id, dates, scout_dates)
        topic, topic_note = topic_fields(ssrn_id, {ssrn_id: review}, exclusions, borderline)

        if review["read_status"] == "full_text_sections_reviewed":
            confidence = "medium"
            readiness = "needs_reproduction_work"
            next_action = (
                "Verify data/source rights and prototype the labeled teaching reconstruction; "
                "re-check evidence pages during implementation."
            )
        else:
            confidence = "low"
            readiness = "needs_full_text"
            next_action = (
                "Acquire permitted full text; verify method, results, limitations and page anchors "
                "before finalizing the score or design."
            )

        canonical = source.get("canonical_url")
        if not canonical:
            urls = source.get("ssrn_urls") or []
            canonical = urls[0] if urls else f"https://ssrn.com/abstract={ssrn_id}"
        citation_count = citation.get("citation_count")
        rows.append({
            "applicability_rank": rank,
            "score_total": review["score_total"],
            "ssrn_id": ssrn_id,
            "title": source.get("title") or review.get("proposed_exhibit_title"),
            "authors": "; ".join(source.get("authors") or []),
            "canonical_ssrn_url": canonical,
            "citation_rank_in_title_finance_search": citation_rank.get(ssrn_id),
            "citation_count": citation_count,
            "citation_provider": "OpenAlex" if citation_count is not None else None,
            "citation_entity_id": citation.get("openalex_id") if citation_count is not None else None,
            "citation_retrieved_at": citation.get("citation_retrieved_at") if citation_count is not None else None,
            "citation_scope": citation.get("citation_scope") if citation_count is not None else None,
            "ssrn_posted_date": posted,
            "ssrn_date_status": date_status,
            "ssrn_date_evidence_url": date_url,
            "topic_screen_status": topic,
            "topic_screen_note": topic_note,
            "score_provisional": review["score_provisional"],
            "read_status": review["read_status"],
            "evidence_confidence": confidence,
            "build_readiness": readiness,
            "next_action": next_action,
            **{f"{key}_0_5": components[key] for key in WEIGHTS},
            "proposed_exhibit": review.get("proposed_exhibit_title"),
            "experiment_concept": review.get("experiment_concept"),
            "learning_outcome": review.get("learning_outcome"),
            "caveat": review.get("caveat"),
            "evidence_pages": "; ".join(map(str, review.get("evidence_pages") or [])),
        })
    return fields, rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--research-dir", type=Path, default=Path("docs/research/finance-ai-2026-11-14"))
    parser.add_argument("--limit", type=int, default=100, help="citation-ranked candidate rows to export")
    args = parser.parse_args()
    if not 1 <= args.limit <= 1000:
        parser.error("limit must be between 1 and 1000")

    directory = args.research_dir
    targeted = load_json(directory / "candidates-targeted.json")
    merged = load_json(directory / "candidates-merged.json")
    review_doc = load_json(directory / "review-a.json")
    date_audit = load_json(directory / "bibliography-date-audit.json")
    scout_dates = load_json(directory / "scout-date-verification.json")
    seeds = load_json(directory / "scout-seeds.json")

    candidates, skipped_counts = citation_candidates(targeted.get("candidates", []))
    if len(candidates) < args.limit:
        raise SystemExit(
            f"[research] requested {args.limit} unique, citation-known candidates; "
            f"only {len(candidates)} are available"
        )

    reviews = {str(row["ssrn_id"]): row for row in review_doc}
    merged_by_id = {
        str(ssrn_id): row
        for row in merged.get("candidates", [])
        for ssrn_id in row.get("ssrn_ids", [])
    }
    for row in seeds.get("papers", []) + seeds.get("excluded_or_unresolved", []):
        merged_by_id.setdefault(str(row.get("ssrn_id")), row)

    title_search_by_id = {
        str(ssrn_id): row for row in candidates for ssrn_id in row.get("ssrn_ids", [])
    }
    citation_rank = {
        ssrn_id: rank
        for rank, row in enumerate(candidates, 1)
        for ssrn_id in row.get("ssrn_ids", [])
    }
    source_map = {
        ssrn_id: {
            "title_finance_search_record": title_search_by_id.get(ssrn_id, {}),
            "merged_record": merged_by_id.get(ssrn_id, {}),
        }
        for ssrn_id in set(merged_by_id) | set(title_search_by_id)
    }
    dates = {str(row["ssrn_id"]): row for row in date_audit.get("records", [])}
    exclusions = {
        str(row["ssrn_id"]): row["reason"]
        for row in date_audit.get("topic_review_exclusions", [])
    }
    borderline = {
        str(row["ssrn_id"]): row["reason"]
        for row in date_audit.get("topic_review_borderline", [])
    }

    candidate_header, candidate_data = candidate_rows(
        candidates[:args.limit], args.limit, reviews, dates, scout_dates, exclusions, borderline
    )
    editorial_header, editorial_data = editorial_rows(
        review_doc, citation_rank, source_map, dates, scout_dates, exclusions, borderline
    )
    write_csv(directory / f"citation-ranked-candidates-top-{args.limit}.csv", candidate_header, candidate_data)
    write_csv(directory / "editorial-applicability-ranking.csv", editorial_header, editorial_data)
    print(
        f"[research] citation_candidates={len(candidate_data)} "
        f"editorial_records={len(editorial_data)} "
        f"skipped_missing_citation_count={skipped_counts}"
    )


if __name__ == "__main__":
    main()
