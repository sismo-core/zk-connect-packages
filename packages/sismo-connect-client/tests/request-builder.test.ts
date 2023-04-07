import { resolveSismoIdentifier } from '../src/common-types';
import { AuthType } from '../src/common-types';

describe('RequestBuilder', () => {
  describe('buildAuths', () => {
    it('should resolve the right identifier', () => {
        const identifier = "0x00010000000000123";
        const sismoIdentifier = resolveSismoIdentifier(identifier, AuthType.GITHUB);
        expect(sismoIdentifier).toEqual(
            `123`
        )
        console.log(sismoIdentifier);
    });
    it('should keep the same identifier', () => {
        const identifier = "123";
        const sismoIdentifier = resolveSismoIdentifier(identifier, AuthType.GITHUB);
        expect(sismoIdentifier).toEqual(
            `123`
        )
        console.log(sismoIdentifier);
    });
  });
});