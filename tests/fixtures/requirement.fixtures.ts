/**
 * Requirement Test Fixtures
 */

export const validRequirement = {
  description: 'User authentication module',
  effort: 5.5,
};

export const validRequirementMinEffort = {
  description: 'Minimal task',
  effort: 0.01,
};

export const validRequirementMaxEffort = {
  description: 'Large task',
  effort: 9999,
};

export const validRequirementWholeNumber = {
  description: 'Whole number effort',
  effort: 10,
};

export const invalidRequirementEmptyDescription = {
  description: '',
  effort: 5,
};

export const invalidRequirementWhitespaceDescription = {
  description: '   ',
  effort: 5,
};

export const invalidRequirementLongDescription = {
  description: 'A'.repeat(501),
  effort: 5,
};

export const invalidRequirementZeroEffort = {
  description: 'Valid description',
  effort: 0,
};

export const invalidRequirementNegativeEffort = {
  description: 'Valid description',
  effort: -1,
};

export const invalidRequirementExceedsMaxEffort = {
  description: 'Valid description',
  effort: 10000,
};

export const invalidRequirementTooManyDecimals = {
  description: 'Valid description',
  effort: 5.555,
};

export const sampleRequirements = [
  { description: 'User Authentication', effort: 8.5, isActive: true },
  { description: 'Database Setup', effort: 5.0, isActive: true },
  { description: 'API Development', effort: 13.0, isActive: true },
  { description: 'UI Components', effort: 21.0, isActive: false },
  { description: 'Testing', effort: 8.0, isActive: true },
];

