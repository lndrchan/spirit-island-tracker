from flask import Flask, render_template, request, jsonify, session, redirect
import git
import os

app = Flask(__name__)


@app.route("/")
def main():
    return redirect('/SI-Helper')

@app.route("/SI-Helper")
def sih():
    return render_template("main.html")


'''

@app.route('/SI-Helper/update-server', methods=['POST'])
def webhook():
    repo = git.Repo('/home/lndr/SI-Helper')
    if request.method == 'POST':
        origin = repo.remotes.origin
        origin.pull()
        return 'Updated PythonAnywhere successfully', 200
    else:
        return 'Wrong event type', 400
        
'''