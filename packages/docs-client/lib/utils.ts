/**
 * Helper functions for testing
 */

/**
 * Function that only performs type checking (does nothing at runtime)
 */
export function expectType<T>(_value: T): void {}

/**
 * Type-level assertion
 * Compiles only when Equals<T, U> is true
 */
export function assertType<_T extends true>(): void {}

/**
 * Default configuration for tests
 */
export const defaultTestConfig = {
  defaultIndexIcon: "📁",
  indexFileName: "index.md",
  archiveDirectoryName: "_",
  defaultDirectoryName: "Directory",
  indexMetaIncludes: [],
  directoryExcludes: [".vitepress"],
}
