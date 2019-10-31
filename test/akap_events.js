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

const { expectEvent, BN } = require('@openzeppelin/test-helpers');

const akap = artifacts.require("AKAP");

contract("When testing AKAP, it:", async accounts => {

    it("Should emit Claim event when an owner claims a root node", async () => {
        // This is a case 2 test with special case parent..
        let instance = await akap.deployed();
        let nodeHash = await instance.hashOf(0x0, [0x1]);

        let receipt  = await instance.claim(0x0, [0x1]);

        let args = { sender: accounts[0].toString(), nodeId: nodeHash.toString(), parentId: "0", label: "0x01" };
        await expectEvent.inLogs( receipt.logs, "Claim", args );
    });

    it("should emit a Reclaim event when owners relcaim existing node", async () => {
        // This is a case 1 test with special case parent..
        let instance = await akap.deployed();
        let nodeHash = await instance.hashOf(0x0, [0x1]);

        let receipt  = await instance.claim(0x0, [0x1]);
        let args = { sender: accounts[0].toString(), nodeId: nodeHash.toString(), parentId: "0", label: "0x01" };
        await expectEvent.inLogs( receipt.logs, "Reclaim", args );
    });

    it("should emit AttributeChanged event when a node attribute is updated", async () => {
         let instance = await akap.deployed();
         let nodeHash = await instance.hashOf(0x0, [0x1]);

         let receipt = await instance.setSeeAlso(nodeHash, 0x1);
         let args = { sender: accounts[0].toString(), nodeId: nodeHash.toString(), attribute: "1" }; // NodeAttribute.SEE_ALSO
         await expectEvent.inLogs( receipt.logs, "AttributeChanged", args );

         receipt = await instance.setSeeAddress(nodeHash, accounts[1]);
         args["attribute"] = "2"; // NodeAttribute.SEE_ADDRESS
         await expectEvent.inLogs( receipt.logs, "AttributeChanged", args );

         receipt = await instance.setNodeBody(nodeHash, [0x1, 0x2, 0x3]);
         args["attribute"] = "3"; // NodeAttribute.NODE_BODY
         await expectEvent.inLogs( receipt.logs, "AttributeChanged", args );

         receipt = await instance.setTokenURI(nodeHash, "akap://abc");
         args["attribute"] = "4"; // NodeAttribute.TOKEN_URI
         await expectEvent.inLogs( receipt.logs, "AttributeChanged", args );
     });

});
