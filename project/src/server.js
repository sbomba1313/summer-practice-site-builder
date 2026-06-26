<<<<<<< Updated upstream
// ============================================================
// Сервер мини-конструктора сайтов
// Запуск: node src/server.js  (или npm start)
// ============================================================

// === 1. Подключаем библиотеки ===
const express = require('express');   // фреймворк для сервера
const fs = require('fs');             // встроенная — работа с файлами
const path = require('path');         // встроенная — работа с путями

// === 2. Настройка ===
const app = express();
const PORT = 3000;

// Пути считаем от папки, где лежит этот файл (src/), и поднимаемся на уровень выше.
// __dirname — это «папка, в которой лежит server.js», т.е. .../project/src
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// === 3. Middleware ===

// Парсить JSON в теле входящих POST-запросов:
// после этого req.body — готовый JS-объект, а не сырая строка.
app.use(express.json());

// Раздавать любые файлы из папки public/ автоматически:
// GET /blocks/team.html  → public/blocks/team.html
// GET /img/team/alexey.png → public/img/team/alexey.png
app.use(express.static(PUBLIC_DIR));

// === 4. API ===

// GET /api/data — прочитать data.json и отдать клиенту
app.get('/api/data', (req, res) => {
  const text = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(text);
  res.json(data);
});

// POST /api/data — принять новый JSON и записать в data.json
app.post('/api/data', (req, res) => {
  const newData = req.body;
  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2), 'utf-8');
  res.json({ ok: true });
});

// === 5. Запуск ===
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
=======
const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');

app.use(express.static(PUBLIC_DIR));

app.get('/api/data', async (_req, res) => {
  try {
    const file = await fs.readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(file);

    res.json(data);
  } catch (error) {
    console.error('Не получилось прочитать data.json:', error);
    res.status(500).json({ error: 'Не получилось загрузить данные сайта' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
>>>>>>> Stashed changes
});
