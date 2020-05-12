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

const {expectRevert} = require('@openzeppelin/test-helpers');

const akaf = artifacts.require("AKAF");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

contract("When testing AKAF, it:", async accounts => {

    it("should be possible to claim a node on special case root parent id", async () => {
        // This is a case 2 test with special case parent..
        let instance = await akaf.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        await expectRevert(instance.ownerOf(nodeHash), "ERC721: owner query for nonexistent token");
        await expectRevert(instance.parentOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.expiryOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAlso(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAddress(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.nodeBody(nodeHash), "AKAP: operator query for nonexistent node");

        assert.isFalse(await instance.exists(nodeHash));

        await instance.claim(0x0, [0x1]);

        assert.isTrue(await instance.exists(nodeHash));

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        assert.isTrue(await instance.isApprovedOrOwner(nodeHash));
        assert.isFalse(await instance.isApprovedOrOwner(nodeHash, {from: accounts[1]}));
        assert.equal(0x0, await instance.parentOf(nodeHash));
        assert.isTrue(await instance.expiryOf(nodeHash) > 0);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should only be possible for the root owner to claim new root node children", async () => {
        let instance = await akaf.deployed();

        let parentHash = 0x0;
        let nodeHash = await instance.hashOf(parentHash, [0x5]);

        await expectRevert(instance.ownerOf(nodeHash), "ERC721: owner query for nonexistent token");
        await expectRevert(instance.parentOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.expiryOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAlso(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAddress(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.nodeBody(nodeHash), "AKAP: operator query for nonexistent node");

        await instance.claim(parentHash, [0x5], {from: accounts[5]});

        await expectRevert(instance.ownerOf(nodeHash), "ERC721: owner query for nonexistent token");
        await expectRevert(instance.parentOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.expiryOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAlso(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAddress(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.nodeBody(nodeHash), "AKAP: operator query for nonexistent node");

        await instance.setApprovalForAll(accounts[5], true);
        await instance.claim(parentHash, [0x5], {from: accounts[5]});

        assert.equal(accounts[5], await instance.ownerOf(nodeHash));
        assert.equal(0x0, await instance.parentOf(nodeHash));
        assert.isTrue(await instance.expiryOf(nodeHash) > 0);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should be possible to claim a node on another owned node", async () => {
        // This is a case 2 test with non-special parent case..
        let instance = await akaf.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        await expectRevert(instance.ownerOf(nodeHash), "ERC721: owner query for nonexistent token");
        await expectRevert(instance.parentOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.expiryOf(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAlso(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.seeAddress(nodeHash), "AKAP: operator query for nonexistent node");
        await expectRevert(instance.nodeBody(nodeHash), "AKAP: operator query for nonexistent node");

        await instance.claim(parentHash, [0x2]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        assert.isTrue(parentHash.eq(await instance.parentOf(nodeHash)));
        assert.isTrue(await instance.expiryOf(nodeHash) > 0);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should be possible for owners of node to reclaim an existing node", async () => {
        // This is a case 1 test with special case parent..
        let instance = await akaf.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(0x0, [0x1]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        assert.equal(0x0, await instance.parentOf(nodeHash));
        assert.isTrue((await instance.expiryOf(nodeHash)).toString(10) === existingExpiry.toString(10));

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should be possible for owners of node to reclaim an existing node with non-special case parent", async () => {
        // This is a case 1 test with non-special parent case..
        let instance = await akaf.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(parentHash, [0x2]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        assert.isTrue(parentHash.eq(await instance.parentOf(nodeHash)));
        assert.isTrue((await instance.expiryOf(nodeHash)).toString(10) === existingExpiry.toString(10));

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should be possible for owners of node to update node attributes", async () => {
        let instance = await akaf.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));

        await instance.setSeeAlso(nodeHash, 0x1);
        await instance.setSeeAddress(nodeHash, accounts[1]);
        await instance.setNodeBody(nodeHash, [0x1, 0x2, 0x3]);
        await instance.setTokenURI(nodeHash, "akaf://abc");

        assert.equal(0x1, await instance.seeAlso(nodeHash));
        assert.equal(accounts[1], await instance.seeAddress(nodeHash));
        assert.equal(0x010203, await instance.nodeBody(nodeHash));
        assert.equal("akaf://abc", await instance.tokenURI(nodeHash));
    });

    it("should be possible for owners of node to reclaim without changing any node attributes", async () => {
        // This is a case 1 test with special case parent..
        let instance = await akaf.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        await instance.claim(0x0, [0x1]);

        assert.equal(0x1, await instance.seeAlso(nodeHash));
        assert.equal(accounts[1], await instance.seeAddress(nodeHash));
        assert.equal(0x010203, await instance.nodeBody(nodeHash));
    });

    it("should not be possible for non-owners of a parent to reclaim an existing child node not owned by caller", async () => {
        let instance = await akaf.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        await instance.claim(parentHash, [0x2], {from: accounts[1]});
        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
    });

    it("should not be possible for non-owners of a parent to claim a new child node", async () => {
        let instance = await akaf.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x3]);

        await expectRevert(instance.ownerOf(nodeHash), "ERC721: owner query for nonexistent token");
        await instance.claim(parentHash, [0x3], {from: accounts[1]});
        await expectRevert(instance.ownerOf(nodeHash), "ERC721: owner query for nonexistent token");
    });

    it("should be possible for non-owners of a parent to reclaim an existing child node owned by them", async () => {
        // This is a case 1 test..
        let instance = await akaf.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        await instance.transferFrom(accounts[0], accounts[1], nodeHash);
        assert.equal(accounts[1], await instance.ownerOf(nodeHash));

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(parentHash, [0x2], {from: accounts[1]});

        assert.isTrue((await instance.expiryOf(nodeHash)).toString(10) === existingExpiry.toString(10));

        await instance.transferFrom(accounts[1], accounts[0], nodeHash, {from: accounts[1]});
    });

    it("should be possible for owners of node to reclaim an expired node on special case parent", async () => {
        // This is a case 3 test with special case parent..
        let instance = await akaf.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        await instance.expireNode(nodeHash);

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(0x0, [0x1]);

        assert.isTrue((await instance.expiryOf(nodeHash)).gt(existingExpiry));
    });

    it("should be possible for owners of node to reclaim an expired node on non-special case parent", async () => {
        // This is a case 3 test..
        let instance = await akaf.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        await instance.expireNode(nodeHash);

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(parentHash, [0x2]);

        assert.isTrue((await instance.expiryOf(nodeHash)).gt(existingExpiry));
    });

    it("should be possible for non-owners of node to reclaim an expired node on special case parent", async () => {
        // This is a case 3 test with special case parent..
        let instance = await akaf.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        await instance.transferFrom(accounts[0], accounts[1], nodeHash);
        assert.equal(accounts[1], await instance.ownerOf(nodeHash));

        await instance.expireNode(nodeHash, {from: accounts[1]});

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(0x0, [0x1]);

        assert.isTrue((await instance.expiryOf(nodeHash)).gt(existingExpiry));
        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
    });

    it("should be possible for non-owners of node to reclaim an expired node on non-special case parent", async () => {
        // This is a case 3 test..
        let instance = await akaf.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        await instance.transferFrom(accounts[0], accounts[1], nodeHash);
        assert.equal(accounts[1], await instance.ownerOf(nodeHash));

        await instance.expireNode(nodeHash, {from: accounts[1]});

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(parentHash, [0x2]);

        assert.isTrue((await instance.expiryOf(nodeHash)).gt(existingExpiry));
        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
    });

    it("should only be possible to use labels within limits", async () => {
        let instance = await akaf.deployed();

        let minLength = 1;
        let maxLength = 32;

        await expectRevert(instance.claim(0x0, Array.apply(null, Array(minLength - 1)).map(function (x, i) {
            return i + 10;
        }), {from: accounts[5]}), "AKAP: Invalid label length");
        await expectRevert(instance.claim(0x0, Array.apply(null, Array(maxLength + 1)).map(function (x, i) {
            return i + 10;
        }), {from: accounts[5]}), "AKAP: Invalid label length");

        instance.claim(0x0, Array.apply(null, Array(minLength)).map(function (x, i) {
            return i + 10;
        }), {from: accounts[5]});
        instance.claim(0x0, Array.apply(null, Array(maxLength)).map(function (x, i) {
            return i + 10;
        }), {from: accounts[5]});

        assert.equal(accounts[5], await instance.ownerOf(await instance.hashOf(0x0, Array.apply(null, Array(minLength)).map(function (x, i) {
            return i + 10;
        }), {from: accounts[1]})));
        assert.equal(accounts[5], await instance.ownerOf(await instance.hashOf(0x0, Array.apply(null, Array(maxLength)).map(function (x, i) {
            return i + 10;
        }), {from: accounts[1]})));
    });

});
