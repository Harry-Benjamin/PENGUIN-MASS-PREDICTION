document.getElementById('predict-button').onclick = async function() {
    const culmenLength = parseFloat(document.getElementById('culmen_length_mm').value);
    const culmenDepth = parseFloat(document.getElementById('culmen_depth_mm').value);
    const flipperLength = parseFloat(document.getElementById('flipper_length_mm').value);

    // FIX: Changed IDs to match your HTML's capitalized IDs (Species, Island, Sex)
    const species = document.getElementById('Species').value.trim();
    const island = document.getElementById('Island').value.trim();
    const sex = document.getElementById('Sex').value.trim();

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
                species: species, // These keys match your Flask app's 'data.get()' calls
                island: island,
                sex: sex
            })
        });

        if (!response.ok) {
            let errorText = `Server error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorText = `Prediction failed: ${errorData.error}`;
                }
            } catch (e) {
                console.error("Failed to parse error response from server:", e);
            }
            errorDiv.textContent = errorText;
            predictBtn.disabled = false;
            return;
        }

        const data = await response.json();

        let mass = data.predicted_mass;

        if (typeof mass === 'undefined') {
            errorDiv.textContent = "Prediction failed: API response did not contain 'predicted_mass'.";
            console.error("API Response:", data);
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
        errorDiv.textContent = `Prediction failed: ${err.message}. Please check your internet connection or try again.`;
        console.error('Fetch Error:', err);
    } finally {
        predictBtn.disabled = false;
    }
};
