import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Search from "./pages/Search";
import Reader from "./pages/Reader";
import BookDetails from "./pages/BookDetails";
import BottomNav from "./components/BottomNav";

export default function App() {
  const location = useLocation();
  const isReader = location.pathname.startsWith("/reader/");

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/search" element={<Search />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/reader/:id" element={<Reader />} />
      </Routes>
      {!isReader && <BottomNav />}
    </>
  );
}
