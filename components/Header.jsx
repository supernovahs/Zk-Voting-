import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navigation from "./Navigation";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box
      position={"sticky"}
      top={0}
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      mx={5}
      bg={"black"}
    >
      <Box py={5}>
        <Navigation />
      </Box>
      <Box flexGrow={1}>
        <Heading
          color={"#9CFF00"}
          _before={{
            content: '""',
            borderBottom: "2px solid #9CFF00",
            flex: "1",
            margin: "auto 20px",
          }}
          _after={{
            content: '""',
            borderBottom: "2px solid #9CFF00",
            flex: "1",
            margin: "auto 20px",
          }}
          fontSize={"3xl"}
          fontWeight={900}
          display={"flex"}
        >
          ZeroVote
        </Heading>
      </Box>
      <Box>
        <ConnectButton
          className="text-lg font-medium rounded-md bg-sky-300 hover:bg-violet-400 px-6 py-2 m-4 "
          onClick={() => connect()}
        />
      </Box>
    </Box>
  );

  return (
    <div className="flex flex-col items-center mt-20">
      <div className="fixed top-0 left-0 w-screen bg-black z-2">
        <div className="p-2 flex items-center justify-between ">
          <h1 className="text-white text-3xl font-mono">ZeroVote</h1>
          <div className="mr-6">
            <ConnectButton
              className="text-lg font-medium rounded-md bg-sky-300 hover:bg-violet-400 px-6 py-2 m-4 "
              onClick={() => connect()}
            />
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
