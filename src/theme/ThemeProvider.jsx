import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} })
export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }) {
    const getSystemPref = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || getSystemPref())

    useEffect(() => {
        const root = document.documentElement
        // Ensure only one of the classes is present
        root.classList.remove('dark')
        root.classList.remove('light')
        if (theme === 'dark') root.classList.add('dark')
        else root.classList.add('light')
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => {
            if (!localStorage.getItem('theme')) setTheme(getSystemPref())
        }
        mq.addEventListener?.('change', onChange)
        return () => mq.removeEventListener?.('change', onChange)
    }, [])

    const value = useMemo(() => ({ theme, setTheme, toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) }), [theme])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}


