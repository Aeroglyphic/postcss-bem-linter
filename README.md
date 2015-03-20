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

* Only allow selectors that *begin* with a selector sequence matching the defined convention
  (ignoring sequences are combinators).
* Only allow custom-property names that *begin* with the defined `ComponentName`.
* The `:root` selector can only contain custom-properties.
* The `:root` cannot be combined with other selectors.

**Strict mode**:

* All the tests in "default mode".
* Disallow selector sequences *after combinators* that do not match the
  defined convention. (The convention for sequences after combinators can be the same as
  or different from that for initial sequences.)

## Use

```
postcss().use(bemLinter([pattern]));
```

### Defining your pattern

Patterns consist of regular expressions that describe valid selector sequences.

Please note that *patterns define sequences, not just simple selectors*. So if, for example,
you would like to be able to chain state classes to your component classes, as in
`.Component.is-open`, your pattern needs to allow for this chaining.

Also note that *pseudo-classes and pseudo-elements must be at the end of sequences, and
will be ignored*. Instead of `.Component:first-child.is-open` you should use
`.Component.is-open:first-child`. The former will cause an error.

#### Preset Patterns

You can use a preset pattern by passing a string. The following preset patterns are available:

- `'suit'` (default), as defined [here](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md).
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
    Two things to note: In non-strict mode, *any* combined sequences are accepted.
    And if you do not specify a combined pattern, in strict mode it is assumed that combined
    sequences must match the same pattern as initial sequences.
- `utilities`: A regular expression describing valid utility selectors. This will be use
    if the stylesheet uses `/** @define utilities */`, as explained below.

So you might call the plugin in any of the following ways:

```js
// use 'suit' conventions
bemLinter();
bemLinter('suit');

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

Strict mode is turned on by adding `; use strict` to this definition,
e.g. `/** @define ComponentName; use strict */`.

```css
/** @define MyComponent */

:root {
  --MyComponent-property: value;
}

.MyComponent {}

.MyComponent .other {}
```

Strict mode:

```css
/** @define MyComponent; use strict */

:root {
  --MyComponent-property: value;
}

.MyComponent {}

.MyComponent-other {}
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
