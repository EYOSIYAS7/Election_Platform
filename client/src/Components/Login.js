import React from "react";
import { ethers } from "ethers";

// import { ContractAbi, ContractAddress } from "./Constant/constant";

const Login = (props) => {
  async function connectWithMetamask() {
    if (window.ethereum) {
      const Provider = new ethers.providers.Web3Provider(window.ethereum);

      await Provider.send("eth_requestAccounts", []);
      const signer = Provider.getSigner();
      const address = await signer.getAddress();
      console.log("connected address: " + address);
      props.setAccount(address);
      props.setConnected(true);
      props.canVote();
    } else {
      console.log("Metamask is not detected in your browser");
    }
    props.getCandidates();
  }
  return (
    <div className="loginPage">
      <div className="login-container">
        <h1 className="welcome-message">Decentralized Voting Dapp</h1>
        <small className="small-text">
          connect your wallet to start using platform. Make sure to that
          metamask is installed{" "}
        </small>
        <button className="login-button" onClick={connectWithMetamask}>
          connect with Metamask
        </button>
      </div>
    </div>
  );
};

export default Login;
