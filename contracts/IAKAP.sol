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

contract IAKAP {
    function hashOf(uint parentId, bytes memory label) public pure returns (uint id);

    function claim(uint parentId, bytes calldata label) external returns (uint status);

    function parentOf(uint nodeId) external view returns (uint);

    function expiryOf(uint nodeId) external view returns (uint);

    function seeAlso(uint nodeId) external view returns (uint);

    function seeAddress(uint nodeId) external view returns (address);

    function nodeBody(uint nodeId) external view returns (bytes memory);

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function expireNode(uint nodeId) external;

    function setSeeAlso(uint nodeId, uint value) external;

    function setSeeAddress(uint nodeId, address value) external;

    function setNodeBody(uint nodeId, bytes calldata value) external;

    function setTokenURI(uint nodeId, string calldata uri) external;
}