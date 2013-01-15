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
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].code=["YUI.add('gallery-datatable-contextmenu', function (Y, NAME) {","","/**"," This module defines a plugin that creates up to three gallery-contextmenu-view instances on a single DataTable, each"," delegated to the contextmenu event on the THEAD, TBODY and TFOOT containers.",""," A typical use case might be as follows;","","        // Create a DT with local data ...","        var myDT = new Y.DataTable({","            data: mydata,","            columns: mycolumns","        }).render();","","        // plugin this module to give a right-click menu on the TBODY and the THEAD","        //    tdMenuChange and thMenuSelect are functions defined to respond to","        //    context menu choices (not shown ... see examples)","        myDT.plug(Y.Plugin.DataTableContextMenu,{","            // This is a contextmenu on the TD nodes ...","            tbodyMenu:{","                menuItems: [","                    {label:\"Edit\",  value:\"e\" },","                    {label:\"Update\", value:\"u\"},","                    {label:\"Delete Record\", value:\"d\"}","                ],","                after:{","                  'selectedMenuChange': tdMenuChange","                }","            },","","            // and this is a contextmenu on the header TH nodes ...","            theadMenu:{","                menuItems:  [ \"Sort A-Z\",  \"Sort Z-A\",  \"Hide\" ],","                after: {","                    'selectedMenuChange': thMenuSelect","                }","            }","        });",""," @module gallery-datatable-contextmenu"," @class Y.Plugin.DataTableContextMenu"," @since 3.8.0"," **/","function DtContextMenu() {","    DtContextMenu.superclass.constructor.apply(this, arguments);","}","","/**"," * Plugin name and event name prefix for this dt-contextmenu"," * @property NAME"," * @static"," * @type {String}"," * @default 'DtContextMenu'"," */","DtContextMenu.NAME = \"DtContextMenu\";","","","/**"," * Namespace property for this dt-contexmenu plugin, you can access this from a DT instance as"," * `mydatatable.contextmenu`"," * @property NS"," * @type {String}"," * @default 'contextmenu'"," * @static"," */","DtContextMenu.NS = \"contextmenu\";","","DtContextMenu.ATTRS = {","","    /**","     * Configuration object properties for the TBODY contextmenu-view View instance","     * @attribute tbodyMenu","     * @type Object","     * @default null","     */","    tbodyMenu : {","        value: null","","    },","","    /**","     * Configuration object properties for the THEAD contextmenu-view View instance","     * @attribute theadMenu","     * @type Object","     * @default null","     */","    theadMenu : {","        value: null","    },","","    /**","     * Configuration object properties for the TFOOT contextmenu-view View instance","     * @attribute tfootMenu","     * @type Object","     * @default null","     */","    tfootMenu : {","        value: null","    }","};","","Y.extend(DtContextMenu, Y.Plugin.Base, {","","    /**","     * Placeholder for the View instance for the theadMenu ...","     * @property theadCMenu","     * @type View","     * @default null","     */","    theadCMenu: null,","","    /**","     * Placeholder for the View instance for the tbodyMenu ...","     * @property tbodyCMenu","     * @type View","     * @default null","     */","    tbodyCMenu: null,","","    /**","     * Placeholder for the View instance for the tfootMenu ...","     * @property tfootCMenu","     * @type View","     * @default null","     */","    tfootCMenu: null,","","    /**","     * @property _menuItemTemplate","     * @type String","     * @default See Code","     * @deprecated","     */","    _menuItemTemplate:  '<div class=\"yui3-contextmenu-menuitem\" data-cmenu=\"{menuIndex}\">{menuContent}</div>',","","    /**","     * Called when this plugin is created.  If the DT has been rendered the Views will","     * be created, otherwise a listener is set to create them after DT \"renderView\" fires.","     *","     * @method initializer","     * @public","     */","    initializer: function() {","        var host = this.get('host'),","            hostCB = host.get('contentBox');","","        if(hostCB && hostCB.one('.'+host.getClassName('data'))) {","            this._buildUI();","        }","        this.afterHostEvent(\"renderView\", this._onHostRenderViewEvent);","","    },","","    /**","     * Destroys each of the View instances of the menu and nulls them out","     *","     * @method destructor","     * @public","     */","    destructor : function() {","","        if(this.theadCMenu && this.theadCMenu.destroy) {","            this.theadCMenu.destroy({remove:true});","        }","","        if(this.tbodyCMenu && this.tbodyCMenu.destroy) {","            this.tbodyCMenu.destroy({remove:true});","        }","","        if(this.tfootCMenu && this.tfootCMenu.destroy) {","            this.tfootCMenu.destroy({remove:true});","        }","","        this.theadCMenu = null;","        this.tbodyCMenu = null;","        this.tfootCMenu = null;","","    },","","    /**","     * This method constructs the three context-menu View instances for this DT if the","     * appropriate ATTRS are defined","     *","     * @method _buildUI","     * @private","     */","    _buildUI: function(){","        if(this.get('theadMenu')) {","            this._makeTheadCMenu();","        }","","        if(this.get('tbodyMenu')) {","            this._makeTbodyCMenu();","        }","","        if(this.get('tfootMenu')) {","            this._makeTfootCMenu();","        }","    },","","","    /**","     * Creates the context menu on the DT's header components, based upon the","     * ATTR \"tbodyMenu\" settings.","     *","     * @method _makeTbodyCMenu","     * @private","     */","    _makeTbodyCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('data'),","                triggerTarget: 'tr td'","            };","","        cm = this._buildCMenu(mobj,'tbodyMenu');","        if(cm) {","            this.tbodyCMenu = cm;","            this.tbodyCMenu._overlayDY = 5;","        }","    },","","    /**","     * Creates the context menu on the DT's header components, based upon the","     * ATTR \"theadMenu\" settings.","     *","     * @method _makeTheadCMenu","     * @private","     */","    _makeTheadCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('columns'),","                triggerTarget: 'tr th'","            };","","        cm = this._buildCMenu(mobj,'theadMenu');","        if(cm) {","            this.theadCMenu = cm;","            this.theadCMenu._overlayDY = 5;","        }","    },","","    /**","     * Creates the context menu on the DT's footer components, based upon the","     * ATTR \"tfootMenu\" settings.","     *","     * @method _makeTfootCMenu","     * @private","     */","    _makeTfootCMenu: function() {","        var cm,","            mobj = {","                triggerNodeSel: '.'+this.get('host').getClassName('footer'),","                triggerTarget: 'tr th'","            };","","        cm = this._buildCMenu(mobj,'theadMenu');","        if(cm) {","            this.theadCMenu = cm;","            this.theadCMenu._overlayDY = 5;","        }","    },","","","    /**","     * Helper method that takes as input the gallery-contextmenu-view configuration object,","     * the passed-in ATTR (which includes replaceable parts of the config obj) and creates","     * the View instance returning it.","     *","     * @param menuObject {Object} Configuration object for the View","     * @param menuAttr {String} Name of the ATTR to load into the config object","     * @return {Y.ContextMenuView}","     * @private","     */","    _buildCMenu: function(menuObject, menuAttr){","        var host = this.get('host'),","            dtCB = host.get('contentBox'),","            menuCfg = this.get(menuAttr),","            cmenu;","","        menuObject = Y.merge(menuObject,menuCfg);","","        menuObject.trigger = {","            node:   dtCB.one( menuObject.triggerNodeSel ),","            target: menuObject.triggerTarget","        };","        delete menuObject.triggerNodeSel;","        delete menuObject.triggerTarget;","","        cmenu = new Y.ContextMenuView(menuObject);","","        return cmenu;","","    },","","    /**","     * Helper method to hide the display of a DT contextmenu attached","     * @method hideCM","     * @param mname {String} Name of context menu property on this Plugin","     * @public","     */","    hideCM: function(mname){","        if(mname) {","            if(this[mname] && this[mname].hideOverlay) {","                this[mname].hideOverlay();","            }","        }","    },","","    /**","     * This listener fires after DT's \"renderView\" event, which means that the DT has had","     * it's UI constructed and displayed.  We use it in case the implementer plugged in this","     * module to the DT before the render call.","     *","     * @method _onHostRenderViewEvent","     * @private","     */","    _onHostRenderViewEvent: function(){","        if(!this.theadCMenu && !this.tbodyCMenu && !this.theadCMenu) {","            this._buildUI();","        }","    }","","","});","","Y.namespace(\"Plugin\").DataTableContextMenu = DtContextMenu;","","","}, '@VERSION@', {\"skinnable\": false, \"requires\": [\"plugin\", \"gallery-contextmenu-view\"]});"];
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].lines = {"1":0,"44":0,"45":0,"55":0,"66":0,"68":0,"102":0,"144":0,"147":0,"148":0,"150":0,"162":0,"163":0,"166":0,"167":0,"170":0,"171":0,"174":0,"175":0,"176":0,"188":0,"189":0,"192":0,"193":0,"196":0,"197":0,"210":0,"216":0,"217":0,"218":0,"219":0,"231":0,"237":0,"238":0,"239":0,"240":0,"252":0,"258":0,"259":0,"260":0,"261":0,"277":0,"282":0,"284":0,"288":0,"289":0,"291":0,"293":0,"304":0,"305":0,"306":0,"320":0,"321":0,"328":0};
_yuitest_coverage["build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js"].functions = {"DtContextMenu:44":0,"initializer:143":0,"destructor:160":0,"_buildUI:187":0,"_makeTbodyCMenu:209":0,"_makeTheadCMenu:230":0,"_makeTfootCMenu:251":0,"_buildCMenu:276":0,"hideCM:303":0,"_onHostRenderViewEvent:319":0,"(anonymous 1):1":0};
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "initializer", 143);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 144);
var host = this.get('host'),
            hostCB = host.get('contentBox');

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 147);
if(hostCB && hostCB.one('.'+host.getClassName('data'))) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 148);
this._buildUI();
        }
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 150);
this.afterHostEvent("renderView", this._onHostRenderViewEvent);

    },

    /**
     * Destroys each of the View instances of the menu and nulls them out
     *
     * @method destructor
     * @public
     */
    destructor : function() {

        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "destructor", 160);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 162);
if(this.theadCMenu && this.theadCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 163);
this.theadCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 166);
if(this.tbodyCMenu && this.tbodyCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 167);
this.tbodyCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 170);
if(this.tfootCMenu && this.tfootCMenu.destroy) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 171);
this.tfootCMenu.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 174);
this.theadCMenu = null;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 175);
this.tbodyCMenu = null;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 176);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_buildUI", 187);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 188);
if(this.get('theadMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 189);
this._makeTheadCMenu();
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 192);
if(this.get('tbodyMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 193);
this._makeTbodyCMenu();
        }

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 196);
if(this.get('tfootMenu')) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 197);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTbodyCMenu", 209);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 210);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('data'),
                triggerTarget: 'tr td'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 216);
cm = this._buildCMenu(mobj,'tbodyMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 217);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 218);
this.tbodyCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 219);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTheadCMenu", 230);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 231);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('columns'),
                triggerTarget: 'tr th'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 237);
cm = this._buildCMenu(mobj,'theadMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 238);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 239);
this.theadCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 240);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_makeTfootCMenu", 251);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 252);
var cm,
            mobj = {
                triggerNodeSel: '.'+this.get('host').getClassName('footer'),
                triggerTarget: 'tr th'
            };

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 258);
cm = this._buildCMenu(mobj,'theadMenu');
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 259);
if(cm) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 260);
this.theadCMenu = cm;
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 261);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_buildCMenu", 276);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 277);
var host = this.get('host'),
            dtCB = host.get('contentBox'),
            menuCfg = this.get(menuAttr),
            cmenu;

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 282);
menuObject = Y.merge(menuObject,menuCfg);

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 284);
menuObject.trigger = {
            node:   dtCB.one( menuObject.triggerNodeSel ),
            target: menuObject.triggerTarget
        };
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 288);
delete menuObject.triggerNodeSel;
        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 289);
delete menuObject.triggerTarget;

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 291);
cmenu = new Y.ContextMenuView(menuObject);

        _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 293);
return cmenu;

    },

    /**
     * Helper method to hide the display of a DT contextmenu attached
     * @method hideCM
     * @param mname {String} Name of context menu property on this Plugin
     * @public
     */
    hideCM: function(mname){
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "hideCM", 303);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 304);
if(mname) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 305);
if(this[mname] && this[mname].hideOverlay) {
                _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 306);
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
        _yuitest_coverfunc("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", "_onHostRenderViewEvent", 319);
_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 320);
if(!this.theadCMenu && !this.tbodyCMenu && !this.theadCMenu) {
            _yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 321);
this._buildUI();
        }
    }


});

_yuitest_coverline("build/gallery-datatable-contextmenu/gallery-datatable-contextmenu.js", 328);
Y.namespace("Plugin").DataTableContextMenu = DtContextMenu;


}, '@VERSION@', {"skinnable": false, "requires": ["plugin", "gallery-contextmenu-view"]});
