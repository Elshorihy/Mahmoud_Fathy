import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { emerald: { 950: "#06251D", 900: "#0B3D2E", 800: "#145440" }, gold: { 500: "#C9A961", 600: "#AE8C43" }, cream: "#F7F2E7", ink: "#12201A" },
    borderRadius: { "4xl": "2rem" },
    boxShadow: { luxury: "0 18px 55px rgba(11,61,46,.10)" }
  }},
  plugins: []
};
export default config;