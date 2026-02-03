### 🚀 Training UrjaSetu AI on Google Colab

Use this notebook code to train your model on Google Colab using the dataset you just created.

1. **Upload Files**:
   - `urjasetu_dataset.zip` (The dataset we just packaged)

2. **Create a New Colab Notebook** and run the following cells:

```python
# Cell 1: Install Dependencies
%pip install ultralytics
import ultralytics
ultralytics.checks()
```

```python
# Cell 2: Unzip Dataset
!unzip -o urjasetu_dataset.zip -d ./dataset
```

```python
# Cell 3: Fix YAML Path for Colab (Absolute Paths)
import yaml
import os

# We need to make sure the data.yaml points to the correct absolute paths in Colab environment
yaml_path = '/content/dataset/merged_dataset/data.yaml'

with open(yaml_path, 'r') as f:
    data = yaml.safe_load(f)

# Update paths to be absolute
data['path'] = '/content/dataset/merged_dataset'
data['train'] = 'train/images'
data['val'] = 'valid/images'
data['test'] = 'test/images'

with open(yaml_path, 'w') as f:
    yaml.dump(data, f)

print("YAML updated!")
```

```python
# Cell 4: Train the Model
from ultralytics import YOLO

# Load a pretrained YOLOv8n model
model = YOLO('yolov8n.pt')

# Train the model
# We use 50 epochs for better results on Colab (since it's faster!)
results = model.train(
    data='/content/dataset/merged_dataset/data.yaml',
    epochs=50,
    imgsz=640,
    name='urjasetu_final_model'
)
```

```python
# Cell 5: Download the Best Model
from google.colab import files
import glob

# Find the best model
best_model = glob.glob('/content/runs/detect/urjasetu_final_model/weights/best.pt')[0]
print(f"Found model: {best_model}")

# Download it
files.download(best_model)
```

### ✅ After Training:
1.  Download the `best.pt` file.
2.  Rename it to `urjasetu_model.pt`.
3.  Place it in the root of your `URJASETU` project locally.
4.  Restart the local server to apply changes!
