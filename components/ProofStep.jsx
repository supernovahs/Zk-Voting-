import React, { useEffect } from "react";
import { parseBytes32String } from "ethers/lib/utils";
import { useState } from "react";
import { Group } from "@semaphore-protocol/group";

// import { generateProof } from "@semaphore-protocol/proof";
import { Button, Input } from "antd";
const { ethers } = require("ethers");
const { generateProof } = require("@semaphore-protocol/proof");
export default function ProofStep({ eve, identitycommitment, contract }) {
  const [Votes, SetVotes] = useState();
  const getVotes = async () => {
    // const votes = await contract.queryFilter(
    //   contract.filters.CastedVote(eve.groupId)
    // );
    // return votes.map((e) => parseBytes32String(e.args[0]));
  };

  const vote = async () => {
    const group = new Group();
    console.log("members", eve.members);
    group.addMembers(eve.members);
    // const externalNullifier = group.root;
    // const signal = "dfs";
    // const fullProof = await generateProof(
    //   identitycommitment,
    //   group,
    //   externalNullifier,
    //   signal,
    //   {
    //     zkeyFilePath: "../helpers/semaphore.zkey",
    //     wasmFilePath: "../helpers/semaphore.wasm",
    //   }
    // );

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
