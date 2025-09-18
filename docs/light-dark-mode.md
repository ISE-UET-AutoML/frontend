## Light/Dark Mode Toggle (Tailwind + React)

This guide adds a performant, app-wide light/dark mode toggle that works with Tailwind's class strategy and persists the user's choice.

### 1) Enable class-based dark mode in Tailwind

Edit `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class',
  // ...existing config
};
```

### 2) Add a ThemeProvider (state + persistence)

Create `src/theme/ThemeProvider.jsx`:

```jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const getSystemPref = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || getSystemPref());

  useEffect(() => {
    const root = document.documentElement; // <html>
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Respect system changes only when the user hasn't set a preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!localStorage.getItem('theme')) {
        setTheme(getSystemPref());
      }
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

### 3) Wrap the app with ThemeProvider

Edit `src/index.js` and wrap `<App />`:

```jsx
import ThemeProvider from 'src/theme/ThemeProvider';

root.render(
  <MultiProvider providers={[
    <LibraryProvider key="lsf" libraries={libraries} />,
    <AuthProvider />,
  ]}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </MultiProvider>
);
```

### 4) Add a toggle button (example in NavBar)

Edit `src/components/NavBar.jsx`:

```jsx
import { useTheme } from 'src/theme/ThemeProvider';

const { theme, toggle } = useTheme();

<button
  onClick={toggle}
  className="ml-3 rounded-lg px-3 py-2 text-sm transition
             bg-gray-200 text-gray-900 hover:bg-gray-300
             dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
  style={{ fontFamily: 'Poppins, sans-serif' }}
>
  {theme === 'dark' ? 'Light' : 'Dark'}
  {/* Or an icon */}
</button>
```

### 5) Prefer Tailwind dark: variants for most UI

- Background/text:
  - `bg-white text-gray-900 dark:bg-[#0F2027] dark:text-white`
- Borders:
  - `border-gray-300 dark:border-white/10`
- Effects:
  - `hover:bg-gray-100 dark:hover:bg-gray-800`

This keeps components simple and avoids conditional JS.

### 6) For complex gradients, use CSS variables once

Add variables in your global CSS (e.g., `src/assets/css/index.css`):

```css
:root {
  --surface: #ffffff;
  --text: #0f172a;
  --card-gradient: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  --tag-gradient: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  --border: rgba(15, 23, 42, 0.15);
}
.dark :root {
  --surface: #0b0b11;
  --text: #ffffff;
  --card-gradient: linear-gradient(135deg, #0b0b11 0%, #141821 100%);
  --tag-gradient: linear-gradient(135deg, #141821 0%, #0e1220 100%);
  --border: rgba(148, 163, 184, 0.25);
}
```

Use them in components:

```jsx
<div
  className="rounded-2xl p-6 text-[var(--text)]"
  style={{ background: 'var(--card-gradient)', border: '1px solid var(--border)' }}
>
  <span
    className="px-3 py-1 rounded-full"
    style={{ background: 'var(--tag-gradient)', border: '1px solid var(--border)' }}
  >
    Tag
  </span>
</div>
```

Advantages:
- Define light/dark once; components don’t duplicate logic.
- Works great for your dataset/task gradients without rewriting each component.

### 7) Performance

- Theme changes only toggle a `dark` class on `<html>`.
- Tailwind `dark:` styles are computed by the browser; minimal JS.
- Only the toggle button text/icon re-renders.

### 8) Rollout tips for this codebase

1. Convert global surfaces first (`body`, layout containers) to Tailwind `dark:` or CSS variables.
2. Update core UI components (`NavBar.jsx`, `ProjectSidebar.jsx`, `DatasetCard.jsx`) to rely on variables for backgrounds/borders.
3. Replace hard-coded hex colors with Tailwind utilities or variables.
4. Test in both modes; validate contrast ratios for readability.

### 9) Adding New Components with Theme Support

When adding new components that need to support both light and dark themes while preserving existing dark mode styling:

#### Step 1: Add CSS Variables

Add theme-specific variables to `src/assets/css/index.css`:

```css
:root {
  /* Light mode variables */
  --component-bg: #ffffff;
  --component-text: #1f2937;
  --component-border: rgba(31, 41, 55, 0.2);
  --component-hover: rgba(59, 130, 246, 0.1);
}

.dark {
  /* Dark mode variables - preserve original styling */
  --component-bg: rgba(15, 32, 39, 0.8);
  --component-text: #ffffff;
  --component-border: rgba(255, 255, 255, 0.2);
  --component-hover: rgba(255, 255, 255, 0.1);
}
```

#### Step 2: Create Theme-Aware Styles

Replace hardcoded styles with CSS variables:

```jsx
// Before (dark mode only)
const darkStyles = `
.my-component {
    background: rgba(15, 32, 39, 0.8) !important;
    color: white !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
}
`

// After (theme-aware)
const themeStyles = `
.my-component {
    background: var(--component-bg) !important;
    color: var(--component-text) !important;
    border: 1px solid var(--component-border) !important;
}
`
```

#### Step 3: Update Component Implementation

Replace class names and inline styles:

```jsx
// Before
<div className="bg-gray-800 text-white border-white/20">
  <span className="text-gray-300">Label</span>
</div>

// After
<div style={{ 
  background: 'var(--component-bg)',
  color: 'var(--component-text)',
  border: '1px solid var(--component-border)'
}}>
  <span style={{ color: 'var(--secondary-text)' }}>Label</span>
</div>
```

#### Step 4: Common Variable Patterns

Use these established variables for consistency:

```css
/* Core colors */
--text: Main text color (dark gray in light, white in dark)
--secondary-text: Secondary text (medium gray in light, light gray in dark)
--accent-text: Accent color (blue in both themes)

/* Backgrounds */
--surface: Main background (white in light, dark in dark)
--card-gradient: Card backgrounds
--hover-bg: Hover states
--active-bg: Active states

/* Interactive elements */
--border: Main borders
--border-hover: Hover borders
--button-gradient: Button backgrounds
--button-gradient-dark: Special dark theme buttons

/* Form elements */
--filter-input-bg: Input backgrounds
--filter-input-border: Input borders
--filter-input-hover: Input hover states
--filter-input-focus: Input focus states
```

#### Step 5: Best Practices

1. **Always test both themes** - Toggle between light/dark to verify appearance
2. **Preserve dark mode exactly** - Don't change existing dark styling
3. **Use semantic variable names** - `--button-bg` not `--blue-color`
4. **Group related variables** - Keep form elements together
5. **Document new variables** - Add comments explaining usage

### 10) Example: Theme-Aware Filter Component

Complete example of converting a component:

```jsx
// Theme-aware styles
const themeStyles = `
.theme-filter {
    background: var(--filter-bg) !important;
    border: 1px solid var(--filter-border) !important;
    color: var(--text) !important;
}

.theme-filter:hover {
    border-color: var(--filter-input-hover) !important;
}
`

// Component implementation
export default function MyFilter() {
    return (
        <>
            <style>{themeStyles}</style>
            <div className="theme-filter">
                <span style={{ color: 'var(--secondary-text)' }}>
                    Filter Label
                </span>
                <input 
                    className="theme-input"
                    style={{
                        background: 'var(--filter-input-bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--filter-input-border)'
                    }}
                />
            </div>
        </>
    )
}
```

### 11) Optional: default to system theme

If you want the app to follow system by default and ignore stored preference, remove `localStorage.getItem('theme')` usage and always call `setTheme(getSystemPref())` on mount; keep the toggle to explicitly override and store.


