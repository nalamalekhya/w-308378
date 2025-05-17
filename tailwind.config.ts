
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				'background-secondary': 'hsl(var(--background-secondary))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				"color-1": "hsl(var(--color-1))",
				"color-2": "hsl(var(--color-2))",
				"color-3": "hsl(var(--color-3))",
				"color-4": "hsl(var(--color-4))",
				"color-5": "hsl(var(--color-5))",
				'echo-primary': '#D4A5A5',  
				'echo-secondary': '#B38B8B', 
				'echo-accent': '#E8D2D2',   
				'echo-present': '#D4A5A5',
				'echo-gradient-start': '#D4A5A5',
				'echo-gradient-end': '#B38B8B',
				'echo-dark-primary': '#8B6363', 
				'echo-dark-secondary': '#705252',
				'echo-dark-accent': '#967A7A',
				echo: {
					"past": "#8B6363",
					"present": "#D4A5A5",
					"future": "#B38B8B",
					"accent": "#E8D2D2",
					"light": "#FDF0F0",
					"dark": "#4C3232",
				},
				'steel-primary': '#4F7990',  
				'steel-secondary': '#6B90A6',
				'steel-accent': '#8EA3B5',
				'steel-dark-primary': '#395B6C',
				'steel-dark-secondary': '#456C80',
				'steel-dark-accent': '#527A91',
				steel: {
					"primary": "#4F7990",
					"secondary": "#6B90A6",
					"accent": "#8EA3B5",
					"dark": "#395B6C",
					"light": "#E8F2F5",
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				blink: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' },
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'wave': {
					'0%': { transform: 'scaleY(1)' },
					'50%': { transform: 'scaleY(0.5)' },
					'100%': { transform: 'scaleY(1)' },
				},
				"gradient-border": {
					"0%, 100%": { borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%" },
					"25%": { borderRadius: "47% 29% 39% 49% / 61% 19% 66% 26%" },
					"50%": { borderRadius: "57% 23% 47% 72% / 63% 17% 66% 33%" },
					"75%": { borderRadius: "28% 49% 29% 100% / 93% 20% 64% 25%" },
				},
				"gradient-1": {
					"0%, 100%": { top: "0", right: "0" },
					"50%": { top: "50%", right: "25%" },
					"75%": { top: "25%", right: "50%" },
				},
				"gradient-2": {
					"0%, 100%": { top: "0", left: "0" },
					"60%": { top: "75%", left: "25%" },
					"85%": { top: "50%", left: "50%" },
				},
				"gradient-3": {
					"0%, 100%": { bottom: "0", left: "0" },
					"40%": { bottom: "50%", left: "25%" },
					"65%": { bottom: "25%", left: "50%" },
				},
				"gradient-4": {
					"0%, 100%": { bottom: "0", right: "0" },
					"50%": { bottom: "25%", right: "40%" },
					"90%": { bottom: "50%", right: "25%" },
				}
			},
			animation: {
				fadeIn: 'fadeIn 0.5s ease-out forwards',
				blink: 'blink 0.8s infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
				'wave-1': 'wave 1.2s ease-in-out infinite',
				'wave-2': 'wave 1.8s ease-in-out infinite',
				'wave-3': 'wave 1.5s ease-in-out infinite',
				'gradient-border': 'gradient-border 6s ease-in-out infinite',
				'gradient-1': 'gradient-1 12s ease-in-out infinite alternate',
				'gradient-2': 'gradient-2 12s ease-in-out infinite alternate',
				'gradient-3': 'gradient-3 12s ease-in-out infinite alternate',
				'gradient-4': 'gradient-4 12s ease-in-out infinite alternate',
			},
			backgroundImage: {
				'gradient-echo': 'linear-gradient(135deg, #3B2F63 0%, #6A4E9C 35%, #4BACBD 100%)',
				'gradient-echo-light': 'linear-gradient(135deg, #E5DEFF 0%, #D3E4FD 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
