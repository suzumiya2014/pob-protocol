# Introduction to PoB protocol
Proof of Backhaul is a decentralised speed-test which can be used by a “payer” to determine the backhaul capacity of a “prover” with the help of a pool of “challengers“ who send the challenge traffic to the prover. We are aspiring to build a protocol which is open (anyone can be a challenger) and trustfree (we need not trust any party). While we get there, the current version works under limited, explicitly stated trust assumptions. 

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

# Acknowledgements


