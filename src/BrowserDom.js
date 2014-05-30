Space.prototype.bd = function(ele, parent) {
    var dom = SNAPS.domElement(this, this.snaps.length, ele, parent);
    this.snaps.push(dom);
    return dom;
};

SNAPS.domElement = function(space, i, e, p) {

    if (!DomElement) {
        _makeDom();
    }

    return new DomElement(space, i, e, p);
};

var DomElement;
SNAPS.typeAliases.SNAP.push('DOM');

function _makeDom() {
    DomElement = function(space, id, ele, parent) {
        Snap.call(this, space, id, {});

        this.styleSnap = space.snap();
        this.link('resource', this.styleSnap).meta = 'style';
        // although this is referenced as a direct property we add it to the links to enable cascading delete

        this.attrSnap = space.snap();
        this.link('resource', this.attrSnap).meta = 'attr';
        // although this is referenced as a direct property we add it to the links to enable cascading delete

        this.attrSnap.listen('updateProperties', _attrSnapChanges, this);
        this.styleSnap.listen('updateProperties', _styleSnapChanges, this);
        this.propChangeTerminal.listen('innerhtml', function(newContent) {
            this.h(newContent);
        }, this);
        this._element = ele;
        if (ele && parent) {
            if (parent.$TYPE == 'DOM') {
                parent.e().appendChild(ele);
            } else {
                parent.appendChild(ele);
            }
        }

        this.listen('element', function(element) {
            var addElement = this.get('addElement');
            if (addElement) {
                if (addElement === true) {
                    this.addElement();
                } else {
                    var parent = addElement.$TYPE == DomElement.prototype.$TYPE ? addElement.e() : addElement;
                    this.addElement(parent);
                }
            }
        }, this);
        this.propChangeTerminal.listen('innerhtml', this.h, this)
    };

    DomElement.prototype = Object.create(Snap.prototype);
    DomElement.prototype.$TYPE = 'DOM';

    DomElement.prototype.domNodeName = function() {
        return this.has('tag') ? this.get('tag') : 'div';
    };

    //@TODO: is this async?
    DomElement.prototype.element = DomElement.prototype.e = function() {
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

    DomElement.prototype.setStyle = function(prop, value) {
        if (typeof(prop) == 'object') {
            for (var p in prop) {
                this.styleSnap.set(p, prop[p]);
            }
        } else {
            this.styleSnap.set(prop, value)
        }
        return this;
    };

    DomElement.prototype.innerHTML = function(content) {
        if (this.hasDomChildren()){
            throw new Error('innerHTML: cannot add content to a browserDom snap with domChildren');
        }
        this.set('innerhtml', content);
        return this;
    };

    DomElement.prototype.destroy = function() {
        if (this._element) {
            this.removeElement();
        }
        Snap.prototype.destroy.call(this);
    };

    DomElement.prototype.addElement = function(parent) {
        if (!parent) {
            parent = this.space.document.body;
        }
        parent.appendChild(this.e());
        return this;
    };

    DomElement.prototype.h = DomElement.prototype.html = function(innerhtml) {
        if (arguments.length > 0) {
            if (this.hasDomChildren()) {
                throw new Error('attempting to add content to a browserDom snap with domChildren');
            }

            this.e().innerHTML = innerhtml;
            return this;
        } else {
            return this.e().innerHTML;
        }
    };

    DomElement.prototype.a = DomElement.prototype.attr = function(prop, value) {

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
     * directly write to the domElements's style. This for the most part should be done
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
    DomElement.prototype.s = DomElement.prototype.style = function() {

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
                if (args.length > 2) {
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

    DomElement.prototype.removeElement = function() {
        var parent = this.e().parentNode;
        if (parent) {
            parent.removeChild(this.e());
        }
        return this;
    };

    DomElement.prototype.setDebug = function(d) {
        this.debug = this.styleSnap.debug = this.attrSnap.debug = d;
        return this;
    };

    DomElement.prototype.domChildrenNodes = function() {
        var myId = this.id;
        return this.getLinks('node', function(n) {
            return n.meta == 'dom' && n.snaps[0].id == myId;
        });
    };

    DomElement.prototype.hasDomChildren = function() {
        for (var l = 0; l < this.links.length; ++l) {
            var link = this.links[l];
            if (link.linkType == 'node' && link.meta == 'dom' && link.snaps[0].id == this.id) {
                return true;
            }
        }
        return false;
    };

    /**
     * automatically add 'dom' to the meta property of new links
     * @param dom {DomElement
     * @returns {*}
     */
    DomElement.prototype.link = function(dom) {
        var link;
        if (arguments.length == 1) {
            link = Snap.prototype.link.call(this, dom);
            if (dom.$TYPE == DomElement.prototype.$TYPE) {
                link.meta = 'dom';
            }
            ;
            this.element.innerHTML = '';
            delete this._props.innerhtml;
            delete this._pendingChanges.innerhtml;
        } else {
            var args = _.toArray(arguments);
            link = Snap.prototype.link.apply(this, args);
        }
        return link;
    };

    /**
     * data is kept in its own snap as it has different significance in use
     *
     * @type {RegExp}
     */

    DomElement.prototype.d =
        DomElement.prototype.data = function() {
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

    DomElement.prototype._initDataSnap = function() {
        this.dataSnap = this.space.snap();
        var i, attrs, l;
        for (i = 0, attrs = this.e().attributes, l = attrs.length; i < l; i++) {
            var attr = (attrs.item(i).nodeName);
            if (dataRE.test(attr)) {
                this.d(this.a(attr));
            }
        }
    };

    DomElement.prototype.addBox = function(props) {
        var box = new Box(this, props);
        this.link('resource', box).meta = 'box';
        box.resizeBox();
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
