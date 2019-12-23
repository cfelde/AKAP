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

/**
 * @title  Interface for AKA Protocol Registry (akap.me)
 *
 * @author Christian Felde
 * @author Mohamed Elshami
 *
 * @notice This interface defines basic meta data operations in addition to hashOf and claim functions on AKAP nodes.
 * @dev    Functionality related to the ERC-721 nature of nodes also available on AKAP, like transferFrom(..), etc.
 */
contract IAKAP {
    /**
     * @dev Calculate the hash of a parentId and node label.
     *
     * @param parentId Hash value of parent ID
     * @param label Label of node
     * @return Hash ID of node
     */
    function hashOf(uint parentId, bytes memory label) public pure returns (uint id);

    /**
     * @dev Claim or reclaim a node identified by the given parent ID hash and node label.
     *
     * There are 4 potential return value outcomes:
     *
     * 0: No action taken. This is the default if msg.sender does not have permission to act on the specified node.
     * 1: An existing node already owned by msg.sender was reclaimed.
     * 2: Node did not previously exist and is now minted and allocated to msg.sender.
     * 3: An existing node already exist but was expired. Node ownership transferred to msg.sender.
     *
     * If msg.sender is not the owner but is instead approved "spender" of node, the same logic applies. Only on
     * case 2 and 3 does msg.sender become owner of the node. On case 1 only the expiry is updated.
     *
     * Whenever the return value is non-zero, the expiry of the node as been set to 52 weeks into the future.
     *
     * @param parentId Hash value of parent ID
     * @param label Label of node
     * @return Returns one of the above 4 outcomes
     */
    function claim(uint parentId, bytes calldata label) external returns (uint status);

    /**
     * @dev Return parent hash ID for given node ID.
     *
     * @param nodeId Node hash ID
     * @return Parent hash ID
     */
    function parentOf(uint nodeId) external view returns (uint);

    /**
     * @dev Return expiry timestamp for given node ID.
     *
     * @param nodeId Node hash ID
     * @return Expiry timestamp as seconds since unix epoch
     */
    function expiryOf(uint nodeId) external view returns (uint);

    /**
     * @dev Return "see also" value for given node ID.
     *
     * @param nodeId Node hash ID
     * @return "See also" value
     */
    function seeAlso(uint nodeId) external view returns (uint);

    /**
     * @dev Return "see address" value for given node ID.
     *
     * @param nodeId Node hash ID
     * @return "See address" value
     */
    function seeAddress(uint nodeId) external view returns (address);

    /**
     * @dev Return "node body" value for given node ID.
     *
     * @param nodeId Node hash ID
     * @return "Node body" value
     */
    function nodeBody(uint nodeId) external view returns (bytes memory);

    /**
     * @dev Return "token URI" value for given node ID.
     *
     * @param tokenId Node hash ID
     * @return "Token URI" value
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);

    /**
     * @dev Will immediately expire node on given node ID.
     *
     * An expired node will continue to function as any other node,
     * but is now available to be claimed by a new owner.
     *
     * @param nodeId Node hash ID
     */
    function expireNode(uint nodeId) external;

    /**
     * @dev Set "see also" value on given node ID.
     *
     * @param nodeId Node hash ID
     * @param value New "see also" value
     */
    function setSeeAlso(uint nodeId, uint value) external;

    /**
     * @dev Set "see address" value on given node ID.
     *
     * @param nodeId Node hash ID
     * @param value New "see address" value
     */
    function setSeeAddress(uint nodeId, address value) external;

    /**
     * @dev Set "node body" value on given node ID.
     *
     * @param nodeId Node hash ID
     * @param value New "node body" value
     */
    function setNodeBody(uint nodeId, bytes calldata value) external;

    /**
     * @dev Set "token URI" value on given node ID.
     *
     * @param nodeId Node hash ID
     * @param uri New "token URI" value
     */
    function setTokenURI(uint nodeId, string calldata uri) external;
}