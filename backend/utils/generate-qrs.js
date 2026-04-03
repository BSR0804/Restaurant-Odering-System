const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173'; // Change this for production
const NUM_TABLES = 10;
const OUTPUT_DIR = path.join(__dirname, '..', 'qrcodes');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const generateQRs = async () => {
    console.log(`Generating QRs for ${NUM_TABLES} tables...`);
    
    for (let table = 1; table <= NUM_TABLES; table++) {
        const url = `${BASE_URL}?table=${table}`;
        const fileName = `table_${table}.png`;
        const filePath = path.join(OUTPUT_DIR, fileName);

        try {
            await QRCode.toFile(filePath, url, {
                color: {
                    dark: '#0b090a',  // Dark background
                    light: '#f5f3f4'  // Text matching our theme
                },
                width: 400
            });
            console.log(`✓ Generated ${fileName}`);
        } catch (err) {
            console.error(`Error for table ${table}:`, err);
        }
    }
    console.log('All QRs generated successfully in /backend/qrcodes');
};

generateQRs();
