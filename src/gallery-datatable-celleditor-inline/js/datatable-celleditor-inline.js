/**
 A View class that serves as the BASE View class for a TD Cell "inline" editor, i.e. an editor that
 is a single INPUT node that completely overlies the TD cell.  This editor is intended to replicate
 the familiar "spreadsheet" type of input.

 The editor provides the capability to navigate from TD cell via key listeners for ctrl-arrow key
 combinations.

 Ths Base editor is extensible by varying the configuration parameters (i.e. attribute and related
 configuration) to permit a variety of editing features.


 @module gallery-datatable-celleditor-inline
 @class Y.DataTable.BaseCellInlineEditor
 @extends Y.View
 @author Todd Smith
 @since 3.8.0
 **/
var KEYC_ESC = 27,
    KEYC_RTN = 13,
    KEYC_TAB = 9,
    KEYC_UP  = 38,
    KEYC_DOWN  = 40,
    KEYC_RIGHT  = 39,
    KEYC_LEFT  = 37;

Y.DataTable.BaseCellInlineEditor =  Y.Base.create('inlineeditor',Y.View,[],{

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
            'keydown': '_onKeyDown',
            'click' : '_onClick',
            'mouseleave' : '_onMouseLeave'
        }
    },

    //_dirty : false,

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
     *
     * @method initializer
     * @public
     * @return {*}
     */
    initializer: function(){
        var container = this.get('container'),
            html      = Y.Lang.sub(this.template, {cssInput:this._cssInput});

        container.setHTML(html);

        // Append the container element to the DOM if it's not on the page already.
        if (!container.inDoc()) {
          Y.one('body').append(container);
        }

        container.hide();

        this._inputNode = container.one('input');

        this.fire('editorCreated',{
            inputNode:  this._inputNode,
            container:  container,
            widget:     null
         //   editor:     this
        });

        return this;
    },

    /**
     * @method destructor
     * @public
     */
    destructor: function(){

        this.fire('editorDestroyed',{
            editor: this
        });

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
        var cont = this.get('container'),
            cell = this.get('cell'),
            val  = cell.value || this.get('value'),
            xy;

        //
        // Get the TD Node's XY position, and resize/position the container
        //   over the TD
        //
        td = cell.td || td;
        xy = td.getXY();

        cont.show();
        this._resizeCont(cont,td);
        cont.setXY(xy);

        // focus the inner INPUT ...
        this._inputNode.focus();

        // if there is a "prep" function ... call it to pre-process the editing
        var prepfn = this.get('prepFn');
        val = (prepfn && prepfn.call) ? prepfn.call(this,val) : val;

        // set the INPUT value
        this._inputNode.set('value',val);
        this.set('lastValue',val);

        this.fire('editorShow',{
            td:         td,
            cell:       cell,
            inputNode:  this._inputNode,
            value:      val
        });

        this._dirty = false;

    },

    /**
     * Event fired when the cell editor is displayed and becomes visible
     * @event editorShow
     * @param {Object} rtn Returned object
     * @param {Node} rtn.td TD Node instance of the calling editor
     * @param {Node} rtn.inputNode The editor's INPUT / TEXTAREA Node
     * @param {String|Number|Date} rtn.value The current "value" setting
     * @param {Object} rtn.cell object
     */


    /**
     * @method saveEditor
     * @param val {String|Number|Date} Raw value setting to be saved after editing
     * @public
     */
    saveEditor: function(val){
        //
        //  Only save the edited data if it is valid ...
        //

        // should call validatorFn here ....

        if( val !== undefined && val !== null ){

            // If a "save" function was defined, run thru it and update the "value" setting
            var savefn = this.get('saveFn') ;
            val = (savefn && savefn.call) ? savefn.call(this,val) : val;

            // set this editor's value ATTR
            this.set('value',val);

            this.fire("editorSave",{
                td:         this.get('cell').td,
                cell:       this.get('cell'),
                oldValue:   this.get('lastValue'),
                newValue:   val
            });
        }

        this.hideEditor();
    },

    /**
     *
     * @event editorSave
     * @param {Object} rtn Returned object
     *  @param {Node} rtn.td TD Node for the edited cell
     *  @param {Object} rtn.cell Current cell object
     *  @param {String|Number|Date} rtn.oldValue Data value of this cell prior to editing
     *  @param {String|Number|Date} rtn.newValue Data value of this cell after editing
     */

    /**
     * @method hideEditor
     * @public
     */
    hideEditor: function(){
        var cont  = this.get('container');
        if(cont) {
            cont.hide();
        }
    },

    /**
     * @method cancelEditor
     * @public
     */
    cancelEditor: function(){
        this.hideEditor();
        this.fire("editorCancel",{
            td:         this.get('cell').td,
            cell:       this.get('cell'),
            oldValue:   this.get('lastValue')
        });
    },

    /**
     *
     * @event editorCancel
     * @param {Object} rtn Returned object
     *  @param {Node} rtn.td TD Node for the edited cell
     *  @param {Object} rtn.cell Current cell object
     *  @param {String|Number|Date} rtn.oldValue Data value of this cell prior to editing
     */

//======================   PRIVATE METHODS   ===========================

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
        var w   = this._parseStyle(td,'width'),
            h   = this._parseStyle(td,'height'),
            pl  = this._parseStyle(td,'paddingLeft'),
            pt  = this._parseStyle(td,'paddingTop'),
            blw = this._parseStyle(td,'borderLeftWidth');

        //  resize the INPUT width and height based upon the TD's styles
        w += pl + blw - 1;
        h += pt;

        cont.setStyle('width',w+'px');
        cont.setStyle('height',h+'px');

    },

    /**
     * Helper method that returns the computed CSS style for the reference node
     * @method _parseStyle
     * @param el {Node} Node instance to check style on
     * @param v {String} Style name to return
     * @return {Number|String} Computed style with 'px' removed
     * @private
     */
    _parseStyle: function(el,v) {
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
        o.stopPropagation();
    },

    /**
     * @method _onMouseLeave
     * @private
     */
    _onMouseLeave : function() {
        if(this.get('hideMouseLeave')){
            this.hideEditor();
        }
    },

    /**
     * Key listener for the INPUT inline editor
     * @method _onKeyDown
     * @param {EventFacade} e
     * @private
     */
    _onKeyDown : function(e){
        var keyc = e.keyCode,
            inp  = this._inputNode,
            cell = this.get('cell');

        var dir = null;
        switch(keyc) {

            case KEYC_RTN:
                e.preventDefault();
                var val  = inp.get('value');
                this.saveEditor(val);
                break;

            case KEYC_ESC:
                this.hideEditor();
                break;

            case KEYC_UP:
                dir = (e.ctrlKey) ? [-1,0] : null;
                break;

            case KEYC_DOWN:
                dir = (e.ctrlKey) ? [1,0] : null;
                break;

            case KEYC_LEFT:
                dir = (e.ctrlKey) ? [0,-1] : null;
                break;

            case KEYC_RIGHT:
                dir = (e.ctrlKey) ? [0,1] : null;
                break;

            case KEYC_TAB: // tab
                dir = (e.shiftKey) ? [0,-1] : [0,1] ;
                break;

            default:
                this._dirty = true;

        }

        if(dir) {
            e.preventDefault();
            this._set('keyDir',dir);
        }

    }


},{
    ATTRS:{

        /**
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
            value:  {}
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
         * Value that was contained in the cell when the Editor View was initiated
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
            validator:  function(v) { return v instanceof Y.DataTable; }
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
         *
         * This function will receive one argument "value" which is the data value from the INPUT or Widget, and
         *  the function runs in Editor scope.
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
         * A readonly attribute set by this View in response to "Ctrl" arrow key entry
         * while the INPUT has focus, to allow
         *
         * This attribute
         * @attribute keyDir
         * @type Array
         * @default []
         */
        keyDir: {
            value:      [],
            readOnly:   true,
            validator:  Y.Lang.isArray
        }

    }
});

Y.DataTable.EditorOptions.inline = {
    baseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inline'
};

Y.DataTable.EditorOptions.inlineDate = {
    baseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inlineDate',
    prepFn: function(v){
        var dfmt =  "%m/%d/%Y"; // (this.get('dateFormat')) ? this.get('dateFormat') : "%m/%d/%Y";
        return Y.DataType.Date.format(v,{format:dfmt});
    },

    // Function to call after Date editing is complete, prior to saving to DataTable ...
    //  i.e. converts back to "Date" format that DT expects ...
    saveFn: function(v){
        return Y.DataType.Date.parse(v);
    }

    /*
        after: {
            editorCreated : function(o){
                Y.log('editor created ... ' + this.get('name') );
            }
        }
    */
};

Y.DataTable.EditorOptions.inlineNumber = {
    baseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inlineNumber',

    prepFn: function(v){
   //     var dfmt = (this.get('dateFormat')) ? this.get('dateFormat') : "%m/%d/%Y";
   //     return Y.DataType.Date.format(v,{format:dfmt});
        return v;
    },

    // Function to call after Date editing is complete, prior to saving to DataTable ...
    //  i.e. converts back to "Date" format that DT expects ...
    saveFn: function(v){
        return +v;
    }

};


Y.DataTable.EditorOptions.inlineAC = {
    baseViewClass:  Y.DataTable.BaseCellInlineEditor,
    name:           'inlineAC'
};

