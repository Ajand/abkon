import Header from "./components/Header";
import { Routes, Route, Link } from "react-router-dom";

import Boilerplate from "./Boilerplate";

import ABKoin from "./pages/ABKoin";
import NFTS from "./pages/NFTS";
import Auction from "./pages/Auction";
import Specialist from "./pages/Specialist";

const Router = () => {
  return (
    <div>
      <Header />
      <div>
        <Routes>
          <Route path="/" element={<Auction />} />
          <Route path="panel" element={<Specialist />} />
          <Route path="abkoin" element={<ABKoin />} />
          <Route path="nfts" element={<NFTS />} />
        </Routes>
      </div>
    </div>
  );
};

export default Router;
