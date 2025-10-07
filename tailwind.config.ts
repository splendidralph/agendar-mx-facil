
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
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
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
				},
			bookeasy: {
				// Mint/Teal range (for "book")
				mint: {
					50: '#F0FDFB',
					100: '#CCFBF1',
					200: '#99F6E4',
					300: '#5EDDC7',
					400: '#4DB8A8',
					500: '#3D9B8F',
					600: '#2D6A60',
					700: '#1E4D47',
				},
				// Orange/Yellow range (for "easy")
				orange: {
					50: '#FFF7ED',
					100: '#FFEDD5',
					200: '#FED7AA',
					300: '#FDB462',
					400: '#FFB84D',
					500: '#F59E0B',
					600: '#D97706',
				},
				// Backgrounds
				bg: {
					light: '#6DD5C3',
					medium: '#5BC5B3',
					dark: '#3D9B8F',
				}
			},
				trust: {
					blue: '#1D84B5',
					teal: '#00A591',
					mint: '#F3F8F7',
					cream: '#EAFBF7',
					coral: '#FF6B4A',
					orange: '#FF835C',
					charcoal: '#2D2D2D',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
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
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-4px)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
			'glow': {
				'0%, 100%': {
					boxShadow: '0 0 20px hsl(var(--primary) / 0.5)'
				},
				'50%': {
					boxShadow: '0 0 40px hsl(var(--primary) / 0.8)'
				}
			},
			'marquee': {
				'0%': {
					transform: 'translateX(0%)'
				},
				'100%': {
					transform: 'translateX(-100%)'
				}
			},
			'marquee-reverse': {
				'0%': {
					transform: 'translateX(-100%)'
				},
				'100%': {
					transform: 'translateX(0%)'
				}
			},
			'shimmer': {
				'0%': {
					backgroundPosition: '-200% 0'
				},
				'100%': {
					backgroundPosition: '200% 0'
				}
			}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'marquee': 'marquee 20s linear infinite',
				'marquee-fast': 'marquee 15s linear infinite',
				'marquee-reverse': 'marquee-reverse 20s linear infinite',
				'shimmer': 'shimmer 3s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
