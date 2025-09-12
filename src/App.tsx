import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AppRoutes } from './AppRoutes'; // Import the new AppRoutes component

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes /> {/* Render AppRoutes here */}
      </BrowserRouter>
    </AppProvider>
  );
}




export default App;
