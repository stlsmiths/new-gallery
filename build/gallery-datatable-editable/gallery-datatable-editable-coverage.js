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
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].code=["YUI.add('gallery-datatable-editable', function (Y, NAME) {","","/**"," A DataTable class extension that configures a DT for \"editing\", current deployment supports cell editing"," (and planned near-term support for row editing).",""," This module is essentially a base wrapper-class to setup DT for editing with the appropriate attributes and"," listener creation / detachment.  The real guts of \"datatable-editing\" is in the View class definitions, within"," the gallery-datatable-celleditor-inline and gallery-datatable-celleditor-inline modules (and possibly future"," editor View class modules).",""," #### Functionality",""," The module is basically intended to keep track of the editing state (via [editable](#attr_editable) attribute) and"," housekeeping functions with regard to managing editor View instance creation, rendering and destruction.",""," By design this module attempts to group common editor View instances wherever possible.  So for a DT with 14 columns"," all set with \"inline\" View classes only 1 View instance is created."," <br/>Likewise if a DT uses 4 different \"calendar\" editor View types but each one as slightly different \"editorConfig\","," then this module creates 4 different calendar View instances to handle the different configurations.",""," Listeners are set for the \"celleditor:save\" event and saved to the active \"data\" setting within this module.",""," Additional capability is provided for cell editing situations to add CSS classes to TD's which are added to \"editable\""," columns (e.g. cursor) to indicate they are \"clickable\".",""," This module works sortable, scrollable (y-scrolling currently) to make changes to the client-side of the DT model"," (remote updates should be provided via ModelList sync or user-defined listeners.)","",""," #### Attributes",""," Presently three attributes are provided;"," [editable](#attr_editable), [editOpenType](#attr_editOpenType) and [defaultEditor](#attr_defaultEditor).",""," The primary ATTR is the [editable](#attr_editable), which is used to toggle on/off the editing state of the DT"," instance.",""," The [defaultEditor](#attr_defaultEditor) attribute is used to setup a cell editor View instance to be used on all editable columns"," that don't already have an editor assigned.",""," ##### Column Properties",""," In addition to a few new attributes the module also recognizes some new column properties in order to support"," cell-editing in particular;"," <table>"," <tr><th>editable</th><td>{Boolean}</td><td>Flag to indicate if column is editable (set `editable:false` to exclude an"," individual column)</td></tr>"," <tr><th>editor</th><td>{String}</td><td>Name of the defined Y.DataTable.EditorOptions View configuration for this column.</td></tr>"," <tr><th>editorConfig</th><td>{Object}</td><td>Passed to the View editor class when instantiated, and Y.merge'ed in to become View class"," attributes.</td></tr>"," </table>",""," When this module is loaded and the \"editable:true\" attribute is set, it attempts to economize on the \"instantiation cost\""," of creating View instances by identifying only editor Views that are required based upon column definitions and/or the"," defaultEditor attribute. (e.g. if all columns are \"text\" editors, only one \"text\" editor View is instantiated)",""," ##### ... More Info",""," The module fires the event [celleditor:save](#event_celleditor:save), which can be listened for to provide updating"," of remote data back to a server (assuming a ModelList \"sync\" layer is NOT used).  Haven't provided the equivalent to"," YUI 2.x's \"asyncSubmitter\" because I think this event could easily be listened to in order to provide follow-on"," updating to remote data stores.",""," A new class Object (Y.DataTable.EditorOptions) is added to the DataTable namespace that serves as the"," datastore of the editor View configuration properties.  Each \"key\" (object property) within this object"," is an entrypoint to a specific editor configuration, which are defined in the separate View class extensions (presently"," gallery-datatable-celleditor-inline and gallery-datatable-celleditor-popup. Please see those for specifics.)",""," ###### KNOWN ISSUES:","   <ul>","   <li>Works minimally with \"y\" scrolling, \"x\" scrolling still needs work.</li>","   <li>Initial editor invocation is limited to \"mouse\" actions on TD only (although keyboard navigation cell-to-cell is available).</li>","   <li>An issue arises on \"datatable.destroy()\" in Chrome from time to time when using inline editors, still investigating why.</li>","   </ul>",""," ###### FUTURE:"," This module will be amended to add support for \"row\" editing, if required.",""," @module gallery-datatable-editable"," @class Y.DataTable.Editable"," @extends Y.DataTable"," @author Todd Smith"," @since 3.8.0"," **/","DtEditable = function(){};","","// Define new attributes to support editing","DtEditable.ATTRS = {","","    /**","     * A boolean flag that sets the DataTable state to allow editing (either inline or popup cell editing).","     * (Future may support row editing also)","     *","     * @attribute editable","     * @type boolean","     * @default false","     */","    editable: {","        valueFn:    function(){ return false;},","        setter:     '_setEditable',","        validator:  Y.Lang.isBoolean","    },","","    /**","     * Defines the cell editing event type on the TD that initiates the editor, used to","     * specify the listener that invokes an editor.","     *","     * Note: IMHO The only sensible options are 'click' or 'dblclick'","     *","     * @attribute editOpenType","     * @type string","     * @default 'dblclick'","     */","    editOpenType: {","        value:      'dblclick',","        setter:     '_setEditOpenType',","        validator:  Y.Lang.isString","    },","","    /**","     * Specifies a default editor name to respond to an editing event defined in [_editOpenType](#attr_editOpenType)","     * attribute.  The default editor is used if the DataTable is in editing mode (i.e. \"editable:true\") and if","     * the column DOES NOT include a property editable:false in its definitions.","     *","     * Cell editors are typically assigned by setting a column property (i.e. editor:'text' or 'date') on each","     * individual column.","     *","     * This attribute can be used to set a single editor to work on every column without having to define it on each","     * column.","     *","     * @attribute defaultEditor","     * @type string","     * @default 'none'","     */","    defaultEditor : {","        value:      'none',","        setter:     '_setDefaultEditor',","        validator:  function(v){ return Y.Lang.isString(v) || v === null; }","    }","};","","// Add static props and public/private methods to be added to DataTable","Y.mix( DtEditable.prototype, {","","// -------------------------- Placeholder Private Properties  -----------------------------","","    /**","     Holds the View instance of the active cell editor currently displayed","     @property _openEditor","     @type Y.View","     @default null","     @private","     @static","     **/","    _openEditor:        null,","","    /**","     Holds the current record (i.e. a Model class) of the TD being edited","     (Note: this may not always work, better to use \"clientId\" of the record, i.e. sorting, etc..)","     @property _openRecord","     @type Model","     @default null","     @private","     @static","     **/","    _openRecord:        null,","","    /**","     Holds the column key (or name) of the TD cell being edited","     @property _openColKey","     @type String","     @default null","     @private","     @static","     **/","    _openColKey:        null,","","    /**","     Holds the TD Node currently being edited","     @property _openTd","     @type Node","     @default null","     @private","     @static","     **/","    _openTd:            null,","","    /**","     Holds the cell data for the actively edited TD, a complex object including the","     following;  {td, value, recClientId, colKey}","     @property _openCell","     @type Object","     @default null","     @private","     @static","     **/","    _openCell:          null,","","// -------------------------- Subscriber handles  -----------------------------","","    /**","     Placeholder for the DT level event listener for \"editableChange\" attribute.","     @property _subscrEditable","     @type EventHandle","     @default null","     @private","     @static","     **/","    _subscrEditable:     null,","","    /**","     Placeholder Array for TD editor invocation event handles (i.e. click or dblclick) that","     are set on the TBODY to initiate cellEditing.","     @property _subscrCellEditors","     @type Array of EventHandles","     @default null","     @private","     @static","     **/","    _subscrCellEditors:    null,","","    /**","     Placeholder for event handles for scrollable DT that listens to \"scroll\" events and repositions editor","     (we need two listeners, one for each of X or Y scroller)","     @property _subscrCellEditorScrolls","     @type Array of EventHandles","     @default null","     @private","     @static","     **/","    _subscrCellEditorScrolls: null,","","    /**","     Shortcut to the CSS class that is added to indicate a column is editable","     @property _classColEditable","     @type String","     @default 'yui3-datatable-col-editable'","     @private","     @static","     **/","    _classColEditable:  null,","","    /**","     Placeholder hash that stores the \"common\" editors, i.e. standard editor names that occur","     within Y.DataTable.EditorOptions and are used in this DT.","","     This object holds the View instances, keyed by the editor \"name\" for quick hash reference.","     The object is populated in method [_buildColumnEditors](#method__buildColumnEditors).","","     @property _commonEditors","     @type Object","     @default null","     @private","     @static","     **/","    _commonEditors:  null,","","    /**","     Placeholder hash that stores cell editors keyed by column key (or column name) where the value","     for the associated key is either a (a) {String} which references an editor name in the [_commonEditors](#property__commonEditors)","     hash or (b) {View} instance for a customized editor View instance (typically one with specified \"editorConfig\" in the","     column definition).","","     The object is populated in method [_buildColumnEditors](#method__buildColumnEditors).","","     @property _columnEditors","     @type Object","     @default null","     @private","     @static","     **/","    _columnEditors: null,","","    // future","    //_editableType:      null,   //  'cell', 'row', 'inline?'","","//==========================  LIFECYCLE METHODS  =============================","","    /**","     * Initializer that sets up listeners for \"editable\" state and sets some CSS names","     * @method initializer","     * @protected","     */","    initializer: function(){","","     //   if(this.get('editable')===true) {","     //       this._setEditableMode(true);","     //   }","     console.log('it is this');","        this._classColEditable = this.getClassName('col','editable');","","        this._bindEditable();","","        return this;","    },","","    /**","     * Cleans up ALL of the DT listeners and the editor View instances and generated private props","     * @method destructor","     * @protected","     */","    destructor:function() {","        // detach the \"editableChange\" listener on the DT","        this.set('editable',false);","        this._unbindEditable();","    },","","","    /**","     * Sets up listeners for the DT editable module,","     * @method _bindEditable","     * @private","     */","    _bindEditable: function(){","","        Y.Do.after(this._updateAllEditableColumnsCSS,this,'syncUI');","","        this.after('sort', this._afterEditableSort);","    },","","    /**","     * Unbinds ALL of the popup editor listeners and removes column editors.","     * This should only be used when the DT is destroyed","     * @method _unbindEditable","     * @private","     */","    _unbindEditable: function() {","","        // destroy any currently open editor","        if(this._openEditor && this._openEditor.destroy) {","            this._openEditor.destroy();","            //this._openEditor.destroy({remove:true});","        }","","        if(this._subscrCellEditorScrolls && Y.Lang.isArray(this._subscrCellEditorScrolls) ) {","            Y.Array.each(this._subscrCellEditorScroll, function(dh){","                if(dh && dh.detach) {","                    dh.detach();","                }","            });","            this._subscrCellEditorScrolls = [];","        }","","        this._unsetEditor();","","        // run through all instantiated editors and destroy them","        this._destroyColumnEditors();","","    },","","    /**","     * Binds listeners to cell TD \"open editing\" events (i.e. either click or dblclick)","     * as a result of DataTable setting \"editable:true\".","     *","     * Also sets a body listener for ESC key, to close the current open editor.","     *","     * @method _bindCellEditingListeners","     * @private","     */","    _bindCellEditingListeners: function(){","","        // clear up previous listeners, if any ...","        if(this._subscrCellEditors) {","            this._unbindCellEditingListeners();","        }","","        // create listeners","        this._subscrCellEditors = [];","        this._subscrCellEditors.push(","            this.delegate( this.get('editOpenType'), this.openCellEditor,\"tbody.\" + this.getClassName('data') + \" td\",this)","        );","","        // Add a ESC key listener on the body (hate doing this!) to close editor if open ...","        this._subscrCellEditors.push( Y.one('body').after('keydown', this._onKeyEsc,this ) );","","        // Add listeners to all 'celleditors'","        this.on('celleditor:save',this._onCellEditorSave);","        this.after('celleditor:save',this._afterCellEditorSave);","        this.on('celleditor:cancel',this._onCellEditorCancel);","        this.after('celleditor:cancel',this._afterCellEditorCancel);","        this.after('celleditor:keyDirChange',this._afterKeyDirChange);","","    },","","    /**","     * Unbinds the TD click delegated click listeners for initiating editing in TDs","     * @method _unbindCellEditingListeners","     * @private","     */","    _unbindCellEditingListeners: function(){","","        if(!this._subscrCellEditors) {","            return;","        }","","        // this._subscrCellEditors","        if (this._subscrCellEditors) {","            Y.Array.each(this._subscrCellEditors,function(e){","                if(e && e.detach) {","                    e.detach();","                }","            });","        }","","        this._subscrCellEditors = null;","","        this.detach('celleditor:*');","","    },","","    /**","     * Sets up listeners for DT scrollable \"scroll\" events","     * @method _bindEditorScroll","     * @private","     */","    _bindEditorScroll: function() {","        this._subscrCellEditorScrolls = [];","        if(this._xScroll && this._xScrollNode) {","            this._subscrCellEditorScrolls.push( this._xScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );","        }","        if(this._yScroll && this._yScrollNode) {","            this._subscrCellEditorScrolls.push( this._yScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );","        }","","    },","","","//==========================  PUBLIC METHODS  =============================","","    /**","     * Opens the given TD eventfacade or Node with it's assigned cell editor.","     *","     * @method openCellEditor","     * @param e {EventFacade|Node} Passed in object from an event OR a TD Node istance","     * @public","     */","    openCellEditor: function(e) {","        var td       = e.currentTarget || e,","            col      = this.getColumnByTd(td),","            colKey   = col.key || col.name,","            editorRef = (colKey) ? this._columnEditors[colKey] : null,","            editorInstance = (editorRef && Y.Lang.isString(editorRef) ) ? this._commonEditors[editorRef] : editorRef;","","        if(!td) {","            return;","        }","","        // First time in,","        if( (this._yScroll || this._xScroll) && !this._subscrCellEditorScroll) {","            this._bindEditorScroll();","        }","","        //","        // Bailout if column is null, has editable:false or no editor assigned ...","        //","        if(col && col.editable === false && !editorInstance) {","            return;","        }","","        // Hide any editor that may currently be open ... unless it is the currently visible one","        if(this._openEditor) {","            if ( this._openEditor === editorInstance ) {","                this._openEditor.hideEditor();","            } else {","                this.hideCellEditor();","            }","        }","","        //","        //  If the editorInstance exists, populate it and show it","        //","        //TODO:  fix this to rebuild new editors if user changes a column definition on the fly","        //","        if(editorInstance) {","","            //","            //  Set private props to the open TD we are editing, the editor instance, record and column name","            //","            this._openTd     = td;                      // store the TD","            this._openEditor = editorInstance;          // placeholder to the open Editor View instance","            this._openRecord = this.getRecord(td);      // placeholder to the editing Record","            this._openColKey = colKey;                  // the column key (or name)","","            this._openCell   = {","                td:             td,","                value:          this._openRecord.get(colKey),","                recClientId:    this._openRecord.get('clientId'),","                colKey:         colKey","            };","","            // Define listeners onto this open editor ...","            //this._bindOpenEditor( this._openEditor );","","            //","            //  Set the editor Attributes and render it ... (display it!)","            //","            this._openEditor.setAttrs({","       //         hostDT: this,","                cell:   this._openCell,","                value:  this._openRecord.get(colKey)","            });","","            this._openEditor.showEditor(td);","","        }","","    },","","","    /**","     * Cleans up a currently open cell editor View and unbinds any listeners that this DT had","     * set on the View.","     * @method hideCellEditor","     * @public","     */","    hideCellEditor: function(){","        if(this._openEditor) {","            this._openEditor.hideEditor();","            this._unsetEditor();","        }","    },","","    /**","     * Utility method that scans through all editor instances and hides them","     * @method hideAllCellEditors","     * @private","     */","    hideAllCellEditors: function(){","        this.hideCellEditor();","        var ces = this._getAllCellEditors();","        Y.Array.each( ces, function(editor){","            if(editor && editor.hideEditor) {","                editor.hideEditor();","            }","        });","    },","","    /**","     * Over-rideable method that can be used to do other user bindings ?","     *   (like hideEditor on mouseout, etc...)","     * @method bindEditorListeners","     * @public","     */","    bindEditorListeners: function(){","        return;","    },","","    /**","     * Returns all cell editor View instances for the editable columns of the current DT instance","     * @method getCellEditors","     * @return editors {Array} Array containing an Object as {columnKey, cellEditor, cellEditorName}","     */","    getCellEditors: function(){","        var rtn = [], ed;","        Y.Object.each(this._columnEditors,function(v,k){","            ed = (Y.Lang.isString(v)) ? this._commonEditors[v] : v;","            rtn.push({","                columnKey:      k,","                cellEditor:     ed,","                cellEditorName: ed.get('name')","            });","        },this);","        return rtn;","    },","","    /**","     * Returns the Column object (from the original \"columns\") associated with the input TD Node.","     * @method getColumnByTd","     * @param {Node} cell Node of TD for which column object is desired","     * @return {Object} column The column object entry associated with the desired cell","     * @public","     */","    getColumnByTd:  function(cell){","        var colName = this.getColumnNameByTd(cell);","        return (colName) ? this.getColumn(colName) : null;","    },","","","    /**","     * Returns the column \"key\" or \"name\" string for the requested TD Node","     * @method getColumnNameByTd","     * @param {Node} cell Node of TD for which column name is desired","     * @return {String} colName Column name or key name","     * @public","     */","    getColumnNameByTd: function(cell){","        var classes = cell.get('className').split(\" \"),","            regCol  = new RegExp( this.getClassName('col') + '-(.*)'),","            colName;","","        Y.Array.some(classes,function(item){","            var colmatch =  item.match(regCol);","            if ( colmatch && Y.Lang.isArray(colmatch) && colmatch[1] ) {","                colName = colmatch[1];","                return true;","            }","        });","","        return colName || null;","    },","","","//==========================  PRIVATE METHODS  =============================","","    /**","     * Setter method for the [editable](#attr_editable) attribute for this DT","     * @method _setEditable","     * @param v {Boolean} Flag to enable/disable editing mode for this DT instance","     * @private","     */","    _setEditable: function(v){","        if( v ) {","            // call overrideable method .... simple return by default","            this.bindEditorListeners();","            this._bindCellEditingListeners();","            this._buildColumnEditors();","","        } else  {","            //if(this.get('editable')===true) {","                this._unbindCellEditingListeners();","                this._destroyColumnEditors();","            //}","        }","","    },","","    /**","     * Setter method for the [defaultEditor](#attr_defaultEditor) attribute for this DT","     * If the default editor is changed to a valid setting, we disable and re-enable","     * editing on the DT to reset the column editors.","     *","     * @method _setDefaultEditor","     * @param v {String|Null} Value to use for this attribute","     * @private","     */","    _setDefaultEditor: function(v) {","      //  if ( (v && Y.DataTable.EditorOptions[v]) || v === null) {","        if ( v  || v === null ) {","            if(this.get('editable')) {","                this.set('editable',false);","                this._set('defaultEditor',v);","                this.set('editable',true);","            }","        }","    },","","    /**","     * Setter method for the [editOpenType](#attr_editOpenType) attribute, specifies what","     * TD event to listen to for initiating editing.","     * @method _setEditOpenType","     * @param v {String}","     * @private","     */","    _setEditOpenType: function(v) {","        if(this._subscrCellEditors && this._subscrCellEditors[0] && this._subscrCellEditors[0].detach) {","            this.hideAllCellEditors();","            this._subscrCellEditors[0].detach();","            this._subscrCellEditors[0] = this.delegate( v, this.openCellEditor,\"tbody.\" + this.getClassName('data') + \" td\",this);","        }","    },","","    /**","     * Pre-scans the DT columns looking for column named editors and collects unique editors,","     * instantiates them, and adds them to the  _columnEditors array.  This method only creates","     * View instances that are required, through combination of _commonEditors and _columnEditors","     * properties.","     *","     * @method _buildColumnEditors","     * @private","     */","    _buildColumnEditors: function(){","        var cols     = this.get('columns'),","            defEditr = this.get('defaultEditor'),","            edName, colKey, editorInstance;","","        if( !Y.DataTable.EditorOptions ) {","            return;","        }","","        if( this._columnEditors || this._commonEditors ) {","            this._destroyColumnEditors();","        }","","        this._commonEditors = {};","        this._columnEditors = {};","","        //","        //  Set the default editor, if one is defined","        //","        defEditr = (defEditr && defEditr.search(/none|null/i) !==0 ) ? defEditr : null;","","        //","        //  Loop over all DT columns ....","        //","        Y.Array.each(cols,function(c){","            if(!c) {","                return;","            }","","            colKey = c.key || c.name;","","            // An editor was defined (in column) and doesn't yet exist ...","            if(colKey && c.editable !== false) {","","                edName = c.editor || defEditr;","","                // This is an editable column, update the TD's for the editable column","                this._updateEditableColumnCSS(colKey,true);","","                //this._editorColHash[colKey] = edName;","","                //","                // If an editor is named, check if its definition exists, and that it is","                // not already instantiated.   If not, create it ...","                //","","                // check for common editor ....","                if (edName && Y.DataTable.EditorOptions[edName]) {","","                    if(c.editorConfig && Y.Lang.isObject(c.editorConfig) ) {","","                        editorInstance = this._createCellEditorInstance(edName,c);","","                        this._columnEditors[colKey] = editorInstance || null;","","                    } else {","","                        if( !this._commonEditors[edName] ) {","                            editorInstance = this._createCellEditorInstance(edName,c);","                            this._commonEditors[edName] = editorInstance;","                        }","","                        this._columnEditors[colKey] = edName;","","                    }","","                }","","            }","        },this);","","    },","","    /**","     * This method takes the given editorName (i.e. 'textarea') and if the default editor","     * configuration, adds in any column 'editorConfig' and creates the corresponding","     * cell editor View instance.","     *","     * Makes shallow copies of editorConfig: { overlayConfig, widgetConfig, templateObject }","     *","     * @method _createCellEditorInstance","     * @param editorName {String} Editor name","     * @param column {Object} Column object","     * @return editorInstance {View} A newly created editor instance for the supplied editorname and column definitions","     * @private","     */","    _createCellEditorInstance: function(editorName, column) {","        var conf_obj      = Y.clone(Y.DataTable.EditorOptions[editorName],true),","            BaseViewClass = Y.DataTable.EditorOptions[editorName].BaseViewClass,","            editorInstance;","","        if(column.editorConfig && Y.Lang.isObject(column.editorConfig)) {","            conf_obj = Y.merge(conf_obj, column.editorConfig);","","            if(column.editorConfig.overlayConfig) {","                conf_obj.overlayConfig = Y.merge(conf_obj.overlayConfig || {}, column.editorConfig.overlayConfig);","            }","","            if(column.editorConfig.widgetConfig) {","                conf_obj.widgetConfig = Y.merge(conf_obj.widgetConfig || {}, column.editorConfig.widgetConfig);","            }","","            if(column.editorConfig.templateObject) {","                conf_obj.templateObject = Y.merge(conf_obj.templateObject || {}, column.editorConfig.templateObject);","            }","            conf_obj.name = editorName;","        }","","        delete conf_obj.BaseViewClass;","","        //","        //  We have a valid base class, instantiate it","        //","        if(BaseViewClass){","            conf_obj.hostDT = this;","            editorInstance = new BaseViewClass(conf_obj);","","            // make the one of this editor's targets ...","            editorInstance.addTarget(this);","        }","","        return editorInstance;","    },","","    /**","     * Loops through the column editor instances, destroying them and resetting the collection to null object","     * @method _destroyColumnEditors","     * @private","     */","    _destroyColumnEditors: function(){","        if( !this._columnEditors && !this._commonEditors ) {","            return;","        }","","        var ces = this._getAllCellEditors();","        Y.Array.each(ces,function(ce){","            if(ce && ce.destroy) {","                ce.destroy();","              //  ce.destroy({remove:true});","            }","        });","","        this._commonEditors = null;","        this._columnEditors = null;","","        // remove editing class from all editable columns ...","        Y.Array.each( this.get('columns'), function(c){","            if(c.editable === undefined || c.editable === true) {","                this._updateEditableColumnCSS(c.key || c.name,false);","            }","        },this);","","    },","","    /**","     * Utility method to combine \"common\" and \"column-specific\" cell editor instances and return them","     * @method _getAllCellEditors","     * @return {Array} Of cell editor instances used for the current DT column configurations","     * @private","     */","    _getAllCellEditors: function() {","        var rtn = [];","","        if( this._commonEditors ) {","            Y.Object.each(this._commonEditors,function(ce){","                if(ce && ce instanceof Y.View){","                    rtn.push(ce);","                }","            });","        }","","        if( this._columnEditors ) {","            Y.Object.each(this._columnEditors,function(ce){","                if(ce && ce instanceof Y.View){","                    rtn.push(ce);","                }","            });","        }","        return rtn;","    },","","    /**","     * Closes the active cell editor when a document ESC key is detected","     * @method _onKeyEsc","     * @param e {EventFacade} key listener event facade","     * @private","     */","    _onKeyEsc:  function(e) {","        if(e.keyCode===27) {","            this.hideCellEditor();","        }","    },","","","    /**","     * Listener to the \"sort\" event, so we can hide any open editors and update the editable column CSS","     *  after the UI refreshes","     * @method _afterEditableSort","     * @private","     */","    _afterEditableSort: function() {","        if(this.get('editable')) {","            this.hideCellEditor();","            this._updateAllEditableColumnsCSS();","        }","    },","","    /**","     * Re-initializes the static props to null","     * @method _unsetEditor","     * @private","     */","    _unsetEditor: function(){","        // Finally, null out static props on this extension","        //this._openEditor = null;","        this._openRecord = null;","        this._openColKey = null;","        this._openCell = null;","        this._openTd = null;","    },","","    /**","     * Method to update all of the current TD's within the current DT to add/remove the editable CSS","     * @method _updateAllEditableColumnsCSS","     * @private","     */","    _updateAllEditableColumnsCSS : function() {","        if(this.get('editable')) {","            var cols = this.get('columns'),","                ckey;","            Y.Array.each(cols,function(col){","                ckey = col.key || col.name;","                if(ckey) {","                    this._updateEditableColumnCSS(ckey, true); //(flag) ? col.editable || true : false);","                }","            },this);","        }","    },","","    /**","     * Method that adds/removes the CSS editable-column class from a DataTable column,","     * based upon the setting of the boolean \"opt\"","     *","     * @method _updateEditableColumnCSS","     * @param cname {String}  Column key or name to alter","     * @param opt {Boolean} True of False to indicate if the CSS class should be added or removed","     * @private","     */","    _updateEditableColumnCSS : function(cname,opt) {","        var tbody = this.get('contentBox').one('tbody.'+this.getClassName('data')),","            col   = (cname) ? this.getColumn(cname) : null,","            colEditable = col && col.editable !== false,","            tdCol;","        if(!cname || !col) {","            return;","        }","","        colEditable = (colEditable && col.editor || (this.get('defaultEditor')!==null","            && this.get('defaultEditor').search(/none/i)!==0) ) ? true : false;","","        if(!tbody || !colEditable) {","            return;","        }","","        tdCol = tbody.all('td.'+this.getClassName('col',cname));","","        if(tdCol && opt===true) {","            tdCol.addClass(this._classColEditable);","        } else if (tdCol) {","            tdCol.removeClass(this._classColEditable);","        }","    },","","    /**","     * Listener to TD \"click\" events that hides a popup editor is not in the current cell","     * @method _handleCellClick","     * @param e","     * @private","     */","    _handleCellClick:  function(e){","        var td = e.currentTarget,","            cn = this.getColumnNameByTd(td);","        if (cn && this._openEditor &&  this._openEditor.get('colKey')!==cn) {","            this.hideCellEditor();","        }","    },","","    /**","     * Listener that fires on a scrollable DT scrollbar \"scroll\" event, and updates the current XY position","     *  of the currently open Editor.","     *","     * @method _onScrollUpdateCellEditor","     * @private","     */","    _onScrollUpdateCellEditor: function(e) {","        //","        //  Only go into this dark realm if we have a TD and an editor is open ...","        //","        if(this.get('editable') && this.get('scrollable') && this._openEditor && this._openTd ) {","","           var tar    = e.target,","               tarcl  = tar.get('className') || '',","               tr1    = this.getRow(0),","               trh    = (tr1) ? +tr1.getComputedStyle('height').replace(/px/,'') : 0,","               tdxy   = (this._openTd) ? this._openTd.getXY() : null,","               xmin, xmax, ymin, ymax, hidef;","","            //","            // For vertical scrolling - check vertical 'y' limits","            //","            if( tarcl.search(/-y-/) !==-1 ) {","","                ymin = this._yScrollNode.getY() + trh - 5;","                ymax = ymin + (+this._yScrollNode.getComputedStyle('height').replace(/px/,'')) - 2*trh;","","                if(tdxy[1] >= ymin && tdxy[1] <= ymax ) {","                    if(this._openEditor.get('hidden')) {","                        this._openEditor.showEditor(this._openTd);","                    } else {","                        this._openEditor.set('xy', tdxy );","                    }","                } else {","                    hidef = true;","                }","            }","","            //","            // For horizontal scrolling - check horizontal 'x' limits","            //","            if( tarcl.search(/-x-/) !==-1 ) {","","                xmin = this._xScrollNode.getX();","                xmax = xmin + (+this._xScrollNode.getComputedStyle('width').replace(/px/,''));","                xmax -= +this._openTd.getComputedStyle('width').replace(/px/,'');","","                if(tdxy[0] >= xmin && tdxy[0] <= xmax ) {","                    if(this._openEditor.get('hidden')) {","                        this._openEditor.showEditor(this._openTd);","                    } else {","                        this._openEditor.set('xy', tdxy );","                    }","                } else {","                    hidef = true;","                }","            }","","            // If hidef is true, editor is out of view, hide it temporarily","            if(hidef) {","                this._openEditor.hideEditor(true);","            }","","        }","    },","","    /**","     * Listens to changes to an Editor's \"keyDir\" event, which result from the user","     * pressing \"ctrl-\" arrow key while in an editor to navigate to an cell.","     *","     * The value of \"keyDir\" is an Array of two elements, in [row,col] format which indicates","     * the number of rows or columns to be changed to from the current TD location","     * (See the base method .getCell)","     *","     * @method _afterKeyDirChange","     * @param e {EventFacade} The attribute change event facade for the View's 'keyDir' attribute","     * @private","     */","    _afterKeyDirChange : function(e) {","        var dir     = e.newVal,","            recIndex = this.data.indexOf(this._openRecord),","            col      = this.getColumn(this._openColKey),","            colIndex = Y.Array.indexOf(this.get('columns'),col),","            oldTd    = this._openTd,","            newTd, ndir, circ;","","       this.hideCellEditor();","","       //TODO: Implement \"circular\" mode, maybe thru an attribute to wrap col/row navigation","       if(circ) {","","           if(dir[1] === 1 && colIndex === this.get('columns').length-1 ) {","               ndir = [0, -this.get('columns').length+1];","           } else if(dir[1] === -1 && colIndex === 0) {","               ndir = [0, this.get('columns').length-1];","           } else if(dir[0] === 1 && recIndex === this.data.size()-1 ) {","               ndir = [ -this.data.size()+1, 0];","           } else if(dir[0] === -1 && recIndex === 0) {","               ndir = [ this.data.size()-1, 0];","           }","","           if(ndir) {","               dir = ndir;","           }","","       }","","       if(dir){","           newTd = this.getCell(oldTd, dir);","           if(newTd) {","               this.openCellEditor(newTd);","           }","       }","    },","","    /**","     * Listener to the cell editor View's `cancel` event.  The cancel event","     * includes a return object with keys {td,cell,oldValue}.","     * This method fills it up with extra information.","     *","     * @method _onCellEditorCancel","     * @param ev {Event Facade} As provided by the celleditor:cancel event","     * @private","     */","    _onCellEditorCancel: function(ev){","        var cell   = ev.cell;","        if(cell && this._openRecord && this._openColKey) {","","            ev.record = this.data.getByClientId(cell.recClientId) || this._openRecord;","            ev.colKey = cell.colKey || this._openColKey;","            ev.editorName = this._openEditor.get('name');","        } else {","            ev.halt();","        }","","    },","    /**","     * After listener for the cell editor `cancel` event. If no other listener","     * has halted the event, this method will finally hide the editor.","     * @method _afterCellEditorCancel","     * @private","     */","    _afterCellEditorCancel: function(){","        if(!this._openEditor.get('hidden')) {","            this.hideCellEditor();","        }","    },","","    /**","     * Fired when the open Cell Editor has sent an 'editorCancel' event, typically from","     * a user cancelling editing via ESC key or \"Cancel Button\"","     * @event celleditor:cancel","     * @param ev {Event Facade} Event facade, including:","     *  @param ev.td {Node} The TD Node that was edited","     *  @param ev.cell {Object} The cell object container for the edited cell","     *  @param ev.record {Model} Model instance of the record data for the edited cell","     *  @param ev.colKey {String} Column key (or name) of the edited cell","     *  @param ev.newVal {String|Number|Date} The old (last) value of the underlying data for the cell","     *  @param ev.editorName {String} The name attribute of the editor that updated this cell","     */","","    /**","     * Listener to the cell editor View's \"save\" event, that when fired will","     * update the Model's data value for the approrpriate column.","     *","     * The editorSave event includes a return object with keys {td,cell,newValue,oldValue}.","     *","     * It fills the event facade for the event with extra information.","     *","     * Note:  If a \"sync\" layer DOES NOT exist (i.e. DataSource), implementers can listen for","     * the \"saveCellEditing\" event to send changes to a remote data store.","     *","     * @method _onCellEditorSave","     * @param ev {Event Facade} As provided by the cell editor \"save\" event","     * @private","     */","    _onCellEditorSave: function (ev) {","        var cell   = ev.cell;","        if(cell && this._openRecord && this._openColKey) {","","            ev.cell = cell;","            ev.record = this.data.getByClientId(cell.recClientId) || this._openRecord;","            ev.colKey = cell.colKey || this._openColKey;","            ev.editorName = this._openEditor.get('name');","        } else {","            ev.halt();","        }","","    },","    /**","     * After listener for the cell editor `save` event. If no other listener","     * has halted the event, this method will finally save the new value","     * and hide the editor.","     * @method _afterCellEditorSave","     * @private","     */","    _afterCellEditorSave: function (ev) {","        if(ev.record){","            ev.record.set(ev.colKey, ev.newValue);","        }","","        this.hideCellEditor();","    }","","    /**","     * Event fired after a Cell Editor has sent the 'save' event closing an editing session.","     * @event celleditor:save","     * @param ev {Event Facade} including:","     *  @param ev.td {Node} The TD Node that was edited","     *  @param ev.cell {Object} The cell object container for the edited cell","     *  @param ev.record {Model} Model instance of the record data for the edited cell","     *  @param ev.colKey {String} Column key (or name) of the edited cell","     *  @param ev.newVal {String|Number|Date} The new (updated) value of the underlying data for the cell","     *  @param ev.prevVal {String|Number|Date} The old (last) value of the underlying data for the cell","     *  @param ev.editorName {String} The name attribute of the editor that updated this cell","     */","","});","","Y.DataTable.Editable = DtEditable;","Y.Base.mix(Y.DataTable, [Y.DataTable.Editable]);","","/**"," * This object is attached to the DataTable namespace to allow addition of \"editors\" in conjunction"," * with the Y.DataTable.Editable module."," *"," * (See modules gallery-datatable-celleditor-popup and gallery-datatable-celleditor-inline for"," *  examples of the content of this object)"," *"," * @class Y.DataTable.EditorOptions"," * @extends Y.DataTable"," * @type {Object}"," * @since 3.8.0"," */","Y.DataTable.EditorOptions = {};","","","}, '@VERSION@', {\"supersedes\": [\"\"], \"skinnable\": \"true\", \"requires\": [\"datatable-base\", \"datatype\"], \"optional\": [\"\"]});"];
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].lines = {"1":0,"86":0,"89":0,"100":0,"139":0,"144":0,"290":0,"291":0,"293":0,"295":0,"305":0,"306":0,"317":0,"319":0,"331":0,"332":0,"336":0,"337":0,"338":0,"339":0,"342":0,"345":0,"348":0,"364":0,"365":0,"369":0,"370":0,"375":0,"378":0,"379":0,"380":0,"381":0,"382":0,"393":0,"394":0,"398":0,"399":0,"400":0,"401":0,"406":0,"408":0,"418":0,"419":0,"420":0,"422":0,"423":0,"439":0,"445":0,"446":0,"450":0,"451":0,"457":0,"458":0,"462":0,"463":0,"464":0,"466":0,"475":0,"480":0,"481":0,"482":0,"483":0,"485":0,"498":0,"504":0,"518":0,"519":0,"520":0,"530":0,"531":0,"532":0,"533":0,"534":0,"546":0,"555":0,"556":0,"557":0,"558":0,"564":0,"575":0,"576":0,"588":0,"592":0,"593":0,"594":0,"595":0,"596":0,"600":0,"613":0,"615":0,"616":0,"617":0,"621":0,"622":0,"639":0,"640":0,"641":0,"642":0,"643":0,"656":0,"657":0,"658":0,"659":0,"673":0,"677":0,"678":0,"681":0,"682":0,"685":0,"686":0,"691":0,"696":0,"697":0,"698":0,"701":0,"704":0,"706":0,"709":0,"719":0,"721":0,"723":0,"725":0,"729":0,"730":0,"731":0,"734":0,"759":0,"763":0,"764":0,"766":0,"767":0,"770":0,"771":0,"774":0,"775":0,"777":0,"780":0,"785":0,"786":0,"787":0,"790":0,"793":0,"802":0,"803":0,"806":0,"807":0,"808":0,"809":0,"814":0,"815":0,"818":0,"819":0,"820":0,"833":0,"835":0,"836":0,"837":0,"838":0,"843":0,"844":0,"845":0,"846":0,"850":0,"860":0,"861":0,"873":0,"874":0,"875":0,"887":0,"888":0,"889":0,"890":0,"899":0,"900":0,"902":0,"903":0,"904":0,"905":0,"921":0,"925":0,"926":0,"929":0,"932":0,"933":0,"936":0,"938":0,"939":0,"940":0,"941":0,"952":0,"954":0,"955":0,"970":0,"972":0,"982":0,"984":0,"985":0,"987":0,"988":0,"989":0,"991":0,"994":0,"1001":0,"1003":0,"1004":0,"1005":0,"1007":0,"1008":0,"1009":0,"1011":0,"1014":0,"1019":0,"1020":0,"1039":0,"1046":0,"1049":0,"1051":0,"1052":0,"1053":0,"1054":0,"1055":0,"1056":0,"1057":0,"1058":0,"1061":0,"1062":0,"1067":0,"1068":0,"1069":0,"1070":0,"1085":0,"1086":0,"1088":0,"1089":0,"1090":0,"1092":0,"1103":0,"1104":0,"1137":0,"1138":0,"1140":0,"1141":0,"1142":0,"1143":0,"1145":0,"1157":0,"1158":0,"1161":0,"1179":0,"1180":0,"1194":0};
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].functions = {"valueFn:100":0,"validator:139":0,"initializer:285":0,"destructor:303":0,"_bindEditable:315":0,"(anonymous 2):337":0,"_unbindEditable:328":0,"_bindCellEditingListeners:361":0,"(anonymous 3):399":0,"_unbindCellEditingListeners:391":0,"_bindEditorScroll:417":0,"openCellEditor:438":0,"hideCellEditor:517":0,"(anonymous 4):532":0,"hideAllCellEditors:529":0,"bindEditorListeners:545":0,"(anonymous 5):556":0,"getCellEditors:554":0,"getColumnByTd:574":0,"(anonymous 6):592":0,"getColumnNameByTd:587":0,"_setEditable:612":0,"_setDefaultEditor:637":0,"_setEditOpenType:655":0,"(anonymous 7):696":0,"_buildColumnEditors:672":0,"_createCellEditorInstance:758":0,"(anonymous 8):807":0,"(anonymous 9):818":0,"_destroyColumnEditors:801":0,"(anonymous 10):836":0,"(anonymous 11):844":0,"_getAllCellEditors:832":0,"_onKeyEsc:859":0,"_afterEditableSort:872":0,"_unsetEditor:884":0,"(anonymous 12):902":0,"_updateAllEditableColumnsCSS:898":0,"_updateEditableColumnCSS:920":0,"_handleCellClick:951":0,"_onScrollUpdateCellEditor:966":0,"_afterKeyDirChange:1038":0,"_onCellEditorCancel:1084":0,"_afterCellEditorCancel:1102":0,"_onCellEditorSave:1136":0,"_afterCellEditorSave:1156":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].coveredLines = 251;
_yuitest_coverage["build/gallery-datatable-editable/gallery-datatable-editable.js"].coveredFunctions = 47;
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

 Listeners are set for the "celleditor:save" event and saved to the active "data" setting within this module.

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

 The module fires the event [celleditor:save](#event_celleditor:save), which can be listened for to provide updating
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
   <li>An issue arises on "datatable.destroy()" in Chrome from time to time when using inline editors, still investigating why.</li>
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
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 86);
DtEditable = function(){};

// Define new attributes to support editing
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 89);
DtEditable.ATTRS = {

    /**
     * A boolean flag that sets the DataTable state to allow editing (either inline or popup cell editing).
     * (Future may support row editing also)
     *
     * @attribute editable
     * @type boolean
     * @default false
     */
    editable: {
        valueFn:    function(){ _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "valueFn", 100);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 100);
return false;},
        setter:     '_setEditable',
        validator:  Y.Lang.isBoolean
    },

    /**
     * Defines the cell editing event type on the TD that initiates the editor, used to
     * specify the listener that invokes an editor.
     *
     * Note: IMHO The only sensible options are 'click' or 'dblclick'
     *
     * @attribute editOpenType
     * @type string
     * @default 'dblclick'
     */
    editOpenType: {
        value:      'dblclick',
        setter:     '_setEditOpenType',
        validator:  Y.Lang.isString
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
     * @type string
     * @default 'none'
     */
    defaultEditor : {
        value:      'none',
        setter:     '_setDefaultEditor',
        validator:  function(v){ _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "validator", 139);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 139);
return Y.Lang.isString(v) || v === null; }
    }
};

// Add static props and public/private methods to be added to DataTable
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 144);
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

     //   if(this.get('editable')===true) {
     //       this._setEditableMode(true);
     //   }
     _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "initializer", 285);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 290);
console.log('it is this');
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 291);
this._classColEditable = this.getClassName('col','editable');

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 293);
this._bindEditable();

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 295);
return this;
    },

    /**
     * Cleans up ALL of the DT listeners and the editor View instances and generated private props
     * @method destructor
     * @protected
     */
    destructor:function() {
        // detach the "editableChange" listener on the DT
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "destructor", 303);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 305);
this.set('editable',false);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 306);
this._unbindEditable();
    },


    /**
     * Sets up listeners for the DT editable module,
     * @method _bindEditable
     * @private
     */
    _bindEditable: function(){

        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_bindEditable", 315);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 317);
Y.Do.after(this._updateAllEditableColumnsCSS,this,'syncUI');

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 319);
this.after('sort', this._afterEditableSort);
    },

    /**
     * Unbinds ALL of the popup editor listeners and removes column editors.
     * This should only be used when the DT is destroyed
     * @method _unbindEditable
     * @private
     */
    _unbindEditable: function() {

        // destroy any currently open editor
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_unbindEditable", 328);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 331);
if(this._openEditor && this._openEditor.destroy) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 332);
this._openEditor.destroy();
            //this._openEditor.destroy({remove:true});
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 336);
if(this._subscrCellEditorScrolls && Y.Lang.isArray(this._subscrCellEditorScrolls) ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 337);
Y.Array.each(this._subscrCellEditorScroll, function(dh){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 2)", 337);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 338);
if(dh && dh.detach) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 339);
dh.detach();
                }
            });
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 342);
this._subscrCellEditorScrolls = [];
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 345);
this._unsetEditor();

        // run through all instantiated editors and destroy them
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 348);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_bindCellEditingListeners", 361);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 364);
if(this._subscrCellEditors) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 365);
this._unbindCellEditingListeners();
        }

        // create listeners
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 369);
this._subscrCellEditors = [];
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 370);
this._subscrCellEditors.push(
            this.delegate( this.get('editOpenType'), this.openCellEditor,"tbody." + this.getClassName('data') + " td",this)
        );

        // Add a ESC key listener on the body (hate doing this!) to close editor if open ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 375);
this._subscrCellEditors.push( Y.one('body').after('keydown', this._onKeyEsc,this ) );

        // Add listeners to all 'celleditors'
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 378);
this.on('celleditor:save',this._onCellEditorSave);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 379);
this.after('celleditor:save',this._afterCellEditorSave);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 380);
this.on('celleditor:cancel',this._onCellEditorCancel);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 381);
this.after('celleditor:cancel',this._afterCellEditorCancel);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 382);
this.after('celleditor:keyDirChange',this._afterKeyDirChange);

    },

    /**
     * Unbinds the TD click delegated click listeners for initiating editing in TDs
     * @method _unbindCellEditingListeners
     * @private
     */
    _unbindCellEditingListeners: function(){

        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_unbindCellEditingListeners", 391);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 393);
if(!this._subscrCellEditors) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 394);
return;
        }

        // this._subscrCellEditors
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 398);
if (this._subscrCellEditors) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 399);
Y.Array.each(this._subscrCellEditors,function(e){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 3)", 399);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 400);
if(e && e.detach) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 401);
e.detach();
                }
            });
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 406);
this._subscrCellEditors = null;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 408);
this.detach('celleditor:*');

    },

    /**
     * Sets up listeners for DT scrollable "scroll" events
     * @method _bindEditorScroll
     * @private
     */
    _bindEditorScroll: function() {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_bindEditorScroll", 417);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 418);
this._subscrCellEditorScrolls = [];
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 419);
if(this._xScroll && this._xScrollNode) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 420);
this._subscrCellEditorScrolls.push( this._xScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );
        }
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 422);
if(this._yScroll && this._yScrollNode) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 423);
this._subscrCellEditorScrolls.push( this._yScrollNode.on('scroll', this._onScrollUpdateCellEditor, this ) );
        }

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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "openCellEditor", 438);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 439);
var td       = e.currentTarget || e,
            col      = this.getColumnByTd(td),
            colKey   = col.key || col.name,
            editorRef = (colKey) ? this._columnEditors[colKey] : null,
            editorInstance = (editorRef && Y.Lang.isString(editorRef) ) ? this._commonEditors[editorRef] : editorRef;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 445);
if(!td) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 446);
return;
        }

        // First time in,
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 450);
if( (this._yScroll || this._xScroll) && !this._subscrCellEditorScroll) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 451);
this._bindEditorScroll();
        }

        //
        // Bailout if column is null, has editable:false or no editor assigned ...
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 457);
if(col && col.editable === false && !editorInstance) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 458);
return;
        }

        // Hide any editor that may currently be open ... unless it is the currently visible one
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 462);
if(this._openEditor) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 463);
if ( this._openEditor === editorInstance ) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 464);
this._openEditor.hideEditor();
            } else {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 466);
this.hideCellEditor();
            }
        }

        //
        //  If the editorInstance exists, populate it and show it
        //
        //TODO:  fix this to rebuild new editors if user changes a column definition on the fly
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 475);
if(editorInstance) {

            //
            //  Set private props to the open TD we are editing, the editor instance, record and column name
            //
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 480);
this._openTd     = td;                      // store the TD
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 481);
this._openEditor = editorInstance;          // placeholder to the open Editor View instance
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 482);
this._openRecord = this.getRecord(td);      // placeholder to the editing Record
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 483);
this._openColKey = colKey;                  // the column key (or name)

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 485);
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
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 498);
this._openEditor.setAttrs({
       //         hostDT: this,
                cell:   this._openCell,
                value:  this._openRecord.get(colKey)
            });

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 504);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "hideCellEditor", 517);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 518);
if(this._openEditor) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 519);
this._openEditor.hideEditor();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 520);
this._unsetEditor();
        }
    },

    /**
     * Utility method that scans through all editor instances and hides them
     * @method hideAllCellEditors
     * @private
     */
    hideAllCellEditors: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "hideAllCellEditors", 529);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 530);
this.hideCellEditor();
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 531);
var ces = this._getAllCellEditors();
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 532);
Y.Array.each( ces, function(editor){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 4)", 532);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 533);
if(editor && editor.hideEditor) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 534);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "bindEditorListeners", 545);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 546);
return;
    },

    /**
     * Returns all cell editor View instances for the editable columns of the current DT instance
     * @method getCellEditors
     * @return editors {Array} Array containing an Object as {columnKey, cellEditor, cellEditorName}
     */
    getCellEditors: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "getCellEditors", 554);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 555);
var rtn = [], ed;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 556);
Y.Object.each(this._columnEditors,function(v,k){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 5)", 556);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 557);
ed = (Y.Lang.isString(v)) ? this._commonEditors[v] : v;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 558);
rtn.push({
                columnKey:      k,
                cellEditor:     ed,
                cellEditorName: ed.get('name')
            });
        },this);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 564);
return rtn;
    },

    /**
     * Returns the Column object (from the original "columns") associated with the input TD Node.
     * @method getColumnByTd
     * @param {Node} cell Node of TD for which column object is desired
     * @return {Object} column The column object entry associated with the desired cell
     * @public
     */
    getColumnByTd:  function(cell){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "getColumnByTd", 574);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 575);
var colName = this.getColumnNameByTd(cell);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 576);
return (colName) ? this.getColumn(colName) : null;
    },


    /**
     * Returns the column "key" or "name" string for the requested TD Node
     * @method getColumnNameByTd
     * @param {Node} cell Node of TD for which column name is desired
     * @return {String} colName Column name or key name
     * @public
     */
    getColumnNameByTd: function(cell){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "getColumnNameByTd", 587);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 588);
var classes = cell.get('className').split(" "),
            regCol  = new RegExp( this.getClassName('col') + '-(.*)'),
            colName;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 592);
Y.Array.some(classes,function(item){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 6)", 592);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 593);
var colmatch =  item.match(regCol);
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 594);
if ( colmatch && Y.Lang.isArray(colmatch) && colmatch[1] ) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 595);
colName = colmatch[1];
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 596);
return true;
            }
        });

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 600);
return colName || null;
    },


//==========================  PRIVATE METHODS  =============================

    /**
     * Setter method for the [editable](#attr_editable) attribute for this DT
     * @method _setEditable
     * @param v {Boolean} Flag to enable/disable editing mode for this DT instance
     * @private
     */
    _setEditable: function(v){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_setEditable", 612);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 613);
if( v ) {
            // call overrideable method .... simple return by default
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 615);
this.bindEditorListeners();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 616);
this._bindCellEditingListeners();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 617);
this._buildColumnEditors();

        } else  {
            //if(this.get('editable')===true) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 621);
this._unbindCellEditingListeners();
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 622);
this._destroyColumnEditors();
            //}
        }

    },

    /**
     * Setter method for the [defaultEditor](#attr_defaultEditor) attribute for this DT
     * If the default editor is changed to a valid setting, we disable and re-enable
     * editing on the DT to reset the column editors.
     *
     * @method _setDefaultEditor
     * @param v {String|Null} Value to use for this attribute
     * @private
     */
    _setDefaultEditor: function(v) {
      //  if ( (v && Y.DataTable.EditorOptions[v]) || v === null) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_setDefaultEditor", 637);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 639);
if ( v  || v === null ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 640);
if(this.get('editable')) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 641);
this.set('editable',false);
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 642);
this._set('defaultEditor',v);
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 643);
this.set('editable',true);
            }
        }
    },

    /**
     * Setter method for the [editOpenType](#attr_editOpenType) attribute, specifies what
     * TD event to listen to for initiating editing.
     * @method _setEditOpenType
     * @param v {String}
     * @private
     */
    _setEditOpenType: function(v) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_setEditOpenType", 655);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 656);
if(this._subscrCellEditors && this._subscrCellEditors[0] && this._subscrCellEditors[0].detach) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 657);
this.hideAllCellEditors();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 658);
this._subscrCellEditors[0].detach();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 659);
this._subscrCellEditors[0] = this.delegate( v, this.openCellEditor,"tbody." + this.getClassName('data') + " td",this);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_buildColumnEditors", 672);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 673);
var cols     = this.get('columns'),
            defEditr = this.get('defaultEditor'),
            edName, colKey, editorInstance;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 677);
if( !Y.DataTable.EditorOptions ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 678);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 681);
if( this._columnEditors || this._commonEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 682);
this._destroyColumnEditors();
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 685);
this._commonEditors = {};
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 686);
this._columnEditors = {};

        //
        //  Set the default editor, if one is defined
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 691);
defEditr = (defEditr && defEditr.search(/none|null/i) !==0 ) ? defEditr : null;

        //
        //  Loop over all DT columns ....
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 696);
Y.Array.each(cols,function(c){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 7)", 696);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 697);
if(!c) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 698);
return;
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 701);
colKey = c.key || c.name;

            // An editor was defined (in column) and doesn't yet exist ...
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 704);
if(colKey && c.editable !== false) {

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 706);
edName = c.editor || defEditr;

                // This is an editable column, update the TD's for the editable column
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 709);
this._updateEditableColumnCSS(colKey,true);

                //this._editorColHash[colKey] = edName;

                //
                // If an editor is named, check if its definition exists, and that it is
                // not already instantiated.   If not, create it ...
                //

                // check for common editor ....
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 719);
if (edName && Y.DataTable.EditorOptions[edName]) {

                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 721);
if(c.editorConfig && Y.Lang.isObject(c.editorConfig) ) {

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 723);
editorInstance = this._createCellEditorInstance(edName,c);

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 725);
this._columnEditors[colKey] = editorInstance || null;

                    } else {

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 729);
if( !this._commonEditors[edName] ) {
                            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 730);
editorInstance = this._createCellEditorInstance(edName,c);
                            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 731);
this._commonEditors[edName] = editorInstance;
                        }

                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 734);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_createCellEditorInstance", 758);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 759);
var conf_obj      = Y.clone(Y.DataTable.EditorOptions[editorName],true),
            BaseViewClass = Y.DataTable.EditorOptions[editorName].BaseViewClass,
            editorInstance;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 763);
if(column.editorConfig && Y.Lang.isObject(column.editorConfig)) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 764);
conf_obj = Y.merge(conf_obj, column.editorConfig);

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 766);
if(column.editorConfig.overlayConfig) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 767);
conf_obj.overlayConfig = Y.merge(conf_obj.overlayConfig || {}, column.editorConfig.overlayConfig);
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 770);
if(column.editorConfig.widgetConfig) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 771);
conf_obj.widgetConfig = Y.merge(conf_obj.widgetConfig || {}, column.editorConfig.widgetConfig);
            }

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 774);
if(column.editorConfig.templateObject) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 775);
conf_obj.templateObject = Y.merge(conf_obj.templateObject || {}, column.editorConfig.templateObject);
            }
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 777);
conf_obj.name = editorName;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 780);
delete conf_obj.BaseViewClass;

        //
        //  We have a valid base class, instantiate it
        //
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 785);
if(BaseViewClass){
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 786);
conf_obj.hostDT = this;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 787);
editorInstance = new BaseViewClass(conf_obj);

            // make the one of this editor's targets ...
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 790);
editorInstance.addTarget(this);
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 793);
return editorInstance;
    },

    /**
     * Loops through the column editor instances, destroying them and resetting the collection to null object
     * @method _destroyColumnEditors
     * @private
     */
    _destroyColumnEditors: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_destroyColumnEditors", 801);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 802);
if( !this._columnEditors && !this._commonEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 803);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 806);
var ces = this._getAllCellEditors();
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 807);
Y.Array.each(ces,function(ce){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 8)", 807);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 808);
if(ce && ce.destroy) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 809);
ce.destroy();
              //  ce.destroy({remove:true});
            }
        });

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 814);
this._commonEditors = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 815);
this._columnEditors = null;

        // remove editing class from all editable columns ...
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 818);
Y.Array.each( this.get('columns'), function(c){
            _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 9)", 818);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 819);
if(c.editable === undefined || c.editable === true) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 820);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_getAllCellEditors", 832);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 833);
var rtn = [];

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 835);
if( this._commonEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 836);
Y.Object.each(this._commonEditors,function(ce){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 10)", 836);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 837);
if(ce && ce instanceof Y.View){
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 838);
rtn.push(ce);
                }
            });
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 843);
if( this._columnEditors ) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 844);
Y.Object.each(this._columnEditors,function(ce){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 11)", 844);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 845);
if(ce && ce instanceof Y.View){
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 846);
rtn.push(ce);
                }
            });
        }
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 850);
return rtn;
    },

    /**
     * Closes the active cell editor when a document ESC key is detected
     * @method _onKeyEsc
     * @param e {EventFacade} key listener event facade
     * @private
     */
    _onKeyEsc:  function(e) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onKeyEsc", 859);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 860);
if(e.keyCode===27) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 861);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_afterEditableSort", 872);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 873);
if(this.get('editable')) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 874);
this.hideCellEditor();
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 875);
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
        //this._openEditor = null;
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_unsetEditor", 884);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 887);
this._openRecord = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 888);
this._openColKey = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 889);
this._openCell = null;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 890);
this._openTd = null;
    },

    /**
     * Method to update all of the current TD's within the current DT to add/remove the editable CSS
     * @method _updateAllEditableColumnsCSS
     * @private
     */
    _updateAllEditableColumnsCSS : function() {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_updateAllEditableColumnsCSS", 898);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 899);
if(this.get('editable')) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 900);
var cols = this.get('columns'),
                ckey;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 902);
Y.Array.each(cols,function(col){
                _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "(anonymous 12)", 902);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 903);
ckey = col.key || col.name;
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 904);
if(ckey) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 905);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_updateEditableColumnCSS", 920);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 921);
var tbody = this.get('contentBox').one('tbody.'+this.getClassName('data')),
            col   = (cname) ? this.getColumn(cname) : null,
            colEditable = col && col.editable !== false,
            tdCol;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 925);
if(!cname || !col) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 926);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 929);
colEditable = (colEditable && col.editor || (this.get('defaultEditor')!==null
            && this.get('defaultEditor').search(/none/i)!==0) ) ? true : false;

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 932);
if(!tbody || !colEditable) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 933);
return;
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 936);
tdCol = tbody.all('td.'+this.getClassName('col',cname));

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 938);
if(tdCol && opt===true) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 939);
tdCol.addClass(this._classColEditable);
        } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 940);
if (tdCol) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 941);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_handleCellClick", 951);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 952);
var td = e.currentTarget,
            cn = this.getColumnNameByTd(td);
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 954);
if (cn && this._openEditor &&  this._openEditor.get('colKey')!==cn) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 955);
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
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onScrollUpdateCellEditor", 966);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 970);
if(this.get('editable') && this.get('scrollable') && this._openEditor && this._openTd ) {

           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 972);
var tar    = e.target,
               tarcl  = tar.get('className') || '',
               tr1    = this.getRow(0),
               trh    = (tr1) ? +tr1.getComputedStyle('height').replace(/px/,'') : 0,
               tdxy   = (this._openTd) ? this._openTd.getXY() : null,
               xmin, xmax, ymin, ymax, hidef;

            //
            // For vertical scrolling - check vertical 'y' limits
            //
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 982);
if( tarcl.search(/-y-/) !==-1 ) {

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 984);
ymin = this._yScrollNode.getY() + trh - 5;
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 985);
ymax = ymin + (+this._yScrollNode.getComputedStyle('height').replace(/px/,'')) - 2*trh;

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 987);
if(tdxy[1] >= ymin && tdxy[1] <= ymax ) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 988);
if(this._openEditor.get('hidden')) {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 989);
this._openEditor.showEditor(this._openTd);
                    } else {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 991);
this._openEditor.set('xy', tdxy );
                    }
                } else {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 994);
hidef = true;
                }
            }

            //
            // For horizontal scrolling - check horizontal 'x' limits
            //
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1001);
if( tarcl.search(/-x-/) !==-1 ) {

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1003);
xmin = this._xScrollNode.getX();
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1004);
xmax = xmin + (+this._xScrollNode.getComputedStyle('width').replace(/px/,''));
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1005);
xmax -= +this._openTd.getComputedStyle('width').replace(/px/,'');

                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1007);
if(tdxy[0] >= xmin && tdxy[0] <= xmax ) {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1008);
if(this._openEditor.get('hidden')) {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1009);
this._openEditor.showEditor(this._openTd);
                    } else {
                        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1011);
this._openEditor.set('xy', tdxy );
                    }
                } else {
                    _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1014);
hidef = true;
                }
            }

            // If hidef is true, editor is out of view, hide it temporarily
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1019);
if(hidef) {
                _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1020);
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
     * @method _afterKeyDirChange
     * @param e {EventFacade} The attribute change event facade for the View's 'keyDir' attribute
     * @private
     */
    _afterKeyDirChange : function(e) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_afterKeyDirChange", 1038);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1039);
var dir     = e.newVal,
            recIndex = this.data.indexOf(this._openRecord),
            col      = this.getColumn(this._openColKey),
            colIndex = Y.Array.indexOf(this.get('columns'),col),
            oldTd    = this._openTd,
            newTd, ndir, circ;

       _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1046);
this.hideCellEditor();

       //TODO: Implement "circular" mode, maybe thru an attribute to wrap col/row navigation
       _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1049);
if(circ) {

           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1051);
if(dir[1] === 1 && colIndex === this.get('columns').length-1 ) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1052);
ndir = [0, -this.get('columns').length+1];
           } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1053);
if(dir[1] === -1 && colIndex === 0) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1054);
ndir = [0, this.get('columns').length-1];
           } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1055);
if(dir[0] === 1 && recIndex === this.data.size()-1 ) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1056);
ndir = [ -this.data.size()+1, 0];
           } else {_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1057);
if(dir[0] === -1 && recIndex === 0) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1058);
ndir = [ this.data.size()-1, 0];
           }}}}

           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1061);
if(ndir) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1062);
dir = ndir;
           }

       }

       _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1067);
if(dir){
           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1068);
newTd = this.getCell(oldTd, dir);
           _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1069);
if(newTd) {
               _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1070);
this.openCellEditor(newTd);
           }
       }
    },

    /**
     * Listener to the cell editor View's `cancel` event.  The cancel event
     * includes a return object with keys {td,cell,oldValue}.
     * This method fills it up with extra information.
     *
     * @method _onCellEditorCancel
     * @param ev {Event Facade} As provided by the celleditor:cancel event
     * @private
     */
    _onCellEditorCancel: function(ev){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onCellEditorCancel", 1084);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1085);
var cell   = ev.cell;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1086);
if(cell && this._openRecord && this._openColKey) {

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1088);
ev.record = this.data.getByClientId(cell.recClientId) || this._openRecord;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1089);
ev.colKey = cell.colKey || this._openColKey;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1090);
ev.editorName = this._openEditor.get('name');
        } else {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1092);
ev.halt();
        }

    },
    /**
     * After listener for the cell editor `cancel` event. If no other listener
     * has halted the event, this method will finally hide the editor.
     * @method _afterCellEditorCancel
     * @private
     */
    _afterCellEditorCancel: function(){
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_afterCellEditorCancel", 1102);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1103);
if(!this._openEditor.get('hidden')) {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1104);
this.hideCellEditor();
        }
    },

    /**
     * Fired when the open Cell Editor has sent an 'editorCancel' event, typically from
     * a user cancelling editing via ESC key or "Cancel Button"
     * @event celleditor:cancel
     * @param ev {Event Facade} Event facade, including:
     *  @param ev.td {Node} The TD Node that was edited
     *  @param ev.cell {Object} The cell object container for the edited cell
     *  @param ev.record {Model} Model instance of the record data for the edited cell
     *  @param ev.colKey {String} Column key (or name) of the edited cell
     *  @param ev.newVal {String|Number|Date} The old (last) value of the underlying data for the cell
     *  @param ev.editorName {String} The name attribute of the editor that updated this cell
     */

    /**
     * Listener to the cell editor View's "save" event, that when fired will
     * update the Model's data value for the approrpriate column.
     *
     * The editorSave event includes a return object with keys {td,cell,newValue,oldValue}.
     *
     * It fills the event facade for the event with extra information.
     *
     * Note:  If a "sync" layer DOES NOT exist (i.e. DataSource), implementers can listen for
     * the "saveCellEditing" event to send changes to a remote data store.
     *
     * @method _onCellEditorSave
     * @param ev {Event Facade} As provided by the cell editor "save" event
     * @private
     */
    _onCellEditorSave: function (ev) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_onCellEditorSave", 1136);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1137);
var cell   = ev.cell;
        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1138);
if(cell && this._openRecord && this._openColKey) {

            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1140);
ev.cell = cell;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1141);
ev.record = this.data.getByClientId(cell.recClientId) || this._openRecord;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1142);
ev.colKey = cell.colKey || this._openColKey;
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1143);
ev.editorName = this._openEditor.get('name');
        } else {
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1145);
ev.halt();
        }

    },
    /**
     * After listener for the cell editor `save` event. If no other listener
     * has halted the event, this method will finally save the new value
     * and hide the editor.
     * @method _afterCellEditorSave
     * @private
     */
    _afterCellEditorSave: function (ev) {
        _yuitest_coverfunc("build/gallery-datatable-editable/gallery-datatable-editable.js", "_afterCellEditorSave", 1156);
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1157);
if(ev.record){
            _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1158);
ev.record.set(ev.colKey, ev.newValue);
        }

        _yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1161);
this.hideCellEditor();
    }

    /**
     * Event fired after a Cell Editor has sent the 'save' event closing an editing session.
     * @event celleditor:save
     * @param ev {Event Facade} including:
     *  @param ev.td {Node} The TD Node that was edited
     *  @param ev.cell {Object} The cell object container for the edited cell
     *  @param ev.record {Model} Model instance of the record data for the edited cell
     *  @param ev.colKey {String} Column key (or name) of the edited cell
     *  @param ev.newVal {String|Number|Date} The new (updated) value of the underlying data for the cell
     *  @param ev.prevVal {String|Number|Date} The old (last) value of the underlying data for the cell
     *  @param ev.editorName {String} The name attribute of the editor that updated this cell
     */

});

_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1179);
Y.DataTable.Editable = DtEditable;
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1180);
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
_yuitest_coverline("build/gallery-datatable-editable/gallery-datatable-editable.js", 1194);
Y.DataTable.EditorOptions = {};


}, '@VERSION@', {"supersedes": [""], "skinnable": "true", "requires": ["datatable-base", "datatype"], "optional": [""]});
