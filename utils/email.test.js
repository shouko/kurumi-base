const { parseFrom } = require('./email');

describe('parseFrom', () => {
  it('Can parse address with name', () => {
    expect(parseFrom('Foo Bar <apple@example.com>')).toEqual({
      name: 'Foo Bar',
      address: 'apple@example.com',
      username: 'apple',
      domain: 'example.com',
    });
  });


  it('Can parse local part with dot', () => {
    expect(parseFrom('Foo Bar <a.p.ple@example.com>')).toEqual({
      name: 'Foo Bar',
      address: 'a.p.ple@example.com',
      username: 'a.p.ple',
      domain: 'example.com',
    });
  });

  describe('Can parse address without name', () => {
    it('with brackets', () => {
      expect(parseFrom('<apple@example.com>')).toEqual({
        name: undefined,
        address: 'apple@example.com',
        username: 'apple',
        domain: 'example.com',
      });
    });

    it('without brackets', () => {
      expect(parseFrom('apple@example.com')).toEqual({
        name: undefined,
        address: 'apple@example.com',
        username: 'apple',
        domain: 'example.com',
      });
    });
  });

  describe('Returns false for invalid input', () => {
    it('name only', () => {
      expect(parseFrom('Foo Bar')).toBeFalsy();
      expect(parseFrom('Foobar')).toBeFalsy();
    });

    it('malformed address', () => {
      expect(parseFrom('Foo Bar <apple@>')).toBeFalsy();
      expect(parseFrom('Foo Bar <@apple>')).toBeFalsy();
    });
  });
});
