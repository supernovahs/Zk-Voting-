import React, { useEffect } from "react";
import { parseBytes32String } from "ethers/lib/utils";
import { useState } from "react";
const { Group } = require("@semaphore-protocol/group");
const { verifyProof } = require("@semaphore-protocol/proof");
import { Button, Input } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Switch, Route } from "react-router-dom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [Votes, SetVotes] = useState();
  const [EventData, SetEventData] = useState();
  const [Coordinator, SetCoordinator] = useState();
  const [Proposals, SetProposals] = useState([]);
  const [Position, SetPosition] = useState([]);
  const [RemainingVotes, SetRemainingVotes] = useState(100);
  const [NotEnoughVotes, SetNotEnoughVotes] = useState(false);
  const [Voting, SetVoting] = useState(false);
  const [Id, SetId] = useState();
  let BACKEND_URL = "https://zkvotebackend.herokuapp.com/";
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
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
      SetId(ethers.BigNumber.from(eve.groupId).toString());
      let z = await contract.getlatestVotes(
        ethers.BigNumber.from(eve.groupId).toString()
      );
      SetVotes(z);

      console.log("Proposals array", Proposals);
      console.log("");
      console.log("latest votes", z);
    }
    updateEvents();
  }, [signer]);

  useEffect(() => {
    let a = [];
    Votes &&
      Votes.map((val, index) => {
        a[index] = val.proposals;
      });
    SetProposals(a);
    console.log("a", a);
  }, [Votes]);

  const vote = async (proposals, position) => {
    SetVoting(true);
    let b = [];
    for (let i = 0; i < proposals.length; i++) {
      b[i] = ethers.utils.parseBytes32String(proposals[i]);
    }

    console.log("b", b);

    const group = new Group();
    console.log("Event data ", eve.members);
    group.addMembers(eve.members);
    console.log("group", group);
    const externalNullifier = ethers.BigNumber.from(group.root).toString();
    console.log("externalnullifier", externalNullifier);

    let id = ethers.BigNumber.from(eve.groupId).toString();
    console.log("proposalsssss", proposals);
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
    console.log("sd");
    let isvoted = await contract.nullifierHashes(hash);
    console.log("isvoteds", isvoted);
    if (isvoted == true) {
      alert("Already Voted ser");
      SetVoting(false);
    } else {
      console.log("calling this", `${BACKEND_URL}vote`);
      console.log("position", position);
      console.log("proposals", proposals);
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
  };

  const updatePosition = (index, position) => {
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
                {ethers.utils.parseBytes32String(val.proposals)}:{" "}
                {/* {ethers.BigNumber.from(val.votes).toString()} votes */}
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
      </h3>
      <div>
        <Button onClick={onOpen}>Vote</Button>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Your Vote</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {Votes &&
                Votes.map((val, index) => {
                  return (
                    <div key={index}>
                      {ethers.utils.parseBytes32String(val.proposals)}:{" "}
                      {Position && Position[index] * Position[index]}{" "}
                      <p>Votes</p>
                    </div>
                  );
                })}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                variant="ghost"
                isLoading={Voting}
                onClick={async () => {
                  console.log("Positions ", Position);
                  console.log("Proposals", Proposals);
                  vote(Proposals, Position);
                }}
                disabled={NotEnoughVotes}
              >
                Vote
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
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
      <div style={{ border: "2px solid black ", margin: 5, padding: 7 }}>
        <h3> Votes </h3>
        {Votes &&
          Votes.map((val, index) => {
            return (
              <div key={index}>
                {" "}
                {ethers.utils.parseBytes32String(val.proposals)}:{" "}
                <b>{ethers.BigNumber.from(val.votes).toString()}</b> votes
              </div>
            );
          })}
      </div>
    </div>
  );
}
