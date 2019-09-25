pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract AKAP is ERC721Full {
    struct Node {
        uint parentId;
        uint expiry;
        uint seeAlso;
        address seeAddress;
        bytes nodeBody;
    }

    mapping (uint => Node) public nodes;

    constructor() ERC721Full("AKA Protocol Registry", "AKAP") public {}

    function _msgSender() internal view returns (address payable) {
        return msg.sender;
    }

    modifier onlyExisting(uint nodeId) {
        require(_exists(nodeId), "AKAP: operator query for nonexistent node");

        _;
    }

    modifier onlyApproved(uint nodeId) {
        require(_exists(nodeId) && _isApprovedOrOwner(_msgSender(), nodeId), "AKAP: set value caller is not owner nor approved");

        _;
    }

    function hashOf(uint parentId, bytes memory label) public pure returns (uint id) {
        require(label.length >= 1 && label.length <= 32);

        bytes32 labelHash = keccak256(label);
        bytes32 nodeId = keccak256(abi.encode(parentId, labelHash));

        return uint(nodeId);
    }

    function claim(uint parentId, bytes calldata label) external returns (uint status) {
        // Make sure parent is the special root parent or caller is owner of/approved on parent
        require(parentId == 0x0 || _isApprovedOrOwner(_msgSender(), parentId), "AKAP: invalid parent ownership");

        // Get hash/id of the node caller is claiming
        uint nodeId = hashOf(parentId, label);

        if (_exists(nodeId) && _isApprovedOrOwner(_msgSender(), nodeId)) {
            // Caller is current owner/approved, extend lease..
            nodes[nodeId].expiry = now + 52 weeks;

            return 1;
        } else if (!_exists(nodeId)) {
            // Node does not exist, allocate to caller..
            _mint(_msgSender(), nodeId);
            nodes[nodeId].expiry = now + 52 weeks;

            return 2;
        } else if (nodes[nodeId].expiry < now) {
            // Node exists and is expired, allocate to caller and extend lease..
            _transferFrom(ownerOf(nodeId), _msgSender(), nodeId);
            nodes[nodeId].expiry = now + 52 weeks;

            return 3;
        }

        // No action
        return 0;
    }

    function parentOf(uint nodeId) external view onlyExisting(nodeId) returns (uint) {
        return nodes[nodeId].parentId;
    }

    function expiryOf(uint nodeId) external view onlyExisting(nodeId) returns (uint) {
        return nodes[nodeId].expiry;
    }

    function seeAlso(uint nodeId) external view onlyExisting(nodeId) returns (uint) {
        return nodes[nodeId].seeAlso;
    }

    function seeAddress(uint nodeId) external view onlyExisting(nodeId) returns (address) {
        return nodes[nodeId].seeAddress;
    }

    function nodeBody(uint nodeId) external view onlyExisting(nodeId) returns (bytes memory) {
        return nodes[nodeId].nodeBody;
    }

    function setSeeAlso(uint nodeId, uint value) external onlyApproved(nodeId) {
        nodes[nodeId].seeAlso = value;
    }

    function setSeeAddress(uint nodeId, address value) external onlyApproved(nodeId) {
        nodes[nodeId].seeAddress = value;
    }

    function setNodeBody(uint nodeId, bytes calldata value) external onlyApproved(nodeId) {
        nodes[nodeId].nodeBody = value;
    }
}