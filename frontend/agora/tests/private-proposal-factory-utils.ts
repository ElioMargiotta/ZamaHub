import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  ProposalCancelled,
  ProposalCreated,
  UpkeepPerformed
} from "../generated/PrivateProposalFactory/PrivateProposalFactory"

export function createProposalCancelledEvent(
  proposalAddress: Address,
  name: string,
  cancelledBy: Address
): ProposalCancelled {
  let proposalCancelledEvent = changetype<ProposalCancelled>(newMockEvent())

  proposalCancelledEvent.parameters = new Array()

  proposalCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "proposalAddress",
      ethereum.Value.fromAddress(proposalAddress)
    )
  )
  proposalCancelledEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  proposalCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "cancelledBy",
      ethereum.Value.fromAddress(cancelledBy)
    )
  )

  return proposalCancelledEvent
}

export function createProposalCreatedEvent(
  spaceId: Bytes,
  proposalId: Bytes,
  proposal: Address,
  p: ethereum.Tuple
): ProposalCreated {
  let proposalCreatedEvent = changetype<ProposalCreated>(newMockEvent())

  proposalCreatedEvent.parameters = new Array()

  proposalCreatedEvent.parameters.push(
    new ethereum.EventParam("spaceId", ethereum.Value.fromFixedBytes(spaceId))
  )
  proposalCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "proposalId",
      ethereum.Value.fromFixedBytes(proposalId)
    )
  )
  proposalCreatedEvent.parameters.push(
    new ethereum.EventParam("proposal", ethereum.Value.fromAddress(proposal))
  )
  proposalCreatedEvent.parameters.push(
    new ethereum.EventParam("p", ethereum.Value.fromTuple(p))
  )

  return proposalCreatedEvent
}

export function createUpkeepPerformedEvent(
  votingAddress: Address,
  timestamp: BigInt
): UpkeepPerformed {
  let upkeepPerformedEvent = changetype<UpkeepPerformed>(newMockEvent())

  upkeepPerformedEvent.parameters = new Array()

  upkeepPerformedEvent.parameters.push(
    new ethereum.EventParam(
      "votingAddress",
      ethereum.Value.fromAddress(votingAddress)
    )
  )
  upkeepPerformedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return upkeepPerformedEvent
}
