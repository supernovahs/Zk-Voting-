import { Box, Heading, Text } from "@chakra-ui/react";
import React from "react";

export default function SemaphoreIntro() {
  return (
    <Box
      backdropFilter={"blur(16px) saturate(180%)"}
      backgroundColor={"rgba(17, 25, 40, 0.88)"}
      borderRadius={20}
      border={"1px solid rgba(255, 255, 255, 0.125)"}
      padding={"2.5rem"}
      width={"50%"}
      margin={"auto"}
      boxShadow={"0 10px 10px -5px rgba(156, 255, 0, 0.7)"}
      mt={"70px"}
    >
      <Heading mb={5}>How does ZkVote work?</Heading>
      <Text fontSize={"l"}>
        Semaphore is a zero-knowledge protocol that allows users to prove their
        membership in a group and send signals such as votes or endorsements
        without revealing their identity. Additionally, it provides a simple
        mechanism to prevent double-signaling.
        <ul>
        <li className="mb-2">Create or load an identity!</li>
        <li className="mb-2">
          Create a new Vote Proposal or voting on an existing Proposal.
        </li>
        </ul>
      </Text>
    </Box>
  );

 
}
