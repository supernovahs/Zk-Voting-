import React, { useEffect } from "react";
import { parseBytes32String } from "ethers/lib/utils";
import { useState } from "react";
import { Group } from "@semaphore-protocol/group";
const { verifyProof } = require("@semaphore-protocol/proof");
import semaphorejson from "./semaphore.json";
import { Button, Input } from "antd";
const { ethers } = require("ethers");
const { fs } = require("fs");
const {
  generateProof,
  packToSolidityProof,
} = require("@semaphore-protocol/proof");
export default function ProofStep({
  eve,
  identitycommitment,
  contract,
  signer,
}) {
  const [Votes, SetVotes] = useState();
  const [EventData, SetEventData] = useState();
  const [Coordinator, SetCoordinator] = useState();
  const getVotes = async () => {
    // const votes = await contract.queryFilter(
    //   contract.filters.CastedVote(eve.groupId)
    // );
    // return votes.map((e) => parseBytes32String(e.args[0]));
  };
  console.log("eve", eve);

  async function getEvents() {
    const start = await contract.queryFilter(
      contract.filters.VoteStarts(eve.groupId)
    );
    console.log(start);
    return start.map((e) => ({
      groupId: e.args[0],
      time: e.args[1],
    }));
  }

  useEffect(() => {
    async function updateEvents() {
      const events = await getEvents();
      console.log("events", events);
      SetEventData(events);
      console.log("id", ethers.BigNumber.from(eve.groupId).toString());
      const pollInstance = await contract.polls(
        ethers.BigNumber.from(eve.groupId).toString()
      );

      const coordinator = pollInstance.coordinator;
      const pollstate = pollInstance.pollstate;
      console.log("pollinstance", pollInstance);
      const proposals = pollInstance.proposals;
      console.log("proposals", proposals);
      console.log("coordinator", coordinator, "pollstate", pollstate);
      SetCoordinator(coordinator);
    }
    updateEvents();
  }, [signer]);

  const vote = async () => {
    const group = new Group();
    console.log("Event data ", eve.members);
    group.addMembers(eve.members);
    console.log("group", group);
    const externalNullifier = ethers.BigNumber.from(group.root).toString();
    console.log("externalnullifier", externalNullifier);
    const signal = "hello";
    // console
    //   .log(
    //     "identitycommitment",
    //     ethers.BigNumber.from(identitycommitment.generateCommitment())
    //   )
    //   .toString();

    const verificationKey = await fetch(
      "https://www.trusted-setup-pse.org/semaphore/20/semaphore.json"
    ).then(function (res) {
      return res.json();
    });

    console.log("verificationKey", verificationKey);
    // const verKey = JSON.parse(fs.readFileSync(verificationKey, "utf-8"));
    // console.log("verKey", verKey);

    const fullProof = await generateProof(
      identitycommitment,
      group,
      externalNullifier,
      signal,
      {
        zkeyFilePath: "/semaphore.zkey",
        wasmFilePath: "/semaphore.wasm",
      }
    );

    const passorNot = await verifyProof(verificationKey, fullProof);
    console.log("passorNot", passorNot);

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
    console.log("sinal", ethers.utils.formatBytes32String(signal));
    console.log("Null hash", publicSignals.nullifierHash);
    console.log("G Id", ethers.BigNumber.from(eve.groupId).toString());
    console.log("solidityProof", solidityProof);
    console.log("external nulliffier", externalNullifier);

    const txs = await contract.castVote(
      ethers.utils.formatBytes32String(signal),
      publicSignals.nullifierHash,
      ethers.BigNumber.from(eve.groupId).toString(),
      externalNullifier,
      solidityProof,
      {
        gasLimit: 300000,
      }
    );

    console.log("txs", txs);
  };
  console.log("singer", signer._address);

  useEffect(() => {
    getVotes().then(SetVotes);
  }, []);

  return (
    <div>
      <h2>Id: {ethers.BigNumber.from(eve.groupId).toString()}</h2>
      {/* <h2>Event: {ethers.BigNumber.from(eve.eventName}</h2>  */}
      {
        <div>
          {EventData && EventData[0] && EventData[0].time ? (
            <h2>
              {" "}
              Start Time:{" "}
              {new Date(Number(EventData[0].time) * 1000).toLocaleString()}{" "}
            </h2>
          ) : (
            <h2>Not Started</h2>
          )}
        </div>
      }
      <Button
        onClick={async () => {
          await vote();
        }}
      >
        Vote
      </Button>
      {signer._address === Coordinator ? (
        <div>
          <Button
            onClick={async () => {
              await contract.StartPoll(
                ethers.BigNumber.from(eve.groupId).toString()
              );
            }}
          >
            Start Poll
          </Button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
