import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

visited = set()

def crawl(target, max_pages=20):

    urls = set()
    to_visit = [target]

    while to_visit and len(urls) < max_pages:

        url = to_visit.pop(0)

        if url in visited:
            continue

        visited.add(url)

        try:
            res = requests.get(url, timeout=5)
            soup = BeautifulSoup(res.text, "html.parser")

            urls.add(url)

            for link in soup.find_all("a", href=True):
                full_url = urljoin(url, link["href"])

                if urlparse(full_url).netloc == urlparse(target).netloc:
                    if full_url not in visited:
                        to_visit.append(full_url)

        except:
            continue

    return list(urls)