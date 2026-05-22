import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  try {
    ReactDOM.createRoot(root).render(<App />);
  } catch (e) {
    root.innerHTML = '<div style="padding:32px;color:red;font-family:monospace"><h2>React Mount Error</h2><pre>' + (e instanceof Error ? e.stack : String(e)) + '</pre></div>';
  }
}
