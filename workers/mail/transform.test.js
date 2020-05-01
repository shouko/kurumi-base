const {
  buildPreDeliverPayload,
  buildMessagePayload,
  transformBody,
} = require('./transform');

describe('transformBody', () => {
  let args; let data;
  let htmlInput;
  let textInput;
  let htmlSplit;
  let textSplit;

  beforeEach(() => {
    args = {
      to: {
        name: '',
        address: '',
        username: '',
        domain: '',
      },
    };
    data = {
      receive: {
        nickname: {
          'foo@example.com': 'Nanasi',
          'bar@example.jp': 'タロウ',
        },
      },
    };
    htmlInput = '<HTML><body>Hello Nanasi World<br>Nanasi fuga</body></HTML>';
    textInput = 'Hello Nanasi World\nNanasi fuga';
    htmlSplit = ['<HTML><body>Hello ', ' World<br>', ' fuga</body></HTML>'];
    textSplit = ['Hello ', ' World\n', ' fuga'];
  });

  describe('Can peform nickname replacement', () => {
    it('rule defined, matching', () => {
      expect(transformBody({
        ...args.to,
        address: 'foo@example.com',
      }, htmlInput, data, true)).toEqual(htmlSplit);
      expect(transformBody({
        ...args.to,
        address: 'foo@example.com',
      }, textInput, data, true)).toEqual(textSplit);
    });

    it('rule defined, not matching', () => {
      expect(transformBody({
        ...args.to,
        address: 'bar@example.jp',
      }, htmlInput, data, true)).toEqual([htmlInput]);
      expect(transformBody({
        ...args.to,
        address: 'bar@example.jp',
      }, textInput, data, true)).toEqual([textInput]);
    });

    it('rule not defined', () => {
      expect(transformBody({
        ...args.to,
        address: 'ggg@example.com',
      }, htmlInput, data, true)).toEqual([htmlInput]);
      expect(transformBody({
        ...args.to,
        address: 'ggg@example.com',
      }, textInput, data, true)).toEqual([textInput]);
    });
  });
});

describe('buildMessagePayload', () => {
  let args;
  let body;

  beforeEach(() => {
    args = {
      user: {
        email: {
          address: 'oshi@example.jp',
          verified: true,
        },
        nickname: 'ハナコ',
      },
      from: 'foo@example.com',
      subject: 'Awesome Title',
    };
    body = {
      htmlSplit: ['<HTML><body>Hello ', ' World<br>', ' fuga</body></HTML>'],
      textSplit: ['Hello ', ' World\n', ' fuga'],
      htmlNick: '<HTML><body>Hello ハナコ World<br>ハナコ fuga</body></HTML>',
      textNick: 'Hello ハナコ World\nハナコ fuga',
      htmlDummy: '<HTML><body>Hello 〇〇 World<br>〇〇 fuga</body></HTML>',
      textDummy: 'Hello 〇〇 World\n〇〇 fuga',
    };
  });

  describe('Can fill in nickname', () => {
    describe('Text only', () => {
      it('no nickname', () => {
        expect(buildMessagePayload({
          user: { ...args.user, nickname: null },
          from: args.from,
          subject: 'Awesome Title',
          text: body.textSplit,
        })).toEqual({
          from: args.from,
          to: 'oshi@example.jp',
          subject: 'Awesome Title',
          text: body.textDummy,
        });
      });

      it('has nickname', () => {
        expect(buildMessagePayload({
          user: { ...args.user },
          from: args.from,
          subject: 'Awesome Title',
          text: body.textSplit,
        })).toEqual({
          from: args.from,
          to: 'oshi@example.jp',
          subject: 'Awesome Title',
          text: body.textNick,
        });
      });
    });

    describe('HTML only', () => {
      it('no nickname', () => {
        expect(buildMessagePayload({
          user: { ...args.user, nickname: null },
          from: args.from,
          subject: 'Awesome Title',
          html: body.htmlSplit,
        })).toEqual({
          from: args.from,
          to: 'oshi@example.jp',
          subject: 'Awesome Title',
          html: body.htmlDummy,
        });
      });

      it('has nickname', () => {
        expect(buildMessagePayload({
          user: { ...args.user },
          from: args.from,
          subject: 'Awesome Title',
          html: body.htmlSplit,
        })).toEqual({
          from: args.from,
          to: 'oshi@example.jp',
          subject: 'Awesome Title',
          html: body.htmlNick,
        });
      });
    });

    describe('Text and HTML', () => {
      it('no nickname', () => {
        expect(buildMessagePayload({
          user: { ...args.user, nickname: null },
          from: args.from,
          subject: 'Awesome Title',
          text: body.textSplit,
          html: body.htmlSplit,
        })).toEqual({
          from: args.from,
          to: 'oshi@example.jp',
          subject: 'Awesome Title',
          text: body.textDummy,
          html: body.htmlDummy,
        });
      });

      it('has nickname', () => {
        expect(buildMessagePayload({
          user: { ...args.user },
          from: args.from,
          subject: 'Awesome Title',
          text: body.textSplit,
          html: body.htmlSplit,
        })).toEqual({
          from: args.from,
          to: 'oshi@example.jp',
          subject: 'Awesome Title',
          text: body.textNick,
          html: body.htmlNick,
        });
      });
    });
  });
});

describe('buildPreDeliverPayload', () => {
  let topic;
  let from;
  let to;
  let subject;
  let text;
  let html;

  beforeEach(() => {
    topic = {
      data: {
        deliver: {
          name: 'アスカ',
          domain: 'mail.example.us',
        },
      },
    };
    subject = '無題';
    from = {
      name: undefined,
      username: 'eva-soryu_asuka_langley',
    };
    to = 'ayanami-rei@mail.example.com';
    text = 'static text';
    html = '<h1>hello html</h1>';
  });

  it('fail if no proper deliver data', () => {
    expect(buildPreDeliverPayload({
      topic: {},
      from,
    })).toBeFalsy();
    expect(buildPreDeliverPayload({
      topic: { data: {} },
      from,
    })).toBeFalsy();
    expect(buildPreDeliverPayload({
      topic: { data: { deliver: {} } },
      from,
    })).toBeFalsy();
  });

  it('keeps subject intact', () => {
    expect(buildPreDeliverPayload({
      topic,
      subject: String(subject),
      from,
    })).toHaveProperty('subject', subject);
  });

  describe('Can prepare payload', () => {
    it('with peferred deliver name', () => {
      expect(buildPreDeliverPayload({
        topic,
        from,
        to,
      })).toHaveProperty('from', 'アスカ <eva-soryu_asuka_langley@mail.example.us>');
    });

    describe('Without preferred deliver name', () => {
      it('with raw deliver name', () => {
        expect(buildPreDeliverPayload({
          topic: {
            data: {
              deliver: {
                ...topic.data.deliver,
                name: undefined,
              },
            },
          },
          from: {
            ...from,
            name: 'あすか',
          },
          to,
        })).toHaveProperty('from', 'あすか <eva-soryu_asuka_langley@mail.example.us>');
      });

      it('without raw deliver name', () => {
        expect(buildPreDeliverPayload({
          topic: {
            data: {
              deliver: {
                ...topic.data.deliver,
                name: undefined,
              },
            },
          },
          from: {
            ...from,
          },
          to,
        })).toHaveProperty('from', '<eva-soryu_asuka_langley@mail.example.us>');
      });
    });

    it('with text only', () => {
      const res = buildPreDeliverPayload({
        topic, from, to, text,
      });
      expect(res).toHaveProperty('text');
      expect(res).not.toHaveProperty('html');
    });

    it('with HTML only', () => {
      const res = buildPreDeliverPayload({
        topic, from, to, html,
      });
      expect(res).toHaveProperty('html');
      expect(res).not.toHaveProperty('text');
    });

    it('with text and HTML', () => {
      const res = buildPreDeliverPayload({
        topic, from, to, text, html,
      });
      expect(res).toHaveProperty('text');
      expect(res).toHaveProperty('html');
    });
  });
});
