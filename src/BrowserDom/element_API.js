/**
 *
 * Setting Element properties
 *
 * The methods attr(prop, value), innerHTML(content) and style(attr, value)
 * add pending changes to the attrSnap and styleSnap properties of a DomElement.
 * This is the preferred way to manage an element's properties.
 *
 * You can directly, immediately set properties of an element by calling
 * a(prop, value), bd.h(p, v), and s(prop, value).
 * However this is not desirable as this sidesteps the style and attr registry of the DomElement's resources.
 * which means you won't be able to introspect these properties via attr(prop) or style(prop).
 */

/* ******************** CONSTANTS ********************* */

/**
 * these values are all known attrs;
 * however there are some attrs that are also elements and those attrs
 * (and for whom it is more common for them to be elements than attributes)
 * are listed in _styleOverrides.
 */

var attrNames = 'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,data,datetime,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,for,form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,manifest,max,maxlength,media,method,min,multiple,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,pubdate,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,seamless,selected,shape,size,sizes,span,spellcheck,src,srcdoc,srclang,start,step,style,summary,tabindex,target,title,type,usemap,value,width,wrap'
var _attrs = _.reduce(attrNames.split(','), function (out, p) {
    out[p] = true;
    return out
}, {});

var dataRE = /^data-/i;

var _styleOverrides = {
    color: true,
    width: true,
    height: true
};

var _htmlRE = /html|content/i;

/**
 * these are properties for which if numbers are provide a 'px' should be suffixed
 */
var _pxProps = _.reduce('border-bottom-width,border-left-width,border-radius,border-right-width,border-top-width,border-width,bottom,column-rule-width,column-width,columns,height,left,letter-spacing,line-height,margin,margin-bottom,margin-left,margin-right,margin-top,max-height,max-width,min-height,min-width,nav-down,nav-index,nav-left,nav-right,nav-up,outline-width,overflow-x,overflow-y,padding,padding-bottom,padding-left,padding-right,padding-top,right,tab-size,text-indent,text-justify,top,width'.split(','),
    function (out, p) {
        out[p] = true;
        return out;
    }, {});

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

/**
 * returns this DomElement's element node; creates it if it does not already exist.
 * Also can set the element node if passed in as a parameter.
 * @type {e}
 */
DomElement.prototype.element = DomElement.prototype.e = function (element) {
    if (element) {
        /**
         *    will assign the parameter as an element. will NOT parent that element
         *    to this element's domParent -- must be done manually.
         */

        this._element = element;

        this.dispatch('element', this._element);

    } else if (!this._element) {
        if (typeof (document) == 'undefined') {
            if (this.space.document) {
                this._element = this.space.document.createElement(this.domNodeName());
            } else {
                throw new Error('No global document or space.document found');
            }
        } else {
            this._element = document.createElement(this.domNodeName());
        }
        this.dispatch('element', this._element);
    }
    return this._element;
};

/**
 * Queues style changes to be applied in the next update cycle.
 * @param prop {string | Object} -- can be the name of a single property, or a hash of prop/value pairs
 * @param value {variant} -- the value of the prop; OR the value of immediate if prop is an Object.
 * @param immediate {bool} -- see Snap.set; forces an immediate change to the styleSnap's properties.
 * @returns {*}
 */
DomElement.prototype.style = function (prop, value, immediate) {
    if (typeof(prop) == 'object') {
        immediate = !!value;
        for (var p in prop) {
            this.styleSnap.set(p, prop[p], immediate);
        }
    } else if (arguments.length < 2) {
        return this.styleSnap.get(prop);
    } else {
        this.styleSnap.set(prop, value, immediate);
        if (this.space.isUpdating()) {
            this.s(prop, value);
        }
    }
    return this;
};

/**
 * Directly sets the inner content of the DomElement's element node; for internal use only.
 * the innerHTML method is preferred for external use.
 * @type {html}
 */
DomElement.prototype.h = DomElement.prototype.html = function (innerhtml) {
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

/**
 * Directly sets an attribute of a DomElement's Node; for internal use only.
 * the attr method is the preferred way of setting and managing Node properties.
 *
 * @param prop
 * @param value
 * @returns {*}
 */
DomElement.prototype.a = function (prop, value) {
    if (dataRE.test(prop)) {
        var args = _.toArray(arguments);
        return this.d.apply(this, args);
    }
    if (arguments.length > 1) {
        this.e().setAttribute(prop, value);
        return this;
    } else if (typeof prop == 'object') {
        for (var p in prop) {
            this.e().setAttribute(p, prop[p]);
        }
    } else {
        return this.e().getAttribute(prop);
    }
};

/**
 * Directly write to the DomElement's element(Node) style; for internal use only.
 * the attr method is the preferred way of setting and managing Node properties.
 *
 * parameters can be:
 *  -- prop (returns element Node's current value)
 *
 *  all other parameter configurations change the element Node's style:
 *  -- prop, value
 *  -- prop, value, unit
 *  -- config object (prop/value pairs)
 *  -- config, unit
 *
 */
DomElement.prototype.s = function () {

    var args = _.toArray(arguments);
    var prop = args[0];
    var value;
    if (_.isArray(prop)) {
        value = prop[1];
        prop = prop[0];
    }
    if (typeof(prop) == 'object') {

        // this recursive call allows for a config object with subsequent arguments.
        _.each(prop, function (value, prop) {
            if (typeof(value) == 'number' && _pxProps[prop.toLowerCase()]) {
                var unit = 'px';
                value = Math.round(value) + unit;
            }
            this.e().style[prop] = value;
        }, this);
        return this;
    } else if (args.length > 1) {
        value = args[1];

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

/**
 * the public method for changing element (Node) attributes.
 *
 * @param prop {string | Object} -- can be the name of a single property, or a hash of prop/value pairs
 * @param value {variant} -- the value of the prop; OR the value of immediate if prop is an Object.
 * @param immediate {bool} -- see Snap.set; forces an immediate change to the styleSnap's properties.

 * @returns {*}
 */
DomElement.prototype.attr = function (prop, value, immediate) {
    if (typeof(prop) == 'object') {
        immediate = !!value;
        for (var p in prop) {
            this.attrSnap.set(p, prop[p], immediate);
        }
    } else {
        if (arguments.length < 2) {
            return this.attrSnap.get(prop);
        }
        this.attrSnap.set(prop, value, immediate)
    }
    return this;
};

/**
 *
 * There is two ways to put content inside elements:
 *
 * 1) actually parent DomElements to each other using elementToDom
 * 2) call innerHTML to put markup in hte DomElement's Element.
 *
 * ONLY DO ONE OF THESE to any given DomElement.
 *
 * There is no real way to preserve nested DomElements AND allow you to add custom markup to the innerHTML
 * of an element; therefore calling innerHTML on any DomElement that has domChildren will throw an error.
 *
 * @param space  {Space} the registry this DomElement belongs to; see Snap.prototype
 * @param parent {DomElement | Element} if present, then the element of this DomElement
 *               will be made a child of the parents' DomElement
 *               AND this DomElement will be made a child of the parent's element.
 * @constructor
 */
DomElement.prototype.innerHTML = function (content) {
    if (this.hasDomChildren()) {
        throw new Error('innerHTML: cannot add content to a browserDom snap with domChildren');
    }
    this.set('innerhtml', content);
    return this;
};