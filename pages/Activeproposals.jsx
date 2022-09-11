import React from "react";
import abi from "../helpers/ZkVote.json";
import { useState, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Button, Input } from "@chakra-ui/react";
import Link from "next/link";
import { useSigner } from "wagmi";
const ethers = require("ethers");

export default function Activeproposals() {
  const { data: signer, isError, isLoading } = useSigner();
  const [Events, Setevents] = useState();
  const [NewVoter, SetNewVoter] = useState();
  const [_identity, _setidentity] = useState();
  async function getEvents() {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-goerli.g.alchemy.com/v2/RcYr3KRxoKeP5zh3OSZ3uVVx00sOi-5R"
    );
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      abi.abi,
      provider
    );
    const identitycommitment =
      window.localStorage.getItem("identitycommitment");
    if (identitycommitment) {
      const identity = new Identity(identitycommitment);
      _setidentity(identity);
    }

    const events = await contract.queryFilter(contract.filters.NewProposal());
    const members = await contract.queryFilter(contract.filters.MemberAdded());
    const start = await contract.queryFilter(contract.filters.VoteStarts());
    const end = await contract.queryFilter(contract.filters.VoteEnds());

    return events.map((e) => ({
      groupId: e.args[0],
      eventName: e.args[1],
      members: members
        .filter((m) => m.args[0].eq(e.args[0]))
        .map((m) => m.args[1].toString()),
      coordinator: e.args[2],
      description: e.args[3],
      start: start.filter((m) => m.args[0].eq(e.args[0])).map((m) => m.args[1]),
      end: end.filter((m) => m.args[0].eq(e.args[0])).map((m) => m.args[1]),
    }));
  }

  useEffect(() => {
    async function updateevents() {
      const events = await getEvents();
      console.log("events", events);
      Setevents(events);
    }
    updateevents();
  }, []);

  return (
    <div>
      {Events &&
        Events.map((value, i) => {
          let name = ethers.utils.parseBytes32String(value.eventName);
          let id = ethers.BigNumber.from(value.groupId).toString();
          let members = value.members;
          let isMember = false;
          let des = value.description;
          let admin = value.coordinator;
          for (let i = 0; i < members.length; i++) {
            console.log(
              "members",
              members[i],
              "identity",
              _identity.generateCommitment().toString()
            );
            if (members[i] == _identity.generateCommitment().toString()) {
              isMember = true;
            }
          }
          let currentstatus = "Created";

          let status =
            value.start.length != 0
              ? (currentstatus = " Voting Started")
              : value.end.length != 0
              ? (currentstatus = "Voting Ended")
              : (currentstatus = "Created");
          let a = isMember ? "You are a member " : "Not Member";
          return (
            <div className="border-2 border-black p-2 m-2" key={id}>
              <p className="text-3xl font-bold">{name}</p>
              <p className="text-3xl font-bold">Id :{id.substring(0, 18)}...</p>
              <p className="text-3xl italic ">Description : {des}</p>
              <h2 className="flex justify-end  font-bold">{status}</h2>
              <Button disabled={true}>{a}</Button>
              <div className="text-1xl border-2 border-black w-14 flex justify-end m-2 p-1 bg-pink-400">
                <Link href={"Vote/" + id}>Open</Link>
              </div>

              {signer && signer._address == admin ? (
                <div className="w-60">
                  <Input
                    placeholder="Add voter credentials"
                    value={NewVoter}
                    onChange={(e) => SetNewVoter(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      if (!signer) {
                        alert("Please connect Wallet");
                      }
                      const contractwithsigner = new ethers.Contract(
                        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                        abi.abi,
                        signer
                      );
                      const tx = await contractwithsigner.Addvoter(
                        id,
                        NewVoter
                      );
                      console.log("tx", tx);
                    }}
                  >
                    Add Members
                  </Button>
                </div>
              ) : (
                <p>You are not Admin</p>
              )}
            </div>
          );
        })}
    </div>
  );
}
