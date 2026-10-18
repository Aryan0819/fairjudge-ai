import importlib
import traceback

modules = [
    'app.database',
    'app.services.duplicate_detector',
    'app.services.bias_detector',
    'app.services.review_agent',
    'app.services.reviewer_assignment',
    'app.services.team_builder',
]

for m in modules:
    try:
        importlib.import_module(m)
        print(m, 'OK')
    except Exception:
        print(m, 'FAILED')
        traceback.print_exc()
