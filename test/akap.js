const akap = artifacts.require("AKAP");

async function failingAwait(promise) {
    let gotEx = false;
    try {
        await promise;
    } catch (ex) {
        gotEx = true;
    }

    assert.isTrue(gotEx);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

contract("When testing AKAP, it:", async accounts => {
    it("should be possible to claim a node on root", async () => {
        let instance = await akap.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        await failingAwait(instance.ownerOf(nodeHash));
        await failingAwait(instance.parentOf(nodeHash));
        await failingAwait(instance.expiryOf(nodeHash));
        await failingAwait(instance.seeAlso(nodeHash));
        await failingAwait(instance.seeAddress(nodeHash));
        await failingAwait(instance.nodeBody(nodeHash));

        await instance.claim(0x0, [0x1]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        assert.equal(0x0, await instance.parentOf(nodeHash));
        assert.isTrue(await instance.expiryOf(nodeHash) > 0);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should be possible for owners to reclaim an existing node", async () => {
        let instance = await akap.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        let existingExpiry = await instance.expiryOf(nodeHash);

        await sleep(1000);

        await instance.claim(0x0, [0x1]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        assert.equal(0x0, await instance.parentOf(nodeHash));
        assert.isTrue(await instance.expiryOf(nodeHash) > existingExpiry);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should be possible for owners to update node attributes", async () => {
        let instance = await akap.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));

        await instance.setSeeAlso(nodeHash, 0x1);
        await instance.setSeeAddress(nodeHash, accounts[1]);
        await instance.setNodeBody(nodeHash, [0x1, 0x2, 0x3]);

        assert.equal(0x1, await instance.seeAlso(nodeHash));
        assert.equal(accounts[1], await instance.seeAddress(nodeHash));
        assert.equal(0x010203, await instance.nodeBody(nodeHash));
    });

    it("should be possible for owners to reclaim without changing any node attributes", async () => {
        let instance = await akap.deployed();

        let nodeHash = await instance.hashOf(0x0, [0x1]);

        await instance.claim(0x0, [0x1]);

        assert.equal(0x1, await instance.seeAlso(nodeHash));
        assert.equal(accounts[1], await instance.seeAddress(nodeHash));
        assert.equal(0x010203, await instance.nodeBody(nodeHash));
    });

    it("should be possible for owners of a parent to claim a child node", async () => {
        let instance = await akap.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x2]);

        await failingAwait(instance.ownerOf(nodeHash));

        await instance.claim(parentHash, [0x2]);

        assert.equal(accounts[0], await instance.ownerOf(nodeHash));
        assert.equal(0x0, await instance.parentOf(nodeHash));
        assert.isTrue(await instance.expiryOf(nodeHash) > 0);

        assert.equal(0x0, await instance.seeAlso(nodeHash));
        assert.equal(0x0, await instance.seeAddress(nodeHash));
        assert.equal(null, await instance.nodeBody(nodeHash));
    });

    it("should not be possible for non-owners of a parent to claim a child node", async () => {
        let instance = await akap.deployed();

        let parentHash = await instance.hashOf(0x0, [0x1]);
        let nodeHash = await instance.hashOf(parentHash, [0x3]);

        await failingAwait(instance.ownerOf(nodeHash));
        await failingAwait(instance.claim(parentHash, [0x3], {from: accounts[1]}));
        await failingAwait(instance.ownerOf(nodeHash));
    });

    it("should only be possible to use labels within limits", async () => {
        let instance = await akap.deployed();

        let minLength = 1;
        let maxLength = 32;

        await failingAwait(instance.claim(0x0, Array.apply(null, Array(minLength - 1)).map(function (x, i) { return i + 10; }), {from: accounts[1]}));
        await failingAwait(instance.claim(0x0, Array.apply(null, Array(maxLength + 1)).map(function (x, i) { return i + 10; }), {from: accounts[1]}));

        instance.claim(0x0, Array.apply(null, Array(minLength)).map(function (x, i) { return i + 10; }), {from: accounts[1]});
        instance.claim(0x0, Array.apply(null, Array(maxLength)).map(function (x, i) { return i + 10; }), {from: accounts[1]});

        assert.equal(accounts[1], await instance.ownerOf(await instance.hashOf(0x0, Array.apply(null, Array(minLength)).map(function (x, i) { return i + 10; }), {from: accounts[1]})));
        assert.equal(accounts[1], await instance.ownerOf(await instance.hashOf(0x0, Array.apply(null, Array(maxLength)).map(function (x, i) { return i + 10; }), {from: accounts[1]})));
    });
});
