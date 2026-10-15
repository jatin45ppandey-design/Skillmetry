import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1020",
        panel: "#121D32",
        accent: "#22D3EE",
        success: "#10B981"
      }
    }
  },
  plugins: []
} satisfies Config;
