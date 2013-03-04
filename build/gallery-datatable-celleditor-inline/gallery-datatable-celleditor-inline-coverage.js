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
_yuitest_coverage["build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js",
    code: []
};
_yuitest_coverage["build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js"].code=["YUI.add('gallery-datatable-celleditor-inline', function (Y, NAME) {","","/**"," A View class that serves as the BASE View class for a TD Cell \"inline\" editor, i.e. an editor that"," is a single INPUT node that completely overlies the TD cell.  This editor is intended to replicate"," the familiar \"spreadsheet\" type of input.",""," ##### Editing / Validation",""," This editor view creates a simple INPUT[type=text] control and repositions and resizes it to match the"," underlying TD, set with a z-Index to visually appear over the TD cell.",""," Key listeners are provided to detect changes, prohibit invalid keystrokes (via the [keyFiltering](#attr_keyFiltering)","  setting) and to allow validation upon a \"save\" entry (keyboard RTN stroke) where a [validator](#attr_validator) can"," be prescribed to allow/disallow changes based upon the overall \"value\" of the INPUT control.",""," ##### Navigation"," The editor provides the capability to navigate from TD cell via key listeners on the following key"," combinations;","  * CTRL-arrow keys","  * TAB goes to RIGHT, SHIFT-TAB goes to left","  * ESC cancels editing","  * RTN saves cell",""," Key navigation can be disabled via the [inputKeys](#attr_inputKeys) attribute set to `false`.",""," When a \"key navigation\" request is received it is passed to the [keyDir](#attr_keyDir) as a change"," in [row,col] that implementers can listen to \"change\" events on, to reposition and open editing on the"," new relative cell.  (NOTE: This view does not reposition, it simply fires a `keyDirChange` event.",""," ##### Events"," Several events are fired by this View;  which can be listened for and acted upon to achieve differing results."," For example, the Y.DataTable.EditorOptions.inlineAC (inline autocompletion editor) listens for the"," [editorCreated](#event_editorCreated) event and once received, it configures the autocomplete plugin onto the"," INPUT node.",""," ##### Configuration"," Ths Y.DataTable.BaseCellInlineEditor editor is intended to be configured by varying the configuration"," parameters (i.e. attribute and related configuration) to permit a variety of editing features.",""," Since the View class permits ad-hoc attributes, the implementer can pass many properties in during instantiation"," that will become available as run-time View attributes.",""," This Module includes several pre-defined editor configurations which are stored within the Y.DataTable.EditorOptions"," namespace (presently there are \"inline\", \"inlineNumber\", \"inlineDate\", \"inlineAC\").  New inline editors can be"," created and added to this namespace at runtime, and by defining the `BaseViewClass:Y.DataTable.BaseCellInlineEditor` property.",""," For example, the pre-built configuration object for the [inlineDate](Y.DataTable.EditorOptions.inlineDate.html) inline editor"," is stored as `Y.DataTable.EditorOptions.inlineDate`.",""," To configure an editor on-the-fly (i.e. within a DataTable column definition) just include the configuration object options"," within DT's column `editorConfig` object, which is Y.merge'ed with the pre-built configs;","","        // define an 'inlineDate' editor with additional configs ...","        { key:'date_of_claim', editor:\"inlineDate\", editorConfig:{ dateformat:'%Y-%m-%d'} }",""," This `Y.DataTable.BaseCellinlineEditor` class is similar to (and compatible with ) the `Y.DataTable.BaseCellPopupEditor`"," in another gallery module.  Note that since the \"inline\" editor uses a simple INPUT[type=text] Node instead of an"," Overlay the codeline is quite a bit simpler.",""," ###### KNOWN ISSUES:","   <ul>","   <li>This View doesn't work well with scrolling DT's, so I've disabled it currently.</li>","   <li>Sometimes after a DT's `editable` ATTR is toggled true/false a \"cannot read 'style'\" message occurs and editing failes","        requiring a page refresh.</li>","   </ul>",""," @module gallery-datatable-celleditor-inline"," @class Y.DataTable.BaseCellInlineEditor"," @extends Y.View"," @author Todd Smith"," @since 3.8.0"," **/","var KEYC_ESC = 27,","    KEYC_RTN = 13,","    KEYC_TAB = 9,","    KEYC_UP  = 38,","    KEYC_DOWN  = 40,","    KEYC_RIGHT  = 39,","    KEYC_LEFT  = 37;","","Y.DataTable.BaseCellInlineEditor =  Y.Base.create('celleditor',Y.View,[],{","","    /**","     * Defines the INPUT HTML content \"template\" for this editor's View container","     * @property template","     * @type String","     * @default '<input type=\"text\" class=\"{cssInput}\" />'","     * @static","     */","    template: '<input type=\"text\" class=\"{cssInput}\" />',","","    /**","     * Defines the View container events and listeners used within this View","     * @property events","     * @type Object","     * @default See Code","     * @static","     */","    events : {","        'input' : {","            'keypress':     'processKeyPress',      // for key filtering and charCode keys","            'keydown':      'processKeyDown',           // for direction, ESC only, keyCode","            'click' :       '_onClick',","            'mouseleave' :  '_onMouseLeave'","        }","    },","","    /**","     * Array of detach handles to any listeners set on this View class","     * @property _subscr","     * @type Array of EventHandles","     * @default null","     * @protected","     * @static","     */","    _subscr: null,","","    /**","     * CSS classname to identify the editor's INPUT Node","     * @property _classInput","     * @type String","     * @default 'yui3-datatable-inline-input'","     * @protected","     * @static","     */","    _cssInput: 'yui3-datatable-inline-input',","","    /**","     * Placeholder for the created INPUT Node created within the View container","     * @property _inputNode","     * @type Node","     * @default null","     * @protected","     * @static","     */","    _inputNode: false,","","//======================   LIFECYCLE METHODS   ===========================","","    /**","     * Initialize and create the View contents","     * @method initializer","     * @public","     * @return {*}","     */","    initializer: function(){","        this._createUI();","        this._bindUI();","        return this;","    },","","    /**","     * Cleans up the View after it is destroyed","     * @method destructor","     * @public","     */","    destructor: function(){","        this._unbindUI();","        this.fire('editorDestroyed');","    },","","    /**","     * Event fired when the cell editor View is destroyed.","     *","     * Implementers can listen for this event to check if any sub-components / widgets, etc.. they","     * had created as part of this View need to be destroyed or listener unbound.","     *","     * @event editorDestroyed","     */","","    /**","     * Adds a listener to this editor instance to reposition based on \"xy\" attribute changes","     * @method _bindUI","     * @private","     */","    _bindUI: function(){","","        this.publish({","            save: {","                defaultFn:   this._defSaveFn","            },","            cancel: {","                defaultFn:   this._defCancelFn","            },","            show: {","                defaultFn: this._defShowFn","            }","        });","","        // This is here to support \"scrolling\" of the underlying DT ...","        this._subscr = [];","        this._subscr.push( this.on('xyChange',this._setEditorXY) );","    },","","    /**","     * Detaches any listener handles created by this view","     * @method _unbindUI","     * @private","     */","    _unbindUI: function(){","        Y.Array.each(this._subscr,function(e){","            if(e && e.detach) {","                e.detach();","            }","        });","        this._subscr = null;","    },","","    /**","     * The defaultFn for the `save` event","     * @method _defSaveFn","     * @param e {EventFacade} For save event","     * @private","     */","    _defSaveFn: function(e){","        this.set('value', e.newValue);","        this.hideEditor();","    },","","    /**","     * The defaultFn for the `cancel` event","     * @method _defCancelFn","     * @private","     */","    _defCancelFn: function(){","        this.hideEditor();","    },","","    /**","     */","    _defShowFn: function (ev) {","        var cont = this.get('container'),","            cell = ev.cell,","            td = cell.td || ev.td,","            xy = td.getXY(),","            val = ev.value;","        //","        // Get the TD Node's XY position, and resize/position the container","        //   over the TD","        //","","        cont.show();","        this._resizeCont(cont,td);","        cont.setXY(xy);","","        // focus the inner INPUT ...","        this._inputNode.focus();","        // set the INPUT value","        this._inputNode.set('value',val);","        this.set('lastValue',val);","","        this._set('visible',true);","        this._set('hidden',false);","    },","","//======================   PUBLIC METHODS   ===========================","","    /**","     * Displays the inline cell editor and positions / resizes the INPUT to","     * overlay the edited TD element.","     *","     * Set the initial value for the INPUT element, after preprocessing (if reqd)","     *","     * @method showEditor","     * @param {Node} td The Node instance of the TD to begin editing on","     * @public","     */","    showEditor: function(td) {","        var cell = this.get('cell'),","            val  = cell.value || this.get('value'),","            prepfn = this.get('prepFn');","","","        if (prepfn) { // you have already checked it is a function","            val = prepfn.call(this, val);","        }","","        this.fire('show',{","            td:         td,","            cell:       cell,","            inputNode:  this._inputNode,","            value:      val","        });","","    },","","    /**","     * Event fired when the cell editor is displayed and becomes visible.","     *","     * Implementers may listen for this event if they have configured complex View's, that include","     * other widgets or components, to update their UI upon displaying of the view.","     *","     * @event show","     * @param {Object} rtn Returned object","     * @param {Node} rtn.td TD Node instance of the calling editor","     * @param {Node} rtn.inputNode The editor's INPUT / TEXTAREA Node","     * @param {String|Number|Date} rtn.value The current \"value\" setting","     * @param {Object} rtn.cell object","     */","","    /**","     * Saves the View's `value` setting (usually after keyboard RTN or other means) and fires the","     * [save](#event_editorSave) event so consumers (i.e. DataTable) can make final changes to the","     * Model or dataset.","     *","     * Thank you to **Satyam** for his guidance on configuring the event publishing, defaultFn related to this","     * technique!","","     * @method saveEditor","     * @param val {String|Number|Date} Raw value setting to be saved after editing","     * @public","     */","    saveEditor: function(val){","        //","        //  Only save the edited data if it is valid ...","        //","        if( val !== undefined && val !== null ){","","            // If a \"save\" function was defined, run thru it and update the \"value\" setting","            var savefn = this.get('saveFn') ;","            if (savefn) {","                val = savefn.call(this,val);","            }","","            // So value was initially okay, but didn't pass saveFn validation call ...","            if (val === undefined) {","                this.cancelEditor();","                return;","            }","","            this.fire(\"save\",{","                td:         this.get('cell').td,","                cell:       this.get('cell'),","                oldValue:   this.get('lastValue'),","                newValue:   val","            });","        }","    },","","    /**","     * Event that is fired when the user has finished editing the View's cell contents (signified by either","     * a keyboard RTN entry or \"Save\" button, etc...).","     *","     * This event is intended to be the PRIMARY means for implementers to know that the editing has been","     * completed and validated.  Consumers (i.e. DataTable) should listen to this event and process it's results","     * to save to the Model and or dataset for the DT.","     *","     * @event save","     * @param {Object} rtn Returned object","     *  @param {Node} rtn.td TD Node for the edited cell","     *  @param {Object} rtn.cell Current cell object","     *  @param {String|Number|Date} rtn.oldValue Data value of this cell prior to editing","     *  @param {String|Number|Date} rtn.newValue Data value of this cell after editing","     */","","    /**","     * Hides the current editor View instance.  If the optional `hideMe` param is true this View will","     * be temporarily \"hidden\" (used for scrolling DT's when the TD is scrolled off/on to the page)","     *","     * @method hideEditor","     * @public","     */","    hideEditor: function(hideMe){","        var cont  = this.get('container');","        if(cont && cont.hide) {","            cont.hide();","        }","        if(hideMe===true) {","            this._set('hidden',true);","        }","        this._set('visible',false);","","        this.fire('editorHide');","","    },","","    /**","     * Fired when the active cell editor is hidden","     * @event editorHide","     */","","    /**","     * Called when the user has requested to cancel, and abort any changes to the DT cell,","     * usually signified by a keyboard ESC or \"Cancel\" button, etc..","     *","     * @method cancelEditor","     * @public","     */","    cancelEditor: function(){","      //  this.hideEditor();","        this.fire(\"cancel\",{","            td:         this.get('cell').td,","            cell:       this.get('cell'),","            oldValue:   this.get('lastValue')","        });","    },","","    /**","     * Fired when editing is cancelled (without saving) on this cell editor","     * @event cancel","     * @param {Object} rtn Returned object","     *  @param {Node} rtn.td TD Node for the edited cell","     *  @param {Object} rtn.cell Current cell object","     *  @param {String|Number|Date} rtn.oldValue Data value of this cell prior to editing","     */","","    /**","     * Provides a method to process keypress entries and validate or prevent invalid inputs.","     * This method is meant to be overrideable by implementers to customize behaviors.","     *","     * @method processKeyPress","     * @param e {EventFacade} Key press event object","     * @public","     */","    processKeyPress: function(e) {","        var keyc    = e.keyCode,","            inp     = e.target || this._inputNode,","            value   = inp.get('value'),","            keyfilt = this.get('keyFiltering'),","         //   keyvald = this.get('keyValidator'),","            kchar   = String.fromCharCode(keyc),","            flagRE  = true,","            krtn;","","        //","        // If RTN, then prevent and save ...","        //","        if(keyc === KEYC_RTN) {","            e.preventDefault();","            this.saveEditor(value);","        }","","        //","        // Check key filtering validation ... either a RegExp or a user-function","        //","        if(keyfilt instanceof RegExp) {","            flagRE = (!kchar.match(keyfilt)) ? false : flagRE;","        } else if (Y.Lang.isFunction(keyfilt)) {","            krtn = keyfilt.call(this,e);","            flagRE = (krtn) ? true : false;","        }","","        // If key filtering returned false, prevent continuing","        if(!flagRE) {","            e.preventDefault();","        }","","    },","","    /**","     * Key listener for the INPUT inline editor, \"keydown\" is checked for non-printing key","     *  strokes, navigation or ESC.","     *","     *  This method is intended to overridden by implementers in order to customize behaviors.","     *","     * @method processKeyDown","     * @param e {EventFacade} Keydown event facade","     * @public","     */","    processKeyDown : function(e){","        var keyc    = e.keyCode,","            dir;","","        switch(keyc) {","","            case KEYC_ESC:","                e.preventDefault();","                this.cancelEditor();","                break;","","            case KEYC_UP:","                dir = (e.ctrlKey) ? [-1,0] : null;","                break;","","            case KEYC_DOWN:","                dir = (e.ctrlKey) ? [1,0] : null;","                break;","","            case KEYC_LEFT:","                dir = (e.ctrlKey) ? [0,-1] : null;","                break;","","            case KEYC_RIGHT:","                dir = (e.ctrlKey) ? [0,1] : null;","                break;","","            case KEYC_TAB: // tab","                dir = (e.shiftKey) ? [0,-1] : [0,1] ;","                break;","        }","","        //","        //  If dir is non-falsey, a navigation direction was set ...","        //","        if(dir) {","            // set the key direction movement","            if(this.get('inputKeys')===true) {","                this._set('keyDir',dir);","            }","            e.preventDefault();","        }","","    },","","//======================   PRIVATE METHODS   ===========================","","    /**","     * Processes the initial container for this View, sets up the HTML content","     *  and creates a listener for positioning changes","     * @method _createUI","     * @private","     */","    _createUI: function() {","        var container = this.get('container'),","            html      = Y.Lang.sub(this.template, {cssInput:this._cssInput});","","        // set the View container contents","        container.setHTML(html);","","        // Append the container element to the DOM if it's not on the page already.","        if (!container.inDoc()) {","          Y.one('body').append(container);","        }","","        container.setStyle('zIndex',999);","","        container.hide();","","        // set a static placeholder for the input ...","        this._inputNode = container.one('input');","        if(this.get('className')) {","            this._inputNode.addClass(this.get('className'));","        }","","        this.fire('editorCreated',{","            inputNode:  this._inputNode,","            container:  container","        });","","    },","","    /**","     * View event fired when the inline editor has been initialized and ready for usage.","     * This event can be listened to in order to add additional content or widgets, etc onto","     * the View's container.","     *","     * @event editorCreated","     * @param {Object} rtn Returned object","     *  @param {Node} rtn.inputNode The created INPUT[text] node","     *  @param {Object} rtn.container The View container","     */","","    /**","     * Resizes the view \"container\" to match the dimensions of the TD cell that is","     *  being edited.","     *","     * @method _resizeCont","     * @param {Node} cont The Node instance of the \"container\" of this view","     * @param {Node} td The Node instance for the TD to match dimensions of","     * @private","     */","    _resizeCont: function(cont,td) {","        var w   = this._parseStyle(td,'width'),","            h   = this._parseStyle(td,'height'),","            pl  = this._parseStyle(td,'paddingLeft'),","            pt  = this._parseStyle(td,'paddingTop'),","            blw = this._parseStyle(td,'borderLeftWidth');","","        //  resize the INPUT width and height based upon the TD's styles","        w += pl + blw - 1;","        h += pt;","","        cont.setStyle('width',w+'px');","        cont.setStyle('height',h+'px');","","    },","","    /**","     * Helper method that returns the computed CSS style for the reference node as a parsed number","     * @method _parseStyle","     * @param el {Node} Node instance to check style on","     * @param v {String} Style name to return","     * @return {Number|String} Computed style with 'px' removed","     * @private","     */","    _parseStyle: function(el,v) {","        return +(el.getComputedStyle(v).replace(/px/,''));","    },","","    /**","     * Listener to INPUT \"click\" events that will stop bubbling to the DT TD listener,","     * to prevent closing editing while clicking within an INPUT.","     * @method _onClick","     * @param o {EventFacade}","     * @private","     */","    _onClick: function(o) {","        o.stopPropagation();","    },","","    /**","     * Listener to mouseleave event that will hide the editor if attribute \"hideMouseLeave\" is true","     * @method _onMouseLeave","     * @private","     */","    _onMouseLeave : function() {","        if(this.get('hideMouseLeave')){","            this.hideEditor();","        }","    },","","    /**","     * This method can be used to quickly reset the current View editor's position,","     *  used for scrollable DataTables.","     *","     * NOTE: Scrollable inline editing is a little \"rough\" right now","     *","     * @method _setEditorXY","     * @param e {EventFacade} The xy attribute change event facade","     * @private","     */","    _setEditorXY: function() {","","        //if(this._inputNode && e.newVal) {","        //    this._inputNode.setXY(e.newVal);","        //}","","        //TODO: Worst case, if this doesn't work just hide this sucker on scrolling !","        this.hideEditor();","    }","","","},{","    ATTRS:{","","        /**","         * Name for this View instance","         * @attribute name","         * @type String","         * @default null","         */","        name :{","            value:      null,","            validator:  Y.Lang.isString","        },","","        /**","         * A cell reference object populated by the calling DataTable, contains","         * the following key properties: {td,value,recClientId,colKey}","         * @attribute cell","         * @type Object","         * @default {}","         */","        cell: {","            valueFn: function () {","                return {};  // otherwise you get all of them pointing exactly to the same static object.","            }","        },","","        /**","         * Value that was saved in the Editor View and returned to the record","         *","         * @attribute value","         * @type {String|Number|Date}","         * @default null","         */","        value: {","            value:  null","        },","","        /**","         * Value that was contained in the cell when the Editor View was displayed","         *","         * @attribute lastValue","         * @type {String|Number|Date}","         * @default null","         */","        lastValue:{","            value:  null","        },","","        /**","         * Maintains a reference back to the calling DataTable instance","         * @attribute hostDT","         * @type Y.DataTable","         * @default null","         */","        hostDT : {","            value:  null,","            validator:  function(v) { return v instanceof Y.DataTable; }","        },","","        /**","         * Function to execute on the \"data\" contents just prior to displaying in the Editor's main view","         * (i.e. typically used for pre-formatting Date information from JS to mm/dd/YYYY format)","         *","         * This function will receive one argument \"value\" which is the data value from the record, and","         *  the function runs in Editor scope.","         *","         * @attribute prepFn","         * @type Function","         * @default null","         */","        prepFn: {","            value:      null,","            validator:  Y.Lang.isFunction","        },","","        /**","         * Function to execute when Editing is complete, prior to \"saving\" the data to the Record (Model)","         * This function will receive one argument \"value\" which is the data value from the INPUT and within","         * the scope of the current View instances.","         *","         * This method is intended to be used for input validation prior to saving.  **If the returned value","         * is \"undefined\" the cancelEditor method is executed.**","         *","         * @attribute saveFn","         * @type Function","         * @default null","         */","        saveFn:{","            value:      null,","            validator:  Y.Lang.isFunction","        },","","        /**","         * This flag dictates whether the View container is hidden when the mouse leaves","         * the focus of the inline container.","         * Typically we want this behavior, one example where we don't would be an","         * inline autocomplete editor.","         * @attribute hideMouseLeave","         * @type Boolean","         * @default true","         */","        hideMouseLeave : {","            value:      true,","            validator:  Y.Lang.isBoolean","        },","","        /**","         * Prescribes a CSS class name to be added to the editor's INPUT node after creation.","         * @attribute className","         * @type String","         * @default null","         */","        className: {","            value:      null,","            validator:  Y.Lang.isString","        },","","        /**","         * A flag to indicate if cell-to-cell navigation should be implemented (currently setup for CTRL-arrow","         * key, TAB and Shift-TAB) capability","         * @attribute inputKeys","         * @type Boolean","         * @default true","         */","        inputKeys:{","            value:      true,","            validator:  Y.Lang.isBoolean","        },","","        /**","         * Tracks navigation changes during keyboard input as relative [row,col] changes from the currently","         * active cell TD.","         *","         * @attribute keyDir","         * @type Array as [row,col] from current TD","         * @readOnly","         * @default []","         */","        keyDir: {","            value:      [],","            readOnly:   true,","            validator:  Y.Lang.isArray","        },","","        /**","         * Setting for checking the visibility status of this Editor","         * @attribute visible","         * @type Boolean","         * @default false","         * @readOnly","         */","        visible: {","            value:      false,","            readOnly:   true,","            validator:  Y.Lang.isBoolean","        },","","        /**","         * Setting to check if the editor is \"still open\" but just hidden, created in order to support","         * scrolling datatables when an editor scrolls out of open window.","         *","         * @attribute hidden","         * @type Boolean","         * @default false","         * @readOnly","         */","        hidden: {","            value:      false,","            readOnly:   true,","            validator:  Y.Lang.isBoolean","        },","","        /**","         * XY coordinate position of the editor View container (INPUT)","         * @attribute xy","         * @type Array","         * @default null","         */","        xy : {","            value:      null,","            validator:  Y.Lang.isArray","        },","","        /**","         * Provides a keystroke filtering capability to restrict input into the editing area checked during the","         * \"keypress\" event.  This attribute is set to either a RegEx or a function that confirms if the keystroke","         * was valid for this editor.  (TRUE meaning valid, FALSE meaning invalid)","         *","         * If a function is provided, the single argument is the keystroke event facade `e` and if","         * the keystroke is valid it should return true, otherwise if invalid false;","         *","         *  @example","         *      /\\d/            // for numeric digit-only input","         *      /\\d|\\-|\\./      // for floating point numeric input","         *      /\\d|\\//         // for Date field entry in MM/DD/YYYY format","         *","         * @attribute keyFiltering","         * @type {RegExp|Function}","         * @default null","         */","        keyFiltering:  {","            value:  null","        },","","        /**","         * Provides the capability to validate the final saved value after editing is finished.","         * This attribute can be set to either a RegEx or a function, that operates on the entire","         * \"value\" setting of the editor input (whereas [keyFiltering](#attr_keyFilter) performs","         * validation checks on each key input).","         *","         * If a function is provided, the single argument is the value setting of the editor.","         * the keystroke is valid it should return true, otherwise if invalid false;","         *","         *  @example","         *      /\\d/            // for numeric digit-only input","         *      /\\d|\\-|\\.|\\+/   // for floating point numeric input","         *      /\\d|\\//         // for Date field entry in MM/DD/YYYY format","         *","         * @attribute validator","         * @type {RegExp|Function}","         * @default null","         */","        validator: {","            value:      null","        }","","        /**","          Concept for user-prescribed key mappings ... still incomplete","","            keyNav: { modifier:'ctrl+meta', circular:true  }","","          OR, define ALL recognized key actions for navigation ...","","            keyNav:{","","               keydown:  {","                    left:  [ {ctrlKey:37}, {shiftKey:9}","                    right: [ {ctrlKey:39","                    up:    [ 38","                    down:  [ 40","                    save:  [ 13","                    cancel: [27","               },","","               mouse: {","                   open : [click, focus]","                   close : [ blur ]","               }","            }","","         */","","    }","});","","","//====================================================================================================================","//                   I N L I N E    C E L L    E D I T O R    D E F I N I T I O N S","//====================================================================================================================","","","/**","### Inline Cell Editor \"inline\"","This View configuration is used to setup an editor referenced as \"inline\" as a simple inline-type cell editor.","","##### Basic Usage:","          // Column definition","          { key:'surName', editor:\"inline\" }","","##### Standard Configuration","This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node. It","uses the default settings from the BaseViewClass's attributes.","","The configuration {Object} for this cell editor View is predefined as;","","         Y.DataTable.EditorOptions.inline = {","             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","             name:           'inline'","         };",""," **PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the"," `editorConfig` object.","","@class Y.DataTable.EditorOptions.inline","@since 3.8.0","@public","**/","Y.DataTable.EditorOptions.inline = {","    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","    name:           'inline'","};","","","/**","### Inline Cell Editor \"inlineNumber\"","This View configuration is used to setup an editor referenced as \"inlineNumber\" as a simple inline-type","cell editor.  It is identical to the \"inline\" textual editor but incorporates Numeric validation prior to","saving to the DT.","","##### Basic Usage:","        // Column definition","        { key:'unit_price', editor:\"inlineNumber\" }","","        // Column definition ... to allow integers only","        { key:'QuantityInStock', editor:\"inlineNumber\", editorConfig:{ keyFiltering: /\\d/ }  }","","##### Standard Configuration","This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node.  A `saveFn`","is defined that uses an ad-hoc attribute \"validationRegEx\" to test for validity prior to saving the data.  If the","value passes validation it is converted to numeric form and returned.","","The configuration {Object} for this cell editor View is predefined as;","","         Y.DataTable.EditorOptions.inlineNumber = {","             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","             name:           'inlineNumber',","             hideMouseLeave: false,","","             // Define a key filtering regex ... only allow digits, \"-\" or \".\"","             keyFiltering:   /\\.|\\d|\\-/,","","             // setup a RegExp to check for valid floating point input ....","             validator: /^\\s*(\\+|-)?((\\d+(\\.\\d*)?)|(\\.\\d*))\\s*$/,","","             // Function to call after numeric editing is complete, prior to saving to DataTable ...","             //  i.e. checks validation against ad-hoc attribute \"validationRegExp\" (if it exists)","             //       and converts the value to numeric (or undefined if fails regexp);","             saveFn: function(v){","                 var vre = this.get('validationRegExp'),","                     value;","                 if(vre instanceof RegExp) {","                     value = (vre.test(v)) ? +v : undefined;","                 } else {","                     value = +v;","                 }","                 return value;","             }","         };",""," **PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the"," `editorConfig` object.","","@class Y.DataTable.EditorOptions.inlineNumber","@since 3.8.0","@public","**/","Y.DataTable.EditorOptions.inlineNumber = {","    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","    name:           'inlineNumber',","    hideMouseLeave: false,","","    // Define a key filtering regex ...","    keyFiltering:   /\\.|\\d|\\-/,","    //keyValidator:   /^\\s*(\\+|-)?((\\d+(\\.\\d*)?)|(\\.\\d*))\\s*$/,","","    /**","     * A validation regular expression object used to check validity of the input floating point number.","     * This can be defined by the user to accept other numeric input, or set to \"null\" to disable regex checks.","     *","     * @attribute validator","     * @type {RegExp|Function}","     * @default /^\\s*(\\+|-)?((\\d+(\\.\\d+)?)|(\\.\\d+))\\s*$/","     */","    validator: /^\\s*(\\+|-)?((\\d+(\\.\\d*)?)|(\\.\\d*))\\s*$/,","","    // Function to call after numeric editing is complete, prior to saving to DataTable ...","    //  i.e. checks validation against ad-hoc attribute \"validationRegExp\" (if it exists)","    //       and converts the value to numeric (or undefined if fails regexp);","    saveFn: function(v){","        var vre = this.get('validator'),","            value;","        if(vre instanceof RegExp) {","            value = (vre.test(v)) ? +v : undefined;","        } else {","            value = +v;","        }","        return value;","    }","","};","","/**","### Inline Cell Editor \"inlineDate\"","This View configuration is used to setup an editor referenced as \"inlineDate\" as a simple inline-type","cell editor.  It is identical to the \"inline\" textual editor but incorporates Numeric validation prior to","saving to the DT.","","##### Basic Usage:","        // Column definition","        { key:'weddingDate', editor:\"inlineDate\" }","","        // Column definition with user-specified 'dateFormat' to display Date in text box on display","        { key:'date_of_claim', editor:\"inlineDate\", editorConfig:{ dateformat:'%Y-%m-%d'} }","","##### Standard Configuration","This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node.  Since","a JS Date object isn't very pretty to display / edit in a textbox, we use a `prepFn` to preformat the Date in a","human-readable form within the textbox.  Also a `saveFn` is defined to convert the entered data using `Date.parse`","back to a valid JS Date prior to saving to the DT.","","The configuration {Object} for this cell editor View is predefined as;","","        Y.DataTable.EditorOptions.inlineDate = {","             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","             name:           'inlineDate',","","             // Define default date format string to use","             dateFormat: \"%D\",","","             // Setup input key filtering for only digits, \"-\" or \"/\" characters","             keyFiltering:   /\\/|\\d|\\-/,","","             //  Function to call just prior to populating the INPUT text box,","             //   so we pre-format the textbox in \"human readable\" format here","             prepFn: function(v){","                 var dfmt =  this.get('dateFormat') || \"%m/%d/%Y\";","                 return Y.DataType.Date.format(v,{format:dfmt});","             },","","             // Function to call after Date editing is complete, prior to saving to DataTable ...","             //  i.e. converts back to \"Date\" format that DT expects ...","             saveFn: function(v){","                 return Y.DataType.Date.parse(v);","             }","        };",""," **PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the"," `editorConfig` object.","","@class Y.DataTable.EditorOptions.inlineDate","@since 3.8.0","@public","**/","Y.DataTable.EditorOptions.inlineDate = {","    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","    name:           'inlineDate',","","    /**","     * A user-supplied Date format string to be used to display the date in the View's container.","     * (Must conform with date format strings from http://yuilibrary.com/yui/docs/api/classes/Date.html#method_format,","     * i.e. strftime format)","     *","     * @attribute dateFormat","     * @type String","     * @default \"%D\"","     */","    dateFormat: \"%D\",","","    keyFiltering:   /\\/|\\d|\\-/,","","    //  Function to call just prior to populating the INPUT text box,","    //   so we pre-format the textbox in \"human readable\" format here","    prepFn: function(v){","        var dfmt =  this.get('dateFormat') || \"%m/%d/%Y\";","        return Y.DataType.Date.format(v,{format:dfmt});","    },","","    // Function to call after Date editing is complete, prior to saving to DataTable ...","    //  i.e. converts back to \"Date\" format that DT expects ...","    saveFn: function(v){","        return Y.DataType.Date.parse(v) || undefined;","    }","};","","","/**","### Inline Cell Editor \"inlineAC\"","This View configuration is used to setup an inline editor referenced as \"inlineAC\" composed of a simple inline-type","cell editor which has the AutoComplete plugin attached to the input node.","","##### Basic Usage:","       // Column definition","       { key:'degreeProgram', editor:\"inlineAC\",","         editorConfig:{","","            // The following object is passed to \"autocomplete\" plugin when this","            //   editor is instantiated","            autocompleteConfig: {","               source:  [ \"Bachelor of Science\", \"Master of Science\", \"PhD\" ]","               on: {","                   select: function(r){","                       var val = r.result.display;","                       this.editor.saveEditor(val);","                   }","               }","            }","          }","       }","","##### Standard Configuration","This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node.","When the editor is first instantiated, the Y.Plugin.AutoComplete is connected to the INPUT using the `autocompleteConfig`","object passed in by the user.","","This editor View instance is attached to the autocomplete plugin as static property \"editor\".  An \"on:select\" listener","is defined in the configs to take action on saving the selected item from the autocomplete.","","The configuration {Object} for this cell editor View is predefined as;","","        Y.DataTable.EditorOptions.inlineAC = {","             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","             name:           'inlineAC',","             hideMouseLeave: false,","","             // Define listener to this editor View's events","             after: {","","                //---------","                //  After this View is instantiated and created,","                //     configure the Y.Plugin.AutoComplete as a plugin to the editor INPUT node","                //---------","                editorCreated : function(o){","                   var inputNode = o.inputNode,","                       // Get the users's editorConfig \"autocompleteConfig\" settings","                       acConfig = this.get('autocompleteConfig') || {},","                       editor = this;","","                   if(inputNode && Y.Plugin.AutoComplete) {","                       // merge user settings with these required settings ...","                       acConfig = Y.merge(acConfig,{","                           alwaysShowList: true,","                           render: true","                       });","                       // plug in the autocomplete and we're done ...","                       inputNode.plug(Y.Plugin.AutoComplete, acConfig);","","                       // add this View class as a static prop on the ac plugin","                       inputNode.ac.editor = editor;","                   }","","                }","             }","         };","","**PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the","`editorConfig` object.","","@class Y.DataTable.EditorOptions.inlineAC","@since 3.8.0","@public","**/","Y.DataTable.EditorOptions.inlineAC = {","    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,","    name:           'inlineAC',","    hideMouseLeave: false,","","    /**","     * A user-supplied set of configuration parameters to be passed into this View's Y.Plugin.AutoComplete","     * configuration object.","     *","     * At a bare minimum, the user MUST provide the \"source\" of data for the AutoComplete !!","     *","     * For this control to save anything, the user needs to define an \"on:select\" listener in the AC's","     * \"autocompleteConfig\" in order to saveEditor when the select action occurs.","     *","     * @attribute autocompleteConfig","     * @type Object","     * @default {}","     */","","    // Define listener to this editor View's events","    after: {","","       //---------","       //  After this View is instantiated and created,","       //     configure the Y.Plugin.AutoComplete as a plugin to the editor INPUT node","       //---------","       editorCreated : function(o){","           var inputNode = o.inputNode,","               // Get the users's editorConfig \"autocompleteConfig\" settings","               acConfig = this.get('autocompleteConfig') || {},","               editor = this;","","           if(inputNode && Y.Plugin.AutoComplete) {","               // merge user settings with these required settings ...","               acConfig = Y.merge(acConfig,{","                   alwaysShowList: true,","                   render: true","               });","               // plug in the autocomplete and we're done ...","               inputNode.plug(Y.Plugin.AutoComplete, acConfig);","","               // add this View class as a static prop on the ac plugin","               inputNode.ac.editor = editor;","           }","","       }","    }","","};","","","}, '@VERSION@', {","    \"supersedes\": [","        \"\"","    ],","    \"skinnable\": \"true\",","    \"requires\": [","        \"gallery-datatable-editable\",","        \"view\",","        \"base-build\",","        \"event-mouseenter\"","    ],","    \"optional\": [","        \"\"","    ]","});"];
_yuitest_coverage["build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js"].lines = {"1":0,"74":0,"82":0,"148":0,"149":0,"150":0,"159":0,"160":0,"179":0,"192":0,"193":0,"202":0,"203":0,"204":0,"207":0,"217":0,"218":0,"227":0,"233":0,"243":0,"244":0,"245":0,"248":0,"250":0,"251":0,"253":0,"254":0,"270":0,"275":0,"276":0,"279":0,"318":0,"321":0,"322":0,"323":0,"327":0,"328":0,"329":0,"332":0,"365":0,"366":0,"367":0,"369":0,"370":0,"372":0,"374":0,"392":0,"417":0,"429":0,"430":0,"431":0,"437":0,"438":0,"439":0,"440":0,"441":0,"445":0,"446":0,"462":0,"465":0,"468":0,"469":0,"470":0,"473":0,"474":0,"477":0,"478":0,"481":0,"482":0,"485":0,"486":0,"489":0,"490":0,"496":0,"498":0,"499":0,"501":0,"515":0,"519":0,"522":0,"523":0,"526":0,"528":0,"531":0,"532":0,"533":0,"536":0,"564":0,"571":0,"572":0,"574":0,"575":0,"588":0,"599":0,"608":0,"609":0,"630":0,"657":0,"691":0,"922":0,"981":0,"1004":0,"1006":0,"1007":0,"1009":0,"1011":0,"1068":0,"1088":0,"1089":0,"1095":0,"1176":0,"1203":0,"1208":0,"1210":0,"1215":0,"1218":0};
_yuitest_coverage["build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js"].functions = {"initializer:147":0,"destructor:158":0,"_bindUI:177":0,"(anonymous 2):202":0,"_unbindUI:201":0,"_defSaveFn:216":0,"_defCancelFn:226":0,"_defShowFn:232":0,"showEditor:269":0,"saveEditor:314":0,"hideEditor:364":0,"cancelEditor:390":0,"processKeyPress:416":0,"processKeyDown:461":0,"_createUI:514":0,"_resizeCont:563":0,"_parseStyle:587":0,"_onClick:598":0,"_onMouseLeave:607":0,"_setEditorXY:623":0,"valueFn:656":0,"validator:691":0,"saveFn:1003":0,"prepFn:1087":0,"saveFn:1094":0,"editorCreated:1202":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js"].coveredLines = 116;
_yuitest_coverage["build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js"].coveredFunctions = 27;
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1);
YUI.add('gallery-datatable-celleditor-inline', function (Y, NAME) {

/**
 A View class that serves as the BASE View class for a TD Cell "inline" editor, i.e. an editor that
 is a single INPUT node that completely overlies the TD cell.  This editor is intended to replicate
 the familiar "spreadsheet" type of input.

 ##### Editing / Validation

 This editor view creates a simple INPUT[type=text] control and repositions and resizes it to match the
 underlying TD, set with a z-Index to visually appear over the TD cell.

 Key listeners are provided to detect changes, prohibit invalid keystrokes (via the [keyFiltering](#attr_keyFiltering)
  setting) and to allow validation upon a "save" entry (keyboard RTN stroke) where a [validator](#attr_validator) can
 be prescribed to allow/disallow changes based upon the overall "value" of the INPUT control.

 ##### Navigation
 The editor provides the capability to navigate from TD cell via key listeners on the following key
 combinations;
  * CTRL-arrow keys
  * TAB goes to RIGHT, SHIFT-TAB goes to left
  * ESC cancels editing
  * RTN saves cell

 Key navigation can be disabled via the [inputKeys](#attr_inputKeys) attribute set to `false`.

 When a "key navigation" request is received it is passed to the [keyDir](#attr_keyDir) as a change
 in [row,col] that implementers can listen to "change" events on, to reposition and open editing on the
 new relative cell.  (NOTE: This view does not reposition, it simply fires a `keyDirChange` event.

 ##### Events
 Several events are fired by this View;  which can be listened for and acted upon to achieve differing results.
 For example, the Y.DataTable.EditorOptions.inlineAC (inline autocompletion editor) listens for the
 [editorCreated](#event_editorCreated) event and once received, it configures the autocomplete plugin onto the
 INPUT node.

 ##### Configuration
 Ths Y.DataTable.BaseCellInlineEditor editor is intended to be configured by varying the configuration
 parameters (i.e. attribute and related configuration) to permit a variety of editing features.

 Since the View class permits ad-hoc attributes, the implementer can pass many properties in during instantiation
 that will become available as run-time View attributes.

 This Module includes several pre-defined editor configurations which are stored within the Y.DataTable.EditorOptions
 namespace (presently there are "inline", "inlineNumber", "inlineDate", "inlineAC").  New inline editors can be
 created and added to this namespace at runtime, and by defining the `BaseViewClass:Y.DataTable.BaseCellInlineEditor` property.

 For example, the pre-built configuration object for the [inlineDate](Y.DataTable.EditorOptions.inlineDate.html) inline editor
 is stored as `Y.DataTable.EditorOptions.inlineDate`.

 To configure an editor on-the-fly (i.e. within a DataTable column definition) just include the configuration object options
 within DT's column `editorConfig` object, which is Y.merge'ed with the pre-built configs;

        // define an 'inlineDate' editor with additional configs ...
        { key:'date_of_claim', editor:"inlineDate", editorConfig:{ dateformat:'%Y-%m-%d'} }

 This `Y.DataTable.BaseCellinlineEditor` class is similar to (and compatible with ) the `Y.DataTable.BaseCellPopupEditor`
 in another gallery module.  Note that since the "inline" editor uses a simple INPUT[type=text] Node instead of an
 Overlay the codeline is quite a bit simpler.

 ###### KNOWN ISSUES:
   <ul>
   <li>This View doesn't work well with scrolling DT's, so I've disabled it currently.</li>
   <li>Sometimes after a DT's `editable` ATTR is toggled true/false a "cannot read 'style'" message occurs and editing failes
        requiring a page refresh.</li>
   </ul>

 @module gallery-datatable-celleditor-inline
 @class Y.DataTable.BaseCellInlineEditor
 @extends Y.View
 @author Todd Smith
 @since 3.8.0
 **/
_yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 74);
var KEYC_ESC = 27,
    KEYC_RTN = 13,
    KEYC_TAB = 9,
    KEYC_UP  = 38,
    KEYC_DOWN  = 40,
    KEYC_RIGHT  = 39,
    KEYC_LEFT  = 37;

_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 82);
Y.DataTable.BaseCellInlineEditor =  Y.Base.create('celleditor',Y.View,[],{

    /**
     * Defines the INPUT HTML content "template" for this editor's View container
     * @property template
     * @type String
     * @default '<input type="text" class="{cssInput}" />'
     * @static
     */
    template: '<input type="text" class="{cssInput}" />',

    /**
     * Defines the View container events and listeners used within this View
     * @property events
     * @type Object
     * @default See Code
     * @static
     */
    events : {
        'input' : {
            'keypress':     'processKeyPress',      // for key filtering and charCode keys
            'keydown':      'processKeyDown',           // for direction, ESC only, keyCode
            'click' :       '_onClick',
            'mouseleave' :  '_onMouseLeave'
        }
    },

    /**
     * Array of detach handles to any listeners set on this View class
     * @property _subscr
     * @type Array of EventHandles
     * @default null
     * @protected
     * @static
     */
    _subscr: null,

    /**
     * CSS classname to identify the editor's INPUT Node
     * @property _classInput
     * @type String
     * @default 'yui3-datatable-inline-input'
     * @protected
     * @static
     */
    _cssInput: 'yui3-datatable-inline-input',

    /**
     * Placeholder for the created INPUT Node created within the View container
     * @property _inputNode
     * @type Node
     * @default null
     * @protected
     * @static
     */
    _inputNode: false,

//======================   LIFECYCLE METHODS   ===========================

    /**
     * Initialize and create the View contents
     * @method initializer
     * @public
     * @return {*}
     */
    initializer: function(){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "initializer", 147);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 148);
this._createUI();
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 149);
this._bindUI();
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 150);
return this;
    },

    /**
     * Cleans up the View after it is destroyed
     * @method destructor
     * @public
     */
    destructor: function(){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "destructor", 158);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 159);
this._unbindUI();
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 160);
this.fire('editorDestroyed');
    },

    /**
     * Event fired when the cell editor View is destroyed.
     *
     * Implementers can listen for this event to check if any sub-components / widgets, etc.. they
     * had created as part of this View need to be destroyed or listener unbound.
     *
     * @event editorDestroyed
     */

    /**
     * Adds a listener to this editor instance to reposition based on "xy" attribute changes
     * @method _bindUI
     * @private
     */
    _bindUI: function(){

        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_bindUI", 177);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 179);
this.publish({
            save: {
                defaultFn:   this._defSaveFn
            },
            cancel: {
                defaultFn:   this._defCancelFn
            },
            show: {
                defaultFn: this._defShowFn
            }
        });

        // This is here to support "scrolling" of the underlying DT ...
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 192);
this._subscr = [];
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 193);
this._subscr.push( this.on('xyChange',this._setEditorXY) );
    },

    /**
     * Detaches any listener handles created by this view
     * @method _unbindUI
     * @private
     */
    _unbindUI: function(){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_unbindUI", 201);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 202);
Y.Array.each(this._subscr,function(e){
            _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "(anonymous 2)", 202);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 203);
if(e && e.detach) {
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 204);
e.detach();
            }
        });
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 207);
this._subscr = null;
    },

    /**
     * The defaultFn for the `save` event
     * @method _defSaveFn
     * @param e {EventFacade} For save event
     * @private
     */
    _defSaveFn: function(e){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_defSaveFn", 216);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 217);
this.set('value', e.newValue);
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 218);
this.hideEditor();
    },

    /**
     * The defaultFn for the `cancel` event
     * @method _defCancelFn
     * @private
     */
    _defCancelFn: function(){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_defCancelFn", 226);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 227);
this.hideEditor();
    },

    /**
     */
    _defShowFn: function (ev) {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_defShowFn", 232);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 233);
var cont = this.get('container'),
            cell = ev.cell,
            td = cell.td || ev.td,
            xy = td.getXY(),
            val = ev.value;
        //
        // Get the TD Node's XY position, and resize/position the container
        //   over the TD
        //

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 243);
cont.show();
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 244);
this._resizeCont(cont,td);
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 245);
cont.setXY(xy);

        // focus the inner INPUT ...
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 248);
this._inputNode.focus();
        // set the INPUT value
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 250);
this._inputNode.set('value',val);
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 251);
this.set('lastValue',val);

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 253);
this._set('visible',true);
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 254);
this._set('hidden',false);
    },

//======================   PUBLIC METHODS   ===========================

    /**
     * Displays the inline cell editor and positions / resizes the INPUT to
     * overlay the edited TD element.
     *
     * Set the initial value for the INPUT element, after preprocessing (if reqd)
     *
     * @method showEditor
     * @param {Node} td The Node instance of the TD to begin editing on
     * @public
     */
    showEditor: function(td) {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "showEditor", 269);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 270);
var cell = this.get('cell'),
            val  = cell.value || this.get('value'),
            prepfn = this.get('prepFn');


        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 275);
if (prepfn) { // you have already checked it is a function
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 276);
val = prepfn.call(this, val);
        }

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 279);
this.fire('show',{
            td:         td,
            cell:       cell,
            inputNode:  this._inputNode,
            value:      val
        });

    },

    /**
     * Event fired when the cell editor is displayed and becomes visible.
     *
     * Implementers may listen for this event if they have configured complex View's, that include
     * other widgets or components, to update their UI upon displaying of the view.
     *
     * @event show
     * @param {Object} rtn Returned object
     * @param {Node} rtn.td TD Node instance of the calling editor
     * @param {Node} rtn.inputNode The editor's INPUT / TEXTAREA Node
     * @param {String|Number|Date} rtn.value The current "value" setting
     * @param {Object} rtn.cell object
     */

    /**
     * Saves the View's `value` setting (usually after keyboard RTN or other means) and fires the
     * [save](#event_editorSave) event so consumers (i.e. DataTable) can make final changes to the
     * Model or dataset.
     *
     * Thank you to **Satyam** for his guidance on configuring the event publishing, defaultFn related to this
     * technique!

     * @method saveEditor
     * @param val {String|Number|Date} Raw value setting to be saved after editing
     * @public
     */
    saveEditor: function(val){
        //
        //  Only save the edited data if it is valid ...
        //
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "saveEditor", 314);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 318);
if( val !== undefined && val !== null ){

            // If a "save" function was defined, run thru it and update the "value" setting
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 321);
var savefn = this.get('saveFn') ;
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 322);
if (savefn) {
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 323);
val = savefn.call(this,val);
            }

            // So value was initially okay, but didn't pass saveFn validation call ...
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 327);
if (val === undefined) {
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 328);
this.cancelEditor();
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 329);
return;
            }

            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 332);
this.fire("save",{
                td:         this.get('cell').td,
                cell:       this.get('cell'),
                oldValue:   this.get('lastValue'),
                newValue:   val
            });
        }
    },

    /**
     * Event that is fired when the user has finished editing the View's cell contents (signified by either
     * a keyboard RTN entry or "Save" button, etc...).
     *
     * This event is intended to be the PRIMARY means for implementers to know that the editing has been
     * completed and validated.  Consumers (i.e. DataTable) should listen to this event and process it's results
     * to save to the Model and or dataset for the DT.
     *
     * @event save
     * @param {Object} rtn Returned object
     *  @param {Node} rtn.td TD Node for the edited cell
     *  @param {Object} rtn.cell Current cell object
     *  @param {String|Number|Date} rtn.oldValue Data value of this cell prior to editing
     *  @param {String|Number|Date} rtn.newValue Data value of this cell after editing
     */

    /**
     * Hides the current editor View instance.  If the optional `hideMe` param is true this View will
     * be temporarily "hidden" (used for scrolling DT's when the TD is scrolled off/on to the page)
     *
     * @method hideEditor
     * @public
     */
    hideEditor: function(hideMe){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "hideEditor", 364);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 365);
var cont  = this.get('container');
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 366);
if(cont && cont.hide) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 367);
cont.hide();
        }
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 369);
if(hideMe===true) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 370);
this._set('hidden',true);
        }
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 372);
this._set('visible',false);

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 374);
this.fire('editorHide');

    },

    /**
     * Fired when the active cell editor is hidden
     * @event editorHide
     */

    /**
     * Called when the user has requested to cancel, and abort any changes to the DT cell,
     * usually signified by a keyboard ESC or "Cancel" button, etc..
     *
     * @method cancelEditor
     * @public
     */
    cancelEditor: function(){
      //  this.hideEditor();
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "cancelEditor", 390);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 392);
this.fire("cancel",{
            td:         this.get('cell').td,
            cell:       this.get('cell'),
            oldValue:   this.get('lastValue')
        });
    },

    /**
     * Fired when editing is cancelled (without saving) on this cell editor
     * @event cancel
     * @param {Object} rtn Returned object
     *  @param {Node} rtn.td TD Node for the edited cell
     *  @param {Object} rtn.cell Current cell object
     *  @param {String|Number|Date} rtn.oldValue Data value of this cell prior to editing
     */

    /**
     * Provides a method to process keypress entries and validate or prevent invalid inputs.
     * This method is meant to be overrideable by implementers to customize behaviors.
     *
     * @method processKeyPress
     * @param e {EventFacade} Key press event object
     * @public
     */
    processKeyPress: function(e) {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "processKeyPress", 416);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 417);
var keyc    = e.keyCode,
            inp     = e.target || this._inputNode,
            value   = inp.get('value'),
            keyfilt = this.get('keyFiltering'),
         //   keyvald = this.get('keyValidator'),
            kchar   = String.fromCharCode(keyc),
            flagRE  = true,
            krtn;

        //
        // If RTN, then prevent and save ...
        //
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 429);
if(keyc === KEYC_RTN) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 430);
e.preventDefault();
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 431);
this.saveEditor(value);
        }

        //
        // Check key filtering validation ... either a RegExp or a user-function
        //
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 437);
if(keyfilt instanceof RegExp) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 438);
flagRE = (!kchar.match(keyfilt)) ? false : flagRE;
        } else {_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 439);
if (Y.Lang.isFunction(keyfilt)) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 440);
krtn = keyfilt.call(this,e);
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 441);
flagRE = (krtn) ? true : false;
        }}

        // If key filtering returned false, prevent continuing
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 445);
if(!flagRE) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 446);
e.preventDefault();
        }

    },

    /**
     * Key listener for the INPUT inline editor, "keydown" is checked for non-printing key
     *  strokes, navigation or ESC.
     *
     *  This method is intended to overridden by implementers in order to customize behaviors.
     *
     * @method processKeyDown
     * @param e {EventFacade} Keydown event facade
     * @public
     */
    processKeyDown : function(e){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "processKeyDown", 461);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 462);
var keyc    = e.keyCode,
            dir;

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 465);
switch(keyc) {

            case KEYC_ESC:
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 468);
e.preventDefault();
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 469);
this.cancelEditor();
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 470);
break;

            case KEYC_UP:
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 473);
dir = (e.ctrlKey) ? [-1,0] : null;
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 474);
break;

            case KEYC_DOWN:
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 477);
dir = (e.ctrlKey) ? [1,0] : null;
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 478);
break;

            case KEYC_LEFT:
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 481);
dir = (e.ctrlKey) ? [0,-1] : null;
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 482);
break;

            case KEYC_RIGHT:
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 485);
dir = (e.ctrlKey) ? [0,1] : null;
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 486);
break;

            case KEYC_TAB: // tab
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 489);
dir = (e.shiftKey) ? [0,-1] : [0,1] ;
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 490);
break;
        }

        //
        //  If dir is non-falsey, a navigation direction was set ...
        //
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 496);
if(dir) {
            // set the key direction movement
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 498);
if(this.get('inputKeys')===true) {
                _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 499);
this._set('keyDir',dir);
            }
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 501);
e.preventDefault();
        }

    },

//======================   PRIVATE METHODS   ===========================

    /**
     * Processes the initial container for this View, sets up the HTML content
     *  and creates a listener for positioning changes
     * @method _createUI
     * @private
     */
    _createUI: function() {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_createUI", 514);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 515);
var container = this.get('container'),
            html      = Y.Lang.sub(this.template, {cssInput:this._cssInput});

        // set the View container contents
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 519);
container.setHTML(html);

        // Append the container element to the DOM if it's not on the page already.
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 522);
if (!container.inDoc()) {
          _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 523);
Y.one('body').append(container);
        }

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 526);
container.setStyle('zIndex',999);

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 528);
container.hide();

        // set a static placeholder for the input ...
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 531);
this._inputNode = container.one('input');
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 532);
if(this.get('className')) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 533);
this._inputNode.addClass(this.get('className'));
        }

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 536);
this.fire('editorCreated',{
            inputNode:  this._inputNode,
            container:  container
        });

    },

    /**
     * View event fired when the inline editor has been initialized and ready for usage.
     * This event can be listened to in order to add additional content or widgets, etc onto
     * the View's container.
     *
     * @event editorCreated
     * @param {Object} rtn Returned object
     *  @param {Node} rtn.inputNode The created INPUT[text] node
     *  @param {Object} rtn.container The View container
     */

    /**
     * Resizes the view "container" to match the dimensions of the TD cell that is
     *  being edited.
     *
     * @method _resizeCont
     * @param {Node} cont The Node instance of the "container" of this view
     * @param {Node} td The Node instance for the TD to match dimensions of
     * @private
     */
    _resizeCont: function(cont,td) {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_resizeCont", 563);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 564);
var w   = this._parseStyle(td,'width'),
            h   = this._parseStyle(td,'height'),
            pl  = this._parseStyle(td,'paddingLeft'),
            pt  = this._parseStyle(td,'paddingTop'),
            blw = this._parseStyle(td,'borderLeftWidth');

        //  resize the INPUT width and height based upon the TD's styles
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 571);
w += pl + blw - 1;
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 572);
h += pt;

        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 574);
cont.setStyle('width',w+'px');
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 575);
cont.setStyle('height',h+'px');

    },

    /**
     * Helper method that returns the computed CSS style for the reference node as a parsed number
     * @method _parseStyle
     * @param el {Node} Node instance to check style on
     * @param v {String} Style name to return
     * @return {Number|String} Computed style with 'px' removed
     * @private
     */
    _parseStyle: function(el,v) {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_parseStyle", 587);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 588);
return +(el.getComputedStyle(v).replace(/px/,''));
    },

    /**
     * Listener to INPUT "click" events that will stop bubbling to the DT TD listener,
     * to prevent closing editing while clicking within an INPUT.
     * @method _onClick
     * @param o {EventFacade}
     * @private
     */
    _onClick: function(o) {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_onClick", 598);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 599);
o.stopPropagation();
    },

    /**
     * Listener to mouseleave event that will hide the editor if attribute "hideMouseLeave" is true
     * @method _onMouseLeave
     * @private
     */
    _onMouseLeave : function() {
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_onMouseLeave", 607);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 608);
if(this.get('hideMouseLeave')){
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 609);
this.hideEditor();
        }
    },

    /**
     * This method can be used to quickly reset the current View editor's position,
     *  used for scrollable DataTables.
     *
     * NOTE: Scrollable inline editing is a little "rough" right now
     *
     * @method _setEditorXY
     * @param e {EventFacade} The xy attribute change event facade
     * @private
     */
    _setEditorXY: function() {

        //if(this._inputNode && e.newVal) {
        //    this._inputNode.setXY(e.newVal);
        //}

        //TODO: Worst case, if this doesn't work just hide this sucker on scrolling !
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "_setEditorXY", 623);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 630);
this.hideEditor();
    }


},{
    ATTRS:{

        /**
         * Name for this View instance
         * @attribute name
         * @type String
         * @default null
         */
        name :{
            value:      null,
            validator:  Y.Lang.isString
        },

        /**
         * A cell reference object populated by the calling DataTable, contains
         * the following key properties: {td,value,recClientId,colKey}
         * @attribute cell
         * @type Object
         * @default {}
         */
        cell: {
            valueFn: function () {
                _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "valueFn", 656);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 657);
return {};  // otherwise you get all of them pointing exactly to the same static object.
            }
        },

        /**
         * Value that was saved in the Editor View and returned to the record
         *
         * @attribute value
         * @type {String|Number|Date}
         * @default null
         */
        value: {
            value:  null
        },

        /**
         * Value that was contained in the cell when the Editor View was displayed
         *
         * @attribute lastValue
         * @type {String|Number|Date}
         * @default null
         */
        lastValue:{
            value:  null
        },

        /**
         * Maintains a reference back to the calling DataTable instance
         * @attribute hostDT
         * @type Y.DataTable
         * @default null
         */
        hostDT : {
            value:  null,
            validator:  function(v) { _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "validator", 691);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 691);
return v instanceof Y.DataTable; }
        },

        /**
         * Function to execute on the "data" contents just prior to displaying in the Editor's main view
         * (i.e. typically used for pre-formatting Date information from JS to mm/dd/YYYY format)
         *
         * This function will receive one argument "value" which is the data value from the record, and
         *  the function runs in Editor scope.
         *
         * @attribute prepFn
         * @type Function
         * @default null
         */
        prepFn: {
            value:      null,
            validator:  Y.Lang.isFunction
        },

        /**
         * Function to execute when Editing is complete, prior to "saving" the data to the Record (Model)
         * This function will receive one argument "value" which is the data value from the INPUT and within
         * the scope of the current View instances.
         *
         * This method is intended to be used for input validation prior to saving.  **If the returned value
         * is "undefined" the cancelEditor method is executed.**
         *
         * @attribute saveFn
         * @type Function
         * @default null
         */
        saveFn:{
            value:      null,
            validator:  Y.Lang.isFunction
        },

        /**
         * This flag dictates whether the View container is hidden when the mouse leaves
         * the focus of the inline container.
         * Typically we want this behavior, one example where we don't would be an
         * inline autocomplete editor.
         * @attribute hideMouseLeave
         * @type Boolean
         * @default true
         */
        hideMouseLeave : {
            value:      true,
            validator:  Y.Lang.isBoolean
        },

        /**
         * Prescribes a CSS class name to be added to the editor's INPUT node after creation.
         * @attribute className
         * @type String
         * @default null
         */
        className: {
            value:      null,
            validator:  Y.Lang.isString
        },

        /**
         * A flag to indicate if cell-to-cell navigation should be implemented (currently setup for CTRL-arrow
         * key, TAB and Shift-TAB) capability
         * @attribute inputKeys
         * @type Boolean
         * @default true
         */
        inputKeys:{
            value:      true,
            validator:  Y.Lang.isBoolean
        },

        /**
         * Tracks navigation changes during keyboard input as relative [row,col] changes from the currently
         * active cell TD.
         *
         * @attribute keyDir
         * @type Array as [row,col] from current TD
         * @readOnly
         * @default []
         */
        keyDir: {
            value:      [],
            readOnly:   true,
            validator:  Y.Lang.isArray
        },

        /**
         * Setting for checking the visibility status of this Editor
         * @attribute visible
         * @type Boolean
         * @default false
         * @readOnly
         */
        visible: {
            value:      false,
            readOnly:   true,
            validator:  Y.Lang.isBoolean
        },

        /**
         * Setting to check if the editor is "still open" but just hidden, created in order to support
         * scrolling datatables when an editor scrolls out of open window.
         *
         * @attribute hidden
         * @type Boolean
         * @default false
         * @readOnly
         */
        hidden: {
            value:      false,
            readOnly:   true,
            validator:  Y.Lang.isBoolean
        },

        /**
         * XY coordinate position of the editor View container (INPUT)
         * @attribute xy
         * @type Array
         * @default null
         */
        xy : {
            value:      null,
            validator:  Y.Lang.isArray
        },

        /**
         * Provides a keystroke filtering capability to restrict input into the editing area checked during the
         * "keypress" event.  This attribute is set to either a RegEx or a function that confirms if the keystroke
         * was valid for this editor.  (TRUE meaning valid, FALSE meaning invalid)
         *
         * If a function is provided, the single argument is the keystroke event facade `e` and if
         * the keystroke is valid it should return true, otherwise if invalid false;
         *
         *  @example
         *      /\d/            // for numeric digit-only input
         *      /\d|\-|\./      // for floating point numeric input
         *      /\d|\//         // for Date field entry in MM/DD/YYYY format
         *
         * @attribute keyFiltering
         * @type {RegExp|Function}
         * @default null
         */
        keyFiltering:  {
            value:  null
        },

        /**
         * Provides the capability to validate the final saved value after editing is finished.
         * This attribute can be set to either a RegEx or a function, that operates on the entire
         * "value" setting of the editor input (whereas [keyFiltering](#attr_keyFilter) performs
         * validation checks on each key input).
         *
         * If a function is provided, the single argument is the value setting of the editor.
         * the keystroke is valid it should return true, otherwise if invalid false;
         *
         *  @example
         *      /\d/            // for numeric digit-only input
         *      /\d|\-|\.|\+/   // for floating point numeric input
         *      /\d|\//         // for Date field entry in MM/DD/YYYY format
         *
         * @attribute validator
         * @type {RegExp|Function}
         * @default null
         */
        validator: {
            value:      null
        }

        /**
          Concept for user-prescribed key mappings ... still incomplete

            keyNav: { modifier:'ctrl+meta', circular:true  }

          OR, define ALL recognized key actions for navigation ...

            keyNav:{

               keydown:  {
                    left:  [ {ctrlKey:37}, {shiftKey:9}
                    right: [ {ctrlKey:39
                    up:    [ 38
                    down:  [ 40
                    save:  [ 13
                    cancel: [27
               },

               mouse: {
                   open : [click, focus]
                   close : [ blur ]
               }
            }

         */

    }
});


//====================================================================================================================
//                   I N L I N E    C E L L    E D I T O R    D E F I N I T I O N S
//====================================================================================================================


/**
### Inline Cell Editor "inline"
This View configuration is used to setup an editor referenced as "inline" as a simple inline-type cell editor.

##### Basic Usage:
          // Column definition
          { key:'surName', editor:"inline" }

##### Standard Configuration
This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node. It
uses the default settings from the BaseViewClass's attributes.

The configuration {Object} for this cell editor View is predefined as;

         Y.DataTable.EditorOptions.inline = {
             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
             name:           'inline'
         };

 **PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the
 `editorConfig` object.

@class Y.DataTable.EditorOptions.inline
@since 3.8.0
@public
**/
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 922);
Y.DataTable.EditorOptions.inline = {
    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inline'
};


/**
### Inline Cell Editor "inlineNumber"
This View configuration is used to setup an editor referenced as "inlineNumber" as a simple inline-type
cell editor.  It is identical to the "inline" textual editor but incorporates Numeric validation prior to
saving to the DT.

##### Basic Usage:
        // Column definition
        { key:'unit_price', editor:"inlineNumber" }

        // Column definition ... to allow integers only
        { key:'QuantityInStock', editor:"inlineNumber", editorConfig:{ keyFiltering: /\d/ }  }

##### Standard Configuration
This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node.  A `saveFn`
is defined that uses an ad-hoc attribute "validationRegEx" to test for validity prior to saving the data.  If the
value passes validation it is converted to numeric form and returned.

The configuration {Object} for this cell editor View is predefined as;

         Y.DataTable.EditorOptions.inlineNumber = {
             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
             name:           'inlineNumber',
             hideMouseLeave: false,

             // Define a key filtering regex ... only allow digits, "-" or "."
             keyFiltering:   /\.|\d|\-/,

             // setup a RegExp to check for valid floating point input ....
             validator: /^\s*(\+|-)?((\d+(\.\d*)?)|(\.\d*))\s*$/,

             // Function to call after numeric editing is complete, prior to saving to DataTable ...
             //  i.e. checks validation against ad-hoc attribute "validationRegExp" (if it exists)
             //       and converts the value to numeric (or undefined if fails regexp);
             saveFn: function(v){
                 var vre = this.get('validationRegExp'),
                     value;
                 if(vre instanceof RegExp) {
                     value = (vre.test(v)) ? +v : undefined;
                 } else {
                     value = +v;
                 }
                 return value;
             }
         };

 **PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the
 `editorConfig` object.

@class Y.DataTable.EditorOptions.inlineNumber
@since 3.8.0
@public
**/
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 981);
Y.DataTable.EditorOptions.inlineNumber = {
    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inlineNumber',
    hideMouseLeave: false,

    // Define a key filtering regex ...
    keyFiltering:   /\.|\d|\-/,
    //keyValidator:   /^\s*(\+|-)?((\d+(\.\d*)?)|(\.\d*))\s*$/,

    /**
     * A validation regular expression object used to check validity of the input floating point number.
     * This can be defined by the user to accept other numeric input, or set to "null" to disable regex checks.
     *
     * @attribute validator
     * @type {RegExp|Function}
     * @default /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/
     */
    validator: /^\s*(\+|-)?((\d+(\.\d*)?)|(\.\d*))\s*$/,

    // Function to call after numeric editing is complete, prior to saving to DataTable ...
    //  i.e. checks validation against ad-hoc attribute "validationRegExp" (if it exists)
    //       and converts the value to numeric (or undefined if fails regexp);
    saveFn: function(v){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "saveFn", 1003);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1004);
var vre = this.get('validator'),
            value;
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1006);
if(vre instanceof RegExp) {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1007);
value = (vre.test(v)) ? +v : undefined;
        } else {
            _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1009);
value = +v;
        }
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1011);
return value;
    }

};

/**
### Inline Cell Editor "inlineDate"
This View configuration is used to setup an editor referenced as "inlineDate" as a simple inline-type
cell editor.  It is identical to the "inline" textual editor but incorporates Numeric validation prior to
saving to the DT.

##### Basic Usage:
        // Column definition
        { key:'weddingDate', editor:"inlineDate" }

        // Column definition with user-specified 'dateFormat' to display Date in text box on display
        { key:'date_of_claim', editor:"inlineDate", editorConfig:{ dateformat:'%Y-%m-%d'} }

##### Standard Configuration
This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node.  Since
a JS Date object isn't very pretty to display / edit in a textbox, we use a `prepFn` to preformat the Date in a
human-readable form within the textbox.  Also a `saveFn` is defined to convert the entered data using `Date.parse`
back to a valid JS Date prior to saving to the DT.

The configuration {Object} for this cell editor View is predefined as;

        Y.DataTable.EditorOptions.inlineDate = {
             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
             name:           'inlineDate',

             // Define default date format string to use
             dateFormat: "%D",

             // Setup input key filtering for only digits, "-" or "/" characters
             keyFiltering:   /\/|\d|\-/,

             //  Function to call just prior to populating the INPUT text box,
             //   so we pre-format the textbox in "human readable" format here
             prepFn: function(v){
                 var dfmt =  this.get('dateFormat') || "%m/%d/%Y";
                 return Y.DataType.Date.format(v,{format:dfmt});
             },

             // Function to call after Date editing is complete, prior to saving to DataTable ...
             //  i.e. converts back to "Date" format that DT expects ...
             saveFn: function(v){
                 return Y.DataType.Date.parse(v);
             }
        };

 **PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the
 `editorConfig` object.

@class Y.DataTable.EditorOptions.inlineDate
@since 3.8.0
@public
**/
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1068);
Y.DataTable.EditorOptions.inlineDate = {
    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inlineDate',

    /**
     * A user-supplied Date format string to be used to display the date in the View's container.
     * (Must conform with date format strings from http://yuilibrary.com/yui/docs/api/classes/Date.html#method_format,
     * i.e. strftime format)
     *
     * @attribute dateFormat
     * @type String
     * @default "%D"
     */
    dateFormat: "%D",

    keyFiltering:   /\/|\d|\-/,

    //  Function to call just prior to populating the INPUT text box,
    //   so we pre-format the textbox in "human readable" format here
    prepFn: function(v){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "prepFn", 1087);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1088);
var dfmt =  this.get('dateFormat') || "%m/%d/%Y";
        _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1089);
return Y.DataType.Date.format(v,{format:dfmt});
    },

    // Function to call after Date editing is complete, prior to saving to DataTable ...
    //  i.e. converts back to "Date" format that DT expects ...
    saveFn: function(v){
        _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "saveFn", 1094);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1095);
return Y.DataType.Date.parse(v) || undefined;
    }
};


/**
### Inline Cell Editor "inlineAC"
This View configuration is used to setup an inline editor referenced as "inlineAC" composed of a simple inline-type
cell editor which has the AutoComplete plugin attached to the input node.

##### Basic Usage:
       // Column definition
       { key:'degreeProgram', editor:"inlineAC",
         editorConfig:{

            // The following object is passed to "autocomplete" plugin when this
            //   editor is instantiated
            autocompleteConfig: {
               source:  [ "Bachelor of Science", "Master of Science", "PhD" ]
               on: {
                   select: function(r){
                       var val = r.result.display;
                       this.editor.saveEditor(val);
                   }
               }
            }
          }
       }

##### Standard Configuration
This inline editor creates a simple INPUT[type=text] control and positions it to match the underlying TD node.
When the editor is first instantiated, the Y.Plugin.AutoComplete is connected to the INPUT using the `autocompleteConfig`
object passed in by the user.

This editor View instance is attached to the autocomplete plugin as static property "editor".  An "on:select" listener
is defined in the configs to take action on saving the selected item from the autocomplete.

The configuration {Object} for this cell editor View is predefined as;

        Y.DataTable.EditorOptions.inlineAC = {
             BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
             name:           'inlineAC',
             hideMouseLeave: false,

             // Define listener to this editor View's events
             after: {

                //---------
                //  After this View is instantiated and created,
                //     configure the Y.Plugin.AutoComplete as a plugin to the editor INPUT node
                //---------
                editorCreated : function(o){
                   var inputNode = o.inputNode,
                       // Get the users's editorConfig "autocompleteConfig" settings
                       acConfig = this.get('autocompleteConfig') || {},
                       editor = this;

                   if(inputNode && Y.Plugin.AutoComplete) {
                       // merge user settings with these required settings ...
                       acConfig = Y.merge(acConfig,{
                           alwaysShowList: true,
                           render: true
                       });
                       // plug in the autocomplete and we're done ...
                       inputNode.plug(Y.Plugin.AutoComplete, acConfig);

                       // add this View class as a static prop on the ac plugin
                       inputNode.ac.editor = editor;
                   }

                }
             }
         };

**PLEASE NOTE:** All other attributes from the `BaseViewClass` apply and can be included within the
`editorConfig` object.

@class Y.DataTable.EditorOptions.inlineAC
@since 3.8.0
@public
**/
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1176);
Y.DataTable.EditorOptions.inlineAC = {
    BaseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inlineAC',
    hideMouseLeave: false,

    /**
     * A user-supplied set of configuration parameters to be passed into this View's Y.Plugin.AutoComplete
     * configuration object.
     *
     * At a bare minimum, the user MUST provide the "source" of data for the AutoComplete !!
     *
     * For this control to save anything, the user needs to define an "on:select" listener in the AC's
     * "autocompleteConfig" in order to saveEditor when the select action occurs.
     *
     * @attribute autocompleteConfig
     * @type Object
     * @default {}
     */

    // Define listener to this editor View's events
    after: {

       //---------
       //  After this View is instantiated and created,
       //     configure the Y.Plugin.AutoComplete as a plugin to the editor INPUT node
       //---------
       editorCreated : function(o){
           _yuitest_coverfunc("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", "editorCreated", 1202);
_yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1203);
var inputNode = o.inputNode,
               // Get the users's editorConfig "autocompleteConfig" settings
               acConfig = this.get('autocompleteConfig') || {},
               editor = this;

           _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1208);
if(inputNode && Y.Plugin.AutoComplete) {
               // merge user settings with these required settings ...
               _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1210);
acConfig = Y.merge(acConfig,{
                   alwaysShowList: true,
                   render: true
               });
               // plug in the autocomplete and we're done ...
               _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1215);
inputNode.plug(Y.Plugin.AutoComplete, acConfig);

               // add this View class as a static prop on the ac plugin
               _yuitest_coverline("build/gallery-datatable-celleditor-inline/gallery-datatable-celleditor-inline.js", 1218);
inputNode.ac.editor = editor;
           }

       }
    }

};


}, '@VERSION@', {
    "supersedes": [
        ""
    ],
    "skinnable": "true",
    "requires": [
        "gallery-datatable-editable",
        "view",
        "base-build",
        "event-mouseenter"
    ],
    "optional": [
        ""
    ]
});
