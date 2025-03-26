// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Obedy from "./pages/Obedy";
import Home from "./pages/Home";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";

function App() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/obedy" element={<Obedy />} />
            </Routes>
          </main>
        </div>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
