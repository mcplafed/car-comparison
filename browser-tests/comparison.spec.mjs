import {test, expect} from '@playwright/test';
test('compares four listings and recalculates mileage without inventing unknown facts', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Corolla/);
  await expect(page.locator('th[data-car]')).toHaveCount(4);
  await expect(page.locator('[data-mileage="arndt-2024"]')).toHaveText('117 400 км');
  await page.getByLabel('Пробег в год, км').fill('15000');
  await expect(page.locator('[data-mileage="arndt-2024"]')).toHaveText('97 400 км');
  await page.getByLabel('Пробег в год, км').fill('20000');
  await page.getByLabel('Расходы на импорт и оформление, € — Arndt 2024').fill('1000');
  await expect(page.locator('[data-loss="arndt-2024"]')).toContainText('6 784');
  await expect(page.getByText('не подтверждено', {exact:false}).first()).toBeVisible();
  await expect(page.locator('[data-car="mobile-51613743792544"]')).toContainText('Текст объявления');
  await expect(page.getByText('2.0 Hybrid · 112 кВт / 152 л.с. в объявлении; системная мощность не подтверждена', {exact:true})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
  expect(errors).toEqual([]);
});

test('accepts exact annual distance and warns when the scenario changes', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Пробег в год, км').fill('20500');
  await expect(page.locator('[data-mileage="arndt-2024"]')).toHaveText('119 400 км');
  await expect(page.locator('#scenario-warning')).toContainText('НЕ пересчитаны');
  await page.getByLabel('Срок владения, лет').fill('3');
  await expect(page.locator('[data-mileage="arndt-2024"]')).toHaveText('98 900 км');
  await page.getByLabel('Пробег в год, км').fill('');
  await expect(page.locator('[data-mileage="arndt-2024"]')).toContainText('не подтверждено');
  await page.getByLabel('Цена продажи от, € — Arndt 2024').fill('25000');
  await expect(page.locator('[data-loss="arndt-2024"]')).toContainText('корректный сценарий');
  await page.getByLabel('Цена продажи от, € — Arndt 2024').fill('17000');
  await page.getByLabel('Цена продажи до, € — Arndt 2024').fill('');
  await expect(page.locator('[data-loss="arndt-2024"]')).toContainText('корректный сценарий');
});
