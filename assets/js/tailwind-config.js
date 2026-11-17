/* 공통 Tailwind 설정 — 모든 페이지가 Tailwind CDN 바로 다음에 이 파일을 불러온다. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#A2AD24',
          dark: '#7C8620',
          darker: '#5E661A',
          light: '#C9D35E',
          50: '#F8F9EC',
          100: '#EEF0D2',
          200: '#DDE1A5',
        },
        forest: {
          DEFAULT: '#37452C',
          dark: '#26301C',
          darker: '#1A2212',
          light: '#57694A',
        },
        warm: { 1: '#F4C978', 2: '#EFA35C' },
        ink: '#26301C',
        inksoft: '#5C6653',
        inkfaint: '#8B9280',
        canvas: '#FBFAF3',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'brand-sm': '0 4px 16px -4px rgba(162,173,36,0.18), 0 2px 6px -2px rgba(42,43,30,0.06)',
        'brand-md': '0 12px 32px -8px rgba(162,173,36,0.22), 0 4px 12px -4px rgba(42,43,30,0.08)',
        'brand-lg': '0 24px 60px -12px rgba(162,173,36,0.28), 0 8px 24px -8px rgba(42,43,30,0.10)',
        'glass': '0 8px 32px -8px rgba(162,173,36,0.14), 0 2px 8px -2px rgba(42,43,30,0.05)',
      },
    },
  },
};
