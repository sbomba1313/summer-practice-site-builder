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
  // Главный контейнер карточки. Стартует свёрнутой — на странице чище.
  const card = document.createElement('div');
  card.className = 'admin-card admin-card--collapsed';
  card.dataset.id = member.id;        // сохраняем id, пригодится при сохранении

  // === Шапка карточки: имя сотрудника + кнопка удаления ===
  const header = document.createElement('div');
  header.className = 'admin-card__header';

  const title = document.createElement('span');
  title.className = 'admin-card__title';
  title.textContent = member.name || 'Новый сотрудник';   // если имя пустое — заглушка

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'admin-card__delete';
  deleteBtn.textContent = '🗑 Удалить';

  // Клик на «Удалить»: спросить подтверждение, потом убрать карточку со страницы.
  // На сервер изменения уйдут только при нажатии «Сохранить».
  deleteBtn.addEventListener('click', () => {
    const name = title.textContent;
    const confirmed = window.confirm(`Удалить «${name}» из команды?`);
    if (!confirmed) {
      return;                          // пользователь нажал «Отмена» — ничего не делаем
    }
    card.remove();                     // убираем карточку из DOM
  });

  header.appendChild(title);
  header.appendChild(deleteBtn);
  card.appendChild(header);

  // Клик по шапке → свернуть/развернуть. Кроме клика по кнопке удаления.
  header.addEventListener('click', (event) => {
    if (deleteBtn.contains(event.target)) {
      return;                          // клик пришёлся на кнопку удаления — игнорируем
    }
    card.classList.toggle('admin-card--collapsed');
  });

  // === Три поля ввода ===
  const nameField = createField('Имя', 'name', member.name);
  card.appendChild(nameField);
  card.appendChild(createField('Должность', 'position', member.position));
  card.appendChild(createField('Фото', 'photo', member.photo));

  // Когда пользователь меняет имя в input — обновляем title в шапке в реальном времени
  const nameInput = nameField.querySelector('input');
  nameInput.addEventListener('input', () => {
    title.textContent = nameInput.value || 'Новый сотрудник';
  });

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

// === ШАГ 2. Кнопка «+ Добавить сотрудника» ===

function addEmptyMember() {
  // Создаём «пустого» сотрудника. id — текущее время в миллисекундах,
  // гарантирует уникальность для каждого нового нажатия.
  const newMember = {
    id: Date.now(),
    name: '',
    position: '',
    photo: '',
  };

  const card = createMemberCard(newMember);
  card.classList.remove('admin-card--collapsed');   // сразу разворачиваем — поля пустые, видно что заполнять

  const container = document.getElementById('team-members');
  container.appendChild(card);

  // Ставим фокус в поле «Имя», чтобы можно было сразу печатать
  const nameInput = card.querySelector('input[name="name"]');
  nameInput.focus();

  // Прокручиваем страницу к новой карточке — если их много, она внизу
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Подключаем обработчик к кнопке
function bindAddButton() {
  const addBtn = document.getElementById('add-member-btn');
  addBtn.addEventListener('click', addEmptyMember);
}

// === ШАГ 4. Кнопка «Сохранить изменения команды» ===

async function saveTeam() {
  // 1. Свежие данные с сервера — чтобы не затереть чужие правки (Hero, Клиенты и т.д.)
  const response = await fetch('/api/data');
  const data = await response.json();

  // 2. Собираем массив сотрудников из всех карточек на странице
  const cards = document.querySelectorAll('#team-members .admin-card');
  const newMembers = [];

  cards.forEach((card) => {
    const member = {
      id: Number(card.dataset.id),     // id из data-атрибута карточки
    };

    // Обходим input'ы внутри карточки и записываем их значения по имени поля
    const inputs = card.querySelectorAll('input');
    inputs.forEach((input) => {
      member[input.name] = input.value.trim();   // .trim() убирает пробелы по краям
    });

    newMembers.push(member);
  });

  // 3. Подменяем в data только наш кусок
  data.team.members = newMembers;

  // 4. POST на сервер с обновлённым полным JSON
  await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

function bindSaveButton() {
  const saveBtn = document.getElementById('save-team-btn');
  saveBtn.addEventListener('click', saveTeam);
}

// === Запуск всей логики при загрузке страницы ===

// Без DOMContentLoaded код мог бы выполниться раньше, чем браузер прочитает HTML.
document.addEventListener('DOMContentLoaded', () => {
  loadTeam();
  bindAddButton();
  bindSaveButton();
});
