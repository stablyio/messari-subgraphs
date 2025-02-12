import { log, TypedMap } from "@graphprotocol/graph-ts";
import { TokenRegistry } from "./registry/registry";
import { Network } from "../src/common/constants";

export class BaseERC20Token {
  // address: string
  // symbol: string

  constructor(public address: string, public symbol: string) {}
}

const networkToTokenList = new TypedMap<string, BaseERC20Token[]>()

networkToTokenList.set(
  Network.FRAXTAL_TESTNET,
    [new BaseERC20Token("0x4d6e79013212f10a026a1fb0b926c9fd0432b96c", "dUSD")]
)

export function getRegistryIpfsHash(year: i32): string {
  switch (year) {
    case 2017: {
      return TokenRegistry.TOKENS_2017;
    }
    case 2018: {
      return TokenRegistry.TOKENS_2018;
    }
    case 2019: {
      return TokenRegistry.TOKENS_2019;
    }
    case 2020: {
      return TokenRegistry.TOKENS_2020;
    }
    case 2021: {
      return TokenRegistry.TOKENS_2021;
    }
    case 2022: {
      return TokenRegistry.TOKENS_2022;
    }
    default: {
      log.critical("No token registry found for deployment year", []);
      return TokenRegistry.TOKENS_DEFAULT;
    }
  }
}

export function getRegistryIpfsHashByChainID(chainID: i32): string {
  switch(chainID) {
    case 2522: 
      return TokenRegistry.FRAX_TESTNET
    default: {
      log.critical(`No token registry found for deployment network ${chainID}`, []);
      return TokenRegistry.TOKENS_DEFAULT;
    }
  }
}

export function getTokenListByNetwork(network: string): BaseERC20Token[] {
  const tokenList = networkToTokenList.get(network)
  if (!tokenList) {
      log.critical(`No token list for the network ${network}`, [])
      throw new Error(`No token list for the network ${network}`)
  }
  return tokenList
}