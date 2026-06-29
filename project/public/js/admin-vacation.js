(() => {
  let vacanciesAdminData = null;

  document.addEventListener('DOMContentLoaded', initVacanciesAdmin);

  async function initVacanciesAdmin() {
    const section = document.getElementById('vacancies-admin');

    if (!section) {
      return;
    }

    try {
      vacanciesAdminData = await fetchData();
      fillVacanciesForm(vacanciesAdminData.vacancies);
    } catch (error) {
      setVacanciesStatus('Не удалось загрузить вакансии.', true);
      console.error(error);
    }

    document.getElementById('add-vacancy-btn').addEventListener('click', addEmptyVacancy);
    document.getElementById('save-vacancies-btn').addEventListener('click', saveVacancies);
  }

  async function fetchData() {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error('Сервер не отдал данные');
    }

    return response.json();
  }

  function fillVacanciesForm(vacancies) {
    document.getElementById('vacancies-title-input').value = vacancies?.title || '';
    document.getElementById('vacancies-more-url-input').value = vacancies?.moreUrl || '';

    const list = document.getElementById('vacancies-list');
    list.innerHTML = '';

    if (!Array.isArray(vacancies?.items)) {
      return;
    }

    vacancies.items.forEach((vacancy) => {
      list.appendChild(createVacancyCard(vacancy));
    });
  }

  function createVacancyCard(vacancy) {
    const card = document.createElement('div');
    card.className = 'admin-card admin-card--collapsed';
    card.dataset.id = vacancy.id;

    const header = document.createElement('div');
    header.className = 'admin-card__header';

    const title = document.createElement('span');
    title.className = 'admin-card__title';
    title.textContent = vacancy.title || 'Новая вакансия';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'admin-card__delete';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => card.remove());

    header.addEventListener('click', (event) => {
      if (deleteBtn.contains(event.target)) return;
      card.classList.toggle('admin-card--collapsed');
    });

    header.append(title, deleteBtn);
    card.appendChild(header);

    const titleField = createField('Название вакансии', 'title', vacancy.title || '');
    const formatField = createField('Формат работы', 'format', vacancy.format || '');
    const urlField = createField('Ссылка на вакансию', 'url', vacancy.url || '', 'url');

    card.append(titleField, formatField, urlField);

    titleField.querySelector('input').addEventListener('input', (event) => {
      title.textContent = event.target.value || 'Новая вакансия';
    });

    return card;
  }

  function createField(labelText, fieldName, value, type = 'text') {
    const field = document.createElement('div');
    field.className = 'admin-field';

    const label = document.createElement('label');
    label.className = 'admin-field__label';
    label.textContent = labelText;

    const input = document.createElement('input');
    input.className = 'admin-field__input';
    input.type = type;
    input.name = fieldName;
    input.value = value;

    field.append(label, input);

    return field;
  }

  function addEmptyVacancy() {
    const vacancy = {
      id: Date.now(),
      title: '',
      format: '',
      url: '',
    };

    const card = createVacancyCard(vacancy);
    card.classList.remove('admin-card--collapsed');
    document.getElementById('vacancies-list').appendChild(card);
    card.querySelector('input[name="title"]').focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function collectVacancies() {
    const cards = document.querySelectorAll('#vacancies-list .admin-card');

    return Array.from(cards)
      .map((card, index) => ({
        id: Number(card.dataset.id) || Date.now() + index,
        title: card.querySelector('input[name="title"]').value.trim(),
        format: card.querySelector('input[name="format"]').value.trim(),
        url: card.querySelector('input[name="url"]').value.trim(),
      }))
      .filter((vacancy) => vacancy.title || vacancy.format || vacancy.url);
  }

  async function saveVacancies() {
    const saveBtn = document.getElementById('save-vacancies-btn');
    const items = collectVacancies();

    if (items.some((vacancy) => !vacancy.title)) {
      setVacanciesStatus('У каждой вакансии должно быть название.', true);
      return;
    }

    saveBtn.disabled = true;
    setVacanciesStatus('Сохраняю...', false);

    try {
      const data = await fetchData();
      data.vacancies = {
        ...data.vacancies,
        title: document.getElementById('vacancies-title-input').value.trim() || 'Ищем прямо сейчас',
        moreUrl: document.getElementById('vacancies-more-url-input').value.trim(),
        items,
      };

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Сервер не принял сохранение');
      }

      vacanciesAdminData = data;
      setVacanciesStatus('Вакансии сохранены.', false);
    } catch (error) {
      setVacanciesStatus(`Не удалось сохранить: ${error.message}`, true);
      console.error(error);
    } finally {
      saveBtn.disabled = false;
    }
  }

  function setVacanciesStatus(message, isError) {
    const status = document.getElementById('vacancies-status');

    if (!status) {
      return;
    }

    status.textContent = message;
    status.className = isError
      ? 'admin-status admin-status--error'
      : 'admin-status admin-status--success';
  }
})();
