import { poseidon_gencontract as poseidonContract } from "circomlibjs"
const {ethers} = require("ethers");

const DeployPoseidon =async  ()=>{
    const poseidonABI= poseidonContract.generateABI(2);
    const Bytecode = poseidonContract.createCode(2);
    const privatekey = "a36091e29b0da9e37adb32f91df6942aee60fe27babda5553fa31ea59b5e451f";
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/jrGhfalUVcb1nws18jgVaZsI9EIoi7uE");
    const signer = new ethers.Wallet(privatekey,provider);
    console.log("signer",signer);
    const poseidonlibfactory = new ethers.ContractFactory(poseidonABI,Bytecode)
}
DeployPoseidon();