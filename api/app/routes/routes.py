from app import app
from flask import Flask, jsonify, request, render_template, Response
from flask_caching import Cache
import requests

appid = app.config["APP_ID"]
cache = Cache()
cache.init_app(app, config={"CACHE_TYPE": "simple"})

url = "http://api.openweathermap.org/data/2.5/weather"
payload = ""
city_dict = {}
import json
def checkKey(key):
    response = requests.request("GET", url, data=payload, params={"q":'Porto Velho',"appid":key})
    try:
        json.loads(response.text)
        appid = key
        value = True
    except Exception as e:
        value = False
    return value

@app.route('/', methods=['GET','POST'])
def home():
    template = ""
    color=""
    text=""
    page_title = 'DevGrid challenge'
    if request.method == 'GET' and checkKey(appid) == True:
        text="Congrats! You have a valid API key!"
        color="success"
        template = '/wizard2.html'
    else:
        if request.method == 'POST':
            formKey = request.form.get('InputAPIKey')
            if checkKey(formKey) == True:
                template = '/wizard2.html'
            else:
                page_title = 'DevGrid challenge'
                template = '/wizard1.html'
        else:
            template = '/wizard1.html'

    return render_template(template,title=page_title, alert_color=color, alert_text=text)


@app.route('/weather/<city_name>', methods=['GET'])
def city(city_name):
    querystring = {"q":city_name,"appid":appid}
    cached = cache.get(city_name)
    if cached:
        response = cached
    else:
        response = requests.request("GET", url, data=payload, params=querystring)
        cache.add(city_name,response.text, timeout=300) #5 minutes cache
        city_dict[city_name]=response.text
        response = response.text
    return (response)

@app.route('/weather', methods=['GET'])
def cached():
    dict_items = cache.get_many(*city_dict.keys())
    if 'max_number' in request.args:
        max_number = request.args['max_number']
    response = list(dict_items)[:int(max_number)]

    #Easy to read/compact
    #return(jsonify(response))

    #JSON output
    return Response(response,  mimetype='application/json')
