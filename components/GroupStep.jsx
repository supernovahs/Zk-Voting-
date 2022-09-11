import React from "react";
import { useState, useCallBack, useEffect } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input } from "@chakra-ui/react";
import AddressInput from "./EthComponents/AddressInput";

const { ethers } = require("ethers");

export default function GroupStep({
  contract,
  identitycommitment,
  onSelect,
  mainnetprovider,
  signer,
}) {
  const [Events, Setevents] = useState();
  const [NewEventName, SetNewEventName] = useState();
  const [NewEventDescription, SetNewEventDescription] = useState();
  const [Proposals, SetProposals] = useState([]);
  const [Coordinator, SetCoordinator] = useState();

  // async function getEvents() {
  //   const events =
  //     contract && (await contract.queryFilter(contract.filters.NewProposal()));
  //   const members =
  //     contract && (await contract.queryFilter(contract.filters.MemberAdded()));
  //   const start =
  //     contract && (await contract.queryFilter(contract.filters.VoteStarts()));
  //   const end =
  //     contract && (await contract.queryFilter(contract.filters.VoteEnds()));

  //   return events.map((e) => ({
  //     groupId: e.args[0],
  //     eventName: e.args[1],
  //     members: members
  //       .filter((m) => m.args[0].eq(e.args[0]))
  //       .map((m) => m.args[1].toString()),
  //     coordinator: e.args[2],
  //     description: e.args[3],
  //     start: start.filter((m) => m.args[0].eq(e.args[0])).map((m) => m.args[1]),
  //     end: end.filter((m) => m.args[0].eq(e.args[0])).map((m) => m.args[1]),
  //   }));
  // }

  // useEffect(() => {
  //   async function updateevents() {
  //     const events = await getEvents();
  //     Setevents(events);
  //   }
  //   updateevents();
  // }, [contract]);

  const updateProposals = (value, index) => {
    let proposals = [...Proposals];
    proposals[index] = value;
    SetProposals(proposals);
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

  const CreateProposal = async () => {
    let proposals = [...Proposals];

    const newproposals = proposals.map((val, index) => {
      if (val.length < 32) {
        return ethers.utils.formatBytes32String(val);
      }
      return val;
    });
    SetProposals(newproposals);

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
              <AddressInput
                className=" mb-4 p-2 "
                placeholder="Coordinator"
                value={Coordinator}
                ensProvider={mainnetprovider}
                onChange={(e) => SetCoordinator(e)}
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
        </div>
      </div>
    </div>
  );
}
