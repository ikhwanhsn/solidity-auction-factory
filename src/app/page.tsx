"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { contractABI } from "../services/abi";
import { Contract, ContractAbi } from "web3";
import { shortenAddress } from "@/services/shortenAddress";

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<Contract<ContractAbi> | null>(null);
  const [beneficiary, setBeneficiary] = useState<string>("");
  const [highestBid, setHighestBid] = useState<string>("");
  const [highestBidder, setHighestBidder] = useState<string>("");
  const [auctionEndTime, setAuctionEndTime] = useState<Date | null>(null);
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const contractInstance = new web3Instance.eth.Contract(
            contractABI,
            contractAddress
          );
          setWeb3(web3Instance);
          setContract(contractInstance);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        alert(`Error: ${error}`);
      }
    };

    initWeb3();
  }, []);
  useEffect(() => {
    handleBeneficiary();
    handleHighestBid();
    handleHighestBidder();
    handleAuctionEndTime();
  }, [contract]);

  const handleBeneficiary = async () => {
    try {
      if (contract) {
        const res: string = await contract.methods.beneficiary().call();
        setBeneficiary(res);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };
  const handleHighestBid = async () => {
    try {
      if (contract) {
        const res: string = await contract.methods.highestBid().call();
        const valueInEth: string = web3?.utils.fromWei(res, "ether") || "";
        setHighestBid(valueInEth);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };
  const handleHighestBidder = async () => {
    try {
      if (contract) {
        const res: string = await contract.methods.highestBidder().call();
        setHighestBidder(res);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };
  const handleAuctionEndTime = async () => {
    try {
      if (contract) {
        const res: number = await contract.methods.auctionEndTime().call();
        // const date: Date = new Date(res * 1000);
        // setAuctionEndTime(date);
        // const readableDate = date.toLocaleString("en-US", { timeZone: "UTC" });
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };
  const handleRefresh = async () => {
    handleBeneficiary();
    handleHighestBid();
    handleHighestBidder();
  };

  return (
    <main className="min-h-screen">
      <h1>Hello World</h1>
      <p>Account: {shortenAddress(account)}</p>
      <p>Beneficiary: {shortenAddress(beneficiary)}</p>
      <p>Highest Bid: {highestBid} ETH</p>
      <p>Highest Bidder: {shortenAddress(highestBidder)}</p>
      {/* <p>
        Auction End Time: {auctionEndTime && auctionEndTime.toLocaleString()}
      </p> */}
      <button className="btn btn-primary text-white" onClick={handleRefresh}>
        Refresh
      </button>
    </main>
  );
}
