/**
 * BrowserDom is an element bridge between a DOM element
 * and properties of a snap instance.
 *
 * @param space {SNAPS.Space}
 * @param props {Object}
 * @constructor
 */

SNAPS.BrowserDom = function (space, props) {
    this.space = space;
    this.attrSnap = space.snap();

    var rel = this.attrSnap.rel('style', space.snap());
    this.styleSnap = rel.toSnap();

    this.tagName = props.tagName || 'div';
    delete props.tagName;

    this.element = this.e = props.element || document.createElement(this.tagName);
    this.initOutput();
    delete props.watchedProps;

    if (props.addElement) {
        if (props.addElement === true) {
            this.addElement();
        } else {
            var parent = props.addElement.$TYPE == SNAPS.BrowserDom.prototype.$TYPE ? props.addElement.element : props.addElement;
            this.addElement(parent);
        }
        delete props.addElement;
    }

    for (var p in props) {
        if (this.changeWatchers[p]) {
            this.attrSnap.set(p, props[p]);
        } else {
            this.styleSnap.set(p, props[p]);
        }
    }
};

SNAPS.BrowserDom.prototype.$TYPE = 'BROWSERDOM';

 function _styleSnapChanges(eleSnap) {
    for (var p in eleSnap.lastChanges) {
        var value = eleSnap.lastChanges[p].pending;

        if (value == SNAPS.DELETE) {
            this.element.style.removeProperty(p);
        } else {
            this.s(p, value);
        }
    }
}

 function _attrSnapChanges(attrSnap){
    for (var p in attrSnap.lastChanges) {
        var value = attrSnap.lastChanges[p].pending;

        if (value == SNAPS.DELETE) {
            this.element.removeAttribute(p);
        } else {
            this.a(p, value);
        }
    }
}

SNAPS.BrowserDom.prototype.initOutput = function () {

    this.attrSnap.addOutput(_attrSnapChanges.bind(this));
    this.styleSnap.addOutput(_styleSnapChanges.bind(this));
};

SNAPS.BrowserDom.prototype.addElement = function (parent) {
    if (!parent) {
        parent = document.body;
    }
    parent.appendChild(this.element);
};

SNAPS.BrowserDom.prototype.h = SNAPS.BrowserDom.prototype.html = function (value) {

    if (arguments.length > 0) {
        this.element.innerHTML = value;
        return this;
    } else {
        return this.element.innerHTML;
    }
};

SNAPS.BrowserDom.prototype.a = SNAPS.BrowserDom.prototype.attr = function (prop, value) {

    if (arguments.length > 1) {
        this.element.setAttribute(prop, value);
        return this;
    } else {
        return this.element.getAttribute(prop);
    }
};

SNAPS.BrowserDom.prototype.s = SNAPS.BrowserDom.prototype.style = function (prop, value) {

    if (arguments.length > 1) {
        this.element.style[prop] = value;
        return this;
    } else {
        return this.element.style[prop];
    }
};

SNAPS.removeElement = function () {
    if (this.element.parent) {
        this.element.parent.removeChild(this.element);
    }
};

SNAPS.BrowserDom.prototype.set = function (prop, value) {
    this.attrSnap.set(prop, value);
};

SNAPS.BrowserDom.prototype.merge = function (prop, value, c) {
    this.attrSnap.merge(prop, value, c);
};

SNAPS.BrowserDom.prototype.setStyle = function (prop, value) {
    this.styleSnap.set(prop, value);
};