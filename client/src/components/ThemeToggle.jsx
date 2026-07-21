import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed top-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-panel-raised)",
        color: "var(--text-primary)",
      }}
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}