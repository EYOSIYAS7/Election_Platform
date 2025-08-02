import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const AdminLogin = (props) => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [adminAcc, setAdminAccount] = useState(null);

  console.log("Allowed account ", process.env.REACT_APP_ALLOWED_ACCOUNT);
  const allowedAccount = "0x318b777AaA821f97C9B8AD1A5874F989CCf8C35f";

  async function connectWithMetamask() {
    if (window.ethereum) {
      const Provider = new ethers.providers.Web3Provider(window.ethereum);

      try {
        await Provider.send("eth_requestAccounts", []);
        const signer = Provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected address: " + address);

        if (address === allowedAccount) {
          localStorage.setItem("adminAccount", address);
          setIsConnecting(true);
          setErrorMessage(""); // Persist admin login
        } else {
          setIsConnecting(false);
          setErrorMessage("You are not allowed to login.");
        }

        // // Listen for account changes
        // window.ethereum.on("accountsChanged", handleAccountChange);
      } catch (error) {
        console.error("Failed to connect to Metamask:", error);
        setErrorMessage("Failed to connect to Metamask.");
      }
    } else {
      console.log("Metamask is not detected in your browser");
      setErrorMessage("Metamask is not detected in your browser.");
    }
    // props.getCandidates();
  }

  function handleAdminAccountChange(accounts) {
    // If the account array is empty, the user has disconnected
    if (accounts.length === 0) {
      setErrorMessage("No account connected.");
      setIsConnecting(false);
      // navigate("/admin");
      return;
    }

    const newAddress = accounts[0];
    const storedAdminAccount = localStorage.getItem("adminAccount");
    console.log("Account switched to:", newAddress);

    // Check if the new address is allowed
    if (newAddress === allowedAccount) {
      localStorage.setItem("adminAccount", newAddress);
      console.log("is this runnig");
      setIsConnecting(true);
      // Redirect to admin login
    } else {
      setErrorMessage("You are not allowed to login.");
      console.log("is this runnig inthe else");
      setIsConnecting(false);
      // navigate("/admin");
    }
  }

  return (
    <div>
      {isConnecting ? (
        navigate("/admin-dashboard")
      ) : (
        <div className="admin-login-dapp-container">
          <div className="admin-login-image-section">
            <div className="admin-login-image-overlay"></div>
          </div>
          <div className="admin-login-dapp-card">
            <div className="admin-login-dapp-header">
              <h2 className="admin-login-dapp-title">Admin Portal</h2>
            </div>
            <button
              className="admin-login-dapp-btn-metamask"
              onClick={connectWithMetamask}
            >
              <FaWallet /> Connect with MetaMask
            </button>
            {errorMessage && (
              <div
                style={{
                  color: "#ff3b30",
                  padding: "12px 16px",

                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginTop: "16px",
                  textAlign: "center",

                  backdropFilter: "blur(8px)",
                }}
              >
                {errorMessage}
              </div>
            )}
            <p className="admin-login-dapp-note">
              Ensure you have MetaMask installed and unlocked to proceed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
