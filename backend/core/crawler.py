import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re


def crawl(target, max_pages=30):

    visited = set()
    urls = set()
    to_visit = [target]

    while to_visit and len(urls) < max_pages:

        url = to_visit.pop(0)

        if url in visited:
            continue

        visited.add(url)

        try:
            res = requests.get(
                url,
                timeout=5,
                headers={"User-Agent": "Mozilla/5.0"}
            )

            # ✅ only HTML pages
            if "text/html" not in res.headers.get("Content-Type", ""):
                continue

            soup = BeautifulSoup(res.text, "html.parser")

            urls.add(url)

            # -------- HTML LINKS --------
            for tag in soup.find_all(["a", "form"]):

                if tag.name == "a" and tag.get("href"):
                    link = tag.get("href")

                elif tag.name == "form" and tag.get("action"):
                    link = tag.get("action")

                else:
                    continue

                full_url = urljoin(url, link)

                # ❌ skip junk
                if full_url.startswith(("javascript:", "mailto:")):
                    continue

                # ✅ same domain
                if urlparse(full_url).netloc != urlparse(target).netloc:
                    continue

                # ✅ clean URL
                full_url = full_url.split("#")[0]

                if full_url not in visited:
                    to_visit.append(full_url)

            # -------- 🔥 JS LINK EXTRACTION (UPGRADE) --------
            scripts = soup.find_all("script")

            for script in scripts:
                if script.string:
                    found_links = re.findall(r'https?://[^\s"\']+', script.string)

                    for js_url in found_links:
                        if urlparse(js_url).netloc == urlparse(target).netloc:
                            urls.add(js_url)

        except Exception:
            continue

    # ✅ fallback (VERY IMPORTANT)
    if not urls:
        urls.add(target)

    return list(urls)