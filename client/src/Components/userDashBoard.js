import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHourglassEnd } from "react-icons/fa";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../Constant/constant";
const UserDashboard = (props) => {
  const [activeView, setActiveView] = useState("active");
  const [elections, setElections] = useState([]);
  const [FinishedElections, setFinishedElections] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    getAllElectionData();
  }, []);

  const handleClick = (elec_id, CheckFinshed) => {
    // Perform any logic you need before navigation
    if (CheckFinshed) {
      navigate(`/result?electionId=${elec_id}`);
    } else {
      navigate(`/endedElection?electionId=${elec_id}`);
    }
  };
  const handleLogout = () => {
    console.log("logout have been called");
    localStorage.removeItem("userAccount");
    props.setConnected(false);
    props.setLogged(false);
    navigate("/");
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const hours = String(date.getHours()).padStart(2, "0"); // Format hours as 2 digits
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Format minutes as 2 digits
    return `${hours}:${minutes}`;
  };
  const getAllElectionData = async () => {
    console.log("i have call this much");
    setElections([]);
    setFinishedElections([]);
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    // setProvider(Provider);
    await Provider.send("eth_requestAccounts", []);
    const signer = Provider.getSigner();

    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );
    const electionCountBN = await contractInstance.electionCount();
    const electionCount = electionCountBN.toNumber();
    console.log("Election count: ", electionCount);
    const electionData = [];
    for (let index = 1; index <= electionCount; index++) {
      const currentElectionData = await contractInstance.getElection(index);
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
      const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const electionEndTime = currentElectionData[3].toNumber();

      if (electionEndTime > now) {
        const electionData = {
          id: currentElectionData[0].toNumber(),
          title: currentElectionData[1],
          candidateCount: currentElectionData[2].toNumber(),
          electionEndTime: electionEndTime,
        };
        setElections((prevElections) => [...prevElections, electionData]);
      } else {
        const finishedElectionData = {
          id: currentElectionData[0].toNumber(),
          title: currentElectionData[1],
          candidateCount: currentElectionData[2].toNumber(),
          electionEndTime: electionEndTime,
        };
        setFinishedElections((prevFinishedElections) => [
          ...prevFinishedElections,
          finishedElectionData,
        ]);
      }
    }
  };

  const ElectionCard = ({ election, isActive }) => (
    <div className="card  user-dashboard-election-card">
      <div className="card-user-body">
        <div className="card-flag">
          <span
            className={`flag ${isActive ? "flag-active" : "flag-finished"}`}
          >
            {isActive ? "Active" : "Finished"}
          </span>
        </div>
        <h5 className="card-title">{election.title}</h5>
        <p className="card-text">
          {" "}
          Number of candidates: {election.candidateCount}
        </p>
        <p className="card-text">
          <small className="text-muted">
            {isActive ? "Ends on: " : "Ended on: "}{" "}
            {formatTimestamp(election.electionEndTime)}
          </small>
        </p>
        <button
          className={`btn btn-manage`}
          onClick={() => handleClick(election.id, isActive)}
        >
          {isActive ? "More" : "View Results"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-main-content">
        <div className="user-dashboard-menu">
          <button
            className={`menu-btn ${activeView === "active" ? "active" : ""}`}
            onClick={() => {
              getAllElectionData();
              setActiveView("active");
            }}
          >
            <FaCheckCircle /> Active Elections
          </button>
          <button
            className={`menu-btn ${activeView === "finished" ? "active" : ""}`}
            onClick={() => setActiveView("finished")}
          >
            <FaHourglassEnd /> Finished Elections
          </button>
          <button className="logoutbtn" onClick={handleLogout}>
            LOG OUT
          </button>
        </div>
        <h1 className="main-title">
          {activeView === "active" ? "Active Elections" : "Finished Elections"}
        </h1>
        <div className="user-dashboard-election-grid ">
          {activeView === "active" &&
            (elections.length > 0 ? (
              elections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  isActive={true}
                />
              ))
            ) : (
              <div className="no-elections-message">
                Currently, there are no active elections available. Please check
                back later on.
              </div>
            ))}

          {activeView === "finished" &&
            (FinishedElections.length > 0 ? (
              FinishedElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  isActive={false}
                />
              ))
            ) : (
              <div className="no-elections-message">
                Currently, there are no finished elections available. Please
                check back later on.
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
