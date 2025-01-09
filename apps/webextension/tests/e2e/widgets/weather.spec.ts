import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';

test.use({
  permissions: ['geolocation'],
});

const TestCities = [
  { city: 'Poznan', country: 'Poland', latitude: 52.4069, longitude: 16.9299 },
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { city: 'Shinjuku', country: 'Japan', latitude: 35.6895, longitude: 139.69171 },
  { city: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
];

for (const cityInfo of TestCities) {
  test(`loads weather forecast for ${cityInfo.city}`, async ({ page, context }) => {
    await context.setGeolocation({ latitude: cityInfo.latitude, longitude: cityInfo.longitude });
    await page.goto('/');
    const workspacePage = new WorkspacePage(page);
    const widgetLocator = await workspacePage.addNewWidget('weather');
    await page.waitForLoadState('networkidle');

    const locationLocator = widgetLocator.locator('.location');
    await locationLocator.waitFor({ state: 'visible' });
    await expect(locationLocator).toContainText(new RegExp(`${cityInfo.city}, (.+, )?${cityInfo.country}`));
    const currentWeatherIconLocator = widgetLocator.locator('.current-weather-icon');
    await currentWeatherIconLocator.waitFor({ state: 'visible' });
    await expect(currentWeatherIconLocator).toHaveAttribute('src', /https:\/\/.+/);
    await expect(currentWeatherIconLocator).toHaveJSProperty('complete', true);
    const currentTemperatureLocator = widgetLocator.locator('.current-weather-temperature');
    await currentTemperatureLocator.waitFor({ state: 'visible' });
    await expect(currentTemperatureLocator).toHaveText(/-?\d+°/);
  });
}
