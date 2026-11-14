# Research record and evidence states

Use JSON or equivalent as authoritative data; generate readable Markdown from it. Preserve identifiers/evidence across reruns rather than erasing exclusions, reviews or version relationships. Provider records may use different field names; document their mapping instead of forcing a migration.

## Run manifest

Record stable `run_id`, topic/source scope, target count, inclusive release dates/date basis, citation measure/snapshot date; exact queries/filters, pagination coverage, retrieval times, provider/API version if exposed and failures; candidate/eligible/uncertain/excluded/citation-known/full-text-reviewed counts; outputs, private cache/expiry, actual model/reasoning when available, generator revision and checks.

Use coverage label `complete_within_query` or `candidate_search` and explain index limitations even for complete queries. Distinguish local as-of dates from UTC retrieval times. Never store credentials or signed download tokens in public provenance.

## Per-work minimum

| Fields | Purpose |
| --- | --- |
| `work_id`, `title`, `authors` | Stable identity and verified metadata. |
| `source`, `source_id`, `canonical_url`, `doi`, `aliases`, `version_group` | Source eligibility and deduplication; SSRN ID and DOI are distinct. |
| `first_release_date`, `first_ssrn_posted_date`, `publication_date`, `revision_date`, `date_evidence` | Avoid admitting old preprints due to recent publication/revision. Unknown/partial dates remain explicit. |
| `eligibility_status`, `finance_reason`, `ai_reason`, `exclusion_reason` | Substantive screening: `eligible`, `excluded` or `uncertain`. |
| `citation_count`, `citation_provider`, `citation_entity_id`, `citation_url`, `citation_retrieved_at`, `citation_measure` | Count actually used; nonnegative integer or `null`. |
| `citation_rank`, `tie_break` | Reproducible scholarly order. |
| `full_text_url`, `source_version`, `source_sha256`, `physical_page_count`, `page_mapping` | Actual document reviewed; private local paths can remain in a private manifest. |
| `read_status`, `review_scope`, `evidence`, `access_attempts` | Reading truthfulness and location-based support. |
| `applicability_rank`, `score_components`, `score_total`, `score_provisional`, `evidence_confidence`, `build_readiness` | Editorial judgment separate from citations. |
| `learning_question`, `misconception`, `experiment_concept`, `source_caveat`, `next_action`, `brief_path` | Paper-specific concept and actionable handoff. |

Do not manufacture a required field; use `null` and a reason when unknown. Retain inaccessible records. Additional useful provider fields are fine.

Initial OpenAlex adapter mapping: its OpenAlex ID is the provider work ID; `publication_date_indexed` is **not verified first release**; `ssrn_first_posted_date:null` remains unverified; `reading_status:not_read` maps to `read_status:not_attempted`. Its citation fields/source/scope retain their original definitions. A separate manual review may supply date evidence, relevance decisions, reading notes and editorial scores without overwriting the retrieval snapshot.

## Reading states

- `not_attempted`: no source review yet.
- `metadata_only`: title/authors/provider metadata inspected.
- `abstract_only`: actual abstract inspected; paper unreviewed.
- `partial`: some full text inspected; name reviewed sections and unresolved questions.
- `full_text_reviewed`: methods, mechanism/results and relevant qualifications inspected sufficiently to support the design; describe scope without implying every word was read.
- `inaccessible`: available legitimate routes exhausted; retain what was inspected and the barrier.

Downloading/extracting a file is not reading. Publisher HTML may be full text: cite sections/figures if PDF pages are unavailable. An author manuscript may differ from SSRN; record that relationship rather than silently attributing later results to an earlier version.

## Evidence map

Each central claim/design mechanism needs a stable claim ID, original brief paraphrase, source ID/version/hash, physical PDF page(s) or stable HTML section, figure/table/equation where relevant, qualification and classification: `paper_finding`, `educational_reconstruction` or `teaching_extension`.

For extensions cite the source premise and state new assumptions. A toy may illustrate intuition without reproducing fitted results. Render garbled equations before using them. Tracked outputs contain brief original notes, not full papers, copied abstracts or extracted text.

## Verification

Check uniqueness/version groups; exact dates; finance/AI reasons; canonical URLs; citation values/timestamps, monotone ordering and ties; actual versus target count; applicability-record completeness; truthful reading totals; and evidence behind leaders. Match manifest totals to records. Report gaps in the readable report. A full-sized list or numerical score does not establish exhaustive discovery or full-text reading.
