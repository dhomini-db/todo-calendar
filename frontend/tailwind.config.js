/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Surfaces (elevation model)
        bg:       '#0d0d0d',
        surface:  '#111111',
        elevated: '#171717',
        raised:   '#1e1e1e',
        lift:     '#252525',
        // Borders
        line:     'rgba(255,255,255,0.06)',
        'line-md':'rgba(255,255,255,0.10)',
        // Text
        hi:       '#f0f0f0',
        mid:      '#888888',
        lo:       '#4a4a4a',
        // Accent
        accent:   '#3b82f6',
        'accent-soft': 'rgba(59,130,246,0.10)',
        // Status
        green:    '#4ade80',
        teal:     '#34d399',
        yellow:   '#fbbf24',
        red:      '#f87171',
      },
      borderRadius: {
        sm:  '4px',
        DEFAULT: '8px',
        md:  '10px',
        lg:  '14px',
        xl:  '18px',
        '2xl': '24px',
      },
      boxShadow: {
        sm:   '0 1px 3px rgba(0,0,0,0.35)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.40)',
        md:   '0 4px 16px rgba(0,0,0,0.45)',
        lg:   '0 8px 32px rgba(0,0,0,0.55)',
        inner:'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      transitionDuration: {
        fast: '120ms',
        DEFAULT: '180ms',
        slow: '280ms',
      },
    },
  },
  plugins: [],
}
