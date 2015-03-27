var util = require('./test-util');
var assertSuccess = util.assertSuccess;
var assertFailure = util.assertFailure;
var selectorTester = util.selectorTester;

describe('selector validation', function () {
  describe('with a custom `componentName` pattern', function () {
    var p1 = { componentName: /^[A-Z]+$/, componentSelectors: function () { return /.*/; } };
    var p2 = { componentName: /^[a-z]+1$/, componentSelectors: function () { return /.*/; } };

    it('rejects invalid component names', function () {
      assertFailure('/** @define Foo */', p1);
      assertFailure('/** @define foo2 */', p2);
    });

    it('accepts valid component names', function () {
      assertSuccess('/** @define FOO */', p1);
      assertSuccess('/** @define abc1 */', p2);
    });
  });

  describe('with a single `componentSelectors` pattern', function () {
    var patternA = {
      componentSelectors: function (cmpt) {
        return new RegExp('^\\.[a-z]+-' + cmpt + '(?:_[a-z]+)?$');
      }
    };
    var s = selectorTester('/** @define Foo */');

    it('accepts valid initial componentSelectors', function () {
      assertSuccess(util.fixture('patternA-valid'), patternA);
    });

    it('rejects invalid initial componentSelectors', function () {
      assertFailure(s('.Foo'), patternA);
    });

    it(
      'rejects invalid initial componentSelectors in media queries',
      function () {
        assertFailure('/** @define Foo */ @media all { .Bar {} }');
      }
    );

    it('ignores pseudo-selectors at the end of a sequence', function () {
      assertSuccess(s('.f-Foo:hover'), patternA);
      assertSuccess(s('.f-Foo::before'), patternA);
      assertSuccess(s('.f-Foo:not(\'.is-open\')'), patternA);
    });

    it('accepts valid combined componentSelectors', function () {
      assertSuccess(s('.f-Foo .f-Foo'), patternA);
      assertSuccess(s('.f-Foo > .f-Foo'), patternA);
    });

    it('rejects invalid combined componentSelectors', function () {
      assertFailure(s('.f-Foo > div'), patternA);
      assertFailure(s('.f-Foo + #baz'), patternA);
      assertFailure(s('.f-Foo~li>a.link#baz.foo'), patternA);
    });

    describe('in weak mode', function () {
      var sWeak = selectorTester('/** @define Foo; weak */');

      it('accepts any combined componentSelectors', function () {
        assertSuccess(sWeak('.f-Foo .f-Foo'), patternA);
        assertSuccess(sWeak('.f-Foo > div'), patternA);
        assertSuccess(sWeak('.f-Foo + #baz'), patternA);
        assertSuccess(sWeak('.f-Foo~li>a.link#baz.foo'), patternA);
      });
    });
  });

  describe(
    'with different `initial` and `combined` selector patterns',
    function () {
    var patternB = {
      componentSelectors: {
        initial: function (cmpt) {
          return new RegExp('^\\.' + cmpt + '(?:-[a-z]+)?$');
        },
        combined: function (cmpt) {
          return new RegExp('^\\.c-' + cmpt + '(?:-[a-z]+)?$');
        }
      }
    };
    var s = selectorTester('/** @define Foo */');

    it('accepts valid combined componentSelectors', function () {
      assertSuccess(s('.Foo .c-Foo'), patternB);
      assertSuccess(s('.Foo-bar > .c-Foo-bar'), patternB);
      assertSuccess(s('.Foo-bar>.c-Foo-bar'), patternB);
    });

    it('rejects invalid combined componentSelectors', function () {
      assertFailure(s('.Foo .cc-Foo'), patternB);
      assertFailure(s('.Foo > .Foo-F'), patternB);
    });

    describe('in weak mode', function () {
      var sWeak = selectorTester('/** @define Foo; weak*/');

      it('accepts any combined componentSelectors', function () {
        assertSuccess(sWeak('.Foo .c-Foo'), patternB);
        assertSuccess(sWeak('.Foo .Foo'), patternB);
        assertSuccess(sWeak('.Foo > div'), patternB);
        assertSuccess(sWeak('.Foo + #baz'), patternB);
        assertSuccess(sWeak('.Foo~li>a.link#baz.foo'), patternB);
      });
    });
  });

  describe('checking utilitySelectors', function () {
    var patternC = {
      utilitySelectors: /^\.UTIL-[a-z]+$/
    };
    var s = selectorTester('/** @define utilities */');

    it('accepts valid utilitySelectors', function () {
      assertSuccess(s('.UTIL-foo'), patternC);
      assertSuccess(s('.UTIL-foobarbaz'), patternC);
    });

    it('rejects invalid utilitySelectors', function () {
      assertFailure(s('.Foo'), patternC);
      assertFailure(s('.U-foo'), patternC);
    });
  });
});
