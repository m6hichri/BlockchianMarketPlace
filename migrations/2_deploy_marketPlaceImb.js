const MarketPlaceImb = artifacts.require("MarketPlaceImb");

module.exports = function(deployer) {
  deployer.deploy(MarketPlaceImb);
};
