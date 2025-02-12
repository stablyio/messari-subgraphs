import { Address, JSONValue, Value, log, ipfs } from "@graphprotocol/graph-ts";

import { Token } from "../../generated/schema";
import { Initialized as UnknownEvent } from "../../generated/TokenRegistry/TokenRegistry";

import {
  BurnableToken,
  MintableToken,
  StandardToken,
} from "../../generated/templates";

import {
  DEFAULT_DECIMALS,
  BIGINT_ZERO,
} from "../common/constants";
import { TOKEN_LIST } from "../../configurations/configure";
import { BaseERC20Token } from "../../configurations/configurations";

export function initTokenList(event: UnknownEvent): void {
  log.debug("Initializing token registry, block={}", [
    event.block.number.toString(),
  ]);

  // ipfs.mapJSON(REGISTRY_HASH, "createToken", Value.fromString(""));
  TOKEN_LIST.forEach((token) => {
    createToken(token)
  })
}

// export function createToken(value: JSONValue, userData: Value): void {
//   let rawData = value.toArray();

//   let address = rawData[0].isNull() ? "" : rawData[0].toString();
//   let symbol = rawData[1].isNull() ? "" : rawData[1].toString();

export function createToken(erc20Token: BaseERC20Token): void {
  let address = erc20Token.address
  let symbol = erc20Token.symbol
  if (address != null) {
    let contractAddress = Address.fromString(address);

    // Persist token data if it didn't exist
    let token = Token.load(contractAddress.toHex());
    if (token == null) {
      token = new Token(contractAddress.toHex());
      token.name = "";
      token.symbol = symbol;
      token.decimals = DEFAULT_DECIMALS;

      token.currentHolderCount = BIGINT_ZERO;
      token.cumulativeHolderCount = BIGINT_ZERO;
      token.transferCount = BIGINT_ZERO;
      token.mintCount = BIGINT_ZERO;
      token.burnCount = BIGINT_ZERO;
      token.totalSupply = BIGINT_ZERO;
      token.totalBurned = BIGINT_ZERO;
      token.totalMinted = BIGINT_ZERO;

      log.debug("Adding token to registry, symbol: {}, address: {}", [
        token.symbol,
        token.id,
      ]);

      token.save();

      // Start indexing token events
      StandardToken.create(contractAddress);
      BurnableToken.create(contractAddress);
      MintableToken.create(contractAddress);
    } else {
      log.warning("Token {} already in registry", [contractAddress.toHex()]);
    }
  }
}
