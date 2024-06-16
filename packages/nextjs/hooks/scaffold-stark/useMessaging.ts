import { useEffect, useState } from "react";
import axios from "axios";
import { useInterval } from "usehooks-ts";
import { useTargetNetwork } from "./useTargetNetwork";

export const useMessaging = () => {
  const [shouldFlush, setShouldFlush] = useState(false);
  const { targetNetwork } = useTargetNetwork();
  useEffect(() => {
    let timeoutId: any;
    if (targetNetwork.network == "devnet") {
      timeoutId = setTimeout(() => {
        setShouldFlush(true);
      }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, []);

  useInterval(() => {
    if (shouldFlush) {
      axios
        .post("http://0.0.0.0:5050/postman/flush")
        .then((response) => {
          //   console.log("Response:", response.data);
        })
        .catch((error) => {
          //   console.error("Error:", error);
        });
    }
  }, 2000);
};
