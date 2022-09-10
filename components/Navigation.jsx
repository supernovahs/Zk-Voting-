import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navigation() {
  const menus = [
    { tabName: "Identity", pageName: "/" },
    { tabName: "New Proposal", pageName: "/NewVote" },
    { tabName: "Active Proposals", pageName: "/activeproposals" },
    { tabName: "Vote", pageName: "/SelectId" },
  ];
  const { pathName } = useRouter();
  console.log("pathname", pathName);

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
