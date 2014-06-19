Space.prototype.bd = function (ele, parent) {
    var dom = SNAPS.domElement(this, this.snaps.length, ele, parent);
    this.snaps.push(dom);
    return dom;
};

/**
 * note -- this is a factory, not a constructor
 * @param space {Space}
 * @param i {int} the id in the snaps registry
 * @param e {element} (optional) the element class to be used
 * @param p {DomElement} (optional) the parent to this domElement
 * @returns {DomElement}
 */
SNAPS.domElement = function (space, i, e, p) {
    return new DomElement(space, i, e, p);
};

Space.prototype.bdDispatch = function () {
    var args = _.toArray(arguments);
    var message = args.shift();

    for (var s = 0; s < this.snaps.length; ++s) {
        var snap = this.snaps[s];
        if (snap.$TYPE == 'DOM') {
            if (!snap.hasDomParents()) {
                snap.domBroadcast(message, args);
            }
        }

    }
};

/**
 * DomElement is a child class of Snap. It manages a browser Element.
 * Note that most of the properties that relate to the element are managed by
 * two child resources, the attrSnap and styleSnap.
 *
 * Because these two snaps are resources they do not automatically inherit any values from
 * the DomElement; if you want them to you will have to link listeners in the DomElement
 * to its styleSnap/attrSnap properties yourself.
 *
 * Parenting is a bit complex for DomElements. Parenting in DOM actually affects visual features
 * of the Element; however, parenting of DomElements create inheritance behaviors in the local
 * properties of the DomElement.
 *
 * There are many times that one or the other sort of relationships are desirable (or both).
 * Because of this there is two ways to create parent/child relationships between DomElements
 * and / or their child element properties (accessed by the e() method).
 *
 * 1) linking both DomElements AND their elements is created by passing a parent to the DomElement
 *    at the time of creation.
 *
 * 2) linking JUST elements is created by passing a parent to the elementToDom method of the child.
 *
 * --------------- DomElement's element
 *
 * the DomElement does not necessarily have a DomElement. You can if you want pass it an existing
 * element as a constructor parameter; if this is not done the DomElement won't actually have any
 * element until an action that requires an element to be present in which case, one is made.
 *
 * 1) any time you set an attribute or a style value, an element will be made.
 * 2) if you add a parent to the DomElement, either during construction or via elementToDom, an element
 *    will be made in the update cycle.
 * 3) if you manually call e(), innerHTML, s(), or a() (which are examples of 1) and 2) above)
 *    an element will be made.
 *
 * --------------- Setting Element properties
 *
 * The methods attr(prop, value) and style(attr, value) add pending changes to the attrSnap and styleSnap
 * properties of a DomElement. This is the preferred way to manage an element's properties.
 *
 * You can directly set properties of an element (immediately) by calling a(prop, value) and s(prop, value).
 * However this is not desirable as it doesn't sync these properties whih attrSnap and styleSnap
 * which means you won't be able to introspect these properties via attr(prop) or style(prop).
 *
 * ............... property units
 *
 * If you want to set a property to a percent value you will have to enter a property string as in
 *
 * myDom.style('left', '50%').
 *
 * If you don't enter a unit, px will be assigned to any numeric property listed in _pxProps.
 * these include left, height, right, top, bottom, width,  min-*, max-*, and others.
 *
 * This means you can blend those style properties by assigning them numeric values as described below
 * and the value set in the Element will have the unit 'px' suffixed onto it.
 *
 * ............... Blending Element Properties
 *
 * To blend a property you call myDom.styleSnap.blend('left', 10, easeFn). As described above the units
 * that are output will be in pixels.
 *
 * --------------- Attaching DomElements to the Document
 *
 * just creating a DomElement instance does NOT place it in the browser's DOM tree. You must call
 * elementToDom to accomplish this. Until this is done, the DomElement will not be visible or part of the
 * DOM tree.
 *
 * The elementToDom method does one of two things:
 *
 * 1) if it has no parameter it attaches its element to the space's document (which should be set
 * to the pages' document.)
 * 2) if a parent is passed to elementToDom there are one of two possibilities:
 *    a) the parent is a browser Element in which case the caller's element is appended to that parent.
 *    b) the parent is a DomElement in which case the caller's element is appended to
 *       the parent's element. However the DomElements are not themselves linked.
 *
 * -------------- innerHTML
 *
 * There is two ways to put content inside elements:
 *
 * 1) actually parent DomElements to each other using elementToDom
 * 2) call innerHTML to put markup in hte DomElement's Element.
 *
 * You have to pick one - there is no real way to preserve nested DomElements AND allow you to
 * add custom markup to the innerHTML of an element; therefore calling innerHTML on any DomElement
 * that has domChildren will throw an error.
 *
 * @param space  {Space} the registry this DomElement belongs to; see Snap.prototype
 * @param id     {int} the id of this Snap within the Space; see Snap.prototype
 * @param ele    [optional {Element} a native Element
 * @param parent {DomElement | Element} if present, then the element of this DomElement
 *               will be made a child of the parents' DomElement
 *               AND this DomElement will be made a child of the parent.
 * @constructor
 */
var DomElement = function (space, id, ele, parent) {
    Snap.call(this, space, id, {});

    this.styleSnap = space.snap();
    this.link('resource', this.styleSnap).meta = 'style';
    // although this is referenced as a direct property we add it to the links to enable cascading delete
    this.styleSnap.listen('updateProperties', _styleSnapChanges, this);

    this.attrSnap = space.snap();
    this.link('resource', this.attrSnap).meta = 'attr';
    // although this is referenced as a direct property we add it to the links to enable cascading delete
    this.attrSnap.listen('updateProperties', _attrSnapChanges, this);

    this.propChangeTerminal.listen('innerhtml', function (newContent) {
        this.h(newContent);
    }, this);
    this._element = ele;
    if (parent) {
        if (parent.$TYPE == DomElement.prototype.$TYPE) {
            parent.e().appendChild(this.e());
            parent.link(this);
        } else {
            parent.appendChild(this.e());
        }
    }

    this.listen('element', function (element) {
        if (element && element.$TYPE == DomElement.prototype.$TYPE) {

        }
        var addElement = this.get('addElement');
        if (addElement) {
            if (addElement === true) {
                this.elementToDom();
            } else {
                var parent = addElement.$TYPE == DomElement.prototype.$TYPE ? addElement.e() : addElement;
                this.elementToDom(parent);
            }
        }
    }, this);
    this.propChangeTerminal.listen('innerhtml', this.h, this)
};

DomElement.prototype = Object.create(Snap.prototype);
DomElement.prototype.$TYPE = 'DOM';
SNAPS.typeAliases.SNAP.push(DomElement.prototype.$TYPE);

DomElement.prototype.domNodeName = function () {
    return this.has('tag') ? this.get('tag') : 'div';
};

DomElement.prototype.contains = function (x, y) {
    var rect = this.e().getBoundingClientRect();

    return !(x < rect.left || x > rect.right || y < rect.top || y > rect.bottom);

};

DomElement.prototype.attr = function (prop, value) {
    if (typeof(prop) == 'object') {
        for (var p in prop) {
            this.attrSnap.set(p, prop[p]);
        }
    } else {
        if (arguments.length < 2) {
            return this.attrSnap.get(prop);
        }
        this.attrSnap.set(prop, value)
    }
    return this;
};

DomElement.prototype.innerHTML = function (content) {
    if (this.hasDomChildren()) {
        throw new Error('innerHTML: cannot add content to a browserDom snap with domChildren');
    }
    this.set('innerhtml', content);
    return this;
};

DomElement.prototype.destroy = function () {
    if (this._element) {
        this.removeElement();
    }
    Snap.prototype.destroy.call(this);
};

/**
 * Adds a domElement's element to the page.
 *
 * If EITHER a DomElement node is passed in (either a native dom element or a SNAPS DomElement)
 * then this domElement is added to the body.
 *
 * Note - the relationship between DomElements and page elements probably should,
 * but does not have to, be kept parallel; however passing a parent to elementToDom
 * will not make this node a child of that DomElement -- it will just enforce parent child
 * relationships between their elements.
 *
 * @param parent
 * @returns {DomElement}
 */
DomElement.prototype.elementToDom = function (parent) {
    if (!parent) {
        var parents = this.domParents();
        if (parents.length) {
            parent = parents[0];
        } else {
            parent = this.space.document.body;
        }
    }

    if (parent.$TYPE == DomElement.prototype.$TYPE) {
        parent = parent.e();
    }
    parent.appendChild(this.e());
    return this;
};

DomElement.prototype.parent = function () {
    if (this.space.document) {
        return this.space.document;
    } else if (this._element) {
        return this._element.document;
    } else {
        return null;
    }
};

DomElement.prototype.document = function () {
    var document = this.space.document;
    if (document) {
        return document;
    }
    return this.e() ? this.e().document : null;
};

DomElement.prototype.removeElement = function () {
    var parent = this.e().parentNode;
    if (parent) {
        parent.removeChild(this.e());
    }
    return this;
};

DomElement.prototype.setDebug = function (d) {
    this.debug = this.styleSnap.debug = this.attrSnap.debug = d;
    return this;
};

/**
 * automatically add 'dom' to the meta property of new links
 * @param dom {DomElement}
 * @returns {*}
 */
DomElement.prototype.link = function (dom) {
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

DomElement.prototype.bd = function () {
    return this.space.bd(null, this);
};

/**
 * data is kept in its own snap as it has different significance in use
 *
 * @type {RegExp}
 */

DomElement.prototype.d =
    DomElement.prototype.data = function () {
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

DomElement.prototype._initDataSnap = function () {
    this.dataSnap = this.space.snap();
    var i, attrs, l;
    for (i = 0, attrs = this.e().attributes, l = attrs.length; i < l; i++) {
        var attr = (attrs.item(i).nodeName);
        if (dataRE.test(attr)) {
            this.d(this.a(attr));
        }
    }
};

/**
 * iteratively recursing through the DomElement tree, sending the message/data to the terminals of each DomElement
 * @param message
 * @param data
 *
 * note - this method is a derecursed tree walk == could use some unit testing to validate integrity
 */
Snap.prototype.domBroadcast = function (message, data) {
    var snaps = [this];

    while (snaps.length) {
        var snap = snaps.shift(snaps);
        snap.terminal.dispatch(message, data);
        if (snap.hasDomChildren()) {
            snaps.unshift.apply(snaps, snap.domChildren());
        }
    }
};

Space.prototype.domBroadcast = function (message, data) {

    for (var s = 0; s < this.snaps.length; ++s) {
        var snap = this.snaps[s];

        if (snap.$TYPE == DomElement.prototype.$TYPE && !snap.hasDomParent()) {
            snap.domBroadcast(message, data);
        }
    }

};
