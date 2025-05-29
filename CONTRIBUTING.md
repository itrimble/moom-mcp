# Contributing to Moom MCP

Thank you for your interest in contributing to Moom MCP! This document provides guidelines for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions related to this project.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in the [Issues](https://github.com/itrimble/moom-mcp/issues) section
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (macOS version, Node.js version, Moom version)

### Suggesting Features

1. Open a new issue with the "enhancement" label
2. Describe the feature and its use case
3. Explain how it would benefit users

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add feature: description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Test on macOS with Moom installed
- Ensure all existing tests pass

## Testing

Before submitting:
```bash
npm test
npm run test-ui
npm run validate
```

## Questions?

Feel free to open an issue for any questions about contributing.