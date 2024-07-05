import React from 'react';
import ReactDOM from 'react-dom/client';
import 'src/assets/css/index.css';
import { AuthProvider } from 'src/hooks/useAuth';
import { Router } from 'src/routes';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <Router />
        </AuthProvider>
    </React.StrictMode>
);
