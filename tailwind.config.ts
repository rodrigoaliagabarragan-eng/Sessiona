import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f7f7",
          100: "#e8eded",
          200: "#ced9d7",
          300: "#afc0bc",
          400: "#6f8680",
          500: "#48615a",
          600: "#344c46",
          700: "#253833",
          800: "#1c2b28",
          900: "#15201d"
        },
        sand: "#f4efe7",
        mist: "#dbe7e2",
        accent: "#96b8ab",
        rose: "#d8b6aa"
      },
      boxShadow: {
        soft: "0 18px 40px rgba(21, 32, 29, 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        serif: ["var(--font-newsreader)"]
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(150, 184, 171, 0.3), transparent 40%), linear-gradient(135deg, rgba(244, 239, 231, 0.95), rgba(219, 231, 226, 0.8))"
      }
    }
  },
  plugins: []
};

export default config;
