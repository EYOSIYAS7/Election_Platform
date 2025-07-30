import React from "react";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../Constant/constant";
import { useState } from "react";
const VotingPage = (props) => {
  const [number, setNumber] = useState(null);

  function handleNumberChange(e) {
    setNumber(e.target.value);
    console.log(number);
  }

  async function vote(number) {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    // setProvider(Provider);
    await Provider.send("eth_requestAccounts", []);
    const signer = Provider.getSigner();

    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );
    // this kind of functions writes to the blockchain so we use this kind of method
    const voteTXN = await contractInstance.connect(signer).vote(number);
    await voteTXN.wait();
    props.canVote();
    props.getCandidates();
  }
  function formatAccount(account) {
    if (!account) return "";
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }

  return (
    <div className="connected-container">
      <h1 className="connected-header">Decentralized Voting Platform</h1>
      <p>Make Your Vote Count in a Secure and Transparent Election Process</p>
      <p className="">User Account: {formatAccount(props.account)}</p>

      {props.eligibility ? (
        <div>
          <p className="connected-account">
            Your vote has been successfully recorded!
          </p>
          <div className="cards-container">
            {props.candidates.map((candidate) => (
              <div key={candidate.index} className="candidate-card">
                <h3>{candidate.name}</h3>
                <p>Votes: {candidate.voteCount}</p>
                <small
                  className="details"
                  onClick={() => props.toggleHandler(candidate.index)}
                >
                  Details
                </small>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="cards-container">
          {props.candidates.map((candidate) => (
            <div key={candidate.index} className="candidate-card">
              <h3>{candidate.name}</h3>
              <p>Votes: {candidate.voteCount}</p>
              <small
                className="details"
                onClick={() => props.toggleHandler(candidate.index)}
              >
                Details
              </small>
              <button
                className="vote-button"
                onClick={() => vote(candidate.index)}
              >
                Vote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VotingPage;
