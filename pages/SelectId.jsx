import React, { useState, useEffect } from "react";
import { Input, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
export default function SelectId() {
  const [Id, SetId] = useState();
  const router = useRouter();

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
