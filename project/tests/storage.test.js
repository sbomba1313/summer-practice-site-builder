// ============================================================
// Тесты для src/storage.js — логики работы с данными.
// Запуск: npm test  (использует встроенный node:test)
// ============================================================

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const storage = require('../src/storage');

// Свежая копия данных для каждого теста (чтобы тесты не влияли друг на друга)
function sampleData() {
  return {
    hero: { title: 'TL:TECH', subtitle: 'Подзаголовок', stats: [] },
    team: { members: [{ id: 1, name: 'Алексей', position: 'СТО', photo: '/a.png' }] },
    clients: { items: [{ id: 1, name: 'Русь', logo: '/r.svg' }] },
    vacancies: { items: [{ id: 1, title: 'SRE', format: 'удалённо', url: 'http://x' }] },
    benefits: { items: [{ id: 1, title: 'Обед', description: 'вкусно' }] },
  };
}

// ---------- nextId ----------

test('nextId возвращает 1 для пустого списка', () => {
  assert.strictEqual(storage.nextId([]), 1);
});

test('nextId возвращает максимальный id + 1', () => {
  assert.strictEqual(storage.nextId([{ id: 3 }, { id: 7 }, { id: 5 }]), 8);
});

// ---------- Команда ----------

test('addTeamMember добавляет сотрудника с уникальным id', () => {
  const data = sampleData();
  const item = storage.addTeamMember(data, { name: 'Юра', position: 'СРО', photo: '/y.png' });
  assert.strictEqual(data.team.members.length, 2);
  assert.strictEqual(item.id, 2);
  assert.strictEqual(item.name, 'Юра');
});

test('addTeamMember обрезает пробелы по краям имени', () => {
  const data = sampleData();
  const item = storage.addTeamMember(data, { name: '  Аня  ' });
  assert.strictEqual(item.name, 'Аня');
});

test('addTeamMember выбрасывает ошибку при пустом имени', () => {
  const data = sampleData();
  assert.throws(() => storage.addTeamMember(data, { name: '' }), /Имя сотрудника обязательно/);
  assert.throws(() => storage.addTeamMember(data, { name: '   ' }), /Имя сотрудника обязательно/);
  assert.strictEqual(data.team.members.length, 1); // никого не добавили
});

test('deleteTeamMember удаляет сотрудника по id', () => {
  const data = sampleData();
  const ok = storage.deleteTeamMember(data, 1);
  assert.strictEqual(ok, true);
  assert.strictEqual(data.team.members.length, 0);
});

test('deleteTeamMember возвращает false для несуществующего id', () => {
  const data = sampleData();
  const ok = storage.deleteTeamMember(data, 999);
  assert.strictEqual(ok, false);
  assert.strictEqual(data.team.members.length, 1);
});

// ---------- Клиенты ----------

test('addClient добавляет клиента', () => {
  const data = sampleData();
  const item = storage.addClient(data, { name: 'Сочи Парк', logo: '/s.svg' });
  assert.strictEqual(data.clients.items.length, 2);
  assert.strictEqual(item.name, 'Сочи Парк');
});

test('addClient не принимает пустое название', () => {
  const data = sampleData();
  assert.throws(() => storage.addClient(data, { name: '' }), /Название клиента обязательно/);
});

test('deleteClient удаляет клиента по id', () => {
  const data = sampleData();
  assert.strictEqual(storage.deleteClient(data, 1), true);
  assert.strictEqual(data.clients.items.length, 0);
});

// ---------- Вакансии ----------

test('addVacancy добавляет новую вакансию', () => {
  const data = sampleData();
  const item = storage.addVacancy(data, { title: 'Backend', format: 'офис', url: 'http://y' });
  assert.strictEqual(data.vacancies.items.length, 2);
  assert.strictEqual(item.id, 2);
  assert.strictEqual(item.title, 'Backend');
});

test('addVacancy не принимает пустой title', () => {
  const data = sampleData();
  assert.throws(() => storage.addVacancy(data, { title: '' }), /Название вакансии обязательно/);
  assert.strictEqual(data.vacancies.items.length, 1);
});

test('deleteVacancy удаляет вакансию по id', () => {
  const data = sampleData();
  assert.strictEqual(storage.deleteVacancy(data, 1), true);
  assert.strictEqual(data.vacancies.items.length, 0);
});

// ---------- Плюшки ----------

test('addBenefit добавляет плюшку', () => {
  const data = sampleData();
  const item = storage.addBenefit(data, { title: 'Бонусы', description: 'премии' });
  assert.strictEqual(data.benefits.items.length, 2);
  assert.strictEqual(item.title, 'Бонусы');
});

test('addBenefit не принимает пустой заголовок', () => {
  const data = sampleData();
  assert.throws(() => storage.addBenefit(data, { title: '' }), /Заголовок плюшки обязателен/);
});

test('deleteBenefit удаляет плюшку по id', () => {
  const data = sampleData();
  assert.strictEqual(storage.deleteBenefit(data, 1), true);
  assert.strictEqual(data.benefits.items.length, 0);
});

// ---------- Hero ----------

test('updateHero меняет title и subtitle', () => {
  const data = sampleData();
  storage.updateHero(data, { title: 'НОВЫЙ', subtitle: 'новый подзаголовок' });
  assert.strictEqual(data.hero.title, 'НОВЫЙ');
  assert.strictEqual(data.hero.subtitle, 'новый подзаголовок');
});

test('updateHero выбрасывает ошибку при пустом title', () => {
  const data = sampleData();
  assert.throws(() => storage.updateHero(data, { title: '' }), /Заголовок Hero обязателен/);
});

// ---------- Чтение/запись файла ----------

test('writeData и readData сохраняют и читают данные (круговой тест)', () => {
  const tmpFile = path.join(os.tmpdir(), `storage-test-${Date.now()}.json`);
  const data = sampleData();

  storage.writeData(data, tmpFile);
  const loaded = storage.readData(tmpFile);

  assert.deepStrictEqual(loaded, data);            // прочитали ровно то, что записали
  assert.strictEqual(loaded.team.members[0].name, 'Алексей');

  fs.unlinkSync(tmpFile);                          // убираем за собой временный файл
});

test('readData возвращает объект со всеми секциями сайта', () => {
  const tmpFile = path.join(os.tmpdir(), `storage-test-${Date.now()}-2.json`);
  storage.writeData(sampleData(), tmpFile);
  const data = storage.readData(tmpFile);

  assert.ok(data.hero, 'есть hero');
  assert.ok(data.team, 'есть team');
  assert.ok(data.clients, 'есть clients');
  assert.ok(data.vacancies, 'есть vacancies');
  assert.ok(data.benefits, 'есть benefits');

  fs.unlinkSync(tmpFile);
});
