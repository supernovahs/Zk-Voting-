import { ethers } from "ethers";

let provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/6Ez5lVxd5SRL2Z53M6Zn0je2nUnuk0my");
let abi = ["function Addvoter(uint,uint) external "];
let signer = new ethers.Wallet("a36091e29b0da9e37adb32f91df6942aee60fe27babda5553fa31ea59b5e451f", provider);
let contract = new ethers.Contract("0x09325f87296D31A0455A1108214E260aB66f07ad", abi, signer);
async function call() {

    let call = await contract.Addvoter("2145170107398465000000000000000000000000000000000000000000000000000000000", "4207937407749636925240217741515759024461243225592901627801318602134563681612");
    console.log("await tx", call);
}
call();
