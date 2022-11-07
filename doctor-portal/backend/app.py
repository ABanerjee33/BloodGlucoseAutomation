from flask import Flask
import requests
import datetime

app = Flask(__name__)

base_url = "https://fhir.1np1gvnit708.static-test-account.isccloud.io"
headers = {"Accept": "application/json", "x-api-key": "IexZ6GCn4s73xW7IaqEQL6UtWN8DE4AB5xUYN28k"}

@app.route('/patient/<patient_id>')
def get_patient_data(patient_id):
    patient_url = base_url + "/Patient/"+patient_id
    req = requests.get(patient_url, headers=headers)
    user_data = req.json()
   
    glucose_url = base_url + "/Basic"
    req = requests.get(glucose_url, headers=headers)
    glucoses = req.json()
    
    patients_glucoses = []

    for entry in glucoses["entry"]:
        if entry['resource']['author']['reference'] == "Patient/"+patient_id:
            # print(entry["resource"]["text"]["div"])
            patients_glucoses.append(entry)
    
    return {
        "patient_info": user_data,
        "glucoses": patients_glucoses
    }

@app.route("/glucose/<patient_id>/<value>", methods=["POST"])
def new_glucose(patient_id, value):
    value = str(value)
    patient_url = base_url + "/Patient/"+patient_id
    req = requests.get(patient_url, headers=headers)
    user_data = req.json()
    last_name = ''.join([i for i in user_data["name"][0]["family"] if not i.isdigit()])
    first_name= ''.join([i for i in user_data["name"][0]["given"][0] if not i.isdigit()])
    name = f"{first_name} {last_name}"

    date = datetime.datetime.now().__str__().split(" ")[0]
    data = """
{
    "resourceType": "Basic",
    "id": "glucose_measurement",
    "text": {
        "id": "Blood Glucose Level",
        "status": "generated",
        "div": \""""+value+"""\"
    },
    "identifier": [
        {
        "system": "http://goodhealth.org/basic/identifiers",
        "value": "19283746"
        }
    ],
    "code": {
        "coding": [
        {
            "system": "http://terminology.hl7.org/CodeSystem/basic-resource-type",
            "code": "protocol"
        }
        ]
    },
    "subject": {
        "reference": "Patient/"""+patient_id+"""\",
        "display": \"""" +name +"""\"
    },
    "created": \""""+date+"""\",
    "author": {
        "reference": "Patient/"""+patient_id+"""\"
    },
    "meta": {
        "tag": [
        {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
            "code": "HTEST",
            "display": "Blood Glucose Sample"
        }
        ]
    }
}"""
    print(data)
    res = requests.post(base_url + "/Basic", headers=headers, data=data)
    print(res)
    print(res.json())
    if res.status_code == 200:
        return "Success"
    else:
        return res

if __name__ == '__main__':
   app.run()