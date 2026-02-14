import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountNode = document.getElementById('root');

if (mountNode) {
    const root = ReactDOM.createRoot(mountNode);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Critical: 'root' element not found in DOM.");
}