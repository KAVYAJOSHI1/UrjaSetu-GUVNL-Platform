const fs = require('fs');
const path = require('path');

// specific boundary for multipart request
const boundary = '--------------------------835846770881083140190633';

async function testAI() {
    const url = 'http://localhost:3000/functions/v1/analyze-image';

    // Read real image
    const imagePath = '/home/lenovo/Desktop/URJASETU/dataset/pole_fire/train/images/q10_jpg.rf.f7ac6a5c5f5a28c9287569a58c59c565.jpg';
    const fileBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('file', blob, 'test_image.jpg');

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testAI();
