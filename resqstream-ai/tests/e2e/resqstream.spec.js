const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('ResQStream tactical pipeline shell', () => {
  test('loads mock assets fixture used by tactical dashboard', async () => {
    const fixturePath = path.resolve(__dirname, '../mocks/mockAssets.json');
    const raw = await fs.promises.readFile(fixturePath, 'utf8');
    const assets = JSON.parse(raw);

    expect(Array.isArray(assets)).toBeTruthy();
    expect(assets.length).toBeGreaterThan(0);
    expect(assets[0]).toHaveProperty('publicId');
    expect(assets[0]).toHaveProperty('secureUrl');
    expect(assets[0]).toHaveProperty('location');
  });

  test('renders a lightweight GIS tactical card grid shell', async ({ page }) => {
    await page.setContent(`
      <main>
        <h1>ResQStream AI</h1>
        <section role="grid" aria-label="Tactical media grid">
          <article role="gridcell" data-testid="asset-card">Drone Thermal Feed</article>
          <article role="gridcell" data-testid="asset-card">Snake-Cam Feed</article>
        </section>
      </main>
    `);

    await expect(page.getByRole('heading', { name: 'ResQStream AI' })).toBeVisible();
    await expect(page.getByRole('grid', { name: 'Tactical media grid' })).toBeVisible();
    await expect(page.getByTestId('asset-card')).toHaveCount(2);
  });
});
