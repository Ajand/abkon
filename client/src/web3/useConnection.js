import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useConnection = () => {
  const selectedAddress = window?.ethereum?.selectedAddress;
  const [isConnected, setIsConnected] = useState(
    selectedAddress ? selectedAddress : false
  );
  const [account, setAccount] = useState(
    selectedAddress ? selectedAddress : ""
  );

  const RPC_URL = "http://localhost:8545";

  const connect = async () => {
    const desiredChain = "0x539"; //"0x4";
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

  const provider = account
    ? new ethers.providers.Web3Provider(window.ethereum)
    : new ethers.providers.JsonRpcProvider(RPC_URL);

  const signer = provider.getSigner();

  return {
    isConnected,
    connect,
    RPC_URL,
    account,
    provider,
    signer,
  };
};

export default useConnection;
