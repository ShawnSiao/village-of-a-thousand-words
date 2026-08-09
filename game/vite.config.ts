import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/village-of-a-thousand-words/",
  plugins: [react()],
  build: {
    target: "es2022",
    sourcemap: false
  }
});
