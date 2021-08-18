from flask import Flask, jsonify

app = Flask(__name__)
app.config.from_object('config')
app.config["DEBUG"] = True

from .routes import routes
