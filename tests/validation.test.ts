import { describe, it, expect } from 'vitest';
import { validateTaskTitle } from '../src/services/tasks';
import { validateProjectName } from '../src/services/projects';

describe('Validation Rules', () => {
  it('validates task title is non-empty and trims whitespace', () => {
    expect(validateTaskTitle('Buy groceries')).toBe('Buy groceries');
    expect(validateTaskTitle('  Clean kitchen  ')).toBe('Clean kitchen');
    expect(() => validateTaskTitle('')).toThrow('Task title cannot be empty.');
    expect(() => validateTaskTitle('   ')).toThrow('Task title cannot be empty.');
  });

  it('validates project name is non-empty and trims whitespace', () => {
    expect(validateProjectName('Work')).toBe('Work');
    expect(validateProjectName('  Personal Projects  ')).toBe('Personal Projects');
    expect(() => validateProjectName('')).toThrow('Project name cannot be empty.');
    expect(() => validateProjectName('   ')).toThrow('Project name cannot be empty.');
  });
});
