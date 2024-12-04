export function skipFirstRun<T>(fn: (...args: any[]) => T): (...args: any[]) => T | void {
  let firstRun = true;
  return function (...args: any[]) {
    if (firstRun) {
      firstRun = false;
      return;
    }
    return fn(...args);
  };
}
