import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address } from "@graphprotocol/graph-ts"
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
} from "../generated/SpaceRegistry/SpaceRegistry"

export function createAdminAddedEvent(
  spaceId: Bytes,
  admin: Address
): AdminAdded {
  let adminAddedEvent = changetype<AdminAdded>(newMockEvent())

  adminAddedEvent.parameters = new Array()

  adminAddedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  adminAddedEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return adminAddedEvent
}

export function createAdminRemovedEvent(
  spaceId: Bytes,
  admin: Address
): AdminRemoved {
  let adminRemovedEvent = changetype<AdminRemoved>(newMockEvent())

  adminRemovedEvent.parameters = new Array()

  adminRemovedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  adminRemovedEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return adminRemovedEvent
}

export function createMemberJoinedEvent(
  spaceId: Bytes,
  member: Address
): MemberJoined {
  let memberJoinedEvent = changetype<MemberJoined>(newMockEvent())

  memberJoinedEvent.parameters = new Array()

  memberJoinedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  memberJoinedEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )

  return memberJoinedEvent
}

export function createMemberLeftEvent(
  spaceId: Bytes,
  member: Address
): MemberLeft {
  let memberLeftEvent = changetype<MemberLeft>(newMockEvent())

  memberLeftEvent.parameters = new Array()

  memberLeftEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  memberLeftEvent.parameters.push(
    new ethereum.EventParam("member", ethereum.Value.fromAddress(member))
  )

  return memberLeftEvent
}

export function createSpaceCreatedEvent(
  spaceId: Bytes,
  ensName: string,
  displayName: string,
  owner: Address
): SpaceCreated {
  let spaceCreatedEvent = changetype<SpaceCreated>(newMockEvent())

  spaceCreatedEvent.parameters = new Array()

  spaceCreatedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  spaceCreatedEvent.parameters.push(
    new ethereum.EventParam("ensName", ethereum.Value.fromString(ensName))
  )
  spaceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "displayName",
      ethereum.Value.fromString(displayName)
    )
  )
  spaceCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return spaceCreatedEvent
}

export function createSpaceDeactivatedEvent(spaceId: Bytes): SpaceDeactivated {
  let spaceDeactivatedEvent = changetype<SpaceDeactivated>(newMockEvent())

  spaceDeactivatedEvent.parameters = new Array()

  spaceDeactivatedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )

  return spaceDeactivatedEvent
}

export function createSpaceDisplayNameUpdatedEvent(
  spaceId: Bytes,
  newDisplayName: string,
  updatedBy: Address
): SpaceDisplayNameUpdated {
  let spaceDisplayNameUpdatedEvent =
    changetype<SpaceDisplayNameUpdated>(newMockEvent())

  spaceDisplayNameUpdatedEvent.parameters = new Array()

  spaceDisplayNameUpdatedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  spaceDisplayNameUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newDisplayName",
      ethereum.Value.fromString(newDisplayName)
    )
  )
  spaceDisplayNameUpdatedEvent.parameters.push(
    new ethereum.EventParam("updatedBy", ethereum.Value.fromAddress(updatedBy))
  )

  return spaceDisplayNameUpdatedEvent
}

export function createSpaceTransferredEvent(
  spaceId: Bytes,
  previousOwner: Address,
  newOwner: Address
): SpaceTransferred {
  let spaceTransferredEvent = changetype<SpaceTransferred>(newMockEvent())

  spaceTransferredEvent.parameters = new Array()

  spaceTransferredEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  spaceTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  spaceTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return spaceTransferredEvent
}

export function createWhitelistUpdatedEvent(
  spaceId: Bytes,
  user: Address,
  status: boolean
): WhitelistUpdated {
  let whitelistUpdatedEvent = changetype<WhitelistUpdated>(newMockEvent())

  whitelistUpdatedEvent.parameters = new Array()

  whitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  whitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  whitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("status", ethereum.Value.fromBoolean(status))
  )

  return whitelistUpdatedEvent
}
