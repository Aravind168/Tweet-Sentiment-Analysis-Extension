from flask import Flask, request,jsonify
from flask_cors import CORS
import tempfile
tmpdir = tempfile.gettempdir()
# import spacy
# from spacy.language import Language
# from spacy_langdetect import LanguageDetector

import nltk
nltk.downloader.download('vader_lexicon')
from nltk.sentiment.vader import SentimentIntensityAnalyzer

sid = SentimentIntensityAnalyzer()

# def get_lang_detector(nlp, name):
#     return LanguageDetector()

import json

app = Flask(__name__)
CORS(app)

# @app.route('/api/language-detection', methods=["POST"])
# def detect_english():
#     content_type = request.headers.get('Content-Type')
#     if (content_type == 'application/json'):
#         tweets = json.loads(request.data)
#         output = []
#         model = spacy.load("en_core_web_sm")
#         Language.factory("language_detector", func=get_lang_detector)
#         model.add_pipe('language_detector', last=True)
#         for tweet in tweets:
#             text = tweet["tweet_text"]
#             doc = model(text)
#             detect_language = doc._.language
#             output.append({"tweet_text": text, "is_english": detect_language['language']=='en'})
#         return jsonify(output)       
#     else:
#         return 'Content-Type not supported!'

def load_cache():
    try:
        with open(f"{tmpdir}/cache.json","r") as cache_file:
            cache = json.load(cache_file)
            return cache
    except:
        return {}

@app.route('/ping')
def ping_endpoint():
    return "Pong"

def save_cache(cache):
    with open(f"{tmpdir}/cache.json", "w") as cache_file:
        json.dump(cache, cache_file)

@app.route('/api/sentiment-score', methods=["POST"])
def detect_sentiment():
    # cache = load_cache()
    cache = {}
    res = {}
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        tweets = json.loads(request.data)
        for index, tweet in enumerate(tweets):
            if cache.get(tweet['id']):
                continue
            scores = sid.polarity_scores(tweet['tweet_text'])
            del scores['compound']
            max_score = max(scores, key=scores.get)
            if max_score == "pos":
                mood = "POSITIVE"
            elif max_score == "neu":
                mood = "NEUTRAL"
            else:
                mood = "NEGATIVE"
            tweet['sentiment_score'] = scores
            tweet['detected_mood'] = mood
            cache[tweet['id']] = tweet
            res[tweet['id']] = tweet
        # save_cache(cache)
        return res
    else:
        return 'Content-Type not supported!'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)