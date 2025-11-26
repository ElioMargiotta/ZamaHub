import {
  ProposalCancelled as ProposalCancelledEvent,
  ProposalCreated as ProposalCreatedEvent,
  UpkeepPerformed as UpkeepPerformedEvent
} from "../generated/PrivateProposalFactory/PrivateProposalFactory"
import {
  ProposalCancelled,
  ProposalCreated,
  UpkeepPerformed
} from "../generated/schema"

export function handleProposalCancelled(event: ProposalCancelledEvent): void {
  let entity = new ProposalCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalAddress = event.params.proposalAddress
  entity.name = event.params.name
  entity.cancelledBy = event.params.cancelledBy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  let entity = new ProposalCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.spaceId = event.params.spaceId
  entity.proposalId = event.params.proposalId
  entity.proposal = event.params.proposal
  entity.p_spaceId = event.params.p.spaceId
  entity.p_start = event.params.p.start
  entity.p_end = event.params.p.end
  entity.p_eligibilityToken = event.params.p.eligibilityToken
  entity.p_eligibilityThreshold = event.params.p.eligibilityThreshold
  entity.p_passingThreshold = event.params.p.passingThreshold
  entity.p_pType = event.params.p.pType
  entity.p_eligibilityType = event.params.p.eligibilityType
  entity.p_includeAbstain = event.params.p.includeAbstain
  entity.p_title = event.params.p.title
  entity.p_bodyURI = event.params.p.bodyURI
  entity.p_choices = event.params.p.choices

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpkeepPerformed(event: UpkeepPerformedEvent): void {
  let entity = new UpkeepPerformed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.votingAddress = event.params.votingAddress
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
