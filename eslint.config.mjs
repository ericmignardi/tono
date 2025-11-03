import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  ...next,
  {
    extends: ['prettier'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
