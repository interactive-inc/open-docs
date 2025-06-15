---
applyTo: "**/*.{ts,tsx}"
---

# File rules - TypeScript

## Code Structure and Design

- Single Responsibility Principle
- Open-Closed Principle  
- Dependency Inversion Principle
- Immutable: Generate new d  constructor(private readonly props: Props) {
    Object.freeze(this)
  }ta instead of modifying data
- Referential Transparency: Create pure functions
- Composition: Function composition instead of inheritance
- Separation of Concerns: Separate data transformation, side effects, and business logic

## Recommended Techniques

- **Design Patterns**: Strategy, Factory Method, Adapter, Facade, Builder (Fluent Interface)
- Value Objects, Entities, Aggregate Root
- DI, Reducer, Currying, Early Return

## Fluent API Design

- **Method Chaining**: Enable natural, readable operation sequences
- **Immutability**: Return new objects instead of modifying existing ones
- **Type Safety**: Leverage TypeScript's type system for compile-time validation

```ts
export class DocumentEntity {
  constructor(private readonly content: string) {}
  
  withContent(newContent: string): DocumentEntity {
    return new DocumentEntity(newContent)
  }
  
  toFormattedText(): string {
    return this.formatContent()
  }
  
  private formatContent(): string {
    // Implementation details hidden
  }
}
```

Use like this:

```ts
// Good: Fluent API with method chaining
const result = document
  .withTitle("New Title")
  .withMetadata({ author: "John" })
  .toMarkdown()

// Avoid: Imperative style with mutations
document.setTitle("New Title")
document.setMetadata({ author: "John" })
const result = document.getMarkdown()
```

## Service Layer & Facade Patterns

- **Centralized Coordination**: Coordinate multiple domain objects and external resources
- **Unified Interface**: Hide complexity of subsystem interactions behind simple methods
- **Resource Management**: Handle I/O, validation, and cross-cutting concerns

```ts
// Service Layer: Coordinates domain operations
export class DocumentService {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly parser: ContentParser,
    private readonly validator: SchemaValidator
  ) {}

  async getDocument(path: string): Promise<Document> {
    // Facade: Single method hides multiple subsystem calls
    const content = await this.fileSystem.readFile(path)
    const parsed = this.parser.parseContent(content)
    const schema = await this.getSchemaForPath(path)
    const validated = this.validator.applyDefaults(parsed, schema)
    return new Document(validated)
  }
}
```

## Refactoring Decision Rules

- **Extract to domain method**: When logic appears in 2+ places
- **Create fluent method**: When manual object manipulation is required
- **Use Service Layer**: When coordinating 3+ related operations
- **Method naming**: `with*()` for transformations, `to*()` for outputs, `get*()` for retrieval

```ts
// Good: Logic encapsulated in domain object
const updatedDocument = document.withProperties(newProperties)
const markdown = updatedDocument.toMarkdown()

// Avoid: Manual operations scattered in calling code
const merged = { ...document.properties, ...newProperties }
const formatted = formatMarkdown(merged, document.content)
```

## Error Handling

- **Service Boundaries**: Handle errors at Service level, not in domain objects
- **Input Validation**: Validate at public method entry points only
- **Consistent Patterns**: Use HTTPException for API boundaries, return null/undefined for missing data

```ts
// Good: Error handling at service level
export class DocumentService {
  async getDocument(path: string): Promise<Document> {
    const exists = await this.fileExists(path)
    if (!exists) {
      throw new HTTPException(404, { message: "File not found" })
    }
    return this.loadDocument(path)
  }
}

// Good: Domain objects focus on business logic
export class Document {
  withTitle(title: string): Document {
    // No error handling needed - pure transformation
    return new Document({ ...this.props, title })
  }
}
```

## Testing Considerations

- **Pure Functions**: Prefer functions that are easy to test in isolation
- **Dependency Injection**: Use constructor injection for testable dependencies
- **Immutable Objects**: Make testing predictable with immutable state

```ts
// Good: Testable with dependency injection
export class DocumentService {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly parser: ContentParser
  ) {}
}

// Good: Pure, testable transformation
export class Document {
  withTitle(title: string): Document {
    return new Document({ ...this.props, title })
  }
}
```

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
- Do NOT explicitly write public modifier
- Use getters actively instead of defining getXxx methods
- Do not define return types for getter methods
- All properties must be readonly
- Constructor must call Object.freeze(this) for immutability

```ts
type Props = {}

/**
 * Class Name
 */
export class ClassName {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  /**
   * Public method description
   */
  method() {
    // method implementation
  }
}
```

## Comments

- Add comments only when function behavior is not easily predictable
- Do NOT use param or return annotations
