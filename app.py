from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

from flask_cors import CORS
CORS(app)

app = Flask(__name__)
CORS(app)

# Load your trained model
model = joblib.load('Predicting Penguin Body mass.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_data = [
        data['culmen_length_mm'],
        data['culmen_depth_mm'],
        data['flipper_length_mm'],
        1 if data['species'] == 'Adelie' else 0,
        1 if data['species'] == 'Chinstrap' else 0,
        1 if data['species'] == 'Gentoo' else 0,
        1 if data['island'] == 'Biscoe' else 0,
        1 if data['island'] == 'Dream' else 0,
        1 if data['island'] == 'Torgersen' else 0,
        1 if data['sex'].upper() == 'FEMALE' else 0,
        1 if data['sex'].upper() == 'MALE' else 0
    ]
    prediction = model.predict([input_data])[0]
    return jsonify({'predicted_mass': round(prediction, 2)})

if __name__ == '__main__':
    app.run(debug=True)