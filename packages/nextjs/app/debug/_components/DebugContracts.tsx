"use client";

import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { ContractUI as StarkContractUI } from "~~/app/debug/_components/contract";
import { ContractName, ContractType } from "~~/types/aggregations";
import { getAllContracts as getAllEthContracts } from "~~/utils/scaffold-eth/contractsData";
import { getAllContracts as getAllStarkContracts } from "~~/utils/scaffold-stark/contractsData";
import { ContractUI as EthContractUI } from "./eth-contract";
import { EthContractName, StarkContractName } from "~~/types/aliases";

const selectedContractStorageKey = "scaffoldStark2.selectedContract";
const starknetContracts = Object.keys(getAllStarkContracts()) as ContractName[];
const ethContracts = Object.keys(getAllEthContracts()) as ContractName[];
const contractNames = Object.keys({
  ...starknetContracts,
  ...ethContracts,
}) as ContractName[];

export function DebugContracts() {
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
    { initializeWithValue: false }
  );

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [selectedContract, setSelectedContract]);

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      {contractNames.length === 0 ? (
        <p className="text-3xl mt-14">No contracts found!</p>
      ) : (
        <>
          {contractNames.length > 1 && (
            <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
              {contractNames.map((contractName) => (
                <button
                  className={`btn btn-secondary btn-sm font-light hover:border-transparent ${
                    contractName === selectedContract
                      ? "bg-base-300 hover:bg-base-300 no-animation"
                      : "bg-base-100 hover:bg-secondary"
                  }`}
                  key={contractName}
                  onClick={() => setSelectedContract(contractName)}
                >
                  {contractName}
                </button>
              ))}
            </div>
          )}
          {contractNames.map((contractName) =>
            starknetContracts.includes(contractName) ? (
              <StarkContractUI
                key={contractName}
                contractName={contractName as StarkContractName}
                className={contractName === selectedContract ? "" : "hidden"}
              />
            ) : (
              <EthContractUI
                key={contractName}
                contractName={contractName as EthContractName}
                className={contractName === selectedContract ? "" : "hidden"}
              />
            )
          )}
        </>
      )}
    </div>
  );
}
