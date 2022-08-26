import React, { useEffect } from "react";
import { parseBytes32String } from "ethers/lib/utils";
import { useState } from "react";
const { Group } = require("@semaphore-protocol/group");
const { verifyProof } = require("@semaphore-protocol/proof");
import { Button, Input } from "antd";
import axios from "axios";
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
  onNextClick,
}) {
  const [Votes, SetVotes] = useState();
  const [EventData, SetEventData] = useState();
  const [Coordinator, SetCoordinator] = useState();
  const [Proposals, SetProposals] = useState([]);
  const [Position, SetPosition] = useState([]);
  const [RemainingVotes, SetRemainingVotes] = useState(100);
  const [NotEnoughVotes, SetNotEnoughVotes] = useState(false);
  const [Voting, SetVoting] = useState(false);
  const [AlreadyVoted, SetAlreadyVoted] = useState(false);
  let BACKEND_URL = "http://localhost:49899/";
  const getVotes = async () => {
    const votes = await contract.queryFilter(
      contract.filters.CastedVote(eve.groupId)
    );
    return votes.map((e) => parseBytes32String(e.args[0]));
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

      let z = await contract.getlatestVotes(
        ethers.BigNumber.from(eve.groupId).toString()
      );

      SetVotes(z);

      let a = [];

      Votes &&
        Votes.map((val, index) => {
          a[index] = val.proposals;
        });
      console.log("a", a);

      SetProposals(a);
      console.log("Proposals array", Proposals);
      console.log("");
      console.log("latest votes", z);
    }
    updateEvents();
  }, [signer]);

  const vote = async (proposals, position) => {
    SetVoting(true);
    console.log("proposals", proposals);
    let b = [];
    for (let i = 0; i < proposals.length; i++) {
      b[i] = ethers.utils.parseBytes32String(proposals[i]);
    }

    console.log("proposals", b);

    const group = new Group();
    console.log("Event data ", eve.members);
    group.addMembers(eve.members);
    console.log("group", group);
    const externalNullifier = ethers.BigNumber.from(group.root).toString();
    console.log("externalnullifier", externalNullifier);

    let id = ethers.BigNumber.from(eve.groupId).toString();
    const fullProof = await generateProof(identitycommitment, group, id, b[0], {
      zkeyFilePath: "/semaphore.zkey",
      wasmFilePath: "/semaphore.wasm",
    });
    console.log("fullProof", fullProof);
    let ps = fullProof.publicSignals;
    console.log("ps", ps);
    let hash = ps.nullifierHash;
    console.log("dd");
    const solidityProof = packToSolidityProof(fullProof.proof);
    console.log("solidityProof", solidityProof);
    console.log("b", proposals.length);
    console.log("position", position.length);
    console.log("sd");
    let isvoted = await contract.nullifierHashes(hash);
    console.log("isvoteds", isvoted);
    if (isvoted == true) {
      alert("Already Voted ser");
      SetVoting(false);
    } else {
      const { status } = await fetch(`${BACKEND_URL}vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposals,
          position,
          hash,
          id,
          solidityProof,
        }),
      });
      SetVoting(false);

      console.log("status", status);
      console.log("adf");
    }

    // try {
    //   const txs = await contract.castVote(
    //     proposals,
    //     position,
    //     fullProof.publicSignals.nullifierHash,
    //     ethers.BigNumber.from(eve.groupId).toString(),
    //     12345,
    //     solidityProof,
    //     {
    //       gasLimit: 500000,
    //     }
    //   );
    // } catch (e) {
    //   console.log("error", e);
    // }
  };
  console.log("signer", signer._address);

  const updatePosition = (index, position) => {
    console.log("index", index);
    console.log("position", position);
    let a = Position;
    a[index] = position;
    SetPosition(a);
    console.log("a position", a);
    console.log("Position", Position);
    let total = 0;
    for (let i = 0; i < Position.length; i++) {
      console.log("position[i]", Position[i]);
      total += Position[i] * Position[i];
    }
    console.log("total", total);
    SetRemainingVotes(100 - total > 0 ? 100 - total : <p>Not enough votes</p>);
    if (RemainingVotes < 0) {
      SetNotEnoughVotes(true);
    }
  };

  return (
    <div>
      <Button
        onClick={() => {
          onNextClick();
        }}
      >
        Back
      </Button>
      <h2>Id: {ethers.BigNumber.from(eve.groupId).toString()}</h2>
      <h3>
        {Votes &&
          Votes.map((val, index) => {
            return (
              <div key={index}>
                {" "}
                Proposal Name:
                {ethers.utils.parseBytes32String(val.proposals)}:{" "}
                {ethers.BigNumber.from(val.votes).toString()} votes
                {
                  <Input
                    placeholder="Votes"
                    value={Position[index]}
                    onChange={(e) => updatePosition(index, e.target.value)}
                  ></Input>
                }
              </div>
            );
          })}
        {<p>Remaining Votes: {RemainingVotes}</p>}
        {
          <Button
            loading={Voting}
            onClick={async () => {
              console.log("proposals", Proposals);
              console.log("Positions ", Position);
              vote(Proposals, Position);
            }}
            disabled={NotEnoughVotes}
          >
            Vote
          </Button>
        }
      </h3>
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
