import React, { useState, useEffect } from "react";
import { Input, Button, Box, Heading, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
export default function SelectId() {
  const [Id, SetId] = useState();
  const router = useRouter();

  return (
    <Box
      backdropFilter={"blur(16px) saturate(180%)"}
      backgroundColor={"rgba(17, 25, 40, 0.88)"}
      borderRadius={20}
      border={"1px solid rgba(255, 255, 255, 0.125)"}
      padding={"2.5rem"}
      margin={"auto"}
      width={"50%"}
      my={"100px"}
      boxShadow={"0 10px 10px -5px rgba(156, 255, 0, 0.7)"}
      textAlign={"center"}
    >
      <Heading borderBottom={"1px solid white"} pb={2} mb={5}>
        {" "}
        Enter the proposal Id
      </Heading>
      <Flex mt={10}>
        <Input
          placeholder="Group Id you want to vote"
          value={Id}
          onChange={(e) => SetId(e.target.value)}
        />
        <Button
          ml={5}
          onClick={() => {
            router.push({
              pathname: "/Vote/" + Id,
              query: { GroupId: Id },
            });
          }}
        >
          Go
        </Button>
      </Flex>
    </Box>
  );

  return (
    <div className="">
      <div className="flex flex-col justify-center font-bold text-4xl">
        <p className="flex justify-center mt-4">Enter the Proposal Id </p>
        <div className="flex">
          <Input
            placeholder="Group Id you want to vote"
            value={Id}
            onChange={(e) => SetId(e.target.value)}
          />
          <Button
            onClick={() => {
              router.push({
                pathname: "/Vote/" + Id,
                query: { GroupId: Id },
              });
            }}
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
}
