import {
  HydraS1Verifier
} from "@sismo-core/hydra-s1";

describe("Eddsa account", () => {
  const validSnarkProof = {
    input: [
       "371710798829132293946033808365292424820695676805",
       "5",
       "13694022827327392162307984190030265167779463290556240196471372692464680348124",
       "19644872369728090911561801126138671047740635834672788827973600491256736746205",
       "13755078331390445744379292003243290618377728138478442035867540350655503067561",
       "4333242270533449369775340830183063571320857197474427260485265661193516848034",
       "18973401563908906042127505900904375377208916030386993546551955010755331077206",
       "1",
       "11014464244705073288562227072602767043171862313145955791074840174067332416492",
       "1"
    ],
    a: [
     "3605265346028722811475255271199278840601255255609437862328540513440603703546",
     "14108195692122045727913001358293208635617138550017055726343556060730422861797"
    ],
    b: [
        [
         "2176019328953084325466043268897897797339481957991844415643557174317383859397",
         "18852424462515636681289150702974094949555843565558710304718454241762941610514"
        ],
        [
         "2255296163810865425829186716853515979505024892238851063299670218392642098795",
         "7197444191233608457181745829224811489951431424378074068697816033185280905105"
        ]
    ],
    c: [
     "21089604210755876055484958805044659835222722635851412990677310268866508695165",
     "15444823675448023390656114781820268313025588650840225242781419572184771382469"
    ]
  }

  it("Should return true while verifying the proof", async () => {
    const isValid = await HydraS1Verifier.verifyProof(validSnarkProof.a, validSnarkProof.b, validSnarkProof.c, validSnarkProof.input);
    expect(isValid).toEqual(true);
  });

  it("Should return false while verifying the proof", async () => {
    validSnarkProof.input[0] = "00000000000000000000000000000000000000000000";
    const isValid = await HydraS1Verifier.verifyProof(validSnarkProof.a, validSnarkProof.b, validSnarkProof.c, validSnarkProof.input);
    expect(isValid).toEqual(false);
  });

  it("", async () => {
    
  });
});
