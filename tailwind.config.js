/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#627EEA',
                secondary: '#10141F',
                accent: '#00F0FF',
                dark: '#0B0E19',
                success: '#4CAF50',
                warning: '#FFC107',
                danger: '#F44336',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
        }
    },
    plugins: [],
}
