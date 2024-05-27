import fs from 'fs/promises';

let isWslCached: boolean | undefined;

/**
 * Checks if the current environment is Windows Subsystem for Linux 2 (WSL2).
 * @returns A promise that resolves to a boolean indicating whether the environment is WSL2.
 */
export async function isWsl2(): Promise<boolean> {
  if (isWslCached !== undefined) {
    try {
      const osrelease = await fs.readFile('/proc/sys/kernel/osrelease', 'utf8');
      isWslCached = osrelease.includes('WSL');
    } catch {
      isWslCached = false;
    }
  }

  return !!isWslCached;
}
