import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import { ProposalCancelled } from "../generated/schema"
import { ProposalCancelled as ProposalCancelledEvent } from "../generated/PrivateProposalFactory/PrivateProposalFactory"
import { handleProposalCancelled } from "../src/private-proposal-factory"
import { createProposalCancelledEvent } from "./private-proposal-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let proposalAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let name = "Example string value"
    let cancelledBy = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newProposalCancelledEvent = createProposalCancelledEvent(
      proposalAddress,
      name,
      cancelledBy
    )
    handleProposalCancelled(newProposalCancelledEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("ProposalCancelled created and stored", () => {
    assert.entityCount("ProposalCancelled", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ProposalCancelled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "proposalAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ProposalCancelled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "name",
      "Example string value"
    )
    assert.fieldEquals(
      "ProposalCancelled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "cancelledBy",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
