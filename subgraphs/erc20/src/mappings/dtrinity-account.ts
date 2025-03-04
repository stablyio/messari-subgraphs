import { Bytes, BigInt } from "@graphprotocol/graph-ts";

import {
  DtrinityAccount,
  DtrinityStats,
} from "../../generated/schema";

export function isNewDtrinityAccount(accountAddress: Bytes): boolean {
  let accountId = accountAddress.toHex();
  let existingDtrinityAccount = DtrinityAccount.load(accountId);

  if (existingDtrinityAccount != null) {
    return false;
  }

  return true;
}

export function getOrCreateDtrinityAccount(accountAddress: Bytes): DtrinityAccount {
  let accountId = accountAddress.toHex();
  let existingDtrinityAccount = DtrinityAccount.load(accountId);

  if (existingDtrinityAccount != null) {
    return existingDtrinityAccount as DtrinityAccount;
  }

  let newDtrinityAccount = new DtrinityAccount(accountId);

  return newDtrinityAccount;
}

export function increaseDusdHolderCount(
): DtrinityStats | null {
  let dtrinityStats = DtrinityStats.load("dtrinity-stats-1");
  if (dtrinityStats == null) {
    return null;
  }

  dtrinityStats.currentDusdHolderCount = dtrinityStats.currentDusdHolderCount.plus(BigInt.fromI32(1));
  
  dtrinityStats.save();
  return dtrinityStats;
}

export function decreaseDusdHolderCount(
): DtrinityStats | null {
  let dtrinityStats = DtrinityStats.load("dtrinity-stats-1");
  if (dtrinityStats == null) {
    return null;
  }

  dtrinityStats.currentDusdHolderCount = dtrinityStats.currentDusdHolderCount.minus(BigInt.fromI32(1));
  
  dtrinityStats.save();
  return dtrinityStats;
}

// export function updateDtrinityAccountBalanceDailySnapshot(
//   balance: DtrinityAccountBalance,
//   event: ethereum.Event
// ): void {
//   let snapshot = getOrCreateDtrinityAccountBalanceDailySnapshot(balance, event.block);

//   snapshot.amount = balance.amount;
//   snapshot.blockNumber = event.block.number;
//   snapshot.timestamp = event.block.timestamp;

//   snapshot.save();
// }

// export function getOrCreateDtrinityAccountBalanceDailySnapshot(
//   balance: DtrinityAccountBalance,
//   block: ethereum.Block
// ): DtrinityAccountBalanceDailySnapshot {
//   let snapshotId =
//     balance.account +
//     "-" +
//     balance.token +
//     "-" +
//     (block.timestamp.toI64() / SECONDS_PER_DAY).toString();
//   let previousSnapshot = DtrinityAccountBalanceDailySnapshot.load(snapshotId);

//   if (previousSnapshot != null) {
//     return previousSnapshot as DtrinityAccountBalanceDailySnapshot;
//   }

//   let newSnapshot = new DtrinityAccountBalanceDailySnapshot(snapshotId);
//   newSnapshot.account = balance.account;
//   newSnapshot.token = balance.token;

//   return newSnapshot;
// }
