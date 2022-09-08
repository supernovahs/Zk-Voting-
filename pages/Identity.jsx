import React from "react";
import IdentityStep from "../components/IdentityStep";
import { useState, useEffect } from "react";
export default function Identity({}) {
  const [_identity, _Setidentity] = useState();

  return (
    <div>
      <IdentityStep onChange={_Setidentity} />
    </div>
  );
}
