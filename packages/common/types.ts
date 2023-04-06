import { BigNumberish } from "@ethersproject/bignumber";

export const SISMO_CONNECT_VERSION = `sismo-connect-v1`;

export type SismoConnectRequest = {
  appId: string;
  namespace?: string;
  
  auths?: AuthRequest[];
	claims?: ClaimRequest[];
  signature?: SignatureRequest;
  
  devConfig?: DevConfig;
  callbackPath?: string;
  version: string;
};

export type AuthRequest = {
  authType: AuthType;
  isAnon?: boolean; //false
  userId?: string;
	isOptional?: boolean;	
  isSelectableByUser?: boolean;	 
  extraData?: any;
}

export type ClaimRequest = {
  claimType?: ClaimType;
  groupId?: string;
  groupTimestamp?: number | "latest";
  value?: number;
  
	isOptional?: boolean; 
  isSelectableByUser?: boolean;

  extraData?: any;
}

export type SignatureRequest = {
	 message: string;
	 isSelectableByUser?: boolean;	 
   extraData?: any;
}

export type DevConfig = {
  enabled?: boolean;
  displayRawResponse?: boolean;
  devGroups?: DevGroup[];
};

export type DevGroup = {
  groupId: string;
  groupTimestamp?: number | "latest";
  data: DevAddresses;
};

export type DevAddresses = string[] | Record<string, Number | BigNumberish>;

export enum ProvingScheme {
  HYDRA_S2 = "hydra-s2.1",
}

export enum ClaimType {
  GTE,
  GT,
  EQ,
  LT,
  LTE,
}

export enum AuthType {
  VAULT,
  GITHUB,
  TWITTER,
  EVM_ACCOUNT 
}

export type SismoConnectResponse = Pick<SismoConnectRequest, "appId" | "namespace" | "version"> & {
  signedMessage?: string;
  proofs: SismoConnectProof[];
};

export type SismoConnectProof = {
  auths?: Auth[];
  claims?: Claim[];
  provingScheme: string;
  proofData: string;
  extraData: any;
};

export type Auth = {
  authType: AuthType;
  isAnon?: boolean; //false
  userId?: string;
  extraData?: any;
}

export type Claim = {
  claimType?: ClaimType;
  groupId?: string;
  groupTimestamp?: number | "latest";
  value?: number;
  extraData?: any;
}

export class SismoConnectVerifiedResult {
  public verifiedAuths: VerifiedAuth[];
  public verifiedClaims: VerifiedClaim[];
  public signedMessage: string | undefined;
  public response: SismoConnectResponse;

  constructor({
    response,
    verifiedClaims,
    verifiedAuths,
  }: {
    response: SismoConnectResponse,
    verifiedClaims: VerifiedClaim[],
    verifiedAuths: VerifiedAuth[],
  }) {
    this.response = response;
    this.verifiedClaims = verifiedClaims;
    this.verifiedAuths = verifiedAuths;
    this.signedMessage = response.signedMessage;
  }

  public getUserId(authType: AuthType): string | undefined {
    //TODO resolve from 0x001 to github
    return this.verifiedAuths.find(verifiedAuth => verifiedAuth.authType === authType)?.userId
  }

  public getUserIds(authType: AuthType): string[] {
    //TODO resolve from 0x001 to github
    return this.verifiedAuths.filter(verifiedAuth => verifiedAuth.authType === authType && verifiedAuth.userId).map(auth => auth.userId) as string[]
  }

  public getSignedMessage(): string | undefined {
    return this.signedMessage;
  }
}

export class RequestBuilder {
  static buildAuths(auths: AuthRequest[] | AuthRequest): AuthRequest[] {
    if (!auths) {
      return [];
    }
    if ((auths as AuthRequest)?.authType) {
      auths = [(auths as AuthRequest)];
    }
    auths = auths as AuthRequest[];

    for (let auth of auths) {
      if (auth.isAnon) throw new Error("isAnon not supported yet");
      if (typeof auth.authType === undefined) {
        throw new Error("you must provide a authType");
      }

      auth.isAnon = false;
      auth.isOptional = auth.isOptional ?? false;
      auth.isSelectableByUser = auth.isSelectableByUser ?? false;
      auth.userId = auth.userId ?? "0";
      auth.extraData = auth.extraData ?? "";

      if (auth.userId !== "0") {
        //TODO resolveUserId(userId) => resolve, web2 accounts, ens etc.
      }
    }

    return auths;
  }

  static buildClaims(claims: ClaimRequest[] | ClaimRequest): ClaimRequest[] {
    if (!claims) {
      return [];
    }
    if ((claims as ClaimRequest)?.groupId) {
      claims = [(claims as ClaimRequest)];
    }
    claims = claims as AuthRequest[];

    for (let claim of claims) {
      if (typeof claim.claimType === undefined) {
        throw new Error("you must provide a claimType");
      }
      if (typeof claim.groupId === undefined) {
        throw new Error("you must provide a groupId");
      }

      claim.claimType = claim.claimType ?? ClaimType.GTE;
      claim.extraData = claim.extraData ?? '';
      claim.groupTimestamp = claim.groupTimestamp ?? "latest";
      claim.value = claim.value ?? 1;
    }
    
    return claims;
  }

  static buildSignature(signature: SignatureRequest) {
    if (!signature) {
      return null;
    }
    if (typeof signature.message === undefined) {
      throw new Error("you must provide a message");
    }

    signature.isSelectableByUser = signature.isSelectableByUser ?? false; 
    signature.extraData = signature.extraData ?? "";

    return signature;
  }
}

export type VerifiedClaim = ClaimRequest & {
  proofId: string;
  proofData: string;
}

export type VerifiedAuth = AuthRequest & {
  proofData: string;
}
