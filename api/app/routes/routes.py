from app import app
from flask import Flask, jsonify, request, render_template, Response, make_response
from flask_caching import Cache
import requests
from flask_cors import CORS

CORS(app)

appid = app.config["APP_ID"]
cache = Cache()
cache.init_app(app, config={"CACHE_TYPE": "simple"})

url = "http://api.openweathermap.org/data/2.5/weather?units=metric"
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
        if response.status_code == requests.codes.ok:
            cache.add(city_name,response.text, timeout=300) #5 minutes cache
            response = response.text
            city_dict[city_name]=response
        else:
            # Replace Open Weather response
            response = make_response({"status": 404,"message":"city not found"}, 404)
    return response

@app.route('/weather', methods=['GET'])
def cached():
    dict_items = cache.get_many(*city_dict.keys())
    if 'max_number' in request.args:
        max_number = request.args['max_number']
        response = list(dict_items)[:int(max_number)]
    else:
        response = dict_items
    #Easy to read/compact
    #return(jsonify(response))

    #JSON output
    return Response(response,  mimetype='application/json')
