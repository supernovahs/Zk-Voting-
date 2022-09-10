import React, { useEffect } from "react";
import { parseBytes32String } from "ethers/lib/utils";
import { useState } from "react";
const { Group } = require("@semaphore-protocol/group");
const { verifyProof } = require("@semaphore-protocol/proof");
import { Button, Input } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import Link from "next/link";
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
  console.log(
    "eve",
    eve,
    "identitycommitment",
    identitycommitment,
    "signer",
    signer,
    "contract",
    contract
  );

  async function getEvents() {
    console.log("eve", eve);
    const start = await contract.queryFilter(
      contract.filters.VoteStarts(eve[0].groupId)
    );

    console.log(start);
    return start.map((e) => ({
      groupId: e.args[0],
      time: e.args[1],
    }));
  }

  useEffect(() => {
    async function updateEvents() {
      console.log("eve is 0 ? ", eve);
      if (eve == 0) {
        console.log("eve is null", eve);
        return null;
      } else {
        console.log("eve is not null", eve);
        const events = await getEvents();
        console.log("events", events);
        SetEventData(events);
        console.log("eve", eve);
        console.log("id", ethers.BigNumber.from(eve[0].groupId).toString());
        const pollInstance = await contract.polls(
          ethers.BigNumber.from(eve[0].groupId).toString()
        );
        const coordinator = pollInstance.coordinator;
        const pollstate = pollInstance.pollstate;
        console.log("pollinstance", pollInstance);
        const proposals = pollInstance.proposals;
        console.log("proposals", proposals);
        console.log("coordinator", coordinator, "pollstate", pollstate);
        SetCoordinator(coordinator);
        SetId(ethers.BigNumber.from(eve[0].groupId).toString());
        let z = await contract.getlatestVotes(
          ethers.BigNumber.from(eve[0].groupId).toString()
        );
        SetVotes(z);

        console.log("Proposals array", Proposals);
        console.log("");
        console.log("latest votes", z);
      }
    }
    updateEvents();
  }, [signer]);

  useEffect(() => {
    if (eve == null) {
      return null;
    } else {
      let a = [];
      Votes &&
        Votes.map((val, index) => {
          a[index] = val.proposals;
        });
      SetProposals(a);
      console.log("a", a);
    }
  }, [Votes]);

  const getMembers = async () => {
    const events = await contract.queryFilter(
      contract.filters.NewProposal(eve[0].groupId)
    );
    const members = await contract.queryFilter(contract.filters.MemberAdded());
    console.log("members", members);
    console.log("events", events);
    return events.map((e) => ({
      groupId: e.args[0],
      members: members
        .filter((m) => m.args[0].eq(e.args[0]))
        .map((m) => m.args[1].toString()),
    }));
  };
  console.log("GetMembers", getMembers());

  const vote = async (proposals, position) => {
    SetVoting(true);
    let b = [];
    for (let i = 0; i < proposals.length; i++) {
      b[i] = ethers.utils.parseBytes32String(proposals[i]);
    }

    console.log("b", b);
    const mem = await getMembers();
    const group = new Group();
    group.addMembers(mem[0].members);
    console.log("group", group);
    const externalNullifier = ethers.BigNumber.from(group.root).toString();
    console.log("externalnullifier", externalNullifier);

    let id = ethers.BigNumber.from(eve[0].groupId).toString();
    console.log("proposalsssss", proposals);
    const fullProof = await generateProof(identitycommitment, group, id, b[0], {
      zkeyFilePath: "/semaphore.zkey",
      wasmFilePath: "/semaphore.wasm",
    });
    console.log("fullProoff", fullProof);
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
      {eve == 0 ? (
        <div style={{ marginLeft: 30, marginTop: 20 }}>
          <h1>This id does not exist!!</h1>
        </div>
      ) : (
        <div className=" flex-col justify-center m-2 p-2 ">
          {eve && (
            <h2 className=" text-2xl">
              Id: {ethers.BigNumber.from(eve[0].groupId).toString()}
            </h2>
          )}
          <h3 className=" flex-col justify-center text-2xl bold w-80 m-2 p-2">
            {Votes &&
              Votes.map((val, index) => {
                return (
                  <div key={index}>
                    {" "}
                    {ethers.utils.parseBytes32String(val.proposals)}:{" "}
                    {/* {ethers.BigNumber.from(val.votes).toString()} votes */}
                    <div className="border-2 border-blue-500 ">
                      {
                        <Input
                          placeholder="Votes"
                          value={Position[index]}
                          onChange={(e) =>
                            updatePosition(index, e.target.value)
                          }
                        ></Input>
                      }
                    </div>
                  </div>
                );
              })}
            {
              <p className="flex flex-col justify-center">
                Remaining Votes: {RemainingVotes}
              </p>
            }
          </h3>
          <div className="flex flex-col justify-center">
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
              {EventData && EventData[0] && EventData[0].time != 0 ? (
                <h2 className=" text-2xl italic">
                  {" "}
                  Start Time:{" "}
                  {new Date(
                    Number(EventData[0].time) * 1000
                  ).toLocaleString()}{" "}
                </h2>
              ) : (
                <h2 className="text-3xl">
                  <b>Status: </b>Not Started
                </h2>
              )}
            </div>
          }

          {signer._address === Coordinator ? (
            <div className="bold text-2xl">
              <Button
                className="bold text-2xl"
                onClick={async () => {
                  await contract.StartPoll(
                    ethers.BigNumber.from(eve[0].groupId).toString()
                  );
                }}
              >
                Start Poll
              </Button>
            </div>
          ) : (
            ""
          )}
          <div className="border-2 border-green-600 ">
            <h3 className="text-4xl flex justify-center ">
              {" "}
              Current Voting situation{" "}
            </h3>
            {Votes &&
              Votes.map((val, index) => {
                return (
                  <div key={index} className="text-3xl ">
                    {" "}
                    {ethers.utils.parseBytes32String(val.proposals)}:{" "}
                    <b>{ethers.BigNumber.from(val.votes).toString()}</b> votes
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
