module.exports = {
  purge: ['./src/**/*.{ts,tsx}'],
  mode: 'jit',
  darkMode: false,
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            code: {
              backgroundColor: '#e4e4e4',
              padding: '3px',
              borderRadius: '3px',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
