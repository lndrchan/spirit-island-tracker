from flask import Flask, render_template, request, jsonify, session
import git
import os

app = Flask(__name__)

@app.route("/")
def main():
    if request.method == 'POST':
        return render_template("main.html")
    else:
        return render_template("main.html")

@app.route('/update-server', methods=['POST'])
def webhook():
    if request.method == 'POST':
        repo = git.Repo('/home/lndr/SI-Helper')
        origin = repo.remotes.origin
        origin.pull()
        return 'Updated PythonAnywhere successfully', 200
    else:
        return 'Wrong event type', 400