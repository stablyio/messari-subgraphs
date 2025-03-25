import {
  Transfer as TransferEvent,
  Approval as ApprovalEvent,
  TokenExchange as TokenExchangeEvent,
  TokenExchangeUnderlying as TokenExchangeUnderlyingEvent,
  AddLiquidity as AddLiquidityEvent,
  RemoveLiquidity as RemoveLiquidityEvent,
  RemoveLiquidityOne as RemoveLiquidityOneEvent,
  RemoveLiquidityImbalance as RemoveLiquidityImbalanceEvent,
  RampA as RampAEvent,
  StopRampA as StopRampAEvent,
  ApplyNewFee as ApplyNewFeeEvent,
  SetNewMATime as SetNewMATimeEvent
} from "../generated/CurveDTrinity/CurveDTrinity"
import {
  Transfer,
  Approval,
  TokenExchange,
  TokenExchangeUnderlying,
  AddLiquidity,
  RemoveLiquidity,
  RemoveLiquidityOne,
  RemoveLiquidityImbalance,
  RampA,
  StopRampA,
  ApplyNewFee,
  SetNewMATime,
  Account,
  Balance
} from "../generated/schema"
import { Bytes, BigInt, Address, log } from "@graphprotocol/graph-ts";

// Add these constants at the top of your file
const dUSD_sfrxUSD = Address.fromString("0x5eCFA6940a33A2dAd5c473896452f018c6c04577")
const dUSD_frxUSD = Address.fromString("0x9CA648D2f51098941688Db9a0beb1DadC2D1B357")
const dUSD_sUSDe = Address.fromString("0xF16f226Baa419d9DC9D92C040CCBC8c0E25F36D7")

export function getContractName(address: Address): string {
  if (address == dUSD_sfrxUSD) {
    return "dUSD_sfrxUSD"
  } else if (address == dUSD_frxUSD) {
    return "dUSD_frxUSD"
  } else if (address == dUSD_sUSDe) {
   return "dUSD_sUSDe"
  }
  else return ""
}

function getOrCreateBalance(accountId: Bytes, contractAddress: string): Balance {
  let balanceId = accountId.concat(Bytes.fromUTF8(contractAddress));
  let balance = Balance.load(balanceId);
  
  if (!balance) {
    balance = new Balance(balanceId);
    balance.account = accountId;
    balance.contract = contractAddress;
    balance.amount = BigInt.fromI32(0);
    balance.blockNumber = BigInt.fromI32(0);
    balance.blockTimestamp = BigInt.fromI32(0);
  }
  
  return balance;
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  const contractAddress = event.address.toHexString();

  entity.sender = event.params.sender
  entity.receiver = event.params.receiver
  entity.value = event.params.value
  entity.contract = contractAddress
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  if (event.params.sender.equals(event.address)) {
    // Create new account if needed
    let account = Account.load(event.params.receiver);
    if (!account) {
      account = new Account(event.params.receiver);
      account.blockNumber = event.block.number;
      account.blockTimestamp = event.block.timestamp;
      account.save();
    }

    // Update receiver's balance
    let receiverBalance = getOrCreateBalance(event.params.receiver, contractAddress);
    receiverBalance.amount = event.params.value;
    receiverBalance.blockNumber = event.block.number;
    receiverBalance.blockTimestamp = event.block.timestamp;
    receiverBalance.save();
  } 
  else if (!event.params.receiver.equals(event.address)) {
    // Update sender's balance
    if (!event.params.sender.equals(Address.zero())) {
      let senderBalance = getOrCreateBalance(event.params.sender, contractAddress);
      senderBalance.amount = senderBalance.amount.minus(event.params.value);
      senderBalance.blockNumber = event.block.number;
      senderBalance.blockTimestamp = event.block.timestamp;
      senderBalance.save();
    }

    // Create or update receiver's account and balance
    let receiverAccount = Account.load(event.params.receiver);
    if (!receiverAccount) {
      receiverAccount = new Account(event.params.receiver);
      receiverAccount.blockNumber = event.block.number;
      receiverAccount.blockTimestamp = event.block.timestamp;
      receiverAccount.save();
    }

    let receiverBalance = getOrCreateBalance(event.params.receiver, contractAddress);
    receiverBalance.amount = receiverBalance.amount.plus(event.params.value);
    receiverBalance.blockNumber = event.block.number;
    receiverBalance.blockTimestamp = event.block.timestamp;
    receiverBalance.save();
  }

  entity.save();
}

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenExchange(event: TokenExchangeEvent): void {
  let entity = new TokenExchange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.buyer = event.params.buyer
  entity.sold_id = event.params.sold_id
  entity.tokens_sold = event.params.tokens_sold
  entity.bought_id = event.params.bought_id
  entity.tokens_bought = event.params.tokens_bought

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenExchangeUnderlying(
  event: TokenExchangeUnderlyingEvent
): void {
  let entity = new TokenExchangeUnderlying(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.buyer = event.params.buyer
  entity.sold_id = event.params.sold_id
  entity.tokens_sold = event.params.tokens_sold
  entity.bought_id = event.params.bought_id
  entity.tokens_bought = event.params.tokens_bought

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAddLiquidity(event: AddLiquidityEvent): void {
  let entity = new AddLiquidity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.provider = event.params.provider
  entity.token_amounts = event.params.token_amounts
  entity.fees = event.params.fees
  entity.invariant = event.params.invariant
  entity.token_supply = event.params.token_supply

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemoveLiquidity(event: RemoveLiquidityEvent): void {
  let entity = new RemoveLiquidity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.provider = event.params.provider
  entity.token_amounts = event.params.token_amounts
  entity.fees = event.params.fees
  entity.token_supply = event.params.token_supply

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemoveLiquidityOne(event: RemoveLiquidityOneEvent): void {
  let entity = new RemoveLiquidityOne(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.provider = event.params.provider
  entity.token_id = event.params.token_id
  entity.token_amount = event.params.token_amount
  entity.coin_amount = event.params.coin_amount
  entity.token_supply = event.params.token_supply

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemoveLiquidityImbalance(
  event: RemoveLiquidityImbalanceEvent
): void {
  let entity = new RemoveLiquidityImbalance(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.provider = event.params.provider
  entity.token_amounts = event.params.token_amounts
  entity.fees = event.params.fees
  entity.invariant = event.params.invariant
  entity.token_supply = event.params.token_supply

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRampA(event: RampAEvent): void {
  let entity = new RampA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.old_A = event.params.old_A
  entity.new_A = event.params.new_A
  entity.initial_time = event.params.initial_time
  entity.future_time = event.params.future_time

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStopRampA(event: StopRampAEvent): void {
  let entity = new StopRampA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.A = event.params.A
  entity.t = event.params.t

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApplyNewFee(event: ApplyNewFeeEvent): void {
  let entity = new ApplyNewFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.fee = event.params.fee
  entity.offpeg_fee_multiplier = event.params.offpeg_fee_multiplier

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSetNewMATime(event: SetNewMATimeEvent): void {
  let entity = new SetNewMATime(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ma_exp_time = event.params.ma_exp_time
  entity.D_ma_time = event.params.D_ma_time

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}