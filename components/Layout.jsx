import { Box } from "@chakra-ui/react";
import React from "react";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div
      style={{
        background: "black",
        // "linear-gradient(180deg, rgba(52,52,52,1) 0%, rgba(0,0,0,1) 95%)",
      }}
    >
      <Header />
      <Box>{children}</Box>
    </div>
  );
}
