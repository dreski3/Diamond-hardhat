const { ethers, hardhat } = require("hardhat");
const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function deployDiamond() {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];

  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  console.log("\nDeploying facets");
  const FacetNames = [
    "DiamondCutFacet",
    "DiamondLoupeFacet",
    "OwnershipFacet",
  ];

  const facetCuts = [];
  const deployedContracts = [];

  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);

    const selectors = getSelectors(facet);
    facetCuts.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: selectors,
    });

    // used for verifying the contract on Etherscan
    deployedContracts.push({
      contractName: FacetName,
      contractAddress: facet.address,
    });
  }

  let functionCall = diamondInit.interface.encodeFunctionData("init");

  const diamondArgs = {
    owner: contractOwner.address,
    init: diamondInit.address,
    initCalldata: functionCall,
  };

  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(facetCuts, diamondArgs);
  await diamond.deployed();
  console.log("\nDiamond deployed:", diamond.address);

  // used for verifying the contract on Etherscan
  deployedContracts.push({
    contractName: "Diamond",
    contractAddress: diamond.address,
  });

  // Delaying to give time for the contract to be registered on Etherscan
  await sleep(30 * 1000);

  // Verifying Diamond and facets
  console.log("\nVerifying deployed contracts on Etherscan...");
  for (const contract of deployedContracts) {
    console.log(`Verifying ${contract.contractName} at address ${contract.contractAddress}`);
    if (contract.contractName === "Diamond") {
      await hre.run("verify:verify", {
        address: contract.contractAddress,
        constructorArguments: [
          facetCuts,
          diamondArgs,
        ],
      });
      // continue;
    }
    else {
      await hre.run("verify:verify", {
        address: contract.contractAddress,
        constructorArguments: [],
      });
    }
  }

  return diamond.address;
}

if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
