from flask_cors import CORS
import torch
import torch.nn as nn
import cv2
import numpy as np
from torchvision import transforms
from PIL import Image
import mediapipe as mp
from transformers import SwinModel
from flask import Flask, request, jsonify
import os

# Initialize Flask app
app = Flask(__name__)

CORS(app)

port = int(os.getenv("PORT", 10000))

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Define Attention Mechanism
class Attention(nn.Module):
    def __init__(self, feature_dim):
        super(Attention, self).__init__()
        self.attention_weights = nn.Parameter(torch.randn(feature_dim))

    def forward(self, swin_features, face_features):
        combined_features = torch.cat((swin_features, face_features), dim=2)
        attention_scores = torch.matmul(combined_features, self.attention_weights)
        attention_weights = torch.softmax(attention_scores, dim=1)
        weighted_features = combined_features * attention_weights.unsqueeze(-1)
        return weighted_features

# Define LSTM model with Attention
class DeepfakeLSTM(nn.Module):
    def __init__(self, swin_out=768, lstm_hidden=256, num_layers=2, num_classes=2, bidirectional=True):
        super(DeepfakeLSTM, self).__init__()
        self.lstm = nn.LSTM(swin_out + (468 * 3), lstm_hidden, num_layers, batch_first=True, bidirectional=bidirectional)
        self.attention = Attention(swin_out + (468 * 3))
        self.fc = nn.Linear(lstm_hidden * (2 if bidirectional else 1), num_classes)
        self.swin = SwinModel.from_pretrained("microsoft/swin-tiny-patch4-window7-224")

    def forward(self, x, face_features):
        batch_size, seq_len, _, _, _ = x.size()
        x = x.view(batch_size * seq_len, 3, 224, 224)

        with torch.no_grad():
            swin_features = self.swin(x).last_hidden_state.mean(dim=1)
        
        swin_features = swin_features.view(batch_size, seq_len, -1)
        face_features = face_features.to(x.device)
        combined_features = self.attention(swin_features, face_features)
        lstm_out, _ = self.lstm(combined_features)
        lstm_out = self.fc(lstm_out[:, -1, :])
        return lstm_out

# Load trained model
model_path = r"C:\Users\Vasaikar Yog\Downloads\deepfakevi.pth"  # Update with actual model path
model = torch.load(model_path, map_location=device, weights_only=False)
model = model.to(device)
model.eval()

# MediaPipe Face Mesh setup
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, min_detection_confidence=0.5)

# Define transform for frames
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Function to extract facial landmarks
def extract_facial_landmarks(frame):
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(frame_rgb)
    if results.multi_face_landmarks:
        landmarks = [[lm.x, lm.y, lm.z] for lm in results.multi_face_landmarks[0].landmark]
        return np.array(landmarks).flatten()
    return np.zeros(468 * 3)

# Function to process a video and predict
def test_single_video(video_path, frame_count=15):
    cap = cv2.VideoCapture(video_path)
    frames, facial_features = [], []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_resized = cv2.resize(frame, (224, 224))
        frame_transformed = transform(Image.fromarray(cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)))
        frames.append(frame_transformed)
        facial_features.append(extract_facial_landmarks(frame))
    
    cap.release()

    while len(frames) < frame_count:
        frames.append(torch.zeros(3, 224, 224))
        facial_features.append(np.zeros(468 * 3))
    
    frames = frames[:frame_count]
    facial_features = facial_features[:frame_count]

    frames_tensor = torch.stack(frames).unsqueeze(0).to(device)
    facial_features_tensor = torch.tensor(np.array(facial_features), dtype=torch.float32).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(frames_tensor, facial_features_tensor)
        prediction = torch.argmax(outputs, dim=1).item()
    
    return "Fake" if prediction == 1 else "Real"

# Flask API route
@app.route("/predict-video", methods=["POST"])
def predict():
    if "video" not in request.files:
        return jsonify({"error": "No video file uploaded"}), 400
    
    video = request.files["video"]
    video_path = "uploaded_video.mp4"
    video.save(video_path)
    
    result = test_single_video(video_path)
    os.remove(video_path)
    
    return jsonify({"prediction": result})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port, debug=True)
