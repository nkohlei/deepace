
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const username = process.argv[2];

if (!username) {
    console.error('Kullanım: node setAdmin.js <kullanici_adi>');
    process.exit(1);
}

const makeAdmin = async () => {
    try {
        console.log('Veritabanına bağlanılıyor...');
        await connectDB();

        const user = await User.findOne({ username });

        if (!user) {
            console.error(`Hata: "${username}" kullanıcısı bulunamadı.`);
            process.exit(1);
        }

        if (user.isAdmin) {
            console.log(`Bilgi: "${username}" zaten bir yönetici.`);
            process.exit(0);
        }

        user.isAdmin = true;
        await user.save();

        console.log(`Başarılı! "${username}" artık bir yönetici (Admin).`);
        console.log('Admin paneline erişmek için: http://localhost:5173/admin');

        process.exit(0);
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        process.exit(1);
    }
};

makeAdmin();
