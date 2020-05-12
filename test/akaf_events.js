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

const {expectEvent} = require('@openzeppelin/test-helpers');

const akaf = artifacts.require("AKAF");

contract("When testing AKAF events, it:", async accounts => {

    it("should emit a Claim event of type ClaimCase.NEW when an owner claims a node with special case parent", async () => {
        // This is a case 2 test with special case parent..
        let instance = await akaf.deployed();
        let nodeHash = await instance.hashOf(0x0, [0x1]);

        let receipt = await instance.claim(0x0, [0x1]);

        let args = {
            sender: accounts[0].toString(),
            nodeId: nodeHash.toString(),
            parentId: "0",
            label: "0x01",
            claimCase: "1"
        };
        await expectEvent.inLogs(receipt.logs, "Claim", args);
    });

    it("should emit a Claim of type ClaimCase.RECLAIM event when owner claim existing node with special case parent", async () => {
        // This is a case 1 test with special case parent..
        let instance = await akaf.deployed();
        let nodeHash = await instance.hashOf(0x0, [0x1]);

        let receipt = await instance.claim(0x0, [0x1]);
        let args = {
            sender: accounts[0].toString(),
            nodeId: nodeHash.toString(),
            parentId: "0",
            label: "0x01",
            claimCase: "0"
        };
        await expectEvent.inLogs(receipt.logs, "Claim", args);
    });

    it("should emit a Claim event of type ClaimCase.NEW when an owner claims a node with non-special case parent", async () => {
        // This is a case 2 test with non-special case parent..
        let instance = await akaf.deployed();
        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x1]);

        let receipt = await instance.claim(parentHash, [0x1]);

        let args = {
            sender: accounts[0].toString(),
            nodeId: nodeHash.toString(),
            parentId: parentHash.toString(),
            label: "0x01",
            claimCase: "1"
        };
        await expectEvent.inLogs(receipt.logs, "Claim", args);
    });

    it("should emit a Claim of type ClaimCase.RECLAIM event when owner claim existing node with non-special case parent", async () => {
        // This is a case 1 test with non-special case parent..
        let instance = await akaf.deployed();
        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x1]);

        let receipt = await instance.claim(parentHash, [0x1]);
        let args = {
            sender: accounts[0].toString(),
            nodeId: nodeHash.toString(),
            parentId: parentHash.toString(),
            label: "0x01",
            claimCase: "0"
        };
        await expectEvent.inLogs(receipt.logs, "Claim", args);
    });

    it("should emit a Claim of type ClaimCase.TRANSFER event when new owner claim existing node on special case owner", async () => {
        // Test case 3 emits ClaimCase.TRANSFER event with special case parent..
        let instance = await akaf.deployed();
        let nodeHash = await instance.hashOf(0x0, [0x2]);

        await instance.claim(0x0, [0x2]);
        await instance.transferFrom(accounts[0], accounts[1], nodeHash);

        let receipt = await instance.claim(0x0, [0x2]);
        assert.equal(0, receipt.logs.length, "No events should be emitted, expect empty logs.");

        await instance.expireNode(nodeHash, {from: accounts[1]});

        receipt = await instance.claim(0x0, [0x2]);

        let args = {
            sender: accounts[0].toString(),
            nodeId: nodeHash.toString(),
            parentId: "0",
            label: "0x02",
            claimCase: "2"
        };
        await expectEvent.inLogs(receipt.logs, "Claim", args);
    });

    it("should emit a Claim of type ClaimCase.TRANSFER event when new owner claim existing node on non-special case owner", async () => {
        // Test case 3 emits ClaimCase.TRANSFER event with non-special case parent..
        let instance = await akaf.deployed();
        let parentHash = await instance.hashOf(0x0, [0x2])
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        await instance.claim(parentHash, [0x2]);
        await instance.transferFrom(accounts[0], accounts[1], nodeHash);

        let receipt = await instance.claim(parentHash, [0x2]);
        assert.equal(0, receipt.logs.length, "No events should be emitted, expect empty logs.");

        await instance.expireNode(nodeHash, {from: accounts[1]});

        receipt = await instance.claim(parentHash, [0x2]);

        let args = {
            sender: accounts[0].toString(),
            nodeId: nodeHash.toString(),
            parentId: parentHash.toString(),
            label: "0x02",
            claimCase: "2"
        };
        await expectEvent.inLogs(receipt.logs, "Claim", args);
    });

    it("should emit AttributeChanged event when a node attribute is updated with special case parent", async () => {
        let instance = await akaf.deployed();
        let nodeHash = await instance.hashOf(0x0, [0x1]);

        let receipt = await instance.expireNode(nodeHash);
        let args = {sender: accounts[0].toString(), nodeId: nodeHash.toString(), attribute: "0"}; // NodeAttribute.EXPIRY
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setSeeAlso(nodeHash, 0x1);
        args["attribute"] = "1"; // NodeAttribute.SEE_ALSO
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setSeeAddress(nodeHash, accounts[1]);
        args["attribute"] = "2"; // NodeAttribute.SEE_ADDRESS
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setNodeBody(nodeHash, [0x1, 0x2, 0x3]);
        args["attribute"] = "3"; // NodeAttribute.NODE_BODY
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setTokenURI(nodeHash, "akaf://abc");
        args["attribute"] = "4"; // NodeAttribute.TOKEN_URI
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);
    });

    it("should emit AttributeChanged event when a node attribute is updated with non-special case parent", async () => {
        let instance = await akaf.deployed();
        let parentHash = await instance.hashOf(0x0, [0x2]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        let receipt = await instance.expireNode(nodeHash);
        let args = {sender: accounts[0].toString(), nodeId: nodeHash.toString(), attribute: "0"}; // NodeAttribute.EXPIRY
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setSeeAlso(nodeHash, 0x1);
        args["attribute"] = "1"; // NodeAttribute.SEE_ALSO
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setSeeAddress(nodeHash, accounts[1]);
        args["attribute"] = "2"; // NodeAttribute.SEE_ADDRESS
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setNodeBody(nodeHash, [0x1, 0x2, 0x3]);
        args["attribute"] = "3"; // NodeAttribute.NODE_BODY
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);

        receipt = await instance.setTokenURI(nodeHash, "akaf://abc");
        args["attribute"] = "4"; // NodeAttribute.TOKEN_URI
        await expectEvent.inLogs(receipt.logs, "AttributeChanged", args);
    });

});
