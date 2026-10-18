import sys

def import_check(name):
    print(f"Importing {name}...", end="", flush=True)
    if name == "numpy":
        import numpy
    elif name == "rapidfuzz":
        import rapidfuzz
    elif name == "sklearn":
        import sklearn
    elif name == "sklearn.metrics.pairwise":
        import sklearn.metrics.pairwise
    print(" OK", flush=True)

import_check("numpy")
import_check("rapidfuzz")
import_check("sklearn")
import_check("sklearn.metrics.pairwise")
print("Done!", flush=True)
