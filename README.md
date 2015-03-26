# postcss-bem-linter

[![Build Status](https://secure.travis-ci.org/necolas/postcss-bem-linter.png?branch=master)](http://travis-ci.org/necolas/postcss-bem-linter)

A [PostCSS](https://github.com/postcss/postcss) plugin to lint *BEM-style* CSS.

*BEM-style* describes CSS that follows a more-or-less strict set of conventions determining
what selectors can be used. Typically, these conventions require that classes begin with
the name of the component (or "block") that contains them, and that all characters after the
namespace follow a specified pattern. Original BEM methodology refers to "blocks", "elements",
and "modifiers"; SUIT refers to "components", "descendants", and "modifiers". You might have your
own terms for similar concepts.

With this plugin, you can check the validity of stylesheets against a set of BEM-style conventions.
You can use preset patterns (SUIT and BEM, currently) or insert your own. The plugin will throw an
error if it finds CSS that does not follow the specified conventions.

## Installation

```
npm install postcss-bem-linter
```

## Conformance tests

**Default mode**:

* Only allow selectors sequences that match the defined convention.
* Only allow custom-property names that *begin* with the defined `ComponentName`.
* The `:root` selector can only contain custom-properties.
* The `:root` cannot be combined with other selectors.

**Weak mode**:

* While *initial* selector sequences (before combinators) must match the defined convention,
  sequences *after* combinators are not held to any standard.

## Use

```
postcss().use(bemLinter([pattern, options]));
```

### Defining your pattern

Patterns consist of regular expressions, and functions that return regular expressions,
which describe valid selector sequences.

Please note that *patterns describe sequences, not just simple selectors*. So if, for example,
you would like to be able to chain state classes to your component classes, as in
`.Component.is-open`, your pattern needs to allow for this chaining.

Also note that *pseudo-classes and pseudo-elements must be at the end of sequences, and
will be ignored*. Instead of `.Component:first-child.is-open` you should use
`.Component.is-open:first-child`. The former will cause an error.

#### Preset Patterns

You can use a preset pattern by passing a string as the `pattern`, and, if needed, an `options` object,
as in `bemLinter('suit', { namespace: 'twt' })`. Options are pattern-specific.

The following preset patterns are available:

- `'suit'` (default), as defined [here](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md).
  Options:
  - `namespace`: a namespace to prefix valid classes, as described
    [in the SUIT docs](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md#namespace-optional)
- `'bem'`, as defined [here](https://en.bem.info/tools/bem/bem-naming/).

**`'suit'` is the default pattern**; so if you do not pass any `pattern` argument,
SUIT conventions will be enforced.

#### Custom Patterns

You can define a custom pattern by passing an object with the following properties:

- `componentName` (optional): A regular expression describing valid component names.
  Default is `/[-_a-zA-Z0-9]+/`.
- `selectors`: Either of the following:
  - A single function that accepts a component name and returns a regular expression describing
    all valid selector sequences.
  - An object consisting of two methods, `initial` and `combined`. Both methods accept a
    component name and return a regular expression. `initial` returns a description of valid
    initial selector sequences — those occurring at the beginning of a selector, before any
    combinators. `combined` returns a description of valid selector sequences allowed *after* combinators.
    Two things to note: If you do not specify a combined pattern, it is assumed that combined
    sequences must match the same pattern as initial sequences.
    And in weak mode, *any* combined sequences are accepted.
- `utilities`: A regular expression describing valid utility selectors. This will be use
  if the stylesheet uses `/** @define utilities */`, as explained below.

So you might call the plugin in any of the following ways:

```js
// use 'suit' conventions
bemLinter();
bemLinter('suit');
bemLinter('suit', { namespace: 'twt' });

// use 'bem' conventions
bemLinter('bem');

// define a RegExp for component names
bemLinter({
  componentName: /[A-Z]+/
});

// define a single RegExp for all selector sequences, initial or combined
bemLinter({
  selectors: function(componentName) {
    return new RegExp('^\\.' + componentName + '(?:-[a-z]+)?$');
  }
});

// define separate `componentName`, `initial`, `combined`, and `utilities` RegExps
bemLinter({
  componentName: /[A-Z]+/,
  selectors: {
    initial: function(componentName) {
      return new RegExp('^\\.' + componentName + '(?:-[a-z]+)?$');
    },
    combined: function(componentName) {
      return new RegExp('^\\.combined-' + componentName + '-[a-z]+$');
    }
  },
  utilities: /^\.util-[a-z]+$/
});
```

### Defining a component

The plugin will only run against files that explicitly declare that they
are defining either a named component or utilities, using either
`/** @define ComponentName */` or `/** @define utilities */` in the first line
of the file.

Weak mode is turned on by adding `; weak` to this definition,
e.g. `/** @define ComponentName; weak */`.

```css
/** @define MyComponent */

:root {
  --MyComponent-property: value;
}

.MyComponent {}

.MyComponent-other {}
```

Weak mode:

```css
/** @define MyComponent; weak */

:root {
  --MyComponent-property: value;
}

.MyComponent {}

.MyComponent .other {}
```

Utilities:

```css
/** @define utilities */

.u-sizeFill {}

.u-sm-horse {}
```

If a component is defined and the component name does not match your `componentName` pattern,
the plugin will throw an error.

### Testing CSS files

Pass your individual CSS files through the plugin. It will throw errors for
conformance failures, which you can log when caught by your build tools.

```js
var postcss = require('postcss');
var bemLinter = require('postcss-bem-linter');

files.forEach(function (file) {
  var css = fs.readFileSync(file, 'utf-8');
  postcss().use(bemLinter()).process(css);
});
```

## Development

Install the dependencies.

```
npm install
```

Run the tests.

```
npm test
```

Watch and automatically re-run the unit tests.

```
npm start
```
