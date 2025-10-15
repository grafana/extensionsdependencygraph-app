import { Page } from '@playwright/test';
import { expect } from '../fixtures';

/**
 * Helper functions for dependency graph E2E tests
 */

/**
 * Expected counts for different visualization modes based on mock data
 */
export const EXPECTED_COUNTS = {
  addedLinks: {
    providers: 5,
    consumers: 3,
  },
  addedComponents: {
    providers: 3,
    consumers: 1,
  },
  addedFunctions: {
    providers: 1,
    consumers: 1,
  },
  exposedComponents: {
    providers: 3,
    consumers: 1,
  },
  extensionPoint: {
    providers: 5,
    consumers: 5,
    extensionPoints: 26, // Total extension points in mock data
  },
} as const;

/**
 * Waits for a URL parameter to be set to a specific value
 */
export async function waitForUrlParam(page: Page, paramName: string, expectedValue: string): Promise<void> {
  await page.waitForFunction(({ param, value }) => new URL(window.location.href).searchParams.get(param) === value, {
    param: paramName,
    value: expectedValue,
  });
}

/**
 * Waits for a URL parameter to be removed
 */
export async function waitForUrlParamRemoved(page: Page, paramName: string): Promise<void> {
  await page.waitForFunction((param) => !new URL(window.location.href).searchParams.get(param), paramName);
}

/**
 * Gets the plugin ID from a test ID attribute
 */
export function extractPluginIdFromTestId(testId: string, prefix: string): string {
  return testId.replace(prefix, '');
}

/**
 * Asserts that URL parameter matches expected value
 */
export function assertUrlParam(page: Page, paramName: string, expectedValue: string): void {
  const urlParam = new URL(page.url()).searchParams.get(paramName);
  expect(urlParam).toBe(expectedValue);
}

/**
 * Asserts that URL parameter is not present
 */
export function assertUrlParamAbsent(page: Page, paramName: string): void {
  const urlParam = new URL(page.url()).searchParams.get(paramName);
  expect(urlParam).toBeNull();
}
