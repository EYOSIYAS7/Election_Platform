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
      localStorage.setItem("userAccount", accounts[0]);
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
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    await Provider.send("eth_requestAccounts", []);
    const signer = Provider.getSigner();
    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );
    console.log(id);

    const [ids, names, voteCounts] = await contractInstance
      .connect(signer)
      .getCandidate(id);

    // Combine the arrays into an array of candidate objects
    const candidates = ids.map((id, index) => ({
      id: id.toNumber(), // Convert BigNumber to number
      name: names[index],
      voteCount: voteCounts[index].toNumber(),
    }));

    console.log("Candidates:", candidates);
    setCandidates(candidates);
    // const receipt = await candidates.wait();
    // const iface = new ethers.utils.Interface(ContractAbi);
    // const decodedData = iface.parseTransaction({ data: candidates.data });
    // console.log(decodedData.functionFragment.outputs[0]);

    // console.log(receipt);
    // const formattedCandidates = candidates.map((candidates, index) => {
    //   return {
    //     index: index,
    //     name: candidates.name,
    //     voteCount: candidates.voteCount.toNumber(),
    //   };
    // });
    // console.log(formattedCandidates);
    // setCandidates(formattedCandidates);
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
