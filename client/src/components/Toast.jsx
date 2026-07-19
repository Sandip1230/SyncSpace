import { useEffect } from "react";
import "./Toast.css";

function Toast({ message, tone = "error", onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast toast--${tone}`} role="alert">
      {message}
    </div>
  );
}

export default Toast;