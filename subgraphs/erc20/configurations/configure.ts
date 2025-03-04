import { dataSource } from "@graphprotocol/graph-ts";
import { getTokenListByNetwork } from "./configurations";

// let deploymentYear = 2022;

const network = dataSource.network();

// if (!process.env.NETWORK) {
//     throw new Error("Not specified network name")
// }

// export const IPFS_HASH = getRegistryIpfsHash(deploymentYear);
// export const IPFS_HASH = getRegistryIpfsHashByChainID(chainID)
export const TOKEN_LIST = getTokenListByNetwork(network)