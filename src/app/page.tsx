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
  handleRefresh,
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
  }, [contract]);

  const withdraw = async () => {
    try {
    } catch (error) {}
  };

  // const handleBeneficiary = async () => {
  //   try {
  //     if (contract) {
  //       const res: string = await contract.methods.beneficiary().call();
  //       setBeneficiary(res);
  //     }
  //   } catch (error) {
  //     alert(`Error: ${error}`);
  //   }
  // };
  // const handleHighestBid = async () => {
  //   try {
  //     if (contract) {
  //       const res: string = await contract.methods.highestBid().call();
  //       const valueInEth: string = web3?.utils.fromWei(res, "ether") || "";
  //       setHighestBid(valueInEth);
  //     }
  //   } catch (error) {
  //     alert(`Error: ${error}`);
  //   }
  // };
  // const handleHighestBidder = async () => {
  //   try {
  //     if (contract) {
  //       const res: string = await contract.methods.highestBidder().call();
  //       setHighestBidder(res);
  //     }
  //   } catch (error) {
  //     alert(`Error: ${error}`);
  //   }
  // };
  // const handleAuctionEndTime = async () => {
  //   try {
  //     if (contract) {
  //       const res: BigInt = await contract.methods.auctionEndTime().call();
  //       const timestamp = res.toString();
  //       const date = dayjs(Number(timestamp) * 1000);
  //       setAuctionEndTime(date);
  //     }
  //   } catch (error) {
  //     alert(`Error: ${error}`);
  //   }
  // };
  // const handleBalanceBidder = async () => {
  //   try {
  //     const web3Instance = new Web3(window.ethereum);
  //     await window.ethereum.request({ method: "eth_requestAccounts" });
  //     const balance = await web3Instance.eth.getBalance(contractAddress);
  //     const balanceInEth = web3Instance.utils.fromWei(balance, "ether");
  //     setBalanceBidder(balanceInEth);
  //   } catch (error) {
  //     alert(`Error: ${error}`);
  //   }
  // };
  // const handleBid = async () => {
  //   try {
  //     if (contract && web3) {
  //       if (Number(bid) <= Number(highestBid)) {
  //         alert("Bid must be higher than the highest bid");
  //       }
  //       if (bid !== "" && Number(bid) > Number(highestBid)) {
  //         const bidInWei = web3.utils.toWei(bid, "ether");
  //         await contract.methods.bid().send({ from: account, value: bidInWei });
  //         handleHighestBid();
  //         handleHighestBidder();
  //         handleRefresh();
  //         setBid("");
  //         alert("Bid placed successfully");
  //       }
  //     }
  //   } catch (error) {
  //     alert(`Error: ${error}`);
  //   }
  // };
  // const handleRefresh = async () => {
  //   handleBeneficiary();
  //   handleHighestBid();
  //   handleHighestBidder();
  //   handleBalanceBidder();
  // };

  return (
    <main className="min-h-screen">
      <h1>Hello World</h1>
      <p>Account: {shortenAddress(account) || "0x0000...0000"}</p>
      <p>Beneficiary: {shortenAddress(beneficiary) || "0x0000...0000"}</p>
      <p>Highest Bid: {highestBid || "0"} ETH</p>
      <p>Balance: {balanceBidder || "0"} ETH</p>
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
                  () => handleBalanceBidder(contractAddress, setBalanceBidder)
                ),
              setBid
            )
          }
        >
          Bid
        </button>
      </section>
      <button
        className="btn btn-primary text-white mt-1"
        onClick={() =>
          handleRefresh(
            () => handleBeneficiary(contract, setBeneficiary),
            () => handleHighestBid(contract, web3, setHighestBid),
            () => handleHighestBidder(contract, setHighestBidder),
            () => handleBalanceBidder(contractAddress, setBalanceBidder)
          )
        }
      >
        Refresh
      </button>
    </main>
  );
}
