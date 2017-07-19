var postcss = require('postcss');
var assert = require('assert');
var linter = require('..');

describe('nodes without sources', () => {
  it('should ignore both comments and rules', done => {
    var sourcelessAST = postcss.root();
    var comment = postcss.comment({ text: 'postcss-bem-linter: define Foo' });
    var rule = postcss.rule({ selector: '#bar' });
    sourcelessAST.append(comment);
    sourcelessAST.append(rule);
    postcss()
      .use(linter({ preset: 'suit' }))
      .process(sourcelessAST)
      .then(result => {
        var warnings = result.warnings();
        assert.equal(warnings.length, 0);
        done();
      }).catch(done);
  });
});
