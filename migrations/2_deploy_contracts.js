var akap = artifacts.require("AKAP");
var akaf = artifacts.require("AKAF");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(akap);
    deployer.deploy(akaf);
};
