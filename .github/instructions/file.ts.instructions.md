---
applyTo: "**/*.{ts,tsx}"
---

# File rules - TypeScript

## Code Structure and Design

- Follow the Single Responsibility Principle
- Ensure code is easily testable
- Create highly reusable functions

## Naming and Typing

- Use descriptive naming conventions
- Do NOT abbreviate variable names
- Avoid any type
- Use "type" instead of "interface"
- No type assertion using "as"
- Do NOT use enum

## Functions

- When multiple arguments are needed, use an object named "props" with a defined "Props" type
- Prefer pure functions
- Use immutable data structures
- Isolate side effects
- Ensure type safety

```ts
type Props = {}

/**
 * Class Name
 */
export function FunctionName(props: Props) {
  // props.prop1 // Use props directly
  // const { prop1, prop2 } = props // Do NOT use destructuring
}
```

## Control Flow

- Use for-of loops instead of forEach
- Avoid if-else statements
- Use early returns instead of nested if statements
- Do NOT Use destructuring

## Variables and State

- Use const whenever possible, avoid let and var
- Do NOT use delete operator

## Classes

- Do NOT define classes with only static members
- Avoid class inheritance
- Make classes immutable

```ts
type Props = {}

/**
 * Class Name
 */
export class ClassName {
  constructor(private readonly props: Props) {}

  /**
   * Public method description
   */
  public method() {
    // method implementation
  }
}
```

## Comments

- Add comments only when function behavior is not easily predictable
- Do NOT use param or return annotations

## React

- Use TailwindCSS
- Use shadcn/ui
- Write components in the format: export function ComponentName () {}
- Do NOT use useMemo or useCallback

## TailwindCSS

- Use `space-` or `gap-` instead of `pb-`

## FORBIDDEN

- Do NOT make huge files (basically max 100 lines)
- Do NOT make a huge React hooks
- Hooks that manage all component state
