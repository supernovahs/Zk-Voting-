import React from "react";
import abi from "../helpers/ZkVote.json";
import { useState, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import {
  Box,
  Button,
  Heading,
  Input,
  Spinner,
  Tag,
  Text,
  Textarea,
} from "@chakra-ui/react";
import Link from "next/link";
import { useSigner } from "wagmi";
import TextArea from "antd/lib/input/TextArea";
const ethers = require("ethers");

export default function Activeproposals() {
  const { data: signer, isError, isLoading } = useSigner();
  const [Events, Setevents] = useState();
  const [NewVoter, SetNewVoter] = useState();
  const [_identity, _setidentity] = useState();
  const [loading, setLoading] = useState(false);
  async function getEvents() {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_GOERLI_API
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

    return events.map((e) => ({
      groupId: e.args[0],
      eventName: e.args[1],
      members: members
        .filter((m) => m.args[0].eq(e.args[0]))
        .map((m) => m.args[1].toString()),
      coordinator: e.args[2],
      description: e.args[3],
      start: start.filter((m) => m.args[0].eq(e.args[0])).map((m) => m.args[1]),
      end: start.filter((m) => m.args[0].eq(e.args[0])).map((m) => m.args[2]),
    }));
  }

  useEffect(() => {
    setLoading(true);
    async function updateevents() {
      const events = await getEvents();
      Setevents(events);
    }
    updateevents();
    setLoading(false);
  }, []);

  if (!Events) {
    return (
      <Box
        width={"100vw"}
        height={"80vh"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Spinner size={"xl"} />
      </Box>
    );
  }

  return (
    <Box
      display={"flex"}
      mx={"200px"}
      my={20}
      flexWrap={"wrap"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      {Events &&
        Events.map((value, i) => {
          let name = ethers.utils.parseBytes32String(value.eventName);
          let id = ethers.BigNumber.from(value.groupId).toString();
          console.log("id",id);
          let members = value.members;
          let isMember = false;
          let des = value.description;
          let admin = value.coordinator;
          for (let i = 0; i < members.length; i++) {
            console.log(
              "members",
              members[i],
              "identity",
              _identity?.generateCommitment().toString()
            );
            if (members[i] == _identity?.generateCommitment().toString()) {
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
          let a = isMember ? "You are a member" : "Not Member";

          return (
            <Box
              border={"1px solid rgba(255, 255, 255, 0.125)"}
              boxShadow={"0 10px 10px -5px rgba(156, 255, 0, 0.7)"}
              padding={"2.5rem"}
              borderRadius={20}
              backgroundColor={"rgba(17, 25, 40, 0.88)"}
              m={5}
              width={"400px"}
              // textAlign={"center"}
            >
              <Heading mb={5}>{name}</Heading>
              <Text mb={3} fontSize={"xl"}>
                ID: {id.substring(0, 18)}...
              </Text>
              <Text mb={5} fontSize={"xl"}>
                Status: {status}...
              </Text>
              {/* <Text mb={2} fontSize={"l"}>
                DESCRIPTION
              </Text> */}
              <Box
                width={"100%"}
                height={"100px"}
                borderRadius={10}
                padding={3}
                border={"1px solid rgba(255, 255, 255, 0.125)"}
                mb={5}
                overflow={"auto"}
              >
                {des}
              </Box>
              <Box mb={5} display={"flex"}>
                <Button disabled={true}>{a}</Button>
                <Button ml={5}>
                  <Link href={"Vote/" + id}>Open</Link>
                </Button>
              </Box>
              {signer && signer._address == admin ? (
                <Box>
                  <Input
                    placeholder="Add voter credentials"
                    value={NewVoter}
                    onChange={(e) => SetNewVoter(e.target.value)}
                    mb={5}
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
                        let arr = [];
                        console.log("newVoter",NewVoter);
                        arr.push(NewVoter);
                        console.log("arr",arr);
                        const tx = await contractwithsigner.Addvoter(
                          id,
                          arr
                        );
                        console.log("tx", tx);
                    }}
                  >
                    Add Members
                  </Button>
                </Box>
              ) : (
                <Tag colorScheme={"red"}>You are not Admin</Tag>
              )}
            </Box>
          );

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
    </Box>
  );
}
