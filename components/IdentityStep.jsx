import React, { useState, useCallback, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Button, Input } from "@chakra-ui/react";
import { useEnsResolver } from "wagmi";
import copy from "copy-to-clipboard";
import { CopyIcon } from "@chakra-ui/icons";
const { ethers } = require("ethers");
export default function IdentityStep({}) {
  const [identity, setIdentity] = useState("");
  const [Copied, SetCopied] = useState("");
  async function checkidentity() {
    const identityval = window.localStorage.getItem("identitycommitment");
    console.log("identityval", identityval);

    if (identityval) {
      const _identity = new Identity(identityval);
      setIdentity(_identity);
      window.localStorage.setItem("identitycommitment", _identity);
      console.log("_identity", _identity);
      console.log("Successfully loaded identity");
    } else {
      console.log("Create new identity");
      alert("Please create New Identity");
    }
  }
  const copyToClipboard = (text) => {
    copy(text);
  };

  const CreateNewidentity = async () => {
    const identitynew = new Identity();
    setIdentity(identitynew);
    const publicid = identitynew.generateCommitment();
    let a = ethers.BigNumber.from(publicid).toString();
    console.log("identitycommitment", a);

    window.localStorage.setItem("identitycommitment", identitynew);
  };

  return (
    <div>
      <div>
        <h2 className="flex justify-center text-2xl">Get Your Identity</h2>

        <div className=" flex justify-center">
          <Button
            className="mr-6 m-6"
            onClick={async () => {
              await checkidentity();
            }}
          >
            Load Existing Identity
          </Button>
          <Button
            className="ml-6 m-6"
            onClick={async () => {
              CreateNewidentity();
            }}
          >
            Create Identity
          </Button>
        </div>
        <div className="box-sizing border-2 border-black p-2 ">
          {identity && (
            <ul>
              <li className="">
                <p className="font-bold">Trapdoor: {""}</p>
                {identity ? identity.getTrapdoor().toString() : ""}{" "}
                <b>Don&apos;t share this </b>
                <Button
                  onClick={() => {
                    copyToClipboard(identity.getTrapdoor().toString());
                  }}
                >
                  <CopyIcon />
                </Button>
                {Copied}
              </li>

              <li>
                <p className="font-bold">Nullifier:{""}</p>
                {identity ? identity.getNullifier().toString() : ""}{" "}
                <b>Don&apos;t Share this </b>
                <Button
                  onClick={() => {
                    copyToClipboard(identity.getNullifier().toString());
                  }}
                >
                  <CopyIcon />
                </Button>
                {Copied}
              </li>

              <li>
                <p className="font-bold">Commitment:{""}</p>
                {identity ? identity.generateCommitment().toString() : ""}{" "}
                <b> This is your public ID</b>{" "}
                <b>
                  <Button
                    onClick={() => {
                      copyToClipboard(identity.generateCommitment().toString());
                    }}
                  >
                    <CopyIcon />
                  </Button>
                  {Copied}
                </b>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
