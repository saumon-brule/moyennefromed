from flask import Flask
from markupsafe import escape


app = Flask(__name__)

@app.route("/")
def hello_world2():
    return  """ <li class="deroulant">
                    <a href=#>Choisir ses actions</a>
                    <ul class="sous">
					    <li><a href="http://127.0.0.1:5000/hello">Hello World</a>
                        <li><a href="http://127.0.0.1:5000/carre/">carré de vide</a>
                        <li><a href="http://127.0.0.1:5000/carre/1">carré de 1</a>
                        <li><a href="http://127.0.0.1:5000/carre/h">carré de h</a>
			        </ul>
            """

@app.route("/hello")
def hello_world():
    return """<p>Hello, World!</p>
    """

@app.route("/<name>")
def hello(name):
    return f"Hello, {escape(name)}!"

@app.route("/carre/<int:init>")
def carreNbr(init):
    nbr = init * init
    return f"Le carré de{escape(init)} est {escape(nbr)}"

@app.route('/<path:subpath>')
def show_subpath(subpath):
    # show the subpath after /path/
    return f'Subpath = {escape(subpath)}'