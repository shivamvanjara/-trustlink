import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

console.log("1. Main.jsx has started!");

const rootElement = document.getElementById('root');
console.log("2. Root element found:", rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log("3. Render command sent!");
} else {
  console.error("ERROR: Could not find the 'root' div!");
}