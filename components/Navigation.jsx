import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Text } from "@chakra-ui/react";

export default function Navigation() {
  const menus = [
    { tabName: "IDENTITY", pageName: "/" },
    { tabName: "NEW PROPOSAL", pageName: "/NewVote" },
    { tabName: "ACTIVE PROPOSAL", pageName: "/Activeproposals" },
    { tabName: "VOTE", pageName: "/SelectId" },
  ];
  const { pathname } = useRouter();
  console.log(pathname);

  return (
    <Box
      display={"flex"}
      background={"gray.800"}
      justifyContent={"center"}
      alignItems={"center"}
      width={"min-content"}
      borderRadius={"40px"}
      paddingX={5}
    >
      {menus.map((tab) => (
        <Link href={tab.pageName} key={tab.tabName}>
          <Text
            fontWeight={700}
            paddingX={"2rem"}
            paddingY={"1rem"}
            width={"max-content"}
            textAlign={"center"}
            margin
            _hover={{
              color: "#9CFF00",
              cursor: "pointer",
              // fontSize: "1.1rem",
            }}
            color={pathname === tab.pageName ? "#9CFF00" : "white"}
          >
            {tab.tabName}
          </Text>
        </Link>
      ))}
    </Box>
  );

  return (
    <>
      <div className=" menu flex justify-center border-b-4 border-black ">
        {menus.map((tab) => {
          return (
            <p
              key={tab.tabName}
              className={` ${
                pathName == tab.pathName ? "bg-yellow-400" : ""
              }, text-2xl  font-mono border-4 border-rose-500 border-dotted p-0.5  mx-3 m-2 font-bold rounded-lg hover:bg-yellow-300 active:bg-yellow-300 focus:outline-none`}
            >
              {" "}
              <Link href={tab.pageName}>
                <a>
                  <span>{tab.tabName}</span>
                </a>
              </Link>
            </p>
          );
        })}
      </div>
    </>
  );
}
