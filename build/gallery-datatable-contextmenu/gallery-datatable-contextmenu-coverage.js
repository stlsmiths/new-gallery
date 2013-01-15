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
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].code=["YUI.add('gallery-datatable-contextmenu', function (Y, NAME) {","","/**"," This module defines a plugin that creates up to three gallery-contextmenu-view instances on a single DataTable, each"," delegated to the contextmenu event on the THEAD, TBODY and TFOOT containers.",""," A typical use case might be as follows;","","        // Create a DT with local data ...","        var myDT = new Y.DataTable({","            data: mydata,","            columns: mycolumns","        }).render();","","        // plugin this module to give a right-click menu on the TBODY and the THEAD","        //    tdMenuChange and thMenuSelect are functions defined to respond to","        //    context menu choices (not shown ... see examples)","        myDT.plug(Y.Plugin.DataTableContextMenu,{","            // This is a contextmenu on the TD nodes ...","            tbodyMenu:{","                menuItems: [","                    {label:\"Edit\",  value:\"e\" },","                    {label:\"Update\", value:\"u\"},","                    {label:\"Delete Record\", value:\"d\"}","                ],","                after:{","                  'selectedMenuChange': tdMenuChange","                }","            },","","            // and this is a contextmenu on the header TH nodes ...","            theadMenu:{","                menuItems:  [ \"Sort A-Z\",  \"Sort Z-A\",  \"Hide\" ],","                after: {","                    'selectedMenuChange': thMenuSelect","                }","            }","        });",""," @module gallery-datatable-contextmenu"," @class Y.Plugin.DataTableContextMenu"," @since 3.8.0"," **/","function DtContextMenu() {","    DtContextMenu.superclass.constructor.apply(this, arguments);","}","","/**"," * Plugin name and event name prefix for this dt-contextmenu"," * @property NAME"," * @static"," * @type {String}"," * @default 'DtContextMenu'"," */","DtContextMenu.NAME = \"DtContextMenu\";","","","/**"," * Namespace property for this dt-contexmenu plugin, you can access this from a DT instance as"," * `mydatatable.contextmenu`"," * @property NS"," * @type {String}"," * @default 'contextmenu'"," * @static"," */","DtContextMenu.NS = \"contextmenu\";","","DtContextMenu.ATTRS = {","","    /**","     * Configuration object properties for the TBODY contextmenu-view View instance","     * @attribute tbodyMenu","     * @type Object","     * @default null","     */","    tbodyMenu : {","        value: null","","    },","","    /**","     * Configuration object properties for the THEAD contextmenu-view View instance","     * @attribute theadMenu","     * @type Object","     * @default null","     */","    theadMenu : {","        value: null","    },","","    /**","     * Configuration object properties for the TFOOT contextmenu-view View instance","     * @attribute tfootMenu","     * @type Object","     * @default null","     */","    tfootMenu : {","        value: null","    }","};","","Y.extend(DtContextMenu, Y.Plugin.Base, {","","    /**","     * Placeholder for the View instance for the theadMenu ...","     * @property theadCMenu","     * @type View","     * @default null","     * @static","     */","    theadCMenu: null,","","    /**","     * Placeholder for the View instance for the tbodyMenu ...","     * @property tbodyCMenu","     * @type View","     * @default null","     * @static","     */","    tbodyCMenu: null,","","    /**","     * Placeholder for the View instance for the tfootMenu ...","     * @property tfootCMenu","     * @type View","     * @default null","     * @static","     */","    tfootCMenu: null,","","    /**","     * @property _menuItemTemplate","     * @type String","     * @default See Code","     * @static","     * @deprecated","     */","    _menuItemTemplate:  '<div class=\"yui3-contextmenu-menuitem\" data-cmenu=\"{menuIndex}\">{menuContent}</div>',","","    /**","     * Called when this plugin is created.  If the DT has been rendered the Views will","     * be created, otherwise a listener is set to create them after DT \"renderView\" fires.","     *","     * @method initializer","     * @public","     */","    initializer: function() {","        var host = this.get('host'),","            hostCB = host.get('contentBox');","","        if(hostCB && hostCB.one('.'+host.getClassName('data'))) {","            this._buildUI();","        }","        this.afterHostEvent(\"renderView\", this._onHostRenderViewEvent);","","    },","","    /**","     * Destroys each of the View instances of the menu and nulls them out","     *","     * @method destructor","     * @public","     */","    destructor : function() {","","        if(this.theadCMenu && this.theadCMenu.destroy) {","            this.theadCMenu.destroy({remove:true});","        }","","        if(this.tbodyCMenu && this.tbodyCMenu.destroy) {","            this.tbodyCMenu.destroy({remove:true});","        }","","        if(this.tfootCMenu && this.tfootCMenu.destroy) {","            this.tfootCMenu.destroy({remove:true});","        }","","        this.theadCMenu = null;","        this.tbodyCMenu = null;","        this.tfootCMenu = null;","","    },","","    /**","     * This method constructs the three context-menu View instances for this DT if the","     * appropriate ATTRS are defined","     *","     * @method _buildUI","     * @private","     */","    _buildUI: function(){","        if(this.get('theadMenu')) {","            this._makeTheadCMenu();","        }","","        if(this.get('tbodyMenu')) {","            this._makeTbodyCMenu();","        }","","        if(this.get('tfootMenu')) {","            this._makeTfootCMenu();","        }","    },","","","    /**","     * Creates the context menu on the DT's header components, based upon the","     * ATTR \"tbodyMenu\" settings.","     *","     * @method _makeTbodyCMenu","     * @private","     */","    _makeTbodyCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('data'),","                triggerTarget: 'tr td'","            };","","        cm = this._buildCMenu(mobj,'tbodyMenu');","        if(cm) {","            this.tbodyCMenu = cm;","            this.tbodyCMenu._overlayDY = 5;","        }","    },","","    /**","     * Creates the context menu on the DT's header components, based upon the","     * ATTR \"theadMenu\" settings.","     *","     * @method _makeTheadCMenu","     * @private","     */","    _makeTheadCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('columns'),","                triggerTarget: 'tr th'","            };","","        cm = this._buildCMenu(mobj,'theadMenu');","        if(cm) {","            this.theadCMenu = cm;","            this.theadCMenu._overlayDY = 5;","        }","    },","","    /**","     * Creates the context menu on the DT's footer components, based upon the","     * ATTR \"tfootMenu\" settings.","     *","     * @method _makeTfootCMenu","     * @private","     */","    _makeTfootCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('footer'),","                triggerTarget: 'tr th'","            };","","        cm = this._buildCMenu(mobj,'theadMenu');","        if(cm) {","            this.theadCMenu = cm;","            this.theadCMenu._overlayDY = 5;","        }","    },","","","    /**","     * Helper method that takes as input the gallery-contextmenu-view configuration object,","     * the passed-in ATTR (which includes replaceable parts of the config obj) and creates","     * the View instance returning it.","     *","     * @param menuObject {Object} Configuration object for the View","     * @param menuAttr {String} Name of the ATTR to load into the config object","     * @return {Y.ContextMenuView}","     * @private","     */","    _buildCMenu: function(menuObject, menuAttr){","        var host = this.get('host'),","            dtCB = host.get('contentBox'),","            menuCfg = this.get(menuAttr),","            cmenu;","","        menuObject = Y.merge(menuObject,menuCfg);","","        menuObject.trigger = {","            node:   dtCB.one( menuObject.triggerNodeSel ),","            target: menuObject.triggerTarget","        };","        delete menuObject.triggerNodeSel;","        delete menuObject.triggerTarget;","","        cmenu = new Y.ContextMenuView(menuObject);","","        return cmenu;","","    },","","    /**","     * Helper method to hide the display of a DT contextmenu attached","     * @method hideCM","     * @param mname {String} Name of context menu property on this Plugin","     * @public","     */","    hideCM: function(mname){","        if(mname) {","            if(this[mname] && this[mname].hideOverlay) {","                this[mname].hideOverlay();","            }","        }","    },","","    /**","     * This listener fires after DT's \"renderView\" event, which means that the DT has had","     * it's UI constructed and displayed.  We use it in case the implementer plugged in this","     * module to the DT before the render call.","     *","     * @method _onHostRenderViewEvent","     * @private","     */","    _onHostRenderViewEvent: function(){","        if(!this.theadCMenu && !this.tbodyCMenu && !this.theadCMenu) {","            this._buildUI();","        }","    }","","","});","","Y.namespace(\"Plugin\").DataTableContextMenu = DtContextMenu;","","","}, '@VERSION@', {\"skinnable\": \"false\", \"requires\": [\"plugin\", \"gallery-contextmenu-view\"]});"];
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].lines = {"1":0,"44":0,"45":0,"55":0,"66":0,"68":0,"102":0,"148":0,"151":0,"152":0,"154":0,"166":0,"167":0,"170":0,"171":0,"174":0,"175":0,"178":0,"179":0,"180":0,"192":0,"193":0,"196":0,"197":0,"200":0,"201":0,"214":0,"220":0,"221":0,"222":0,"223":0,"235":0,"241":0,"242":0,"243":0,"244":0,"256":0,"262":0,"263":0,"264":0,"265":0,"281":0,"286":0,"288":0,"292":0,"293":0,"295":0,"297":0,"308":0,"309":0,"310":0,"324":0,"325":0,"332":0};
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].functions = {"DtContextMenu:44":0,"initializer:147":0,"destructor:164":0,"_buildUI:191":0,"_makeTbodyCMenu:213":0,"_makeTheadCMenu:234":0,"_makeTfootCMenu:255":0,"_buildCMenu:280":0,"hideCM:307":0,"_onHostRenderViewEvent:323":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].coveredLines = 54;
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].coveredFunctions = 11;
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 1);
YUI.add('gallery-datatable-contextmenu', function (Y, NAME) {

/**
 This module defines a plugin that creates up to three gallery-contextmenu-view instances on a single DataTable, each
 delegated to the contextmenu event on the THEAD, TBODY and TFOOT containers.

 A typical use case might be as follows;

        // Create a DT with local data ...
        var myDT = new Y.DataTable({
            data: mydata,
            columns: mycolumns
        }).render();

        // plugin this module to give a right-click menu on the TBODY and the THEAD
        //    tdMenuChange and thMenuSelect are functions defined to respond to
        //    context menu choices (not shown ... see examples)
        myDT.plug(Y.Plugin.DataTableContextMenu,{
            // This is a contextmenu on the TD nodes ...
            tbodyMenu:{
                menuItems: [
                    {label:"Edit",  value:"e" },
                    {label:"Update", value:"u"},
                    {label:"Delete Record", value:"d"}
                ],
                after:{
                  'selectedMenuChange': tdMenuChange
                }
            },

            // and this is a contextmenu on the header TH nodes ...
            theadMenu:{
                menuItems:  [ "Sort A-Z",  "Sort Z-A",  "Hide" ],
                after: {
                    'selectedMenuChange': thMenuSelect
                }
            }
        });

 @module gallery-datatable-contextmenu
 @class Y.Plugin.DataTableContextMenu
 @since 3.8.0
 **/
_yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 44);
function DtContextMenu() {
    _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "DtContextMenu", 44);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 45);
DtContextMenu.superclass.constructor.apply(this, arguments);
}

/**
 * Plugin name and event name prefix for this dt-contextmenu
 * @property NAME
 * @static
 * @type {String}
 * @default 'DtContextMenu'
 */
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 55);
DtContextMenu.NAME = "DtContextMenu";


/**
 * Namespace property for this dt-contexmenu plugin, you can access this from a DT instance as
 * `mydatatable.contextmenu`
 * @property NS
 * @type {String}
 * @default 'contextmenu'
 * @static
 */
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 66);
DtContextMenu.NS = "contextmenu";

_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 68);
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

_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 102);
Y.extend(DtContextMenu, Y.Plugin.Base, {

    /**
     * Placeholder for the View instance for the theadMenu ...
     * @property theadCMenu
     * @type View
     * @default null
     * @static
     */
    theadCMenu: null,

    /**
     * Placeholder for the View instance for the tbodyMenu ...
     * @property tbodyCMenu
     * @type View
     * @default null
     * @static
     */
    tbodyCMenu: null,

    /**
     * Placeholder for the View instance for the tfootMenu ...
     * @property tfootCMenu
     * @type View
     * @default null
     * @static
     */
    tfootCMenu: null,

    /**
     * @property _menuItemTemplate
     * @type String
     * @default See Code
     * @static
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "initializer", 147);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 148);
var host = this.get('host'),
            hostCB = host.get('contentBox');

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 151);
if(hostCB && hostCB.one('.'+host.getClassName('data'))) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 152);
this._buildUI();
        }
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 154);
this.afterHostEvent("renderView", this._onHostRenderViewEvent);

    },

    /**
     * Destroys each of the View instances of the menu and nulls them out
     *
     * @method destructor
     * @public
     */
    destructor : function() {

        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "destructor", 164);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 166);
if(this.theadCMenu && this.theadCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 167);
this.theadCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 170);
if(this.tbodyCMenu && this.tbodyCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 171);
this.tbodyCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 174);
if(this.tfootCMenu && this.tfootCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 175);
this.tfootCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 178);
this.theadCMenu = null;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 179);
this.tbodyCMenu = null;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 180);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_buildUI", 191);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 192);
if(this.get('theadMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 193);
this._makeTheadCMenu();
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 196);
if(this.get('tbodyMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 197);
this._makeTbodyCMenu();
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 200);
if(this.get('tfootMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 201);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTbodyCMenu", 213);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 214);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('data'),
                triggerTarget: 'tr td'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 220);
cm = this._buildCMenu(mobj,'tbodyMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 221);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 222);
this.tbodyCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 223);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTheadCMenu", 234);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 235);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('columns'),
                triggerTarget: 'tr th'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 241);
cm = this._buildCMenu(mobj,'theadMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 242);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 243);
this.theadCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 244);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTfootCMenu", 255);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 256);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('footer'),
                triggerTarget: 'tr th'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 262);
cm = this._buildCMenu(mobj,'theadMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 263);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 264);
this.theadCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 265);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_buildCMenu", 280);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 281);
var host = this.get('host'),
            dtCB = host.get('contentBox'),
            menuCfg = this.get(menuAttr),
            cmenu;

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 286);
menuObject = Y.merge(menuObject,menuCfg);

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 288);
menuObject.trigger = {
            node:   dtCB.one( menuObject.triggerNodeSel ),
            target: menuObject.triggerTarget
        };
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 292);
delete menuObject.triggerNodeSel;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 293);
delete menuObject.triggerTarget;

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 295);
cmenu = new Y.ContextMenuView(menuObject);

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 297);
return cmenu;

    },

    /**
     * Helper method to hide the display of a DT contextmenu attached
     * @method hideCM
     * @param mname {String} Name of context menu property on this Plugin
     * @public
     */
    hideCM: function(mname){
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "hideCM", 307);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 308);
if(mname) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 309);
if(this[mname] && this[mname].hideOverlay) {
                _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 310);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_onHostRenderViewEvent", 323);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 324);
if(!this.theadCMenu && !this.tbodyCMenu && !this.theadCMenu) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 325);
this._buildUI();
        }
    }


});

_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 332);
Y.namespace("Plugin").DataTableContextMenu = DtContextMenu;


}, '@VERSION@', {"skinnable": "false", "requires": ["plugin", "gallery-contextmenu-view"]});
