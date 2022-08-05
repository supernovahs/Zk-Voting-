import React from "react";
import { useState, useCallBack, useEffect } from "react";
import { Button, Input } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
const { ethers } = require("ethers");
const BigNumber = require("bignumber.js");

export default function GroupStep({ contract, identitycommitment, onSelect }) {
  const [Events, Setevents] = useState();
  const [NewEventName, SetNewEventName] = useState();
  const [NewEventDescription, SetNewEventDescription] = useState();
  const [Proposals, SetProposals] = useState([]);
  const [Coordinator, SetCoordinator] = useState();
  const [NewVoter, SetNewVoter] = useState();

  async function getEvents() {
    const events = await contract.queryFilter(contract.filters.NewProposal());
    const members = await contract.queryFilter(contract.filters.MemberAdded());
    console.log("events", events);
    console.log("members", members);
    return events.map((e) => ({
      groupId: e.args[0],
      eventName: e.args[0],
      members: members
        .filter((m) => m.args[0].eq(e.args[0]))
        .map((m) => m.args[1].toString()),
    }));
  }
  console.log("Event call", getEvents());

  useEffect(() => {
    async function updateevents() {
      const events = await getEvents();
      // const a = 1;
      Setevents(events);
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

  return (
    <div>
      <h2>Groups</h2>
      <Button
        onClick={async () => {
          getEvents().then(Setevents);
        }}
      >
        Refresh
      </Button>

      <div>
        <div>
          <div
            style={{
              border: "2px solid black",
              padding: 10,
              width: 450,
              marginLeft: 50,
            }}
          >
            <h2>New Proposal</h2>
            <Input
              placeholder="Enter proposal Name"
              value={NewEventName}
              onChange={(e) => SetNewEventName(e.target.value)}
            />
            <Input
              placeholder="Enter Description"
              value={NewEventDescription}
              onChange={(e) => SetNewEventDescription(e.target.value)}
            />
            <div>
              {Proposals.map((proposal, index) => (
                <div key={index} style={{ display: "flex", gap: "1rem" }}>
                  <Input
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
              <Input
                placeholder="Coordinator"
                value={Coordinator}
                onChange={(e) => SetCoordinator(e.target.value)}
              />
            </div>
            <Button
              onClick={async () => {
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
              }}
            >
              Create Proposal
            </Button>
          </div>
          <div>
            {Events?.map((value, i) => {
              console.log("value", value.groupId, "index", i);
              let name = ethers.BigNumber.from(value.eventName).toString();
              let id = ethers.BigNumber.from(value.groupId).toString();
              return (
                <div
                  style={{ border: "2px solid black", margin: 10, padding: 10 }}
                >
                  <p>EventName :{name}</p>
                  <p>GroupId :{id}</p>
                  <Button
                    onClick={() => {
                      SelectEvent(value);
                    }}
                  >
                    Select
                  </Button>
                  <Input
                    placeholder="Add voter credentials"
                    value={NewVoter}
                    onChange={(e) => SetNewVoter(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      const tx = await contract.Addvoter(id, NewVoter);
                      console.log("tx", tx);
                    }}
                  >
                    Add Members
                  </Button>
                </div>
              );

              // {
              //   value.members.includes(identitycommitment) ? (
              //     <Button
              //       onClick={() => {
              //         onSelect(value);
              //       }}
              //     >
              //       Joined
              //     </Button>
              //   ) : (
              //     <Button
              //       onClick={() => {
              //         joinEvent(value);
              //       }}
              //     >
              //       Join
              //     </Button>
              //   );
              // }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
