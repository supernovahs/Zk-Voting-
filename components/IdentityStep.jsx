import React, { useState, useCallback, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Button, Input } from "@chakra-ui/react";
import { useEnsResolver } from "wagmi";
import copy from "copy-to-clipboard";
const { ethers } = require("ethers");
export default function IdentityStep({ onChange, onNextClick }) {
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
      onChange(_identity);
    } else {
      console.log("Create new identity");
      alert("Please create New Identity");
    }
  }
  const copyToClipboard = (text) => {
    copy(text);
    SetCopied("Copied Successfully !!");
  };

  const CreateNewidentity = async () => {
    const identitynew = new Identity();
    setIdentity(identitynew);
    const publicid = identitynew.generateCommitment();
    let a = ethers.BigNumber.from(publicid).toString();
    console.log("identitycommitment", a);

    window.localStorage.setItem("identitycommitment", identitynew.toString());
    onChange(identitynew);
  };

  return (
    <div>
      <div style={{ border: "2px solid black", padding: 10, margin: 10 }}>
        <h3>What is semaphore?</h3>
        <p>
          Semaphore is a zero-knowledge protocol that allows users to prove
          their membership in a group and send signals such as votes or
          endorsements without revealing their identity. Additionally, it
          provides a simple mechanism to prevent double-signaling.
        </p>
      </div>
      <div>
        <h2>Identities</h2>
        <p>To vote anonymously , you need to generate a unique identity.</p>

        <div style={{ margin: 10, padding: 10 }}>
          <Button
            onClick={async () => {
              await checkidentity();
            }}
          >
            Load Existing
          </Button>
        </div>
        <h3>New identity Generate </h3>

        {identity ? (
          <ul>
            {identity && (
              <li>
                Trapdoor: {""}
                {identity ? identity.getTrapdoor().toString() : ""}{" "}
                <b>Don&apos;t share this </b>
                <Button
                  onClick={() => {
                    copyToClipboard(identity.getTrapdoor().toString());
                  }}
                >
                  Copy
                </Button>
                {Copied}
              </li>
            )}
            {identity && (
              <li>
                Nullifier:{""}
                {identity ? identity.getNullifier().toString() : ""}{" "}
                <b>Don&apos;t Share this </b>
                <Button
                  onClick={() => {
                    copyToClipboard(identity.getNullifier().toString());
                  }}
                >
                  Copy
                </Button>
                {Copied}
              </li>
            )}
            {identity && (
              <li>
                Commitment:{""}
                {identity ? identity.generateCommitment().toString() : ""}{" "}
                <b> This is your public ID</b>{" "}
                <b>
                  <Button
                    onClick={() => {
                      copyToClipboard(identity.generateCommitment().toString());
                    }}
                  >
                    Copy
                  </Button>
                  {Copied}
                </b>
              </li>
            )}
          </ul>
        ) : (
          <div style={{ padding: 10, margin: 10 }}>
            <Button
              onClick={async () => {
                CreateNewidentity();
              }}
            >
              Create Identity
            </Button>
          </div>
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
