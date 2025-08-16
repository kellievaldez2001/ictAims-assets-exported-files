// index.js - Frontend Entry Point
// This file is the entry point for the React frontend. 
// It renders the App component into the root DOM element and sets up any global providers or configuration.
//
// Key responsibilities:
// - Render the App component
// - Set up React Router and any global providers
// - Bootstrap the frontend application
// - No direct data flow; all logic is in App.js and child components

import React from 'react';                    //Core React library used to create UI components.
import { createRoot } from 'react-dom/client';//A new API from React 18+ that replaces the old ReactDOM.render() for better performance.
import App from './App';                      //Your main React component (likely in App.js) that contains the entire frontend structure of your system.

// Utility to get the current system date (YYYY-MM-DD)
export function getCurrentDateISO() { 
  const now = new Date(); 
  return now.toISOString().slice(0, 10); 
}

const container = document.getElementById('root'); // Finds the <div id="root"> in your index.html.
const root = createRoot(container);                //Prepares the root rendering context.

// Render the App component into the root element
root.render(<App />);                              // Renders the entire React application (starting from App.js) inside that root div.


// Notes: This file is the root of the frontend and depends on App.js.
// It is loaded by Electron's browser window.

/**Why use createRoot()?
React 18 introduced it to support new features like automatic batching, transitions, and concurrent rendering.*/