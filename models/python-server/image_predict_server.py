from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from tensorflow.keras.models import load_model
import os
from dotenv import load_dotenv 

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

port = int(os.getenv("PORT", 8081))
 
# Load the trained deepfake model path from .env
model_path = os.getenv("IMAGE_MODEL_PATH")

if not model_path:
    raise ValueError("IMAGE_MODEL_PATH is not set in the .env file")

model = load_model(model_path)


def preprocess_image(image):
    IMG_HEIGHT, IMG_WIDTH = 224, 224  # Match model's input size
    image = cv2.resize(image, (IMG_WIDTH, IMG_HEIGHT))
    image = image / 255.0  # Normalize
    return np.expand_dims(image, axis=0)  # Add batch dimension

def predict_image(img):
    processed_image = preprocess_image(img)
    prediction = model.predict(processed_image)
    confidence = prediction[0][0] * 100
    result = "Real" if confidence > 50 else "Fake"
    confidence_score = confidence if result == "Real" else 100 - confidence
    return result, round(confidence_score, 2)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No image selected"}), 400

    file_bytes = np.frombuffer(file.read(), dtype=np.uint8)
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({"error": "Invalid image file"}), 400

    result, confidence = predict_image(image)
    return jsonify({"result": result, "confidence": confidence})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=port, debug=True) 