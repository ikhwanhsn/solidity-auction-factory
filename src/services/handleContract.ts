import Web3 from "web3";
import { Contract, ContractAbi } from "web3";
import dayjs from "dayjs";

// handleBeneficiary
const handleBeneficiary = async (
  contract: Contract<ContractAbi> | null,
  setBeneficiary: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
    if (contract) {
      const res: string = await contract.methods.beneficiary().call();
      setBeneficiary(res);
    }
  } catch (error) {
    alert(`Error: ${error}`);
  }
};

// handleHighestBid
const handleHighestBid = async (
  contract: Contract<ContractAbi> | null,
  web3: Web3 | null,
  setHighestBid: React.Dispatch<React.SetStateAction<string>>
) => {
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

// handleHighestBidder
const handleHighestBidder = async (
  contract: Contract<ContractAbi> | null,
  setHighestBidder: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
    if (contract) {
      const res: string = await contract.methods.highestBidder().call();
      setHighestBidder(res);
    }
  } catch (error) {
    alert(`Error: ${error}`);
  }
};

// handleAuctionEndTime
const handleAuctionEndTime = async (
  contract: Contract<ContractAbi> | null,
  setAuctionEndTime: React.Dispatch<React.SetStateAction<dayjs.Dayjs | null>>
) => {
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

// handleBalanceBidder
const handleBalanceBidder = async (
  contractAddress: string,
  setBalanceBidder: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
    const web3Instance = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const balance = await web3Instance.eth.getBalance(contractAddress);
    const balanceInEth = web3Instance.utils.fromWei(balance, "ether");
    setBalanceBidder(balanceInEth);
  } catch (error) {
    alert(`Error: ${error}`);
  }
};

// handleBid
const handleBid = async (
  contract: Contract<ContractAbi> | null,
  web3: Web3 | null,
  account: string,
  highestBid: string,
  bid: string,
  handleHighestBid: () => void,
  handleHighestBidder: () => void,
  handleRefresh: () => void,
  setBid: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
    if (contract && web3) {
      if (Number(bid) <= Number(highestBid)) {
        alert("Bid must be higher than the highest bid");
      }
      if (bid !== "" && Number(bid) > Number(highestBid)) {
        const bidInWei = web3.utils.toWei(bid, "ether");
        await contract.methods.bid().send({ value: bidInWei });
        handleHighestBid();
        handleHighestBidder();
        handleRefresh();
        setBid("");
        alert("Bid placed successfully");
      }
    }
  } catch (error) {
    alert(`Error: ${error}`);
  }
};

// handleRefresh
const handleRefresh = async (
  handleBeneficiary: () => void,
  handleHighestBid: () => void,
  handleHighestBidder: () => void,
  handleBalanceBidder: () => void,
  handlePendingReturns: () => void
) => {
  handleBeneficiary();
  handleHighestBid();
  handleHighestBidder();
  handleBalanceBidder();
  handlePendingReturns();
};

// handleWithdraw
const handleWithdraw = async (
  myPendingReturns: string,
  contract: Contract<ContractAbi> | null,
  account: string
) => {
  try {
    if (myPendingReturns === "0") {
      alert("Nothing to withdraw");
    }
    if (contract && myPendingReturns !== "0") {
      await contract.methods.withdraw().send({ from: account });
      alert("Withdrawal successful");
    }
  } catch (error) {
    alert(`Error: ${error}`);
  }
};

// handlePendingReturns
const handlePendingReturns = async (
  contract: Contract<ContractAbi> | null,
  web3: Web3 | null,
  account: string,
  setMyPendingReturns: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
    if (contract) {
      const res: string = await contract.methods.pendingReturns(account).call();
      const valueInEth: string = web3?.utils.fromWei(res, "ether") || "";
      setMyPendingReturns(valueInEth);
    }
  } catch (error) {
    alert(`Error: ${error}`);
  }
};

// export all functions
export {
  handleBeneficiary,
  handleHighestBid,
  handleHighestBidder,
  handleAuctionEndTime,
  handleBalanceBidder,
  handleBid,
  handleRefresh,
  handleWithdraw,
  handlePendingReturns,
};
