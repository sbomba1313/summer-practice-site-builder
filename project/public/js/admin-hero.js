// ============================================================
// Админка — логика секции «Hero»
// Подключается из admin.html
// ============================================================
//
// ЗАГОТОВКА. Сейчас файл просто получает данные и пишет их в консоль.
// Дальше нужно сделать:
//   1. Найти контейнер секции — document.getElementById('hero-admin')
//   2. Нарисовать в нём:
//        - поле «Заголовок» (input для data.hero.title)
//        - поле «Подзаголовок» (input для data.hero.subtitle)
//        - блок «Статистика» — список из data.hero.stats,
//          каждый пункт со своими полями value и label + кнопкой «Удалить»
//        - кнопку «+ Добавить пункт статистики»
//        - кнопку «Сохранить изменения Hero»
//   3. На «Сохранить»: собрать данные из формы, дополнить остальной data,
//      сделать POST /api/data
//
// Подсмотри как это сделано в admin-team.js — структура одинаковая.
// Стили готовые: .admin-card, .admin-field, .admin-btn, .admin-status — из admin.css.

async function loadHero() {
  const response = await fetch('/api/data');
  const data = await response.json();

  // TODO: data.hero — это { title, subtitle, stats: [{ value, label }, ...] }
  console.log('Hero data:', data.hero);
}

document.addEventListener('DOMContentLoaded', loadHero);
