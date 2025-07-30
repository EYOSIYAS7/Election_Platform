// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    constructor() {
        // <——— Has 0 arguments
    }

    Candidate[] public candidates;

    struct Election {
        uint id;
        string name;
        mapping(uint => Candidate) candidates;
        uint candidateCount;
        uint electionEndTime;
    }

    mapping(address => mapping(uint => bool)) public voters;
    mapping(uint => Election) public elections;
    uint public electionCount;

    // Add an event to log new elections
    // Add an event to log new elections
    event ElectionCreated(uint electionId, string name, uint endTime);

    // Add an event to log new candidates
    event CandidateAdded(
        uint electionId,
        uint candidateId,
        string candidateName
    );

    // Add an event for vote casting
    event Voted(uint electionId, uint candidateId);

    function addElection(string memory _name, uint endTime) public {
        electionCount++;
        elections[electionCount].id = electionCount;
        elections[electionCount].name = _name;
        elections[electionCount].candidateCount = 0;
        elections[electionCount].electionEndTime = endTime;
        emit ElectionCreated(electionCount, _name, endTime);
    }

    function addCandidate(
        uint _electionId,
        string memory _candidateName
    ) public {
        Election storage election = elections[_electionId];
        election.candidateCount++;
        election.candidates[election.candidateCount] = Candidate(
            election.candidateCount,
            _candidateName,
            0
        );

        emit CandidateAdded(
            _electionId,
            election.candidateCount,
            _candidateName
        );
    }

    function vote(uint _electionId, uint _candidateId) public {
        require(
            !voters[msg.sender][_electionId],
            "You have already voted in this election."
        );

        Election storage election = elections[_electionId];

        require(
            _candidateId > 0 && _candidateId <= election.candidateCount,
            "Invalid candidate index."
        );

        election.candidates[_candidateId].voteCount++;
        // we make the voting status to true
        voters[msg.sender][_electionId] = true;

        emit Voted(_electionId, _candidateId);
    }

    function getCandidate(
        uint _electionId
    )
        public
        view
        returns (
            uint[] memory ids,
            string[] memory names,
            uint[] memory voteCounts
        )
    {
        Election storage election = elections[_electionId];
        uint totalCandidates = election.candidateCount;

        // Create memory arrays to hold the candidate data
        ids = new uint[](totalCandidates);
        names = new string[](totalCandidates);
        voteCounts = new uint[](totalCandidates);

        for (uint i = 1; i <= totalCandidates; i++) {
            Candidate storage candidate = election.candidates[i];
            ids[i - 1] = candidate.id;
            names[i - 1] = candidate.name;
            voteCounts[i - 1] = candidate.voteCount;
        }

        return (ids, names, voteCounts);
    }

    // Example getter function to retrieve Election details
    function getElection(
        uint _electionId
    ) public view returns (uint, string memory, uint, uint) {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.name,
            election.candidateCount,
            election.electionEndTime
        );
    }
}
