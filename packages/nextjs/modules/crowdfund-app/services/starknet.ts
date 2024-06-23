import { uint256 } from "starknet-dev";
import {
  parseParamWithType,
  tryParsingParamReturnValues,
} from "~~/utils/scaffold-stark/contract";

export const encodeCalldataArgs = (args: any[]) => {
  const unflattened = args.map((arg) => {
    if (typeof arg === "bigint" || typeof arg === "number")
      return tryParsingParamReturnValues(uint256.bnToUint256, arg);

    return tryParsingParamReturnValues((x) => x, arg);
  });
  return unflattened.flat();
};
