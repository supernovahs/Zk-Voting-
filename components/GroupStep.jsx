import React from "react";
import { useState, useCallBack, useEffect } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input } from "@chakra-ui/react";
import Link from "next/link";

const { ethers } = require("ethers");

export default function GroupStep({
  contract,
  identitycommitment,
  onSelect,
  onNextClick,
  mainnetprovider,
  signer,
}) {
  const [Events, Setevents] = useState();
  const [NewEventName, SetNewEventName] = useState();
  const [NewEventDescription, SetNewEventDescription] = useState();
  const [Proposals, SetProposals] = useState([]);
  const [Coordinator, SetCoordinator] = useState();
  const [NewVoter, SetNewVoter] = useState();

  async function getEvents() {
    const events = await contract.queryFilter(contract.filters.NewProposal());
    const members = await contract.queryFilter(contract.filters.MemberAdded());
    const start = await contract.queryFilter(contract.filters.VoteStarts());
    const end = await contract.queryFilter(contract.filters.VoteEnds());
    console.log("events", events);
    console.log("members", members);
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
  console.log("Event call", getEvents());

  useEffect(() => {
    async function updateevents() {
      const events = await getEvents();
      Setevents(events);
      console.log("events", events);
    }
    updateevents();
  }, []);

  const updateProposals = (value, index) => {
    console.log("value", value);
    let proposals = [...Proposals];
    proposals[index] = value;
    SetProposals(proposals);
    console.log("proposals", Proposals);
  };

  const RemoveProposals = (index) => {
    let proposals = [...Proposals];
    proposals.splice(index, 1);
    SetProposals(proposals);
  };

  const AddProposals = () => {
    let newproposals = [...Proposals, ""];
    SetProposals(newproposals);
  };

  console.log("coordinator", Coordinator);
  console.log("Events", Events);
  const joinEvent = async (e) => {};

  const SelectEvent = (e) => {
    getEvents();
    console.log("event cehck ", e);
    onSelect(e);
  };

  const getEnsAddress = async (name) => {
    let ensaddress = await mainnetprovider.resolveName(name);
    console.log("ensaddress", ensaddress);
    if (ensaddress) {
      return ensaddress;
    } else {
      return null;
    }
  };

  const CreateProposal = async () => {
    let proposals = [...Proposals];

    const newproposals = proposals.map((val, index) => {
      if (val.length < 32) {
        console.log("Index", index, val);
        console.log(
          "proposal in bytes ",
          ethers.utils.formatBytes32String(val)
        );
        return ethers.utils.formatBytes32String(val);
      }
      return val;
    });
    SetProposals(newproposals);
    console.log(
      "event in bytes",
      ethers.utils.formatBytes32String(NewEventName)
    );
    console.log(
      "Event Description",
      "newproposals",
      "coordinator",
      NewEventDescription,
      newproposals,
      Coordinator
    );

    await contract.NewVoteInstance(
      ethers.utils.formatBytes32String(NewEventName),
      NewEventDescription,
      newproposals,
      Coordinator,
      20,
      0
    );
  };

  return (
    <div className="border-4 border-black  flex-col justify-center m-2 p-2  ">
      <h2 className="flex justify-center text-3xl mt-4">
        Create a New Proposal
      </h2>
      {/* <Button
        onClick={async () => {
          getEvents().then(Setevents);
        }}
      >
        Refresh
      </Button> */}
      <div className="flex justify-center  ">
        <div>
          <div className=" mb-4 w-80">
            <Input
              placeholder="Enter Vote proposal Name"
              value={NewEventName}
              onChange={(e) => SetNewEventName(e.target.value)}
            />
          </div>
          <div className=" mb-4 w-80">
            <Input
              placeholder="Enter Description of Voting "
              value={NewEventDescription}
              onChange={(e) => SetNewEventDescription(e.target.value)}
            />
          </div>

          <div className="   p-2">
            {Proposals.map((proposal, index) => (
              <div key={index} className="border-red-300 w-80">
                <Input
                  className="p-2 mb-2 "
                  placeholder="Enter proposal name"
                  value={proposal}
                  onChange={(e) => updateProposals(e.target.value, index)}
                />
                {index > 0 && (
                  <Button
                    onClick={() => {
                      RemoveProposals(index);
                    }}
                  >
                    <DeleteOutlined />
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={() => {
                AddProposals();
              }}
            >
              <PlusOutlined />
            </Button>
            <div className="w-80 mb-2 ">
              <Input
                className=" mb-4 p-2 "
                placeholder="Coordinator"
                value={Coordinator}
                onChange={(e) => SetCoordinator(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="hover:bg-indigo-600"
            onClick={async () => {
              await CreateProposal();
            }}
          >
            Create Proposal
          </Button>

          {/* <div>
            {Events &&
              Events.map((value, i) => {
                console.log("value", value.groupId, "index", i);
                let name = ethers.utils.parseBytes32String(value.eventName);
                let id = ethers.BigNumber.from(value.groupId).toString();
                let members = value.members;
                console.log("Mem", members);
                let isMember = false;
                let des = value.description;
                let admin = value.coordinator;

                for (let i = 0; i < members.length; i++) {
                  console.log("checking if member");

                  if (
                    members[i] ==
                    identitycommitment.generateCommitment().toString()
                  ) {
                    console.log("is Member");
                    isMember = true;
                  }
                }
                let currentstatus = "Created";
                console.log("value start ", value.start);

                let status =
                  value.start.length != 0
                    ? (currentstatus = " Voting Started")
                    : value.end.length != 0
                    ? (currentstatus = "Voting Ended")
                    : (currentstatus = "Created");
                console.log("status", status);
                let a = isMember ? "You are a member " : "Not Member";
                return (
                  <div
                    style={{
                      border: "2px solid black",
                      margin: 10,
                      padding: 10,
                    }}
                    key={id}
                  >
                    <p>EventName :{name}</p>
                    <p>GroupId :{id}</p>
                    <p>Description of Vote: {des}</p>
                    <h2>{status}</h2>
                    <Button disabled={true}>{a}</Button>
                    <div style={{ padding: 10, margin: 7 }}>
                      <Link href={"Vote/" + id}>Select</Link>
                    </div>
                    <Input
                      placeholder="Add voter credentials"
                      value={NewVoter}
                      onChange={(e) => SetNewVoter(e.target.value)}
                    />
                    {signer._address == admin ? (
                      <Button
                        onClick={async () => {
                          const tx = await contract.Addvoter(id, NewVoter);
                          console.log("tx", tx);
                        }}
                      >
                        Add Members
                      </Button>
                    ) : (
                      <p>You are not Admin</p>
                    )}
                  </div>
                );
              })}
          </div> */}
        </div>
      </div>
    </div>
  );
}
