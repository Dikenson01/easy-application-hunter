
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Added a console log to verify our changes are being applied
console.log("Application starting...");

createRoot(document.getElementById("root")!).render(<App />);
