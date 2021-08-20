from flask import Flask, jsonify

app = Flask(__name__)
app.config.from_object('config')
app.config["DEBUG"] = True

from .routes import routes

if __name__ == "__main__":
    app.run(host="127.0.0.1", debug=True)
