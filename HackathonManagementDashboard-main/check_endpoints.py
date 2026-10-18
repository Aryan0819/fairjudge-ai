import requests

urls = {
    'ai-service': 'http://127.0.0.1:8000/health',
    'backend': 'http://127.0.0.1:5000/health',
    'frontend': 'http://127.0.0.1:3000'
}

for name, url in urls.items():
    try:
        r = requests.get(url, timeout=5)
        print(name, '->', r.status_code, r.text[:200])
    except Exception as e:
        print(name, 'FAILED:', e)
