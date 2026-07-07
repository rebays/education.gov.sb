import logging
import os
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)


def revalidate_frontend(sender, instance, **kwargs):
    frontend_url = os.environ.get("FRONTEND_URL", "").rstrip("/")
    secret = os.environ.get("REVALIDATE_SECRET", "")

    if not frontend_url or not secret:
        logger.warning("FRONTEND_URL or REVALIDATE_SECRET not set — skipping revalidation")
        return

    url = f"{frontend_url}/api/revalidate?secret={secret}"
    req = urllib.request.Request(url, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            logger.info("Frontend revalidated: %s", resp.status)
    except urllib.error.URLError as e:
        logger.error("Frontend revalidation failed: %s", e)
