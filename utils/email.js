module.exports = {
  parseFrom: (input) => {
    const rgx = /^([^<]+ )?<?(([A-z0-9_-]+)@([^>]+))>?$/;
    const matches = rgx.exec(input);
    if (!matches) return false;
    const [, name, address, username, domain] = matches;
    return {
      name, address, username, domain,
    };
  },
};
