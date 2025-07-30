async function main() {
  const Voting = await ethers.getContractFactory("Voting");

  // Start deployment, returning a promise that resolves to a contract object
  const Voting_ = await Voting.deploy();
  console.log("Contract address:", Voting_.address);

  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...")

    // Not functionable in version 6^ ethers ----->
    // the .deployTransaction.wait(6) does not work on v6^ change it to .deploymentTransaction().wait(6)
    await Voting_.deployTransaction.wait(6)
    await verify(Voting_.address, [])
  }
}

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!")
    } else {
      console.log(e)
    }
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
