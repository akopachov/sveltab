import { test, expect } from '@playwright/test';
import { WorkspacePage } from '../pom/workspace';
import { Widgets } from '$widgets';

for (const widgetCatalogItem of Widgets) {
  const widgetType = widgetCatalogItem.settings.type;
  test(`instantiates "${widgetType}" widget instance`, async ({ page }) => {
    await page.goto('/');
    const workspacePage = new WorkspacePage(page);
    await page.waitForLoadState('networkidle');
    const widgetLocator = workspacePage.WidgetSection.getWidgetLocatorByType(widgetType);
    if (!(await widgetLocator.isVisible())) {
      await workspacePage.addNewWidget(widgetType);
    }
    await expect(widgetLocator).toBeVisible();
  });
}
