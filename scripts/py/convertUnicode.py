import json
import sys

filename = sys.argv[1]
with open(filename) as f:
    wordlist = json.load(f)
    for word in wordlist:
        print(word)
