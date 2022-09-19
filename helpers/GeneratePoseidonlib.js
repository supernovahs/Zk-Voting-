const { ethers } = require("ethers");
const { poseidonContract } = require("circomlibjs")

const DeployPoseidon = async () => {
    console.log("poseidon_gencontract", poseidonContract);
    const poseidonABI = poseidonContract.generateABI(2);
    const Bytecode = poseidonContract.createCode(2);
    const privatekey = "a36091e29b0da9e37adb32f91df6942aee60fe27babda5553fa31ea59b5e451f";
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/jrGhfalUVcb1nws18jgVaZsI9EIoi7uE");
    const signer = new ethers.Wallet(privatekey, provider);
    console.log("signer", signer);
    const poseidonlibfactory = new ethers.ContractFactory(poseidonABI, Bytecode, signer);
    const poseidonlib = await poseidonlibfactory.deploy();
    await poseidonlib.deployed();

    console.log("Poseidon Lib is deployed to ", poseidonlib.address);

    
}


DeployPoseidon()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

