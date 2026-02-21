/**
 * Project Test Fixtures
 */

export const validProject = {
  name: 'Test Project Alpha',
};

export const validProjectMaxLength = {
  name: 'A'.repeat(100), // Max 100 characters
};

export const invalidProjectEmpty = {
  name: '',
};

export const invalidProjectWhitespace = {
  name: '   ',
};

export const invalidProjectTooLong = {
  name: 'A'.repeat(101), // Exceeds 100 characters
};

export const projectWithWhitespacePadding = {
  name: '  My Project  ',
};

