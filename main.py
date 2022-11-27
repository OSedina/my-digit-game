from model import Model
from flask import Flask, render_template, request
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app, headers=['Content-Type'])

if __name__ == '__main__':
	model = Model()

@app.route("/", methods=["POST", "GET", 'OPTIONS'])
def index_page():
	return render_template('index.html')

@app.route('/predict', methods = ["GET", "POST", 'OPTIONS'])
def predict():
	if request.method == 'POST':
		image_b64 = request.values['imageBase64']
		prediction = model.predict(image_b64)
		return json.dumps(prediction)


if __name__ == '__main__':
	port = int(os.environ.get("PORT", 5000))
	app.run(host='0.0.0.0', port=port, debug=False)
