// ============================================================
// Админка — логика секции «Команда»
// Подключается из admin.html
// ============================================================

// === ШАГ 1. Загрузка данных и рендер карточек ===

async function loadTeam() {
  // 1. Запрос на сервер за актуальными данными
  const response = await fetch('/api/data');
  const data = await response.json();

  // 2. Берём массив сотрудников из data.team.members
  const members = data.team.members;

  // 3. Находим контейнер на странице, куда вставлять карточки
  const container = document.getElementById('team-members');

  // 4. Для каждого сотрудника создаём карточку и добавляем в контейнер
  members.forEach((member) => {
    const card = createMemberCard(member);
    container.appendChild(card);
  });
}

// Создаёт одну карточку (форму) сотрудника
function createMemberCard(member) {
  // Главный контейнер карточки
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.dataset.id = member.id;        // сохраняем id, пригодится при сохранении

  // === Шапка карточки: "Сотрудник" + кнопка удаления ===
  const header = document.createElement('div');
  header.className = 'admin-card__header';

  const label = document.createElement('span');
  label.className = 'admin-card__label';
  label.textContent = 'Сотрудник';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'admin-card__delete';
  deleteBtn.textContent = '🗑 Удалить';
  // Действие на удаление повесим в шаге 3

  header.appendChild(label);
  header.appendChild(deleteBtn);
  card.appendChild(header);

  // === Три поля ввода ===
  card.appendChild(createField('Имя', 'name', member.name));
  card.appendChild(createField('Должность', 'position', member.position));
  card.appendChild(createField('Фото', 'photo', member.photo));

  return card;
}

// Создаёт пару «лейбл + input» — повторяющийся блок
function createField(labelText, fieldName, fieldValue) {
  const field = document.createElement('div');
  field.className = 'admin-field';

  const label = document.createElement('label');
  label.className = 'admin-field__label';
  label.textContent = labelText;

  const input = document.createElement('input');
  input.className = 'admin-field__input';
  input.type = 'text';
  input.name = fieldName;             // name пригодится при сохранении
  input.value = fieldValue || '';     // если значение отсутствует — пустая строка

  field.appendChild(label);
  field.appendChild(input);

  return field;
}

// Запускаем loadTeam, когда HTML страницы полностью загружен.
// Без этого код мог бы выполниться раньше, чем браузер прочитает <div id="team-members">.
document.addEventListener('DOMContentLoaded', loadTeam);
