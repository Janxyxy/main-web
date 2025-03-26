// App.jsx - Keep min-h-screen here only
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Obedy from "./pages/Obedy";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/obedy" element={<Obedy />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
