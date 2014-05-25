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
    this.snap = space.snap();

    var rel = this.snap.rel('style', space.snap());
    this.styleSnap = rel.toSnap();

    this.tagName = props.tagName || 'div';
    delete props.tagName;

    this.element = this.e = props.element || document.createElement(this.tagName);
    this.changeWatchers = {};
    this.initOutput();

    this.initWatchers(props.watchedProps || ['classes', 'content', 'id', 'name']);
    delete props.watchedProps;

    if (props.addElement === true) {
        this.addElement();
        delete props.addElement;
    } else if (props.addElement) {
        var parent = SNAPS.assert.$TYPE(props.addElement, 'BROWSERDOM', function () {
            return props.addElement;
        });
        this.addElement(parent);
        delete props.addElement;
    }

    for (var p in props) {
        if (this.changeWatchers[p]) {
            this.snap.set(p, props[p]);
        } else {
            this.styleSnap.set(p, props[p]);
        }
    }
};

SNAPS.BrowserDom.prototype.$TYPE = 'BROWSERDOM';

SNAPS.BrowserDom.prototype.stylesChanged = function (eleSnap) {

    for (var p in eleSnap.lastChanges) {
        var value = eleSnap.lastChanges[p].pending;

        if (value == SNAPS.DELETE) {
            this.element.style.removeProperty(p);
        } else {
            this.s(p, value);
        }
    }
};

SNAPS.BrowserDom.prototype.initOutput = function () {

    this.snap.addOutput(this.changed.bind(this));
    this.styleSnap.addOutput(this.stylesChanged.bind(this));
};

SNAPS.BrowserDom.prototype.addElement = function (parent) {
    if (!parent) {
        parent = document.body;
    }
    parent.appendChild(this.element);
};

function DomChangeClass(classes) {
    if (_.isArray(classes)) {
        classes = classes.join(' ');
    }
    this.e.className = classes;
}

function DomChangeId(id) {
    this.a('id', id);
}

function DomChangeName(id) {
    this.a('name', id);
}

function DomChangeContent(html) {
    this.h(html);
}

SNAPS.BrowserDom.prototype.initWatchers = function (watchers) {

    for (var i = 0; i < watchers.length; ++i) {
        var w = watchers[i].toLowerCase();

        switch (w) {

            case 'classes':
                this.changeWatchers.classes = DomChangeClass.bind(this);
                break;

            case 'id':
                this.changeWatchers.id = DomChangeId.bind(this);
                break;

            case 'content':
                this.changeWatchers.content = DomChangeContent.bind(this);
                break;

            case 'name':
                this.changeWatchers.name = DomChangeName.bind(this);
                break;

            default:
                throw 'Unknown Watcher ' + w;
        }
    }
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

/**
 *
 * @param changes {Object}
 */
SNAPS.BrowserDom.prototype.changed = function (snap, space, time) {

    var changes = snap.lastChanges;
    if (!changes){
        return;
    }
    for (var p in changes) {
        if (this.changeWatchers.hasOwnProperty(p)) {
            var value = changes[p].pending;
            var old = changes[p].old
            var watcher = this.changeWatchers[p];
            watcher(value, old);
        } else {
            this.setStyle(p, changes[p].pending);
        }
    }
};

SNAPS.BrowserDom.prototype.set = function (prop, value) {
    this.snap.set(prop, value);
};

SNAPS.BrowserDom.prototype.merge = function (prop, value, c) {
    this.snap.merge(prop, value, c);
};

SNAPS.BrowserDom.prototype.setStyle = function (prop, value) {
    this.styleSnap.set(prop, value);
};