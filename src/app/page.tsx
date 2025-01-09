"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { contractABI } from "../services/abi";
import { Contract, ContractAbi } from "web3";
import { shortenAddress } from "@/services/shortenAddress";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

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
  const [balanceBidder, setBalanceBidder] = useState<string>("");
  const [auctionEndTime, setAuctionEndTime] = useState<dayjs.Dayjs | null>(
    null
  );
  const [remainingTime, setRemainingTime] = useState<string>("");
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const balance = await web3Instance.eth.getBalance(contractAddress);
          const balanceInEth = web3Instance.utils.fromWei(balance, "ether");
          setBalanceBidder(balanceInEth);

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
    if (auctionEndTime) {
      const interval = setInterval(() => {
        const now = dayjs();
        const diff = auctionEndTime.diff(now);

        const duration = dayjs.duration(diff);
        const formattedTime = `${duration.days()} days ${duration.hours()} hours ${duration.minutes()} minutes ${duration.seconds()} seconds`;

        setRemainingTime(formattedTime);

        if (duration.asMilliseconds() <= 0) {
          clearInterval(interval);
          setRemainingTime("Auction has ended");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [auctionEndTime]);
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
        const res: BigInt = await contract.methods.auctionEndTime().call();
        const timestamp = res.toString();
        const date = dayjs(Number(timestamp) * 1000);
        setAuctionEndTime(date);
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
      <p>Balance: {balanceBidder} ETH</p>
      <p>Highest Bidder: {shortenAddress(highestBidder)}</p>
      {
        <p>
          Auction End Time:{" "}
          {auctionEndTime && auctionEndTime.format("DD/MM/YYYY HH:mm:ss")}
        </p>
      }
      <p>Remaining Time: {remainingTime}</p>
      <button className="btn btn-primary text-white" onClick={handleRefresh}>
        Refresh
      </button>
    </main>
  );
}
