from flask import Flask, redirect, request
import requests
import datetime
import http.client
import json

app = Flask(__name__)

CLIENT_ID = "v49Z5XHsqM1ep0GYPUJXyQtKFsffcCHO"
CLIENT_SECRET = "y4hTzIoFfC9xX9iO"

# PERSON 4

@app.route("/")
def step1():
    redirect_url = "http://localhost:5000/step2"
    return redirect("https://sandbox-api.dexcom.com/v2/oauth2/login?client_id="+CLIENT_ID+"&redirect_uri="+redirect_url+"&response_type=code&scope=offline_access")

@app.route("/test")
def func():
    return "r"

@app.route("/step2")
def step2():
    code = request.args["code"]
    conn = http.client.HTTPSConnection("sandbox-api.dexcom.com")
    redirect_uri = "http://localhost:5000/step2"
    payload = "client_secret="+CLIENT_SECRET+"&client_id="+CLIENT_ID+"&code="+code+"&grant_type=authorization_code&redirect_uri="+redirect_uri

    headers = {
        'content-type': "application/x-www-form-urlencoded",
        'cache-control': "no-cache"
        }
    conn.request("POST", "/v2/oauth2/token", body=payload, headers=headers)

    res = conn.getresponse()
    data = res.read()
    data = json.loads(data)


    headers = {
        'authorization': "Bearer "+data["access_token"]
    }

    conn.request("GET", "/v2/users/self/egvs?startDate=2021-06-01T15:30:00&endDate=2021-06-30T15:45:00", headers=headers)

    res = conn.getresponse()
    data = res.read()
    data = json.loads(data)
    latest = data["egvs"][-1]["value"]
    requests.post("https://hackmit2021-backend.azurewebsites.net/glucose/2871/"+str(latest))
    return data

if __name__ == '__main__':
   app.run(debug=True)