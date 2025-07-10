# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np # It's good practice to import numpy if you're working with numerical data for models

# 1. Initialize the Flask app FIRST
app = Flask(__name__)

# 2. Apply CORS to the app AFTER it's initialized.
#    You only need one CORS(app) call.
CORS(app) # This will enable CORS for all routes and all origins by default.
           # For production, you might want to specify origins:
           # CORS(app, resources={r"/predict": {"origins": "https://your-github-pages-domain.com"}})


# Load your trained model
# Ensure 'Predicting Penguin Body mass.joblib' is in the same directory as app.py
try:
    model = joblib.load('Predicting Penguin Body mass.joblib')
except FileNotFoundError:
    print("Error: 'Predicting Penguin Body mass.joblib' not found. Make sure the model file is in the correct directory.")
    # You might want to exit or raise an error if the model is crucial
    # For deployment, this could lead to 500 errors if the model isn't found.
    model = None # Set model to None to handle gracefully in predict()

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded on server. Please contact administrator.'}), 500

    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Invalid JSON data provided.'}), 400

        # Extract features and handle one-hot encoding for categorical variables
        # Ensure that the order and type of features match your model's training input
        # Also, handle cases where a key might be missing
        culmen_length_mm = data.get('culmen_length_mm')
        culmen_depth_mm = data.get('culmen_depth_mm')
        flipper_length_mm = data.get('flipper_length_mm')
        species = data.get('species', '').lower() # Convert to lowercase for robust matching
        island = data.get('island', '').lower()
        sex = data.get('sex', '').upper() # Convert to uppercase for robust matching

        # Basic validation for required numerical inputs
        if any(x is None for x in [culmen_length_mm, culmen_depth_mm, flipper_length_mm]):
            return jsonify({'error': 'Missing required numerical input (culmen_length_mm, culmen_depth_mm, flipper_length_mm).'}), 400

        # One-hot encoding logic
        species_adelie = 1 if species == 'adelie' else 0
        species_chinstrap = 1 if species == 'chinstrap' else 0
        species_gentoo = 1 if species == 'gentoo' else 0

        island_biscoe = 1 if island == 'biscoe' else 0
        island_dream = 1 if island == 'dream' else 0
        island_torgersen = 1 if island == 'torgersen' else 0

        sex_female = 1 if sex == 'FEMALE' else 0
        sex_male = 1 if sex == 'MALE' else 0

        # Construct the input array for the model
        input_data = [
            culmen_length_mm,
            culmen_depth_mm,
            flipper_length_mm,
            species_adelie,
            species_chinstrap,
            species_gentoo,
            island_biscoe,
            island_dream,
            island_torgersen,
            sex_female,
            sex_male
        ]

        # Convert to numpy array and reshape for single prediction
        # The model expects a 2D array (e.g., [[feature1, feature2, ...]])
        # Even for a single prediction, it's typically expected as a batch of 1.
        input_array = np.array(input_data).reshape(1, -1)

        prediction = model.predict(input_array)[0] # [0] to get the single prediction value

        return jsonify({'predicted_mass': round(prediction, 2)})

    except Exception as e:
        # Log the full exception for debugging on the server
        print(f"An error occurred during prediction: {e}")
        return jsonify({'error': f'An error occurred during prediction: {str(e)}'}), 500

if __name__ == '__main__':
    # This block is for local development only. Render uses Gunicorn.
    app.run(debug=True, port=5000) # Specify port for clarity when running locally
