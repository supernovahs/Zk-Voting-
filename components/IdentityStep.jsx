import React, { useState, useCallback, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Button } from "antd";
const BigNumber = require("bignumber.js");

export default function IdentityStep({ onChange, onNextClick }) {
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    const identityval = window.localStorage.getItem("identitycommitment");

    if (identityval) {
      setIdentity(identityval);
      console.log("Successfully loaded identity");
    } else {
      console.log("Create new identity");
    }
  }, []);

  const CreateNewidentity = async () => {
    const identitynew = new Identity();
    setIdentity(identitynew);
    const publicid = identitynew.generateCommitment();
    let a = new BigNumber(publicid);
    console.log("identitycommitment", a.toFixed());

    localStorage.setItem("identitycommitment", identitynew);
    onChange(identitynew);
  };

  return (
    <div>
      <div>
        <h2>Identities</h2>
        <p>To vote anonymously , you need to generate a unique identity.</p>
        <ul>
          <li>Trapdoor: private,only known by user</li>
          <li>Nullifier: Private: only known by user</li>
          <li>Commitment: public </li>
        </ul>
        <h3>New identity Generate </h3>
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
