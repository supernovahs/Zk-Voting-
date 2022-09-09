import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navigation from "./Navigation";

export default function Header() {
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
