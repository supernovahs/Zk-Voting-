import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import Identity from "./Identity";
const Home: NextPage = () => {
  const [_identity, _Setidentity] = useState();

  return (
    <>
      <div>
        <div>
          <Identity></Identity>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default Home;
