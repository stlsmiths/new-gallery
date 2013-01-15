if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js",
    code: []
};
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].code=["YUI.add('gallery-datatable-contextmenu', function (Y, NAME) {","","/**"," This module defines a plugin that creates up to three gallery-contextmenu-view instances on a single DataTable, each"," delegated to the contextmenu event on the THEAD, TBODY and TFOOT containers.",""," @module gallery-datatable-contextmenu"," @class Y.Plugin.DataTableContextMenu"," @since 3.8.0"," **/","function DtContextMenu() {","    DtContextMenu.superclass.constructor.apply(this, arguments);","}","","/**"," * Plugin name and event name prefix for this dt-contextmenu"," * @property NAME"," * @static"," * @type {String}"," * @default 'DtContextMenu'"," */","DtContextMenu.NAME = \"DtContextMenu\";","","","/**"," * Namespace property for this dt-contexmenu plugin, you can access this from a DT instance as"," * `mydatatable.contextmenu`"," * @property NS"," * @type {String}"," * @default 'contextmenu'"," * @static"," */","DtContextMenu.NS = \"contextmenu\";","","DtContextMenu.ATTRS = {","","    /**","     * Configuration object properties for the TBODY contextmenu-view View instance","     * @attribute tbodyMenu","     * @type Object","     * @default null","     */","    tbodyMenu : {","        value: null","","    },","","    /**","     * Configuration object properties for the THEAD contextmenu-view View instance","     * @attribute theadMenu","     * @type Object","     * @default null","     */","    theadMenu : {","        value: null","    },","","    /**","     * Configuration object properties for the TFOOT contextmenu-view View instance","     * @attribute tfootMenu","     * @type Object","     * @default null","     */","    tfootMenu : {","        value: null","    }","};","","Y.extend(DtContextMenu, Y.Plugin.Base, {","","    /**","     * Placeholder for the View instance for the theadMenu ...","     * @property theadCMenu","     * @type View","     * @default null","     */","    theadCMenu: null,","","    /**","     * Placeholder for the View instance for the tbodyMenu ...","     * @property tbodyCMenu","     * @type View","     * @default null","     */","    tbodyCMenu: null,","","    /**","     * Placeholder for the View instance for the tfootMenu ...","     * @property tfootCMenu","     * @type View","     * @default null","     */","    tfootCMenu: null,","","    /**","     * @property _menuItemTemplate","     * @type String","     * @default See Code","     * @deprecated","     */","    _menuItemTemplate:  '<div class=\"yui3-contextmenu-menuitem\" data-cmenu=\"{menuIndex}\">{menuContent}</div>',","","    /**","     * Called when this plugin is created.  If the DT has been rendered the Views will","     * be created, otherwise a listener is set to create them after DT \"renderView\" fires.","     *","     * @method initializer","     * @public","     */","    initializer: function() {","        var host = this.get('host'),","            hostCB = host.get('contentBox');","","        if(hostCB && hostCB.one('.'+host.getClassName('data'))) {","            this._buildUI();","        }","        this.afterHostEvent(\"renderView\", this._onHostRenderViewEvent);","","    },","","    /**","     * Destroys each of the View instances of the menu and nulls them out","     *","     * @method destructor","     * @public","     */","    destructor : function() {","","        if(this.theadCMenu && this.theadCMenu.destroy) {","            this.theadCMenu.destroy({remove:true});","        }","","        if(this.tbodyCMenu && this.tbodyCMenu.destroy) {","            this.tbodyCMenu.destroy({remove:true});","        }","","        if(this.tfootCMenu && this.tfootCMenu.destroy) {","            this.tfootCMenu.destroy({remove:true});","        }","","        this.theadCMenu = null;","        this.tbodyCMenu = null;","        this.tfootCMenu = null;","","    },","","    /**","     * This method constructs the three context-menu View instances for this DT if the","     * appropriate ATTRS are defined","     *","     * @method _buildUI","     * @private","     */","    _buildUI: function(){","        if(this.get('theadMenu')) {","            this._makeTheadCMenu();","        }","","        if(this.get('tbodyMenu')) {","            this._makeTbodyCMenu();","        }","","        if(this.get('tfootMenu')) {","            this._makeTfootCMenu();","        }","    },","","","    /**","     * Creates the context menu on the DT's header components, based upon the","     * ATTR \"tbodyMenu\" settings.","     *","     * @method _makeTbodyCMenu","     * @private","     */","    _makeTbodyCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('data'),","                triggerTarget: 'tr td'","            };","","        cm = this._buildCMenu(mobj,'tbodyMenu');","        if(cm) {","            this.tbodyCMenu = cm;","            this.tbodyCMenu._overlayDY = 5;","        }","    },","","    /**","     * Creates the context menu on the DT's header components, based upon the","     * ATTR \"theadMenu\" settings.","     *","     * @method _makeTheadCMenu","     * @private","     */","    _makeTheadCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('columns'),","                triggerTarget: 'tr th'","            };","","        cm = this._buildCMenu(mobj,'theadMenu');","        if(cm) {","            this.theadCMenu = cm;","            this.theadCMenu._overlayDY = 5;","        }","    },","","    /**","     * Creates the context menu on the DT's footer components, based upon the","     * ATTR \"tfootMenu\" settings.","     *","     * @method _makeTfootCMenu","     * @private","     */","    _makeTfootCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('footer'),","                triggerTarget: 'tr th'","            };","","        cm = this._buildCMenu(mobj,'theadMenu');","        if(cm) {","            this.theadCMenu = cm;","            this.theadCMenu._overlayDY = 5;","        }","    },","","","    /**","     * Helper method that takes as input the gallery-contextmenu-view configuration object,","     * the passed-in ATTR (which includes replaceable parts of the config obj) and creates","     * the View instance returning it.","     *","     * @param menuObject {Object} Configuration object for the View","     * @param menuAttr {String} Name of the ATTR to load into the config object","     * @return {Y.ContextMenuView}","     * @private","     */","    _buildCMenu: function(menuObject, menuAttr){","        var host = this.get('host'),","            dtCB = host.get('contentBox'),","            menuCfg = this.get(menuAttr),","            cmenu;","","        menuObject = Y.merge(menuObject,menuCfg);","","        menuObject.trigger = {","            node:   dtCB.one( menuObject.triggerNodeSel ),","            target: menuObject.triggerTarget","        };","        delete menuObject.triggerNodeSel;","        delete menuObject.triggerTarget;","","        cmenu = new Y.ContextMenuView(menuObject);","","        return cmenu;","","    },","","    /**","     * Helper method to hide the display of a DT contextmenu attached","     * @method hideCM","     * @param mname {String} Name of context menu property on this Plugin","     * @public","     */","    hideCM: function(mname){","        if(mname) {","            if(this[mname] && this[mname].hideOverlay) {","                this[mname].hideOverlay();","            }","        }","    },","","    /**","     * This listener fires after DT's \"renderView\" event, which means that the DT has had","     * it's UI constructed and displayed.  We use it in case the implementer plugged in this","     * module to the DT before the render call.","     *","     * @method _onHostRenderViewEvent","     * @private","     */","    _onHostRenderViewEvent: function(){","        if(!this.theadCMenu && !this.tbodyCMenu && !this.theadCMenu) {","            this._buildUI();","        }","    }","","","});","","Y.namespace(\"Plugin\").DataTableContextMenu = DtContextMenu;","","","}, '@VERSION@', {","    \"supersedes\": [","        \"\"","    ],","    \"skinnable\": false,","    \"requires\": [","        \"plugin\",","        \"gallery-contextmenu-view\"","    ],","    \"optional\": [","        \"\"","    ]","});"];
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].lines = {"1":0,"11":0,"12":0,"22":0,"33":0,"35":0,"69":0,"111":0,"114":0,"115":0,"117":0,"129":0,"130":0,"133":0,"134":0,"137":0,"138":0,"141":0,"142":0,"143":0,"155":0,"156":0,"159":0,"160":0,"163":0,"164":0,"177":0,"183":0,"184":0,"185":0,"186":0,"198":0,"204":0,"205":0,"206":0,"207":0,"219":0,"225":0,"226":0,"227":0,"228":0,"244":0,"249":0,"251":0,"255":0,"256":0,"258":0,"260":0,"271":0,"272":0,"273":0,"287":0,"288":0,"295":0};
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].functions = {"DtContextMenu:11":0,"initializer:110":0,"destructor:127":0,"_buildUI:154":0,"_makeTbodyCMenu:176":0,"_makeTheadCMenu:197":0,"_makeTfootCMenu:218":0,"_buildCMenu:243":0,"hideCM:270":0,"_onHostRenderViewEvent:286":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].coveredLines = 54;
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].coveredFunctions = 11;
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 1);
YUI.add('gallery-datatable-contextmenu', function (Y, NAME) {

/**
 This module defines a plugin that creates up to three gallery-contextmenu-view instances on a single DataTable, each
 delegated to the contextmenu event on the THEAD, TBODY and TFOOT containers.

 @module gallery-datatable-contextmenu
 @class Y.Plugin.DataTableContextMenu
 @since 3.8.0
 **/
_yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 11);
function DtContextMenu() {
    _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "DtContextMenu", 11);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 12);
DtContextMenu.superclass.constructor.apply(this, arguments);
}

/**
 * Plugin name and event name prefix for this dt-contextmenu
 * @property NAME
 * @static
 * @type {String}
 * @default 'DtContextMenu'
 */
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 22);
DtContextMenu.NAME = "DtContextMenu";


/**
 * Namespace property for this dt-contexmenu plugin, you can access this from a DT instance as
 * `mydatatable.contextmenu`
 * @property NS
 * @type {String}
 * @default 'contextmenu'
 * @static
 */
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 33);
DtContextMenu.NS = "contextmenu";

_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 35);
DtContextMenu.ATTRS = {

    /**
     * Configuration object properties for the TBODY contextmenu-view View instance
     * @attribute tbodyMenu
     * @type Object
     * @default null
     */
    tbodyMenu : {
        value: null

    },

    /**
     * Configuration object properties for the THEAD contextmenu-view View instance
     * @attribute theadMenu
     * @type Object
     * @default null
     */
    theadMenu : {
        value: null
    },

    /**
     * Configuration object properties for the TFOOT contextmenu-view View instance
     * @attribute tfootMenu
     * @type Object
     * @default null
     */
    tfootMenu : {
        value: null
    }
};

_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 69);
Y.extend(DtContextMenu, Y.Plugin.Base, {

    /**
     * Placeholder for the View instance for the theadMenu ...
     * @property theadCMenu
     * @type View
     * @default null
     */
    theadCMenu: null,

    /**
     * Placeholder for the View instance for the tbodyMenu ...
     * @property tbodyCMenu
     * @type View
     * @default null
     */
    tbodyCMenu: null,

    /**
     * Placeholder for the View instance for the tfootMenu ...
     * @property tfootCMenu
     * @type View
     * @default null
     */
    tfootCMenu: null,

    /**
     * @property _menuItemTemplate
     * @type String
     * @default See Code
     * @deprecated
     */
    _menuItemTemplate:  '<div class="yui3-contextmenu-menuitem" data-cmenu="{menuIndex}">{menuContent}</div>',

    /**
     * Called when this plugin is created.  If the DT has been rendered the Views will
     * be created, otherwise a listener is set to create them after DT "renderView" fires.
     *
     * @method initializer
     * @public
     */
    initializer: function() {
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "initializer", 110);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 111);
var host = this.get('host'),
            hostCB = host.get('contentBox');

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 114);
if(hostCB && hostCB.one('.'+host.getClassName('data'))) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 115);
this._buildUI();
        }
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 117);
this.afterHostEvent("renderView", this._onHostRenderViewEvent);

    },

    /**
     * Destroys each of the View instances of the menu and nulls them out
     *
     * @method destructor
     * @public
     */
    destructor : function() {

        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "destructor", 127);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 129);
if(this.theadCMenu && this.theadCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 130);
this.theadCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 133);
if(this.tbodyCMenu && this.tbodyCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 134);
this.tbodyCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 137);
if(this.tfootCMenu && this.tfootCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 138);
this.tfootCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 141);
this.theadCMenu = null;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 142);
this.tbodyCMenu = null;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 143);
this.tfootCMenu = null;

    },

    /**
     * This method constructs the three context-menu View instances for this DT if the
     * appropriate ATTRS are defined
     *
     * @method _buildUI
     * @private
     */
    _buildUI: function(){
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_buildUI", 154);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 155);
if(this.get('theadMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 156);
this._makeTheadCMenu();
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 159);
if(this.get('tbodyMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 160);
this._makeTbodyCMenu();
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 163);
if(this.get('tfootMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 164);
this._makeTfootCMenu();
        }
    },


    /**
     * Creates the context menu on the DT's header components, based upon the
     * ATTR "tbodyMenu" settings.
     *
     * @method _makeTbodyCMenu
     * @private
     */
    _makeTbodyCMenu: function() {
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTbodyCMenu", 176);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 177);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('data'),
                triggerTarget: 'tr td'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 183);
cm = this._buildCMenu(mobj,'tbodyMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 184);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 185);
this.tbodyCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 186);
this.tbodyCMenu._overlayDY = 5;
        }
    },

    /**
     * Creates the context menu on the DT's header components, based upon the
     * ATTR "theadMenu" settings.
     *
     * @method _makeTheadCMenu
     * @private
     */
    _makeTheadCMenu: function() {
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTheadCMenu", 197);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 198);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('columns'),
                triggerTarget: 'tr th'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 204);
cm = this._buildCMenu(mobj,'theadMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 205);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 206);
this.theadCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 207);
this.theadCMenu._overlayDY = 5;
        }
    },

    /**
     * Creates the context menu on the DT's footer components, based upon the
     * ATTR "tfootMenu" settings.
     *
     * @method _makeTfootCMenu
     * @private
     */
    _makeTfootCMenu: function() {
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTfootCMenu", 218);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 219);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('footer'),
                triggerTarget: 'tr th'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 225);
cm = this._buildCMenu(mobj,'theadMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 226);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 227);
this.theadCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 228);
this.theadCMenu._overlayDY = 5;
        }
    },


    /**
     * Helper method that takes as input the gallery-contextmenu-view configuration object,
     * the passed-in ATTR (which includes replaceable parts of the config obj) and creates
     * the View instance returning it.
     *
     * @param menuObject {Object} Configuration object for the View
     * @param menuAttr {String} Name of the ATTR to load into the config object
     * @return {Y.ContextMenuView}
     * @private
     */
    _buildCMenu: function(menuObject, menuAttr){
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_buildCMenu", 243);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 244);
var host = this.get('host'),
            dtCB = host.get('contentBox'),
            menuCfg = this.get(menuAttr),
            cmenu;

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 249);
menuObject = Y.merge(menuObject,menuCfg);

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 251);
menuObject.trigger = {
            node:   dtCB.one( menuObject.triggerNodeSel ),
            target: menuObject.triggerTarget
        };
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 255);
delete menuObject.triggerNodeSel;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 256);
delete menuObject.triggerTarget;

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 258);
cmenu = new Y.ContextMenuView(menuObject);

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 260);
return cmenu;

    },

    /**
     * Helper method to hide the display of a DT contextmenu attached
     * @method hideCM
     * @param mname {String} Name of context menu property on this Plugin
     * @public
     */
    hideCM: function(mname){
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "hideCM", 270);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 271);
if(mname) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 272);
if(this[mname] && this[mname].hideOverlay) {
                _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 273);
this[mname].hideOverlay();
            }
        }
    },

    /**
     * This listener fires after DT's "renderView" event, which means that the DT has had
     * it's UI constructed and displayed.  We use it in case the implementer plugged in this
     * module to the DT before the render call.
     *
     * @method _onHostRenderViewEvent
     * @private
     */
    _onHostRenderViewEvent: function(){
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_onHostRenderViewEvent", 286);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 287);
if(!this.theadCMenu && !this.tbodyCMenu && !this.theadCMenu) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 288);
this._buildUI();
        }
    }


});

_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 295);
Y.namespace("Plugin").DataTableContextMenu = DtContextMenu;


}, '@VERSION@', {
    "supersedes": [
        ""
    ],
    "skinnable": false,
    "requires": [
        "plugin",
        "gallery-contextmenu-view"
    ],
    "optional": [
        ""
    ]
});
