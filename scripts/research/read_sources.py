#!/usr/bin/env python3
"""Acquire explicitly selected public research copies into ignored private storage.

No logins, access-control workarounds, model calls, or public PDF copies. A
successful download is acquisition, never a claim that a human/agent read it.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import subprocess
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
PRIVATE = ROOT / "confidential" / "research"
MAX_BYTES = 35 * 1024 * 1024
LOCK = threading.Lock()
LAST_HOST = {}


def pdf_bytes(data):
    return data.lstrip()[:5] == b"%PDF-" and len(data) > 1024


def urls_for(record):
    urls = list(record.get("fulltext_overrides", []))
    urls += [u for u in record.get("oa_urls", []) if ".pdf" in u.lower() or "/pdf/" in u]
    for location in record.get("locations", []):
        if location.get("pdf_url"):
            urls.append(location["pdf_url"])
    result = []
    for url in urls:
        if url.startswith("http://arxiv.org/"):
            url = url.replace("http://", "https://", 1)
        if urlparse(url).scheme in ("https", "http") and url not in result:
            result.append(url)
    return result


def get_pdf(url):
    host = urlparse(url).hostname
    with LOCK:
        delay = max(0, LAST_HOST.get(host, 0) + 2 - time.monotonic())
        if delay:
            time.sleep(delay)
        LAST_HOST[host] = time.monotonic()
    request = Request(url, headers={"User-Agent": "PaperObservatoryResearch/1.0 (noncommercial source inspection)", "Accept": "application/pdf"})
    with urlopen(request, timeout=35) as response:
        data = response.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            raise ValueError("copy exceeds 35 MiB acquisition limit")
        if not pdf_bytes(data):
            raise ValueError("response is not a valid PDF copy (HTML/challenge is not a paper)")
        return data, response.url


def acquire(record, directory):
    identifier = str(record["ssrn_ids"][0])
    if not re.fullmatch(r"\d+", identifier):
        raise ValueError("SSRN ID must be numeric")
    pdf_path, text_path = directory / f"ssrn-{identifier}.pdf", directory / f"ssrn-{identifier}.txt"
    sidecar = directory / f"ssrn-{identifier}.source.json"
    result = {"ssrn_id": identifier, "title": record["title"], "openalex_id": record["openalex_id"], "reading_status": "not_read", "attempts": []}
    data = pdf_path.read_bytes() if pdf_path.exists() else b""
    if pdf_bytes(data) and sidecar.exists():
        result.update(json.loads(sidecar.read_text()))
    else:
        for url in urls_for(record):
            try:
                data, resolved = get_pdf(url)
                temp = pdf_path.with_suffix(".pdf.part")
                temp.write_bytes(data)
                temp.replace(pdf_path)
                result.update({"source_url": url, "resolved_url": resolved, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
                break
            except (HTTPError, URLError, TimeoutError, ValueError, OSError) as error:
                result["attempts"].append({"url": url, "failure": str(error)[:180]})
        else:
            result["acquisition_status"] = "fulltext_unavailable"
            print(f"[source-intake] ssrn={identifier} fulltext_unavailable", flush=True)
            return result
    result["acquisition_status"] = "pdf_downloaded"
    try:
        subprocess.run(["pdftotext", "-layout", str(pdf_path), str(text_path)], check=True, capture_output=True, timeout=45)
        text = text_path.read_text(errors="replace")
        result["physical_page_count"] = text.count("\f")
        result["extracted_characters"] = len(text)
        result["acquisition_status"] = "text_extracted" if len(text.strip()) > 500 else "pdf_requires_visual_ocr"
    except (OSError, subprocess.SubprocessError) as error:
        result["extraction_error"] = str(error)[:180]
    result["reading_status"] = "not_read"
    sidecar.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    print(f"[source-intake] ssrn={identifier} {result['acquisition_status']} pages={result.get('physical_page_count', '?')}", flush=True)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="selected records JSON list, or object containing papers/candidates")
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=3, choices=range(1, 5))
    args = parser.parse_args()
    if not re.fullmatch(r"[a-zA-Z0-9_-]+", args.run_id):
        parser.error("run-id must contain only letters, digits, underscore or hyphen")
    raw = json.loads(args.input.read_text())
    records = raw if isinstance(raw, list) else raw.get("papers", raw.get("candidates", []))
    if not records:
        parser.error("input has no selected records")
    directory = PRIVATE / args.run_id
    directory.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        results = list(executor.map(lambda record: acquire(record, directory), records))
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(json.dumps({"run_id": args.run_id, "reading_is_separate_from_acquisition": True, "sources": results}, indent=2, ensure_ascii=False) + "\n")
    print(f"[source-intake] acquired={sum(r['acquisition_status'] != 'fulltext_unavailable' for r in results)}/{len(results)} manifest={args.manifest}")


if __name__ == "__main__":
    main()
