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
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-datatable-editable/gallery-datatable-editable.js",
    code: []
};
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].code=["YUI.add('gallery-datatable-editable', function (Y, NAME) {","","/**"," A DataTable class extension that configures a DT for \"editing\", current deployment supports cell editing"," (and planned near-term support for row editing).",""," This module is essentially a base wrapper-class to setup DT for editing with the appropriate attributes and"," listener creation / detachment.  The real guts of \"datatable-editing\" is in the View class definitions, within"," the gallery-datatable-celleditor-inline and gallery-datatable-celleditor-inline modules (and possibly future"," editor View class modules).",""," #### Functionality",""," The module is basically intended to keep track of the editing state (via [editable](#attr_editable) attribute) and"," housekeeping functions with regard to managing editor View instance creation, rendering and destruction.",""," By design this module attempts to group common editor View instances wherever possible.  So for a DT with 14 columns"," all set with \"inline\" View classes only 1 View instance is created."," <br/>Likewise if a DT uses 4 different \"calendar\" editor View types but each one as slightly different \"editorConfig\","," then this module creates 4 different calendar View instances to handle the different configurations.",""," Listeners are set for the \"cellEditorSave\" event and saved to the active \"data\" setting within this module.",""," Additional capability is provided for cell editing situations to add CSS classes to TD's which are added to \"editable\""," columns (e.g. cursor) to indicate they are \"clickable\".",""," This module works sortable, scrollable (y-scrolling currently) to make changes to the client-side of the DT model"," (remote updates should be provided via ModelList sync or user-defined listeners.)","",""," #### Attributes",""," Presently three attributes are provided;"," [editable](#attr_editable), [editOpenType](#attr_editOpenType) and [defaultEditor](#attr_defaultEditor).",""," The primary ATTR is the [editable](#attr_editable), which is used to toggle on/off the editing state of the DT"," instance.",""," The [defaultEditor](#attr_defaultEditor) attribute is used to setup a cell editor View instance to be used on all editable columns"," that don't already have an editor assigned.",""," ##### Column Properties",""," In addition to a few new attributes the module also recognizes some new column properties in order to support"," cell-editing in particular;"," <table>"," <tr><th>editable</th><td>{Boolean}</td><td>Flag to indicate if column is editable (set `editable:false` to exclude an"," individual column)</td></tr>"," <tr><th>editor</th><td>{String}</td><td>Name of the defined Y.DataTable.EditorOptions View configuration for this column.</td></tr>"," <tr><th>editorConfig</th><td>{Object}</td><td>Passed to the View editor class when instantiated, and Y.merge'ed in to become View class"," attributes.</td></tr>"," </table>",""," When this module is loaded and the \"editable:true\" attribute is set, it attempts to economize on the \"instantiation cost\""," of creating View instances by identifying only editor Views that are required based upon column definitions and/or the"," defaultEditor attribute. (e.g. if all columns are \"text\" editors, only one \"text\" editor View is instantiated)",""," ##### ... More Info",""," The module fires the event [cellEditorSave](#event_cellEditorSave), which can be listened for to provide updating"," of remote data back to a server (assuming a ModelList \"sync\" layer is NOT used).  Haven't provided the equivalent to"," YUI 2.x's \"asyncSubmitter\" because I think this event could easily be listened to in order to provide follow-on"," updating to remote data stores.",""," A new class Object (Y.DataTable.EditorOptions) is added to the DataTable namespace that serves as the"," datastore of the editor View configuration properties.  Each \"key\" (object property) within this object"," is an entrypoint to a specific editor configuration, which are defined in the separate View class extensions (presently"," gallery-datatable-celleditor-inline and gallery-datatable-celleditor-popup. Please see those for specifics.)",""," ###### KNOWN ISSUES:","   <ul>","   <li>Works minimally with \"y\" scrolling, \"x\" scrolling still needs work.</li>","   <li>Initial editor invocation is limited to \"mouse\" actions on TD only (although keyboard navigation cell-to-cell is available).</li>","   </ul>",""," ###### FUTURE:"," This module will be amended to add support for \"row\" editing, if required.",""," @module gallery-datatable-editable"," @class Y.DataTable.Editable"," @extends Y.DataTable"," @author Todd Smith"," @since 3.8.0"," **/","DtEditable = function(){};","","// Define new attributes to support editing","DtEditable.ATTRS = {","","    /**","     * A boolean flag that sets the DataTable state to allow editing (either inline or popup cell editing).","     * (May support row editing in future also)","     *","     * @attribute editable","     * @type boolean","     * @default false","     */","    editable: {","        value:      false,","        validator:  Y.Lang.isBoolean","    },","","    /**","     * Defines the cell editing event type on the TD that initiates the editor, used to","     * specify the listener that invokes an editor.","     *","     * Note: IMHO The only sensible options are 'click' or 'dblclick'","     *","     * @attribute editOpenType","     * @type {String|Null}","     * @default 'dblclick'","     */","    editOpenType: {","        value:      'dblclick',","        validator:  function(v){ return Y.Lang.isString(v) || v===null; }","    },","","    /**","     * Specifies a default editor name to respond to an editing event defined in [_editOpenType](#attr_editOpenType)","     * attribute.  The default editor is used if the DataTable is in editing mode (i.e. \"editable:true\") and if","     * the column DOES NOT include a property editable:false in its definitions.","     *","     * Cell editors are typically assigned by setting a column property (i.e. editor:'text' or 'date') on each","     * individual column.","     *","     * This attribute can be used to set a single editor to work on every column without having to define it on each","     * column.","     *","     * @attribute defaultEditor","     * @type {String|Null}","     * @default null","     */","    defaultEditor : {","        value:      null,","        validator:  function(v){ return Y.Lang.isString(v) || v === null; }","    }","};","","// Add static props and public/private methods to be added to DataTable","Y.mix( DtEditable.prototype, {","","// -------------------------- Placeholder Private Properties  -----------------------------","","    /**","     Holds the View instance of the active cell editor currently displayed","     @property _openEditor","     @type Y.View","     @default null","     @private","     @static","     **/","    _openEditor:        null,","","    /**","     Holds the current record (i.e. a Model class) of the TD being edited","     (Note: this may not always work, better to use \"clientId\" of the record, i.e. sorting, etc..)","     @property _openRecord","     @type Model","     @default null","     @private","     @static","     **/","    _openRecord:        null,","","    /**","     Holds the column key (or name) of the TD cell being edited","     @property _openColKey","     @type String","     @default null","     @private","     @static","     **/","    _openColKey:        null,","","    /**","     Holds the TD Node currently being edited","     @property _openTd","     @type Node","     @default null","     @private","     @static","     **/","    _openTd:            null,","","    /**","     Holds the cell data for the actively edited TD, a complex object including the","     following;  {td, value, recClientId, colKey}","     @property _openCell","     @type Object","     @default null","     @private","     @static","     **/","    _openCell:          null,","","// -------------------------- Subscriber handles  -----------------------------","","    /**","     Placeholder for the DT level event listener for \"editableChange\" attribute.","     @property _subscrEditable","     @type EventHandle","     @default null","     @private","     @static","     **/","    _subscrEditable:     null,","","    /**","     Placeholder for the DT event listener to begin editing a cell (based on editOpenType ATTR)","     @property _subscrEditOpen","     @type EventHandle","     @default null","     @private","     @static","     **/","    _subscrEditOpen: null,","","    /**","     Placeholder Array for TD editor invocation event handles (i.e. click or dblclick) that","     are set on the TBODY to initiate cellEditing.","     @property _subscrCellEditors","     @type Array of EventHandles","     @default null","     @private","     @static","     **/","    _subscrCellEditors:    null,","","    /**","     Placeholder for event handles for scrollable DT that listens to \"scroll\" events and repositions editor","     (we need two listeners, one for each of X or Y scroller)","     @property _subscrCellEditorScrolls","     @type Array of EventHandles","     @default null","     @private","     @static","     **/","    _subscrCellEditorScrolls: null,","","    /**","     Shortcut to the CSS class that is added to indicate a column is editable","     @property _classColEditable","     @type String","     @default 'yui3-datatable-col-editable'","     @private","     @static","     **/","    _classColEditable:  null,","","    /**","     Placeholder hash that stores the \"common\" editors, i.e. standard editor names that occur","     within Y.DataTable.EditorOptions and are used in this DT.","","     This object holds the View instances, keyed by the editor \"name\" for quick hash reference.","     The object is populated in method [_buildColumnEditors](#method__buildColumnEditors).","","     @property _commonEditors","     @type Object","     @default null","     @private","     @static","     **/","    _commonEditors:  null,","","    /**","     Placeholder hash that stores cell editors keyed by column key (or column name) where the value","     for the associated key is either a (a) {String} which references an editor name in the [_commonEditors](#property__commonEditors)","     hash or (b) {View} instance for a customized editor View instance (typically one with specified \"editorConfig\" in the","     column definition).","","     The object is populated in method [_buildColumnEditors](#method__buildColumnEditors).","","     @property _columnEditors","     @type Object","     @default null","     @private","     @static","     **/","    _columnEditors: null,","","    // future","    //_editableType:      null,   //  'cell', 'row', 'inline?'","","//==========================  LIFECYCLE METHODS  =============================","","    /**","     * Initializer that sets up listeners for \"editable\" state and sets some CSS names","     * @method initializer","     * @protected","     */","    initializer: function(){","","        this._classColEditable = this.getClassName('col','editable');","","        // Hacky, but works ...","        if(this.get('editable')) {","            this._onEditableChange(true);","        }","","        this.after('editableChange',this._onEditableChange);","","        this._bindEditable();","","        return this;","    },","","    /**","     * Cleans up ALL of the DT listeners and the editor View instances and generated private props","     * @method destructor","     * @protected","     */","    destructor:function() {","        // detach the \"editableChange\" listener on the DT","        this.set('editable',false);","        this._unbindEditable();","    },","","//==========================  PUBLIC METHODS  =============================","","    /**","     * Opens the given TD eventfacade or Node with it's assigned cell editor.","     *","     * @method openCellEditor","     * @param e {EventFacade|Node} Passed in object from an event OR a TD Node istance","     * @public","     */","    openCellEditor: function(e) {","        var td       = e.currentTarget || e,","            col      = this.getColumnByTd(td),","            colKey   = col.key || col.name,","            editorRef = (colKey) ? this._columnEditors[colKey] : null,","            editorInstance = (editorRef && Y.Lang.isString(editorRef) ) ? this._commonEditors[editorRef] : editorRef;","","        if(!td) {","            return;","        }","","        // First time in,","        if( (this._yScroll || this._xScroll) && !this._subscrCellEditorScroll) {","            this._bindEditorScroll();","        }","","        //","        // Bailout if column is null, has editable:false or no editor assigned ...","        //","        if(col && col.editable === false && !editorInstance) {","            return;","        }","","        // Hide any editor that may currently be open ... unless it is the currently visible one","        if(this._openEditor) {","            if ( this._openEditor === editorInstance ) {","                this._openEditor.hideEditor();","            } else {","                this.hideCellEditor();","            }","        }","","        //","        //  If the editorInstance exists, populate it and show it","        //","        //TODO:  fix this to rebuild new editors if user changes a column definition on the fly","        //","        if(editorInstance) {","","            //","            //  Set private props to the open TD we are editing, the editor instance, record and column name","            //","            this._openTd     = td;                      // store the TD","            this._openEditor = editorInstance;          // placeholder to the open Editor View instance","            this._openRecord = this.getRecord(td);      // placeholder to the editing Record","            this._openColKey = colKey;                  // the column key (or name)","","            this._openCell   = {","                td:             td,","                value:          this._openRecord.get(colKey),","                recClientId:    this._openRecord.get('clientId'),","                colKey:         colKey","            };","","            // Define listeners onto this open editor ...","            //this._bindOpenEditor( this._openEditor );","","            //","            //  Set the editor Attributes and render it ... (display it!)","            //","            this._openEditor.setAttrs({","       //         hostDT: this,","                cell:   this._openCell,","                value:  this._openRecord.get(colKey)","            });","","            this._openEditor.showEditor(td);","","        }","","    },","","","    /**","     * Cleans up a currently open cell editor View and unbinds any listeners that this DT had","     * set on the View.","     * @method hideCellEditor","     * @public","     */","    hideCellEditor: function(){","        if(this._openEditor) {","            this._openEditor.hideEditor();","            this._unsetEditor();","        }","    },","","    /**","     * Utility method that scans through all editor instances and hides them","     * @method hideAllCellEditors","     * @private","     */","    hideAllCellEditors: function(){","        this.hideCellEditor();","        var ces = this._getAllCellEditors();","        Y.Array.each( ces, function(editor){","            if(editor && editor.hideEditor) {","                editor.hideEditor();","            }","        });","    },","","    /**","     * Over-rideable method that can be used to do other user bindings ?","     *   (like hideEditor on mouseout, etc...)","     * @method bindEditorListeners","     * @public","     */","    bindEditorListeners: function(){","        return;","    },","","    /**","     * Returns all cell editor View instances for the editable columns of the current DT instance","     * @method getCellEditors","     * @return editors {Array} Array containing an Object as {columnKey, cellEditor, cellEditorName}","     */","    getCellEditors: function(){","        var rtn = [], ed;","        Y.Object.each(this._columnEditors,function(v,k){","            ed = (Y.Lang.isString(v)) ? this._commonEditors[v] : v;","            rtn.push({","                columnKey:      k,","                cellEditor:     ed,","                cellEditorName: ed.get('name')","            });","        },this);","        return rtn;","    },","","    /**","     * Utility method to return the cell editor View instance associated with a particular column of the","     * Datatable.","     *","     * Returns null if the given column is not editable.","     *","     * @method getCellEditor","     * @param col {Object|String|Integer} Column identifier, either the Column object, column key or column index","     * @returns {View} Cell editor instance, or null if no editor for given column","     * @public","     */","    getCellEditor: function(col) {","        var ce = this._columnEditors,","            column = (col && typeof col !== \"object\") ? this.getColumn(col) : null,","            colKey = (column) ? column.key || column.name : null,","            rtn = null;","","        if(colKey && ce[colKey]) {","            if(Y.Lang.isString(ce[colKey])) {","                // ce[colKey] is a common editor name, like \"textarea\", etc..","                rtn = this._commonEditors[ ce[colKey] ];","            } else {","                rtn = ce[colKey];","            }","        }","","        return rtn;","","    },","","    /**","     * Returns the Column object (from the original \"columns\") associated with the input TD Node.","     * @method getColumnByTd","     * @param cell {Node} Node of TD for which column object is desired","     * @return column {Object} The column object entry associated with the desired cell","     * @public","     */","    getColumnByTd:  function(cell){","        var colName = this.getColumnNameByTd(cell);","        return (colName) ? this.getColumn(colName) : null;","    },","","","    /**","     * Returns the column \"key\" or \"name\" string for the requested TD Node","     * @method getColumnNameByTd","     * @param cell {Node} Node of TD for which column name is desired","     * @return colName {String} Column key or name","     * @public","     */","    getColumnNameByTd: function(cell){","        var classes = cell.get('className').split(\" \"),","            regCol  = new RegExp( this.getClassName('col') + '-(.*)'),","            colName;","","        Y.Array.some(classes,function(item){","            var colmatch =  item.match(regCol);","            if ( colmatch && Y.Lang.isArray(colmatch) && colmatch[1] ) {","                colName = colmatch[1];","                return true;","            }","        });","","        return colName || null;","    },","","","//==========================  PRIVATE METHODS  =============================","","","    /**","     * Sets up listeners for the DT editable module,","     * @method _bindEditable","     * @private","     */","    _bindEditable: function(){","        var eotype = this.get('editOpenType');","","        if(this._subscrEditable) {","            Y.Array.each(this._subscrEditable,function(eh){","                if(eh && eh.detach) {","                    eh.detach();","                }","            });","        }","","        this._subscrEditable = [];","","        // Check the editing open type setting ...","        eotype = (eotype && Y.Lang.isString(eotype) && eotype.search(/none/i)===-1 ) ? eotype : null;","        if(eotype) {","            if(this._subscrEditOpen) {","                this._subscrEditOpen.detach();","            }","            this._subscrEditOpen = this.delegate( eotype, this.openCellEditor,\"tbody.\" + this.getClassName('data') + \" td\",this);","        }","","        this._subscrEditable.push(","            Y.Do.after(this._updateAllEditableColumnsCSS,this,'syncUI'),","            this.after('sort', this._afterEditableSort),","            this.after('editOpenTypeChange',this._onEditOpenTypeChange),","            this.after('defaultEditorChange',this._onDefaultEditorChange)","        );","","    },","","    /**","     * Unbinds ALL of the popup editor listeners and removes column editors.","     * This should only be used when the DT is destroyed","     * @method _unbindEditable","     * @private","     */","    _unbindEditable: function() {","","        // Detach 'editable' related listeners","        if(this._subscrEditable) {","            Y.Array.each(this._subscrEditable,function(eh){","                if(eh && eh.detach) {","                    eh.detach();","                }","            });","        }","        this._subscrEditable = null;","","        // Detach edit opening ...","        if(this._subscrEditOpen) {","            this._subscrEditOpen.detach();","        }","        this._subscrEditOpen = null;","","        // destroy any currently open editor","        if(this._openEditor && this._openEditor.destroy) {","            this._openEditor.destroy();","        }","","        // Detach scrolling listeners","        if(this._subscrCellEditorScrolls && Y.Lang.isArray(this._subscrCellEditorScrolls) ) {","            Y.Array.each(this._subscrCellEditorScroll, function(dh){","                if(dh && dh.detach) {","                    dh.detach();","                }","            });","            this._subscrCellEditorScrolls = [];","        }","","        this.detach('celleditor:*');","","        this._unsetEditor();","","        // run through all instantiated editors and destroy them","        this._destroyColumnEditors();","","    },","","    /**","     * Binds listeners to cell TD \"open editing\" events (i.e. either click or dblclick)","     * as a result of DataTable setting \"editable:true\".","     *","     * Also sets a body listener for ESC key, to close the current open editor.","     *","     * @method _bindCellEditingListeners","     * @private","     */","    _bindCellEditingListeners: function(){","","        // clear up previous listeners, if any ...","        if(this._subscrCellEditors) {","            this._unbindCellEditingListeners();","        }","","        // create listeners","        this._subscrCellEditors = [];","","        // Add a ESC key listener on the body (hate doing this!) to close editor if open ...","        this._subscrCellEditors.push(","            Y.one('body').after('keydown', Y.bind(this._onKeyEsc,this) ),","            this.on('celleditor:editorSave',this._onCellEditorSave),","            this.on('celleditor:editorCancel',this._onCellEditorCancel),","            this.on('celleditor:keyDirChange',this._onKeyDirChange)","        );","    },","","    /**","     * Unbinds the TD click delegated click listeners for initiating editing in TDs","     * @method _unbindCellEditingListeners","     * @private","     */","    _unbindCellEditingListeners: function(){","        if(this._subscrCellEditors) {","            Y.Array.each(this._subscrCellEditors,function(e){","                if(e && e.detach) {","                    e.detach();","                }","            });","            this._subscrCellEditors = null;","        }","    },","","    /**","     * Sets up listeners for DT scrollable \"scroll\" events","     * @method _bindEditorScroll","     * @private","     */","    _bindEditorScroll: function() {","        this._subscrCellEditorScrolls = [];","        if(this._xScroll && this._xScrollNode) {","            this._subscrCellEditorScrolls.push( this._xScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );","        }","        if(this._yScroll && this._yScrollNode) {","            this._subscrCellEditorScrolls.push( this._yScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );","        }","","    },","","","    /**","     * Listener that toggles the DT editable state, setting/unsetting the listeners associated with","     * cell editing.","     * @method _onEditableChange","     * @param o {EventFacade} Change event facade for \"editable\" attribute","     * @private","     */","    _onEditableChange: function(o) {","        if(o.newVal || o===true ) {","","            this._bindEditable();","","            // call overrideable method .... simple return by default","            this.bindEditorListeners();","","            this._bindCellEditingListeners();","            this._buildColumnEditors();","","        } else {","","            this._unbindEditable();","            this._unbindCellEditingListeners();","            this._destroyColumnEditors();","","        }","","    },","","    /**","     * Listener for changes on [defaultEditor](#attr_defaultEditor) attribute for this DT.","     * If the default editor is changed to a valid setting, we disable and re-enable","     * editing on the DT to reset the column editors.","     *","     * @method _onDefaultEditorChange","     * @param o {EventFacade} Change eventfacade for \"defaultEditor\" attribute","     * @private","     */","    _onDefaultEditorChange: function(o) {","        var defeditor = o.newVal;","","        // if a valid editor is given AND we are in editing mode, toggle off/on ...","        if ( defeditor && defeditor.search(/none/i)===-1 && this.get('editable') ) {","            this.set('editable',false);","            this.set('editable',true);","        }","    },","","    /**","     * Setter method for the [editOpenType](#attr_editOpenType) attribute, specifies what","     * TD event to listen to for initiating editing.","     * @method _setEditOpenType","     * @param v {String}","     * @private","     */","    _onEditOpenTypeChange: function() {","        //var eotype = o.newVal || o;","        if(this.get('editable')) {","            this.set('editable',false);","            this.set('editable',true);","        }","    },","","    /**","     * Pre-scans the DT columns looking for column named editors and collects unique editors,","     * instantiates them, and adds them to the  _columnEditors array.  This method only creates","     * View instances that are required, through combination of _commonEditors and _columnEditors","     * properties.","     *","     * @method _buildColumnEditors","     * @private","     */","    _buildColumnEditors: function(){","        var cols     = this.get('columns'),","            defEditr = this.get('defaultEditor'),","            edName, colKey, editorInstance;","","        if( !Y.DataTable.EditorOptions ) {","            return;","        }","","        if( this._columnEditors || this._commonEditors ) {","            this._destroyColumnEditors();","        }","","        this._commonEditors = {};","        this._columnEditors = {};","","        //","        //  Set the default editor, if one is defined","        //","        defEditr = (defEditr && defEditr.search(/none|null/i) !==0 ) ? defEditr : null;","","        //","        //  Loop over all DT columns ....","        //","        Y.Array.each(cols,function(c){","            if(!c) {","                return;","            }","","            colKey = c.key || c.name;","","            // An editor was defined (in column) and doesn't yet exist ...","            if(colKey && c.editable !== false) {","","                edName = c.editor || defEditr;","","                // This is an editable column, update the TD's for the editable column","                this._updateEditableColumnCSS(colKey,true);","","                //this._editorColHash[colKey] = edName;","","                //","                // If an editor is named, check if its definition exists, and that it is","                // not already instantiated.   If not, create it ...","                //","","                // check for common editor ....","                if (edName && Y.DataTable.EditorOptions[edName]) {","","                    if(c.editorConfig && Y.Lang.isObject(c.editorConfig) ) {","","                        editorInstance = this._createCellEditorInstance(edName,c);","","                        this._columnEditors[colKey] = editorInstance || null;","","                    } else {","","                        if( !this._commonEditors[edName] ) {","                            editorInstance = this._createCellEditorInstance(edName,c);","                            this._commonEditors[edName] = editorInstance;","                        }","","                        this._columnEditors[colKey] = edName;","","                    }","","                }","","            }","        },this);","","    },","","    /**","     * This method takes the given editorName (i.e. 'textarea') and if the default editor","     * configuration, adds in any column 'editorConfig' and creates the corresponding","     * cell editor View instance.","     *","     * Makes shallow copies of editorConfig: { overlayConfig, widgetConfig, templateObject }","     *","     * @method _createCellEditorInstance","     * @param editorName {String} Editor name","     * @param column {Object} Column object","     * @return editorInstance {View} A newly created editor instance for the supplied editorname and column definitions","     * @private","     */","    _createCellEditorInstance: function(editorName, column) {","        var conf_obj      = Y.clone(Y.DataTable.EditorOptions[editorName],true),","            BaseViewClass = Y.DataTable.EditorOptions[editorName].BaseViewClass,","            editorInstance;","","        if(column.editorConfig && Y.Lang.isObject(column.editorConfig)) {","            conf_obj = Y.merge(conf_obj, column.editorConfig);","","            if(column.editorConfig.overlayConfig) {","                conf_obj.overlayConfig = Y.merge(conf_obj.overlayConfig || {}, column.editorConfig.overlayConfig);","            }","","            if(column.editorConfig.widgetConfig) {","                conf_obj.widgetConfig = Y.merge(conf_obj.widgetConfig || {}, column.editorConfig.widgetConfig);","            }","","            if(column.editorConfig.templateObject) {","                conf_obj.templateObject = Y.merge(conf_obj.templateObject || {}, column.editorConfig.templateObject);","            }","            conf_obj.name = editorName;","        }","","        delete conf_obj.BaseViewClass;","","        //","        //  We have a valid base class, instantiate it","        //","        if(BaseViewClass){","            conf_obj.hostDT = this;","            editorInstance = new BaseViewClass(conf_obj);","","            // make the one of this editor's targets ...","            editorInstance.addTarget(this);","        }","","        return editorInstance;","    },","","    /**","     * Loops through the column editor instances, destroying them and resetting the collection to null object","     * @method _destroyColumnEditors","     * @private","     */","    _destroyColumnEditors: function(){","        if( !this._columnEditors && !this._commonEditors ) {","            return;","        }","","        var ces = this._getAllCellEditors();","        Y.Array.each(ces,function(ce){","            if(ce && ce.destroy) {","                ce.destroy();","              //  ce.destroy({remove:true});","            }","        });","","        this._commonEditors = null;","        this._columnEditors = null;","","        // remove editing class from all editable columns ...","        Y.Array.each( this.get('columns'), function(c){","            if(c.editable === undefined || c.editable === true) {","                this._updateEditableColumnCSS(c.key || c.name,false);","            }","        },this);","","    },","","    /**","     * Utility method to combine \"common\" and \"column-specific\" cell editor instances and return them","     * @method _getAllCellEditors","     * @return {Array} Of cell editor instances used for the current DT column configurations","     * @private","     */","    _getAllCellEditors: function() {","        var rtn = [];","","        if( this._commonEditors ) {","            Y.Object.each(this._commonEditors,function(ce){","                if(ce && ce instanceof Y.View){","                    rtn.push(ce);","                }","            });","        }","","        if( this._columnEditors ) {","            Y.Object.each(this._columnEditors,function(ce){","                if(ce && ce instanceof Y.View){","                    rtn.push(ce);","                }","            });","        }","        return rtn;","    },","","    /**","     * Closes the active cell editor when a document ESC key is detected","     * @method _onKeyEsc","     * @param e {EventFacade} key listener event facade","     * @private","     */","    _onKeyEsc:  function(e) {","        if(e.keyCode===27) {","            this.hideCellEditor();","        }","    },","","","    /**","     * Listener to the \"sort\" event, so we can hide any open editors and update the editable column CSS","     *  after the UI refreshes","     * @method _afterEditableSort","     * @private","     */","    _afterEditableSort: function() {","        if(this.get('editable')) {","            this.hideCellEditor();","            this._updateAllEditableColumnsCSS();","        }","    },","","    /**","     * Re-initializes the static props to null","     * @method _unsetEditor","     * @private","     */","    _unsetEditor: function(){","        // Finally, null out static props on this extension","        this._openEditor = null;","        this._openRecord = null;","        this._openColKey = null;","        this._openCell = null;","        this._openTd = null;","    },","","    /**","     * Method to update all of the current TD's within the current DT to add/remove the editable CSS","     * @method _updateAllEditableColumnsCSS","     * @private","     */","    _updateAllEditableColumnsCSS : function() {","        if(this.get('editable')) {","            var cols = this.get('columns'),","                ckey;","            Y.Array.each(cols,function(col){","                ckey = col.key || col.name;","                if(ckey) {","                    this._updateEditableColumnCSS(ckey, true); //(flag) ? col.editable || true : false);","                }","            },this);","        }","    },","","    /**","     * Method that adds/removes the CSS editable-column class from a DataTable column,","     * based upon the setting of the boolean \"opt\"","     *","     * @method _updateEditableColumnCSS","     * @param cname {String}  Column key or name to alter","     * @param opt {Boolean} True of False to indicate if the CSS class should be added or removed","     * @private","     */","    _updateEditableColumnCSS : function(cname,opt) {","        var tbody = this.get('contentBox').one('tbody.'+this.getClassName('data')),","            col   = (cname) ? this.getColumn(cname) : null,","            colEditable = col && col.editable !== false,","            tdCol;","        if(!cname || !col || !colEditable) {","            return;","        }","","        colEditable = ( col.editor || (this.get('defaultEditor')!==null","            && this.get('defaultEditor').search(/none/i)!==0) ) ? true : false;","","        if(!tbody || !colEditable) {","            return;","        }","","        tdCol = tbody.all('td.'+this.getClassName('col',cname));","","        if(tdCol && opt===true) {","            tdCol.addClass(this._classColEditable);","        } else if (tdCol) {","            tdCol.removeClass(this._classColEditable);","        }","    },","","    /**","     * Listener to TD \"click\" events that hides a popup editor is not in the current cell","     * @method _handleCellClick","     * @param e","     * @private","     */","    _handleCellClick:  function(e){","        var td = e.currentTarget,","            cn = this.getColumnNameByTd(td);","        if (cn && this._openEditor &&  this._openEditor.get('colKey')!==cn) {","            this.hideCellEditor();","        }","    },","","    /**","     * Listener that fires on a scrollable DT scrollbar \"scroll\" event, and updates the current XY position","     *  of the currently open Editor.","     *","     * @method _onScrollUpdateCellEditor","     * @private","     */","    _onScrollUpdateCellEditor: function(e) {","        //","        //  Only go into this dark realm if we have a TD and an editor is open ...","        //","        if(this.get('editable') && this.get('scrollable') && this._openEditor && this._openTd ) {","","           var tar    = e.target,","               tarcl  = tar.get('className') || '',","               tr1    = this.getRow(0),","               trh    = (tr1) ? +tr1.getComputedStyle('height').replace(/px/,'') : 0,","               tdxy   = (this._openTd) ? this._openTd.getXY() : null,","               xmin, xmax, ymin, ymax, hidef;","","            //","            // For vertical scrolling - check vertical 'y' limits","            //","            if( tarcl.search(/-y-/) !==-1 ) {","","                ymin = this._yScrollNode.getY() + trh - 5;","                ymax = ymin + (+this._yScrollNode.getComputedStyle('height').replace(/px/,'')) - 2*trh;","","                if(tdxy[1] >= ymin && tdxy[1] <= ymax ) {","                    if(this._openEditor.get('hidden')) {","                        this._openEditor.showEditor(this._openTd);","                    } else {","                        this._openEditor.set('xy', tdxy );","                    }","                } else {","                    hidef = true;","                }","            }","","            //","            // For horizontal scrolling - check horizontal 'x' limits","            //","            if( tarcl.search(/-x-/) !==-1 ) {","","                xmin = this._xScrollNode.getX();","                xmax = xmin + (+this._xScrollNode.getComputedStyle('width').replace(/px/,''));","                xmax -= +this._openTd.getComputedStyle('width').replace(/px/,'');","","                if(tdxy[0] >= xmin && tdxy[0] <= xmax ) {","                    if(this._openEditor.get('hidden')) {","                        this._openEditor.showEditor(this._openTd);","                    } else {","                        this._openEditor.set('xy', tdxy );","                    }","                } else {","                    hidef = true;","                }","            }","","            // If hidef is true, editor is out of view, hide it temporarily","            if(hidef) {","                this._openEditor.hideEditor(true);","            }","","        }","    },","","    /**","     * Listens to changes to an Editor's \"keyDir\" event, which result from the user","     * pressing \"ctrl-\" arrow key while in an editor to navigate to an cell.","     *","     * The value of \"keyDir\" is an Array of two elements, in [row,col] format which indicates","     * the number of rows or columns to be changed to from the current TD location","     * (See the base method .getCell)","     *","     * @method _onKeyDirChange","     * @param e {EventFacade} The attribute change event facade for the View's 'keyDir' attribute","     * @private","     */","    _onKeyDirChange : function(e) {","        var dir     = e.newVal,","            recIndex = this.data.indexOf(this._openRecord),","            col      = this.getColumn(this._openColKey),","            colIndex = Y.Array.indexOf(this.get('columns'),col),","            oldTd    = this._openTd,","            newTd, ndir, circ;","","       this.hideCellEditor();","","       //TODO: Implement \"circular\" mode, maybe thru an attribute to wrap col/row navigation","       if(circ) {","","           if(dir[1] === 1 && colIndex === this.get('columns').length-1 ) {","               ndir = [0, -this.get('columns').length+1];","           } else if(dir[1] === -1 && colIndex === 0) {","               ndir = [0, this.get('columns').length-1];","           } else if(dir[0] === 1 && recIndex === this.data.size()-1 ) {","               ndir = [ -this.data.size()+1, 0];","           } else if(dir[0] === -1 && recIndex === 0) {","               ndir = [ this.data.size()-1, 0];","           }","","           if(ndir) {","               dir = ndir;","           }","","       }","","       if(dir){","           newTd = this.getCell(oldTd, dir);","           if(newTd) {","               this.openCellEditor(newTd);","           }","       }","    },","","    /**","     * Listener to the cell editor View's \"editorCancel\" event.  The editorCancel event","     * includes a return object with keys {td,cell,oldValue}","     *","     * @method _onCellEditorCancel","     * @param o {Object} Returned object from cell editor \"editorCancel\" event","     * @private","     */","    _onCellEditorCancel: function(o){","        if(o.cell && this._openRecord && this._openColKey) {","            var cell   = o.cell,","                colKey = cell.colKey || this._openColKey,","                record = this.data.getByClientId(cell.recClientId) || this._openRecord,","                ename  = this._openEditor.get('name');","","            if(!this._openEditor.get('hidden')) {","                this.hideCellEditor();","            }","","            this.fire('cellEditorCancel',{","                td:         o.td,","                cell:       cell,","                record:     record,","                colKey:     colKey,","                prevVal:    o.oldValue,","                editorName: ename","            });","        }","","    },","","    /**","     * Fired when the open Cell Editor has sent an 'editorCancel' event, typically from","     * a user cancelling editing via ESC key or \"Cancel Button\"","     * @event cellEditorCancel","     * @param {Object} rtn Returned Object","     *  @param {Node} td The TD Node that was edited","     *  @param {Object} cell The cell object container for the edited cell","     *  @param {Model} record Model instance of the record data for the edited cell","     *  @param {String} colKey Column key (or name) of the edited cell","     *  @param {String|Number|Date} prevVal The old (last) value of the underlying data for the cell","     *  @param {String} editorName The name attribute of the editor that updated this cell","     */","","    /**","     * Listener to the cell editor View's \"editorSave\" event, that when fired will","     * update the Model's data value for the approrpriate column.","     *","     * The editorSave event includes a return object with keys {td,cell,newValue,oldValue}","     *","     * Note:  If a \"sync\" layer DOES NOT exist (i.e. DataSource), implementers can listen for","     * the \"saveCellEditing\" event to send changes to a remote data store.","     *","     * @method _onCellEditorSave","     * @param o {Object} Returned object from cell editor \"editorSave\" event","     * @private","     */","    _onCellEditorSave: function(o){","        if(o.cell && this._openRecord && this._openColKey) {","            var cell   = o.cell,","                colKey = cell.colKey || this._openColKey,","                record = this.data.getByClientId(cell.recClientId) || this._openRecord,","                ename  = this._openEditor.get('name');","","            if(record){","                record.set(this._openColKey, o.newValue);","            }","","            this.hideCellEditor();","","            this.fire('cellEditorSave',{","                td:         o.td,","                cell:       cell,","                record:     record,","                colKey:     colKey,","                newVal:     o.newValue,","                prevVal:    o.oldValue,","                editorName: ename","            });","","        }","","    }","","    /**","     * Event fired after a Cell Editor has sent the 'editorSave' event closing an editing session.","     * The event signature includes pertinent data on the cell, TD, record and column that was","     * edited along with the prior and new values for the cell.","     * @event cellEditorSave","     * @param {Object} rtn Returned Object","     *  @param {Node} td The TD Node that was edited","     *  @param {Object} cell The cell object container for the edited cell","     *  @param {Model} record Model instance of the record data for the edited cell","     *  @param {String} colKey Column key (or name) of the edited cell","     *  @param {String|Number|Date} newVal The new (updated) value of the underlying data for the cell","     *  @param {String|Number|Date} prevVal The old (last) value of the underlying data for the cell","     *  @param {String} editorName The name attribute of the editor that updated this cell","     */","","});","","Y.DataTable.Editable = DtEditable;","Y.Base.mix(Y.DataTable, [Y.DataTable.Editable]);","","/**"," * This object is attached to the DataTable namespace to allow addition of \"editors\" in conjunction"," * with the Y.DataTable.Editable module."," *"," * (See modules gallery-datatable-celleditor-popup and gallery-datatable-celleditor-inline for"," *  examples of the content of this object)"," *"," * @class Y.DataTable.EditorOptions"," * @extends Y.DataTable"," * @type {Object}"," * @since 3.8.0"," */","Y.DataTable.EditorOptions = {};","","","}, '@VERSION@', {\"supersedes\": [\"\"], \"skinnable\": \"true\", \"requires\": [\"datatable-base\", \"datatype\"], \"optional\": [\"\"]});"];
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].lines = {"1":0,"85":0,"88":0,"115":0,"135":0,"140":0,"293":0,"296":0,"297":0,"300":0,"302":0,"304":0,"314":0,"315":0,"328":0,"334":0,"335":0,"339":0,"340":0,"346":0,"347":0,"351":0,"352":0,"353":0,"355":0,"364":0,"369":0,"370":0,"371":0,"372":0,"374":0,"387":0,"393":0,"407":0,"408":0,"409":0,"419":0,"420":0,"421":0,"422":0,"423":0,"435":0,"444":0,"445":0,"446":0,"447":0,"453":0,"468":0,"473":0,"474":0,"476":0,"478":0,"482":0,"494":0,"495":0,"507":0,"511":0,"512":0,"513":0,"514":0,"515":0,"519":0,"532":0,"534":0,"535":0,"536":0,"537":0,"542":0,"545":0,"546":0,"547":0,"548":0,"550":0,"553":0,"571":0,"572":0,"573":0,"574":0,"578":0,"581":0,"582":0,"584":0,"587":0,"588":0,"592":0,"593":0,"594":0,"595":0,"598":0,"601":0,"603":0,"606":0,"622":0,"623":0,"627":0,"630":0,"644":0,"645":0,"646":0,"647":0,"650":0,"660":0,"661":0,"662":0,"664":0,"665":0,"679":0,"681":0,"684":0,"686":0,"687":0,"691":0,"692":0,"693":0,"709":0,"712":0,"713":0,"714":0,"727":0,"728":0,"729":0,"743":0,"747":0,"748":0,"751":0,"752":0,"755":0,"756":0,"761":0,"766":0,"767":0,"768":0,"771":0,"774":0,"776":0,"779":0,"789":0,"791":0,"793":0,"795":0,"799":0,"800":0,"801":0,"804":0,"829":0,"833":0,"834":0,"836":0,"837":0,"840":0,"841":0,"844":0,"845":0,"847":0,"850":0,"855":0,"856":0,"857":0,"860":0,"863":0,"872":0,"873":0,"876":0,"877":0,"878":0,"879":0,"884":0,"885":0,"888":0,"889":0,"890":0,"903":0,"905":0,"906":0,"907":0,"908":0,"913":0,"914":0,"915":0,"916":0,"920":0,"930":0,"931":0,"943":0,"944":0,"945":0,"956":0,"957":0,"958":0,"959":0,"960":0,"969":0,"970":0,"972":0,"973":0,"974":0,"975":0,"991":0,"995":0,"996":0,"999":0,"1002":0,"1003":0,"1006":0,"1008":0,"1009":0,"1010":0,"1011":0,"1022":0,"1024":0,"1025":0,"1040":0,"1042":0,"1052":0,"1054":0,"1055":0,"1057":0,"1058":0,"1059":0,"1061":0,"1064":0,"1071":0,"1073":0,"1074":0,"1075":0,"1077":0,"1078":0,"1079":0,"1081":0,"1084":0,"1089":0,"1090":0,"1109":0,"1116":0,"1119":0,"1121":0,"1122":0,"1123":0,"1124":0,"1125":0,"1126":0,"1127":0,"1128":0,"1131":0,"1132":0,"1137":0,"1138":0,"1139":0,"1140":0,"1154":0,"1155":0,"1160":0,"1161":0,"1164":0,"1203":0,"1204":0,"1209":0,"1210":0,"1213":0,"1215":0,"1246":0,"1247":0,"1261":0};
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].functions = {"validator:115":0,"validator:135":0,"initializer:291":0,"destructor:312":0,"openCellEditor:327":0,"hideCellEditor:406":0,"(anonymous 2):421":0,"hideAllCellEditors:418":0,"bindEditorListeners:434":0,"(anonymous 3):445":0,"getCellEditors:443":0,"getCellEditor:467":0,"getColumnByTd:493":0,"(anonymous 4):511":0,"getColumnNameByTd:506":0,"(anonymous 5):535":0,"_bindEditable:531":0,"(anonymous 6):572":0,"(anonymous 7):593":0,"_unbindEditable:568":0,"_bindCellEditingListeners:619":0,"(anonymous 8):645":0,"_unbindCellEditingListeners:643":0,"_bindEditorScroll:659":0,"_onEditableChange:678":0,"_onDefaultEditorChange:708":0,"_onEditOpenTypeChange:725":0,"(anonymous 9):766":0,"_buildColumnEditors:742":0,"_createCellEditorInstance:828":0,"(anonymous 10):877":0,"(anonymous 11):888":0,"_destroyColumnEditors:871":0,"(anonymous 12):906":0,"(anonymous 13):914":0,"_getAllCellEditors:902":0,"_onKeyEsc:929":0,"_afterEditableSort:942":0,"_unsetEditor:954":0,"(anonymous 14):972":0,"_updateAllEditableColumnsCSS:968":0,"_updateEditableColumnCSS:990":0,"_handleCellClick:1021":0,"_onScrollUpdateCellEditor:1036":0,"_onKeyDirChange:1108":0,"_onCellEditorCancel:1153":0,"_onCellEditorSave:1202":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].coveredLines = 263;
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].coveredFunctions = 48;
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1);
YUI.add('gallery-datatable-editable', function (Y, NAME) {

/**
 A DataTable class extension that configures a DT for "editing", current deployment supports cell editing
 (and planned near-term support for row editing).

 This module is essentially a base wrapper-class to setup DT for editing with the appropriate attributes and
 listener creation / detachment.  The real guts of "datatable-editing" is in the View class definitions, within
 the gallery-datatable-celleditor-inline and gallery-datatable-celleditor-inline modules (and possibly future
 editor View class modules).

 #### Functionality

 The module is basically intended to keep track of the editing state (via [editable](#attr_editable) attribute) and
 housekeeping functions with regard to managing editor View instance creation, rendering and destruction.

 By design this module attempts to group common editor View instances wherever possible.  So for a DT with 14 columns
 all set with "inline" View classes only 1 View instance is created.
 <br/>Likewise if a DT uses 4 different "calendar" editor View types but each one as slightly different "editorConfig",
 then this module creates 4 different calendar View instances to handle the different configurations.

 Listeners are set for the "cellEditorSave" event and saved to the active "data" setting within this module.

 Additional capability is provided for cell editing situations to add CSS classes to TD's which are added to "editable"
 columns (e.g. cursor) to indicate they are "clickable".

 This module works sortable, scrollable (y-scrolling currently) to make changes to the client-side of the DT model
 (remote updates should be provided via ModelList sync or user-defined listeners.)


 #### Attributes

 Presently three attributes are provided;
 [editable](#attr_editable), [editOpenType](#attr_editOpenType) and [defaultEditor](#attr_defaultEditor).

 The primary ATTR is the [editable](#attr_editable), which is used to toggle on/off the editing state of the DT
 instance.

 The [defaultEditor](#attr_defaultEditor) attribute is used to setup a cell editor View instance to be used on all editable columns
 that don't already have an editor assigned.

 ##### Column Properties

 In addition to a few new attributes the module also recognizes some new column properties in order to support
 cell-editing in particular;
 <table>
 <tr><th>editable</th><td>{Boolean}</td><td>Flag to indicate if column is editable (set `editable:false` to exclude an
 individual column)</td></tr>
 <tr><th>editor</th><td>{String}</td><td>Name of the defined Y.DataTable.EditorOptions View configuration for this column.</td></tr>
 <tr><th>editorConfig</th><td>{Object}</td><td>Passed to the View editor class when instantiated, and Y.merge'ed in to become View class
 attributes.</td></tr>
 </table>

 When this module is loaded and the "editable:true" attribute is set, it attempts to economize on the "instantiation cost"
 of creating View instances by identifying only editor Views that are required based upon column definitions and/or the
 defaultEditor attribute. (e.g. if all columns are "text" editors, only one "text" editor View is instantiated)

 ##### ... More Info

 The module fires the event [cellEditorSave](#event_cellEditorSave), which can be listened for to provide updating
 of remote data back to a server (assuming a ModelList "sync" layer is NOT used).  Haven't provided the equivalent to
 YUI 2.x's "asyncSubmitter" because I think this event could easily be listened to in order to provide follow-on
 updating to remote data stores.

 A new class Object (Y.DataTable.EditorOptions) is added to the DataTable namespace that serves as the
 datastore of the editor View configuration properties.  Each "key" (object property) within this object
 is an entrypoint to a specific editor configuration, which are defined in the separate View class extensions (presently
 gallery-datatable-celleditor-inline and gallery-datatable-celleditor-popup. Please see those for specifics.)

 ###### KNOWN ISSUES:
   <ul>
   <li>Works minimally with "y" scrolling, "x" scrolling still needs work.</li>
   <li>Initial editor invocation is limited to "mouse" actions on TD only (although keyboard navigation cell-to-cell is available).</li>
   </ul>

 ###### FUTURE:
 This module will be amended to add support for "row" editing, if required.

 @module gallery-datatable-editable
 @class Y.DataTable.Editable
 @extends Y.DataTable
 @author Todd Smith
 @since 3.8.0
 **/
_yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 85);
DtEditable = function(){};

// Define new attributes to support editing
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 88);
DtEditable.ATTRS = {

    /**
     * A boolean flag that sets the DataTable state to allow editing (either inline or popup cell editing).
     * (May support row editing in future also)
     *
     * @attribute editable
     * @type boolean
     * @default false
     */
    editable: {
        value:      false,
        validator:  Y.Lang.isBoolean
    },

    /**
     * Defines the cell editing event type on the TD that initiates the editor, used to
     * specify the listener that invokes an editor.
     *
     * Note: IMHO The only sensible options are 'click' or 'dblclick'
     *
     * @attribute editOpenType
     * @type {String|Null}
     * @default 'dblclick'
     */
    editOpenType: {
        value:      'dblclick',
        validator:  function(v){ _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "validator", 115);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 115);
return Y.Lang.isString(v) || v===null; }
    },

    /**
     * Specifies a default editor name to respond to an editing event defined in [_editOpenType](#attr_editOpenType)
     * attribute.  The default editor is used if the DataTable is in editing mode (i.e. "editable:true") and if
     * the column DOES NOT include a property editable:false in its definitions.
     *
     * Cell editors are typically assigned by setting a column property (i.e. editor:'text' or 'date') on each
     * individual column.
     *
     * This attribute can be used to set a single editor to work on every column without having to define it on each
     * column.
     *
     * @attribute defaultEditor
     * @type {String|Null}
     * @default null
     */
    defaultEditor : {
        value:      null,
        validator:  function(v){ _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "validator", 135);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 135);
return Y.Lang.isString(v) || v === null; }
    }
};

// Add static props and public/private methods to be added to DataTable
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 140);
Y.mix( DtEditable.prototype, {

// -------------------------- Placeholder Private Properties  -----------------------------

    /**
     Holds the View instance of the active cell editor currently displayed
     @property _openEditor
     @type Y.View
     @default null
     @private
     @static
     **/
    _openEditor:        null,

    /**
     Holds the current record (i.e. a Model class) of the TD being edited
     (Note: this may not always work, better to use "clientId" of the record, i.e. sorting, etc..)
     @property _openRecord
     @type Model
     @default null
     @private
     @static
     **/
    _openRecord:        null,

    /**
     Holds the column key (or name) of the TD cell being edited
     @property _openColKey
     @type String
     @default null
     @private
     @static
     **/
    _openColKey:        null,

    /**
     Holds the TD Node currently being edited
     @property _openTd
     @type Node
     @default null
     @private
     @static
     **/
    _openTd:            null,

    /**
     Holds the cell data for the actively edited TD, a complex object including the
     following;  {td, value, recClientId, colKey}
     @property _openCell
     @type Object
     @default null
     @private
     @static
     **/
    _openCell:          null,

// -------------------------- Subscriber handles  -----------------------------

    /**
     Placeholder for the DT level event listener for "editableChange" attribute.
     @property _subscrEditable
     @type EventHandle
     @default null
     @private
     @static
     **/
    _subscrEditable:     null,

    /**
     Placeholder for the DT event listener to begin editing a cell (based on editOpenType ATTR)
     @property _subscrEditOpen
     @type EventHandle
     @default null
     @private
     @static
     **/
    _subscrEditOpen: null,

    /**
     Placeholder Array for TD editor invocation event handles (i.e. click or dblclick) that
     are set on the TBODY to initiate cellEditing.
     @property _subscrCellEditors
     @type Array of EventHandles
     @default null
     @private
     @static
     **/
    _subscrCellEditors:    null,

    /**
     Placeholder for event handles for scrollable DT that listens to "scroll" events and repositions editor
     (we need two listeners, one for each of X or Y scroller)
     @property _subscrCellEditorScrolls
     @type Array of EventHandles
     @default null
     @private
     @static
     **/
    _subscrCellEditorScrolls: null,

    /**
     Shortcut to the CSS class that is added to indicate a column is editable
     @property _classColEditable
     @type String
     @default 'yui3-datatable-col-editable'
     @private
     @static
     **/
    _classColEditable:  null,

    /**
     Placeholder hash that stores the "common" editors, i.e. standard editor names that occur
     within Y.DataTable.EditorOptions and are used in this DT.

     This object holds the View instances, keyed by the editor "name" for quick hash reference.
     The object is populated in method [_buildColumnEditors](#method__buildColumnEditors).

     @property _commonEditors
     @type Object
     @default null
     @private
     @static
     **/
    _commonEditors:  null,

    /**
     Placeholder hash that stores cell editors keyed by column key (or column name) where the value
     for the associated key is either a (a) {String} which references an editor name in the [_commonEditors](#property__commonEditors)
     hash or (b) {View} instance for a customized editor View instance (typically one with specified "editorConfig" in the
     column definition).

     The object is populated in method [_buildColumnEditors](#method__buildColumnEditors).

     @property _columnEditors
     @type Object
     @default null
     @private
     @static
     **/
    _columnEditors: null,

    // future
    //_editableType:      null,   //  'cell', 'row', 'inline?'

//==========================  LIFECYCLE METHODS  =============================

    /**
     * Initializer that sets up listeners for "editable" state and sets some CSS names
     * @method initializer
     * @protected
     */
    initializer: function(){

        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "initializer", 291);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 293);
this._classColEditable = this.getClassName('col','editable');

        // Hacky, but works ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 296);
if(this.get('editable')) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 297);
this._onEditableChange(true);
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 300);
this.after('editableChange',this._onEditableChange);

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 302);
this._bindEditable();

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 304);
return this;
    },

    /**
     * Cleans up ALL of the DT listeners and the editor View instances and generated private props
     * @method destructor
     * @protected
     */
    destructor:function() {
        // detach the "editableChange" listener on the DT
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "destructor", 312);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 314);
this.set('editable',false);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 315);
this._unbindEditable();
    },

//==========================  PUBLIC METHODS  =============================

    /**
     * Opens the given TD eventfacade or Node with it's assigned cell editor.
     *
     * @method openCellEditor
     * @param e {EventFacade|Node} Passed in object from an event OR a TD Node istance
     * @public
     */
    openCellEditor: function(e) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "openCellEditor", 327);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 328);
var td       = e.currentTarget || e,
            col      = this.getColumnByTd(td),
            colKey   = col.key || col.name,
            editorRef = (colKey) ? this._columnEditors[colKey] : null,
            editorInstance = (editorRef && Y.Lang.isString(editorRef) ) ? this._commonEditors[editorRef] : editorRef;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 334);
if(!td) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 335);
return;
        }

        // First time in,
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 339);
if( (this._yScroll || this._xScroll) && !this._subscrCellEditorScroll) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 340);
this._bindEditorScroll();
        }

        //
        // Bailout if column is null, has editable:false or no editor assigned ...
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 346);
if(col && col.editable === false && !editorInstance) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 347);
return;
        }

        // Hide any editor that may currently be open ... unless it is the currently visible one
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 351);
if(this._openEditor) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 352);
if ( this._openEditor === editorInstance ) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 353);
this._openEditor.hideEditor();
            } else {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 355);
this.hideCellEditor();
            }
        }

        //
        //  If the editorInstance exists, populate it and show it
        //
        //TODO:  fix this to rebuild new editors if user changes a column definition on the fly
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 364);
if(editorInstance) {

            //
            //  Set private props to the open TD we are editing, the editor instance, record and column name
            //
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 369);
this._openTd     = td;                      // store the TD
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 370);
this._openEditor = editorInstance;          // placeholder to the open Editor View instance
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 371);
this._openRecord = this.getRecord(td);      // placeholder to the editing Record
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 372);
this._openColKey = colKey;                  // the column key (or name)

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 374);
this._openCell   = {
                td:             td,
                value:          this._openRecord.get(colKey),
                recClientId:    this._openRecord.get('clientId'),
                colKey:         colKey
            };

            // Define listeners onto this open editor ...
            //this._bindOpenEditor( this._openEditor );

            //
            //  Set the editor Attributes and render it ... (display it!)
            //
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 387);
this._openEditor.setAttrs({
       //         hostDT: this,
                cell:   this._openCell,
                value:  this._openRecord.get(colKey)
            });

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 393);
this._openEditor.showEditor(td);

        }

    },


    /**
     * Cleans up a currently open cell editor View and unbinds any listeners that this DT had
     * set on the View.
     * @method hideCellEditor
     * @public
     */
    hideCellEditor: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "hideCellEditor", 406);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 407);
if(this._openEditor) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 408);
this._openEditor.hideEditor();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 409);
this._unsetEditor();
        }
    },

    /**
     * Utility method that scans through all editor instances and hides them
     * @method hideAllCellEditors
     * @private
     */
    hideAllCellEditors: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "hideAllCellEditors", 418);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 419);
this.hideCellEditor();
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 420);
var ces = this._getAllCellEditors();
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 421);
Y.Array.each( ces, function(editor){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 2)", 421);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 422);
if(editor && editor.hideEditor) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 423);
editor.hideEditor();
            }
        });
    },

    /**
     * Over-rideable method that can be used to do other user bindings ?
     *   (like hideEditor on mouseout, etc...)
     * @method bindEditorListeners
     * @public
     */
    bindEditorListeners: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "bindEditorListeners", 434);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 435);
return;
    },

    /**
     * Returns all cell editor View instances for the editable columns of the current DT instance
     * @method getCellEditors
     * @return editors {Array} Array containing an Object as {columnKey, cellEditor, cellEditorName}
     */
    getCellEditors: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "getCellEditors", 443);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 444);
var rtn = [], ed;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 445);
Y.Object.each(this._columnEditors,function(v,k){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 3)", 445);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 446);
ed = (Y.Lang.isString(v)) ? this._commonEditors[v] : v;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 447);
rtn.push({
                columnKey:      k,
                cellEditor:     ed,
                cellEditorName: ed.get('name')
            });
        },this);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 453);
return rtn;
    },

    /**
     * Utility method to return the cell editor View instance associated with a particular column of the
     * Datatable.
     *
     * Returns null if the given column is not editable.
     *
     * @method getCellEditor
     * @param col {Object|String|Integer} Column identifier, either the Column object, column key or column index
     * @returns {View} Cell editor instance, or null if no editor for given column
     * @public
     */
    getCellEditor: function(col) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "getCellEditor", 467);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 468);
var ce = this._columnEditors,
            column = (col && typeof col !== "object") ? this.getColumn(col) : null,
            colKey = (column) ? column.key || column.name : null,
            rtn = null;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 473);
if(colKey && ce[colKey]) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 474);
if(Y.Lang.isString(ce[colKey])) {
                // ce[colKey] is a common editor name, like "textarea", etc..
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 476);
rtn = this._commonEditors[ ce[colKey] ];
            } else {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 478);
rtn = ce[colKey];
            }
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 482);
return rtn;

    },

    /**
     * Returns the Column object (from the original "columns") associated with the input TD Node.
     * @method getColumnByTd
     * @param cell {Node} Node of TD for which column object is desired
     * @return column {Object} The column object entry associated with the desired cell
     * @public
     */
    getColumnByTd:  function(cell){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "getColumnByTd", 493);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 494);
var colName = this.getColumnNameByTd(cell);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 495);
return (colName) ? this.getColumn(colName) : null;
    },


    /**
     * Returns the column "key" or "name" string for the requested TD Node
     * @method getColumnNameByTd
     * @param cell {Node} Node of TD for which column name is desired
     * @return colName {String} Column key or name
     * @public
     */
    getColumnNameByTd: function(cell){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "getColumnNameByTd", 506);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 507);
var classes = cell.get('className').split(" "),
            regCol  = new RegExp( this.getClassName('col') + '-(.*)'),
            colName;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 511);
Y.Array.some(classes,function(item){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 4)", 511);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 512);
var colmatch =  item.match(regCol);
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 513);
if ( colmatch && Y.Lang.isArray(colmatch) && colmatch[1] ) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 514);
colName = colmatch[1];
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 515);
return true;
            }
        });

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 519);
return colName || null;
    },


//==========================  PRIVATE METHODS  =============================


    /**
     * Sets up listeners for the DT editable module,
     * @method _bindEditable
     * @private
     */
    _bindEditable: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_bindEditable", 531);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 532);
var eotype = this.get('editOpenType');

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 534);
if(this._subscrEditable) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 535);
Y.Array.each(this._subscrEditable,function(eh){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 5)", 535);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 536);
if(eh && eh.detach) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 537);
eh.detach();
                }
            });
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 542);
this._subscrEditable = [];

        // Check the editing open type setting ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 545);
eotype = (eotype && Y.Lang.isString(eotype) && eotype.search(/none/i)===-1 ) ? eotype : null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 546);
if(eotype) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 547);
if(this._subscrEditOpen) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 548);
this._subscrEditOpen.detach();
            }
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 550);
this._subscrEditOpen = this.delegate( eotype, this.openCellEditor,"tbody." + this.getClassName('data') + " td",this);
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 553);
this._subscrEditable.push(
            Y.Do.after(this._updateAllEditableColumnsCSS,this,'syncUI'),
            this.after('sort', this._afterEditableSort),
            this.after('editOpenTypeChange',this._onEditOpenTypeChange),
            this.after('defaultEditorChange',this._onDefaultEditorChange)
        );

    },

    /**
     * Unbinds ALL of the popup editor listeners and removes column editors.
     * This should only be used when the DT is destroyed
     * @method _unbindEditable
     * @private
     */
    _unbindEditable: function() {

        // Detach 'editable' related listeners
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_unbindEditable", 568);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 571);
if(this._subscrEditable) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 572);
Y.Array.each(this._subscrEditable,function(eh){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 6)", 572);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 573);
if(eh && eh.detach) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 574);
eh.detach();
                }
            });
        }
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 578);
this._subscrEditable = null;

        // Detach edit opening ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 581);
if(this._subscrEditOpen) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 582);
this._subscrEditOpen.detach();
        }
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 584);
this._subscrEditOpen = null;

        // destroy any currently open editor
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 587);
if(this._openEditor && this._openEditor.destroy) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 588);
this._openEditor.destroy();
        }

        // Detach scrolling listeners
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 592);
if(this._subscrCellEditorScrolls && Y.Lang.isArray(this._subscrCellEditorScrolls) ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 593);
Y.Array.each(this._subscrCellEditorScroll, function(dh){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 7)", 593);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 594);
if(dh && dh.detach) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 595);
dh.detach();
                }
            });
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 598);
this._subscrCellEditorScrolls = [];
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 601);
this.detach('celleditor:*');

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 603);
this._unsetEditor();

        // run through all instantiated editors and destroy them
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 606);
this._destroyColumnEditors();

    },

    /**
     * Binds listeners to cell TD "open editing" events (i.e. either click or dblclick)
     * as a result of DataTable setting "editable:true".
     *
     * Also sets a body listener for ESC key, to close the current open editor.
     *
     * @method _bindCellEditingListeners
     * @private
     */
    _bindCellEditingListeners: function(){

        // clear up previous listeners, if any ...
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_bindCellEditingListeners", 619);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 622);
if(this._subscrCellEditors) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 623);
this._unbindCellEditingListeners();
        }

        // create listeners
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 627);
this._subscrCellEditors = [];

        // Add a ESC key listener on the body (hate doing this!) to close editor if open ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 630);
this._subscrCellEditors.push(
            Y.one('body').after('keydown', Y.bind(this._onKeyEsc,this) ),
            this.on('celleditor:editorSave',this._onCellEditorSave),
            this.on('celleditor:editorCancel',this._onCellEditorCancel),
            this.on('celleditor:keyDirChange',this._onKeyDirChange)
        );
    },

    /**
     * Unbinds the TD click delegated click listeners for initiating editing in TDs
     * @method _unbindCellEditingListeners
     * @private
     */
    _unbindCellEditingListeners: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_unbindCellEditingListeners", 643);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 644);
if(this._subscrCellEditors) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 645);
Y.Array.each(this._subscrCellEditors,function(e){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 8)", 645);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 646);
if(e && e.detach) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 647);
e.detach();
                }
            });
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 650);
this._subscrCellEditors = null;
        }
    },

    /**
     * Sets up listeners for DT scrollable "scroll" events
     * @method _bindEditorScroll
     * @private
     */
    _bindEditorScroll: function() {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_bindEditorScroll", 659);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 660);
this._subscrCellEditorScrolls = [];
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 661);
if(this._xScroll && this._xScrollNode) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 662);
this._subscrCellEditorScrolls.push( this._xScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );
        }
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 664);
if(this._yScroll && this._yScrollNode) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 665);
this._subscrCellEditorScrolls.push( this._yScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );
        }

    },


    /**
     * Listener that toggles the DT editable state, setting/unsetting the listeners associated with
     * cell editing.
     * @method _onEditableChange
     * @param o {EventFacade} Change event facade for "editable" attribute
     * @private
     */
    _onEditableChange: function(o) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onEditableChange", 678);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 679);
if(o.newVal || o===true ) {

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 681);
this._bindEditable();

            // call overrideable method .... simple return by default
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 684);
this.bindEditorListeners();

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 686);
this._bindCellEditingListeners();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 687);
this._buildColumnEditors();

        } else {

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 691);
this._unbindEditable();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 692);
this._unbindCellEditingListeners();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 693);
this._destroyColumnEditors();

        }

    },

    /**
     * Listener for changes on [defaultEditor](#attr_defaultEditor) attribute for this DT.
     * If the default editor is changed to a valid setting, we disable and re-enable
     * editing on the DT to reset the column editors.
     *
     * @method _onDefaultEditorChange
     * @param o {EventFacade} Change eventfacade for "defaultEditor" attribute
     * @private
     */
    _onDefaultEditorChange: function(o) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onDefaultEditorChange", 708);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 709);
var defeditor = o.newVal;

        // if a valid editor is given AND we are in editing mode, toggle off/on ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 712);
if ( defeditor && defeditor.search(/none/i)===-1 && this.get('editable') ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 713);
this.set('editable',false);
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 714);
this.set('editable',true);
        }
    },

    /**
     * Setter method for the [editOpenType](#attr_editOpenType) attribute, specifies what
     * TD event to listen to for initiating editing.
     * @method _setEditOpenType
     * @param v {String}
     * @private
     */
    _onEditOpenTypeChange: function() {
        //var eotype = o.newVal || o;
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onEditOpenTypeChange", 725);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 727);
if(this.get('editable')) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 728);
this.set('editable',false);
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 729);
this.set('editable',true);
        }
    },

    /**
     * Pre-scans the DT columns looking for column named editors and collects unique editors,
     * instantiates them, and adds them to the  _columnEditors array.  This method only creates
     * View instances that are required, through combination of _commonEditors and _columnEditors
     * properties.
     *
     * @method _buildColumnEditors
     * @private
     */
    _buildColumnEditors: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_buildColumnEditors", 742);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 743);
var cols     = this.get('columns'),
            defEditr = this.get('defaultEditor'),
            edName, colKey, editorInstance;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 747);
if( !Y.DataTable.EditorOptions ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 748);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 751);
if( this._columnEditors || this._commonEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 752);
this._destroyColumnEditors();
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 755);
this._commonEditors = {};
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 756);
this._columnEditors = {};

        //
        //  Set the default editor, if one is defined
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 761);
defEditr = (defEditr && defEditr.search(/none|null/i) !==0 ) ? defEditr : null;

        //
        //  Loop over all DT columns ....
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 766);
Y.Array.each(cols,function(c){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 9)", 766);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 767);
if(!c) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 768);
return;
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 771);
colKey = c.key || c.name;

            // An editor was defined (in column) and doesn't yet exist ...
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 774);
if(colKey && c.editable !== false) {

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 776);
edName = c.editor || defEditr;

                // This is an editable column, update the TD's for the editable column
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 779);
this._updateEditableColumnCSS(colKey,true);

                //this._editorColHash[colKey] = edName;

                //
                // If an editor is named, check if its definition exists, and that it is
                // not already instantiated.   If not, create it ...
                //

                // check for common editor ....
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 789);
if (edName && Y.DataTable.EditorOptions[edName]) {

                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 791);
if(c.editorConfig && Y.Lang.isObject(c.editorConfig) ) {

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 793);
editorInstance = this._createCellEditorInstance(edName,c);

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 795);
this._columnEditors[colKey] = editorInstance || null;

                    } else {

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 799);
if( !this._commonEditors[edName] ) {
                            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 800);
editorInstance = this._createCellEditorInstance(edName,c);
                            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 801);
this._commonEditors[edName] = editorInstance;
                        }

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 804);
this._columnEditors[colKey] = edName;

                    }

                }

            }
        },this);

    },

    /**
     * This method takes the given editorName (i.e. 'textarea') and if the default editor
     * configuration, adds in any column 'editorConfig' and creates the corresponding
     * cell editor View instance.
     *
     * Makes shallow copies of editorConfig: { overlayConfig, widgetConfig, templateObject }
     *
     * @method _createCellEditorInstance
     * @param editorName {String} Editor name
     * @param column {Object} Column object
     * @return editorInstance {View} A newly created editor instance for the supplied editorname and column definitions
     * @private
     */
    _createCellEditorInstance: function(editorName, column) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_createCellEditorInstance", 828);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 829);
var conf_obj      = Y.clone(Y.DataTable.EditorOptions[editorName],true),
            BaseViewClass = Y.DataTable.EditorOptions[editorName].BaseViewClass,
            editorInstance;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 833);
if(column.editorConfig && Y.Lang.isObject(column.editorConfig)) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 834);
conf_obj = Y.merge(conf_obj, column.editorConfig);

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 836);
if(column.editorConfig.overlayConfig) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 837);
conf_obj.overlayConfig = Y.merge(conf_obj.overlayConfig || {}, column.editorConfig.overlayConfig);
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 840);
if(column.editorConfig.widgetConfig) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 841);
conf_obj.widgetConfig = Y.merge(conf_obj.widgetConfig || {}, column.editorConfig.widgetConfig);
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 844);
if(column.editorConfig.templateObject) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 845);
conf_obj.templateObject = Y.merge(conf_obj.templateObject || {}, column.editorConfig.templateObject);
            }
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 847);
conf_obj.name = editorName;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 850);
delete conf_obj.BaseViewClass;

        //
        //  We have a valid base class, instantiate it
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 855);
if(BaseViewClass){
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 856);
conf_obj.hostDT = this;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 857);
editorInstance = new BaseViewClass(conf_obj);

            // make the one of this editor's targets ...
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 860);
editorInstance.addTarget(this);
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 863);
return editorInstance;
    },

    /**
     * Loops through the column editor instances, destroying them and resetting the collection to null object
     * @method _destroyColumnEditors
     * @private
     */
    _destroyColumnEditors: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_destroyColumnEditors", 871);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 872);
if( !this._columnEditors && !this._commonEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 873);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 876);
var ces = this._getAllCellEditors();
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 877);
Y.Array.each(ces,function(ce){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 10)", 877);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 878);
if(ce && ce.destroy) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 879);
ce.destroy();
              //  ce.destroy({remove:true});
            }
        });

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 884);
this._commonEditors = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 885);
this._columnEditors = null;

        // remove editing class from all editable columns ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 888);
Y.Array.each( this.get('columns'), function(c){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 11)", 888);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 889);
if(c.editable === undefined || c.editable === true) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 890);
this._updateEditableColumnCSS(c.key || c.name,false);
            }
        },this);

    },

    /**
     * Utility method to combine "common" and "column-specific" cell editor instances and return them
     * @method _getAllCellEditors
     * @return {Array} Of cell editor instances used for the current DT column configurations
     * @private
     */
    _getAllCellEditors: function() {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_getAllCellEditors", 902);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 903);
var rtn = [];

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 905);
if( this._commonEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 906);
Y.Object.each(this._commonEditors,function(ce){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 12)", 906);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 907);
if(ce && ce instanceof Y.View){
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 908);
rtn.push(ce);
                }
            });
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 913);
if( this._columnEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 914);
Y.Object.each(this._columnEditors,function(ce){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 13)", 914);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 915);
if(ce && ce instanceof Y.View){
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 916);
rtn.push(ce);
                }
            });
        }
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 920);
return rtn;
    },

    /**
     * Closes the active cell editor when a document ESC key is detected
     * @method _onKeyEsc
     * @param e {EventFacade} key listener event facade
     * @private
     */
    _onKeyEsc:  function(e) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onKeyEsc", 929);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 930);
if(e.keyCode===27) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 931);
this.hideCellEditor();
        }
    },


    /**
     * Listener to the "sort" event, so we can hide any open editors and update the editable column CSS
     *  after the UI refreshes
     * @method _afterEditableSort
     * @private
     */
    _afterEditableSort: function() {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_afterEditableSort", 942);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 943);
if(this.get('editable')) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 944);
this.hideCellEditor();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 945);
this._updateAllEditableColumnsCSS();
        }
    },

    /**
     * Re-initializes the static props to null
     * @method _unsetEditor
     * @private
     */
    _unsetEditor: function(){
        // Finally, null out static props on this extension
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_unsetEditor", 954);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 956);
this._openEditor = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 957);
this._openRecord = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 958);
this._openColKey = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 959);
this._openCell = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 960);
this._openTd = null;
    },

    /**
     * Method to update all of the current TD's within the current DT to add/remove the editable CSS
     * @method _updateAllEditableColumnsCSS
     * @private
     */
    _updateAllEditableColumnsCSS : function() {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_updateAllEditableColumnsCSS", 968);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 969);
if(this.get('editable')) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 970);
var cols = this.get('columns'),
                ckey;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 972);
Y.Array.each(cols,function(col){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 14)", 972);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 973);
ckey = col.key || col.name;
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 974);
if(ckey) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 975);
this._updateEditableColumnCSS(ckey, true); //(flag) ? col.editable || true : false);
                }
            },this);
        }
    },

    /**
     * Method that adds/removes the CSS editable-column class from a DataTable column,
     * based upon the setting of the boolean "opt"
     *
     * @method _updateEditableColumnCSS
     * @param cname {String}  Column key or name to alter
     * @param opt {Boolean} True of False to indicate if the CSS class should be added or removed
     * @private
     */
    _updateEditableColumnCSS : function(cname,opt) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_updateEditableColumnCSS", 990);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 991);
var tbody = this.get('contentBox').one('tbody.'+this.getClassName('data')),
            col   = (cname) ? this.getColumn(cname) : null,
            colEditable = col && col.editable !== false,
            tdCol;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 995);
if(!cname || !col || !colEditable) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 996);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 999);
colEditable = ( col.editor || (this.get('defaultEditor')!==null
            && this.get('defaultEditor').search(/none/i)!==0) ) ? true : false;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1002);
if(!tbody || !colEditable) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1003);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1006);
tdCol = tbody.all('td.'+this.getClassName('col',cname));

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1008);
if(tdCol && opt===true) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1009);
tdCol.addClass(this._classColEditable);
        } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1010);
if (tdCol) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1011);
tdCol.removeClass(this._classColEditable);
        }}
    },

    /**
     * Listener to TD "click" events that hides a popup editor is not in the current cell
     * @method _handleCellClick
     * @param e
     * @private
     */
    _handleCellClick:  function(e){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_handleCellClick", 1021);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1022);
var td = e.currentTarget,
            cn = this.getColumnNameByTd(td);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1024);
if (cn && this._openEditor &&  this._openEditor.get('colKey')!==cn) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1025);
this.hideCellEditor();
        }
    },

    /**
     * Listener that fires on a scrollable DT scrollbar "scroll" event, and updates the current XY position
     *  of the currently open Editor.
     *
     * @method _onScrollUpdateCellEditor
     * @private
     */
    _onScrollUpdateCellEditor: function(e) {
        //
        //  Only go into this dark realm if we have a TD and an editor is open ...
        //
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onScrollUpdateCellEditor", 1036);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1040);
if(this.get('editable') && this.get('scrollable') && this._openEditor && this._openTd ) {

           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1042);
var tar    = e.target,
               tarcl  = tar.get('className') || '',
               tr1    = this.getRow(0),
               trh    = (tr1) ? +tr1.getComputedStyle('height').replace(/px/,'') : 0,
               tdxy   = (this._openTd) ? this._openTd.getXY() : null,
               xmin, xmax, ymin, ymax, hidef;

            //
            // For vertical scrolling - check vertical 'y' limits
            //
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1052);
if( tarcl.search(/-y-/) !==-1 ) {

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1054);
ymin = this._yScrollNode.getY() + trh - 5;
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1055);
ymax = ymin + (+this._yScrollNode.getComputedStyle('height').replace(/px/,'')) - 2*trh;

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1057);
if(tdxy[1] >= ymin && tdxy[1] <= ymax ) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1058);
if(this._openEditor.get('hidden')) {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1059);
this._openEditor.showEditor(this._openTd);
                    } else {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1061);
this._openEditor.set('xy', tdxy );
                    }
                } else {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1064);
hidef = true;
                }
            }

            //
            // For horizontal scrolling - check horizontal 'x' limits
            //
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1071);
if( tarcl.search(/-x-/) !==-1 ) {

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1073);
xmin = this._xScrollNode.getX();
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1074);
xmax = xmin + (+this._xScrollNode.getComputedStyle('width').replace(/px/,''));
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1075);
xmax -= +this._openTd.getComputedStyle('width').replace(/px/,'');

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1077);
if(tdxy[0] >= xmin && tdxy[0] <= xmax ) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1078);
if(this._openEditor.get('hidden')) {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1079);
this._openEditor.showEditor(this._openTd);
                    } else {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1081);
this._openEditor.set('xy', tdxy );
                    }
                } else {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1084);
hidef = true;
                }
            }

            // If hidef is true, editor is out of view, hide it temporarily
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1089);
if(hidef) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1090);
this._openEditor.hideEditor(true);
            }

        }
    },

    /**
     * Listens to changes to an Editor's "keyDir" event, which result from the user
     * pressing "ctrl-" arrow key while in an editor to navigate to an cell.
     *
     * The value of "keyDir" is an Array of two elements, in [row,col] format which indicates
     * the number of rows or columns to be changed to from the current TD location
     * (See the base method .getCell)
     *
     * @method _onKeyDirChange
     * @param e {EventFacade} The attribute change event facade for the View's 'keyDir' attribute
     * @private
     */
    _onKeyDirChange : function(e) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onKeyDirChange", 1108);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1109);
var dir     = e.newVal,
            recIndex = this.data.indexOf(this._openRecord),
            col      = this.getColumn(this._openColKey),
            colIndex = Y.Array.indexOf(this.get('columns'),col),
            oldTd    = this._openTd,
            newTd, ndir, circ;

       _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1116);
this.hideCellEditor();

       //TODO: Implement "circular" mode, maybe thru an attribute to wrap col/row navigation
       _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1119);
if(circ) {

           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1121);
if(dir[1] === 1 && colIndex === this.get('columns').length-1 ) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1122);
ndir = [0, -this.get('columns').length+1];
           } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1123);
if(dir[1] === -1 && colIndex === 0) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1124);
ndir = [0, this.get('columns').length-1];
           } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1125);
if(dir[0] === 1 && recIndex === this.data.size()-1 ) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1126);
ndir = [ -this.data.size()+1, 0];
           } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1127);
if(dir[0] === -1 && recIndex === 0) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1128);
ndir = [ this.data.size()-1, 0];
           }}}}

           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1131);
if(ndir) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1132);
dir = ndir;
           }

       }

       _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1137);
if(dir){
           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1138);
newTd = this.getCell(oldTd, dir);
           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1139);
if(newTd) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1140);
this.openCellEditor(newTd);
           }
       }
    },

    /**
     * Listener to the cell editor View's "editorCancel" event.  The editorCancel event
     * includes a return object with keys {td,cell,oldValue}
     *
     * @method _onCellEditorCancel
     * @param o {Object} Returned object from cell editor "editorCancel" event
     * @private
     */
    _onCellEditorCancel: function(o){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onCellEditorCancel", 1153);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1154);
if(o.cell && this._openRecord && this._openColKey) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1155);
var cell   = o.cell,
                colKey = cell.colKey || this._openColKey,
                record = this.data.getByClientId(cell.recClientId) || this._openRecord,
                ename  = this._openEditor.get('name');

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1160);
if(!this._openEditor.get('hidden')) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1161);
this.hideCellEditor();
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1164);
this.fire('cellEditorCancel',{
                td:         o.td,
                cell:       cell,
                record:     record,
                colKey:     colKey,
                prevVal:    o.oldValue,
                editorName: ename
            });
        }

    },

    /**
     * Fired when the open Cell Editor has sent an 'editorCancel' event, typically from
     * a user cancelling editing via ESC key or "Cancel Button"
     * @event cellEditorCancel
     * @param {Object} rtn Returned Object
     *  @param {Node} td The TD Node that was edited
     *  @param {Object} cell The cell object container for the edited cell
     *  @param {Model} record Model instance of the record data for the edited cell
     *  @param {String} colKey Column key (or name) of the edited cell
     *  @param {String|Number|Date} prevVal The old (last) value of the underlying data for the cell
     *  @param {String} editorName The name attribute of the editor that updated this cell
     */

    /**
     * Listener to the cell editor View's "editorSave" event, that when fired will
     * update the Model's data value for the approrpriate column.
     *
     * The editorSave event includes a return object with keys {td,cell,newValue,oldValue}
     *
     * Note:  If a "sync" layer DOES NOT exist (i.e. DataSource), implementers can listen for
     * the "saveCellEditing" event to send changes to a remote data store.
     *
     * @method _onCellEditorSave
     * @param o {Object} Returned object from cell editor "editorSave" event
     * @private
     */
    _onCellEditorSave: function(o){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onCellEditorSave", 1202);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1203);
if(o.cell && this._openRecord && this._openColKey) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1204);
var cell   = o.cell,
                colKey = cell.colKey || this._openColKey,
                record = this.data.getByClientId(cell.recClientId) || this._openRecord,
                ename  = this._openEditor.get('name');

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1209);
if(record){
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1210);
record.set(this._openColKey, o.newValue);
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1213);
this.hideCellEditor();

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1215);
this.fire('cellEditorSave',{
                td:         o.td,
                cell:       cell,
                record:     record,
                colKey:     colKey,
                newVal:     o.newValue,
                prevVal:    o.oldValue,
                editorName: ename
            });

        }

    }

    /**
     * Event fired after a Cell Editor has sent the 'editorSave' event closing an editing session.
     * The event signature includes pertinent data on the cell, TD, record and column that was
     * edited along with the prior and new values for the cell.
     * @event cellEditorSave
     * @param {Object} rtn Returned Object
     *  @param {Node} td The TD Node that was edited
     *  @param {Object} cell The cell object container for the edited cell
     *  @param {Model} record Model instance of the record data for the edited cell
     *  @param {String} colKey Column key (or name) of the edited cell
     *  @param {String|Number|Date} newVal The new (updated) value of the underlying data for the cell
     *  @param {String|Number|Date} prevVal The old (last) value of the underlying data for the cell
     *  @param {String} editorName The name attribute of the editor that updated this cell
     */

});

_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1246);
Y.DataTable.Editable = DtEditable;
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1247);
Y.Base.mix(Y.DataTable, [Y.DataTable.Editable]);

/**
 * This object is attached to the DataTable namespace to allow addition of "editors" in conjunction
 * with the Y.DataTable.Editable module.
 *
 * (See modules gallery-datatable-celleditor-popup and gallery-datatable-celleditor-inline for
 *  examples of the content of this object)
 *
 * @class Y.DataTable.EditorOptions
 * @extends Y.DataTable
 * @type {Object}
 * @since 3.8.0
 */
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1261);
Y.DataTable.EditorOptions = {};


}, '@VERSION@', {"supersedes": [""], "skinnable": "true", "requires": ["datatable-base", "datatype"], "optional": [""]});
