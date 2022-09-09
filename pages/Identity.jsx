import React from "react";
import IdentityStep from "../components/IdentityStep";
import { useState, useEffect } from "react";
import SemaphoreIntro from "../components/SemaphoreIntro";
export default function Identity({}) {
  const [_identity, _Setidentity] = useState();
  return (
    <div>
      <SemaphoreIntro />
      <IdentityStep />
    </div>
  );
}
