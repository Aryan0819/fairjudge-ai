import sys

def import_check(module_name):
    print(f"Testing import of: {module_name}...", end="", flush=True)
    try:
        if module_name == "fastapi":
            import fastapi
        elif module_name == "app.database":
            import app.database
        elif module_name == "app.services.duplicate_detector":
            import app.services.duplicate_detector
        elif module_name == "app.services.bias_detector":
            import app.services.bias_detector
        elif module_name == "app.services.review_agent":
            import app.services.review_agent
        elif module_name == "app.services.reviewer_assignment":
            import app.services.reviewer_assignment
        elif module_name == "app.services.team_builder":
            import app.services.team_builder
        print(" OK", flush=True)
    except Exception as e:
        print(" FAILED with exception:")
        import traceback
        traceback.print_exc()

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

import_check("fastapi")
import_check("app.database")
import_check("app.services.duplicate_detector")
import_check("app.services.bias_detector")
import_check("app.services.review_agent")
import_check("app.services.reviewer_assignment")
import_check("app.services.team_builder")
print("All imports tested!", flush=True)
