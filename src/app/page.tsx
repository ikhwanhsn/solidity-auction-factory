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
  const [bid, setBid] = useState<string>("");
  const [myPendingReturns, setMyPendingReturns] = useState<string>("");
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
    </main>
  );
}
