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
    model = await tf.loadLayersModel('model/model.json'); // Update with the correct path to your model
    console.log('Model loaded');
}

// Handle file upload
document.getElementById('upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = document.getElementById('image');
        img.src = URL.createObjectURL(file);

        // Show the image preview
        img.onload = async () => {
            const tensor = tf.browser.fromPixels(img)
                .toFloat()
                .div(tf.scalar(255)) // Normalize if required
                .resizeNearestNeighbor([224, 224]) // Adjust as needed
                .expandDims(0);

            // Show the spinner while loading the prediction
            document.getElementById('spinner').style.display = 'block';
            document.getElementById('result-container').style.display = 'none';

            const predictions = await model.predict(tensor).data();
            console.log('Predictions:', predictions); // Log predictions
            const labelIndex = predictions.indexOf(Math.max(...predictions));
            console.log('Predicted Index:', labelIndex); // Log predicted index
            const label = labels[labelIndex]; // Map index to label name
            const category = labelCategories[label]; // Map label to category

            // Hide spinner and show result
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('result-container').style.display = 'block';
            document.getElementById('result').innerHTML = `Predicted Label: <strong>${label}</strong><br>Category: <strong>${category}</strong>`;
        }
    }
});

// Load the model when the page loads
loadModel();
