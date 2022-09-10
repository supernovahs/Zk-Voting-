import React, { useState, useEffect } from "react";
import ProofStep from "../../components/ProofStep";
import { useSigner } from "wagmi";
import { useRouter } from "next/router";
import abi from "../../helpers/ZkVote.json";
import { Identity } from "@semaphore-protocol/identity";
const { ethers } = require("ethers");

export default function Vote() {
  const { data: signer, isError, isLoading } = useSigner();
  const [Contract, SetContract] = useState();
  const [Mainnetprovider, SetMainnetprovider] = useState();
  const [Events, SetEvents] = useState();
  const [_Identity, SetIdentity] = useState();
  const router = useRouter();
  const { Vote } = router.query;
  console.log("Votes", Vote);

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi.abi,
    signer
  );
  console.log("contract", contract);
  useEffect(() => {
    const get = async () => {
      const iden = window.localStorage.getItem("identitycommitment");
      if (iden) {
        const identity = new Identity(iden);
        SetIdentity(identity);
      }
      const event = await getEvents();
      SetEvents(event);
      console.log("Eventss", Events);
    };
    get();
  }, []);

  async function getEvents() {
    const pollInstance = await contract.polls(Vote);
    console.log("pollinstance", pollInstance);

    if (pollInstance.coordinator == ethers.constants.AddressZero) {
      console.log("Not Poll Instance");
      return 0;
    }
    const pollstate = pollInstance.pollstate;

    if (pollstate == 0) {
      const start = await contract.queryFilter(
        contract.filters.NewProposal(Vote)
      );

      console.log("start", start);
      console.log("Poll state is 0 ");
      return start.map((e) => ({
        groupId: e.args[0],
        time: 0,
      }));
    } else if (pollstate == 1) {
      console.log("Poll state is 1 ");
      const start = await contract.queryFilter(
        contract.filters.VoteStarts(Vote)
      );
      return start.map((e) => ({
        groupId: e.args[0],
        time: e.args[1],
      }));
    } else if (pollstate == 2) {
      console.log("Poll state is 2 ");
      const start = await contract.queryFilter(contract.filters.VoteEnds(Vote));
      return start.map((e) => ({
        groupId: e.args[0],
        time: e.args[1],
      }));
    }
  }
  return (
    <div>
      {signer && Events && contract && Identity && (
        <ProofStep
          signer={signer}
          eve={Events}
          contract={contract}
          identitycommitment={_Identity}
        />
      )}
    </div>
  );
}
