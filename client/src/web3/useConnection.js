import { useState, useEffect } from "react";

const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");

  const RPC_URL = "http://localhost:8545";

  const connect = async () => {
    const desiredChain = "0x539"; //"0x4";
    console.log(window.ethereum);
    if (typeof window.ethereum === "undefined") {
      throw new Error("Metamask does not exists");
    }
    const ethereum = window.ethereum;
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);

    setIsConnected(true);

    //await window.ethereum.request({
    //  method: "wallet_switchEthereumChain",
    //  params: [{ chainId: desiredChain }], // chainId must be in hexadecimal numbers
    //});
  };

  return {
    isConnected,
    connect,
    RPC_URL,
    account,
  };
};

export default useConnection;
