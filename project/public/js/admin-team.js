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

  // Клик на «Удалить»: убираем карточку со страницы.
  // На сервер изменения уйдут только при нажатии «Сохранить»,
  // поэтому случайное удаление лечится обновлением страницы.
  deleteBtn.addEventListener('click', () => {
    card.remove();
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
  card.appendChild(createPhotoField(member.photo));

  // Когда пользователь меняет имя в input — обновляем title в шапке в реальном времени
  const nameInput = nameField.querySelector('input');
  nameInput.addEventListener('input', () => {
    title.textContent = nameInput.value || 'Новый сотрудник';
  });

  return card;
}

// Создаёт поле «Фото» с превью и кнопкой загрузки файла.
// Скрытый input[name="photo"] хранит путь и читается при сохранении —
// поэтому остальная логика (saveTeam) ничего не знает про загрузку.
function createPhotoField(value) {
  const field = document.createElement('div');
  field.className = 'admin-field';

  const label = document.createElement('label');
  label.className = 'admin-field__label';
  label.textContent = 'Фото';

  // Превью текущего фото
  const preview = document.createElement('img');
  preview.className = 'admin-photo-preview';
  preview.alt = 'Превью';
  if (value) {
    preview.src = value;
  } else {
    preview.style.display = 'none';
  }

  // Текстовое поле с путём — источник правды для сохранения
  const pathInput = document.createElement('input');
  pathInput.className = 'admin-field__input';
  pathInput.type = 'text';
  pathInput.name = 'photo';
  pathInput.value = value || '';
  pathInput.placeholder = '/img/team/имя.png';

  // Кнопка загрузки + скрытый file-input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';        // в диалоге показывать только картинки
  fileInput.style.display = 'none';

  const uploadBtn = document.createElement('button');
  uploadBtn.type = 'button';
  uploadBtn.className = 'admin-btn';
  uploadBtn.textContent = '📁 Загрузить файл';
  uploadBtn.addEventListener('click', () => fileInput.click());

  // Когда выбрали файл — отправляем на сервер
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Загружаю…';

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/upload/team-photo', {
        method: 'POST',
        body: formData,                // НЕТ headers: браузер сам поставит boundary
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Сервер не принял файл');
      }

      const result = await response.json();
      pathInput.value = result.path;   // обновляем путь
      preview.src = result.path;       // показываем новое фото
      preview.style.display = 'block';
    } catch (err) {
      alert(`Не удалось загрузить: ${err.message}`);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = '📁 Загрузить файл';
      fileInput.value = '';            // сброс, чтобы можно было загрузить тот же файл повторно
    }
  });

  // Если пользователь правит путь руками — обновить превью
  pathInput.addEventListener('input', () => {
    if (pathInput.value) {
      preview.src = pathInput.value;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  });

  field.appendChild(label);
  field.appendChild(preview);
  field.appendChild(pathInput);
  field.appendChild(fileInput);
  field.appendChild(uploadBtn);
  return field;
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

// === ШАГ 4–5. Кнопка «Сохранить изменения команды» + статус ===

// Маленький хелпер: показать сообщение в #team-status.
// type: 'progress' / 'success' / 'error' — задаёт цвет через CSS-классы.
function setTeamStatus(message, type) {
  const status = document.getElementById('team-status');
  status.textContent = message;
  status.className = 'admin-status';   // сброс модификаторов
  if (type === 'success') status.classList.add('admin-status--success');
  if (type === 'error') status.classList.add('admin-status--error');
}

async function saveTeam() {
  const saveBtn = document.getElementById('save-team-btn');

  // Блокируем кнопку, чтобы пользователь не нажал второй раз пока летит запрос
  saveBtn.disabled = true;
  setTeamStatus('Сохраняю…', 'progress');

  try {
    // 1. Свежие данные с сервера — чтобы не затереть чужие правки (Hero, Клиенты и т.д.)
    const getResponse = await fetch('/api/data');
    if (!getResponse.ok) {
      throw new Error('Сервер не отдал данные');
    }
    const data = await getResponse.json();

    // 2. Собираем массив сотрудников из всех карточек на странице
    const cards = document.querySelectorAll('#team-members .admin-card');
    const newMembers = [];

    cards.forEach((card) => {
      const member = {
        id: Number(card.dataset.id),     // id из data-атрибута карточки
      };

      // Обходим input'ы внутри карточки и записываем их значения по имени поля.
      // Пропускаем поля без name (например, скрытый input[type=file] для загрузки).
      const inputs = card.querySelectorAll('input');
      inputs.forEach((input) => {
        if (!input.name) return;
        member[input.name] = input.value.trim();   // .trim() убирает пробелы по краям
      });

      newMembers.push(member);
    });

    // 3. Подменяем в data только наш кусок
    data.team.members = newMembers;

    // 4. POST на сервер с обновлённым полным JSON
    const postResponse = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!postResponse.ok) {
      throw new Error('Сервер не принял сохранение');
    }

    // Успех
    setTeamStatus('Сохранено ✓', 'success');

    // Через 3 секунды убираем сообщение, чтобы не отвлекало
    setTimeout(() => setTeamStatus('', ''), 3000);

  } catch (err) {
    setTeamStatus(`Не удалось сохранить: ${err.message}`, 'error');
    console.error(err);                  // подробности в консоль для отладки
  } finally {
    saveBtn.disabled = false;            // всегда возвращаем кнопку в рабочий вид
  }
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
