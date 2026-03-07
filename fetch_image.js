import https from 'https';
import fs from 'fs';

const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kathakali_face_makeup.jpg/800px-Kathakali_face_makeup.jpg';
const dest = 'c:\\xampp\\htdocs\\HertiX\\user-dashboard\\frontend\\public\\kathakali_real.jpg';

https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    }
}, (response) => {
    if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Download Completed');
        });
    } else {
        console.log(`Failed with status code: ${response.statusCode}`);
    }
}).on('error', (err) => {
    console.log(`Error: ${err.message}`);
});
