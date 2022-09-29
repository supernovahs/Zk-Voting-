import React, { useEffect } from "react";
import { useState } from "react";
import { keccak256 } from "@ethersproject/solidity";
const { Group } = require("@semaphore-protocol/group");
import { Button, Input } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { useCallback } from "react";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

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
  const [date, Setdate] = useState(new Date());
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
  const [UpdateVotes, SetUpdateVotes] = useState(false);
  const [EndTime, SetEndTime] = useState();
  let BACKEND_URL = "https://zkvotebackend.herokuapp.com/";

  const getEvents = useCallback(async () => {
    if (!contract || !eve || eve?.length === 0) {
      return [];
    }

    console.log("eve", eve);
    const start = await contract.queryFilter(
      contract.filters.VoteStarts(eve[0].groupId)
    );

    console.log(start);
    return start.map((e) => ({
      groupId: e.args[0],
      time: e.args[1],
    }));
  }, [contract, eve]);

  useEffect(() => {
    async function updateEvents() {
      if (eve == 0 || !eve || eve?.length === 0 || !contract) {
        return null;
      } else {
        const events = await getEvents();
        SetEventData(events);

        const pollInstance = await contract.polls(
          ethers.BigNumber.from(eve[0].groupId).toString()
        );
        const coordinator = pollInstance.coordinator;
        SetCoordinator(coordinator);
        const endtime = pollInstance.endtime;
        SetEndTime(ethers.BigNumber.from(endtime).toString());
        SetId(ethers.BigNumber.from(eve[0].groupId).toString());
        let z = await contract.getlatestVotes(
          ethers.BigNumber.from(eve[0].groupId).toString()
        );
        console.log("Votes", z);
        SetVotes(z);
      }
    }
    updateEvents();
  }, [eve, UpdateVotes, getEvents, contract]);

  useEffect(() => {
    if (eve == null) {
      return null;
    } else {
      let a = [];
      Votes &&
        Votes.map((val, index) => {
          console.log("val", val);
          a[index] = val.IndividualGrantee;
        });
      SetProposals(a);
      console.log("a", a);
    }
  }, [Votes, eve]);

  const getMembers = async () => {
    if (!contract) {
      return [];
    }
    const events = await contract.queryFilter(
      contract.filters.NewProposal(eve[0].groupId)
    );
    const members = await contract.queryFilter(contract.filters.MemberAdded());

    return events.map((e) => ({
      groupId: e.args[0],
      members: members
        .filter((m) => m.args[0].eq(e.args[0]))
        .map((m) => m.args[1].toString()),
    }));
  };

  const vote = async (proposals, position) => {
    SetVoting(true);
    let b = [];
    for (let i = 0; i < proposals.length; i++) {
      b[i] = proposals[i];
    }

    const mem = await getMembers();
    const group = new Group();
    group.addMembers(mem[0].members);
    let id = ethers.BigNumber.from(eve[0].groupId).toString();

    console.log(
      "Keccak256 of vote",
      "b[0]",
      b[0],
      keccak256(["address"], [b[0]])
    );
    const fullProof = await generateProof(
      identitycommitment,
      group,
      id,
      keccak256(["address"], [b[0]]),
      {
        zkeyFilePath: "/semaphore.zkey",
        wasmFilePath: "/semaphore.wasm",
      }
    );
    let ps = fullProof.publicSignals;
    let hash = ps.nullifierHash;
    const solidityProof = packToSolidityProof(fullProof.proof);
    let isvoted = await contract.nullifierHashes(hash);
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
      if (status == 200) {
        SetUpdateVotes(!UpdateVotes);
      }

      console.log("status", status);
      console.log("adf");
    }
  };

  const updatePosition = (index, position) => {
    let a = Position;
    a[index] = position;
    SetPosition(a);

    let total = 0;
    for (let i = 0; i < Position.length; i++) {
      total += Position[i] * Position[i];
    }
    SetRemainingVotes(100 - total > 0 ? 100 - total : <p>Not enough votes</p>);
    if (RemainingVotes < 0) {
      SetNotEnoughVotes(true);
    }
  };
  const handleChange = (newValue) => {
    let time = (new Date(newValue).getTime() / 1000).toFixed(0);
    Setdate(time);
    console.log("Date", time);
  };

  const Unixtotime = (time) => {
    return new Date(time * 1000);
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
                console.log("val proposals", val.IndividualGrantee);
                return (
                  <div key={index}>
                    {" "}
                    {val.IndividualGrantee}:{" "}
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
                          {val.IndividualGrantee}:{" "}
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
          <div>
            <h2 className="text-2xl">
              {EndTime != 0 ? (
                <p>End time in Unix:{EndTime}</p>
              ) : (
                <p>&quot;Not Started&quot;</p>
              )}
            </h2>
          </div>

          {signer._address === Coordinator ? (
            <div className="bold text-2xl">
              <div className="">
                <div>
                  <Datetime value={date} onChange={handleChange} />
                </div>

                <Button
                  className="bold text-2xl"
                  onClick={async () => {
                    await contract.StartPoll(
                      ethers.BigNumber.from(eve[0].groupId).toString(),
                      date
                    );
                  }}
                >
                  Start Poll
                </Button>
              </div>
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
                    {val.IndividualGrantee}:{" "}
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
