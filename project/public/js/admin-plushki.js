(() => {
  let benefitsAdminData = null;

  document.addEventListener('DOMContentLoaded', initBenefitsAdmin);

  async function initBenefitsAdmin() {
    const section = document.getElementById('benefits-admin');

    if (!section) {
      return;
    }

    try {
      benefitsAdminData = await fetchData();
      fillBenefitsForm(benefitsAdminData.benefits);
    } catch (error) {
      setBenefitsStatus('Не удалось загрузить плюшки.', true);
      console.error(error);
    }

    document.getElementById('add-benefit-btn').addEventListener('click', addEmptyBenefit);
    document.getElementById('save-benefits-btn').addEventListener('click', saveBenefits);
  }

  async function fetchData() {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error('Сервер не отдал данные');
    }

    return response.json();
  }

  function fillBenefitsForm(benefits) {
    document.getElementById('benefits-title-input').value = benefits?.title || '';

    const list = document.getElementById('benefits-list');
    list.innerHTML = '';

    if (!Array.isArray(benefits?.items)) {
      return;
    }

    benefits.items.forEach((benefit) => {
      list.appendChild(createBenefitCard(benefit));
    });
  }

  function createBenefitCard(benefit) {
    const card = document.createElement('div');
    card.className = 'admin-card admin-card--collapsed';
    card.dataset.id = benefit.id;

    const header = document.createElement('div');
    header.className = 'admin-card__header';

    const title = document.createElement('span');
    title.className = 'admin-card__title';
    title.textContent = benefit.title || 'Новая плюшка';

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

    const titleField = createInputField('Заголовок', 'title', benefit.title || '');
    const descriptionField = createTextareaField('Описание', 'description', benefit.description || '');

    card.append(titleField, descriptionField);

    titleField.querySelector('input').addEventListener('input', (event) => {
      title.textContent = event.target.value || 'Новая плюшка';
    });

    return card;
  }

  function createInputField(labelText, fieldName, value) {
    const field = document.createElement('div');
    field.className = 'admin-field';

    const label = document.createElement('label');
    label.className = 'admin-field__label';
    label.textContent = labelText;

    const input = document.createElement('input');
    input.className = 'admin-field__input';
    input.type = 'text';
    input.name = fieldName;
    input.value = value;

    field.append(label, input);

    return field;
  }

  function createTextareaField(labelText, fieldName, value) {
    const field = document.createElement('div');
    field.className = 'admin-field';

    const label = document.createElement('label');
    label.className = 'admin-field__label';
    label.textContent = labelText;

    const textarea = document.createElement('textarea');
    textarea.className = 'admin-field__input';
    textarea.name = fieldName;
    textarea.rows = 4;
    textarea.value = value;

    field.append(label, textarea);

    return field;
  }

  function addEmptyBenefit() {
    const benefit = {
      id: Date.now(),
      title: '',
      description: '',
    };

    const card = createBenefitCard(benefit);
    card.classList.remove('admin-card--collapsed');
    document.getElementById('benefits-list').appendChild(card);
    card.querySelector('input[name="title"]').focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function collectBenefits() {
    const cards = document.querySelectorAll('#benefits-list .admin-card');

    return Array.from(cards)
      .map((card, index) => ({
        id: Number(card.dataset.id) || Date.now() + index,
        title: card.querySelector('input[name="title"]').value.trim(),
        description: card.querySelector('textarea[name="description"]').value.trim(),
      }))
      .filter((benefit) => benefit.title || benefit.description);
  }

  async function saveBenefits() {
    const saveBtn = document.getElementById('save-benefits-btn');
    const items = collectBenefits();

    if (items.some((benefit) => !benefit.title)) {
      setBenefitsStatus('У каждой плюшки должен быть заголовок.', true);
      return;
    }

    saveBtn.disabled = true;
    setBenefitsStatus('Сохраняю...', false);

    try {
      const data = await fetchData();
      data.benefits = {
        ...data.benefits,
        title: document.getElementById('benefits-title-input').value.trim() || 'Плюшки и все такое',
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

      benefitsAdminData = data;
      setBenefitsStatus('Плюшки сохранены.', false);
    } catch (error) {
      setBenefitsStatus(`Не удалось сохранить: ${error.message}`, true);
      console.error(error);
    } finally {
      saveBtn.disabled = false;
    }
  }

  function setBenefitsStatus(message, isError) {
    const status = document.getElementById('benefits-status');

    if (!status) {
      return;
    }

    status.textContent = message;
    status.className = isError
      ? 'admin-status admin-status--error'
      : 'admin-status admin-status--success';
  }
})();
