import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "./Constant/constant";

import AdminDashboard from "./Components/AdminDashboard";
import UserDashboard from "./Components/userDashBoard";
import AdminLogin from "./Components/AdminLogin";
import CallbackGuard from "./Components/callbackGaurd";
import Elections from "./Components/Elections";
import Candidate from "./Components/Candidate";
import NotFound from "./Components/404page";
import "./App.css";
import VotingResult from "./Components/VotingResult";
import FinishedElectionDetails from "./Components/FinshedResult";
function App() {
  const [toggle, setToggle] = useState(false);
  const [provider, setProvider] = useState(null);
  const [Account, setAccount] = useState(null);
  const [isConnected, setConnected] = useState(false);
  const [loged, setLoged] = useState(false);

  const [Candidates, setCandidates] = useState([]);
  // const [number, setNumber] = useState(null);

  const [CandidateIndex, setCandidateIndex] = useState(null);

  useEffect(() => {
    // getCurrentStatus();
    const savedAccount = localStorage.getItem("userAccount");
    if (savedAccount) {
      setAccount(savedAccount);
      setConnected(true);
    }
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    // we needed to remove it when the component unmounted.
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  });
  // first of all this account change logic will only be used for client side
  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && Account !== accounts[0]) {
      setAccount(accounts[0]);
      setConnected(true);
      const checksummedAddress = ethers.utils.getAddress(accounts[0]); // Convert to checksummed format
      console.log("Account changed to:", checksummedAddress);
      localStorage.setItem("userAccount", checksummedAddress);
      // canVote();
      // here
      // getCandidates();
    } else {
      setConnected(false);
      setAccount(null);
      setConnected(false);
      setAccount(null);

      // Clear account from localStorage
      localStorage.removeItem("userAccount");
      // and here needs election id
      // getCandidates();
    }
  }

  async function getCandidates(id) {
    setCandidates([]);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ContractAddress,
        ContractAbi,
        provider
      );

      const [ids, names, voteCounts] = await contract
        .connect(signer)
        .getCandidate(id);

      const candidates = ids.map((bn, i) => ({
        id: bn.toNumber(),
        name: names[i],
        voteCount: voteCounts[i].toNumber(),
      }));

      setCandidates(candidates);
    } catch (err) {
      if (err.code === 4001) {
        console.log("User canceled wallet connection");
      } else {
        console.error("Failed to fetch candidates:", err);
      }
    }
  }

  const toggleHandler = (index) => {
    toggle ? setToggle(false) : setToggle(true);
    setCandidateIndex(index);
  };
  return (
    <Router>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminLogin account={Account} getCandidates={getCandidates} />
          }
        />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route
          path="/callback"
          element={
            <CallbackGuard>
              <UserDashboard
                logged={loged}
                setLogged={setLoged}
                account={Account}
                setConnected={setConnected}
                setAccount={setAccount}
              />
            </CallbackGuard>
          }
        />

        <Route
          path="/result"
          element={
            <VotingResult
              account={Account}
              setAccount={setAccount}
              getCandidates={getCandidates}
              // canVote={canVote}
              candidates={Candidates}
              // eligibility={voterStatus}
              toggleHandler={toggleHandler}
              setConnected={setConnected}
              setProvider={setProvider}
            />
          }
        />
        <Route
          path="/"
          element={
            <Elections
              setAccount={setAccount}
              account={Account}
              setConnected={setConnected}
              // canVote={canVote}
              logged={loged}
              setLogged={setLoged}
              getCandidates={getCandidates}
            />
          }
        />
        <Route path="/candidate/:index" element={<Candidate />} />
        <Route
          path="/endedElection"
          element={
            <FinishedElectionDetails
              account={Account}
              getCandidates={getCandidates}
              // canVote={canVote}
              candidates={Candidates}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
