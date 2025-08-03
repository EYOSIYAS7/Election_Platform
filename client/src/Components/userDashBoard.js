import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHourglassEnd } from "react-icons/fa";
import { ethers } from "ethers";
import { ContractAbi, ContractAddress } from "../Constant/constant";
import { useLocation } from "react-router-dom";
import axios from "axios";
import * as jose from "jose";
import { FaAngleRight } from "react-icons/fa";

const getValidIdToken = () => {
  const id_token = localStorage.getItem("id_token");
  if (!id_token) {
    return null;
  }
  try {
    const payload = jose.decodeJwt(id_token);
    if (payload.exp * 1000 > Date.now()) {
      return id_token;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const UserDashboard = (props) => {
  const [activeView, setActiveView] = useState("active");
  const [elections, setElections] = useState([]);
  const [FinishedElections, setFinishedElections] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  async function connectWithMetamask() {
    if (!window.ethereum) {
      console.log("MetaMask is not detected in your browser");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let address;
    try {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      address = await signer.getAddress();
    } catch (err) {
      if (err.code === 4001) {
        console.log("User canceled MetaMask connection");
        return;
      }
      console.error("Error connecting to MetaMask:", err);
      return;
    }

    localStorage.setItem("userAccount", address);
    props.setAccount(address);
    props.setConnected(true);

    try {
      const storedUserInfo = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      );
      if (storedUserInfo.sub) {
        const response = await axios.post(
          "http://localhost:5000/api/association",
          {
            sub: storedUserInfo.sub,
            walletAddress: address,
          }
        );
        if (response.data.success) {
          console.log(
            `Associated sub: ${storedUserInfo.sub} with wallet: ${address}`
          );
        } else {
          console.log("Association already exists or failed.");
        }
      } else {
        console.log("No valid Fayda user info found for association.");
      }
    } catch (error) {
      console.error("Failed to save association:", error);
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const validToken = getValidIdToken();
      if (validToken) {
        console.log("Restoring session from stored token.");
        const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUserInfo(storedUserInfo);
        props.setLogged(true);
        return;
      }

      const query = new URLSearchParams(location.search);
      const code = query.get("code");

      if (code) {
        try {
          const response = await axios.post("http://localhost:5000/api/token", {
            code: code,
          });
          const { access_token, id_token } = response.data;

          const userInfoResponse = await axios.post(
            "http://localhost:5000/api/userinfo/",
            { access_token: access_token }
          );

          const decodedUserInfo = jose.decodeJwt(userInfoResponse.data);

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("id_token", id_token);
          localStorage.setItem("userInfo", JSON.stringify(decodedUserInfo));

          setUserInfo(decodedUserInfo);
          props.setLogged(true);

          navigate(location.pathname, { replace: true });
        } catch (error) {
          console.error("Error during token exchange:", error);
          navigate("/");
        }
      }
    };

    initializeAuth();
  }, [location, navigate, props]);

  useEffect(() => {
    getAllElectionData();
  }, []);

  const handleClick = (elec_id, CheckFinshed) => {
    if (CheckFinshed) {
      navigate(`/result?electionId=${elec_id}`);
    } else {
      navigate(`/endedElection?electionId=${elec_id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userAccount");
    props.setConnected(false);
    props.setLogged(false);
    navigate("/");
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getAllElectionData = async () => {
    console.log("i have call this much");
    setElections([]);
    setFinishedElections([]);
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const contractInstance = new ethers.Contract(
      ContractAddress,
      ContractAbi,
      Provider
    );
    const electionCountBN = await contractInstance.electionCount();
    const electionCount = electionCountBN.toNumber();
    console.log("Election count: ", electionCount);
    for (let index = 1; index <= electionCount; index++) {
      const currentElectionData = await contractInstance.getElection(index);

      const now = Math.floor(Date.now() / 1000);
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
    <div className="card user-dashboard-election-card">
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
          Number of candidates: {election.candidateCount}
        </p>
        <p className="card-text">
          <small className="text-muted">
            {isActive ? "Ends on: " : "Ended on: "}{" "}
            {formatTimestamp(election.electionEndTime)}
          </small>
        </p>
        <button
          className="btn btn-manage"
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
          <button
            className="logoutbtn"
            onClick={connectWithMetamask}
            disabled={props.connected}
          >
            <span>
              {props.account
                ? `${props.account.slice(0, 6)}...${props.account.slice(-4)}`
                : `Connect Wallet >`}
            </span>
          </button>
          <button className="logout" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>
        {!props.account && (
          <div
            className="alert alert-info mt-3 mb-4"
            style={{
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, #f7f8f9ff 0%, #edf1f5ff 100%)",
              color: "#2c3e50",
              fontWeight: "500",
              boxShadow: "0 2px 8px rgba(44,62,80,0.08)",
              textAlign: "center",
              padding: "16px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>
              <FaAngleRight style={{ marginRight: "8px", color: "#2980b9" }} />
              To participate in elections and make transactions, please connect
              your wallet address using the <b>Connect Wallet</b> button above.
            </span>
          </div>
        )}
        <h1 className="main-title">
          {activeView === "active" ? "Active Elections" : "Finished Elections"}
        </h1>
        <div className="user-dashboard-election-grid">
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

const decodeUserInfoResponse = async (userinfoJwtToken) => {
  try {
    return jose.decodeJwt(userinfoJwtToken);
  } catch (error) {
    console.error("Error decoding JWT user info:", error);
    return null;
  }
};

export default UserDashboard;
