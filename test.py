from serpapi import GoogleSearch



api_key = '691986edba9c7f25864bae723e969a468e753ac2088e17da4832ba4cf44a5789'

params = {
  "q": "Oppenheimer where to watch",
  "location": 'United States',
  'hl': 'en',
  'gl': 'us',
  'api_key': api_key
}

search = GoogleSearch(params)
results = search.get_dict()
available_on = results['available_on']
print(available_on)