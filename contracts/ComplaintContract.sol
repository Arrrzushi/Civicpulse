// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ComplaintContract {
    struct Complaint {
        string title;
        string description;
        string evidenceHash;
        address submitter;
        uint256 timestamp;
    }

    Complaint[] public complaints;
    mapping(address => uint256[]) public userComplaints;

    event ComplaintSubmitted(uint256 indexed id, address indexed submitter);

    function submitComplaint(
        string memory _title,
        string memory _description,
        string memory _evidenceHash
    ) public {
        complaints.push(Complaint({
            title: _title,
            description: _description,
            evidenceHash: _evidenceHash,
            submitter: msg.sender,
            timestamp: block.timestamp
        }));

        uint256 complaintId = complaints.length - 1;
        userComplaints[msg.sender].push(complaintId);
        
        emit ComplaintSubmitted(complaintId, msg.sender);
    }

    function getComplaint(uint256 _id) public view returns (Complaint memory) {
        require(_id < complaints.length, "Complaint does not exist");
        return complaints[_id];
    }

    function getUserComplaints(address _user) public view returns (uint256[] memory) {
        return userComplaints[_user];
    }

    function getComplaintCount() public view returns (uint256) {
        return complaints.length;
    }
}
