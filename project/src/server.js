// ============================================================
// Сервер мини-конструктора сайтов
// Запуск: npm start (или node src/server.js)
// ============================================================

// === 1. Подключаем библиотеки ===
const express = require('express');     // фреймворк для сервера
const fs = require('fs/promises');      // встроенная — асинхронная работа с файлами
const path = require('path');           // встроенная — работа с путями
const multer = require('multer');       // для приёма файлов из браузера (multipart/form-data)

// === 2. Настройка ===
const app = express();
const PORT = process.env.PORT || 3000;  // можно переопределить переменной окружения
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const VIEWS_DIR = path.join(__dirname, '..', 'views');

// Шаблонизатор EJS: сервер будет подставлять данные в views/index.ejs
app.set('view engine', 'ejs');
app.set('views', VIEWS_DIR);

// Конфигурация multer для фото сотрудников.
// Файлы кладёт в public/img/team/ с уникальными именами,
// пускает только изображения, ограничивает 5 МБ.
const teamPhotoStorage = multer.diskStorage({
  destination: path.join(PUBLIC_DIR, 'img', 'team'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, unique);
  },
});

const teamPhotoUpload = multer({
  storage: teamPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },       // 5 МБ
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Можно загружать только изображения'));
    }
    cb(null, true);
  },
});

// === 3. Middleware ===

// Парсить JSON в теле входящих POST-запросов:
// после этого req.body — готовый JS-объект, а не сырая строка.
app.use(express.json());

// Главная страница: читаем data.json и рендерим шаблон оригинала травеллайна,
// подставляя в управляемые блоки актуальные данные.
// Этот роут идёт ДО express.static, чтобы перехватить "/" раньше статики.
app.get('/', async (req, res) => {
  try {
    const text = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(text);
    res.render('index', data);     // views/index.ejs + поля data становятся переменными
  } catch (err) {
    console.error('Не получилось отрендерить главную:', err);
    res.status(500).send('Ошибка загрузки страницы');
  }
});

// Раздавать любые файлы из папки public/ автоматически:
// GET /admin.html → public/admin.html
// GET /img/team/alexey.png → public/img/team/alexey.png
// GET /site-assets/style.min.css → public/site-assets/style.min.css
app.use(express.static(PUBLIC_DIR));

// === 4. API ===

// GET /api/data — прочитать data.json и отдать клиенту
app.get('/api/data', async (req, res) => {
  try {
    const text = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error('Не получилось прочитать data.json:', err);
    res.status(500).json({ error: 'Не получилось загрузить данные сайта' });
  }
});

// POST /api/data — принять новый JSON и записать в data.json
app.post('/api/data', async (req, res) => {
  try {
    const newData = req.body;
    await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    console.error('Не получилось записать data.json:', err);
    res.status(500).json({ error: 'Не получилось сохранить данные' });
  }
});

// POST /api/upload/team-photo — принять файл от админки, сохранить, вернуть путь
app.post('/api/upload/team-photo', (req, res) => {
  // upload.single('photo') — ждём один файл в поле "photo"
  teamPhotoUpload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не получен' });
    }
    // Возвращаем путь, который потом ляжет в data.json
    res.json({ path: `/img/team/${req.file.filename}` });
  });
});

// === 5. Запуск ===
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
