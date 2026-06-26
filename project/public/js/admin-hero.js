let heroAdminData = null;

async function initHeroAdmin() {
  const form = document.getElementById('hero-admin-form');

  if (!form) {
    return;
  }

  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error('Не удалось загрузить данные');
    }

    heroAdminData = await response.json();
    fillHeroForm(heroAdminData.hero);
  } catch (error) {
    setHeroStatus('Не удалось загрузить Hero.', true);
    console.error(error);
  }

  form.addEventListener('submit', saveHero);
}

function fillHeroForm(hero) {
  document.getElementById('hero-title-input').value = hero?.title || '';
  document.getElementById('hero-subtitle-input').value = hero?.subtitle || '';

  const statsContainer = document.getElementById('hero-stats-admin');
  statsContainer.innerHTML = '';

  if (!Array.isArray(hero?.stats)) {
    return;
  }

  hero.stats.forEach((stat) => {
    statsContainer.appendChild(createHeroStatCard(stat));
  });
}

function createHeroStatCard(stat) {
  // Стартуем свёрнутой — единый стиль с командой
  const card = document.createElement('div');
  card.className = 'admin-card admin-card--collapsed';
  card.dataset.id = stat.id;

  const header = document.createElement('div');
  header.className = 'admin-card__header';

  // В шапке — «цифра + описание», чтобы свёрнутая карточка несла смысл
  const title = document.createElement('span');
  title.className = 'admin-card__title';
  const composeTitle = (value, label) =>
    [value, label].filter(Boolean).join(' — ') || 'Новый пункт';
  title.textContent = composeTitle(stat.value, stat.label);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'admin-card__delete';
  deleteBtn.textContent = 'Удалить';
  deleteBtn.addEventListener('click', () => card.remove());

  // Клик по шапке (кроме кнопки) — сворачивает/разворачивает
  header.addEventListener('click', (event) => {
    if (deleteBtn.contains(event.target)) return;
    card.classList.toggle('admin-card--collapsed');
  });

  header.appendChild(title);
  header.appendChild(deleteBtn);
  card.appendChild(header);

  const valueField = createHeroField('Цифра', 'value', stat.value);
  const labelField = createHeroField('Описание', 'label', stat.label);
  card.appendChild(valueField);
  card.appendChild(labelField);

  // Живое обновление шапки при правке полей
  const updateTitle = () => {
    title.textContent = composeTitle(
      valueField.querySelector('input').value,
      labelField.querySelector('input').value
    );
  };
  valueField.querySelector('input').addEventListener('input', updateTitle);
  labelField.querySelector('input').addEventListener('input', updateTitle);

  return card;
}

function createHeroField(labelText, fieldName, fieldValue) {
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

async function saveHero(event) {
  event.preventDefault();

  if (!heroAdminData) {
    setHeroStatus('Данные еще не загружены.', true);
    return;
  }

  const nextData = {
    ...heroAdminData,
    hero: {
      ...heroAdminData.hero,
      title: document.getElementById('hero-title-input').value.trim(),
      subtitle: document.getElementById('hero-subtitle-input').value.trim(),
      stats: collectHeroStats(),
    },
  };

  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nextData),
    });

    if (!response.ok) {
      throw new Error('Не удалось сохранить данные');
    }

    heroAdminData = nextData;
    setHeroStatus('Hero сохранен.', false);
  } catch (error) {
    setHeroStatus('Не удалось сохранить Hero.', true);
    console.error(error);
  }
}

function collectHeroStats() {
  const cards = document.querySelectorAll('#hero-stats-admin .admin-card');

  return Array.from(cards).map((card, index) => ({
    id: Number(card.dataset.id) || index + 1,
    value: card.querySelector('[name="value"]').value.trim(),
    label: card.querySelector('[name="label"]').value.trim(),
  }));
}

function setHeroStatus(message, isError) {
  const status = document.getElementById('hero-status');

  if (!status) {
    return;
  }

  status.textContent = message;
  status.className = isError
    ? 'admin-status admin-status--error'
    : 'admin-status admin-status--success';
}

document.addEventListener('DOMContentLoaded', initHeroAdmin);
