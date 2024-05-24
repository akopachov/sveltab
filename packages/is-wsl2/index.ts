import { execSync } from 'child_process';

/**
 * Checks if the current environment is Windows Subsystem for Linux 2 (WSL2).
 * @returns {boolean} Returns `true` if the environment is WSL2, `false` otherwise.
 */
export function isWsl2(): boolean {
  try {
    return execSync('uname -a').toString().includes('WSL2');
  } catch {
    return false;
  }
}
