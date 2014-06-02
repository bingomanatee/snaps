The difference between the two snaps is in the nature of their define statement. If you don't use require,
or you use Node.js, this difference does not affect you.

If you are afflicted with require.js, note that the snaps.alt.js uses "functional defines" (like Famo.us)

``` javascript
    define(function(require, exports, module) {
        module.exports = factory(require('lodash'), require('signals'));
    });
```

where snaps.js uses "declarative defines"

``` javascript
    define('SNAPS', ['_', 'signals'], factory);
```

In all other respects the two files are absolutely identical.
