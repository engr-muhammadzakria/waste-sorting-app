const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for predictions
const predictionSchema = new mongoose.Schema({
    label: String,
    category: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now },
    userFeedback: { type: String, default: null } // For feedback (e.g., "correct", "incorrect")
});

const Prediction = mongoose.model('Prediction', predictionSchema);

// API to save a prediction
app.post('/api/predictions', async (req, res) => {
    try {
        const { label, category, confidence } = req.body;
        const prediction = new Prediction({ label, category, confidence });
        await prediction.save();
        res.status(201).json({ message: 'Prediction saved', prediction });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save prediction' });
    }
});

// API to get all predictions
app.get('/api/predictions', async (req, res) => {
    try {
        const predictions = await Prediction.find().sort({ timestamp: -1 });
        res.status(200).json(predictions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});

// API to add feedback to a prediction
app.put('/api/predictions/:id/feedback', async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;
        const prediction = await Prediction.findByIdAndUpdate(id, { userFeedback: feedback }, { new: true });
        res.status(200).json({ message: 'Feedback updated', prediction });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update feedback' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));