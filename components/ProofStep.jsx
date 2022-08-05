import React, { useEffect } from "react";
import { parseBytes32String } from "ethers/lib/utils";
import { useState } from "react";
import { Group } from "@semaphore-protocol/group";

// import { generateProof } from "@semaphore-protocol/proof";
import { Button, Input } from "antd";
const { ethers } = require("ethers");
const {
  generateProof,
  packToSolidityProof,
} = require("@semaphore-protocol/proof");
export default function ProofStep({ eve, identitycommitment, contract }) {
  const [Votes, SetVotes] = useState();
  const getVotes = async () => {
    // const votes = await contract.queryFilter(
    //   contract.filters.CastedVote(eve.groupId)
    // );
    // return votes.map((e) => parseBytes32String(e.args[0]));
  };
  console.log("eve", eve);

  const vote = async () => {
    const group = new Group();
    console.log("Event data ", eve.members);
    group.addMembers(eve.members);
    const externalNullifier = group.root;
    console.log("externalnullifier", externalNullifier);
    const signal = "ts";
    // const identity = identitycommitment.generateCommitment();
    // console.log("identity", identity);
    // console.log(
    //   "identitu  commitment",
    //   identitycommitment,
    //   "group",
    //   group,
    //   "ext null",
    //   externalNullifier
    // );
    const { proof, publicSignals } = await generateProof(
      identitycommitment,
      group,
      externalNullifier,
      signal,
      {
        zkeyFilePath: "/semaphore.zkey",
        wasmFilePath: "/semaphore.wasm",
      }
    );
    console.log("fullproof", proof, publicSignals);
    const solidityProof = packToSolidityProof(proof);
    console.log("solidityproof", solidityProof);

    // const rootinbignumber = await contract.getRoot(eve.groupId);
    // let a = new BigNumber(rootinbignumber);
    // const root = a.toFixed();
    // console.log("root", root);
  };

  useEffect(() => {
    getVotes().then(SetVotes);
  }, []);

  return (
    <div>
      <Button
        onClick={async () => {
          await vote();
        }}
      >
        Vote
      </Button>
    </div>
  );
}
