import Header from "./components/Header";
import { Routes, Route, Link } from "react-router-dom";

import Boilerplate from "./Boilerplate";

import ABKoin from "./pages/ABKoin";
import NFTS from "./pages/NFTS";
import Auction from "./pages/Auction";
import Specialist from "./pages/Specialist";

import useConnection from "./web3/useConnection";

const Router = () => {
  const connection = useConnection();

  return (
    <div>
      <Header connection={connection} />
      <div>
        <Routes>
          <Route path="/" element={<Auction connection={connection} />} />
          <Route
            path="panel"
            element={<Specialist connection={connection} />}
          />
          <Route path="abkoin" element={<ABKoin connection={connection} />} />
          <Route path="nfts" element={<NFTS connection={connection} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Router;
