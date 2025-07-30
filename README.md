# Blockchain Based Election Platform
## Contributors
* Eyosiyas Mengesha
* Kidist Genene
* Elrohi Mamo
## Motivation
* Inspired by the Fayda Digital ID Hackathon and NEBE’s digital transformation for transparent and efficient elections.
* The National Election Board of Ethiopia (NEBE) is launching digital platforms for candidate registration and voter enrollment, supported by forums on tech-driven election modernization.
* Blockchain is recognized as one of the few key technologies underpinning Industry 5.0 in Ethiopia’s Digital Strategy 2030. This project directly supports that strategic vision.
- Our solution combines Fayda Digital ID with blockchain to:
  - Strengthen digital governance
  - Improve trust and transparency
## Problem Statement
Ethiopia faces challenges in conducting transparent, secure, and efficient national elections. Traditional voting systems often encounter voter fraud, accessibility barriers, delays in vote counting, and a lack of public trust in results. With millions of citizens, ensuring fair participation while maintaining privacy and data integrity remains a critical problem.
## Planned Solution
The blockchain based election platform integrated with Fayda Digital ID will have the following features:

* Decentralized Voting: Immutable, tamper-proof vote recording.
* Fayda Digital ID Verification: Only verified citizens can vote.
* Audit Trails: Real-time, transparent election monitoring.
* Smart Contracts: Automated vote counting and eligibility checks.
## Expected Outcome
* An MVP that can handle multiple election runs, tamper proof vote casting, and automated result verification.
* Enhanced trust, transparency in Ethiopia’s electoral process.
* Auditable solution that NEBE and other institutions could adopt for future elections.
* Showcasing how digital identity (Fayda ID) and blockchain can revolutionize governance and democratic participation.
## Fayda's Role
Pseudonymity on public blockchains means accounts aren’t tied to real world identities, so a single user can create multiple wallets addresses and cast multiple votes, enabling Sybil attacks that distort election outcomes. To prevent this, we’ll integrate Fayda’s authentication and authorization service as an off‑chain identity verifier: every voter must first authenticate through Fayda, which confirms their uniqueness and eligibility before they’re allowed to submit a vote on‑chain, ensuring truly “one person, one vote.”
## Tech Stack
The application is built using the following technologies:

### Frontend:

* **React**: For building user interfaces.

* **Ethers.j**s: For interacting with blockchain.

* **Vite**: For fast development and bundling.

### Backend:

* **Node.js**: runtime environment.
  
* **Express.js**: framework for Node.js.
  
* **VeriFayda**: authentication and authorization prvider

### Blockchain & Smart Contracts:

* **Solidity**: For smart contracts.
  
* **Hardhat**: For compiling, deploying, testing, and debugging smart contracts.
  
* **Sepolia Testnet**: The public Ethereum test network used for deployment.
