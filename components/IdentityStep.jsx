import React, { useState, useCallback, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Box, Button, Heading, Input, Spinner, Text } from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import { IconButton } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { useSigner } from "wagmi";
const { ethers } = require("ethers");

export default function IdentityStep({}) {
  const { data: signer, isError, isLoading } = useSigner();
  const [identity, setIdentity] = useState("");
  const [TrapdoorCopied, SetTrapdoorCopied] = useState(false);
  const [NullifierCopied, SetNullifierCopied] = useState(false);
  const [CommitmentCopied, SetCommitmentCopied] = useState(false);
  const [SecretString, SetSecretString] = useState();
  const [loading, setLoading] = useState(false);
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

  // const CreateNewidentity = async () => {
  //   const identitynew = new Identity();
  //   setIdentity(identitynew);
  //   const publicid = identitynew.generateCommitment();
  //   let a = ethers.BigNumber.from(publicid).toString();
  //   console.log("identitycommitment", a);

  //   window.localStorage.setItem("identitycommitment", identitynew);
  // };

  const CreateDeterministicidentity = async (hash) => {
    const identitynew = new Identity(hash);
    setIdentity(identitynew);
    const publicid = identitynew.generateCommitment();
    let a = ethers.BigNumber.from(publicid).toString();
    console.log("identitycommitment", a);
    window.localStorage.setItem("identitycommitment", identitynew);
  };

  return (
    <Box display={"flex"} mx={10} my={20} gap={20}>
      <Box
        border={"1px solid rgba(255, 255, 255, 0.125)"}
        boxShadow={"0 10px 10px -5px rgba(156, 255, 0, 0.7)"}
        padding={"2.5rem"}
        borderRadius={20}
        height={"inherit"}
        backgroundColor={"rgba(17, 25, 40, 0.88)"}
      >
        <Heading mb={5}>Get Your Identity</Heading>

        <Input
          mb={5}
          placeholder="Enter a secret message to generate Identity "
          value={SecretString}
          onChange={(e) => SetSecretString(e.target.value)}
        />
        <Button
          disabled={!SecretString}
          onClick={async () => {
            setLoading(true);
            const hash = await signer.signMessage(SecretString);
            CreateDeterministicidentity(hash);
            SetSecretString("");
            setLoading(false);
          }}
        >
          Create a Deterministic Identity
        </Button>
        <Button
          ml={5}
          onClick={async () => {
            await checkidentity();
          }}
        >
          Load Existing Identity
        </Button>
      </Box>
      <Box flexGrow={1}>
        {identity ? (
          <Box
            border={"1px solid rgba(255, 255, 255, 0.125)"}
            boxShadow={"0 10px 10px -5px rgba(156, 255, 0, 0.7)"}
            padding={"2.5rem"}
            borderRadius={20}
            height={"100%"}
            backgroundColor={"rgba(17, 25, 40, 0.88)"}
          >
            <ul>
              <Box mb={3} className="">
                <p className="font-bold">
                  Trapdoor (<b>Don&apos;t share this </b>) : {""}
                </p>
                {identity ? identity.getTrapdoor().toString() : ""}{" "}
                <IconButton
                  onClick={() => {
                    SetTrapdoorCopied(true);
                    copyToClipboard(identity.getTrapdoor().toString());
                  }}
                  colorScheme={TrapdoorCopied ? "green" : "blue"}
                  aria-label="Copy Trapdoor"
                  icon={<CopyIcon />}
                />
              </Box>

              <Box mb={3}>
                <p className="font-bold">
                  Nullifier (<b>Don&apos;t Share this </b>) :{""}
                </p>
                {identity ? identity.getNullifier().toString() : ""}{" "}
                <IconButton
                  onClick={() => {
                    copyToClipboard(identity.getNullifier().toString());
                    SetNullifierCopied(true);
                  }}
                  colorScheme={NullifierCopied ? "green" : "blue"}
                  aria-label="Copy Nullifier"
                  icon={<CopyIcon />}
                />
              </Box>

              <Box>
                <p className="font-bold">
                  Commitment (This is your Public ID) :{" "}
                </p>
                {identity ? identity.generateCommitment().toString() : " "}
                {"  "}
                {/* <b> This is your public ID</b>{" "} */}
                <b>
                  <IconButton
                    onClick={() => {
                      copyToClipboard(identity.generateCommitment().toString());
                      SetCommitmentCopied(true);
                    }}
                    colorScheme={CommitmentCopied ? "green" : "blue"}
                    aria-label="Copy Commitment"
                    icon={<CopyIcon />}
                  />
                </b>
              </Box>
            </ul>
          </Box>
        ) : (
          <Box
            border={"1px solid rgba(255, 255, 255, 0.125)"}
            boxShadow={"0 10px 10px -5px rgba(156, 255, 0, 0.7)"}
            padding={"2.5rem"}
            borderRadius={20}
            height={"100%"}
            backgroundColor={"rgba(17, 25, 40, 0.88)"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            {loading ? (
              <Spinner />
            ) : (
              <Text fontSize={"xl"}>Please Generate your Identity</Text>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

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
          {/* <Button
            className="ml-6 m-6"
            onClick={async () => {
              CreateNewidentity();
            }}
          >
            Create Burner Identity
          </Button> */}

          <div className="m-2 p-2 ">
            <Input
              placeholder="Enter a secret message to generate Identity "
              value={SecretString}
              onChange={(e) => SetSecretString(e.target.value)}
            />
            <Button
              disabled={!SecretString}
              onClick={async () => {
                const hash = await signer.signMessage(SecretString);
                CreateDeterministicidentity(hash);
                SetSecretString("");
              }}
            >
              Create a Deterministic Identity
            </Button>
          </div>
        </div>
        <div className="box-sizing border-2 border-black p-2 ">
          {identity && (
            <ul>
              <li className="">
                <p className="font-bold">Trapdoor: {""}</p>
                {identity ? identity.getTrapdoor().toString() : ""}{" "}
                <b>Don&apos;t share this </b>
                <IconButton
                  onClick={() => {
                    SetTrapdoorCopied(true);
                    copyToClipboard(identity.getTrapdoor().toString());
                  }}
                  colorScheme={TrapdoorCopied ? "green" : "blue"}
                  aria-label="Copy Trapdoor"
                  icon={<CopyIcon />}
                />
              </li>

              <li>
                <p className="font-bold">Nullifier:{""}</p>
                {identity ? identity.getNullifier().toString() : ""}{" "}
                <b>Don&apos;t Share this </b>
                <IconButton
                  onClick={() => {
                    copyToClipboard(identity.getNullifier().toString());
                    SetNullifierCopied(true);
                  }}
                  colorScheme={NullifierCopied ? "green" : "blue"}
                  aria-label="Copy Nullifier"
                  icon={<CopyIcon />}
                />
              </li>

              <li>
                <p className="font-bold">Commitment:{""}</p>
                {identity ? identity.generateCommitment().toString() : ""}{" "}
                <b> This is your public ID</b>{" "}
                <b>
                  <IconButton
                    onClick={() => {
                      copyToClipboard(identity.generateCommitment().toString());
                      SetCommitmentCopied(true);
                    }}
                    colorScheme={CommitmentCopied ? "green" : "blue"}
                    aria-label="Copy Commitment"
                    icon={<CopyIcon />}
                  />
                </b>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
