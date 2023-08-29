import { test, expect } from '@playwright/test';

test('host and join game', async ({ page }) => {
  await page.goto(process.env.CLIENT_APP_URL);

  // Click "Host Game" in the new tab
  await page.click('#host-game');
  await page.waitForTimeout(3000);

  const playersList = await page.$('#players-list');

  // Check if up to 3 items of players were found
  const listItems = await playersList.$$('li');
  expect(listItems.length).toBeGreaterThanOrEqual(1);
  expect(listItems.length).toBeLessThanOrEqual(3);

  if(listItems.length === 1){
    console.log('Host is the only player in the game');
  }

  // Open a new tab and switch to it
  const context = page.context();
  const newPage = await context.newPage();
  await newPage.goto(process.env.CLIENT_APP_URL);
  await newPage.click('#join-game');
  await newPage.waitForTimeout(5000);

  // Close the new tab
  await newPage.close();
});
