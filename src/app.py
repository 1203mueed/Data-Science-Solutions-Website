from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import io
from torchvision.models import densenet121

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# Model setup
class CustomDenseNet(nn.Module):
    def __init__(self, num_classes_super=2, num_classes_malignancy=3, num_classes_main_class_1=7,
                 num_classes_main_class_2=15, num_classes_sub_class=33):
        super(CustomDenseNet, self).__init__()
        self.base_model = densenet121(weights='IMAGENET1K_V1')
        self.base_model.classifier = nn.Linear(self.base_model.classifier.in_features, 1024)
        self.dropout = nn.Dropout(p=0.5)
        self.fc_super_class = nn.Linear(1024, num_classes_super)
        self.fc_malignancy = nn.Linear(1024, num_classes_malignancy)
        self.fc_main_class_1 = nn.Linear(1024, num_classes_main_class_1)
        self.fc_main_class_2 = nn.Linear(1024, num_classes_main_class_2)
        self.fc_sub_class = nn.Linear(1024, num_classes_sub_class)
    
    def forward(self, x):
        x = self.base_model(x)
        x = self.dropout(x)
        return {
            'super_class': self.fc_super_class(x),
            'malignancy': self.fc_malignancy(x),
            'main_class_1': self.fc_main_class_1(x),
            'main_class_2': self.fc_main_class_2(x),
            'sub_class': self.fc_sub_class(x),
        }

# Load the model and weights
model_path = "DenseNet121_Adam_best_val_loss_epoch_31.pth"
device = torch.device("cpu")
model = CustomDenseNet()
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# Define image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Prediction function
def predict(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(image)
        
    predictions = {
        'super_class': outputs['super_class'].argmax(1).item(),
        'malignancy': outputs['malignancy'].argmax(1).item(),
        'main_class_1': outputs['main_class_1'].argmax(1).item(),
        'main_class_2': outputs['main_class_2'].argmax(1).item(),
        'sub_class': outputs['sub_class'].argmax(1).item()
    }
    return predictions

# Handle image upload and prediction
@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    # Read image data from the file
    image_bytes = file.read()

    # Get predictions
    predictions = predict(image_bytes)

    # Send predictions as JSON response
    return jsonify({"predictions": predictions})

if __name__ == "__main__":
    app.run(debug=True)
