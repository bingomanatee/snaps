Space.prototype.bd = function (parent) {
    var dom = SNAPS.domElement(this, this.snaps.length, parent);
    this.snaps.push(dom);
    return dom;
};

/**
 * note -- this is a factory, not a constructor
 * @param space {Space}
 * @param p {DomElement} (optional) the parent to this domElement
 * @returns {DomElement}
 */
SNAPS.domElement = function (space, p) {
    return new DomElement(space, p);
};

/**
 * broadcast a message through all the dom tree.
 * Start with the root bd elements.
 */
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
 *
 * DomElement is a child class of Snap. It manages a browser Element.
 * Note that most of the properties that relate to the element are managed by
 * two child resources, the attrSnap and styleSnap.
 *
 * Because the style and attr snaps are resources they do not automatically inherit any values from
 * the DomElement; if you want them to you will have to link listeners in the DomElement
 * to its styleSnap/attrSnap properties yourself.
 *
 * A WORD ON VOCABULARY
 *
 * DomElement is a Snaps artifact. Browser Element or Node is a browser construct, that bridges the
 * visible page with javascript -- it is not part of the Snaps codebase; Nodes are created by Snaps
 * to affect the page's appearance.
 *
 * --------------- Parenting
 *
 * Parenting is a bit complex for DomElements.
 *
 * You can link a DomElement to a parent node -- but this doesn't affect the Browser DOM parenting
 * of their elements (Nodes).
 *
 * You can call bd.elementToDom(bd2) which DOES create a parent child relationship between their Nodes
 * but does not link the two DomElements in Snaps.
 *
 * If you pass one DomElement as a contructor parameter to another, BOTH the Nodes and the DomElements
 * are linked as parent and child.
 *
 * This can be achieved after creation by linking two DomElements
 * and then using elementToDom to link their elements (Nodes).
 *
 * --------------- DomElement's element (Node)
 *
 * the DomElement does not necessarily have an element. Elements are only created when they are absolutely
 * required in order to create an opportunity to shim in an alias, and to let you create data representations
 * that represent a larger set of data without burdening the DOM with their presence until they are visible.
 *
 * DomElement's elements will be instantiated when:
 *
 * 1) any time you set an attribute or a style value DIRECTLY (via bd.a(..), bd.h(), or bd.e(...) ),
 *    an element will be made.
 * 2) if you add a parent to the DomElement via elementToDom(), an element  will be made.
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
 * bd.elementToDom() on a domElement or its parent DomElement to insert a DomElement's element into the document
 * and make it visible. Until this is done, the DomElement will not be visible or part of the DOM tree.
 *
 * The elementToDom method does one of two things:
 *
 * 1) if it has no parameter it attaches its element to the space's document
 *    (which should be set to the pages' document.) or the global document object.
 *    This is somewhat random, and not desirable usually.
 * 2) if a parent is passed to elementToDom there are one of two possibilities:
 *    a) the parent is a browser Element in which case the caller's element is appended to that parent.
 *    b) the parent is a DomElement in which case the caller's element is appended to
 *       the parent's element. However the DomElements are not themselves linked.
 */

var DomElement = function (space, parent) {
    Snap.call(this, space, {});

    this.styleSnap = space.snap();
    this.link('resource', this.styleSnap, 'style');
    this.styleSnap.listen('updateProperties', _styleSnapChanges, this);

    this.attrSnap = space.snap();
    this.link('resource', this.attrSnap, 'attr');
    this.attrSnap.listen('updateProperties', _attrSnapChanges, this);

    this.propChangeTerminal.listen('innerhtml', function (newContent) {
        this.h(newContent);
    }, this);

    if (parent) {
        if (parent.$TYPE == DomElement.prototype.$TYPE) {
            /**
             *  if a DomElement is passed as a parent, link it as a child
             *  AND link its element as a child of this snap's element
             */

            parent.link(this);
        }
        this.elementToDom(parent);
    }
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

DomElement.prototype.destroy = function () {
    if (this._element) {
        this.removeElementFromDom();
    }
    Snap.prototype.destroy.call(this);
};

/**
 * Adds a domElement's element to the page.
 *
 * This method ONLY affects the browser's element's relationships; it doesn't affect the snaps
 * linkage.
 *
 * @param domParent {DomElement | Node}
 * @returns {DomElement}
 */
DomElement.prototype.elementToDom = function (domParent) {
    if (this.hasDomParent()) {
        throw new Error('attempting to add an element to dom that has a parent snap');
    }

    var element = this.e();

    if (element.parentNode) {
        throw new Error('attempt to add an element to the dom that has a domParent');
    }

    if (domParent.$TYPE == DomElement.prototype.$TYPE){
        domParent = domParent.e();
    }

    domParent.appendChild(element);
    return this;
};

DomElement.prototype.document = function () {
    if (typeof document != 'undefined') {
        return document;
    } else if (this.space.document) {
        return this.space.document;
    }
    return this.e().document; // last desperate hope....
};

DomElement.prototype.removeElementFromDom = function () {
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
