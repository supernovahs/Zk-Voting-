import React, { useState, useEffect } from "react";
import ProofStep from "../../components/ProofStep";
import { useSigner } from "wagmi";
import { useRouter } from "next/router";
import abi from "../../helpers/ZkVote.json";
import { Identity } from "@semaphore-protocol/identity";
import { useCallback } from "react";
import { useMemo } from "react";
const { ethers } = require("ethers");

export default function Vote() {
  const { data: signer, isError, isLoading } = useSigner();
  const [Events, SetEvents] = useState();
  const [_Identity, SetIdentity] = useState();
  const router = useRouter();
  const { voteId } = router.query;
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_MUMBAI_API
  );
  console.log("provider", provider);
  console.log("signer", signer);
  const contract = useMemo(
    () =>
      new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi.abi,
        signer
      ),
    [signer]
  );

  const readcontract = useMemo(
    () =>
      new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi.abi,
        provider
      ),
    [signer]
  );

  const getEvents = useCallback(async () => {
    console.log("voteid", voteId);
    if (!voteId || !contract) {
      return [];
    }
    try {
      const pollInstance = await contract.polls(voteId);

      if (pollInstance.coordinator == ethers.constants.AddressZero) {
        return 0;
      }
      const pollstate = pollInstance.pollstate;

      if (pollstate == 0) {
        const start = await contract.queryFilter(
          contract.filters.NewProposal(voteId)
        );

        return start.map((e) => ({
          groupId: e.args[0],
          time: 0,
        }));
      } else if (pollstate == 1) {
        const start = await contract.queryFilter(
          contract.filters.VoteStarts(voteId)
        );
        return start.map((e) => ({
          groupId: e.args[0],
          time: e.args[1],
        }));
      } else if (pollstate == 2) {
        const start = await contract.queryFilter(
          contract.filters.VoteEnds(voteId)
        );
        return start.map((e) => ({
          groupId: e.args[0],
          time: e.args[1],
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, [voteId, contract]);

  useEffect(() => {
    const get = async () => {
      const iden = window.localStorage.getItem("identitycommitment");
      if (iden) {
        const identity = new Identity(iden);
        SetIdentity(identity);
      }
      const event = await getEvents();
      SetEvents(event);
    };
    get();
  }, [getEvents]);

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
