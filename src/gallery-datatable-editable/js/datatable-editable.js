/**
 A DataTable class extension that configures a DT for "editing", current deployment supports cell editing,
 and planned near-term support for row editing.

 This module is essentially a wrapper-class to setup DT for editing with the appropriate attributes and
 listener creation / detachment.  The real guts of "datatable-editing" is in the View class definitions.

 The extension primarily adds a boolean attribute "editable" that when set true establishes listeners to
 invoke the editor on a specific TBODY element, pre-scans column definitions to locate and instantiate
 cell editor View classes (defined in modules gallery-datatable-edit-inline and gallery-datatable-edit-popup)
 and sets up the DT to act as a view "controller" to listen to View "saveEditor" events and make the changes
 to the underlying dataset.

 In addition to a few new attributes, this module also recognizes some new column properties to support
 cell-editing in particular;
    * editor
    * editorOptions
    * editable    {Boolean}    Flag to toggle on/off editing for the column (default: false)


 When this module is loaded and the "editable: true" attribute is set, it attempts to economize on
 the "instantiation cost" of creating View instances by identifying only editor Views that are required
 based upon column definitions and/or the defaultEditor attribute.
 (e.g. if all columns are "text" editors, only one "text" editor View is instantiated)

 The module chiefly fires one event "cellEditorSave", which can be listened for to provide updating
 of remote data back to a server (assuming a ModelList "sync" layer is NOT used).

 A new class Object (Y.DataTable.EditorOptions) is added to the DataTable namespace that serves as the
 database of the editor View configuration properties.  Each "key" (object property) within this object
 is an entrypoint to a specific editor configuration.

 FUTURE:
 This module will be amended to add "row" editing.
 Presently, it doesn't work well with "scrolling" datatables ... i.e. repositioning onscroll.

 @module gallery-datatable-editable
 @class Y.DataTable.Editable
 @extends Y.DataTable
 @author Todd Smith
 @since 3.8.0
 **/
DtEditable = function(){};

// Define new attributes to support editing
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
        value: false,
        validator: Y.Lang.isBoolean
    },

    /**
     * Defines the cell editing event type on the TD that initiates the editor, used to
     * specify the listener that invokes an editor.
     *
     * Note: The only sensible options are 'click' or 'dblclick'
     *
     * @attribute editOpenType
     * @type string
     * @default 'dblclick'
     */
    editOpenType: {
        value:     'dblclick',
        validator: Y.Lang.isString
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
        validator:  Y.Lang.isString
    }
};

// Add static props and public/private methods to be added to DataTable
Y.mix( DtEditable.prototype, {

// -------------------------- Placeholder Private Properties  -----------------------------

    /**
     Holds the View instance of the active cell editor currently displayed
     @property _openEditor
     @type Y.View
     @default null
     @static
     **/
    _openEditor:        null,

    /**
     Holds the current record (i.e. a Model class) of the TD being edited
     (Note: this may not always work, better to use "clientId" of the record, i.e. sorting, etc..)
     @property _openRecord
     @type Model
     @default null
     @static
     **/
    _openRecord:        null,

    /**
     Holds the column key (or name) of the TD cell being edited
     @property _openColKey
     @type String
     @default null
     @static
     **/
    _openColKey:        null,

    /**
     Holds the TD Node currently being edited
     @property _openTd
     @type Node
     @default null
     @static
     **/
    _openTd:            null,

    /**
     Holds the cell data for the actively edited TD, a complex object including the
     following;  {td, value, recClientId, colKey}
     @property _openCell
     @type Object
     @default null
     @static
     **/
    _openCell:          null,

// -------------------------- Subscriber handles  -----------------------------

    /**
     Placeholder for the DT level event listener for "editableChange" attribute.
     @property _subscrEditable
     @type EventHandle
     @default null
     @static
     **/
    _subscrEditable:     null,

    /**
     Placeholder Array for TD editor invocation event handles (i.e. click or dblclick) that
     are set on the TBODY to initiate cellEditing.
     @property _subscrEditClick
     @type Array of EventHandles
     @default null
     @static
     **/
    _subscrEditClick:    null,

    /**
     Placeholder Array for event listeners that are set on the currently open editor, that
     listen to the View's editorSave, key direction movement and other events.
     @property _subscrOpenEditor
     @type Array of EventHandles
     @default null
     @static
     **/
    _subscrOpenEditor:  null,

    /**
     Shortcut to the CSS class that is added to indicate a column is editable
     @property _classColEditable
     @type String
     @default 'yui3-datatable-col-editable'
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
     @default {}
     @static
     **/
    _commonEditors:  {},

    /**
     Placeholder hash that stores cell editors keyed by column key (or column name) where the value
     for the associated key is either a (a) {String} which references an editor name in the [_commonEditors](#property__commonEditors)
     hash or (b) {View} instance for a customized editor View instance (typically one with specified "editorOptions" in the
     column definition).

     The object is populated in method [_buildColumnEditors](#method__buildColumnEditors).

     @property _columnEditors
     @type Object
     @default {}
     @static
     **/
    _columnEditors: {},

    // future
    //_editableType:      null,   //  'cell', 'row', 'inline?'

//==========================  LIFECYCLE METHODS  =============================

    /**
     * Initializer that sets up listeners for "editable" state and sets some CSS names
     * @method initializer
     * @protected
     */
    initializer: function(){

        //this._subscrEditClick = [];
        this._subscrEditable = this.on('editableChange', this._changeEditableMode);

        // if(this.get('editable')) {
        //    this._changeEditableMode(true);
        // }

        this._classColEditable = this.getClassName('col','editable');

        return this;
    },

    /**
     * Cleans up ALL of the DT listeners and the editor View instances and generated private props
     * @method destructor
     * @protected
     */
    destructor:function() {
        // detach the "editableChange" listener on the DT
        if(this._subscrEditable &&  this._subscrEditable.detach) {
            this._subscrEditable.detach();
        }
        this._subscrEditable = null;

        this._unbindEditor();
        this._unbindCellEditingListeners();
    },


    /**
     * Setter method for `editable` attribute, that takes care of setting up editing bindings
     * on TD / TR clicks or if false will detach existing bindings
     *
     * @method _changeEditableMode
     * @param e
     * @private
     */
    _changeEditableMode: function(e){
        var valNew  = ( e === true) ? true : e.newVal,
            valPrev = e.prevVal || false;

        if(valNew === valPrev) return;

        if( valNew ) { //&& !this._subscrEditClick ) {

            // call overrideable method .... simple return by default
            this.bindEditorListeners();

            this._bindCellEditingListeners();

            this._buildColumnEditors();

        } else if ( !valNew && valPrev && this._subscrEditClick ) {

            this._unbindCellEditingListeners();

            this._destroyColumnEditors();

        }
    },

    /**
     * Binds listeners to cell TD "open editing" events (i.e. either click or dblclick)
     * as a result of DataTable setting "editable:true".
     * @method _bindCellEditingListeners
     * @private
     */
    _bindCellEditingListeners: function(){
        if(!this._subscrEditClick) {
            this._unbindCellEditingListeners();
        }

        this._subscrEditClick = [];
        this._subscrEditClick.push(
            this.delegate( this.get('editOpenType'), this.openCellEditor,"tbody." + this.getClassName('data') + " td",this)
        );
 //       this._subscrEditClick.push(
 //           this.delegate("click",this._handleCellClick,"tbody td",this)
 //       );

        this._subscrOpenEditor = [];
    },

    /**
     * Unbinds the TD click delegated click listeners for initiating editing in TDs
     * @method _unbindCellEditingListeners
     * @private
     */
    _unbindCellEditingListeners: function(){
        if (this._subscrEditClick) {
            Y.Array.each(this._subscrEditClick,function(e){
                if(e && e.detach) {
                    e.detach();
                }
            });
        }
        this._subscrEditClick = null;
    },

    /**
     * Unbinds ALL of the popup editor listeners and removes column editors.
     * This should only be used when the DT is destroyed
     * @method _unbindEditor
     * @private
     */
    _unbindEditor: function() {

        // detach listeners on any open editor ...
        this._unbindOpenEditor();

        // destroy any currently open editor
        if(this._openEditor && this._openEditor.destroy) {
            this._openEditor.destroy({remove:true});
        }

        // detach listeners on TD cell click/dblclick actions ...
        //this._unbindCellEditingListeners();

        // run through all instantiated editors and destroy them
        this._destroyColumnEditors();

        // Finally, null out static props on this extension
        this._openEditor = null;
        this._openRecord = null;
        this._openColKey = null;
        this._openCell = null;
        this._openTd = null;

    },

    /**
     * Binds the currently open editor's listeners on the DT
     * @param editor {View} Currently open cell editor View instance
     * @private
     */
    _bindOpenEditor : function(editor) {

        // detach any currently existent listeners on the editor ...
        this._unbindOpenEditor();

        // subscribe to some editor events ....
        this._subscrOpenEditor.push( editor.on('editorSave', Y.bind(this._onCellEditorSave,this) ) );
        this._subscrOpenEditor.push( editor.on('editorCancel', Y.bind(this._onCellEditorCancel,this) ) );
        this._subscrOpenEditor.push( editor.after('keyDirChange', Y.bind(this._onKeyDirChange,this) ) );

    /*
        if(this._syncScrollUI) {
            this._subscrOpenEditor.push(Y.Do.after( function(o){
                if(this._openEditor) {
                    this._openEditor.showEditor();
                }
            }, this, '_syncScrollUI') );
        }
    */

    },

    /**
     * Detaches the currently "open" editor listeners
     * @method _unbindOpenEditor
     * @private
     */
    _unbindOpenEditor : function() {
        if( this._subscrOpenEditor && Y.Lang.isArray(this._subscrOpenEditor) ) {
            Y.Array.each(this._subscrOpenEditor,function(e){
                if(e && e.detach) {
                    e.detach();
                }
            });
        }
    },


//==========================  PUBLIC METHODS  =============================

    /**
     * Listener for "open editor" invocation (dblclick), which passes in the TD node
     *  that invoked the editor
     * @method openCellEditor
     * @param e
     * @private
     */
    openCellEditor: function(e) {
        var td       = e.currentTarget || e,
            col      = this.getColumnByTd(td),
            colKey   = col.key || col.name,
            editorRef = (colKey) ? this._columnEditors[colKey] : null,
            editorInstance = (editorRef && Y.Lang.isString(editorRef) ) ? this._commonEditors[editorRef] : editorRef;

        //
        // Bailout if column is null, has editable:false or no editor assigned ...
        //
        if(col && col.editable === false && !editorInstance) {
            return;
        }

        // Hide any editor that may currently be open ... unless it is the currently visible one
        if(this._openEditor) {
            if ( this._openEditor === editorInstance ) {
                this._openEditor.hideEditor();
            } else {
                this.hideCellEditor();
            }
        }

        //
        //  If the editorInstance exists, populate it and show it
        //
        //TODO:  fix this to rebuild new editors if user changes a column definition on the fly
        //
        if(editorInstance) {

            //
            //  Set private props to the open TD we are editing, the editor instance, record and column name
            //
            this._openTd     = td;                      // store the TD
            this._openEditor = editorInstance;          // placeholder to the open Editor View instance
            this._openRecord = this.getRecord(td);      // placeholder to the editing Record
            this._openColKey = colKey;                  // the column key (or name)

            this._openCell   = {
                td:             td,
                value:          this._openRecord.get(colKey),
                recClientId:    this._openRecord.get('clientId'),
                colKey:         colKey
            };

            // Define listeners onto this open editor ...
            this._bindOpenEditor( this._openEditor );

            //
            //  Set the editor Attributes and render it ... (display it!)
            //
            this._openEditor.setAttrs({
                hostDT: this,
                cell:   this._openCell
            });

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
        this._unbindOpenEditor();
        this._openEditor.hideEditor();
    },

    /**
     * Utility method that scans through all editor instances and hides them
     * @method hideAllCellEditors
     * @private
     */
    hideAllCellEditors: function(){
        this._unbindOpenEditor();
        var ces = this._getAllCellEditors();
        Y.Array.each( ces, function(editor){
            if(editor && editor.hideEditor) {
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
        return;
    },

    /**
     * Returns all cell editor View instances for the editable columns of the current DT instance
     * @method getCellEditors
     * @return editors {Array} Array containing an Object as {columnKey, cellEditor, cellEditorName}
     */
    getCellEditors: function(){
        var rtn = [], ed;
        Y.Object.each(this._columnEditors,function(v,k){
            ed = (Y.Lang.isString(v)) ? this._commonEditors[v] : v;
            rtn.push({
                columnKey:      k,
                cellEditor:     ed,
                cellEditorName: ed.get('name')
            });
        },this);
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
        var colName = this.getColumnNameByTd(cell);
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
        var classes = cell.get('className').split(" "),
            regCol  = new RegExp( this.getClassName('col') + '-(.*)');

        var colName;
        Y.Array.some(classes,function(item){
            var colmatch =  item.match(regCol);
            if ( colmatch && Y.Lang.isArray(colmatch) && colmatch[1] ) {
                colName = colmatch[1];
                return true;
            }
        });

        return colName || null;
    },


//==========================  PRIVATE METHODS  =============================

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
        var cols     = this.get('columns'),
            defEditr = this.get('defaultEditor'),
            edName, colKey, conf_obj, editorInstance;

        if( !Y.DataTable.EditorOptions ) return;

        if( this._columnEditors !== {} && this._commonEditors !== {} ) {
            this._destroyColumnEditors();
        }

        //
        //  Set the default editor, if one is defined
        //
        defEditr = (defEditr && defEditr.search(/none|null/i) !==0 ) ? defEditr : null;

        //
        //  Loop over all DT columns ....
        //
        Y.Array.each(cols,function(c){
            if(!c) {
                return;
            }

            colKey = c.key || c.name;

            // An editor was defined (in column) and doesn't yet exist ...
            if(colKey && c.editable !== false) {

                edName = c.editor || defEditr;

                // This is an editable column, update the TD's for the editable column
                this._updateEditableColumnCSS(colKey,true);

                //this._editorColHash[colKey] = edName;

                //
                // If an editor is named, check if its definition exists, and that it is
                // not already instantiated.   If not, create it ...
                //

                // check for common editor ....
                if (edName && Y.DataTable.EditorOptions[edName]) {

                    if(c.editorOptions && Y.Lang.isObject(c.editorOptions) ) {

                        editorInstance = this._createCellEditorInstance(edName,c);

                        this._columnEditors[colKey] = editorInstance || null;

                    } else {

                        if( !this._commonEditors[edName] ) {
                            editorInstance = this._createCellEditorInstance(edName,c);
                            this._commonEditors[edName] = editorInstance;
                        }

                        this._columnEditors[colKey] = edName;

                    }

                }

            }
        },this);

    },

    /**
     * This method takes the given editorName (i.e. 'textarea') and if the default editor
     * configuration, adds in any column 'editorOptions' and creates the corresponding
     * cell editor View instance
     *
     * @method _createCellEditorInstance
     * @param editorName {String} Editor name
     * @param column {Object} Column object
     * @return editorInstance {View} A newly created editor instance for the supplied editorname and column definitions
     * @private
     */
    _createCellEditorInstance: function(editorName, column) {
        var conf_obj      = Y.clone(Y.DataTable.EditorOptions[editorName],true),
            baseViewClass = Y.DataTable.EditorOptions[editorName].baseViewClass,
            editorInstance;

        if(column.editorOptions && Y.Lang.isObject(column.editorOptions)) {
            conf_obj = Y.merge(column.editorOptions, conf_obj);
            conf_obj.name = editorName;
        }
        delete conf_obj.baseViewClass;

        if(baseViewClass){
            editorInstance = new baseViewClass(conf_obj);
        }

        return editorInstance;

    },

    /**
     * Loops through the column editor instances, destroying them and resetting the collection to null object
     * @method _destroyColumnEditors
     * @private
     */
    _destroyColumnEditors: function(){
        var ces = this._getAllCellEditors();

        Y.Array.each(ces,function(ce){
            if(ce && ce.destroy) {
                ce.destroy({remove:true});
            }
        });
        this._commonEditors = {};
        this._columnEditors = {};

        // remove editing class from all editable columns ...
        Y.Array.each( this.get('columns'), function(c){
            if(c.editable === undefined || c.editable === true) {
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
        var rtn = [];

        if( this._commonEditors ) {
            Y.Object.each(this._commonEditors,function(ce){
                if(ce && ce instanceof Y.View){
                    rtn.push(ce);
                }
            });
        }

        if( this._columnEditors ) {
            Y.Object.each(this._columnEditors,function(ce){
                if(ce && ce instanceof Y.View){
                    rtn.push(ce);
                }
            });
        }
        return rtn;
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
        var tbody = this.get('contentBox').one('tbody.'+this.getClassName('data')),
            tdCol = tbody.all('td.'+this.getClassName('col',cname)),
            col   = this.getColumn(cname);

        if(col && col.editable === false || col.editable === null ) {
            return;
        }

        if(tdCol && opt===true) {
            tdCol.addClass(this._classColEditable);
        } else if (tdCol) {
            tdCol.removeClass(this._classColEditable);
        }
    },

    /**
     * Listener to TD "click" events that hides a popup editor is not in the current cell
     * @method _handleCellClick
     * @param e
     * @private
     */
    _handleCellClick:  function(e){
        var td = e.currentTarget,
            cn = this.getColumnNameByTd(td);
        if (cn && this._openEditor &&  this._openEditor.get('colKey')!==cn) {
            this.hideCellEditor();
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
        var dir     = e.newVal,
            recIndex = this.data.indexOf(this._openRecord),
            col      = this.getColumn(this._openColKey),
            colIndex = Y.Array.indexOf(this.get('columns'),col),
            oldTd    = this._openTd,
            newTd, ndir, circ;

       this.hideCellEditor();

       //TODO: Implement "circular" mode, maybe thru an attribute to wrap col/row navigation
       if(circ) {

           if(dir[1] === 1 && colIndex === this.get('columns').length-1 ) {
               ndir = [0, -this.get('columns').length+1];
           } else if(dir[1] === -1 && colIndex === 0) {
               ndir = [0, this.get('columns').length-1];
           } else if(dir[0] === 1 && recIndex === this.data.size()-1 ) {
               ndir = [ -this.data.size()+1, 0];
           } else if(dir[0] === -1 && recIndex === 0) {
               ndir = [ this.data.size()-1, 0];
           }

           if(ndir) {
               dir = ndir;
           }

       }

       if(dir){
           newTd = this.getCell(oldTd, dir);
           if(newTd) {
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
        if(o.cell && this._openRecord && this._openColKey) {
            var cell   = o.cell,
                colKey = cell.colKey || this._openColKey,
                record = this.data.getByClientId(cell.recClientId) || this._openRecord;

            this.fire('cellEditorCancel',{
                td:         o.td,
                cell:       cell,
                record:     record,
                colKey:     colKey,
                prevVal:    o.oldValue,
                editorName: this._openEditor.get('name')
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
     *  @param {String|Number|Date} newVal The old (last) value of the underlying data for the cell
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
        if(o.cell && this._openRecord && this._openColKey) {
            var cell   = o.cell,
                colKey = cell.colKey || this._openColKey,
                record = this.data.getByClientId(cell.recClientId) || this._openRecord;

            if(record){
                record.set(this._openColKey, o.newValue);
            }

            this.fire('cellEditorSave',{
                td:         o.td,
                cell:       cell,
                record:     record,
                colKey:     colKey,
                newVal:     o.newValue,
                prevVal:    o.oldValue,
                editorName: this._openEditor.get('name')
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
     *  @param {String|Number|Date} newVal The old (last) value of the underlying data for the cell
     *  @param {String} editorName The name attribute of the editor that updated this cell
     */

});

Y.DataTable.Editable = DtEditable;
Y.Base.mix(Y.DataTable, [Y.DataTable.Editable]);

Y.DataTable.EditorOptions = {};

