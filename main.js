document.getElementById('predict-button').onclick = async function() {
    const culmenLength = parseFloat(document.getElementById('culmen_length_mm').value);
    const culmenDepth = parseFloat(document.getElementById('culmen_depth_mm').value);
    const flipperLength = parseFloat(document.getElementById('flipper_length_mm').value);
    // Ensure element IDs match the HTML (e.g., 'species' instead of 'Species')
    const species = document.getElementById('species').value.trim(); // Changed 'Species' to 'species' (common HTML ID naming)
    const island = document.getElementById('island').value.trim();   // Changed 'Island' to 'island'
    const sex = document.getElementById('sex').value.trim();         // Changed 'Sex' to 'sex'

    const errorDiv = document.getElementById('error-message');
    const resultDiv = document.getElementById('result');
    const predictBtn = document.getElementById('predict-button');
    const modelContainer = document.getElementById('model-container');

    errorDiv.textContent = ''; // Clear previous errors
    resultDiv.textContent = ''; // Clear previous results

    if (isNaN(culmenLength) || isNaN(culmenDepth) || isNaN(flipperLength)) {
        errorDiv.textContent = "Please fill in all numeric fields.";
        return;
    }
    if (!species || !island || !sex) {
        errorDiv.textContent = "Please select values for Species, Island, and Sex.";
        return;
    }


    predictBtn.disabled = true; // Disable button to prevent multiple clicks

    try {
        // --- FIX 1: Correct API Endpoint URL ---
        const API_ENDPOINT = 'https://penguin-mass-prediction.onrender.com/predict';

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                culmen_length_mm: culmenLength,
                culmen_depth_mm: culmenDepth,
                flipper_length_mm: flipperLength,
                species: species, // Ensure these keys EXACTLY match your Flask app's 'data.get()' calls
                island: island,
                sex: sex
            })
        });

        // --- FIX 2: Handle non-OK HTTP responses from the API ---
        if (!response.ok) {
            let errorText = `Server error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json(); // Try to parse error message from server
                if (errorData.error) {
                    errorText = `Prediction failed: ${errorData.error}`;
                }
            } catch (e) {
                // If response is not JSON or parsing fails, use generic error message
                console.error("Failed to parse error response from server:", e);
            }
            errorDiv.textContent = errorText;
            predictBtn.disabled = false; // Re-enable button on error
            return; // Stop execution
        }

        const data = await response.json();

        // --- FIX 3: Access the correct property from the Flask API response ---
        // Your Flask API returns: `return jsonify({'predicted_mass': round(prediction, 2)})`
        let mass = data.predicted_mass;

        if (typeof mass === 'undefined') {
            errorDiv.textContent = "Prediction failed: API response did not contain 'predicted_mass'.";
            console.error("API Response:", data); // Log the full response for debugging
            predictBtn.disabled = false;
            return;
        }

        resultDiv.textContent = "Predicted Mass: " + mass + " g";

        // Your existing logic for displaying models based on mass
        if (mass > 3000 && mass < 4000) {
            modelContainer.innerHTML = `
                <model-viewer src="penguin_1.glb" camera-controls disable-zoom background="transparent" style="width:100%;height:100%;" autoplay>
                    <button class="Hotspot" slot="hotspot-1"
                        data-position="3.5788827572055304m 4.303476413994318m -0.0925440812313214m"
                        data-normal="0.9464809551255112m 0.2993939805506935m -0.12056967278180218m"
                        data-visibility-attribute="visible">
                        <div class="HotspotAnnotation">MASS IN g: ${mass} g</div>
                    </button>
                </model-viewer>
            `;
        } else if (mass >= 4000 && mass < 5000) {
            modelContainer.innerHTML = `
                <model-viewer src="penguin_skipper_2.glb" camera-controls disable-zoom background="transparent" style="width:100%;height:100%;" autoplay>
                    <button class="Hotspot" slot="hotspot-1"
                        data-position="0.0006840881801967438m 0.020584391805215783m 0.01335835729774396m"
                        data-normal="0.09936152563415734m 0.09702795925682708m 0.9903094780653715m"
                        data-visibility-attribute="visible">
                        <div class="HotspotAnnotation">MASS IN g: ${mass} g</div>
                    </button>
                </model-viewer>
            `;
        } else if (mass >= 5000) {
            modelContainer.innerHTML = `
                <model-viewer src="penguin_skipper_2.glb" camera-controls disable-zoom background="transparent" style="width:100%;height:100%;" autoplay>
                    <button class="Hotspot" slot="hotspot-1"
                        data-position="0.0006840881801967438m 0.020584391805215783m 0.01335835729774396m"
                        data-normal="0.09936152563415734m 0.09702795925682708m 0.9903094780653715m"
                        data-visibility-attribute="visible">
                        <div class="HotspotAnnotation">MASS IN g: ${mass} g</div>
                    </button>
                </model-viewer>
                <model-viewer src="penguin_-_lowpoly_3.glb" camera-controls disable-zoom background="transparent" style="width:100%;height:100%;" autoplay>
                    <button class="Hotspot" slot="hotspot-1"
                        data-position="3.5788827572055304m 4.303476413994318m -0.0925440812313214m"
                        data-normal="0.9464809551255112m 0.2993939805506935m -0.12056967278180218m"
                        data-visibility-attribute="visible">
                        <div class="HotspotAnnotation">MASS IN g: ${mass} g</div>
                    </button>
                </model-viewer>
            `;
        }
    } catch (err) {
        // This catch block handles network errors or issues with the fetch itself
        errorDiv.textContent = `Prediction failed: ${err.message}. Please check your internet connection or try again.`;
        console.error('Fetch Error:', err);
    } finally {
        // Ensure button is always re-enabled
        predictBtn.disabled = false;
    }
};
