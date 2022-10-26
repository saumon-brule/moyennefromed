from flask import Flask
from markupsafe import escape

app = Flask(__name__)

@app.route("/<name>")
def hello(name):
    return f"Hello, {escape(name)}!"



@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/aaa")
def hello_world2():
    return "<p>iudfisiufds</p>"
