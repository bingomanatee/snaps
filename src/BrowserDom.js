Space.prototype.bd = function(ele, parent) {
    var dom = SNAPS.dom(this, this.snaps.length, ele, parent);
    this.snaps.push(dom);
    return dom;
};

SNAPS.dom = function(space, i, e, p) {

    if (!Dom) {
        _makeDom();
    }

    return new Dom(space, i, e, p);
};

var Dom;
SNAPS.typeAliases.SNAP.push('DOM');

function _makeDom() {
    Dom = function(space, id, ele, parent) {
        Snap.call(this, space, id, {});

        this.styleSnap = space.snap();
        this.link('resource', this.styleSnap).meta = 'style';
        // although this is referenced as a direct property we add it to the links to enable cascading delete

        this.attrSnap = space.snap();
        this.link('resource', this.attrSnap).meta = 'attr';
        // although this is referenced as a direct property we add it to the links to enable cascading delete

        this.attrSnap.listen('updateProperties', _attrSnapChanges, this);
        this.styleSnap.listen('updateProperties', _styleSnapChanges, this);
        this._element = ele;
        this._parent = parent;
        if (ele && parent && ele.parentNode !== parent) {
            parent.appendChild(ele);
        }

        this.listen('element', function(element) {
            var addElement = this.get('addElement');
            if (addElement) {
                if (addElement === true) {
                    this.addElement();
                } else {
                    var parent = addElement.$TYPE == Dom.prototype.$TYPE ? addElement.e() : addElement;
                    this.addElement(parent);
                }
            }
        }, this)

        this.changeReceptors.content = new signals.Signal();
        this.changeReceptors.content.add(function(content){
            this.e().innerHTML = content;
        }, this)
    };

    Dom.prototype = Object.create(Snap.prototype);
    Dom.prototype.$TYPE = 'DOM';

    Dom.prototype.domNodeName = function() {
        return this.has('tag') ? this.get('tag') : 'div';
    };

    //@TODO: is this async?
    Dom.prototype.element = Dom.prototype.e = function() {
        if (!this._element) {
            if (typeof (document) == 'undefined') {
                if (this.space.document) {
                    this.element = this.space.document.createElement(this.domNodeName());
                    this.dispatch('element', this.element);
                } else {
                    // this may not work if env is async....
                    SNAPS.jsdom = require('jsdom');
                    var self = this;

                    SNAPS.jsdom.env(
                        '<html><body></body></html>',
                        [],
                        function(errors, w) {
                            window = w;
                            self.space.window = w;
                            self.space.document = window.document;
                            self.element = space.document.createElement(self.domNodeName());
                            self.dispatch('element', self.element);
                        }
                    );
                }
            } else {
                this.window = window; // global
                this.document = document; // global
                this._element = document.createElement(this.domNodeName());
            }
        }
        return this._element;
    };

    Dom.prototype.setStyle = function(prop, value){

        var args = _.toArray(arguments);
        var prop = args[0];
        if (typeof(prop) == 'object') {
            for (var p in prop) {
                this.styleSnap.set(p, prop[p]);
            }
            return this;
        } else {
            this.styleSnap.set(prop, value)
        }
    };

    Dom.prototype.setContent = function(content){
        this.set('content', content);
        return this;
    };

    Dom.prototype.destroy = function() {
        if (this._element) {
            this.removeElement();
        }
        Snap.prototype.destroy.call(this);
    };

    Dom.prototype.addElement = function(parent) {
        if (!parent) {
            parent = this.space.document.body;
        }
        parent.appendChild(this.e());
        return this;
    };

    Dom.prototype.h = Dom.prototype.html = function(value) {

        if (arguments.length > 0) {
            this.e().innerHTML = value;
            return this;
        } else {
            return this.e().innerHTML;
        }
    };

    Dom.prototype.a = Dom.prototype.attr = function(prop, value) {

        if (dataRE.test(prop)) {
            var args = _.toArray(arguments);
            return this.d.apply(this, args);
        }
        if (arguments.length > 1) {
            this.e().setAttribute(prop, value);
            return this;
        } else {
            return this.e().getAttribute(prop);
        }
    };

    /**
     * directly write to the dom's style. This for the most part should be done
     * through the snap system.
     *
     * parameters can be:
     *  -- prop (returns elements current value)
     *  -- prop, value
     *  -- prop, value, unit
     *  -- config object (prop/value pairs)
     *  -- config, unit
     *
     */
    Dom.prototype.s = Dom.prototype.style = function() {

        var args = _.toArray(arguments);
        var prop = args[0];
        if (typeof(prop) == 'object') {

            // this recursive call allows for a config object with subsequent arguments.
            var pArgs = args.slice(1);
            for (var p in prop) {
                var value = prop[p];
                this.s(p, value);
            }
            return this;
        } else if (args.length > 1) {
            var value = args[1];

            // append 'px' (pixels) to numeric properties that require numeric units
            if (typeof(value) == 'number' && _pxProps[prop.toLowerCase()]) {
                var unit;
                if (args.length > 2){
                     unit = args[2]
                } else {
                    unit = 'px';
                }
                value = Math.round(value) + unit;
            }
            this.e().style[prop] = value;
            return this;
        } else {
            return this.e().style[prop];
        }
    };

    Dom.prototype.removeElement = function() {
        var parent = this.e().parentNode;
        if (parent) {
            parent.removeChild(this.e());
        }
        return this;
    };

    /**
     * data is kept in its own snap as it has different significance in use
     *
     * @type {RegExp}
     */

    Dom.prototype.d =
        Dom.prototype.data = function() {
            var args = _.toArray(arguments);
            var prop = args[0];
            if (typeof(prop) == 'object') {
                var pArgs = args.slice(1);
                for (var p in prop) {
                    var arg = prop[p];
                    pArgs.unshift(arg);
                    pArgs.unshift(p);
                    this.d.apply(this, pArgs);
                }

                return;
            } else {
                var value = args[1];
            }
            prop = prop.replace(dataRE, '').toLowerCase();

            if (arguments.length > 1) {
                if (!this.dataSnap) {
                    this._initDataSnap();
                }
                this.dataSnap.set(prop, value);
            } else {
                if (!this.dataSnap || !this.dataSnap.has(prop)) {
                    return null;
                } else {
                    return this.dataSnap.get(prop);
                }
            }

        };

    Dom.prototype._initDataSnap = function() {
        this.dataSnap = this.space.snap();
        var i, attrs, l;
        for (i = 0, attrs = this.e().attributes, l = attrs.length; i < l; i++) {
            var attr = (attrs.item(i).nodeName);
            if (dataRE.test(attr)) {
                this.d(this.a(attr));
            }
        }
    };
}

function _styleSnapChanges() {
    var state = this.styleSnap.state();
    this.s(state);
}

function _attrSnapChanges() {
    for (var p in this.attrSnap.lastChanges) {
        var value = this.attrSnap.lastChanges[p].pending;

        if (value === SNAPS.DELETE) {
            this.e().removeAttribute(p);
        } else {
            this.a(p, value);
        }
    }
}
