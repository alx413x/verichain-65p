# Background 
This project focuses on developing a decentralized application (dApp) that leverages blockchain to record the manufacturing provenance and post-purchase warranty lifecycle of high-value consumer electronics, e.g., luxury smartwatches or smartphones. 
Each  product  will  have  a  record  representing  its  identity,  ownership  history, and warranty  details.  The  project  aims  to  demonstrate  how  blockchain  can  provide transparency, security, and trustless warranty management between manufacturers, service centers, and consumers. 
The  dApp  should  be  deployed  on  Ethereum  (public  blockchain)  or  Hyperledger Fabric (private consortium network), based on the desired privacy model.
# System Requirements 
Your dApp should allow different stakeholders to interact with the system based on their roles: 
## 1. Stakeholders & Roles 
- Manufacturer: registers new products and issues initial ownership and warranty details. 
- Retailer: transfers ownership to the buyer upon sale. 
- Customer: verifies ownership, requests warranty service, transfers ownership (e.g., resale). 
- Service Center: validates warranty claims and logs servicing actions. 
 
## 2. Core Functionalities 
### A. Product Lifecycle Traceability 
Each product (e.g., smartwatch) gets a unique digital record stored on-chain with the following: 
- Product ID, serial number, model details 
- Manufacturer details and timestamp 
- Ownership transfers (manufacturer → retailer → customer → resale) 
- Warranty details (start date, expiration, claim count) 
### B. Smart Contract–Based Warranty Management 
- Warranty terms (duration, number of claims) encoded in smart contracts 
- Customers submit warranty requests via front-end 
- Service centers approve/reject warranty claims (logged on-chain) 
- Warranty automatically expires after duration or claim limit is reached 
### C. Ownership Verification Interface 
Consumers can verify product authenticity and ownership history 
### D. Privacy Control   
### To this end: 
1. Outline the architecture of the dApp, including smart contracts, user interfaces, and database  design.  Note  that  you  will  likely  need  to  make  compromise  on  the transparency vs. privacy criteria. 
2. Implement your solution according to your architecture. Ensure smart contracts are secure and optimized for gas usage (if Ethereum is chosen). 
3. Develop the frontend to interact with the blockchain, directly or via a centralized backend. 
4. Deploy smart contracts on a local Ethereum blockchain (Hardhat) or set up a network (Hyperledger Fabric). 
 
# Project Deliverables 
## Part 1: System Design (40 marks) 
Prepare a design report describing: 
1. System Architecture   
2. Security Analysis   
3. Accessibility & Usability   
4. Efficiency & Cost Optimization   
5. Installation and Deployment Guide   
Report length: ≤ 30 pages including all diagrams and screenshots; with single line spacing and font size 12. PDF only; APA or IEEE citations. 
 
## Part 2: System Implementation (40 marks) 
Implement your dApp according to the design: 
- Smart Contract: written in Solidity (for Ethereum) or Chaincode (for Fabric) 
- Frontend: For the front-end of your applications, it can be desktop software 
(GUI/Terminal-based), mobile app, website or a combination of them. 
 
## Part 3: Presentation (20 marks) 
- 10~12-minute in-class presentation on the last lecture 
- Key Components:   
    - System architecture overview 
    - Smart contract demonstration (basic interaction) 
    - Live walkthrough of ownership transfer or warranty claim 

# Remarks
- Focus on achievable, working smart contract logic rather than full enterprise deployment 
- Creativity in UI design and data visualization is encouraged