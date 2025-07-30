import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../Constant/constant";
import { useLocation } from "react-router-dom";

const FinishedElectionDetails = (props) => {
  const [electiondata, setElection] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const electionId = queryParams.get("electionId");

  useEffect(() => {
    props.getCandidates(electionId);
    getAllElectionData(electionId);
  }, []);

  const electionDetails = {
    title: "Presidential Election 2024",
    description:
      "The presidential election to elect the leader of the country for the next term.",
    startDate: "January 1, 2024",
    endDate: "January 7, 2024",
    totalVoters: 12500,
    winner: {
      name: "John Doe",
      party: "Progressive Party",
      votes: 6700,
    },
    leaderBoard: [
      { id: 1, name: "John Doe", party: "Progressive Party", votes: 6700 },
      { id: 2, name: "Jane Smith", party: "Liberty Party", votes: 5200 },
      { id: 3, name: "Robert Brown", party: "People's Voice", votes: 600 },
    ],
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getAllElectionData = async (id) => {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    await Provider.send("eth_requestAccounts", []);
    const signer = Provider.getSigner();

    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );

    const currentElectionData = await contractInstance.getElection(id);
    const electionData = {
      id: currentElectionData[0].toNumber(),
      title: currentElectionData[1],
      candidateCount: currentElectionData[2].toNumber(),
      electionEndTime: currentElectionData[3].toNumber(),
    };
    setElection([electionData]);
    console.log(electiondata);
    setLoading(false);
  };

  function formatAccount(account) {
    if (!account) return "";
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }

  const [winner, setWinner] = useState({
    name: "",
    votes: 0,
  });
  const [totalVotes, setTotalVotes] = useState(0);

  const calculateTotalVotes = () => {
    if (!props.candidates || props.candidates.length === 0) return;

    const total = props.candidates.reduce((sum, candidate) => {
      return sum + Number(candidate.voteCount);
    }, 0);

    setTotalVotes(total);
  };

  const findWinner = () => {
    if (!props.candidates || props.candidates.length === 0) return;

    let maxVotes = 0;
    let winners = [];

    props.candidates.forEach((candidate) => {
      if (candidate.voteCount > maxVotes) {
        maxVotes = candidate.voteCount;
        winners = [candidate];
      } else if (candidate.voteCount === maxVotes) {
        winners.push(candidate);
      }
    });

    if (winners.length === 1) {
      setWinner({
        name: winners[0].name,
        votes: winners[0].voteCount,
      });
    } else if (winners.length > 1) {
      setWinner({
        name: "Tie",
        votes: winners[0].voteCount,
      });
    }
  };

  useEffect(() => {
    findWinner();
    calculateTotalVotes();
  }, [props.candidates]);

  return (
    <div className="result-voting-container">
      <header className="result-voting-header">
        <h1 className="result-voting-logo">Decentralized Voting Platform</h1>
        <div className="result-voting-header-info">
          <span className="result-voting-account">
            <User size={16} /> {formatAccount(props.account)}
          </span>
        </div>
      </header>

      {loading ? (
        <div className="result-loading-container">
          <div className="result-loading-spinner"></div>
          <p className="result-loading-text">Loading election data...</p>
        </div>
      ) : (
        <div className="result-finished-election-container">
          <div className="result-election-header">
            <h2 className="result-election-title">{electiondata[0].title}</h2>
            <p className="result-election-description">
              {electionDetails.description}
            </p>
          </div>

          <div className="result-election-info-grid">
            <div className="result-election-dates result-card">
              <h3>Election Period</h3>
              <div className="result-date-item">
                <span className="result-date-label">Start Date:</span>
                <span className="result-date-value">
                  {electionDetails.startDate}
                </span>
              </div>
              <div className="result-date-item">
                <span className="result-date-label">End Time:</span>
                <span className="result-date-value">
                  {formatTimestamp(electiondata[0].electionEndTime)}
                </span>
              </div>
            </div>

            <div className="result-total-voters result-card">
              <h3>Total Participation</h3>
              <div className="result-voter-count">
                {totalVotes.toLocaleString()}
              </div>
              <span className="result-voter-label">Total Votes Cast</span>
            </div>
          </div>

          <div className="result-winner-details result-card">
            <div className="result-winner-header">
              <h3>Election Winner</h3>
            </div>
            <div className="result-winner-info">
              <div className="result-winner-name">{winner.name}</div>
              <div className="result-winner-party">
                {electionDetails.winner.party}
              </div>
              <div className="result-winner-votes">
                {winner.votes.toLocaleString()} votes
              </div>
            </div>
          </div>

          <div className="result-leader-board result-card">
            <h3 className="result-leaderboard-title">Final Results</h3>
            <div className="result-leaderboard-table">
              <div className="result-table-header">
                <div className="result-header-cell">Candidate</div>
                <div className="result-header-cell">Party</div>
                <div className="result-header-cell">Votes</div>
              </div>
              <div className="result-table-body">
                {[...props.candidates]
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((candidate, index) => (
                    <div key={candidate.index} className="result-table-row">
                      <div className="result-candidate-cell">
                        <div className="result-candidate-avatar">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="result-candidate-name">
                          {candidate.name}
                        </span>
                        {index === 0 && (
                          <div className="result-winner-crown"></div>
                        )}
                      </div>
                      <div className="result-party-cell">
                        <span className="result-party-tag">Party Name</span>
                      </div>
                      <div className="result-votes-cell">
                        <span className="result-vote-count">
                          {candidate.voteCount.toLocaleString()}
                        </span>
                        <div className="result-vote-bar">
                          <div
                            className="result-vote-progress"
                            style={{
                              width: `${
                                totalVotes > 0
                                  ? (candidate.voteCount / totalVotes) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinishedElectionDetails;
