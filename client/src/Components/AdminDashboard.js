import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../Constant/constant";
import {
  FaCheckCircle,
  FaHourglassEnd,
  FaPlusCircle,
  FaPlus,
} from "react-icons/fa";
import {
  MdOutlineVerified,
  MdAppRegistration,
  MdOutlineLogout,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const [activeView, setActiveView] = useState("active");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [candidates, setCandidates] = useState([{ name: "" }]);
  const [elections, setElections] = useState([]);
  const [FinishedElections, setFinishedElections] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState("");
  const timerRef = useRef(null);
  const [endTime, setEndTime] = useState(null);
  // Placeholder data
  const navigate = useNavigate();

  useEffect(() => {
    getAllElectionData();
  }, []);
  useEffect(() => {
    // Check stored admin status on page load
    const storedAdminAccount = localStorage
      .getItem("adminAccount")
      ?.toLowerCase()
      .trim();
    const connectedAccount = localStorage
      .getItem("userAccount")
      ?.toLowerCase()
      .trim();
    console.log("admin account: " + storedAdminAccount);
    console.log("current connected account: " + connectedAccount);
    if (connectedAccount == storedAdminAccount) {
      // setIsConnecting(true);
      // setIsConnecting(false);
      console.log("true they are equal");
      navigate("/admin-dashboard"); // Redirect to admin login
    } else {
      navigate("/admin");
      console.log("they are not equal");
    }
    // // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAdminAccountChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAdminAccountChange
        );
      }
    };
  }, []);
  function handleAdminAccountChange(accounts) {
    // If the account array is empty, the user has disconnected
    if (accounts.length === 0) {
      navigate("/admin");
      return;
    }

    const newAddress = accounts[0];
    const storedAdminAccount = localStorage.getItem("adminAccount");
    console.log("Account switched to:", newAddress);

    // Check if the new address is allowed
    if (newAddress === storedAdminAccount) {
      console.log("is this runnig");

      localStorage.setItem("adminAccount", newAddress);
      // Redirect to admin login
    } else {
      console.log("is this runnig inthe else");

      navigate("/admin");
    }
  }
  const handleClick = (elec_id, CheckFinshed) => {
    // Perform any logic you need before navigation
    if (CheckFinshed) {
      navigate(`/result?electionId=${elec_id}`);
    } else {
      navigate(`/endedElection?electionId=${elec_id}`);
    }
  };

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: "" }]);
  };

  const handleRemoveCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleChange = (index, value) => {
    const updatedCandidates = candidates.map((candidate, i) =>
      i === index ? { name: value } : candidate
    );
    setCandidates(updatedCandidates);
    // console.log(candidates);
  };
  const getAllElectionData = async () => {
    console.log("i have call this much");
    setElections([]);
    setFinishedElections([]);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // may throw if user rejects
      const signer = provider.getSigner();

      const contractInstance = new ethers.Contract(
        ContractAddress,
        ContractAbi,
        provider
      );
      const electionCountBN = await contractInstance.electionCount(); // on-chain call
      const electionCount = electionCountBN.toNumber();
      console.log("Election count: ", electionCount);

      for (let index = 1; index <= electionCount; index++) {
        const currentElectionData = await contractInstance.getElection(index);
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const electionEndTime = currentElectionData[3].toNumber();

        const baseData = {
          id: currentElectionData[0].toNumber(),
          title: currentElectionData[1],
          candidateCount: currentElectionData[2].toNumber(),
          electionEndTime,
        };

        if (electionEndTime > now) {
          setElections((prev) => [...prev, baseData]);
        } else {
          setFinishedElections((prev) => [...prev, baseData]);
        }
      }
    } catch (err) {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log("User canceled wallet connection");
      } else {
        console.error("Error loading elections:", err);
      }
    }
  };

  const ElectionCard = ({ election, isActive }) => (
    <div className="card admin-dashboard-election-card">
      <div className="card-body">
        <div className="card-flag">
          <span
            className={`flag ${isActive ? "flag-active" : "flag-finished"}`}
          >
            {isActive ? "Active" : "Finished"}
          </span>
        </div>
        <h5 className="card-title">{election.title}</h5>
        <p className="card-text pt-2">
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
          {isActive ? "Details" : "View Results"}
        </button>
      </div>
    </div>
  );
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const hours = String(date.getHours()).padStart(2, "0"); // Format hours as 2 digits
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Format minutes as 2 digits
    return `${hours}:${minutes}`;
  };
  const handleCreateElection = async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    // setProvider(Provider);
    await Provider.send("eth_requestAccounts", []);
    const signer = Provider.getSigner();

    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );
    if (!title || !endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Calculate duration in minutes from now until the selected end date
      const currentTime = new Date().getTime();
      const selectedEndTime = new Date(endDate).getTime();
      const durationInMinutes = Math.floor(
        (selectedEndTime - currentTime) / 60000
      );

      if (durationInMinutes <= 0) {
        alert("Please select a valid future end date.");
        return;
      }

      // Call the smart contract function to add an election
      console.log(" Title of the election");
      const [hours, minutes] = endTime.split(":").map(Number);
      const now = new Date();
      now.setHours(hours, minutes, 0, 0);
      const formattedEndTime = Math.floor(now.getTime() / 1000);
      console.log(formattedEndTime);

      const tx = await contractInstance
        .connect(signer)
        .addElection(title, formattedEndTime);
      await tx.wait(); // Wait for the transaction to be mined

      console.log("Election created successfully:");
      alert("Election created successfully!");

      // Reset the form after successful creation
      setTitle("");
      setDescription("");
      setEndDate("");
      const electionCountBN = await contractInstance.electionCount();
      const electionCount = electionCountBN.toNumber();
      console.log("Election count: ", electionCount);
      const currentElectionData = await contractInstance.getElection(
        electionCount
      );

      console.log(
        "current added election id:",
        currentElectionData[0].toNumber()
      );
      console.log(candidates);
      candidates.forEach(async (candidateName) => {
        try {
          // Call the addCandidate function for each candidate

          const tx = await contractInstance
            .connect(signer)
            .addCandidate(
              currentElectionData[0].toNumber(),
              candidateName.name
            );
          await tx.wait(); // Wait for the transaction to be mined
          alert(`Candidate ${candidateName.name} added successfully.`);
        } catch (error) {
          console.error(`Error adding candidate ${candidateName.name}:`, error);
        }
      });
    } catch (error) {
      console.error("Error creating election:", error);
      alert("Failed to create election. Please try again.");
    }
  };
  const setElectionTime = (value) => {
    console.log(typeof value);
    console.log(value);
    const [hours, minutes] = value.split(":").map(Number);
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(hours, minutes, 0);

    // If end time is earlier today, assume it's for tomorrow
    if (endTime < now) {
      endTime.setDate(endTime.getDate() + 1);
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
      } else {
        const remainingSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        console.log(`Time remaining: ${hours}h ${minutes}m ${seconds}s`);
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
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-sidebar">
        <h3 className="sidebar-title">Admin Dashboard</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeView === "active" ? "active" : ""}`}
              onClick={() => {
                getAllElectionData();
                setActiveView("active");
              }}
            >
              <FaCheckCircle /> Active Elections
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeView === "finished" ? "active" : ""
              }`}
              onClick={() => setActiveView("finished")}
            >
              <FaHourglassEnd /> Finished Elections
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveView("new")}>
              <FaPlusCircle /> Create New Election
            </button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link"
              onClick={() => setActiveView("Register Voter")}
            >
              <MdAppRegistration /> Voter Registration
            </button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link"
              onClick={() => setActiveView("Verified voters")}
            >
              <MdOutlineVerified />
              Verified voters
            </button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link"
              onClick={() => setActiveView("Log out")}
            >
              <MdOutlineLogout />
              Log out
            </button>
          </li>
        </ul>
      </div>
      <div className="admin-dashboard-main-content">
        <h1 className="main-title">
          {activeView === "active"
            ? "Active Elections"
            : activeView === "finished"
            ? "Finished Elections"
            : activeView === "new"
            ? "Create New Election"
            : activeView === "Register Voter"
            ? "Voter Registration"
            : activeView === "Verified voters"
            ? "Verified Voters List"
            : activeView === "Log out"
            ? "Logging Out..."
            : "Create New Election"}
        </h1>
        <div className="admin-dashboard-election-grid">
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
          {activeView === "Register Voter" && (
            <div className="modern-container">
              <div className="registration-section">
                <div className="section-header">
                  <h2>Add New Voter</h2>
                  <p className="subtitle">
                    Enter voter details to register them in the system
                  </p>
                </div>

                <form className="modern-form">
                  <div className="form-field">
                    <label>
                      <span className="field-label">Wallet Address</span>
                      <input
                        type="text"
                        className="modern-input"
                        placeholder="0x..."
                      />
                    </label>
                  </div>

                  <div className="form-field">
                    <label>
                      <span className="field-label">Full Name</span>
                      <input
                        type="text"
                        className="modern-input"
                        placeholder="Enter voter's full name"
                      />
                    </label>
                  </div>

                  <div className="form-field">
                    <label>
                      <span className="field-label">Email Address</span>
                      <input
                        type="email"
                        className="modern-input"
                        placeholder="email@example.com"
                      />
                    </label>
                  </div>

                  <button type="submit" className="modern-button">
                    <FaPlus className="icon" />
                    <span>Register New Voter</span>
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeView === "Verified voters" && (
            <div className="modern-container">
              <div className="voters-section">
                <div className="section-header">
                  <div className="header-content">
                    <div>
                      <h2>Verified Voters</h2>
                      <p className="subtitle">
                        Manage and view all registered voters
                      </p>
                    </div>
                    <div className="search-box">
                      <input
                        type="text"
                        className="modern-search"
                        placeholder="Search voters..."
                      />
                    </div>
                  </div>
                </div>

                <div className="modern-table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Voter Name</th>
                        <th>Email Address</th>
                        <th>Wallet Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="voter-info">
                            <span className="voter-name">John Doe</span>
                          </div>
                        </td>
                        <td>john@example.com</td>
                        <td>
                          <span className="wallet-address">0x1234...5678</span>
                        </td>
                        <td>
                          <span className="status-badge verified">
                            Verified
                          </span>
                        </td>
                        <td>
                          <button className="action-button">Details</button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="voter-info">
                            <span className="voter-name">Michael Scott</span>
                          </div>
                        </td>
                        <td>michaelscott@example.com</td>
                        <td>
                          <span className="wallet-address">0x1234...5678</span>
                        </td>
                        <td>
                          <span className="status-badge verified">
                            Verified
                          </span>
                        </td>
                        <td>
                          <button className="action-button">Details</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeView === "Log out" && (
            <div>
              {localStorage.removeItem("adminAccount")}
              {localStorage.removeItem("userAccount")}
              {navigate("/admin")}
            </div>
          )}
          {activeView === "new" && (
            <form
              className="create-election-form"
              onSubmit={handleCreateElection}
            >
              <div className="mb-3">
                <label htmlFor="electionTitle" className="form-label">
                  Election Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="electionTitle"
                  placeholder="Enter election title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="electionDescription" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="electionDescription"
                  rows="3"
                  placeholder="Enter election description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <label htmlFor="electionTitle" className="form-label">
                Add Candidates
              </label>
              {candidates.map((candidate, index) => (
                <div key={index} className="row align-items-center mb-3">
                  <div className="col-10">
                    <input
                      type="text"
                      placeholder={`Candidate ${index + 1}`}
                      className="form-control"
                      value={candidate.name}
                      onChange={(e) => handleChange(index, e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-2">
                    <button
                      type="button"
                      className="btn-remove-custom w-100"
                      onClick={() => handleRemoveCandidate(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn-custom-add-candidate mb-4"
                onClick={handleAddCandidate}
              >
                <FaPlusCircle /> Add Candidate
              </button>

              <div className="mb-3">
                <label htmlFor="electionEndTime" className="form-label">
                  Ending Time
                </label>
                <div className="d-flex align-items-center">
                  <input
                    type="time"
                    className="form-control me-2"
                    id="electionEndTime"
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="createBtn"
                onClick={handleCreateElection}
              >
                Create Election
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
