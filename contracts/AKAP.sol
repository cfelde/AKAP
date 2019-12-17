// Copyright (C) 2019  Christian Felde
// Copyright (C) 2019  Mohamed Elshami

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

pragma solidity ^0.5.0;

import "./IAKAP.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract AKAP is IAKAP, ERC721Full {
    struct Node {
        uint parentId;
        uint expiry;
        uint seeAlso;
        address seeAddress;
        bytes nodeBody;
    }

    enum ClaimCase {RECLAIM, NEW, TRANSFER}
    enum NodeAttribute {EXPIRY, SEE_ALSO, SEE_ADDRESS, NODE_BODY, TOKEN_URI}

    event Claim(address indexed sender, uint indexed nodeId, uint indexed parentId, bytes label, ClaimCase claimCase);
    event AttributeChanged(address indexed sender, uint indexed nodeId, NodeAttribute attribute);

    mapping(uint => Node) public nodes;

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
        // Claim logic is as follows:

        // Case 1:
        // A node that does exist can be extended if the _msgSender() is the owner of nodeId.

        // Case 2:
        // A node that does not exist can be claimed if the _msgSender() is the owner of parentId.
        // If parentId is the special case 0x0, you can consider the _msgSender() as the "owner" of parentId.

        // Case 3:
        // A node that does exists but is expired will be transferred to the new _msgSender(). This still
        // assumed that the _msgSender() is the parentId owner, including special case 0x0 as above.

        // Get hash/id of the node caller is claiming
        uint nodeId = hashOf(parentId, label);

        bool isParentOwner = parentId == 0x0 || _isApprovedOrOwner(_msgSender(), parentId);

        if (_exists(nodeId) && _isApprovedOrOwner(_msgSender(), nodeId)) {
            // Caller is current owner/approved, extend lease..
            nodes[nodeId].expiry = now + 52 weeks;
            emit Claim(_msgSender(), nodeId, parentId, label, ClaimCase.RECLAIM);

            return 1;
        } else if (!_exists(nodeId) && isParentOwner) {
            // Node does not exist, allocate to caller..
            _mint(_msgSender(), nodeId);
            nodes[nodeId].parentId = parentId;
            nodes[nodeId].expiry = now + 52 weeks;
            emit Claim(_msgSender(), nodeId, parentId, label, ClaimCase.NEW);

            return 2;
        } else if (_exists(nodeId) && nodes[nodeId].expiry < now && isParentOwner) {
            // Node exists and is expired, allocate to caller and extend lease..
            _transferFrom(ownerOf(nodeId), _msgSender(), nodeId);
            nodes[nodeId].expiry = now + 52 weeks;
            emit Claim(_msgSender(), nodeId, parentId, label, ClaimCase.TRANSFER);

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

    function expireNode(uint nodeId) external onlyApproved(nodeId) {
        nodes[nodeId].expiry = now;
        emit AttributeChanged(_msgSender(), nodeId, NodeAttribute.EXPIRY);
    }

    function setSeeAlso(uint nodeId, uint value) external onlyApproved(nodeId) {
        nodes[nodeId].seeAlso = value;
        emit AttributeChanged(_msgSender(), nodeId, NodeAttribute.SEE_ALSO);
    }

    function setSeeAddress(uint nodeId, address value) external onlyApproved(nodeId) {
        nodes[nodeId].seeAddress = value;
        emit AttributeChanged(_msgSender(), nodeId, NodeAttribute.SEE_ADDRESS);
    }

    function setNodeBody(uint nodeId, bytes calldata value) external onlyApproved(nodeId) {
        nodes[nodeId].nodeBody = value;
        emit AttributeChanged(_msgSender(), nodeId, NodeAttribute.NODE_BODY);
    }

    function setTokenURI(uint nodeId, string calldata uri) external onlyApproved(nodeId) {
        _setTokenURI(nodeId, uri);
        emit AttributeChanged(_msgSender(), nodeId, NodeAttribute.TOKEN_URI);
    }
}