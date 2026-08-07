import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const sellerOnly = ['**/pages/seller/**', '**/components/seller/**']
const storefrontOnly = [
  '**/features/catalog/**',
  '**/features/cart/**',
  '**/features/favorites/**',
  '**/data/catalog',
  '**/pages/home/**',
  '**/pages/product/**',
  '**/pages/category/**',
  '**/pages/shop/**',
  '**/pages/search/**',
]

const boundary = (patterns, message) => ({
  'no-restricted-imports': ['error', { patterns: patterns.map((group) => ({ group: [group], message })) }],
})

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // The storefront and the seller dashboard stay independent so they can be
  // split into separate apps later. Share code through components/ui, lib,
  // hooks or store instead of importing across the boundary.
  {
    files: ['src/pages/seller/**/*.{ts,tsx}', 'src/components/seller/**/*.{ts,tsx}'],
    rules: boundary(
      storefrontOnly,
      'Seller code must not import storefront code. Move anything shared into components/ui, lib, hooks or store.',
    ),
  },
  {
    files: [
      'src/pages/{home,product,category,shop,search,videos}/**/*.{ts,tsx}',
      'src/features/**/*.{ts,tsx}',
      'src/components/layout/**/*.{ts,tsx}',
    ],
    rules: boundary(
      sellerOnly,
      'Storefront code must not import seller code. Move anything shared into components/ui, lib, hooks or store.',
    ),
  },
)
