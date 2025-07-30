# LEX Testing Strategy

## Overview

This document outlines a comprehensive testing strategy for LEX, covering unit tests, integration tests, and end-to-end tests to ensure reliability and maintainability.

## Current State

LEX currently has basic manual testing through:
- `test/build.test.js` - Builds and bundles test components
- `test/lex.test.js` - Simple component with state and refs
- `test/index.test.html` - Generated HTML for manual browser testing

## Proposed Testing Architecture

### 1. Unit Tests (Jest/Vitest)

#### Core Functionality Tests

**State Management**
```javascript
// tests/state.test.js
describe('State Class', () => {
  test('should initialize with correct value')
  test('should update value and trigger callbacks')
  test('should handle multiple change listeners')
  test('should convert to string correctly')
  test('should convert to primitive correctly')
})

describe('useState Hook', () => {
  test('should return state and setter')
  test('should update state when setter is called')
  test('should maintain state between renders')
})
```

**createElement Tests**
```javascript
// tests/createElement.test.js
describe('createElement', () => {
  test('should create DOM elements with correct tag')
  test('should handle props correctly')
  test('should attach event listeners')
  test('should handle refs')
  test('should process children correctly')
  test('should handle function components')
  test('should handle Fragment components')
  test('should assign lexid automatically')
})
```

**Hydration Tests**
```javascript
// tests/hydration.test.js
describe('Hydration System', () => {
  test('should select existing elements by lexid')
  test('should create new elements when lexid not found')
  test('should handle nested hydration')
  test('should maintain event listeners during hydration')
  test('should handle state updates in hydrated elements')
})
```

### 2. Integration Tests (Playwright/Puppeteer)

#### Component Integration Tests

**Basic Components**
```javascript
// tests/integration/components.test.js
describe('Component Integration', () => {
  test('Counter component should increment on click')
  test('State updates should reflect in DOM')
  test('Refs should be properly assigned')
  test('Event listeners should work correctly')
  test('Nested components should render properly')
  test('Fragment should render multiple children')
})
```

**Complex Scenarios**
```javascript
// tests/integration/complex.test.js
describe('Complex Scenarios', () => {
  test('Multiple counters should work independently')
  test('State updates should not affect other components')
  test('Component tree should render correctly')
  test('Dynamic component creation')
  test('Component removal and cleanup')
})
```

### 3. Build System Tests

**ESBuild Integration**
```javascript
// tests/build/build.test.js
describe('Build System', () => {
  test('should bundle JSX correctly')
  test('should handle imports/exports')
  test('should generate correct lexid attributes')
  test('should work with different JSX configurations')
  test('should handle source maps')
})
```

**lex-builder Integration** (if using custom builder)
```javascript
// tests/build/lex-builder.test.js
describe('lex-builder Integration', () => {
  test('should compile JSX to vanilla JS')
  test('should handle complex component structures')
  test('should generate optimized output')
  test('should handle different target environments')
})
```

### 4. Performance Tests

**Rendering Performance**
```javascript
// tests/performance/rendering.test.js
describe('Rendering Performance', () => {
  test('should render 1000 elements efficiently')
  test('should handle rapid state updates')
  test('should not cause memory leaks')
  test('should hydrate existing DOM quickly')
})
```

### 5. Browser Compatibility Tests

**Cross-browser Testing**
```javascript
// tests/browser/compatibility.test.js
describe('Browser Compatibility', () => {
  test('should work in Chrome')
  test('should work in Firefox')
  test('should work in Safari')
  test('should work in Edge')
  test('should work in mobile browsers')
})
```

## Testing Tools Recommendation

### Primary Stack
1. **Vitest** - Fast unit testing with ES modules support
2. **Playwright** - Reliable browser automation
3. **@testing-library/dom** - DOM testing utilities

### Alternative Stack
1. **Jest** - If you prefer more established tooling
2. **Puppeteer** - If you prefer Chrome-only testing

## Test Structure

```
tests/
├── unit/
│   ├── state.test.js
│   ├── createElement.test.js
│   ├── hydration.test.js
│   └── utils.test.js
├── integration/
│   ├── components.test.js
│   ├── complex.test.js
│   └── real-world.test.js
├── build/
│   ├── esbuild.test.js
│   └── lex-builder.test.js
├── performance/
│   └── rendering.test.js
├── browser/
│   └── compatibility.test.js
└── fixtures/
    ├── components/
    └── html/
```

## Implementation Plan

### Phase 1: Unit Tests (Week 1-2)
1. Set up testing framework (Vitest)
2. Implement State class tests
3. Implement createElement tests
4. Implement hydration tests

### Phase 2: Integration Tests (Week 3-4)
1. Set up Playwright
2. Create component integration tests
3. Test complex scenarios
4. Test real-world use cases

### Phase 3: Build & Performance (Week 5-6)
1. Test build system integration
2. Implement performance benchmarks
3. Test browser compatibility
4. Optimize based on test results

### Phase 4: CI/CD Integration (Week 7)
1. Set up GitHub Actions
2. Configure automated testing
3. Add test coverage reporting
4. Set up pre-commit hooks

## Specific Test Cases

### Critical Path Tests

1. **State Reactivity**
   ```javascript
   test('state should update DOM when changed', () => {
     const [count, setCount] = useState(0);
     const element = <div>{count}</div>;
     document.body.appendChild(element);
     
     expect(element.textContent).toBe('0');
     setCount(5);
     expect(element.textContent).toBe('5');
   });
   ```

2. **Event Handling**
   ```javascript
   test('click events should work', () => {
     let clicked = false;
     const element = <button onClick={() => clicked = true}>Click</button>;
     document.body.appendChild(element);
     
     element.click();
     expect(clicked).toBe(true);
   });
   ```

3. **Hydration**
   ```javascript
   test('should hydrate existing elements', () => {
     // Setup existing DOM
     document.body.innerHTML = '<div lexid="0">Original</div>';
     
     const element = <div>Updated</div>;
     document.body.appendChild(element);
     
     expect(document.querySelector('[lexid="0"]').textContent).toBe('Updated');
   });
   ```

### Edge Cases

1. **Nested Fragments**
2. **Circular References**
3. **Large Component Trees**
4. **Rapid State Updates**
5. **Memory Leaks**
6. **Invalid Props**

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:build
      - run: npm run test:performance
```

## Metrics & Coverage

### Coverage Goals
- **Unit Tests**: 95%+ coverage
- **Integration Tests**: 90%+ coverage
- **Critical Paths**: 100% coverage

### Performance Benchmarks
- **Initial Render**: < 100ms for 1000 elements
- **State Update**: < 10ms for single update
- **Hydration**: < 50ms for existing DOM
- **Memory Usage**: < 10MB increase for 1000 components

## Recommendations

### Immediate Actions
1. **Start with unit tests** - They're fastest to implement and provide immediate value
2. **Use Vitest** - Better ES modules support and faster than Jest
3. **Focus on critical paths** - State management, createElement, hydration
4. **Test in real browsers** - Use Playwright for integration tests

### Long-term Strategy
1. **Automated testing pipeline** - Every commit should run tests
2. **Performance monitoring** - Track rendering performance over time
3. **Browser compatibility matrix** - Test against all major browsers
4. **Real-world usage testing** - Test with actual project scenarios

### Testing Philosophy
- **Test behavior, not implementation** - Focus on what users experience
- **Fast feedback loop** - Tests should run quickly during development
- **Reliable automation** - Tests should be deterministic and stable
- **Comprehensive coverage** - Test both happy path and edge cases

This testing strategy will ensure LEX remains reliable, performant, and maintainable as it grows and evolves.