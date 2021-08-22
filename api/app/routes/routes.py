from app import app
from flask import Flask, jsonify, request, render_template, Response, make_response
from flask_caching import Cache
import requests
import json
import fileinput, os
from flask_cors import CORS

# App config
CORS(app)
appid = app.config["APP_ID"]
cache = Cache()
cache.init_app(app, config={"CACHE_TYPE": "simple"})

# Open weather variables
url = "http://api.openweathermap.org/data/2.5/weather?units=metric"
payload = ""
city_dict = {}

def checkKey(key):
    """Check if you have a valid Open Weather API key."""
    response = requests.request("GET", url, data=payload, params={"q":'Porto Velho',"appid":key})
    if response.status_code == 401:
        value = False
    else:
        json.loads(response.text)
        print(json.loads(response.text))
        appid = key
        value = True
    return value

@app.route('/', methods=['GET','POST'])
def home():
    """API Wizard on localhost:3000"""
    template = "" #set wizard page
    color=""      #warning color
    text=""       #warning text
    page_title = 'DevGrid challenge'

    # Check if is a valid key and update config.py, else show the first wizard page.
    if request.method == 'POST':
        formKey = request.form.get('InputAPIKey')
        if checkKey(formKey) == True:
            with fileinput.FileInput(files="./config.py", inplace = True) as file:
                for line in file:
                    print(line.replace("APP_ID = ''", "APP_ID = '{}'".format(formKey)), end='')
            text="Congrats! You have a valid API key!"
            color="success"
            template = '/wizard2.html'
        else:
            text="Please enter a valid key."
            color="warning"
            template = '/wizard1.html'
    else:
        template = '/wizard1.html'

    return render_template(template,title=page_title, alert_color=color, alert_text=text)


@app.route('/weather/<city_name>', methods=['GET'])
def city(city_name):
    """Search by city name"""
    querystring = {"q":city_name,"appid":appid}

    # First, check for cached results, else do a web request
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
            # Replace Open Weather error response
            response = make_response({"status": 404,"message":"city not found"}, 404)
    #JSON output
    return response

@app.route('/weather', methods=['GET'])
def cached():
    """Show cached results"""
    dict_items = cache.get_many(*city_dict.keys())
    if 'max_number' in request.args:
        max_number = request.args['max_number']
        response = list(dict_items)[:int(max_number)]
    else:
        response = dict_items
    #Check for cached results, else, shows erro message.
    if type(response) is dict:
        response = Response(response,  mimetype='application/json')
    else:
        response = make_response({"status": 404,"message":"No cached items"}, 404)
    #JSON output
    return response
