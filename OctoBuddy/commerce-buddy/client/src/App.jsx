// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InitProjectPage from "./pages/SetupPage";
import MainAppPage from "./pages/MainAppPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitProjectPage />} />
        <Route path="/main" element={<MainAppPage />} />
      </Routes>
    </Router>
  );
}

export default App;
