# Apply OpenAI httpx compatibility patch
from openai._base_client import SyncHttpxClientWrapper

original_init = SyncHttpxClientWrapper.__init__

def patched_init(self, **kwargs):
    """
    Patch to handle httpx version compatibility.
    httpx 0.28.1 removed the 'proxies' parameter in favor of 'proxy'.
    This patch converts 'proxies' to 'proxy' if present.
    """
    if 'proxies' in kwargs:
        proxies = kwargs.pop('proxies')
        if proxies is not None:
            # If proxies is a dict, convert to single proxy URL
            # For now, just use the first proxy or None
            if isinstance(proxies, dict):
                # Use http proxy if available, otherwise https
                proxy_url = proxies.get('http') or proxies.get('https')
                if proxy_url:
                    kwargs['proxy'] = proxy_url
            else:
                kwargs['proxy'] = proxies
    return original_init(self, **kwargs)

SyncHttpxClientWrapper.__init__ = patched_init
