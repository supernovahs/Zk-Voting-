import React from "react";
import { useState, useCallBack, useEffect } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Box, Button, Heading, Input } from "@chakra-ui/react";
import AddressInput from "./EthComponents/AddressInput";
import abi from "../helpers/ZkVote.json";

const { ethers } = require("ethers");

export default function GroupStep({
  mainnetprovider,
  signer,
}) {
  const [Events, Setevents] = useState();
  const [NewEventName, SetNewEventName] = useState();
  const [NewEventDescription, SetNewEventDescription] = useState();
  const [Proposals, SetProposals] = useState([""]);
  const [Coordinator, SetCoordinator] = useState();
  const [Fund,SetFund] = useState(0);
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi.abi,
    signer
  );

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
    // let proposals = [...Proposals];

    // const newproposals = proposals.map((val, index) => {
    //   if (val.length < 32) {
    //     return ethers.utils.formatBytes32String(val);
    //   }
    //   return val;
    // });
    // SetProposals(newproposals);
    console.log("Proposals", Proposals);
    await contract.NewVoteInstance(
      ethers.utils.formatBytes32String(NewEventName),
      NewEventDescription,
      Proposals,
      Coordinator,
      20,
      0,{value: (Fund ? ethers.utils.parseEther(Fund ).toString() : 0) }
    );
    SetCoordinator("");
    SetNewEventDescription("");
    SetNewEventName("");
    SetProposals("");
    SetFund("");
  };

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      my={"100px"}
      textAlign={"center"}
    >
      <Box
        backdropFilter={"blur(16px) saturate(180%)"}
        backgroundColor={"rgba(17, 25, 40, 0.88)"}
        borderRadius={20}
        border={"1px solid rgba(255, 255, 255, 0.125)"}
        padding={"2.5rem"}
        width={"50%"}
        margin={"auto"}
        boxShadow={"0 10px 10px -5px rgba(156, 255, 0, 0.7)"}
      >
        <Heading borderBottom={"1px solid white"} pb={2} mb={5}>
          Create a new vote
        </Heading>
        <Input
          my={3}
          placeholder="Enter Vote proposal Name"
          value={NewEventName}
          onChange={(e) => SetNewEventName(e.target.value)}
        />
        <Input
          my={3}
          placeholder="Enter Description of Voting "
          value={NewEventDescription}
          onChange={(e) => SetNewEventDescription(e.target.value)}
        />
        <Box my={3}>
          {Proposals.map((proposal, index) => (
            <Box my={3} key={index} display={"flex"}>
              <Input
                placeholder="Enter address"
                value={proposal}
                onChange={(e) => updateProposals(e.target.value, index)}
                mb={3}
              />
              {index >= 0 && (
                <Button
                  ml={5}
                  onClick={() => {
                    RemoveProposals(index);
                  }}
                >
                  <DeleteOutlined />
                </Button>
              )}
              {index === Proposals.length - 1 && (
                <Button
                  ml={5}
                  onClick={() => {
                    AddProposals();
                  }}
                >
                  <PlusOutlined />
                </Button>
              )}
            </Box>
          ))}
        </Box>
        <Box my={3}>
          <AddressInput
            placeholder="Coordinator"
            value={Coordinator}
            ensProvider={mainnetprovider}
            onChange={(e) => SetCoordinator(e)}
          />
        </Box>
        <Box my={3}>
          <Input
            placeholder="Ether to distribute"
            value= {Fund}
            onChange={e=> SetFund(e.target.value)}
          />
        </Box>
        <Button
          justifySelf={"center"}
          mt={3}
          colorScheme="green"
          onClick={async () => {
            await CreateProposal();
          }}
        >
          Create Proposal
        </Button>
      </Box>
    </Box>
  );

}
