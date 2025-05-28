---
applyTo: '**/*.{ts,tsx}'
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

## Comments

- Add comments only when function behavior is not easily predictable
- Do NOT use param or return annotations

## React

- Use TailwindCSS
- Use shadcn/ui
- Write components in the format: export function ComponentName () {}
