import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Permite alternar via classe .dark no HTML/Body
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapeamento Semântico (O segredo da harmonia)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Cores Shineray Atualizadas
        shineray: {
          // O "Dark" agora se adapta: Fundo Escuro (Dark) ou Fundo Claro (Light)
          dark: "hsl(var(--background))", 
          // O "Surface" agora é: Cartão Escuro (Dark) ou Cartão Branco (Light)
          surface: "hsl(var(--card))",
          // O texto principal
          text: "hsl(var(--foreground))",
          // O Vermelho da marca (fixo, mas com suporte a opacidade)
          red: "hsl(var(--primary))",
          // Borda sutil
          border: "hsl(var(--border))",
        },
      },
      gridTemplateRows: {
        'dashboard': 'auto auto minmax(250px, 1fr) minmax(250px, 1fr) auto', 
      }
    },
  },
  plugins: [],
};
export default config;