const colorClasses = [
  'bonus__item--purple',
  'bonus__item--green',
  'bonus__item--red',
  'bonus__item--dark',
  'bonus__item--pink',
  'bonus__item--cyan',
];

function setText(selector, text) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = text || '';
  }
}

function clearList(selector) {
  const element = document.querySelector(selector);

  if (element) {
    element.innerHTML = '';
  }

  return element;
}

function renderHero(hero) {
  if (!hero) {
    return;
  }

  setText('#hero-title', hero.title);
  setText('#hero-subtitle', hero.subtitle);

  const statsList = clearList('#hero-stats');

  if (!statsList || !Array.isArray(hero.stats)) {
    return;
  }

  hero.stats.forEach((stat) => {
    const item = document.createElement('li');
    const value = document.createElement('span');
    const label = document.createElement('p');

    item.className = 'hero__stat';
    value.className = 'hero__stat-value';

    value.textContent = stat.value;
    label.textContent = stat.label;

    item.append(value, label);
    statsList.append(item);
  });
}

function renderTeam(team) {
  if (!team) {
    return;
  }

  setText('#team-title', team.title);
  setText('#team-subtitle', team.subtitle);

  const teamList = clearList('#team-list');

  if (!teamList || !Array.isArray(team.members)) {
    return;
  }

  team.members.forEach((member) => {
    const item = document.createElement('li');
    const image = document.createElement('img');
    const info = document.createElement('div');
    const name = document.createElement('h3');
    const position = document.createElement('p');

    item.className = 'team-card';
    image.className = 'team-card__photo';
    info.className = 'team-card__info';
    name.className = 'team-card__name';
    position.className = 'team-card__position';

    image.src = member.photo;
    image.alt = member.name;
    image.loading = 'lazy';
    name.textContent = member.name;
    position.textContent = member.position;

    info.append(name, position);
    item.append(image, info);
    teamList.append(item);
  });
}

function renderClients(clients) {
  const clientsList = clearList('#clients-list');

  if (!clientsList || !clients || !Array.isArray(clients.items)) {
    return;
  }

  clients.items.forEach((client) => {
    const item = document.createElement('li');
    const image = document.createElement('img');

    item.className = 'brands__item';
    image.className = 'brands__logo';
    image.src = client.logo;
    image.alt = client.name;
    image.loading = 'lazy';

    item.append(image);
    clientsList.append(item);
  });
}

function renderVacancies(vacancies) {
  if (!vacancies) {
    return;
  }

  setText('#vacancies-title', vacancies.title);

  const vacanciesList = clearList('#vacancies-list');

  if (!vacanciesList || !Array.isArray(vacancies.items)) {
    return;
  }

  vacancies.items.forEach((vacancy) => {
    const link = document.createElement('a');
    const card = document.createElement('article');
    const title = document.createElement('h3');
    const footer = document.createElement('div');
    const format = document.createElement('p');
    const badge = document.createElement('span');

    link.className = 'vacancies__item-link';
    link.href = vacancy.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    footer.className = 'vacancies__item-footer';
    badge.className = 'vacancies__badge';

    title.textContent = vacancy.title;
    format.textContent = vacancy.format;
    badge.textContent = 'hh';

    footer.append(format, badge);
    card.append(title, footer);
    link.append(card);
    vacanciesList.append(link);
  });

  if (vacancies.moreUrl) {
    const link = document.createElement('a');
    const card = document.createElement('article');
    const title = document.createElement('h3');
    const arrow = document.createElement('span');

    link.className = 'vacancies__item-link vacancies__item-link--more';
    link.href = vacancies.moreUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    arrow.className = 'vacancies__arrow';

    title.textContent = 'Еще больше вакансий на HeadHunter';
    arrow.textContent = '>';

    card.append(title, arrow);
    link.append(card);
    vacanciesList.append(link);
  }
}

function renderBenefits(benefits) {
  if (!benefits) {
    return;
  }

  setText('#benefits-title', benefits.title);

  const benefitsGrid = clearList('#plushki-grid');

  if (!benefitsGrid || !Array.isArray(benefits.items)) {
    return;
  }

  benefits.items.forEach((benefit, index) => {
    const item = document.createElement('article');
    const title = document.createElement('h3');
    const text = document.createElement('p');

    item.className = `bonus__item ${colorClasses[index % colorClasses.length]}`;
    title.className = 'bonus__item-title';
    text.className = 'bonus__item-text';

    title.textContent = benefit.title;
    text.textContent = benefit.description;

    item.append(title, text);
    benefitsGrid.append(item);
  });
}

function showError(error) {
  const main = document.querySelector('main');
  const message = document.createElement('p');

  message.className = 'error-message';
  message.textContent = 'Не получилось загрузить данные. Проверь сервер и data.json.';

  if (main) {
    main.prepend(message);
  }

  console.error(error);
}

async function loadData() {
  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status}`);
    }

    const data = await response.json();
    const description = document.querySelector('meta[name="description"]');

    document.title = data.site?.title || 'TL:TECH';

    if (description) {
      description.content = data.site?.description || '';
    }

    renderHero(data.hero);
    renderTeam(data.team);
    renderClients(data.clients);
    renderVacancies(data.vacancies);
    renderBenefits(data.benefits);
  } catch (error) {
    showError(error);
  }
}

document.addEventListener('DOMContentLoaded', loadData);
