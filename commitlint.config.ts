import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'chore', 'design', 'story', 'task'],
    ],
    'type-case': [2, 'always', 'lower-case'],

    'scope-enum': [1, 'always', ['storybook', 'design-system', 'services', 'utils', 'README']],
    'scope-case': [2, 'always', 'kebab-case'],
    'scope-empty': [2, 'always'],

    'subject-case': [0, 'always', []],
    'subject-empty': [2, 'never'],
  },
};

module.exports = Configuration;
