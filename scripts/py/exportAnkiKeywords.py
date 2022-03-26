#!/bin/python3
import json
import pprint
import urllib.request


def request(action, **params):
    return {'action': action, 'params': params, 'version': 6}


def invoke(action, **params):
    requestJson = json.dumps(request(action, **params)).encode('utf-8')
    response = json.load(urllib.request.urlopen(
        urllib.request.Request('http://localhost:8765', requestJson)))
    if len(response) != 2:
        raise Exception('response has an unexpected number of fields')
    if 'error' not in response:
        raise Exception('response is missing required error field')
    if 'result' not in response:
        raise Exception('response is missing required result field')
    if response['error'] is not None:
        raise Exception(response['error'])
    return response['result']


results = invoke('findCards', query='deck:Reading')
skritterResults = invoke('findCards', query='deck:Skritter')
# result = invoke('deckNames')
# print('got list of decks: {}'.format(result))

info = invoke('cardsInfo', cards=results)
skritterInfo = invoke('cardsInfo', cards=skritterResults)

with open("../../config.json", "r") as c:
    config = json.load(c)

    with open(config['ankiKeywords'], "w", encoding='utf8') as w:

        for card in info:
            card['answer'] = ""
            card['question'] = ""
            card['css'] = ""

            fields = card['fields']
            word = ""

            if (card['modelName'] == "Refold Mandarin 1k"):
                word = fields['Simplified']['value']
            elif (card['modelName'] == "Reading Card"):
                word = fields['Simplified']['value']
            else:
                pprint.pprint(card)
                exit(0)

            w.write(word + "\n")

        for card in skritterInfo:
            fields = card['fields']
            word = fields['Word']['value']
            w.write(word + "\n")
