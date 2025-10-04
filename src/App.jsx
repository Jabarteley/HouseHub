import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GoogleMapsProvider } from "./contexts/GoogleMapsContext";
import Routes from "./Routes";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoogleMapsProvider>
          <Routes />
        </GoogleMapsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
