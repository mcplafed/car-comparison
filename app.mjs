import {projectMileage, depreciation} from './model.mjs';

const number = value => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0}).format(value).replaceAll('\u00a0', ' ');
const euro = value => value == null ? '— не подтверждено' : `${number(value)} €`;
const km = value => value == null ? '— не подтверждено' : `${number(value)} км`;
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const link = (url, label) => {
  const node = element('a', label);
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  return node;
};
const date = value => value ? `${value.slice(5, 7)}.${value.slice(0, 4)}` : '— не подтверждено';
const inputValue = input => input.value.trim() === '' || !input.validity.valid ? null : Number(input.value);
const feature = value => value == null ? element('span', '— не подтверждено', 'unknown') : element('span', value === true ? 'Указано' : value === false ? 'Нет — явно указано' : value, value === true ? 'yes' : '');

async function start() {
  const response = await fetch('./cars.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const cars = await response.json();
  const head = document.querySelector('thead');
  const body = document.querySelector('tbody');
  const row = element('tr');
  row.append(element('th', 'Параметр'));
  for (const car of cars) {
    const th = element('th');
    th.scope = 'col';
    th.dataset.car = car.id;
    th.append(element('span', car.name, 'car-name'), element('span', car.verification === 'official' ? 'Первичный источник Toyota' : car.verification === 'corroborated' ? 'Подтверждено агрегатором' : car.verification === 'provided' ? 'Текст объявления от пользователя' : 'Данные не подтверждены', 'car-sub'), link(car.source, 'Открыть объявление ↗'));
    row.append(th);
  }
  head.append(row);
  const addSection = title => {
    const tr = element('tr', null, 'section');
    tr.append(element('th', title));
    for (const car of cars) tr.append(element('td'));
    body.append(tr);
  };
  const addRow = (title, render, className = '') => {
    const tr = element('tr', null, className);
    const th = element('th', title);
    th.scope = 'row';
    tr.append(th);
    cars.forEach(car => {
      const td = element('td');
      const value = render(car, td);
      if (value instanceof Node) td.append(value);
      else if (value != null) td.textContent = value;
      tr.append(td);
    });
    body.append(tr);
  };
  addSection('01 / Объявление');
  addRow('Цена в объявлении', car => element('span', euro(car.price), 'money'));
  addRow('Пробег сейчас', car => element('span', km(car.mileage), 'numeric'));
  addRow('Первая регистрация', car => date(car.registration));
  addRow('Производство', car => date(car.production));
  addRow('Двигатель / мощность', car => car.engine && car.power ? `${car.engine} / ${car.power} л.с.` : car.powerNote ?? '— не подтверждено');
  addRow('Комплектация', car => car.trim ?? '— не подтверждено');
  addRow('Цвет по объявлению', car => car.colour ?? '— не подтверждено');
  addRow('Продавец / место', car => car.seller ? `${car.seller} · ${car.location ?? 'место не подтверждено'}` : '— не подтверждено');
  addRow('Владельцев по источнику', car => car.owners ?? '— не подтверждено');
  addSection('02 / Оснащение — только подтверждённое');
  const features = {screen:'Мультимедиа',cluster:'Цифровая приборка',heatedSeats:'Подогрев передних сидений',heatedWheel:'Подогрев руля',camera:'Камера заднего вида',parking:'Парктроники',blindSpot:'Контроль слепых зон',rearTraffic:'Поперечный трафик сзади',electricBoot:'Электропривод багажника',hud:'Проекционный дисплей',jbl:'JBL',panorama:'Панорамная крыша',service:'Сервисная история'};
  for (const [key, title] of Object.entries(features)) addRow(title, car => feature(car.features[key]));
  addSection('03 / Ваш сценарий владения');
  addRow('Пробег при продаже', (car, td) => {td.dataset.mileage = car.id;});
  addRow('Возраст при продаже', (car, td) => {td.dataset.age = car.id;});
  addRow('Импорт и оформление, €', (car, td) => {
    const input = element('input');
    input.type = 'number'; input.min = '0'; input.max = '100000'; input.step = '1'; input.value = '0';
    input.setAttribute('aria-label', `Расходы на импорт и оформление, € — ${car.name}`);
    input.dataset.import = car.id;
    td.append(input, element('span', '0 — расходы пока не рассчитаны', 'small'));
  });
  addRow('Цена продажи: от / до, €', (car, td) => {
    const range = element('div', null, 'range');
    for (const [key, label] of [['resaleLow','От'], ['resaleHigh','До']]) {
      const wrapper = element('label', label);
      const input = element('input');
      input.type = 'number'; input.min = '0'; input.max = '1000000'; input.step = '1';
      input.value = car[key] ?? ''; input.placeholder = 'Не оценено';
      input.setAttribute('aria-label', `Цена продажи ${label.toLowerCase()}, € — ${car.name}`);
      input.dataset[key] = car.id;
      wrapper.append(input);range.append(wrapper);
    }
    td.append(range);
  }, 'scenario');
  addRow('Обесценивание за срок', (car, td) => {td.dataset.loss = car.id;}, 'scenario');
  addRow('Обесценивание / месяц', (car, td) => {td.dataset.monthly = car.id;}, 'scenario');
  addRow('Основание цены продажи', car => car.scenarioNote, 'scenario');
  for (const car of cars) {
    const article = element('article');
    article.append(element('h3', car.name), element('p', car.notes));
    article.append(link(car.source, 'Исходное объявление ↗'));
    if (car.evidence) article.append(link(car.evidence, 'Дополнительный источник ↗'));
    article.append(element('p', `Проверено: ${car.checked}.`, 'small'));
    document.querySelector('#source-notes').append(article);
  }
  const update = () => {
    const annual = inputValue(document.querySelector('#annual'));
    const years = inputValue(document.querySelector('#years'));
    document.querySelector('#scenario-warning').textContent = annual === 20000 && years === 4 ? 'Диапазоны будущих цен — ручные сценарии, а не прогноз рынка. Для двух новых вариантов оценка пока не задана.' : 'Вы изменили срок или пробег. Цены продажи НЕ пересчитаны: скорректируйте их вручную. Исходные оценки относятся только к 4 годам и 20 000 км/год.';
    for (const car of cars) {
      const projected = annual != null && years != null ? projectMileage(car.mileage, annual, years) : null;
      document.querySelector(`[data-mileage="${car.id}"]`).textContent = km(projected);
      let age = '— не подтверждено';
      if (car.registration && years != null) {
        const [year, month] = car.registration.split('-').map(Number);
        const ageMonths = (2026 - year + years) * 12 + 11 - month;
        age = `${Math.floor(ageMonths / 12)} г. ${ageMonths % 12} мес.`;
      }
      document.querySelector(`[data-age="${car.id}"]`).textContent = age;
      const costs = inputValue(document.querySelector(`[data-import="${car.id}"]`));
      const low = inputValue(document.querySelector(`[data-resale-low="${car.id}"]`));
      const high = inputValue(document.querySelector(`[data-resale-high="${car.id}"]`));
      const result = depreciation(car.price, costs, low, high, years);
      document.querySelector(`[data-loss="${car.id}"]`).textContent = result ? `${euro(result.low)} — ${euro(result.high)}` : '— заполните корректный сценарий';
      document.querySelector(`[data-monthly="${car.id}"]`).textContent = result ? `${euro(result.monthlyLow)} — ${euro(result.monthlyHigh)}` : '—';
    }
  };
  document.querySelector('main').addEventListener('input', update);
  update();
}
start().catch(error => {
  const target = document.querySelector('#error');
  target.hidden = false;
  target.textContent = `Не удалось загрузить данные. Попробуйте обновить страницу. (${error.message})`;
});
