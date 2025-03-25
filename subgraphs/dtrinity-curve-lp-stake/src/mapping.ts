import { BigInt, Address, log, Bytes} from "@graphprotocol/graph-ts";
import {
  FraxDUSDStake,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Transfer as TransferEvent,
  UpdateLiquidityLimit as UpdateLiquidityLimitEvent
} from "../generated/FraxDUSDStake/FraxDUSDStake";
import { 
  Account, 
  Deposit, 
  Withdraw, 
  Transfer, 
  LiquidityLimit,
  Balance
} from "../generated/schema";

function getOrCreateBalance(accountId: Bytes,  contractAddress: string): Balance {
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

export function handleDeposit(event: DepositEvent): void {
  // Create unique ID for the deposit
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let deposit = new Deposit(id);

  const contractAddress = event.address.toHexString();

  // Set deposit properties from event
  deposit.provider = event.params.provider;
  deposit.value = event.params.value;
  deposit.timestamp = event.block.timestamp;
  deposit.blockNumber = event.block.number;
  deposit.transactionHash = event.transaction.hash;
  deposit.contract = contractAddress

  // Get or create account just for the relationship
  let accountId = event.params.provider;
  let account = Account.load(accountId);
  if (!account) {
    account = new Account(accountId);
    account.blockNumber = event.block.number;
    account.blockTimestamp = event.block.timestamp;
    account.save();
  }
  
  deposit.account = accountId;
  deposit.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let withdraw = new Withdraw(id);

  const contractAddress = event.address.toHexString();

  withdraw.provider = event.params.provider;
  withdraw.value = event.params.value;
  withdraw.timestamp = event.block.timestamp;
  withdraw.blockNumber = event.block.number;
  withdraw.transactionHash = event.transaction.hash;
  withdraw.contract = contractAddress

  let accountId = event.params.provider;
  let account = Account.load(accountId);
  if (!account) {
    account = new Account(accountId);
    account.blockNumber = event.block.number;
    account.blockTimestamp = event.block.timestamp;
    account.save();
  }

  withdraw.account = accountId;
  withdraw.save();
}

export function handleTransfer(event: TransferEvent): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let transfer = new Transfer(id);
  
  const contractAddress = event.address.toHexString();

  transfer.from = event.params._from;
  transfer.to = event.params._to;
  transfer.value = event.params._value;
  transfer.contract = contractAddress;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;

  if (event.params._from.equals(event.address)) {
    // Create new account if needed
    let account = Account.load(event.params._to);
    if (!account) {
      account = new Account(event.params._to);
      account.blockNumber = event.block.number;
      account.blockTimestamp = event.block.timestamp;
      account.save();
    }

    // Update receiver's balance
    let receiverBalance = getOrCreateBalance(event.params._to, contractAddress);
    receiverBalance.amount = event.params._value;
    receiverBalance.blockNumber = event.block.number;
    receiverBalance.blockTimestamp = event.block.timestamp;
    receiverBalance.save();
  } 
  else if (!event.params._to.equals(event.address)) {
    // Update sender's balance
    if (!event.params._from.equals(Address.zero())) {
      let senderBalance = getOrCreateBalance(event.params._from, contractAddress);
      senderBalance.amount = senderBalance.amount.minus(event.params._value);
      senderBalance.blockNumber = event.block.number;
      senderBalance.blockTimestamp = event.block.timestamp;
      senderBalance.save();
    }

    // Create or update receiver's account and balance
    let receiverAccount = Account.load(event.params._to);
    if (!receiverAccount) {
      receiverAccount = new Account(event.params._to);
      receiverAccount.blockNumber = event.block.number;
      receiverAccount.blockTimestamp = event.block.timestamp;
      receiverAccount.save();
    }

    let receiverBalance = getOrCreateBalance(event.params._to, contractAddress);
    receiverBalance.amount = receiverBalance.amount.plus(event.params._value);
    receiverBalance.blockNumber = event.block.number;
    receiverBalance.blockTimestamp = event.block.timestamp;
    receiverBalance.save();
  }

  transfer.save();
}

export function handleUpdateLiquidityLimit(event: UpdateLiquidityLimitEvent): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let liquidityLimit = new LiquidityLimit(id);

  liquidityLimit.accountEntity = event.params.user;
  liquidityLimit.account = event.params.user;
  liquidityLimit.originalBalance = event.params.original_balance;
  liquidityLimit.originalSupply = event.params.original_supply;
  liquidityLimit.workingBalance = event.params.working_balance;
  liquidityLimit.workingSupply = event.params.working_supply;
  liquidityLimit.timestamp = event.block.timestamp;
  liquidityLimit.blockNumber = event.block.number;
  liquidityLimit.transactionHash = event.transaction.hash;

  liquidityLimit.save();
}