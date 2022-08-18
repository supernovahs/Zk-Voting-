import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import {useState} from "react";
import IdentityStep from "../components/IdentityStep";
import GroupStep from "../components/GroupStep";
import ProofStep from "../components/ProofStep";
import {Input,Button } from "antd";
import abi from "../helpers/ZkVote.json";
import {useContract,useSigner} from 'wagmi';
const {ethers} = require("ethers"); 
const Home: NextPage = () => {
  const [Stage,Setstage] = useState(1);
  const [_identity,_Setidentity] = useState();
  const [Event,SetEvent]  = useState();
  const { data: signer, isError, isLoading } = useSigner();

  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,abi.abi,signer);
  console.log("Contracct Instance ",contract);
  console.log("Event in index",Event);
  return (
    <div className={styles.container}>
      
      <main style = {{}}>
        <ConnectButton />
      </main>

      <div className = {styles.main}>
      {Stage ===1?(
        <IdentityStep  onChange = {_Setidentity} onNextClick = {() =>Setstage(2)}/>
      ): Stage === 2 ? (
        <GroupStep contract = {contract} identitycommitment = {_identity} onSelect = {(e:any)=>{
          SetEvent(e)
          Setstage(3)
        }} onNextClick = {() => Setstage(1)}/>
      ):(
        <ProofStep  onNextClick = {()=> Setstage(2)} signer = {signer} eve = {Event} contract  = {contract} identitycommitment = {_identity}  />
      )}

      </div>
      



   
    </div>
  );
};

export default Home;
