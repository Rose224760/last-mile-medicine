/**
 * index.js — React application entry point
 * 
 * Mounts the root <App /> component into the #root DOM element.
 * Wrapped in <StrictMode> for development warnings.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
