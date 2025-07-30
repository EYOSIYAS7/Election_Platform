import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../Constant/constant";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaUser, FaInfoCircle } from "react-icons/fa";

const VotingResult = (props) => {
  const [number, setNumber] = useState(null);
  const [voterStatus, setVoterStatus] = useState(false);
  const [electionEnded, setElectionEnded] = useState(false);
  const [electiondata, setElection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const electionId = queryParams.get("electionId");
  useEffect(() => {
    // formatAccount(props.account);
    props.getCandidates(electionId);
    getAllElectionData(electionId);
    canVote(electionId);
    return () => {
      stopElectionCountdown();
    };
  }, []);
  useEffect(() => {
    // getCurrentStatus();
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
  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && props.Account !== accounts[0]) {
      props.setAccount(accounts[0]);
      canVote(electionId);
      // here
      // getCandidates();
    } else {
      props.setConnected(false);
      props.setAccount(null);
      // and here needs election id
      // getCandidates();
    }
  }
  function handleNumberChange(e) {
    setNumber(e.target.value);
    console.log(number);
  }
  const handleCandidateClick = (index) => {
    navigate(`/candidate/${index}`);
  };
  async function canVote(Elec_id) {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    props.setProvider(Provider);
    await Provider.send("eth_requestAccounts", []);
    const signer = Provider.getSigner();

    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );
    // get the eligibility status and set it to VoterStatus
    // this kind of functions just read data from the blockchain
    const voteStatus = await contractInstance.voters(
      await signer.getAddress(),
      Elec_id
    );
    console.log("Voter status from the contract", voteStatus);
    console.log(
      "the voter status before setting it to voterStatus",
      voterStatus
    );
    setVoterStatus(voteStatus);
  }
  async function vote(id, number) {
    console.log(" FE candidate index: " + number);
    console.log("FE candidate length" + props.candidates.length);
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
    const voteTXN = await contractInstance.connect(signer).vote(id, number);
    await voteTXN.wait();
    canVote(electionId);
    props.getCandidates(id);
    console.log("voted successfully");
  }
  function formatAccount(account) {
    if (!account) return "";
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const hours = String(date.getHours()).padStart(2, "0"); // Format hours as 2 digits
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Format minutes as 2 digits
    return `${hours}:${minutes}`;
  };
  const getAllElectionData = async (id) => {
    stopElectionCountdown();
    console.log("i have call this much");
    // setElections([]);
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    // setProvider(Provider);
    await Provider.send("eth_requestAccounts", []);
    const signer = Provider.getSigner();

    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );

    const currentElectionData = await contractInstance.getElection(id);
    // console.log("election id:", currentElectionData[0].toNumber());
    // console.log(" election Title:", currentElectionData[1]);
    // console.log(
    //   index,
    //   "election candidates:",
    //   currentElectionData[2].toNumber()
    // );
    // console.log(
    //   index,
    //   "election startTime:",
    //   currentElectionData[3].toNumber()
    // );
    console.log("election end time", currentElectionData[3].toNumber());
    const electionData = {
      id: currentElectionData[0].toNumber(),
      title: currentElectionData[1],
      candidateCount: currentElectionData[2].toNumber(),
      electionEndTime: currentElectionData[3].toNumber(),
    };

    // setElections([...elections, electionData]);
    setElection([electionData]);
    console.log(electiondata);
    setLoading(false);
    setElectionTime(formatTimestamp(electionData.electionEndTime));
  };
  const handleVoteClick = (candidate) => {
    console.log("handleVoteClick is called");
    setShowModal(true);
    setSelectedCandidate(candidate);

    console.log(showModal);
  };

  const handleConfirmVote = () => {
    if (selectedCandidate) {
      vote(electionId, selectedCandidate.id);
    }
    setShowModal(false);
  };

  const handleCancelVote = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  const setElectionTime = (value) => {
    // console.log(typeof(value))
    // console.log(value)
    const [hours, minutes] = value.split(":").map(Number);
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(hours, minutes, 0);

    // If end time is earlier today, assume it's for tomorrow
    // if (endTime < now) {
    //   clearInterval(timerRef.current);
    //     timerRef.current = null; // Reset the timer ref
    //     setTimeRemaining("Election time finished");

    //     console.log("Election time finshed")
    //     const pollTimerElement = document.querySelector('.poll-timer-text');
    //     if (pollTimerElement) {
    //       pollTimerElement.textContent ="Election time has ended at "+formatTimestamp(electiondata[0].electionEndTime);
    //     }
    //     setElectionEnded(true);
    //     return;
    // }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current); // Clear any existing timer
    }

    timerRef.current = setInterval(() => {
      const currentTime = new Date();
      const remainingMs = endTime - currentTime;

      if (remainingMs <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null; // Reset the timer ref
        setTimeRemaining("Election time finished");

        console.log("Election time finshed");
        const pollTimerElement = document.querySelector(".poll-timer-text");
        if (pollTimerElement) {
          pollTimerElement.textContent = "Election time has ended at " + value;
        }
        setElectionEnded(true);
        return;
      } else {
        const remainingSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        // console.log(`Time remaining: ${hours}h ${minutes}m ${seconds}s`);
        // Update the poll timer text content
        const pollTimerElement = document.querySelector(".poll-timer-text");
        if (pollTimerElement) {
          pollTimerElement.textContent = `Polls close in: ${hours}h ${minutes}m ${seconds}s`;
        }
      }
    }, 1000);
  };

  const stopElectionCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null; // Reset the timer ref
      setTimeRemaining("Countdown stopped");

      console.log("countdown stopped");
    }
  };
  return (
    <div className="voting-container">
      <header className="voting-header">
        <h1 className="voting-logo">Decentralized Voting Platform</h1>
        <div className="voting-header-info">
          <span className="voting-account">
            <FaUser /> {formatAccount(props.account)}
          </span>
        </div>
      </header>

      {loading ? (
        <p className="mt-5">Loading election data...</p>
      ) : !electionId ? (
        <div className="no-election">
          <h2>No Current Elections Available</h2>
        </div>
      ) : (
        <main className="voting-main">
          <h2 className="voting-title">{electiondata[0].title}</h2>
          <p className="voting-description p-2">
            Make Your Vote Count in a Secure and Transparent Election Process
          </p>
          <p className="poll-timer-text mb-3"></p>
          {/* {setElectionTime(formatTimestamp(electiondata[0].electionEndTime))} */}
          <div className="voting-cards-container">
            {props.candidates.map((candidate) => (
              <div key={candidate.index} className="voting-candidate-card">
                <h3 className="candidate-name-text">{candidate.name}</h3>
                <p className="candidate-party-text">
                  Party : party name palace holder
                </p>
                <p className="candidate-votes-text">
                  Votes: {candidate.voteCount}
                </p>
                <small
                  className="candidate-details-text"
                  title="Candidate details will be included soon ... "
                  // onClick={() => handleCandidateClick(candidate.id)}
                >
                  Details
                </small>

                {!voterStatus && !electionEnded && (
                  <button
                    className="vote-action-button"
                    onClick={() => handleVoteClick(candidate)}
                  >
                    Vote
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="leader-board">
            <h3 className="pt-3 pb-3">Leader Board</h3>
            <table className="leaderboard-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Party</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {[...props.candidates]
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((candidate, index) => (
                    <tr key={candidate.index}>
                      <td style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: "#000",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "10px",
                            marginTop: "15px",
                            fontSize: "1rem",
                            padding: "18px",
                          }}
                        >
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        {candidate.name}
                      </td>
                      <td>Party name placeholder</td>
                      <td>{candidate.voteCount.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      )}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h4 className="text-black pb-2">
              {" "}
              <FaInfoCircle /> Confirm Your Vote
            </h4>
            <p>
              Are you sure you want to vote for {selectedCandidate.name}? This
              action cannot be undone.
            </p>
            <div className="button-container">
              <button className="confirm-button" onClick={handleConfirmVote}>
                Yes
              </button>
              <button className="cancel-button" onClick={handleCancelVote}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingResult;
