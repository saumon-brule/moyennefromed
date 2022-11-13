from flask import Flask
import requests
app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/aaa")
def hello_world2():
    return "<p>iudfisiufds</p>"