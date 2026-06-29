// ============================================================
// Админка — логика секции «Клиенты»
// Подключается из admin.html
// ============================================================

(() => {
  // === ШАГ 1. Загрузка данных и рендер карточек ===

  async function loadClientLogos() {
    try {
      const response = await fetch('/api/data');

      if (!response.ok) {
        throw new Error('Сервер не отдал данные');
      }

      const data = await response.json();
      const clients = data.clients.items;
      const container = document.getElementById('client-logos');

      container.innerHTML = '';

      clients.forEach((client) => {
        const card = createClientCard(client);
        container.appendChild(card);
      });
    } catch (err) {
      setLogoStatus(`Не удалось загрузить клиентов: ${err.message}`, 'error');
      console.error(err);
    }
  }

  // Создаёт одну карточку клиента
  function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'admin-card admin-card--collapsed';
    card.dataset.id = client.id;

    const header = document.createElement('div');
    header.className = 'admin-card__header';

    const title = document.createElement('span');
    title.className = 'admin-card__title';
    title.textContent = client.name || 'Новый клиент';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'admin-card__delete';
    deleteBtn.textContent = 'Удалить';

    deleteBtn.addEventListener('click', () => {
      card.remove();
    });

    header.appendChild(title);
    header.appendChild(deleteBtn);
    card.appendChild(header);

    header.addEventListener('click', (event) => {
      if (deleteBtn.contains(event.target)) {
        return;
      }

      card.classList.toggle('admin-card--collapsed');
    });

    const nameField = createField('Название клиента', 'name', client.name);
    card.appendChild(nameField);
    card.appendChild(createLogoField(client.logo));

    const nameInput = nameField.querySelector('input');
    nameInput.addEventListener('input', () => {
      title.textContent = nameInput.value || 'Новый клиент';
    });

    return card;
  }

  // Создаёт поле «Путь к логотипу» с превью.
  function createLogoField(value) {
    const field = document.createElement('div');
    field.className = 'admin-field';

    const label = document.createElement('label');
    label.className = 'admin-field__label';
    label.textContent = 'Путь к логотипу';

    const preview = document.createElement('img');
    preview.className = 'admin-photo-preview';
    preview.alt = 'Превью логотипа';
    preview.style.objectFit = 'contain';

    if (value) {
      preview.src = value;
    } else {
      preview.style.display = 'none';
    }

    const input = document.createElement('input');
    input.className = 'admin-field__input';
    input.type = 'text';
    input.name = 'logo';
    input.value = value || '';
    input.placeholder = '/img/clients/logo.svg';

    input.addEventListener('input', () => {
      if (input.value) {
        preview.src = input.value;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });

    field.appendChild(label);
    field.appendChild(preview);
    field.appendChild(input);

    return field;
  }

  // Создаёт пару «лейбл + input»
  function createField(labelText, fieldName, fieldValue) {
    const field = document.createElement('div');
    field.className = 'admin-field';

    const label = document.createElement('label');
    label.className = 'admin-field__label';
    label.textContent = labelText;

    const input = document.createElement('input');
    input.className = 'admin-field__input';
    input.type = 'text';
    input.name = fieldName;
    input.value = fieldValue || '';

    field.appendChild(label);
    field.appendChild(input);

    return field;
  }

  // === ШАГ 2. Кнопка «+ Добавить логотип» ===

  function addEmptyClient() {
    const newClient = {
      id: Date.now(),
      name: '',
      logo: '',
    };

    const card = createClientCard(newClient);
    card.classList.remove('admin-card--collapsed');

    const container = document.getElementById('client-logos');
    container.appendChild(card);

    const nameInput = card.querySelector('input[name="name"]');
    nameInput.focus();

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function bindAddButton() {
    const addBtn = document.getElementById('add-logo-btn');
    addBtn.addEventListener('click', addEmptyClient);
  }

  // === ШАГ 3. Кнопка «Сохранить логотипы клиентов» + статус ===

  function setLogoStatus(message, type) {
    const status = document.getElementById('logo-status');
    status.textContent = message;
    status.className = 'admin-status';

    if (type === 'success') status.classList.add('admin-status--success');
    if (type === 'error') status.classList.add('admin-status--error');
  }

  async function saveClientLogos() {
    const saveBtn = document.getElementById('save-logo-btn');

    saveBtn.disabled = true;
    setLogoStatus('Сохраняю…', 'progress');

    try {
      const getResponse = await fetch('/api/data');

      if (!getResponse.ok) {
        throw new Error('Сервер не отдал данные');
      }

      const data = await getResponse.json();
      const cards = document.querySelectorAll('#client-logos .admin-card');
      const newClients = [];

      cards.forEach((card) => {
        const client = {
          id: Number(card.dataset.id),
        };

        const inputs = card.querySelectorAll('input');
        inputs.forEach((input) => {
          if (!input.name) return;
          client[input.name] = input.value.trim();
        });

        newClients.push(client);
      });

      data.clients.items = newClients;

      const postResponse = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!postResponse.ok) {
        throw new Error('Сервер не принял сохранение');
      }

      setLogoStatus('Сохранено ✓', 'success');
      setTimeout(() => setLogoStatus('', ''), 3000);
    } catch (err) {
      setLogoStatus(`Не удалось сохранить: ${err.message}`, 'error');
      console.error(err);
    } finally {
      saveBtn.disabled = false;
    }
  }

  function bindSaveButton() {
    const saveBtn = document.getElementById('save-logo-btn');
    saveBtn.addEventListener('click', saveClientLogos);
  }

  // === Запуск всей логики при загрузке страницы ===

  document.addEventListener('DOMContentLoaded', () => {
    loadClientLogos();
    bindAddButton();
    bindSaveButton();
  });
})();
