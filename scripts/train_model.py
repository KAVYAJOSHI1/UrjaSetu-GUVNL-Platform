from ultralytics import YOLO
import os

def train():
    # Load a model
    print("Loading YOLOv8n model...")
    model = YOLO("yolov8n.pt")  # load a pretrained model

    # Train the model
    print("Starting training...")
    # absolute path to data.yaml is safer
    data_path = os.path.abspath("merged_dataset/data.yaml")
    
    # Train for fewer epochs for demo speed, but enough for convergence on small data
    # 15 epochs might be enough for a prototype
    results = model.train(data=data_path, epochs=15, imgsz=640, project="urjasetu_training", name="run1")
    
    # Save the best model to a known location
    best_model_path = "urjasetu_training/run1/weights/best.pt"
    if os.path.exists(best_model_path):
        import shutil
        shutil.copy2(best_model_path, "urjasetu_model.pt")
        print(f"Model saved to {os.path.abspath('urjasetu_model.pt')}")
    else:
        print("Could not find best.pt")

if __name__ == '__main__':
    train()
