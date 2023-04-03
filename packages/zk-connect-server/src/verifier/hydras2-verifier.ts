import { CommitmentMapperRegistryContractDev } from './libs/contracts/commitment-mapper-registry/dev';
import { HydraS2Verifier as HydraS2VerifierPS, SNARK_FIELD } from "@sismo-core/hydra-s2";
import {
  GNOSIS_AVAILABLE_ROOTS_REGISTRY_ADDRESS,
  GNOSIS_COMMITMENT_MAPPER_REGISTRY_ADDRESS,
  GOERLI_COMMITMENT_MAPPER_REGISTRY_ADDRESS
} from "../constants";
import {
  AvailableRootsRegistryContract,
  CommitmentMapperRegistryContract,
  CommitmentMapperRegistryContractProd,
} from "./libs/contracts";
import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { encodeRequestIdentifier } from "./utils/encodeRequestIdentifier";
import { encodeAccountsTreeValue } from "./utils/encodeAccountsTreeValue";
import { AuthType, ClaimType, VerifiedAuth, VerifiedClaim, ZkConnectProof } from "../common-types";
import { ethers } from "ethers";
import { decodeProofData } from './utils/proofData';

export type SnarkProof = {
  a: string[];
  b: string[][];
  c: string[];
  input: string[];
};

export type ProofPublicInputs = {
  destinationIdentifier: string;
  extraData: string;
  commitmentMapperPubKeyX: string;
  commitmentMapperPubKeyY: string;
  registryTreeRoot: string;
  requestIdentifier: string;
  proofIdentifier: string;
  claimValue: string;
  accountsTreeValue: string;
  claimType: string;
  vaultIdentifier: string;
  vaultNamespace: string;
  sourceVerificationEnabled: string;
  destinationVerificationEnabled: string;
};

export type VerifyParams = {
  appId: string;
  namespace: string;
  proof: ZkConnectProof;
};

export type HydraS2VerifierOpts = {
  provider?: Provider;
  commitmentMapperRegistryAddress?: string;
  availableRootsRegistryAddress?: string;
  isDevMode?: boolean;
  commitmentMapperPubKeys?: [string, string];
};

export class HydraS2Verifier {
  private _commitmentMapperRegistry: CommitmentMapperRegistryContract;
  private _availableRootsRegistry: AvailableRootsRegistryContract;
  private _isDevMode: boolean;

  constructor(provider: Provider, opts?: HydraS2VerifierOpts) {
    if (opts?.commitmentMapperPubKeys) {
      this._commitmentMapperRegistry = new CommitmentMapperRegistryContractDev(opts.commitmentMapperPubKeys[0], opts.commitmentMapperPubKeys[1])
    } else {
      if (opts?.isDevMode) {
        this._commitmentMapperRegistry = new CommitmentMapperRegistryContractDev("0x2ab71fb864979b71106135acfa84afc1d756cda74f8f258896f896b4864f0256", "0x30423b4c502f1cd4179a425723bf1e15c843733af2ecdee9aef6a0451ef2db74")
      } else {
        const address = opts?.commitmentMapperRegistryAddress ?? GNOSIS_COMMITMENT_MAPPER_REGISTRY_ADDRESS;
        this._commitmentMapperRegistry = new CommitmentMapperRegistryContractProd({
          address: address,
          provider,
        });
      }
    }

    this._availableRootsRegistry = new AvailableRootsRegistryContract({
      address:
        opts?.availableRootsRegistryAddress ||
        GNOSIS_AVAILABLE_ROOTS_REGISTRY_ADDRESS,
      provider,
    });

    this._isDevMode = opts?.isDevMode;
  }

  async verifyClaimProof({
    appId,
    namespace,
    proof,
  }: {
    appId: string,
    namespace: string,
    proof: ZkConnectProof
  }): Promise<VerifiedClaim> {
    const snarkProof = decodeProofData(proof.proofData);
    await this._matchPublicInputWithClaim({ appId, namespace, proof });
    if (
      !(await HydraS2VerifierPS.verifyProof(
        snarkProof.a,
        snarkProof.b,
        snarkProof.c,
        snarkProof.input
      ))
    ) {
      throw new Error("Snark Proof Invalid!");
    }
    return {
      ...proof.claim,
      proofId: BigNumber.from(snarkProof.input[6]).toHexString(),
      __proof: proof.proofData
    }
  }

  async verifySignedMessageProof({
    proof,
  }: {
    proof: ZkConnectProof;
  }): Promise<string> {
    const snarkProof = decodeProofData(proof.proofData);
    await this._matchPublicInputWithSignedMessage({ proof });
    if (
      !(await HydraS2VerifierPS.verifyProof(
        snarkProof.a,
        snarkProof.b,
        snarkProof.c,
        snarkProof.input
      ))
    ) {
      throw new Error("Snark Proof Invalid!");
    }
    return proof.signedMessage;
  }

  async verifyAuthProof({
    proof
  }: {
    proof: ZkConnectProof;
  }): Promise<VerifiedAuth> {
    const snarkProof = decodeProofData(proof.proofData);
    await this._matchPublicInputWithAuth({ proof });
    if (
      !(await HydraS2VerifierPS.verifyProof(
        snarkProof.a,
        snarkProof.b,
        snarkProof.c,
        snarkProof.input
      ))
    ) {
      throw new Error("Snark Proof Invalid!");
    }

    let userId;
    if (proof.auth.authType === AuthType.ANON) {
      //userId is the vaultIdentifier
      userId = snarkProof.input[10];
      userId = BigNumber.from(userId).toHexString();
    } else {
      //userId is the destination
      userId = snarkProof.input[0];
      userId = BigNumber.from(userId).toHexString();
      if (proof.auth.authType !== AuthType.EVM_ACCOUNT) {
        //Remove account indicator E.g for github 0x0001 and twitter 0x0002
        userId = userId.substring(6);
        userId = BigNumber.from(userId).toNumber();
        userId = userId.toString();
      }
    }

    return { 
      ...proof.auth,
      userId: userId,
      __proof: proof.proofData
    };
  }

  private async _matchPublicInputWithSignedMessage({
    proof
  }) {
    const input = decodeProofData(proof.proofData).input;
    const proofPublicInputs: ProofPublicInputs = {
      destinationIdentifier: input[0],
      extraData: input[1],
      commitmentMapperPubKeyX: input[2],
      commitmentMapperPubKeyY: input[3],
      registryTreeRoot: input[4],
      requestIdentifier: input[5],
      proofIdentifier: input[6],
      claimValue: input[7],
      accountsTreeValue: input[8],
      claimType: input[9],
      vaultIdentifier: input[10],
      vaultNamespace: input[11],
      sourceVerificationEnabled: input[12],
      destinationVerificationEnabled: input[13],
    };
    const proofIdentifier = proofPublicInputs.proofIdentifier;
    const signedMessage = BigNumber.from(ethers.utils.keccak256(proof.signedMessage)).mod(SNARK_FIELD);
    if (!BigNumber.from(proofPublicInputs.extraData).eq(signedMessage)) {
      throw new Error(
        `on proofId "${proofIdentifier}" extraData "${
          BigNumber.from(proofPublicInputs.extraData).toHexString()
        }" mismatch with signedMessage "${signedMessage.toHexString()}"`
      );
    }
  }

  private async _matchPublicInputWithAuth({
    proof
  }: {
    proof: ZkConnectProof
  }) {
    const input = decodeProofData(proof.proofData).input;
    const proofPublicInputs: ProofPublicInputs = {
      destinationIdentifier: input[0],
      extraData: input[1],
      commitmentMapperPubKeyX: input[2],
      commitmentMapperPubKeyY: input[3],
      registryTreeRoot: input[4],
      requestIdentifier: input[5],
      proofIdentifier: input[6],
      claimValue: input[7],
      accountsTreeValue: input[8],
      claimType: input[9],
      vaultIdentifier: input[10],
      vaultNamespace: input[11],
      sourceVerificationEnabled: input[12],
      destinationVerificationEnabled: input[13],
    };
    const proofIdentifier = proofPublicInputs.proofIdentifier;

    if (proof.auth.anonMode === true) {
      throw new Error(
        `proof anonMode is not supported yet`
      );
    }

    if (
      proof.auth.authType !== AuthType.ANON &&
      !BigNumber.from(proofPublicInputs.destinationVerificationEnabled).eq("1")
    ) {
      throw new Error(
        `on proofId "${proofIdentifier}" proof input destinationVerificationEnabled must be 1`
      );
    }
  }

  private async _matchPublicInputWithClaim({
    proof,
    appId,
    namespace,
  }: VerifyParams) {
    const input = decodeProofData(proof.proofData).input;
    const proofPublicInputs: ProofPublicInputs = {
      destinationIdentifier: input[0],
      extraData: input[1],
      commitmentMapperPubKeyX: input[2],
      commitmentMapperPubKeyY: input[3],
      registryTreeRoot: input[4],
      requestIdentifier: input[5],
      proofIdentifier: input[6],
      claimValue: input[7],
      accountsTreeValue: input[8],
      claimType: input[9],
      vaultIdentifier: input[10],
      vaultNamespace: input[11],
      sourceVerificationEnabled: input[12],
      destinationVerificationEnabled: input[13],
    };

    const proofIdentifier = proofPublicInputs.proofIdentifier;
    const claim = proof.claim;

    // claimType
    const claimTypFromInput = BigNumber.from(
      proofPublicInputs.claimType
    ).eq("1");
    const claimTypeFromProof = claim.claimType === ClaimType.EQ;
    if (
      claimTypFromInput !==
      claimTypeFromProof
    ) {
      throw new Error(
        `on proofId "${proofIdentifier}" claimType "${claim.claimType}" mismatch with proof input claimType "${claimTypFromInput}"`
      );
    }

    // claimValue
    if (
      !BigNumber.from(proofPublicInputs.claimValue).eq(
        BigNumber.from(claim.value)
      )
    ) {
      throw new Error(
        `on proofId "${proofIdentifier}" value "${claim.value}" mismatch with proof input claimValue "${proofPublicInputs.claimValue}"`
      );
    }

    // requestIdentifier
    const requestIdentifier = encodeRequestIdentifier(
      appId,
      claim.groupId,
      claim.groupTimestamp,
      namespace
    );
    if (
      !BigNumber.from(proofPublicInputs.requestIdentifier).eq(requestIdentifier)
    ) {
      throw new Error(
        `on proofId "${proofIdentifier}" requestIdentifier "${BigNumber.from(
          requestIdentifier
        ).toHexString()}" mismatch with proof input requestIdentifier "${BigNumber.from(
          proofPublicInputs.requestIdentifier
        ).toHexString()}"`
      );
    }

    //commitmentMapperPubKey
    const [commitmentMapperPubKeyX, commitmentMapperPubKeyY] =
      await this.getCommitmentMapperPubKey();
    if (
      !commitmentMapperPubKeyX.eq(proofPublicInputs.commitmentMapperPubKeyX)
    ) {
      throw new Error(
        `on proofId "${proofIdentifier}" commitmentMapperPubKeyX "${BigNumber.from(
          commitmentMapperPubKeyX
        ).toHexString()}" mismatch with proof input commitmentMapperPubKeyX "${BigNumber.from(
          proofPublicInputs.commitmentMapperPubKeyX
        ).toHexString()}"`
      );
    }
    if (
      !commitmentMapperPubKeyY.eq(proofPublicInputs.commitmentMapperPubKeyY)
    ) {
      throw new Error(
        `on proofId "${proofIdentifier}" commitmentMapperPubKeyY "${BigNumber.from(
          commitmentMapperPubKeyY
        ).toHexString()}" mismatch with proof input commitmentMapperPubKeyY "${BigNumber.from(
          proofPublicInputs.commitmentMapperPubKeyY
        ).toHexString()}"`
      );
    }

    // sourceVerificationEnabled
    if (!BigNumber.from(proofPublicInputs.sourceVerificationEnabled).eq("1")) {
      throw new Error(
        `on proofId "${proofIdentifier}" proof input sourceVerificationEnabled must be 1`
      );
    }

    // isRootAvailable
    const isAvailable = await this.IsRootAvailable(
      proofPublicInputs.registryTreeRoot
    );

    // We don't check the root if we are in dev mode
    if (!isAvailable && !this._isDevMode) {
      throw new Error(
        `on proofId "${proofIdentifier}" registry root "${BigNumber.from(
          proofPublicInputs.registryTreeRoot
        ).toHexString()}" not available`
      );
    }

    // accountsTreeValue
    const groupSnapshotId = encodeAccountsTreeValue(
      claim.groupId,
      claim.groupTimestamp
    );
    if (
      !BigNumber.from(proofPublicInputs.accountsTreeValue).eq(groupSnapshotId)
    ) {
      throw new Error(
        `on proofId "${proofIdentifier}" groupId "${claim.groupId}" or timestamp "${claim.groupTimestamp}" incorrect`
      );
    }
    
    // proofIdentifier
    if (!BigNumber.from(appId).eq(proofPublicInputs.vaultNamespace)) {
      throw new Error(
        `on proofId "${proofIdentifier}" vaultNamespace "${
          proofPublicInputs.vaultNamespace
        }" mismatch with appId "${BigNumber.from(appId).toString()}"`
      );
    }
  }

  protected getCommitmentMapperPubKey = async () => {
    return this._commitmentMapperRegistry.getCommitmentMapperPubKey();
  };

  protected IsRootAvailable = async (registryTreeRoot: string) => {
    return this._availableRootsRegistry.IsRootAvailable(registryTreeRoot);
  };
}
