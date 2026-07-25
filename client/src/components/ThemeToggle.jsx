import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark
          ? "Light Mode"
          : "Dark Mode"
      }
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid",
        borderColor: isDark ? "#374151" : "#D1D5DB",
        borderRadius: "50%",
        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
}