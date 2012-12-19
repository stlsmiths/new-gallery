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
_yuitest_coverage["build/gallery-datatable-selection/gallery-datatable-selection.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-datatable-selection/gallery-datatable-selection.js",
    code: []
};
_yuitest_coverage["build/gallery-datatable-selection/gallery-datatable-selection.js"].code=["YUI.add('gallery-datatable-selection', function (Y, NAME) {","","/**"," A class extension for DataTable that adds \"highlight\" and \"select\" actions via mouse selection."," The extension works in either \"cell\" mode or \"row\" mode (set via attribute [selectionMode](#attr_selectionMode)).",""," Highlighting is controlled by the [highlightMode](#attr_highlightMode) attribute (either \"cell\" or \"row\")."," (Highlighting provides a \"mouseover\" indication only), and a delegated \"mouseover\" event is defined in this module.",""," Selection is provided via \"click\" listeners, by setting a delegated \"click\" handler on the TD or TR elements.",""," This extension includes the ability to select \"multiple\" items, by setting the [selectionMulti](#attr_selectionMulti)"," attribute (enabled using browser multi-select click modifier, i.e. \"Cmd\" key on Mac OSX or \"Ctrl\" key on Windows / Linux).",""," Additionally, a \"range\" selection capability is provided by using the browser range selector click key modifier,"," specifically the Shift key on most systems.",""," The extension has been written to allow preserving the \"selected\" rows or cells during \"sort\" operations.  This is"," accomplished by storing the selected TR's basis record, specifically the \"clientId\" attribute which remains unique"," after sorting operations.",""," Specific attributes are provided that can be read for current selections, including the ATTRS [selectedRows](#attr_selectedRows),"," and [selectedCells](#attr_selectedCells).",""," Typical usage would be to set the \"selectionMode\" and \"highlightMode\" attributes (and selectionMulti if desired) and then"," to provide a positive control (like a BUTTON or A link) to process the selections.  Two events are provided,  [selection](#event_selection)"," and [selected](#event_selected) but these fire for every \"click\" action, which may not be ideal -- especially for multi selections.",""," @module gallery-datatable-selection"," @class Y.DataTable.Selection"," @extends Y.DataTable"," @author Todd Smith"," @since 3.6.0"," **/","function DtSelection() {}","","DtSelection.ATTRS = {","    /**","     * Node for the most recent \"highlighted\" item, either TD or TR","     * @attribute highlighted","     * @type {Node}","     * @default null","     */","    highlighted : {","        value:      null,","        validator:  function(v){ return (v instanceof Y.Node) || v === null; }","    },","","    /**","     * Node for the most recent \"selected\" item, either TD or TR","     * @attribute selected","     * @type {Node}","     * @default null","     */","    selected:{","        value:      null,","        validator:  function(v){ return (v instanceof Y.Node) || v === null; }","    },","","    /**","     * Set the current mode for highlighting, either for a single TD (as \"cell\") or for a","     * full TR (as \"row\") or \"none\" for no highlighting","     * @attribute highlightMode","     * @type {String}","     * @default 'none'","     */","    highlightMode:{","        value:      'none',","        setter:     '_setHighlightMode',","        validator:  function(v){","            if (!Y.Lang.isString(v)) {","                return false;","            }","            return (v === 'none' || v === 'cell' || v ==='row' ) ? true : false;","        }","    },","","    /**","     * Set the current mode for indicating selections, either for a single TD (as \"cell\") or for a","     * full TR (as \"row\") or 'none' for no selection","     *","     * @attribute selectionMode","     * @type {String}","     * @default 'none'","     */","    selectionMode:{","        value:      'none',","        setter:     '_setSelectionMode',","        validator:  function(v){","            if (!Y.Lang.isString(v)) {","                return false;","            }","            return (v === 'none' || v === 'cell' || v ==='row' ) ? true : false;","        }","    },","","    /**","     * Attribute that holds the selected TR's associated with either the selected \"rows\" or the","     *  TR's that are related to the selected \"cells\", duplicates are excluded.","     *","     * On input, accepts an Array of record indices for rows that should be set as \"selected\".","     * (Please refer to method [_setSelectedRows](#method__setSelectedRows))","     *","     *          dt.set('selectedRows',[ 1, 5, 9, 11]);","     *          // selects the 2nd, 6th, 10th and 12th records","     *","     * For reading this setting, it returns an Array of objects containing {tr,record,recordIndex} for each","     *  selected \"row\"; where \"tr\" is a Y.Node instance and \"record\" is the Model for the TR and \"recordIndex\" is the","     *  record index within the current dataset.","     * (Please refer to method [_getSelectedRows](#method__getSelectedRows))","     *","     * @attribute selectedRows","     * @type {Array}","     * @default []","     */","    selectedRows: {","        value:      [],","        validator:  Y.Lang.isArray,","        getter:     '_getSelectedRows',","        setter:     '_setSelectedRows'","    },","","    /**","     * Attribute that holds the selected TD's associated with the selected \"cells\", or related to the","     *  selected \"rows\" if that is the `selectionMode`.","     *","     *  On input, an Array can be provided to pre-set as \"selected\" cells, defined as each element being","     *  in {record,column} format; where \"record\" is the record index (or clientId) and \"column\" is either","     *  the column index or the key/name for the column.","     *  (Please see method [_setSelectedCells](#method__setSelectedCells) for reference).","     *","     *          dt.set('selectedCells',[{record:0,column:'fname'}, {record:187,column:7} ]);","     *","     *  For reading the selected cells (via \"get\"), an array is returned with contains {Object} elements","     *  that describe the row / column combinations of each currently selected cell.","     *  (Please see method [_getSelectedCells](#method__getSelectedCells) for full information on the returned objects).","     *","     * @attribute selectedCells","     * @type {Array}","     * @default []","     */","    selectedCells: {","        value:      [],","        validator:  Y.Lang.isArray,","        setter:     '_setSelectedCells',","        getter:     '_getSelectedCells'","    },","","    /**","     * Flag to allow either single \"selections\" (false) or multiple selections (true).","     * For Macintosh OSX-type systems the modifier key \"Cmd\" is held for multiple selections,","     *  and for Windows or Linux type systems the modifier key is \"Ctrl\".","     *","     * @attribute selectionMulti","     * @type {Boolean}","     * @default false","     */","    selectionMulti: {","        value:      false,","        validator:  Y.Lang.isBoolean","    }","","};","","","Y.mix( DtSelection.prototype, {","","    /**","     * @property _selections","     * @type Array","     * @default null","     * @static","     * @protected","     */","    _selections: null,","","    /**","     * Holder for the classname for the \"highlight\" TR or TD","     * @property _classHighlight","     * @type String","     * @default null","     * @static","     * @protected","     */","    _classHighlight: null,","","    /**","     * Holder for the classname for the \"selected\" TR or TD","     * @property _classSelected","     * @type String","     * @default null","     * @static","     * @protected","     */","    _classSelected: null,","","    /**","     * Holder for the most recent \"click\" event modifier keys from last click,","     *  used for assessing \"multi\" selections.","     *","     * Contains properties;  altKey, ctrlKey, shiftKey, metaKey, button and which","     *","     * Filled initially by .initializer and on each Table \"click\".","     *","     * @property _clickModifiers","     * @type Object","     * @default null","     * @static","     * @protected","     */","    _clickModifiers: null,","","    /**","     * Holder for the event subscription handles so that this compoent can be destroyed","     *  by removing listeners","     *","     * @property _subscrSelectComp","     * @type Array of EventHandles","     * @default null","     * @static","     * @protected","     */","    _subscrSelectComp : null,","","    /**","     * Holder for the event subscription handles so that this compoent can be destroyed","     *  by removing listeners","     *","     * @property _subscrSelect","     * @type EventHandle","     * @default null","     * @static","     * @protected","     */","    _subscrSelect : null,","","    /**","     * Holder for the event subscription handles so that this compoent can be destroyed","     *  by removing listeners","     *","     * @property _subscrHighlight","     * @type EventHandle","     * @default null","     * @static","     * @protected","     */","    _subscrHighlight : null,","","","//------------------------------------------------------------------------------------------------------","//        L I F E C Y C L E    M E T H O D S","//------------------------------------------------------------------------------------------------------","","    /**","     * Initializes and sets initial bindings for the datatable-selection module","     * @method initializer","     * @protected","     */","    initializer: function(){","        this._bindSelector();","    },","","    /**","     * Destructor to clean up bindings.","     * @method destructor","     * @protected","     */","    destructor: function () {","        this._unbindSelector();","    },","","","","//------------------------------------------------------------------------------------------------------","//        P U B L I C     M E T H O D S","//------------------------------------------------------------------------------------------------------","","    /**","     * Method to enable the datatable-selection module","     * @method disableSelection","     * @public","     */","    enableSelection: function(){","        this.disableSelection();","        this._bindSelector();","    },","","    /**","     * Method to disable the datatable-selection module (cleans up listeners and user interface).","     * @method disableSelection","     * @public","     */","    disableSelection: function(){","        this.clearAll();","        this._unbindSelector();","    },","","    /**","     * Returns the Column object (from the original \"columns\") associated with the input TD Node.","     * @method getColumnByTd","     * @param {Node} cell Node of TD for which column object is desired","     * @return {Object} column The column object entry associated with the desired cell","     * @public","     */","    getColumnByTd:  function(cell){","        var colName = this.getColumnNameByTd(cell);","        return (colName) ? this.getColumn(colName) : null;","    },","","","    /**","     * Returns the column \"key\" or \"name\" string for the requested TD Node","     * @method getColumnNameByTd","     * @param {Node} cell Node of TD for which column name is desired","     * @return {String} colName Column name or key name","     * @public","     */","    getColumnNameByTd: function(cell){","        var classes = cell.get('className').split(\" \"),","            regCol  = new RegExp( this.getClassName('col') + '-(.*)'),","            colName;","","        Y.Array.some(classes,function(item) {","            var colmatch =  item.match(regCol);","            if ( colmatch && Y.Lang.isArray(colmatch) && colmatch[1] ) {","                colName = colmatch[1];","                return true;","            }","        });","","        return colName || null;","    },","","    /**","     * Removes all \"selected\" classes from DataTable and resets internal selections counters and \"selected\" attribute.","     * @method clearSelections","     * @public","     */","    clearSelections: function(){","        this._selections = [];","        this.set('selected',null);","        this._clearAll(this._classSelected);","    },","","    /**","     * Removes all \"highlight\" classes from DataTable and resets `highlighted` attribute.","     * @method clearHighlighted","     * @public","     */","    clearHighlighted: function(){","        this.set('highlighted',null);","        this._clearAll(this._classHighlight);","    },","","    /**","     * Removes all highlighting and selections on the DataTable.","     * @method clearAll","     * @public","     */","    clearAll: function(){","        this.clearSelections();","        this.clearHighlighted();","    },","","//------------------------------------------------------------------------------------------------------","//        P R I V A T E    M E T H O D S","//------------------------------------------------------------------------------------------------------","","    /**","     * Sets listeners and initial class names required for this \"datatable-selector\" module","     *","     * Note:  Delegated \"click\" listeners are defined in _setSelectedMode and _setHightlightMode methods","     *","     * @method _bindSelector","     * @private","     */","    _bindSelector: function(){","        this._selections = [];","        this._subscrSelectComp = [];","","        this._subscrSelectComp.push( this.on('highlightedChange',this._highlightChange) );","        this._subscrSelectComp.push( this.on('selectedChange',this._selectedChange) );","","        // set CSS classes for highlighting and selected,","        //    currently as  \".yui3-datatable-sel-highlighted\" and \".yui3-datatable-sel-selected\"","        this._classHighlight = this.getClassName('sel','highlighted');","        this._classSelected  = this.getClassName('sel','selected');","","        //","        //  These listeners are here solely for \"sort\" actions, to allow preserving the \"selections\"","        //   pre-sort and re-applying them after the TBODY has been sorted and displayed","        //","    //    this._subscrSelectComp.push( this.before('sort', this._beforeResetDataSelect) );","        this._subscrSelectComp.push( this.after('sort', this._afterResetDataSelect) );","    //        this._subscrSelectComp.push( this.data.before('*:reset', Y.bind('_beforeResetDataSelect', this) ) );","    //        this._subscrSelectComp.push( this.data.after('*:reset', Y.bind('_afterResetDataSelect', this) ) );","","        // track click modifier keys from last click, this is the tempalte","        this._clickModifiers = {","            ctrlKey:null, altKey:null, metaKey:null, shiftKey:null, which:null, button:null","        };","    },","","    /**","     * Cleans up listener event handlers and static properties.","     * @method _unbindSelector","     * @private","     */","    _unbindSelector: function(){","","        // clear all current visual UI settings","        this._clearAll(this._classHighlight);","        this._clearAll(this._classSelected);","","        // detach listener on DT \"click\" event","        if ( this._subscrSelect && this._subscrSelect.detach ) {","            this._subscrSelect.detach();","        }","        this._subscrSelect = null;","","        // detach listener on DT \"mouseenter\" event","        if ( this._subscrHighlight && this._subscrHighlight.detach ) {","            this._subscrHighlight.detach();","        }","        this._subscrHighlight = null;","","        // clear up other listeners set in bindSelector ...","        if ( this._subscrHighlight","            && this._subscrHighlight.detach ) {","                this._subscrHighlight.detach();","        }","        this._subscrHighlight = null;","","        // Clear up the overall component listeners (array)","        Y.Array.each( this._subscrSelectComp,function(item){","            if (!item) {","                return;","            }","","            if(Y.Lang.isArray(item)) {","                Y.Array.each(item,function(si){","                    si.detach();","                });","            } else if (item.detach) {","                item.detach();","            }","        });","        this._subscrSelectComp = null;","","        // clean up static props set","        this._clickModifiers = null;","        this._selections = null;","        this._classHighlight = null;","        this._classSelected  = null;","","    },","","    /**","     * Method that updates the \"highlighted\" classes for the selection and unhighlights the prevVal","     * @method _highlightChange","     * @param o","     * @private","     */","    _highlightChange: function(o) {","        this._processNodeAction(o,'highlight',true);","        return;","    },","","    /**","     * Method that updates the \"selected\" classes for the selection and un-selects the prevVal.","     * This method works with multiple selections (via ATTR `selectionMulti` true) by pushing","     * the current selection to the this._selections property.","     *","     * @method _selectedChange","     * @param o","     * @private","     */","    _selectedChange: function(o){","        // Evaluate a flag to determine whether previous selections should be cleared or \"kept\"","        var keepPrev, keepRange, tar, sobj;","","        if ( Y.UA.os.search('macintosh') === 0 ) {","            keepPrev =  this.get('selectionMulti') === true && this._clickModifiers.metaKey === true;","        } else {","            keepPrev =  this.get('selectionMulti') === true && this._clickModifiers.ctrlKey === true;","        }","","        keepRange = this.get('selectionMulti') === true && this._clickModifiers.shiftKey === true;","","        // clear any SHIFT selected text first ...","        this._clearDOMSelection();","","        // if not-multi mode and more than one selection, clear them first ...","        if ( !keepPrev && !keepRange && this._selections.length>1 ) {","            this.clearSelections();","        }","","        if ( keepRange ) {","","            this._processRange(o);","","        }  else {","","            // Process the action ... updating 'select' class","            tar = this._processNodeAction(o,'select', !keepPrev );","","            if ( !keepPrev ) {","                this._selections = [];","            }","","            if(this.get('selectionMode')==='row') {","                this._selections.push( this._selectTr(tar) );","            } else {","                this._selections.push( this._selectTd(tar) );","            }","","        }","","        this.fire('selected',{","            ochange: o,","            record: this.getRecord(o.newVal)","        });","","        //","        //  Fire a generic \"selection\" event that returns selected data according to the current \"selectionMode\" setting","        //","        sobj = { selectionMode : this.get('selectionMode')  };","","        if(this.get('selectionMode')==='cell') {","            sobj.cells = this.get('selectedCells');","        } else if (this.get('selectionMode')==='row') {","            sobj.rows = this.get('selectedRows');","        }","","        this.fire('selection',sobj);","    },","","    /**","     * Event that fires on every \"select\" action and returns the LAST SELECTED item, either a cell or a row.","     * Please see the event \"selection\" which provides a cumulative total of all selected items as opposed to","     * just the last item.   (Fired from method [_selectedChange](#method__selectedChange)","     *","     * @event selected","     * @param {Object} obj Return object","     * @param {Object} obj.ochange Change event object passed from attribute 'selected'","     * @param {Object} obj.record DataTable record (Y.Model) instance for the selection","     */","","    /**","     * Event that fires on every DataTable \"select\" event, returns current selections, either cells or rows depending","     * on the current \"selectionMode\".  (Fired from method [_selectedChange](#method__selectedChange)","     *","     *","     * @event selection","     * @param {Object} obj Return object","     * @param {Object} obj.selectionMode Current setting of attribute [selectionMode](#attr_selectionMode)","     * @param {Object} obj.cells Returns the current setting of the attribute [selectedCells](#attr_selectedCells)","     * @param {Object} obj.rows Returns the current setting of the attribute [selectedRows](#attr_selectedRows)","     */","","","    /**","     * Called when a \"range\" selection is detected (i.e. SHIFT key held during click) that selects","     * a range of TD's or TR's (depending on [selectionMode](#attr_selectionMode) setting.","     *","     * @method _processRange","     * @param {Node} o Last clicked TD of range selection","     * @private","     */","    _processRange: function(o) {","        var tarNew  = o.newVal,","            tarPrev = o.prevVal || null,","            newRec, newRecI, newCol, newColI, prevRec, prevRecI, prevCol, prevColI, delCol, delRow,","            coldir, rowdir, cell, i, j, tr, sel;","","        //","        //  Process through the first and last targets ...","        //","        if ( tarNew && tarPrev ) {","            newRec  = this.getRecord(tarNew);","            newRecI = this.data.indexOf(newRec);","            newCol  = this.getColumnNameByTd(tarNew);","            newColI = Y.Array.indexOf(this.get('columns'),this.getColumn(newCol));","            prevRec  = this.getRecord(tarPrev);","            prevRecI = this.data.indexOf(prevRec);","            prevCol  = this.getColumnNameByTd(tarPrev);","            prevColI = Y.Array.indexOf(this.get('columns'),this.getColumn(prevCol));","","            // Calculate range offset ... delCol (horiz) and delRow (vertically)","            delCol = newColI - prevColI;","            delRow = newRecI - prevRecI;","","            // if we have valid deltas, update the range cells.","            if ( delCol !== null && delRow !== null) {","","                if (Y.Lang.isArray(this._selections) ) {","                    this.clearSelections();","                }","","                // Select a range of CELLS (i.e. TD's) ...","                if ( this.get('selectionMode') === 'cell' ) {","                    coldir = (delCol<0) ? -1 : 1;","                    rowdir = (delRow<0) ? -1 : 1;","                    cell = tarPrev;","","                    for(j=0; j<=Math.abs(delRow); j++) {","                        for(i=0; i<=Math.abs(delCol); i++) {","                            cell = this.getCell(tarPrev,[rowdir*(j),coldir*(i)]);","                            if (cell) {","                                cell.addClass(this._classSelected);","                                sel = this._selectTd(cell);","                                this._selections.push( sel );","                            }","                        }","                    }","                // Select a range of ROWS (i.e. TR's)","                } else if ( this.get('selectionMode') === 'row' ) {","","                    rowdir = (delRow<0) ? -1 : 1;","                    tr = this.getRow(prevRecI);","","                    for(j=0; j<=Math.abs(delRow); j++) {","                        tr = this.getRow(prevRecI+rowdir*(j));","                        if (tr) {","                            tr.addClass(this._classSelected);","                            sel = this._selectTr(tr);","                            this._selections.push( sel );","                        }","                    }","","                }","","            }","","        }","","    },","","","    /**","     * Returns the current settings of row selections, includes multiple selections.  If the","     * current `selectionMode` is \"cell\" mode, this function returns the unique \"records\" associated with","     * the selected cells.","     *","     * **Returned** `rows` {Array} of objects in format;","     * <ul>","     *   <li>`rows.tr` {Node} Node instance of the TR that was selected</li>","     *   <li>`rows.record` {Model} The Model associated with the data record for the selected TR</li>","     *   <li>`rows.recordIndex` {Integer} The record index of the selected TR within the current \"data\" set</li>","     *   <li>`rows.recordClientId {String} The record clientId attribute setting</li>","     * </ul>","","     * @method _getSelectedRows","     * @return {Array} rows Array of selected \"rows\" as objects in {tr,record,recordIndex} format","     * @private","     */","    _getSelectedRows: function(){","        var trs  = [],","            rows = [],","            tr, rec;","        ","        Y.Array.each(this._selections,function(item){","            if(!item || !item.recClient) {","                return;","            }","","            tr  = this.getRow(item.recClient);","","            // if and only if, it's a TR and not in \"trs\" array ... then add it","            if ( Y.Array.indexOf(trs,tr) === -1 ) {","                rec = this.data.getByClientId( item.recClient );","                trs.push( tr );","                rows.push({","                    tr:             tr,    // this is an OLD, stale TR from pre-sort","                    record:         rec,","                    recordIndex:    this.data.indexOf(rec),","                    recordClientId: item.recClient","                });","            }","        },this);","        return rows;","    },","","","","    /**","     * Getter method that returns an Array of the selected cells in record/column coordinate format.","     * If rows or TR elements were selected, it adds all of the row's child TD's.","     *","     * **Returned** `cells` {Array} of objects in format;","     * <ul>","     *   <li>`cells.td` {Node} TD Node for this cell.</li>","     *   <li>`cells.record` {Model} Record for this cell as a Y.Model</li>","     *   <li>`cells.recordIndex` {Integer} Record index for this cell in the current \"data\" set</li>","     *   <li>`cells.column` {Object} Column for this cell defined in original \"columns\" DataTable attribute</li>","     *   <li>`cells.columnName` {String} Column name or key associated with this cell</li>","     *   <li>`cells.columnIndex` {Integer} Column index of the column, within the \"columns\" data</li>","     * </ul>","     *","     * @method _getSelectedCells","     * @return {Array} cells The selected cells in {record,recordIndex,column,columnName,columnIndex} format","     * @private","     */","    _getSelectedCells: function(){","        var cells = [],","            cols  = this.get('columns'),","            col, tr, rec;","","        Y.Array.each(this._selections,function(item){","            if (!item) {","                return;","            }","","            if ( item.td ) {","                col = this.getColumn(item.colName);","                tr  = item.tr;","                rec = this.data.getByClientId(item.recClient);","","                cells.push({","                    td:          item.td,","                    record:      rec,","                    recordIndex: this.data.indexOf(rec),","                    recordClientId:  item.recClient,","                    column:      col,","                    columnName:  item.colName,","                    columnIndex: Y.Array.indexOf(cols,col)","                });","            } else if ( item.tr ) {","                tr = item.tr;","                rec = this.data.getByClientId(item.recClient);","                var tdNodes = tr.all(\"td\");","                if ( tdNodes ) {","                    tdNodes.each(function(td){","                        col = this.getColumnByTd(td);","                        cells.push({","                            td:          td,","                            record:      rec,","                            recordIndex: this.data.indexOf(rec),","                            recordClientId:  item.recClient,","                            column:      col,","                            columnName:  col.key || col.name,","                            columnIndex: Y.Array.indexOf(cols,col)","                        });","                    },this);","                }","            }","        },this);","        return cells;","    },","","    /**","     * Setter method for attribute `selectedCells` that takes an array of cells as input and sets them","     * as the current selected set with appropriate visual class.","     *","     * @method _setSelectedCells","     * @param {Array} val The desired cells to set as selected, in {record:,column:} format","     * @param {String|Number} val.record Record for this cell as either record index or record clientId","     * @param {String|Number} val.column Column for this cell as either the column index or \"key\" or \"name\"","     * @return {Array}","     * @private","     */","    _setSelectedCells: function(val){","        this._selections = [];","        if ( Y.Lang.isArray(val) && this.data.size() > val.length ) {","            Y.Array.each(val,function(item) {","                var row, col, td, ckey,sel;","                row = ( Y.Lang.isNumber(item.record) ||","                    typeof item.record ==='string') ? this.getRow( item.record ) : row;","                col = ( Y.Lang.isNumber(item.column) ||","                    typeof item.column ==='string' ) ? this.getColumn(item.column) : col;","","                if ( row && col ) {","                    ckey = col.key || col.name;","                    if ( ckey ) {","                        td  = row.one('.'+this.getClassName('col')+'-'+ckey);","                        sel = this._selectTd(td);","                        if(sel) {","                            this._selections.push(sel);","                        }","                        td.addClass(this._classSelected);","                    }","                }","","            },this);","        }","        return val;","    },","","","    /**","     * A setter method for attribute `selectedRows` that takes as input an array of desired DataTable","     * record indices to be \"selected\", clears existing selections and sets the \"selected\" records and","     * highlights the TR's","     *","     * @method _setSelectedRows","     * @param  {Array} val Array of record indices (or record \"clientId\") desired to be set as selected.","     * @return {Array} records Array of DataTable records (Y.Model) for each selection chosen","     * @private","     */","    _setSelectedRows: function(val){","        this._selections = [];","        if ( Y.Lang.isArray(val) && this.data.size() > val.length ) {","            Y.Array.each(val,function(item){","                var tr = this.getRow(item),","                    sel;","                if ( tr ) {","                    sel = this._selectTr(tr);","                    if(sel) {","                        this._selections.push( sel );","                    }","                    tr.addClass(this._classSelected);","                }","            },this);","        }","        return val;","    },","","","    /**","     * Method that returns a TD's \"selection obj\" expected for the _selections buffer","     * @method _selectTd","     * @param tar {Node}  A Node instance of TD to be prepared for selection","     * @return {Object} obj Returned object includes properties (td,tr,recClient,colName)","     * @private","     */","    _selectTd : function(tar){","        var rec,col,rtn=false;","        if(tar && tar.get('tagName').toLowerCase() === 'td') {","            rec = this.getRecord(tar.ancestor());","            col = this.getColumnByTd(tar);","            rtn = {","                td:        tar,","                tr:        tar.ancestor(),","                recClient: (rec) ? rec.get('clientId') : null,","                colName:   col.key || col.name || null","            };","        }","        return rtn;","    },","","    /**","     * Method that returns a TR's \"selection obj\" expected for the _selections buffer","     * @method _selectTr","     * @param tar {Node}  A Node instance of TR to be prepared for selection","     * @return {Object} obj Returned object includes properties (tr,recClient)","     * @private","     */","    _selectTr : function(tar){","        var rec, rtn = false;","        if(tar && tar.get('tagName').toLowerCase() === 'tr') {","            rec = this.getRecord(tar);","            rtn = {","                tr:        tar,","                recClient: (rec) ? rec.get('clientId') : null","            };","        }","        return rtn;","    },","","","    /**","     * Method is fired AFTER a \"reset\" action takes place on the \"data\", usually related to a column sort.","     * This function reads the pre-sorted selections that were stored by  [_beforeResetDataSelect](#method__beforeResetDataSelect)","     * temporarily in this._selections.","     *","     * Depending upon the current \"selectionMode\", either post-sorted TBODY selections are re-applied, by determining either","     * the TR's (from the Model data) or the TD's (from the Model and Column Index data).","     *","     * @method _afterResetDataSelect","     * @private","     */","    _afterResetDataSelect: function() {","        if( !this._selections || this._selections.length === 0 ) {","            return;","        }","        var tr, td, buffer = [], colIndex, col,","            cols = this.get('columns');","","        this._clearAll(this._classSelected);","","","        Y.Array.each(this._selections,function(item){","            if( this.get('selectionMode') === 'row' && item.recClient ) {","                // the \"item\" is a Model pushed prior to the \"sort\" action ...","                tr = this.getRow(item.recClient);","                if( tr ) {","                    buffer.push( this._selectTr(tr) );","                    tr.addClass(this._classSelected);","                }","            } else if (this.get('selectionMode') === 'cell' && item.recClient && item.colName ) {","                tr = this.getRow(item.recClient);","                col = this.getColumn(item.colName);","                colIndex = Y.Array.indexOf(cols,col);","                td = (tr && colIndex >= 0) ? tr.all(\"td\").item(colIndex) : null;","                if(tr && td) {","                    buffer.push( this._selectTd(td) );","                    td.addClass(this._classSelected);","                }","            }","        },this);","","        // swap out the temporary buffer, for the current selections ...","        this._selections = buffer;","","    },","","    /**","     * Method used to derive from the clicked selection, either the TR or TD of the selection, and","     * returns the current `selectionMode` or `highlightMode` Node (based on the setting of prefix).","     *","     * This method adds the required class, and if erasePrev is true, removes the class from the prior setting.","     *","     * @method _processNodeAction","     * @param {Object} o Attribute change event object","     * @param {String} prefix","     * @param {Boolean} erasePrev","     * @return {Node} node Returned target Y.Node, either TR or TD based upon current `selectionMode` or `highlightMode`","     * @private","     */","    _processNodeAction: function(o, prefix, erasePrev ){","        var tar = o.newVal,","            tarNew, tarPrev, modeName, className;","","        if ( prefix === 'highlight') {","            modeName  = prefix + 'Mode';","            className = this._classHighlight;","        } else if ( prefix === 'select' ) {","            modeName  = 'selectionMode';","            className = this._classSelected;","        }","","        if ( this.get(modeName) === \"cell\" ) {","            tarNew  = tar || null;","            tarPrev = o.prevVal || null;","        } else if ( this.get(modeName) === \"row\" ) {","            if ( tar ) {","                tarNew = (tar.get('tagName').search(/td/i) === 0 ) ? tar.ancestor('tr')","                    : ( tar.get('tagName').search(/tr/i) === 0 ) ? tar : null ;","            }","            tarPrev = o.prevVal;","            if (tarPrev) {","                tarPrev = (tarPrev.get('tagName').search(/td/i) === 0 ) ? tarPrev.ancestor('tr')","                    : ( tarPrev.get('tagName').search(/tr/i) === 0 ) ? tarPrev : null ;","            }","        }","","        if ( tarPrev && erasePrev ) {","            tarPrev.removeClass(className);","        }","","        if ( tarNew ) {","            tarNew.addClass(className);","        }","","        return tarNew;","    },","","","    /**","     * Method removes the specified `type` CSS class from all nodes within the TBODY data node.","     * @method _clearAll","     * @param {String} type Class name to remove from all nodes attached to TBODY DATA","     * @private","     */","    _clearAll: function(type){","        var nodes = this.get('boundingBox').one(\".\"+this.getClassName('data'));","        if ( nodes ) {","            nodes.all('.'+type).removeClass(type);","        }","    },","","    /**","     * Setter for `highlightMode` attribute, removes prior event handle (if exists) and defines","     * a new delegated \"mouseover\" handler that updates the `highlighted` attribute.","     *","     * A change to this setting clears all prior highlighting.","     *","     * @method _setHighlightMode","     * @param val","     * @return {*}","     * @private","     */","    _setHighlightMode: function(val){","        if ( this._subscrHighlight ) {","            this._subscrHighlight.detach();","        }","","        if(val==='none') {","            return;","        } else if (val.toLowerCase) {","            val = val.toLowerCase();","        }","","        this._subscrHighlight = this.delegate(\"mouseover\",function(e){","                var tar = e.currentTarget;","                this.set('highlighted',tar);","            },\"tr td\",this);","","        //this._clearAll(this._classHighlight);","        this.clearHighlighted();","        return val;","    },","","    /**","     * Setter for `selectionMode` attribute, removes prior event handle (if exists) and defines","     * a new delegated \"click\" handler that updates the `selected` attribute.","     *","     * A change to this setting clears all prior selections.","     *","     * @method _setSelectionMode","     * @param val","     * @return {*}","     * @private","     */","    _setSelectionMode: function(val){","        var oSelf = this;","        if ( this._subscrSelect ) {","            this._subscrSelect.detach();","        }","","        if(val==='none') {","            return;","        } else if (val.toLowerCase) {","            val = val.toLowerCase();","        }","","        this._subscrSelect = this.delegate(\"click\",function(e){","                var tar = e.currentTarget;","","               // Disabled 11/16/12: was preventing checkbox listeners to fire","               // e.halt(true);","","                oSelf._clickModifiers = {","                    ctrlKey:  e.ctrlKey,","                    altKey:   e.altKey,","                    metaKey:  e.metaKey,","                    shiftKey: e.shiftKey,","                    which:    e.which,","                    button:   e.button","                };","","                oSelf.set('selected',tar);","","            },\"tr td\",oSelf);","        //this._clearAll(this._classSelected);","        this.clearSelections();","        return val;","    },","","    /**","     * Helper method to clear DOM \"selected\" text or ranges","     * @method _clearDOMSelection","     * @private","     */","    _clearDOMSelection: function(){","        var sel = (Y.config.win.getSelection) ? Y.config.win.getSelection()","            : (Y.config.doc.selection) ? Y.config.doc.selection : null;","","        if ( sel && sel.empty ) {","            sel.empty();   // works on chrome","        }","        if ( sel && sel.removeAllRanges ) {","            sel.removeAllRanges();  // works on FireFox","        }","    }","","});","","Y.DataTable.Selection = DtSelection;","Y.Base.mix(Y.DataTable, [Y.DataTable.Selection]);","","","","}, '@VERSION@', {\"skinnable\": \"true\", \"requires\": [\"base-build\", \"datatable-base\", \"event-custom\"]});"];
_yuitest_coverage["build/gallery-datatable-selection/gallery-datatable-selection.js"].lines = {"1":0,"35":0,"37":0,"46":0,"57":0,"71":0,"72":0,"74":0,"90":0,"91":0,"93":0,"166":0,"260":0,"269":0,"284":0,"285":0,"294":0,"295":0,"306":0,"307":0,"319":0,"323":0,"324":0,"325":0,"326":0,"327":0,"331":0,"340":0,"341":0,"342":0,"351":0,"352":0,"361":0,"362":0,"378":0,"379":0,"381":0,"382":0,"386":0,"387":0,"394":0,"399":0,"412":0,"413":0,"416":0,"417":0,"419":0,"422":0,"423":0,"425":0,"428":0,"430":0,"432":0,"435":0,"436":0,"437":0,"440":0,"441":0,"442":0,"444":0,"445":0,"448":0,"451":0,"452":0,"453":0,"454":0,"465":0,"466":0,"480":0,"482":0,"483":0,"485":0,"488":0,"491":0,"494":0,"495":0,"498":0,"500":0,"505":0,"507":0,"508":0,"511":0,"512":0,"514":0,"519":0,"527":0,"529":0,"530":0,"531":0,"532":0,"535":0,"571":0,"579":0,"580":0,"581":0,"582":0,"583":0,"584":0,"585":0,"586":0,"587":0,"590":0,"591":0,"594":0,"596":0,"597":0,"601":0,"602":0,"603":0,"604":0,"606":0,"607":0,"608":0,"609":0,"610":0,"611":0,"612":0,"617":0,"619":0,"620":0,"622":0,"623":0,"624":0,"625":0,"626":0,"627":0,"658":0,"662":0,"663":0,"664":0,"667":0,"670":0,"671":0,"672":0,"673":0,"681":0,"705":0,"709":0,"710":0,"711":0,"714":0,"715":0,"716":0,"717":0,"719":0,"728":0,"729":0,"730":0,"731":0,"732":0,"733":0,"734":0,"735":0,"748":0,"763":0,"764":0,"765":0,"766":0,"767":0,"769":0,"772":0,"773":0,"774":0,"775":0,"776":0,"777":0,"778":0,"780":0,"786":0,"801":0,"802":0,"803":0,"804":0,"806":0,"807":0,"808":0,"809":0,"811":0,"815":0,"827":0,"828":0,"829":0,"830":0,"831":0,"838":0,"849":0,"850":0,"851":0,"852":0,"857":0,"873":0,"874":0,"876":0,"879":0,"882":0,"883":0,"885":0,"886":0,"887":0,"888":0,"890":0,"891":0,"892":0,"893":0,"894":0,"895":0,"896":0,"897":0,"903":0,"921":0,"924":0,"925":0,"926":0,"927":0,"928":0,"929":0,"932":0,"933":0,"934":0,"935":0,"936":0,"937":0,"940":0,"941":0,"942":0,"947":0,"948":0,"951":0,"952":0,"955":0,"966":0,"967":0,"968":0,"984":0,"985":0,"988":0,"989":0,"990":0,"991":0,"994":0,"995":0,"996":0,"1000":0,"1001":0,"1016":0,"1017":0,"1018":0,"1021":0,"1022":0,"1023":0,"1024":0,"1027":0,"1028":0,"1033":0,"1042":0,"1046":0,"1047":0,"1056":0,"1059":0,"1060":0,"1062":0,"1063":0,"1069":0,"1070":0};
_yuitest_coverage["build/gallery-datatable-selection/gallery-datatable-selection.js"].functions = {"DtSelection:35":0,"validator:46":0,"validator:57":0,"validator:70":0,"validator:89":0,"initializer:259":0,"destructor:268":0,"enableSelection:283":0,"disableSelection:293":0,"getColumnByTd:305":0,"(anonymous 2):323":0,"getColumnNameByTd:318":0,"clearSelections:339":0,"clearHighlighted:350":0,"clearAll:360":0,"_bindSelector:377":0,"(anonymous 4):441":0,"(anonymous 3):435":0,"_unbindSelector:409":0,"_highlightChange:464":0,"_selectedChange:478":0,"_processRange:570":0,"(anonymous 5):662":0,"_getSelectedRows:657":0,"(anonymous 7):733":0,"(anonymous 6):709":0,"_getSelectedCells:704":0,"(anonymous 8):765":0,"_setSelectedCells:762":0,"(anonymous 9):803":0,"_setSelectedRows:800":0,"_selectTd:826":0,"_selectTr:848":0,"(anonymous 10):882":0,"_afterResetDataSelect:872":0,"_processNodeAction:920":0,"_clearAll:965":0,"(anonymous 11):994":0,"_setHighlightMode:983":0,"(anonymous 12):1027":0,"_setSelectionMode:1015":0,"_clearDOMSelection:1055":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-selection/gallery-datatable-selection.js"].coveredLines = 264;
_yuitest_coverage["build/gallery-datatable-selection/gallery-datatable-selection.js"].coveredFunctions = 43;
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1);
YUI.add('gallery-datatable-selection', function (Y, NAME) {

/**
 A class extension for DataTable that adds "highlight" and "select" actions via mouse selection.
 The extension works in either "cell" mode or "row" mode (set via attribute [selectionMode](#attr_selectionMode)).

 Highlighting is controlled by the [highlightMode](#attr_highlightMode) attribute (either "cell" or "row").
 (Highlighting provides a "mouseover" indication only), and a delegated "mouseover" event is defined in this module.

 Selection is provided via "click" listeners, by setting a delegated "click" handler on the TD or TR elements.

 This extension includes the ability to select "multiple" items, by setting the [selectionMulti](#attr_selectionMulti)
 attribute (enabled using browser multi-select click modifier, i.e. "Cmd" key on Mac OSX or "Ctrl" key on Windows / Linux).

 Additionally, a "range" selection capability is provided by using the browser range selector click key modifier,
 specifically the Shift key on most systems.

 The extension has been written to allow preserving the "selected" rows or cells during "sort" operations.  This is
 accomplished by storing the selected TR's basis record, specifically the "clientId" attribute which remains unique
 after sorting operations.

 Specific attributes are provided that can be read for current selections, including the ATTRS [selectedRows](#attr_selectedRows),
 and [selectedCells](#attr_selectedCells).

 Typical usage would be to set the "selectionMode" and "highlightMode" attributes (and selectionMulti if desired) and then
 to provide a positive control (like a BUTTON or A link) to process the selections.  Two events are provided,  [selection](#event_selection)
 and [selected](#event_selected) but these fire for every "click" action, which may not be ideal -- especially for multi selections.

 @module gallery-datatable-selection
 @class Y.DataTable.Selection
 @extends Y.DataTable
 @author Todd Smith
 @since 3.6.0
 **/
_yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 35);
function DtSelection() {}

_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 37);
DtSelection.ATTRS = {
    /**
     * Node for the most recent "highlighted" item, either TD or TR
     * @attribute highlighted
     * @type {Node}
     * @default null
     */
    highlighted : {
        value:      null,
        validator:  function(v){ _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "validator", 46);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 46);
return (v instanceof Y.Node) || v === null; }
    },

    /**
     * Node for the most recent "selected" item, either TD or TR
     * @attribute selected
     * @type {Node}
     * @default null
     */
    selected:{
        value:      null,
        validator:  function(v){ _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "validator", 57);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 57);
return (v instanceof Y.Node) || v === null; }
    },

    /**
     * Set the current mode for highlighting, either for a single TD (as "cell") or for a
     * full TR (as "row") or "none" for no highlighting
     * @attribute highlightMode
     * @type {String}
     * @default 'none'
     */
    highlightMode:{
        value:      'none',
        setter:     '_setHighlightMode',
        validator:  function(v){
            _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "validator", 70);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 71);
if (!Y.Lang.isString(v)) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 72);
return false;
            }
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 74);
return (v === 'none' || v === 'cell' || v ==='row' ) ? true : false;
        }
    },

    /**
     * Set the current mode for indicating selections, either for a single TD (as "cell") or for a
     * full TR (as "row") or 'none' for no selection
     *
     * @attribute selectionMode
     * @type {String}
     * @default 'none'
     */
    selectionMode:{
        value:      'none',
        setter:     '_setSelectionMode',
        validator:  function(v){
            _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "validator", 89);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 90);
if (!Y.Lang.isString(v)) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 91);
return false;
            }
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 93);
return (v === 'none' || v === 'cell' || v ==='row' ) ? true : false;
        }
    },

    /**
     * Attribute that holds the selected TR's associated with either the selected "rows" or the
     *  TR's that are related to the selected "cells", duplicates are excluded.
     *
     * On input, accepts an Array of record indices for rows that should be set as "selected".
     * (Please refer to method [_setSelectedRows](#method__setSelectedRows))
     *
     *          dt.set('selectedRows',[ 1, 5, 9, 11]);
     *          // selects the 2nd, 6th, 10th and 12th records
     *
     * For reading this setting, it returns an Array of objects containing {tr,record,recordIndex} for each
     *  selected "row"; where "tr" is a Y.Node instance and "record" is the Model for the TR and "recordIndex" is the
     *  record index within the current dataset.
     * (Please refer to method [_getSelectedRows](#method__getSelectedRows))
     *
     * @attribute selectedRows
     * @type {Array}
     * @default []
     */
    selectedRows: {
        value:      [],
        validator:  Y.Lang.isArray,
        getter:     '_getSelectedRows',
        setter:     '_setSelectedRows'
    },

    /**
     * Attribute that holds the selected TD's associated with the selected "cells", or related to the
     *  selected "rows" if that is the `selectionMode`.
     *
     *  On input, an Array can be provided to pre-set as "selected" cells, defined as each element being
     *  in {record,column} format; where "record" is the record index (or clientId) and "column" is either
     *  the column index or the key/name for the column.
     *  (Please see method [_setSelectedCells](#method__setSelectedCells) for reference).
     *
     *          dt.set('selectedCells',[{record:0,column:'fname'}, {record:187,column:7} ]);
     *
     *  For reading the selected cells (via "get"), an array is returned with contains {Object} elements
     *  that describe the row / column combinations of each currently selected cell.
     *  (Please see method [_getSelectedCells](#method__getSelectedCells) for full information on the returned objects).
     *
     * @attribute selectedCells
     * @type {Array}
     * @default []
     */
    selectedCells: {
        value:      [],
        validator:  Y.Lang.isArray,
        setter:     '_setSelectedCells',
        getter:     '_getSelectedCells'
    },

    /**
     * Flag to allow either single "selections" (false) or multiple selections (true).
     * For Macintosh OSX-type systems the modifier key "Cmd" is held for multiple selections,
     *  and for Windows or Linux type systems the modifier key is "Ctrl".
     *
     * @attribute selectionMulti
     * @type {Boolean}
     * @default false
     */
    selectionMulti: {
        value:      false,
        validator:  Y.Lang.isBoolean
    }

};


_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 166);
Y.mix( DtSelection.prototype, {

    /**
     * @property _selections
     * @type Array
     * @default null
     * @static
     * @protected
     */
    _selections: null,

    /**
     * Holder for the classname for the "highlight" TR or TD
     * @property _classHighlight
     * @type String
     * @default null
     * @static
     * @protected
     */
    _classHighlight: null,

    /**
     * Holder for the classname for the "selected" TR or TD
     * @property _classSelected
     * @type String
     * @default null
     * @static
     * @protected
     */
    _classSelected: null,

    /**
     * Holder for the most recent "click" event modifier keys from last click,
     *  used for assessing "multi" selections.
     *
     * Contains properties;  altKey, ctrlKey, shiftKey, metaKey, button and which
     *
     * Filled initially by .initializer and on each Table "click".
     *
     * @property _clickModifiers
     * @type Object
     * @default null
     * @static
     * @protected
     */
    _clickModifiers: null,

    /**
     * Holder for the event subscription handles so that this compoent can be destroyed
     *  by removing listeners
     *
     * @property _subscrSelectComp
     * @type Array of EventHandles
     * @default null
     * @static
     * @protected
     */
    _subscrSelectComp : null,

    /**
     * Holder for the event subscription handles so that this compoent can be destroyed
     *  by removing listeners
     *
     * @property _subscrSelect
     * @type EventHandle
     * @default null
     * @static
     * @protected
     */
    _subscrSelect : null,

    /**
     * Holder for the event subscription handles so that this compoent can be destroyed
     *  by removing listeners
     *
     * @property _subscrHighlight
     * @type EventHandle
     * @default null
     * @static
     * @protected
     */
    _subscrHighlight : null,


//------------------------------------------------------------------------------------------------------
//        L I F E C Y C L E    M E T H O D S
//------------------------------------------------------------------------------------------------------

    /**
     * Initializes and sets initial bindings for the datatable-selection module
     * @method initializer
     * @protected
     */
    initializer: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "initializer", 259);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 260);
this._bindSelector();
    },

    /**
     * Destructor to clean up bindings.
     * @method destructor
     * @protected
     */
    destructor: function () {
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "destructor", 268);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 269);
this._unbindSelector();
    },



//------------------------------------------------------------------------------------------------------
//        P U B L I C     M E T H O D S
//------------------------------------------------------------------------------------------------------

    /**
     * Method to enable the datatable-selection module
     * @method disableSelection
     * @public
     */
    enableSelection: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "enableSelection", 283);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 284);
this.disableSelection();
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 285);
this._bindSelector();
    },

    /**
     * Method to disable the datatable-selection module (cleans up listeners and user interface).
     * @method disableSelection
     * @public
     */
    disableSelection: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "disableSelection", 293);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 294);
this.clearAll();
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 295);
this._unbindSelector();
    },

    /**
     * Returns the Column object (from the original "columns") associated with the input TD Node.
     * @method getColumnByTd
     * @param {Node} cell Node of TD for which column object is desired
     * @return {Object} column The column object entry associated with the desired cell
     * @public
     */
    getColumnByTd:  function(cell){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "getColumnByTd", 305);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 306);
var colName = this.getColumnNameByTd(cell);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 307);
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
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "getColumnNameByTd", 318);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 319);
var classes = cell.get('className').split(" "),
            regCol  = new RegExp( this.getClassName('col') + '-(.*)'),
            colName;

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 323);
Y.Array.some(classes,function(item) {
            _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 2)", 323);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 324);
var colmatch =  item.match(regCol);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 325);
if ( colmatch && Y.Lang.isArray(colmatch) && colmatch[1] ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 326);
colName = colmatch[1];
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 327);
return true;
            }
        });

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 331);
return colName || null;
    },

    /**
     * Removes all "selected" classes from DataTable and resets internal selections counters and "selected" attribute.
     * @method clearSelections
     * @public
     */
    clearSelections: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "clearSelections", 339);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 340);
this._selections = [];
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 341);
this.set('selected',null);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 342);
this._clearAll(this._classSelected);
    },

    /**
     * Removes all "highlight" classes from DataTable and resets `highlighted` attribute.
     * @method clearHighlighted
     * @public
     */
    clearHighlighted: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "clearHighlighted", 350);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 351);
this.set('highlighted',null);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 352);
this._clearAll(this._classHighlight);
    },

    /**
     * Removes all highlighting and selections on the DataTable.
     * @method clearAll
     * @public
     */
    clearAll: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "clearAll", 360);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 361);
this.clearSelections();
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 362);
this.clearHighlighted();
    },

//------------------------------------------------------------------------------------------------------
//        P R I V A T E    M E T H O D S
//------------------------------------------------------------------------------------------------------

    /**
     * Sets listeners and initial class names required for this "datatable-selector" module
     *
     * Note:  Delegated "click" listeners are defined in _setSelectedMode and _setHightlightMode methods
     *
     * @method _bindSelector
     * @private
     */
    _bindSelector: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_bindSelector", 377);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 378);
this._selections = [];
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 379);
this._subscrSelectComp = [];

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 381);
this._subscrSelectComp.push( this.on('highlightedChange',this._highlightChange) );
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 382);
this._subscrSelectComp.push( this.on('selectedChange',this._selectedChange) );

        // set CSS classes for highlighting and selected,
        //    currently as  ".yui3-datatable-sel-highlighted" and ".yui3-datatable-sel-selected"
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 386);
this._classHighlight = this.getClassName('sel','highlighted');
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 387);
this._classSelected  = this.getClassName('sel','selected');

        //
        //  These listeners are here solely for "sort" actions, to allow preserving the "selections"
        //   pre-sort and re-applying them after the TBODY has been sorted and displayed
        //
    //    this._subscrSelectComp.push( this.before('sort', this._beforeResetDataSelect) );
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 394);
this._subscrSelectComp.push( this.after('sort', this._afterResetDataSelect) );
    //        this._subscrSelectComp.push( this.data.before('*:reset', Y.bind('_beforeResetDataSelect', this) ) );
    //        this._subscrSelectComp.push( this.data.after('*:reset', Y.bind('_afterResetDataSelect', this) ) );

        // track click modifier keys from last click, this is the tempalte
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 399);
this._clickModifiers = {
            ctrlKey:null, altKey:null, metaKey:null, shiftKey:null, which:null, button:null
        };
    },

    /**
     * Cleans up listener event handlers and static properties.
     * @method _unbindSelector
     * @private
     */
    _unbindSelector: function(){

        // clear all current visual UI settings
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_unbindSelector", 409);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 412);
this._clearAll(this._classHighlight);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 413);
this._clearAll(this._classSelected);

        // detach listener on DT "click" event
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 416);
if ( this._subscrSelect && this._subscrSelect.detach ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 417);
this._subscrSelect.detach();
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 419);
this._subscrSelect = null;

        // detach listener on DT "mouseenter" event
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 422);
if ( this._subscrHighlight && this._subscrHighlight.detach ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 423);
this._subscrHighlight.detach();
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 425);
this._subscrHighlight = null;

        // clear up other listeners set in bindSelector ...
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 428);
if ( this._subscrHighlight
            && this._subscrHighlight.detach ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 430);
this._subscrHighlight.detach();
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 432);
this._subscrHighlight = null;

        // Clear up the overall component listeners (array)
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 435);
Y.Array.each( this._subscrSelectComp,function(item){
            _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 3)", 435);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 436);
if (!item) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 437);
return;
            }

            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 440);
if(Y.Lang.isArray(item)) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 441);
Y.Array.each(item,function(si){
                    _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 4)", 441);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 442);
si.detach();
                });
            } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 444);
if (item.detach) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 445);
item.detach();
            }}
        });
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 448);
this._subscrSelectComp = null;

        // clean up static props set
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 451);
this._clickModifiers = null;
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 452);
this._selections = null;
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 453);
this._classHighlight = null;
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 454);
this._classSelected  = null;

    },

    /**
     * Method that updates the "highlighted" classes for the selection and unhighlights the prevVal
     * @method _highlightChange
     * @param o
     * @private
     */
    _highlightChange: function(o) {
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_highlightChange", 464);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 465);
this._processNodeAction(o,'highlight',true);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 466);
return;
    },

    /**
     * Method that updates the "selected" classes for the selection and un-selects the prevVal.
     * This method works with multiple selections (via ATTR `selectionMulti` true) by pushing
     * the current selection to the this._selections property.
     *
     * @method _selectedChange
     * @param o
     * @private
     */
    _selectedChange: function(o){
        // Evaluate a flag to determine whether previous selections should be cleared or "kept"
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_selectedChange", 478);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 480);
var keepPrev, keepRange, tar, sobj;

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 482);
if ( Y.UA.os.search('macintosh') === 0 ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 483);
keepPrev =  this.get('selectionMulti') === true && this._clickModifiers.metaKey === true;
        } else {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 485);
keepPrev =  this.get('selectionMulti') === true && this._clickModifiers.ctrlKey === true;
        }

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 488);
keepRange = this.get('selectionMulti') === true && this._clickModifiers.shiftKey === true;

        // clear any SHIFT selected text first ...
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 491);
this._clearDOMSelection();

        // if not-multi mode and more than one selection, clear them first ...
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 494);
if ( !keepPrev && !keepRange && this._selections.length>1 ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 495);
this.clearSelections();
        }

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 498);
if ( keepRange ) {

            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 500);
this._processRange(o);

        }  else {

            // Process the action ... updating 'select' class
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 505);
tar = this._processNodeAction(o,'select', !keepPrev );

            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 507);
if ( !keepPrev ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 508);
this._selections = [];
            }

            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 511);
if(this.get('selectionMode')==='row') {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 512);
this._selections.push( this._selectTr(tar) );
            } else {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 514);
this._selections.push( this._selectTd(tar) );
            }

        }

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 519);
this.fire('selected',{
            ochange: o,
            record: this.getRecord(o.newVal)
        });

        //
        //  Fire a generic "selection" event that returns selected data according to the current "selectionMode" setting
        //
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 527);
sobj = { selectionMode : this.get('selectionMode')  };

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 529);
if(this.get('selectionMode')==='cell') {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 530);
sobj.cells = this.get('selectedCells');
        } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 531);
if (this.get('selectionMode')==='row') {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 532);
sobj.rows = this.get('selectedRows');
        }}

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 535);
this.fire('selection',sobj);
    },

    /**
     * Event that fires on every "select" action and returns the LAST SELECTED item, either a cell or a row.
     * Please see the event "selection" which provides a cumulative total of all selected items as opposed to
     * just the last item.   (Fired from method [_selectedChange](#method__selectedChange)
     *
     * @event selected
     * @param {Object} obj Return object
     * @param {Object} obj.ochange Change event object passed from attribute 'selected'
     * @param {Object} obj.record DataTable record (Y.Model) instance for the selection
     */

    /**
     * Event that fires on every DataTable "select" event, returns current selections, either cells or rows depending
     * on the current "selectionMode".  (Fired from method [_selectedChange](#method__selectedChange)
     *
     *
     * @event selection
     * @param {Object} obj Return object
     * @param {Object} obj.selectionMode Current setting of attribute [selectionMode](#attr_selectionMode)
     * @param {Object} obj.cells Returns the current setting of the attribute [selectedCells](#attr_selectedCells)
     * @param {Object} obj.rows Returns the current setting of the attribute [selectedRows](#attr_selectedRows)
     */


    /**
     * Called when a "range" selection is detected (i.e. SHIFT key held during click) that selects
     * a range of TD's or TR's (depending on [selectionMode](#attr_selectionMode) setting.
     *
     * @method _processRange
     * @param {Node} o Last clicked TD of range selection
     * @private
     */
    _processRange: function(o) {
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_processRange", 570);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 571);
var tarNew  = o.newVal,
            tarPrev = o.prevVal || null,
            newRec, newRecI, newCol, newColI, prevRec, prevRecI, prevCol, prevColI, delCol, delRow,
            coldir, rowdir, cell, i, j, tr, sel;

        //
        //  Process through the first and last targets ...
        //
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 579);
if ( tarNew && tarPrev ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 580);
newRec  = this.getRecord(tarNew);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 581);
newRecI = this.data.indexOf(newRec);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 582);
newCol  = this.getColumnNameByTd(tarNew);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 583);
newColI = Y.Array.indexOf(this.get('columns'),this.getColumn(newCol));
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 584);
prevRec  = this.getRecord(tarPrev);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 585);
prevRecI = this.data.indexOf(prevRec);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 586);
prevCol  = this.getColumnNameByTd(tarPrev);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 587);
prevColI = Y.Array.indexOf(this.get('columns'),this.getColumn(prevCol));

            // Calculate range offset ... delCol (horiz) and delRow (vertically)
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 590);
delCol = newColI - prevColI;
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 591);
delRow = newRecI - prevRecI;

            // if we have valid deltas, update the range cells.
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 594);
if ( delCol !== null && delRow !== null) {

                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 596);
if (Y.Lang.isArray(this._selections) ) {
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 597);
this.clearSelections();
                }

                // Select a range of CELLS (i.e. TD's) ...
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 601);
if ( this.get('selectionMode') === 'cell' ) {
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 602);
coldir = (delCol<0) ? -1 : 1;
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 603);
rowdir = (delRow<0) ? -1 : 1;
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 604);
cell = tarPrev;

                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 606);
for(j=0; j<=Math.abs(delRow); j++) {
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 607);
for(i=0; i<=Math.abs(delCol); i++) {
                            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 608);
cell = this.getCell(tarPrev,[rowdir*(j),coldir*(i)]);
                            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 609);
if (cell) {
                                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 610);
cell.addClass(this._classSelected);
                                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 611);
sel = this._selectTd(cell);
                                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 612);
this._selections.push( sel );
                            }
                        }
                    }
                // Select a range of ROWS (i.e. TR's)
                } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 617);
if ( this.get('selectionMode') === 'row' ) {

                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 619);
rowdir = (delRow<0) ? -1 : 1;
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 620);
tr = this.getRow(prevRecI);

                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 622);
for(j=0; j<=Math.abs(delRow); j++) {
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 623);
tr = this.getRow(prevRecI+rowdir*(j));
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 624);
if (tr) {
                            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 625);
tr.addClass(this._classSelected);
                            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 626);
sel = this._selectTr(tr);
                            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 627);
this._selections.push( sel );
                        }
                    }

                }}

            }

        }

    },


    /**
     * Returns the current settings of row selections, includes multiple selections.  If the
     * current `selectionMode` is "cell" mode, this function returns the unique "records" associated with
     * the selected cells.
     *
     * **Returned** `rows` {Array} of objects in format;
     * <ul>
     *   <li>`rows.tr` {Node} Node instance of the TR that was selected</li>
     *   <li>`rows.record` {Model} The Model associated with the data record for the selected TR</li>
     *   <li>`rows.recordIndex` {Integer} The record index of the selected TR within the current "data" set</li>
     *   <li>`rows.recordClientId {String} The record clientId attribute setting</li>
     * </ul>

     * @method _getSelectedRows
     * @return {Array} rows Array of selected "rows" as objects in {tr,record,recordIndex} format
     * @private
     */
    _getSelectedRows: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_getSelectedRows", 657);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 658);
var trs  = [],
            rows = [],
            tr, rec;
        
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 662);
Y.Array.each(this._selections,function(item){
            _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 5)", 662);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 663);
if(!item || !item.recClient) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 664);
return;
            }

            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 667);
tr  = this.getRow(item.recClient);

            // if and only if, it's a TR and not in "trs" array ... then add it
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 670);
if ( Y.Array.indexOf(trs,tr) === -1 ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 671);
rec = this.data.getByClientId( item.recClient );
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 672);
trs.push( tr );
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 673);
rows.push({
                    tr:             tr,    // this is an OLD, stale TR from pre-sort
                    record:         rec,
                    recordIndex:    this.data.indexOf(rec),
                    recordClientId: item.recClient
                });
            }
        },this);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 681);
return rows;
    },



    /**
     * Getter method that returns an Array of the selected cells in record/column coordinate format.
     * If rows or TR elements were selected, it adds all of the row's child TD's.
     *
     * **Returned** `cells` {Array} of objects in format;
     * <ul>
     *   <li>`cells.td` {Node} TD Node for this cell.</li>
     *   <li>`cells.record` {Model} Record for this cell as a Y.Model</li>
     *   <li>`cells.recordIndex` {Integer} Record index for this cell in the current "data" set</li>
     *   <li>`cells.column` {Object} Column for this cell defined in original "columns" DataTable attribute</li>
     *   <li>`cells.columnName` {String} Column name or key associated with this cell</li>
     *   <li>`cells.columnIndex` {Integer} Column index of the column, within the "columns" data</li>
     * </ul>
     *
     * @method _getSelectedCells
     * @return {Array} cells The selected cells in {record,recordIndex,column,columnName,columnIndex} format
     * @private
     */
    _getSelectedCells: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_getSelectedCells", 704);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 705);
var cells = [],
            cols  = this.get('columns'),
            col, tr, rec;

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 709);
Y.Array.each(this._selections,function(item){
            _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 6)", 709);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 710);
if (!item) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 711);
return;
            }

            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 714);
if ( item.td ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 715);
col = this.getColumn(item.colName);
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 716);
tr  = item.tr;
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 717);
rec = this.data.getByClientId(item.recClient);

                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 719);
cells.push({
                    td:          item.td,
                    record:      rec,
                    recordIndex: this.data.indexOf(rec),
                    recordClientId:  item.recClient,
                    column:      col,
                    columnName:  item.colName,
                    columnIndex: Y.Array.indexOf(cols,col)
                });
            } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 728);
if ( item.tr ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 729);
tr = item.tr;
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 730);
rec = this.data.getByClientId(item.recClient);
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 731);
var tdNodes = tr.all("td");
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 732);
if ( tdNodes ) {
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 733);
tdNodes.each(function(td){
                        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 7)", 733);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 734);
col = this.getColumnByTd(td);
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 735);
cells.push({
                            td:          td,
                            record:      rec,
                            recordIndex: this.data.indexOf(rec),
                            recordClientId:  item.recClient,
                            column:      col,
                            columnName:  col.key || col.name,
                            columnIndex: Y.Array.indexOf(cols,col)
                        });
                    },this);
                }
            }}
        },this);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 748);
return cells;
    },

    /**
     * Setter method for attribute `selectedCells` that takes an array of cells as input and sets them
     * as the current selected set with appropriate visual class.
     *
     * @method _setSelectedCells
     * @param {Array} val The desired cells to set as selected, in {record:,column:} format
     * @param {String|Number} val.record Record for this cell as either record index or record clientId
     * @param {String|Number} val.column Column for this cell as either the column index or "key" or "name"
     * @return {Array}
     * @private
     */
    _setSelectedCells: function(val){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_setSelectedCells", 762);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 763);
this._selections = [];
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 764);
if ( Y.Lang.isArray(val) && this.data.size() > val.length ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 765);
Y.Array.each(val,function(item) {
                _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 8)", 765);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 766);
var row, col, td, ckey,sel;
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 767);
row = ( Y.Lang.isNumber(item.record) ||
                    typeof item.record ==='string') ? this.getRow( item.record ) : row;
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 769);
col = ( Y.Lang.isNumber(item.column) ||
                    typeof item.column ==='string' ) ? this.getColumn(item.column) : col;

                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 772);
if ( row && col ) {
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 773);
ckey = col.key || col.name;
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 774);
if ( ckey ) {
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 775);
td  = row.one('.'+this.getClassName('col')+'-'+ckey);
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 776);
sel = this._selectTd(td);
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 777);
if(sel) {
                            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 778);
this._selections.push(sel);
                        }
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 780);
td.addClass(this._classSelected);
                    }
                }

            },this);
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 786);
return val;
    },


    /**
     * A setter method for attribute `selectedRows` that takes as input an array of desired DataTable
     * record indices to be "selected", clears existing selections and sets the "selected" records and
     * highlights the TR's
     *
     * @method _setSelectedRows
     * @param  {Array} val Array of record indices (or record "clientId") desired to be set as selected.
     * @return {Array} records Array of DataTable records (Y.Model) for each selection chosen
     * @private
     */
    _setSelectedRows: function(val){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_setSelectedRows", 800);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 801);
this._selections = [];
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 802);
if ( Y.Lang.isArray(val) && this.data.size() > val.length ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 803);
Y.Array.each(val,function(item){
                _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 9)", 803);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 804);
var tr = this.getRow(item),
                    sel;
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 806);
if ( tr ) {
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 807);
sel = this._selectTr(tr);
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 808);
if(sel) {
                        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 809);
this._selections.push( sel );
                    }
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 811);
tr.addClass(this._classSelected);
                }
            },this);
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 815);
return val;
    },


    /**
     * Method that returns a TD's "selection obj" expected for the _selections buffer
     * @method _selectTd
     * @param tar {Node}  A Node instance of TD to be prepared for selection
     * @return {Object} obj Returned object includes properties (td,tr,recClient,colName)
     * @private
     */
    _selectTd : function(tar){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_selectTd", 826);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 827);
var rec,col,rtn=false;
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 828);
if(tar && tar.get('tagName').toLowerCase() === 'td') {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 829);
rec = this.getRecord(tar.ancestor());
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 830);
col = this.getColumnByTd(tar);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 831);
rtn = {
                td:        tar,
                tr:        tar.ancestor(),
                recClient: (rec) ? rec.get('clientId') : null,
                colName:   col.key || col.name || null
            };
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 838);
return rtn;
    },

    /**
     * Method that returns a TR's "selection obj" expected for the _selections buffer
     * @method _selectTr
     * @param tar {Node}  A Node instance of TR to be prepared for selection
     * @return {Object} obj Returned object includes properties (tr,recClient)
     * @private
     */
    _selectTr : function(tar){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_selectTr", 848);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 849);
var rec, rtn = false;
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 850);
if(tar && tar.get('tagName').toLowerCase() === 'tr') {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 851);
rec = this.getRecord(tar);
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 852);
rtn = {
                tr:        tar,
                recClient: (rec) ? rec.get('clientId') : null
            };
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 857);
return rtn;
    },


    /**
     * Method is fired AFTER a "reset" action takes place on the "data", usually related to a column sort.
     * This function reads the pre-sorted selections that were stored by  [_beforeResetDataSelect](#method__beforeResetDataSelect)
     * temporarily in this._selections.
     *
     * Depending upon the current "selectionMode", either post-sorted TBODY selections are re-applied, by determining either
     * the TR's (from the Model data) or the TD's (from the Model and Column Index data).
     *
     * @method _afterResetDataSelect
     * @private
     */
    _afterResetDataSelect: function() {
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_afterResetDataSelect", 872);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 873);
if( !this._selections || this._selections.length === 0 ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 874);
return;
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 876);
var tr, td, buffer = [], colIndex, col,
            cols = this.get('columns');

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 879);
this._clearAll(this._classSelected);


        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 882);
Y.Array.each(this._selections,function(item){
            _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 10)", 882);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 883);
if( this.get('selectionMode') === 'row' && item.recClient ) {
                // the "item" is a Model pushed prior to the "sort" action ...
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 885);
tr = this.getRow(item.recClient);
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 886);
if( tr ) {
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 887);
buffer.push( this._selectTr(tr) );
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 888);
tr.addClass(this._classSelected);
                }
            } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 890);
if (this.get('selectionMode') === 'cell' && item.recClient && item.colName ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 891);
tr = this.getRow(item.recClient);
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 892);
col = this.getColumn(item.colName);
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 893);
colIndex = Y.Array.indexOf(cols,col);
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 894);
td = (tr && colIndex >= 0) ? tr.all("td").item(colIndex) : null;
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 895);
if(tr && td) {
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 896);
buffer.push( this._selectTd(td) );
                    _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 897);
td.addClass(this._classSelected);
                }
            }}
        },this);

        // swap out the temporary buffer, for the current selections ...
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 903);
this._selections = buffer;

    },

    /**
     * Method used to derive from the clicked selection, either the TR or TD of the selection, and
     * returns the current `selectionMode` or `highlightMode` Node (based on the setting of prefix).
     *
     * This method adds the required class, and if erasePrev is true, removes the class from the prior setting.
     *
     * @method _processNodeAction
     * @param {Object} o Attribute change event object
     * @param {String} prefix
     * @param {Boolean} erasePrev
     * @return {Node} node Returned target Y.Node, either TR or TD based upon current `selectionMode` or `highlightMode`
     * @private
     */
    _processNodeAction: function(o, prefix, erasePrev ){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_processNodeAction", 920);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 921);
var tar = o.newVal,
            tarNew, tarPrev, modeName, className;

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 924);
if ( prefix === 'highlight') {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 925);
modeName  = prefix + 'Mode';
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 926);
className = this._classHighlight;
        } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 927);
if ( prefix === 'select' ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 928);
modeName  = 'selectionMode';
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 929);
className = this._classSelected;
        }}

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 932);
if ( this.get(modeName) === "cell" ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 933);
tarNew  = tar || null;
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 934);
tarPrev = o.prevVal || null;
        } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 935);
if ( this.get(modeName) === "row" ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 936);
if ( tar ) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 937);
tarNew = (tar.get('tagName').search(/td/i) === 0 ) ? tar.ancestor('tr')
                    : ( tar.get('tagName').search(/tr/i) === 0 ) ? tar : null ;
            }
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 940);
tarPrev = o.prevVal;
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 941);
if (tarPrev) {
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 942);
tarPrev = (tarPrev.get('tagName').search(/td/i) === 0 ) ? tarPrev.ancestor('tr')
                    : ( tarPrev.get('tagName').search(/tr/i) === 0 ) ? tarPrev : null ;
            }
        }}

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 947);
if ( tarPrev && erasePrev ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 948);
tarPrev.removeClass(className);
        }

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 951);
if ( tarNew ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 952);
tarNew.addClass(className);
        }

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 955);
return tarNew;
    },


    /**
     * Method removes the specified `type` CSS class from all nodes within the TBODY data node.
     * @method _clearAll
     * @param {String} type Class name to remove from all nodes attached to TBODY DATA
     * @private
     */
    _clearAll: function(type){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_clearAll", 965);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 966);
var nodes = this.get('boundingBox').one("."+this.getClassName('data'));
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 967);
if ( nodes ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 968);
nodes.all('.'+type).removeClass(type);
        }
    },

    /**
     * Setter for `highlightMode` attribute, removes prior event handle (if exists) and defines
     * a new delegated "mouseover" handler that updates the `highlighted` attribute.
     *
     * A change to this setting clears all prior highlighting.
     *
     * @method _setHighlightMode
     * @param val
     * @return {*}
     * @private
     */
    _setHighlightMode: function(val){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_setHighlightMode", 983);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 984);
if ( this._subscrHighlight ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 985);
this._subscrHighlight.detach();
        }

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 988);
if(val==='none') {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 989);
return;
        } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 990);
if (val.toLowerCase) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 991);
val = val.toLowerCase();
        }}

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 994);
this._subscrHighlight = this.delegate("mouseover",function(e){
                _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 11)", 994);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 995);
var tar = e.currentTarget;
                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 996);
this.set('highlighted',tar);
            },"tr td",this);

        //this._clearAll(this._classHighlight);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1000);
this.clearHighlighted();
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1001);
return val;
    },

    /**
     * Setter for `selectionMode` attribute, removes prior event handle (if exists) and defines
     * a new delegated "click" handler that updates the `selected` attribute.
     *
     * A change to this setting clears all prior selections.
     *
     * @method _setSelectionMode
     * @param val
     * @return {*}
     * @private
     */
    _setSelectionMode: function(val){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_setSelectionMode", 1015);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1016);
var oSelf = this;
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1017);
if ( this._subscrSelect ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1018);
this._subscrSelect.detach();
        }

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1021);
if(val==='none') {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1022);
return;
        } else {_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1023);
if (val.toLowerCase) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1024);
val = val.toLowerCase();
        }}

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1027);
this._subscrSelect = this.delegate("click",function(e){
                _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "(anonymous 12)", 1027);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1028);
var tar = e.currentTarget;

               // Disabled 11/16/12: was preventing checkbox listeners to fire
               // e.halt(true);

                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1033);
oSelf._clickModifiers = {
                    ctrlKey:  e.ctrlKey,
                    altKey:   e.altKey,
                    metaKey:  e.metaKey,
                    shiftKey: e.shiftKey,
                    which:    e.which,
                    button:   e.button
                };

                _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1042);
oSelf.set('selected',tar);

            },"tr td",oSelf);
        //this._clearAll(this._classSelected);
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1046);
this.clearSelections();
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1047);
return val;
    },

    /**
     * Helper method to clear DOM "selected" text or ranges
     * @method _clearDOMSelection
     * @private
     */
    _clearDOMSelection: function(){
        _yuitest_coverfunc("build/gallery-datatable-selection/gallery-datatable-selection.js", "_clearDOMSelection", 1055);
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1056);
var sel = (Y.config.win.getSelection) ? Y.config.win.getSelection()
            : (Y.config.doc.selection) ? Y.config.doc.selection : null;

        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1059);
if ( sel && sel.empty ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1060);
sel.empty();   // works on chrome
        }
        _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1062);
if ( sel && sel.removeAllRanges ) {
            _yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1063);
sel.removeAllRanges();  // works on FireFox
        }
    }

});

_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1069);
Y.DataTable.Selection = DtSelection;
_yuitest_coverline("build/gallery-datatable-selection/gallery-datatable-selection.js", 1070);
Y.Base.mix(Y.DataTable, [Y.DataTable.Selection]);



}, '@VERSION@', {"skinnable": "true", "requires": ["base-build", "datatable-base", "event-custom"]});
