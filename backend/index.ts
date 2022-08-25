import express from "express";
import cors from "cors";

import abi from "../helpers/ZkVote.json";
require('dotenv').config();

const ethers = require("ethers");
const app = express();
app.use(cors());
app.use(express.json());
const {port} = new URL("http://localhost:8080/");
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

app.get("/vote", async (req,res)=>{

    const {proposals,position,nullifierHash,id,externalNullifier,Proof} = req.body

    try{
         const tx = await contract.castVote(proposals,position,nullifierHash,id,externalNullifier,Proof,{gasLimit: 500000});

         await tx.wait();
         res.status(200).end()
    }
    catch(error:any){
        console.log("error",error);
        res.status(200).end();
    }
});

app.post("/a",async (req,res)=>{
    console.log("req",res);
})

var server  = app.listen(port,()=>{
    console.log("Started to listen  ",server);
})
