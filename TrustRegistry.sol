// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TrustRegistry {
    struct Record {
        address owner;
        string ipfsHash;
        uint256 timestamp;
    }

    mapping(address => Record) public records;

    event Registered(address indexed who, string ipfsHash, uint256 timestamp);
    event Updated(address indexed who, string ipfsHash, uint256 timestamp);

    function register(string calldata ipfsHash) external {
        require(records[msg.sender].owner == address(0), "already registered");
        records[msg.sender] = Record(msg.sender, ipfsHash, block.timestamp);
        emit Registered(msg.sender, ipfsHash, block.timestamp);
    }

    function update(string calldata ipfsHash) external {
        require(records[msg.sender].owner == msg.sender, "not owner");
        records[msg.sender].ipfsHash = ipfsHash;
        records[msg.sender].timestamp = block.timestamp;
        emit Updated(msg.sender, ipfsHash, block.timestamp);
    }

    function get(address who) external view returns (Record memory) {
        return records[who];
    }
}
