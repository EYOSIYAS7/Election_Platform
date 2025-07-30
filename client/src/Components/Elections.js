import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import UserDashboard from "./userDashBoard";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaUsers,
  FaClipboardList,
  FaVoteYea,
  FaAngleRight,
} from "react-icons/fa";

const VotingHome = (props) => {
  const navigate = useNavigate();
  // Placeholder data

  async function connectWithMetamask() {
    if (window.ethereum) {
      const Provider = new ethers.providers.Web3Provider(window.ethereum);

      await Provider.send("eth_requestAccounts", []);
      const signer = Provider.getSigner();
      const address = await signer.getAddress();
      console.log("connected address: " + address);
      localStorage.setItem("userAccount", address);
      props.setAccount(address);
      props.setConnected(true);
      props.setLogged(true);
      // props.canVote();
    } else {
      console.log("Metamask is not detected in your browser");
    }
    // props.getCandidates();
  }
  // useEffect(() => {
  //   const savedAccount = localStorage.getItem("userAccount");
  //   if (savedAccount) {
  //     props.setAccount(savedAccount);
  //     props.setConnected(true);
  //     props.setLogged(true);
  //   }
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem("userAccount");
    props.setConnected(true);
    props.setLogged(true);
  };
 
  return (
    <div>
      {props.logged ? (
        navigate("/user-dashboard")
      ) : (
        <div className="voting-platform">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1>Secure Blockchain Voting Platform</h1>
              <p>
                Experience the next generation of democratic participation with our
                decentralized voting platform. Secure, transparent, and accessible.
              </p>
              <button className="connect-button" onClick={connectWithMetamask}>
                <span>Connect Wallet</span>
                <FaAngleRight />
              </button>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works">
            <div className="container">
              <h2>How It Works</h2>
              <div className="steps-container">
                <div className="step-card">
                  <div className="icon-wrapper">
                    <FaUsers className="step-icon" />
                  </div>
                  <h3>Connect Wallet</h3>
                  <p>Securely connect your MetaMask wallet to access the voting platform.</p>
                </div>

                <div className="step-card">
                  <div className="icon-wrapper">
                    <FaClipboardList className="step-icon" />
                  </div>
                  <h3>Select Election</h3>
                  <p>Browse active elections and choose the one you want to participate in.</p>
                </div>

                <div className="step-card">
                  <div className="icon-wrapper">
                    <FaVoteYea className="step-icon" />
                  </div>
                  <h3>Cast Your Vote</h3>
                  <p>Vote securely and transparently using blockchain technology.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default VotingHome;
