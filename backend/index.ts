import express from "express";
import cors from "cors";

import abi from "../helpers/ZkVote.json";
require('dotenv').config();

const ethers = require("ethers");
const app = express();
app.use(cors());
app.use(express.json());
const {port} = new URL("http://localhost:49899");
console.log("port ",port);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
console.log("ContractAddress",CONTRACT_ADDRESS);
const RelayerPrivateKey : any = process.env.NEXT_PUBLIC_RELAYER_PRIVATE_KEY;
console.log("Relayer Private Key ",RelayerPrivateKey);
const GoerliRPC = process.env.GOERLI_RPC;
console.log("goerli RPC",GoerliRPC);

const provider = new ethers.providers.JsonRpcProvider(GoerliRPC);
const signer = new ethers.Wallet(RelayerPrivateKey ,provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS,abi.abi,signer);

app.post("/vote", async (req,res)=>{

    const {proposals,position,hash,id,solidityProof} = req.body
    console.log("proposals",proposals,"position",position,"hash",hash,"id",id,"solidityProof",solidityProof);

    try{
         const tx = await contract.castVote(proposals,position,hash,id,solidityProof,{gasLimit: 500000});
        console.log("tx done ",tx);
         res.status(200).end()
    }
    
    catch(error:any){
        console.log("error",error);
        res.status(200).end();
    }
});



app.listen(port,()=>{
    // console.log("Started to listen  ",server);
})