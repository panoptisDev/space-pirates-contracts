const { ethers } = require("hardhat");
const data = require("./data.json");

async function main() {
  /* Contracts loading */
  const TokensContract = await ethers.getContractFactory("SpacePiratesTokens");
  const StakingContract = await ethers.getContractFactory(
    "SpacePiratesStaking"
  );
  const SplitContract = await ethers.getContractFactory(
    "AsteroidsSplitContract"
  );

  /* Contracts deploy */
  console.log("\nDeploying contracts...");
  const tokensContract = await TokensContract.deploy();
  console.log("Space Pirates Tokens deployed to:", tokensContract.address);
  const stakingContract = await StakingContract.deploy(tokensContract.address);
  console.log("Space Pirates Staking deployed to:", stakingContract.address);
  const splitContract = await SplitContract.deploy(tokensContract.address);
  console.log("Asteroids Split Contract deployed to:", splitContract.address);

  /* Contracts setup*/
  console.log("\nContracts setup...");
  console.log("  staking contract setup");
  await tokensContract.grantRole(data.mint.doubloons, stakingContract.address);
  console.log("    granted doubloons mint role");
  await stakingContract.createStakingPool(
    data.ids.doubloons,
    data.ids.doubloons,
    ethers.BigNumber.from("2000000000000000000"),
    0
  );
  console.log("    created doubloons staking pool");
  await stakingContract.createStakingPool(
    data.ids.stkAsteroids,
    data.ids.doubloons,
    ethers.BigNumber.from("2000000000000000000"),
    0
  );
  console.log("    created stk-asteroids staking pool");

  console.log("  asteroids split contract setup");
  await tokensContract.grantMultiRole(
    [
      data.mint.asteroids,
      data.mint.veAsteroids,
      data.mint.stkAsteroids,
      data.burn.asteroids,
      data.burn.veAsteroids,
      data.burn.stkAsteroids,
    ],
    [
      splitContract.address,
      splitContract.address,
      splitContract.address,
      splitContract.address,
      splitContract.address,
      splitContract.address,
    ]
  );
  console.log("    granted mint & burn role to the split contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
