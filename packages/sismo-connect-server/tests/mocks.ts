import { SismoConnectResponse } from "../src";

export const commitmentMapperPubKey = [
  "3602196582082511412345093208859330584743530098298494929484637038525722574265",
  "14672613011011178056703002414016466661118036128791343632962870104486584019450",
];

export const sismoConnectSimpleClaimResponseMock: SismoConnectResponse =  {
  "appId":"0x112a692a2005259c25f6094161007967",
  "namespace":"main",
  "version":"sismo-connect-v1",
  "proofs":[{
    "claims":[{
      "claimType":0,
      "groupId":"0x682544d549b8a461d7fe3e589846bb7b",
      "groupTimestamp":"latest",
      "value":1,
      "extraData":"",
      "isSelectableByUser":false
    }],
    "proofData":"0x0840e305720d5215e3aebfb032b93f9050a73d526567cbd254dd988d3a69bd242321f2f9a56a7a5cf001098995d28a32a95ba81bf1c2951d0a1acc291e0dcfee07cfd83c122ac2445359eb1cef18dfd36c34155b7669223848322b300c7b0d9f1cb777e32a9d16b5960bf3305b54df6801d6b170a9205e4efc32274f12f71ec40580cabceea65b4ecc2d2e3c9208af2314e8c5a2cc514afd556b4b96f7772fb52cfd7207eec490b3cdfecaf593f3ad20d8b77144a0da984324783fce1a62c3a520e1ecfa27ef24860e01719147b5509620e1f0788f4b0c3afe32ef427d903d8708809d3c0decc0dccbe64ed81ac868aed42f69b56ca7cab1cbd2ad4d918ab440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002ab71fb864979b71106135acfa84afc1d756cda74f8f258896f896b4864f025630423b4c502f1cd4179a425723bf1e15c843733af2ecdee9aef6a0451ef2db741c5f79ac998d1fbeb6d2e0144839dc8f65820487ab2fed1a2e6d16d3347675cf2e796e50ca7b543ed70c1042bcb1556af97a175043e14c15c3e8f6d30c867225117a2ecbd84f3d6ae3a5bd06b39e03a55c20b3b52bc7e211e19fe8bf82b01d9c0000000000000000000000000000000000000000000000000000000000000001075ca7ef8755640e675db2eb95440ac11bf9a3d480011edd783c14d81ffffffe00000000000000000000000000000000000000000000000000000000000000002b4f0a232a8054b1e202bac5d8e6ffb12fd83b1b4e4985cb11f335dd042ab2110a13966ba7f5bb9e347b50a2b7fa12a296b75b5e901fdee64c14cc69b5645bc200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
    "extraData":"",
    "provingScheme":"hydra-s3.1"
  }]
} as SismoConnectResponse;