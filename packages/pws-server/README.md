<br />
<div align="center">
  <img src="https://static.sismo.io/readme/top-main.png" alt="Logo" width="150" height="150" style="borderRadius: 20px">

  <h3 align="center">
    Prove with Sismo (PwS) Server
  </h3>

  <p align="center">
    Made by <a href="https://docs.sismo.io/" target="_blank">Sismo</a>
  </p>
  
  <p align="center">
    <a href="https://discord.gg/sismo" target="_blank">
        <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white"/>
    </a>
    <a href="https://twitter.com/sismo_eth" target="_blank">
        <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white"/>
    </a>
  </p>
</div>

[Prove with Sismo presentation]

## Installation

```
$ yarn add @sismo-core/pws-server
$ npm i @sismo-core/pws-server
```

## Usage

```javascript
import { PwsVerifier } from "@sismo-core/pws-verifier";

const verifier = new PwsVerifier({ appId: "your-app-id" });
const proofs = [...]; // Sent by your client
const claims = [...]; // Sent by your client
const request = {
    groupId: "your-group-id"
};
const verifiedClaims = await verifier.verify(request, { proofs, claims });
```

## Documentation

### PwSVerifier

```javascript
const pws = new PwSVerifier({ appId: "YOUR_APP_ID" }, opts);
```

| Params | Type | Description |
|---|---|---|
| appId | string | Identifier of your app |

**options**
| Params | Type | Default | Description |
|---|---|---|
| signerOrProvider | | | | 
| commitmentMapperRegistryAddress | | | | 
| availableRootsRegistryAddress | | | | 
| attesterAddress | | | | 

```javascript
type Request = {
    groupId: string;
    timestamp?: number | "latest";
    value?: number | "MAX";
    acceptHigherValue?: boolean;
}

type VerifyParams = {
    proofs: Proof[];
    claims: Claim[];
    serviceName?: string;
}

type VerifiedClaim = {
    appId: string;
    serviceName: string;
    value: number;
    groupId: string;
    timestamp: number;
    isStrict: boolean;
    proofId: string;
}

async function verify(request: Request, params: VerifyParams): Promise<VerifiedClaim[]>
```

| Params | Type | Description |
|---|---|---|
| request | Request | Request sent back from Prove with Sismo |
| params.proofs | Proof[] | Proof generated by your user |
| params.claims | Claim[] | Claims sent back from Prove with Sismo |

**Optional params**
| Params | Type | Description |
|---|---|---|
| params.serviceName | | |
| request.timestamp | | |
| request.value | | |
| request.acceptHigherValue | | |

If the proof is valid, the function should return a VerifiedClaim[], otherwise, it should return an error.

In a VerifiedClaim, you can find a proofId, which is a unique number that identifies a proof.

The proofId is deterministically generated based on the following elements:
- The source account used to generate the proof
- The group your user is proving membership in
- The appId
- An optional serviceName, which represents the specific service of the app that requested the proof

By storing the proofId, you can determine if a source account has already been used in your app for a specific source account and group.

## Types

```javascript
type Request = {
    groupId: string;
    timestamp?: number | "latest";
    value?: number | "MAX";
    acceptHigherValue?: boolean;
}

type Proof = {
    snarkProof: {
        a: string[], 
        b: string[][], 
        c: string[], 
        input: string[]
    },
    version: string;
}

type Claim = {
    appId: string;
    serviceName: string;
    value: number;
    groupId: string;
    timestamp: number;
    isStrict: boolean;
}

type VerifiedClaim = {
    appId: string;
    serviceName: string;
    value: number;
    groupId: string;
    timestamp: number;
    isStrict: boolean;
    proofId: string;
}
```

## License

Distributed under the MIT License.

## Contribute

Please, feel free to open issues, PRs or simply provide feedback!

## Contact

Prefer [Discord](https://discord.gg/sismo) or [Twitter](https://twitter.com/sismo_eth)

<br/>
<img src="https://static.sismo.io/readme/bottom-main.png" alt="bottom" width="100%" >