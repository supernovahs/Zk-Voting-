import { ethers } from "ethers";
import abi from "./ZkVote.json";
let provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/6Ez5lVxd5SRL2Z53M6Zn0je2nUnuk0my");

let signer = new ethers.Wallet("a36091e29b0da9e37adb32f91df6942aee60fe27babda5553fa31ea59b5e451f", provider);
let contract = new ethers.Contract("0x748d653DE21623Ee48f5ac32aCD8E7437e79C746", abi.abi, provider);
async function call() {
    // let call = await contract.Addvoter("2145170107398465000000000000000000000000000000000000000000000000000000000", "4207937407749636925240217741515759024461243225592901627801318602134563681612");
    // console.log("await tx", call);
    let a = await contract.getRoot("135935862626776000585533630199120304176586719189049049461632820181918297474");
    console.log("await tx", ethers.BigNumber.from(a).toString());
    let pollinstance = await contract.polls("135935862626776000585533630199120304176586719189049049461632820181918297474");
    let pollstate = pollinstance.pollstate;
    console.log("pollstate", pollstate);
    let depth = await contract.getDepth("135935862626776000585533630199120304176586719189049049461632820181918297474");
    console.log("depth", ethers.BigNumber.from(depth).toString());
    let verifiers = await contract.verifiers("20");
    console.log("verifiers", verifiers);

}
call();
