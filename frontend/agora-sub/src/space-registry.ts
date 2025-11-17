import {
  AdminAdded as AdminAddedEvent,
  AdminRemoved as AdminRemovedEvent,
  MemberJoined as MemberJoinedEvent,
  MemberLeft as MemberLeftEvent,
  SpaceCreated as SpaceCreatedEvent,
  SpaceDeactivated as SpaceDeactivatedEvent,
  SpaceDisplayNameUpdated as SpaceDisplayNameUpdatedEvent,
  SpaceTransferred as SpaceTransferredEvent,
  WhitelistUpdated as WhitelistUpdatedEvent
} from "../generated/SpaceRegistry/SpaceRegistry"
import {
  AdminAdded,
  AdminRemoved,
  MemberJoined,
  MemberLeft,
  SpaceCreated,
  SpaceDeactivated,
  SpaceDisplayNameUpdated,
  SpaceTransferred,
  WhitelistUpdated
} from "../generated/schema"

export function handleAdminAdded(event: AdminAddedEvent): void {
  let entity = new AdminAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.admin = event.params.admin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAdminRemoved(event: AdminRemovedEvent): void {
  let entity = new AdminRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.admin = event.params.admin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberJoined(event: MemberJoinedEvent): void {
  let entity = new MemberJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.member = event.params.member

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberLeft(event: MemberLeftEvent): void {
  let entity = new MemberLeft(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.member = event.params.member

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSpaceCreated(event: SpaceCreatedEvent): void {
  let entity = new SpaceCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.ensName = event.params.ensName
  entity.displayName = event.params.displayName
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSpaceDeactivated(event: SpaceDeactivatedEvent): void {
  let entity = new SpaceDeactivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSpaceDisplayNameUpdated(
  event: SpaceDisplayNameUpdatedEvent
): void {
  let entity = new SpaceDisplayNameUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.newDisplayName = event.params.newDisplayName
  entity.updatedBy = event.params.updatedBy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSpaceTransferred(event: SpaceTransferredEvent): void {
  let entity = new SpaceTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWhitelistUpdated(event: WhitelistUpdatedEvent): void {
  let entity = new WhitelistUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.user = event.params.user
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
