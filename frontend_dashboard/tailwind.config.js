/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // SoyUCAB Brand Colors
                'ucab-blue': '#40b4e5',
                'ucab-green': '#047732',
                'ucab-gold': '#ffc526',
                'ucab-dark': '#12100c',
            },
        },
    },
    plugins: [],
}
