import React from 'react';
import { createRoot } from 'react-dom/client';
import RegisterPage from './RegisterPage.jsx';

const root = document.getElementById('register-root');
if (root) {
    createRoot(root).render(<RegisterPage />);
}
