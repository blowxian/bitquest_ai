import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        customGray: '#7C7C7C',
        customWhite: '#EFF1ED',
        customOrange: '#FA9F42',
        customBlue: '#5941A9',
        customBlack: '#222222',
        // 可以在这里添加更多自定义颜色
      },
    },
  },
  plugins: [],
}
export default config
