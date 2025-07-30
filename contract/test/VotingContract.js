const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("Voting contract", function () {
  let Voting, Voting_;
  let owner, voter1, voter2;
  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    // Start deployment, returning a promise that resolves to a contract object
    Voting_ = await Voting.deploy();
    [owner, voter1, voter2] = await ethers.getSigners();
    const transactionResponse = await Voting_.addElection(
      "President Election",
      123456
    );
    await transactionResponse.wait(1);
    const currentElectionCount = await Voting_.electionCount();
    const txnResponse = await Voting_.addCandidate(
      currentElectionCount,
      "Jhon"
    );
    await txnResponse.wait(1);
  });

  it("it should return the added election", async function () {
    const currentElectionCount = await Voting_.electionCount();

    assert.equal(currentElectionCount, 1);
  });
  it("should return the added candidates to specified election", async function () {
    const currentElectionCount = await Voting_.electionCount();
    const candidateResponse = await Voting_.getCandidate(currentElectionCount);
    console.log("this is the candidate", candidateResponse);
    assert.equal(candidateResponse[1][0], "Jhon");
  });
  it("should cast vote successfully", async () => {
    const currentElectionCount = await Voting_.electionCount();
    const candidateId = 1;
    const transactionResponse = await Voting_.connect(voter1).vote(
      currentElectionCount,
      candidateId
    );
    const candidateResponse = await Voting_.getCandidate(currentElectionCount);
    await transactionResponse.wait(1);
    assert.equal(candidateResponse[2][0].toNumber(), 1);

    await expect(
      Voting_.connect(voter1).vote(currentElectionCount, candidateId)
    ).to.be.revertedWith("You have already voted in this election.");
  });
  it("should revert if voting for an invalid candidate", async function () {
    const electionId = 1;
    const invalidCandidateId = 999; // Invalid candidate

    await expect(
      Voting_.connect(voter1).vote(electionId, invalidCandidateId)
    ).to.be.revertedWith("Invalid candidate index.");
  });
  it("should return all the election data", async function () {
    const currentElectionCount = await Voting_.electionCount();
    const electionData = await Voting_.getElection(currentElectionCount);

    assert.equal(electionData[1], "President Election");
    assert.equal(electionData[3], "123456");
  });
});
