import sys
import json
import os
import logging

# Suppress Ultralytics logs
os.environ['YOLO_VERBOSE'] = 'False'
logging.getLogger("ultralytics").setLevel(logging.CRITICAL)

from ultralytics import YOLO

# Path to the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../best.pt")

def predict(image_path):
    try:
        if not os.path.exists(MODEL_PATH):
             print(json.dumps({"prediction": "Model Check", "confidence": 0, "description": "Model not found. Please train first."}))
             return

        model = YOLO(MODEL_PATH)
        
        # Run inference
        results = model(image_path, verbose=False)
        
        best_box = None
        best_conf = -1
        
        # Iterate through results (usually just one image)
        for r in results:
            boxes = r.boxes
            for box in boxes:
                if box.conf > best_conf:
                    best_conf = float(box.conf)
                    best_box = box
        
        if best_box:
            cls_id = int(best_box.cls)
            cls_name = model.names[cls_id]
            
            # Map Priorities
            priority = "High"
            if cls_name == "Broken Meter Box":
                priority = "Medium"
            
            output = {
                "prediction": cls_name,
                "confidence": round(best_conf * 100, 1),
                "priority": priority,
                "description": f"AI Analysed: Detected {cls_name}"
            }
        else:
             output = {
                "prediction": "No Issue Detected",
                "confidence": 0,
                "priority": "Low",
                "description": "No significant issues detected by AI."
            }
            
        print(json.dumps(output))
        
    except Exception as e:
        error_out = {
            "prediction": "Error",
            "confidence": 0,
            "description": str(e)
        }
        print(json.dumps(error_out))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    predict(sys.argv[1])
