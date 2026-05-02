module.exports = {
  content: ["./index.html", "./src/**/*.{svelte,ts,js}"],
  theme: {
    extend: {
      // Colors are sourced from src/styles/tokens.css via CSS variables so
      // Tailwind utilities and component-CSS always agree on the palette.
      // To add or change a brand color: update tokens.css, then add the
      // alias here. NEVER put hex literals in this file.
      colors: {
        teal:           'var(--opteryx-teal)',
        orange:         'var(--opteryx-orange)',
        'orange-light': 'var(--opteryx-orange-light)',
        navy:           'var(--opteryx-navy)',
        red:            'var(--opteryx-red)',
        gold:           'var(--opteryx-gold)',
        slate:          'var(--opteryx-slate)'
      },
      fontFamily: {
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body:    ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};
