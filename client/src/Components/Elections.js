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
  const generateSignInUrl = () => {
    const params = new URLSearchParams({
      client_id: process.env.REACT_APP_CLIENT_ID,
      redirect_uri: process.env.REACT_APP_REDIRECT_URI,
      response_type: "code",
      scope: "openid profile email",
      acr_values:
        "mosip:idp:acr:generated-code mosip:idp:acr:linked-wallet mosip:idp:acr:biometrics",
      claims:
        '{"userinfo":{"name":{"essential":true},"phone":{"essential":true},"email":{"essential":true},"picture":{"essential":true},"gender":{"essential":true},"birthdate":{"essential":true},"address":{"essential":true}},"id_token":{}}',
      code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
      code_challenge_method: "S256",
      display: "page",
      nonce: "g4DEuje5Fx57Vb64dO4oqLHXGT8L8G7g",
      state: "ptOO76SD",
      ui_locales: "en",
    });

    console.log(
      "Generated Sign-In URL:",
      `${process.env.REACT_APP_AUTHORIZATION_ENDPOINT}?${params.toString()}`
    );
    return `${
      process.env.REACT_APP_AUTHORIZATION_ENDPOINT
    }?${params.toString()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("userAccount");
    props.setConnected(true);
    props.setLogged(true);
  };

  return (
    <div>
      {/* {props.logged ? (
        navigate("/user-dashboard")
      ) : ( */}
      <div className="voting-platform">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Secure Blockchain Election Platform</h1>
            <p>
              Experience the next generation of democratic participation with
              our decentralized election platform. Secure, transparent, and
              accessible.
            </p>
            {/* <a
              href="/callback"
              className="connect-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginRight: "10px",
              }}
            >
              <span>Sign In</span>
              <FaAngleRight />
            </a> */}
            <a
              href={generateSignInUrl()}
              className="connect-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginRight: "10px",
              }}
            >
              <span>Sign up with Fayda E-Signet</span>
              <FaAngleRight />
            </a>
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
                <p>
                  Securely connect your MetaMask wallet to access the voting
                  platform.
                </p>
              </div>

              <div className="step-card">
                <div className="icon-wrapper">
                  <FaClipboardList className="step-icon" />
                </div>
                <h3>Select Election</h3>
                <p>
                  Browse active elections and choose the one you want to
                  participate in.
                </p>
              </div>

              <div className="step-card">
                <div className="icon-wrapper">
                  <FaVoteYea className="step-icon" />
                </div>
                <h3>Cast Your Vote</h3>
                <p>
                  Vote securely and transparently using blockchain technology.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* )} */}
    </div>
  );
};

export default VotingHome;
