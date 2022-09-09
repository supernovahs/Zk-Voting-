import React from "react";
import IdentityStep from "../components/IdentityStep";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import SemaphoreIntro from "../components/SemaphoreIntro";
export default function Identity({}) {
  const [_identity, _Setidentity] = useState();
  return (
    <div>
      <Navigation></Navigation>
      <SemaphoreIntro />
      <IdentityStep />
    </div>
  );
}
