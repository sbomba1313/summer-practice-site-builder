// ============================================================
// Сервер мини-конструктора сайтов
// Запуск: npm start (или node src/server.js)
// ============================================================

// === 1. Подключаем библиотеки ===
const express = require('express');     // фреймворк для сервера
const fs = require('fs/promises');      // встроенная — асинхронная работа с файлами
const path = require('path');           // встроенная — работа с путями

// === 2. Настройка ===
const app = express();
const PORT = process.env.PORT || 3000;  // можно переопределить переменной окружения
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

// === 5. Запуск ===
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
