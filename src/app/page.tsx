"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { contractABI } from "../services/abi";
import { Contract, ContractAbi } from "web3";
import { shortenAddress } from "@/services/shortenAddress";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  handleAuctionEndTime,
  handleBalanceBidder,
  handleBeneficiary,
  handleBid,
  handleHighestBid,
  handleHighestBidder,
  handlePendingReturns,
  handleRefresh,
  handleWithdraw,
} from "@/services/handleContract";
import { contractABI2 } from "@/services/abi2";

dayjs.extend(duration);

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractAddressFactory = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

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
  const [bid, setBid] = useState<string>("");
  const [myPendingReturns, setMyPendingReturns] = useState<string>("");
  // Contract Factory
  const [contractFactory, setContractFactory] =
    useState<Contract<ContractAbi> | null>(null);
  const [allAuction, setAllAuction] = useState<string[]>([]);
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
          const contractFactoryInstance = new web3Instance.eth.Contract(
            contractABI2,
            contractAddressFactory
          );
          setContractFactory(contractFactoryInstance);
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
    handleBeneficiary(contract, setBeneficiary);
    handleHighestBid(contract, web3, setHighestBid);
    handleHighestBidder(contract, setHighestBidder);
    handleAuctionEndTime(contract, setAuctionEndTime);
    handleBalanceBidder(contractAddress, setBalanceBidder);
    handlePendingReturns(contract, web3, account, setMyPendingReturns);
  }, [contract]);

  const handleGetAuction = async () => {
    try {
      if (contractFactory) {
        const res: string[] = await contractFactory.methods
          .getAuctions()
          .call();
        setAllAuction(res);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };
  const handleCreateAuction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (contractFactory && web3) {
        const biddingTime = Number(e.currentTarget.time.value);
        if (isNaN(biddingTime) || biddingTime <= 0) {
          alert("Please enter a valid bidding time in seconds.");
          return;
        }
        const res = await contractFactory.methods
          .createAuction(biddingTime)
          .send({ from: account });
        alert("Auction created successfully");
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };
  const handleGetSingleAuction = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      if (contractFactory) {
        const id = Number(e.currentTarget.idAuction.value);
        if (isNaN(id) || id < 0) {
          alert("Please enter a valid auction ID.");
          return;
        }
        const res = await contractFactory.methods.auctions(id).call();
        console.log(res);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <main className="min-h-screen">
      <h1>Hello World</h1>
      <p>Account: {shortenAddress(account) || "0x0000...0000"}</p>
      <p>Beneficiary: {shortenAddress(beneficiary) || "0x0000...0000"}</p>
      <p>Highest Bid: {highestBid || "0"} ETH</p>
      <p>Balance: {balanceBidder || "0"} ETH</p>
      <p>Pending Returns: {myPendingReturns || "0"} ETH</p>
      <p>Highest Bidder: {shortenAddress(highestBidder) || "0x0000...0000"}</p>
      {
        <p>
          Auction End Time:{" "}
          {(auctionEndTime && auctionEndTime.format("DD/MM/YYYY HH:mm:ss")) ||
            "00/00/0000 00:00:00"}
        </p>
      }
      <p>
        Remaining Time: {remainingTime || "0 days 0 hours 0 minutes 0 seconds"}
      </p>
      <section className="flex gap-1">
        <input
          type="text"
          placeholder="0.1 ETH"
          className="input bg-white input-bordered"
          value={bid}
          onChange={(e) => setBid(e.target.value)}
        />
        <button
          className="btn btn-primary text-white"
          onClick={() =>
            handleBid(
              contract,
              web3,
              account,
              highestBid,
              bid,
              () => handleHighestBid(contract, web3, setHighestBid),
              () => handleHighestBidder(contract, setHighestBidder),
              () =>
                handleRefresh(
                  () => handleBeneficiary(contract, setBeneficiary),
                  () => handleHighestBid(contract, web3, setHighestBid),
                  () => handleHighestBidder(contract, setHighestBidder),
                  () => handleBalanceBidder(contractAddress, setBalanceBidder),
                  () =>
                    handlePendingReturns(
                      contract,
                      web3,
                      account,
                      setMyPendingReturns
                    )
                ),
              setBid
            )
          }
        >
          Bid
        </button>
      </section>
      <button
        className="btn btn-error text-white"
        onClick={() => handleWithdraw(myPendingReturns, contract, account)}
      >
        Withdraw
      </button>
      <button
        className="btn btn-primary text-white mt-1"
        onClick={() =>
          handleRefresh(
            () => handleBeneficiary(contract, setBeneficiary),
            () => handleHighestBid(contract, web3, setHighestBid),
            () => handleHighestBidder(contract, setHighestBidder),
            () => handleBalanceBidder(contractAddress, setBalanceBidder),
            () =>
              handlePendingReturns(contract, web3, account, setMyPendingReturns)
          )
        }
      >
        Refresh
      </button>
      <br />
      <br />
      <h1>Contract Factory</h1>
      <ul>
        {allAuction.length > 0 &&
          allAuction.map((auction, index) => <li key={index}>{auction}</li>)}
        {allAuction.length === 0 && <li>No Auctions</li>}
      </ul>
      <button className="btn btn-primary text-white" onClick={handleGetAuction}>
        Get Auction
      </button>
      <form onSubmit={handleCreateAuction}>
        <input
          type="text"
          placeholder="Time"
          name="time"
          className="input input-bordered bg-white"
        />
        <button className="btn btn-primary text-white" type="submit">
          Create Auction
        </button>
      </form>
      {/* get single auction */}
      <form onSubmit={handleGetSingleAuction}>
        <input
          type="text"
          placeholder="Auction ID"
          name="idAuction"
          className="input input-bordered bg-white"
        />
        <button className="btn btn-primary text-white" type="submit">
          Get Auction
        </button>
      </form>
    </main>
  );
}
