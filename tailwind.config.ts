import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/**/*.{ts,tsx}', './index.html'],
	theme: {
		extend: {
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(-10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				shake: {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-5px)' },
					'75%': { transform: 'translateX(5px)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'float-reverse': {
					'0%, 100%': { transform: 'translateY(0) scale(1)' },
					'50%': { transform: 'translateY(-20px) scale(1.05)' },
				},
			},
			animation: {
				'fade-in': 'fade-in 0.5s ease-out',
				shake: 'shake 0.5s ease-in-out',
				float: 'float 6s ease-in-out infinite',
				'float-delayed': 'float 6s ease-in-out 2s infinite',
				'float-slow': 'float 8s ease-in-out infinite',
				'float-slower': 'float 10s ease-in-out infinite',
				'float-slowest': 'float 12s ease-in-out infinite',
				'float-reverse': 'float-reverse 7s ease-in-out infinite',
				'float-delayed-reverse': 'float-reverse 9s ease-in-out 1s infinite',
				'float-slow-reverse': 'float-reverse 11s ease-in-out 2s infinite',
			},
		},
	},
	important: true,
	plugins: [],
};

export default config;
