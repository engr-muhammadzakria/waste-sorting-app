// Load the model
let model;
const labels = ["aerosol_cans", "aluminum_food_cans", "aluminum_soda_cans", "cardboard_boxes", 
    "cardboard_packaging", "clothing", "coffee_grounds", "disposable_plastic_cutlery", "eggshells", 
    "food_waste", "glass_beverage_bottles", "glass_cosmetic_containers", "glass_food_jars", "magazines",
     "newspaper", "office_paper", "paper_cups", "plastic_cup_lids", "plastic_detergent_bottles", 
     "plastic_food_containers", "plastic_shopping_bags", "plastic_soda_bottles", "plastic_straws",
      "plastic_trash_bags", "plastic_water_bottles", "shoes", "steel_food_cans", "styrofoam_cups",
       "styrofoam_food_containers", "tea_bags"];

const labelCategories = {
    "aerosol_cans": "Recyclable (Metals)",
    "aluminum_food_cans": "Recyclable (Metals)",
    "aluminum_soda_cans": "Recyclable (Metals)",
    "steel_food_cans": "Recyclable (Metals)",
    "cardboard_boxes": "Recyclable (Paper)",
    "cardboard_packaging": "Recyclable (Paper)",
    "office_paper": "Recyclable (Paper)",
    "glass_beverage_bottles": "Recyclable (Glass)",
    "glass_cosmetic_containers": "Recyclable (Glass)",
    "plastic_cup_lids": "Recyclable (Plastic)",
    "plastic_detergent_bottles": "Recyclable (Plastic)",
    "plastic_food_containers": "Recyclable (Plastic)",
    "plastic_shopping_bags": "Recyclable (Plastic)",
    "plastic_soda_bottles": "Recyclable (Plastic)",
    "plastic_water_bottles": "Recyclable (Plastic)",
    "coffee_grounds": "Compostable (Organic Waste)",
    "eggshells": "Compostable (Organic Waste)",
    "food_waste": "Compostable (Organic Waste)",
    "tea_bags": "Compostable (Organic Waste)",
    "disposable_plastic_cutlery": "Landfill (Non-Recyclable Plastics)",
    "plastic_straws": "Landfill (Non-Recyclable Plastics)",
    "plastic_trash_bags": "Landfill (Non-Recyclable Plastics)",
    "styrofoam_cups": "Landfill (Non-Recyclable Plastics)",
    "styrofoam_food_containers": "Landfill (Non-Recyclable Plastics)",
    "clothing": "Landfill (Miscellaneous)",
    "shoes": "Landfill (Miscellaneous)",
    "paper_cups": "Landfill (Miscellaneous)"
};

async function loadModel() {
    try {
        model = await tf.loadLayersModel('model/model.json');
        console.log('Model loaded');
    } catch (error) {
        console.error('Failed to load model:', error);
        document.getElementById('result').innerHTML = 'Error: Could not load the model. Please try again later.';
    }
}

// Process image for prediction
async function processImage(img) {
    const tensor = tf.browser.fromPixels(img)
        .toFloat()
        .div(tf.scalar(255))
        .resizeNearestNeighbor([224, 224])
        .expandDims(0);

    document.getElementById('spinner').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';

    const predictions = await model.predict(tensor).data();
    console.log('Predictions:', predictions);
    const maxPrediction = Math.max(...predictions);
    const labelIndex = predictions.indexOf(maxPrediction);
    const confidence = (maxPrediction * 100).toFixed(2);
    const label = labels[labelIndex];
    const category = labelCategories[label];

    document.getElementById('spinner').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('result').innerHTML = `Predicted Label: <strong>${label}</strong><br>Category: <strong>${category}</strong><br>Confidence: <strong>${confidence}%</strong>`;
}

// Handle file upload
document.getElementById('upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            document.getElementById('result').innerHTML = 'Error: Please upload a valid image file.';
            return;
        }

        const img = document.getElementById('image');
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            await processImage(img);
        };
    }
});

// Handle camera input with countdown
document.getElementById('camera').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.style.display = 'block';
        video.srcObject = stream;

        // Display countdown
        let countdown = 3;
        const countdownDisplay = document.createElement('div');
        countdownDisplay.className = 'countdown';
        countdownDisplay.style.position = 'absolute';
        countdownDisplay.style.top = '50%';
        countdownDisplay.style.left = '50%';
        countdownDisplay.style.transform = 'translate(-50%, -50%)';
        countdownDisplay.style.fontSize = '48px';
        countdownDisplay.style.color = '#fff';
        countdownDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        countdownDisplay.style.padding = '10px 20px';
        countdownDisplay.style.borderRadius = '8px';
        video.parentNode.appendChild(countdownDisplay);

        const countdownInterval = setInterval(() => {
            countdownDisplay.innerText = countdown;
            countdown--;
            if (countdown < 0) {
                clearInterval(countdownInterval);
                countdownDisplay.remove();

                const canvas = document.getElementById('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);

                const img = document.getElementById('image');
                img.src = canvas.toDataURL('image/png');
                video.style.display = 'none';
                stream.getTracks().forEach(track => track.stop());

                img.onload = async () => {
                    await processImage(img);
                };
            }
        }, 1000);
    } catch (error) {
        console.error('Camera access failed:', error);
        document.getElementById('result').innerHTML = 'Error: Could not access the camera. Please try uploading an image instead.';
    }
});


// Load the model when the page loads
loadModel();