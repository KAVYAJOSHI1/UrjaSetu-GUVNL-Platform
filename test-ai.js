const fs = require('fs');
const path = require('path');

// specific boundary for multipart request
const boundary = '--------------------------835846770881083140190633';

async function testAI() {
    const url = 'http://localhost:3000/functions/v1/analyze-image';

    // Create a dummy file
    const filePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(filePath, 'dummy image content');

    const formData = new FormData();
    formData.append('file', new Blob(['dummy content']), 'test.jpg');

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
