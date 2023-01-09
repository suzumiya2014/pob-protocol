# Motivation

# Scope
## In-scope

## Out-of-scope

# Assumptions

# The Protocol
A payer wants to verify that a prover has the claimed bandwidth. It requests for a challenge to verify a specific backhaul capacity (e.g. 100 Mbps or 300 Mbps) of a prover. Following are the steps involved in the proof-of-backhaul

1. Challenge request:
    1. A contract is initialised on-chain with public key of the payer, public key of the prover, and claimed capacity.

    2. The payer commits to the contract escrow tokens for the cost of the challenge (depending on the claimed capacity).

2. Challenge Setup: 

    1. Challenge coordinator reads the request from the chain and selects appropriate number of challengers from the pool of live challengers. 

    2. The challenge coordinate informed the provers and the selected challengers about the challenge.

3. Challenge Execution: 

    1. Each challengers determines RTT to the prover. 

    2. The prover informs each challenger about where to send the challenge data and at what time. 

    3. The challengers send the challenge data.

    4. The prover computes a response hash of all the data received and sends it as response to each challenger. 

    5. Each challenger records the start time and the time at which the response hash is received.

    6. The prover sends signed verification data to each challenger, who in turn uses it to compute the transmission time (tt) and number of packets (np) received for its traffic. 

    7. Challengers forward the response hash, verification data from prover (with prover signature), and its (tt, np) with its signature to the challenge coordinator.

    8. The challenge coordinator computes the bandwidth and post all the data (list of challengers and their response) on-chain. 

    9. The PoB contract is terminated upon verification of the data and the tokens from the escrow are distributed to the challengers. 

The figure below illustrates the above functionality.

![PoB workflow](https://github.com/kaleidoscope-blockchain/pob-protocol/blob/main/assets/images/architecture.jpeg?raw=true)

# Known Risks







