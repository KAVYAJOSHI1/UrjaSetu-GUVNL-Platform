import os
import shutil
import yaml

# Configuration
DATASETS = {
    'transformer': {'path': 'dataset/transformer', 'class_id': 0, 'remap': {0: 0}}, # Transformer -> Transformer Sparking (ID 0)
    'short_circuit': {'path': 'dataset/short_circuit', 'class_id': 1, 'remap': {0: 1}}, # Short Circuit -> Short Circuit (ID 1)
    'pole_fire': {'path': 'dataset/pole_fire', 'class_id': 2, 'remap': {0: 2}}, # Fire-smoke -> Pole Fire (ID 2)
    'meter_box': {'path': 'dataset/meter_box', 'class_id': 3, 'remap': {0: 3, 1: None}} # Bad -> Broken Meter (ID 3), Good -> Ignore
}

OUTPUT_DIR = 'merged_dataset'
SPLITS = ['train', 'valid', 'test']

def process_dataset(name, config):
    print(f"Processing {name}...")
    base_path = config['path']
    remap_map = config['remap']

    # Some datasets might not have 'test', check structure
    # Standard Roboflow YOLOv8: /train/images, /train/labels
    
    for split in SPLITS:
        src_images = os.path.join(base_path, split, 'images')
        src_labels = os.path.join(base_path, split, 'labels')
        
        if not os.path.exists(src_images):
            # Sometimes 'valid' is 'val'
            if split == 'valid':
                src_images = os.path.join(base_path, 'val', 'images')
                src_labels = os.path.join(base_path, 'val', 'labels')
                if not os.path.exists(src_images):
                    print(f"Skipping {split} for {name} (not found)")
                    continue
            else:
                print(f"Skipping {split} for {name} (not found)")
                continue

        dest_images = os.path.join(OUTPUT_DIR, split, 'images')
        dest_labels = os.path.join(OUTPUT_DIR, split, 'labels')

        # Copy and Process
        for filename in os.listdir(src_images):
            if filename.startswith('.'): continue
            
            # Copy Image
            shutil.copy2(os.path.join(src_images, filename), os.path.join(dest_images, f"{name}_{filename}"))
            
            # Process Label
            label_file = filename.rsplit('.', 1)[0] + '.txt'
            src_label_path = os.path.join(src_labels, label_file)
            
            if os.path.exists(src_label_path):
                with open(src_label_path, 'r') as f:
                    lines = f.readlines()
                
                new_lines = []
                for line in lines:
                    parts = line.strip().split()
                    if not parts: continue
                    cls_id = int(parts[0])
                    
                    if cls_id in remap_map:
                        new_id = remap_map[cls_id]
                        if new_id is not None:
                            parts[0] = str(new_id)
                            new_lines.append(" ".join(parts))
                
                if new_lines:
                    with open(os.path.join(dest_labels, f"{name}_{label_file}"), 'w') as f:
                        f.write("\n".join(new_lines))
            else:
                # If no label file, maybe background image? Or xml... assuming txt exists for YOLO
                pass

def create_yaml():
    data = {
        'path': os.path.abspath(OUTPUT_DIR),
        'train': 'train/images',
        'val': 'valid/images',
        'test': 'test/images',
        'nc': 4,
        'names': ['Transformer Sparking', 'Short Circuit', 'Pole Fire', 'Broken Meter Box']
    }
    
    with open(os.path.join(OUTPUT_DIR, 'data.yaml'), 'w') as f:
        yaml.dump(data, f)

if __name__ == '__main__':
    for name, conf in DATASETS.items():
        process_dataset(name, conf)
    create_yaml()
    print("Merge Complete!")
