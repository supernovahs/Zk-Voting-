import React, { useState, useCallback, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Button } from "antd";
const { ethers } = require("ethers");
export default function IdentityStep({ onChange, onNextClick }) {
  const [identity, setIdentity] = useState("");

  async function checkidentity() {
    const identityval = window.localStorage.getItem("identitycommitment");

    if (identityval) {
      const _identity = new Identity(identityval);
      setIdentity(_identity);
      console.log("Successfully loaded identity");
      onChange(_identity);
    } else {
      console.log("Create new identity");
    }
  }

  const CreateNewidentity = async () => {
    const identitynew = new Identity();
    setIdentity(identitynew);
    const publicid = identitynew.generateCommitment();
    let a = ethers.BigNumber.from(publicid).toString();
    console.log("identitycommitment", a);

    localStorage.setItem("identitycommitment", identitynew.toString());
    onChange(identitynew);
  };

  return (
    <div>
      <div>
        <h2>Identities</h2>
        <p>To vote anonymously , you need to generate a unique identity.</p>
        <ul>
          <li>
            Trapdoor:{identity ? identity.getTrapdoor().toString() : ""}{" "}
            private,only known by user
          </li>
          <li>
            Nullifier:{identity ? identity.getNullifier().toString() : ""}{" "}
            Private: only known by user
          </li>
          <li>
            Commitment:
            {identity
              ? identity.generateCommitment().toString()
              : ""} public{" "}
          </li>
        </ul>
        <h3>New identity Generate </h3>
        <Button
          onClick={async () => {
            await checkidentity();
          }}
        >
          Load Existing
        </Button>
        <Button
          onClick={async () => {
            CreateNewidentity();
          }}
        >
          New
        </Button>
        {identity ? (
          <ul>
            <li>
              {/* Trapdoor: {identity.getTrapdoor().toString().substring(0, 30)} */}
            </li>
            <li>
              {/* Nullifier: {identity.getNullifier().toString().substring(0, 30)} */}
            </li>
            <li>
              Commitment:{" "}
              {/* {identity.generateCommitment().toString().substring(0, 30)} */}
            </li>
          </ul>
        ) : (
          <Button
            onClick={async () => {
              CreateNewidentity();
            }}
          >
            Create Identity
          </Button>
        )}
        <Button
          onClick={() => {
            onNextClick();
          }}
        >
          Next{" "}
        </Button>
      </div>
    </div>
  );
}
