# Introduction to PoB protocol

Proof of Backhaul is a decentralised speed-test which can be used by a “payer” to determine the backhaul capacity of a “prover” with the help of a pool of “challengers“ who send the challenge traffic to the prover. We are aspiring to build a protocol which is open (anyone can be a challenger) and trustfree (we need not trust any party). While we get there, the current version works under limited, explicitly stated trust assumptions. (Refer to *Parties Involved* to understand more about provers, challengers and payers)

# Roadmap
| Release      | Timeline | Description |
| ----------- | ----------- | ----------- |



# PoB Protocol - Specification
## Parties Involved

| Party      | Description |
| ----------- | ----------- |
| Payer      | A party who pays for the challenge       |
| Prover   | The end-point whose backhaul capacity is being measured        |
| Challengers   | A pool of servers which can send challenge traffic to the prover        |
| Challenge coordinator   | Centralised services for (i) communication between the parties; (ii) computing challenge meta data; and (iii) interacting with the ledger         |
| Blockchain full-node   | Decentralised ledger for recording all the challenge requests and outcomes         |

## Description

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

![PoB workflow](/assets/images/architecture.jpeg)


# Trust and Threat Model
### Challenge Coordinator
1. The challenge coordinator is trusted to maintain a list of live challengers, handle load-balancing and scheduling for the challengers and randomly select a subset.

2. The challenge coordinator is trusted to communicate between the parties and read/write to the ledger without censorship.

### Prover
1. Rational adversary: The prover can modify its response maliciously to try to inflate the measured capacity. 

2. Trust assumptions: The IP stack of the prover is trusted (in many cases this is controlled by the ISP of the prover). So the prover cannot spoof its IP, modify ICMP messages, etc..

### Challenger
1. Byzantine faults: 

    1. Challengers can withhold the challenge traffic.

    2. Challengers can withhold the verification data in the final step. 
    (What’s the solution for this? Should we allow the challenge coordinator to fetch the missing verification data (local hash for a challenger) from the prover if needed?)

2. Rational adversary: 

    1. Challengers can be bribed by the prover to inflate its measured capacity (rushing attack and information sharing attacks).

3. Trust assumptions: 

    1. Challengers will not in a DoS attack on their own or using informing an outside party about the challenge timing and details. 

# PoB Smart Contract

1. Initialisation: Details of prover, payer, and claimed capacity are recorded.

2. Oracle input: The randomly selected list of challengers from the challenge coordinator. 

3. Termination: The measured bandwidth is recorded and the challengers with valid response get rewarded. 

# Scope of Future Improvements
- Relax the trust assumptions for the challenge coordinator (perhaps using multiple challenge coordinators and staking):

- Implement a decentralised, trustfree heartbeat monitoring service of the challengers

- Verify that each challenge coordinator selects challengers as per its stated procedure

- Address DDoS attacks and relax the trust assumptions for challengers further

# Acknowledgements
- Himanshu Tyagi (Kaleidoscope Blockchain)
- Arun Babu (Kaleidoscope Blockchain)
- Vishal Sewani (Kaleidoscope Blockchain)



