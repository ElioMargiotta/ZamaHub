/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      colors: {
        'zama-blue': 'var(--primary)',
        'zama-white': 'var(--background)',
        'zama': {
          50: 'var(--background)',   // Very light blue
          100: 'var(--secondary)',  // Light blue
          200: 'var(--muted)',  // Lighter blue
          300: 'var(--muted)',  // Light medium blue
          400: 'var(--accent)',  // Medium blue
          500: 'var(--primary)',  // Main Zama blue
          600: 'var(--primary)',  // Darker blue
          700: 'var(--primary)',  // Dark blue
          800: 'var(--foreground)',  // Very dark blue
          900: 'var(--foreground)',  // Darkest blue
        },
        'surface': {
          50: 'var(--background)',   // Zama white
          100: 'var(--card)',  // Pure white
          200: 'var(--secondary)',  // Very light gray
          300: 'var(--muted)',  // Light gray
          400: 'var(--border)',  // Medium gray
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
}; // v4 is CSS-first; keep config minimal to avoid conflicts
export default config;
