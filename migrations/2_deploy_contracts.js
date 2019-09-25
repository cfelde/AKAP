var akap = artifacts.require("AKAP");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(akap);
};
