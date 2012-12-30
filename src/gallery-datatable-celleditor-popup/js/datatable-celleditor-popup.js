/**
 A View class that serves as a BASE class for a TD Cell "pop-up" editor, i.e. an editor with
 HTML inserted into an overlay directly over the TD cell ... SELECT box, TEXTAREA, etc..

 Ths Base editor is extensible by varying the configuration parameters (i.e. attribute and related
 configuration) to permit a variety of editing features.

 For example, by altering the ATTRS "template", "overlayContent", "inputCollection", "widget", etc...
 to provide a great variability in editor UI and functionality.

 For example; this Base editor class is used to create the following pre-built editors;
     * textbox
     * textarea
     * checkbox
     * radio group
     * dropdown, select, combobox
     * autocomplete
     * date (including Calendar widget)

 The pre-built configuration options are stored in an Object variable Y.DataTable.EditorOptions within
 the DataTable namespace.  The gallery-datatable-editable module uses the Y.DataTable.EditorOptions to
 create required editor View instances.

 @module gallery-datatable-celleditor-popup
 @class Y.DataTable.BaseCellPopupEditor
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

Y.DataTable.BaseCellPopupEditor =  Y.Base.create('popupeditor',Y.View,[],{

    /**
     * Defines the HTML content "template" for the containing Overlay of this editor,
     * this property is also set by default to the attribute
     * @property template
     * @type String
     * @default See Code
     * @static
     */
    template:       '<div class="yui3-widget yui3-overlay {classOverlay}" tabindex="1">{content}</div>',

    /**
     * Defines the HTML content "template" for BUTTON elements that are added to the Overlay
     * via the overlayButtons attribute.
     * @property btnTemplate
     * @type String
     * @default See Code
     * @static
     */
    btnTemplate:    '<button class="yui3-button {classButton}" data-button={name}>{value}</button>',

    /**
     * Placeholder property for the Overlay that is created by this View
     * @property overlay
     * @type Widget
     * @default null
     * @static
     */
    overlay:        null,

//--------------------  Static CSS class names  ---------------------------


    /**
     * CSS classname to identify the input HTML node within the View container
     * @property _classInput
     * @type String
     * @default 'yui3-datatable-editor-input'
     * @protected
     * @static
     */
    _classInput:    'yui3-datatable-editor-input',

    /**
     * CSS classname to identify the individual input collection HTML nodes within
     * the View container
     * @property _classItem
     * @type String
     * @default 'yui3-datatable-editor-input-item'
     * @protected
     * @static
     */
    _classItem:     'yui3-datatable-editor-input-item',

    /**
     * CSS classname for the Overlay content within the View container
     * @property _classOverlay
     * @type String
     * @default 'yui3-datatable-editor-overlay'
     * @protected
     * @static
     */
    _classOverlay:  'yui3-datatable-editor-overlay',

    /**
     * CSS classname used for Overlay BUTTON elements within the View container
     * @property _classOverlayBtn
     * @type String
     * @default 'yui3-datatable-editor-overlay-button'
     * @protected
     * @static
     */
    _classOverlayBtn:  'yui3-datatable-editor-overlay-button',

    /**
     * CSS classname to identify the individual input collection HTML nodes within
     * the View container
     * @property _classEditing
     * @type String
     * @default 'editing'
     * @protected
     * @static
     */
    _classEditing:  'editing',

    /**
     * Placeholder for the created Input element contained within the Overlay and
     * View container
     * @property _inputNode
     * @type Node
     * @default null
     * @protected
     * @static
     */
    _inputNode:     null,

    /**
     * Placeholder for listener handles created from this View
     * @property _subscr
     * @type Array of {EventHandles}
     * @default []
     * @protected
     * @static
     */
    _subscr:        [],

//======================   LIFECYCLE METHODS   ===========================

    /**
     * @method initializer
     * @chainable
     * @return {*}
     * @protected
     */
    initializer: function(){

        this.overlay = this._createUI();
        var cont = this.overlay;

        this.set('container',cont);
        this._bindUI();

        return this;
    },


    /**
     * @method _bindUI
     * @private
     */
    _bindUI:  function(){

        // Set a key listener on inputnode
        if(this.get('inputKeys') && this._inputNode ) {
            this._subscr.push( this._inputNode.on('keydown',this._onKeyEvent,this)  );
        }

        // Listeners on the Overlay ...
    //    if(this.overlay ) {
    //        this._subscr.push( this.overlay.get('contentBox').delegate('key',this.hideEditor,"down:"+KEYC_ESC,"textarea",this)  );
           // this._subscr.push( this.overlay.get('contentBox').on('mouseleave',this._mouseLeave,this)  );
    //    }

    },

    /**
     * @method destructor
     * @protected
     */
    destructor: function(){

        this.cancelEditor();

        Y.Array.each(this._subscr,function(e){
            e.detach();
        });
        this._subscr = null;

        this.fire('editorDestroyed',{
            editor:  this
        });

        if(this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
    },

    /**
     * Event fired when the cell editor View is destroyed
     * @event editorDestroyed
     * @param {View} editor
     */

//======================   PUBLIC METHODS   ===========================

    /**
     * @method showEditor
     * @param {Node} tar Target TD cell that editing takes place on
     * @public
     */
    showEditor: function(td){

        td = td || this.get('cell').td;

        var cell   = this.get('cell'),
            td_xy  = td.getXY(),
            off_xy = this.get('offsetXY'),
            td_w   = +(td.getComputedStyle('width').replace(/px/,'')),
            widg   = this.get('widget'),
            wopts  = this.get('widgetOptions'),
            oVal = cell.value || this.get('value');  //(rec && coln) ? rec.get(coln) : null;

    // Decorate the TD target and show the Overlay
        td.addClass(this._classEditing);
        this.overlay.show();

        // clear up browser "selected" stuff
        this._clearDOMSelection();

    // If a Widget is associated with this View,
    //  display it and set the initially state ...
        if(widg && wopts){
            widg.show();
            if(wopts.valueAttr) {
                widg.set(wopts.valueAttr, oVal);
            }
        }

    //
    //  Position and resize the Overlay and input ...
    //
        if(off_xy) {
            td_xy[0] += off_xy[0];
            td_xy[1] += off_xy[1];
        }

        this.overlay.set('xy',td_xy);

        td_w = this.get('inputWidth') || td_w;
        if(this._inputNode) {
            this._inputNode.setStyle('width', td_w );
        }

    // Set the initial display "value" in INPUT ... (mostly for text)
        this._setInputValue(oVal);

        this.fire('editorShow',{
            td:         td,
            cell:       cell,
            inputNode:  this._inputNode,
            value:      oVal
        });

    },

    /**
     * Event fired when the cell editor is displayed and becomes visible
     * @event editorShow
     * @param {Object} rtn Returned object
     * @param {Node} rtn.inputNode The editor's INPUT / TEXTAREA Node
     * @param {String|Number|Date} rtn.value The current "value" setting
     * @param {Object} rtn.cell object
     *  @param {Node} rtn.cell.td TD Node undergoing editing
     *  @param {String} rtn.cell.recClientId The active record's "clientId" attribute setting
     *  @param {String} rtn.cell.colKey The active column's key or name setting
     */


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
     * @event editorCancel
     * @param {Object} rtn Returned object
     * @param {Object} rtn.cell Current record (Model) that was being edited
     * @param {String} rtn.column Current column key/name that was being edited
     */

    /**
     * @method saveEditor
     * @param val
     * @public
     */
    saveEditor: function(val){
        var cell = this.get('cell'),
            savefn;

        val = (val !== undefined && val !== null) ? val : this.get('value') ||  this._inputNode.get('value');

        //
        // If a valid record exists and we found the updated "value" from this View,
        //   then apply the changed "value" to the record (Model) attribute ...
        //
        if( val !== undefined && val !== null ) {

            // If a "save" function was defined, run thru it and update the "value" setting
            savefn = this.get('saveFn');
            val = (savefn) ? savefn.call(this,val) : val;

            // set the 'lastValue' attribute prior to updating value in View
            if(val) {
                this.set('lastValue',this.get('value'));
            }

            // set this editor's value ATTR
            this.set('value',val);

            this.fire("editorSave",{
                td:         cell.td,
                cell:       cell,
                oldValue:   this.get('lastValue'),
                newValue:   val
            });
        }

        this.hideEditor();
    },

    /**
     * @event editorSave
     * @param {Object} rtn Returned object
     * @param {Model} rtn.record Current record (Model) that was being edited
     * @param {String} rtn.columnKey Current column key/name that was being edited
     * @param {String} rtn.cell
     * @param {String} rtn.oldValue
     * @param {String} rtn.newValue
     */

    /**
     * @method hideEditor
     * @public
     */
    hideEditor: function(){
        var cell;

        if(this.overlay) {
            this.overlay.hide();
        }

        cell = this.get('cell');
        if(cell && cell.td) {
            cell.td.removeClass(this._classEditing);
        }

        if(this.get('widget')) {
            this.get('widget').hide();
        }
    },

//======================   PRIVATE METHODS   ===========================

    /**
     * BIG KAHUNA .....
     *
     * @method _createUI
     * @return {Y.Overlay}
     * @private
     */
    _createUI: function(){
       var ocfg  = this.get('overlayConfig'),
           icoll = this.get('inputCollection'),
           overlay;

        overlay = this._createOverlay();

        //
        //  Check if "items" are defined ... if so they replace bodyContent
        //
        if( icoll && icoll.wrapperContent ) {
            this._createInputCollection(overlay);
        }

        //
        //  Add buttons in the Overlay footer section
        //  (we aren't using overlay, so have to add these manually ...)
        //
        if( ocfg && ocfg.buttons ) {
            this._createOverlayButtons(overlay);
        }

        //
        //  Add on the Widget, instantiate and set it up if defined
        //
        if( this.get('widget') ) {
            this._createWidget(overlay);
        }

        // render it, save it and leave ...
        this.overlay = overlay;
        overlay.render();

        this.fire('editorCreated',{
            inputNode:  this._inputNode,
            widget:     this.get('widget'),
            container:  overlay
        });

        this.set('container',overlay);
        return overlay;
    },

    /**
     * Event that executes after the cell editor View is instantiated and ready for display
     * @event editorCreated
     * @param inputNode {Node}
     * @param container {Node}
     * @param widget {Widget}
     */

    /**
     * Method that creates the Editor's Overlay instance and populates the base content.
     * @method _createOverlay
     * @return {Y.Overlay}
     * @private
     */
    _createOverlay: function(){
        var ocfg  = this.get('overlayConfig'),
            html,cont,overlay;
    //
    //  Create the Overlay
    //
        html = Y.Lang.sub(this.get('template'),{
            classOverlay:   this._classOverlay+' ',
            content:        '', // this.get('overlayContent') || '',
            classInput:     ''  //this._classInput
        });

        // Merge the user-supplied Config object with some defaults
        if(this.get('overlayWidth')) {
            ocfg.width = this.get('overlayWidth');
        }

        ocfg = Y.merge(ocfg,{
            contentBox: Y.Node.create(html),
            zIndex:     99,
            visible:    false,
            render:     true
        });

        // Create the Overlay, plugin the drag-drop
        overlay = new Y.Overlay(ocfg);
        overlay.plug(Y.Plugin.Drag);
        overlay.hide();

    //
    //  Add the content as the body of the Overlay
    //
        if(this.get('overlayContent')) {
            cont = Y.Lang.sub(this.get('overlayContent'),{
                classInput: this._classInput
            });
            overlay.set('bodyContent',cont);
        }

        // Set the inputNode property ... point to INPUT or TEXTAREA, SELECT, etc..
        this._inputNode = overlay.get('contentBox').one('.'+this._classInput);

        return overlay;
    },

    /**
     * Method that processes the "inputCollection" settings, where the user desires a collection
     * of INPUT elements (i.e. radio elements, select options, etc..).
     *
     * This method also sets up any custom listeners set on these INPUT elements.
     *
     * @method _createInputCollection
     * @param panel
     * @private
     */
    _createInputCollection: function(overlay){
        var icoll    = this.get('inputCollection'),
            itemhtml = '',
            itemTag  = icoll.tagType || '',
            itemc    = icoll.itemContent || '',
            icont, optsData;

        // check if a collection settings Array / Hash exists ...
        //  i.e. checkboxOptions, radioOptions, dropdownOptions, etc....
        optsData = this.get(itemTag.toLowerCase() + 'Options');

        // loop over optsData substituting into itemContent template ...
        if(optsData && Y.Lang.isArray(optsData)) {

            Y.Array.each(optsData,function(opt){
                itemhtml += Y.Lang.sub(itemc, Y.merge({
                    classIitem: this._classItem
                },opt));
            },this);

        } else if (optsData && Y.Lang.isObject(optsData)) {

            Y.Object.each(optsData,function(val,key){
                itemhtml += Y.Lang.sub(itemc, {
                    classIitem: this._classItem,
                    //TODO: these are hard coded for now, should provide a translator hash attr
                    value:  key,
                    text:   val
                });
            },this);

        }

        // now replace in Wrapper ...
        icont = Y.Lang.sub( icoll.wrapperContent,{
            classInput: this._classInput,
            items: itemhtml
        }) || '';

        this.fire('inputCollectionCreated',{
            overlay:        overlay,
            inputoptions:   optsData
        });

        overlay.set('bodyContent', icont );
        overlay.render();

    //
    //  Setup any listeners (on INPUT collection), if defined ...
    //
        if( icoll.after ){
            this._bindCustomListeners( overlay, icoll.after );
        }

        if( icoll.on ) {
            this._bindCustomListeners( overlay, icoll.on );
        }


    },


    /**
     * Creates listeners on "inputCollection" INPUT elements that are created within
     * the Overlay container.
     *
     * The listeners are setup as either "on" or "after" listeners, and include a
     * "selector" setting within the contentBox of the Overlay.
     *
     * @method _bindCustomListeners
     * @param panel
     * @param listener_array
     * @private
     */
    _bindCustomListeners: function( panel, listener_array ){
        var panelCBox = panel.get('contentBox');

        // Listeners should be in {action, selector, action:function()} format
        Y.Object.each( listener_array, function(evtSettings,evtType){
            if(evtType && evtSettings) {

                var pnode = panelCBox.one(evtSettings.selector);

                // if the Node selectors works, and an action "function" is set,
                //   create a listener for it ...

                if (pnode && evtSettings.action && Y.Lang.isFunction(evtSettings.action) ) {
                    this._subscr.push(
                        panelCBox.delegate(evtType, evtSettings.action, evtSettings.selector, this)
                    );
                }
            }
        },this);

    },

    /**
     * Method creates a footer section within the Overlay and adds the buttons entered
     * as the "buttons" config property of "overlayConfig".
     *
     * @method _createOverlayButtons
     * @param {Widget} overlay
     * @private
     */
    _createOverlayButtons: function(overlay){
        var ov_cfg  = this.get('overlayConfig'),
            ov_btns = ov_cfg.buttons, // value, action
            ov_cbox = overlay.get('contentBox'),
            ov_ftr  = ov_cbox.appendChild(Y.Node.create('<div class="yui3-widget-ft"></div>')),
            btn_html, btn_node;

        // Loop over all Buttons in the configs, creating them one at a time
        //  button config is expected to have {name,value,action} members
        Y.Array.each(ov_btns, function(btn){

            // build the button HTML ...
            btn_html = Y.Lang.sub(this.btnTemplate,{
                classButton: this._classOverlayBtn + ( (btn.name) ? '-' + btn.name : ''),
                name:        btn.name || 'btn',
                value:       btn.value || 'unknown label'
            });

            // create the BUTTON, appending to footer section of the Overlay ...
            btn_node = ov_ftr.appendChild( Y.Node.create(btn_html) );

            // and add it's click handler ...
            if(btn_node && btn.action && Y.Lang.isFunction(btn.action) ) {
                this._subscr.push( btn_node.on('click', Y.bind( btn.action,this) )  );
            }

        },this);

    },

    /**
     *
     * widgetOptions ...
     *    containerSetter:{
     *        attr: 'srcNode',
     *        fn: function(ov_cbox){   return Node; }
     *    }
     * @method _createWidget
     * @param overlay
     * @private
     */
    _createWidget: function(overlay){
        var ov_cbox = overlay.get('contentBox'),
            Widg    = this.get('widget'),
            wopts   = this.get('widgetOptions'),
            wsrcn   = (wopts.srcNode) ? ov_cbox.one(wopts.srcNode) : null,
            wcfg    = wopts.config,
            wnode,widgetInstance;

        //
        //  In case this widget is not configured with "srcNode" string,
        //   then read from "containerSetter" object the ATTR to set and the function that sets it ...
        //
        if(wopts.containerSetter){
            if(wopts.containerSetter.attr && wopts.containerSetter.fn && Y.Lang.isFunction(wopts.containerSetter.fn) ) {
                wnode = wopts.containerSetter.fn.call(this,ov_cbox);
            }
        }


        if(wsrcn || wnode){

            if(wsrcn) {
                wcfg.srcNode = wsrcn;
            } else if (wnode) {
                wcfg[ wopts.containerSetter.attr ] = wnode;
            }

            // instantiate the widget ...
            widgetInstance = new Widg(wcfg);

            if(widgetInstance){

                widgetInstance.render();

                //
                //  Add a new ATTR to the widget, "editor" to link back to THIS editor
                //  (no name check for conflicts ...)
                //
                widgetInstance.addAttr('editor',{});
                widgetInstance.set('editor',this);

                this.set('widget',widgetInstance);

                this.fire('widgetCreated',{
                    widget: widgetInstance,
                    config: wopts
                });
            }
        }

    },


    /**
     * @event widgetCreated
     * @param widget
     * @param config
     */


    _mouseLeave: function(){
        this.cancelEditor();
    },

    _onKeyTextarea: function(e){
        if(e.keyCode === KEYC_ESC) {
            e.preventDefault();
            this.hideEditor();
        }
    },

    /**
     * @method _onKeyEvent
     * @param {EventTarget} e
     * @private
     */
    _onKeyEvent: function(e){
        var dirxy = null, val,
            chr, RE, newVal;

        switch(e.keyCode) {

            case KEYC_RTN:    // Return
                e.preventDefault();
                val = (this._inputNode) ? this._inputNode.get('value') : null;
                this.saveEditor(val);
                break;

            case KEYC_ESC:    // ESC
                e.preventDefault();
                this.cancelEditor();
                break;

            case KEYC_UP:    // UP arrow
            case KEYC_DOWN:    // DOWN arrow
                if(e.ctrlKey) {
                    e.preventDefault();
                    dirxy = (e.keyCode===KEYC_UP) ? [-1,0] : [1,0];
                }
                break;

            case KEYC_RIGHT:  // RIGHT arrow
            case KEYC_LEFT:  // LEFT arrow
                if(e.ctrlKey) {
                    e.preventDefault();
                    dirxy = (e.keyCode===KEYC_LEFT) ? [0,-1] : [0,1];
                }
                break;

            case KEYC_TAB:     // TAB
                if(e.ctrlKey || e.shiftKey) {
                    e.preventDefault();
                    dirxy = (e.shiftKey) ? [0,-1] : [0,1];
                } else {
                    this.cancelEditor();
                }
                break;

        }

        //
        //  If the above resulted in a direction being set,
        //   don't allow the edit ...
        //
        if( dirxy ) {
            e.preventDefault();
            this.cancelEditor();

            this._set('keyDir',dirxy);

        } else {

            // it may be a valid character, this is a lousy attempt at
            //  doing a type-ahead RegExp check for valid characters ...

            // http://jsfiddle.net/apipkin/9Ma5f/

            if(this._imRegex) {
                chr = String.fromCharCode(e.charCode),
                RE = this._imRegex,
                newVal = cont.get('value') + chr;

                //  var RE = new RegExp(this._imRegex);
                if(chr && RE && !RE.test(newVal) ) {
                    e.preventDefault();
                }
            }

        }

    },


    /**
     * @method _setInputValue
     * @param {Number|String|Date} val
     * @return {*}
     * @private
     */
    _setInputValue: function(val) {
        var prepFn;
        val = val || this.get('cell').value || this.get('value');  //(rec && col) ? rec.get(col) : null;

        if(!val) {
            return;
        }

        prepFn = this.get('prepFn');
        val = (prepFn) ? prepFn.call(this,val) : val;

        if(this._inputNode){
            this._inputNode.set('value',val);
        }

        return val;
    },

    /**
     * Helper method to clear DOM "selected" text or ranges
     * @method _clearDOMSelection
     * @private
     */
    _clearDOMSelection: function(){
        var sel = (Y.config.win.getSelection) ? Y.config.win.getSelection()
            : (Y.config.doc.selection) ? Y.config.doc.selection : null;

        if ( sel && sel.empty ) {
            sel.empty();
        }    // works on chrome

        if ( sel && sel.removeAllRanges ) {
            sel.removeAllRanges();
        }    // works on FireFox
    }

},{
    ATTRS:{

        /**
         * Defines the Overlay's HTML template for the overall View
         *
         * @attribute template
         * @type String
         * @default
         */
        template:{
            valueFn:  function(){ return this.template; },
            validator:  Y.Lang.isString
        },

        /**
         * Defines the "bodyContent" of the Overlay, the primary display space of the Editor
         *
         * @attribute overlayContent
         * @type String
         * @default null
         */
        overlayContent:{
            value:      null,
            validator:  Y.Lang.isString
        },

        /**
         * Additional config parameters for the Overlay to be used in constructing the Editor.
         * These configs are merged with the defaults required by the Editor.
         *
         * @attribute overlayConfig
         * @type Object
         * @default {}
         */
        overlayConfig:{
            value:      {},
            validator:  Y.Lang.isObject
        },


        /**
         * @attribute name
         * @type String
         * @default null
         */
        name: {
            value:      null,
            validator:  Y.Lang.isString
        },

        /**
         * @attribute inputWidth
         * @type String|Number
         * @default null
         */
        inputWidth: {
            value:  null
        },

        /**
         * @attribute inputWidth
         * @type String|Number
         * @default null
         */
        overlayWidth:{
            value:  null
        },

        /**
         * @attribute inputCollection
         * @type Object
         * @default null
         */
        inputCollection:{
            value: null
        },

        /**
         * A flag to indicate if cell-to-cell navigation should be implemented
         * @attribute inputKeys
         * @type Boolean
         * @default false
         */
        inputKeys:{
            value:      false,
            validator:  Y.Lang.isBoolean
        },

        /**
         * @attribute dateFormat
         * @type string
         * @default null
         */
        dateFormat: {
            value:      null,
            validator:  Y.Lang.isString
        },

        /**
         * @attribute numberFormat
         * @type string
         * @default null
         */
        numberFormat: {
            value:      null,
            validator:  Y.Lang.isString
        },

        /**
         * @attribute currencyFormat
         * @type string
         * @default null
         */
        currencyFormat: {
            value:      null,
            validator:  Y.Lang.isString
        },

        /**
         * @attribute widget
         * @type Widget
         * @default null
         */
        widget: {
            value:  null
        },

        /**
         * @attribute widgetOptions
         * @type Object
         * @default null
         */
        widgetOptions:{
            value:  null
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
        prepFn:{
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
         * @attribute keyDir
         * @type Array
         * @readOnly
         * @default []
         */
        keyDir: {
            value:      [],
            readOnly:   true,
            validator:  Y.Lang.isArray
        },

        /**
         * @attribute offsetXY
         * @type Array
         * @default [0,0]
         */
        offsetXY :{
            value: [0,0],
            validator:  Y.Lang.isArray
        }

    }
});


Y.DataTable.EditorOptions.text = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'text',
    overlayContent: '<input type="text" title="inline cell editor" class="{classInput}"  />',
    inputKeys:      true,
    after:{
        editorShow : function(o){
            o.inputNode.focus();
           // o.inputNode.select();
        }
    }

};

Y.DataTable.EditorOptions.number = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'number',
    overlayContent: '<input type="text" title="inline cell editor" class="{classInput}"  />',
    inputKeys:      true,
    // convert "text" to number
    saveFn:         function(v){
        return +v;
    },

    after:{
        editorShow : function(o){
            // initially set focus / select entire INPUT
            o.inputNode.focus();
            o.inputNode.select();
        }
    }
};

Y.DataTable.EditorOptions.textarea = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'textarea',
    overlayContent:  '<textarea title="inline cell editor" class="{classInput}"></textarea>',

    // setup two buttons "Save" and "Cancel" for the containing overlay
    overlayConfig:{
        buttons:   [
            { name:'save', value: 'Save',
                action:function(){
                    var val = (this._inputNode) ? this._inputNode.get('value') : null;
                    this.saveEditor(val);
                }
            },
            { name:'cancel', value: 'Cancel',
                action:function(){ this.cancelEditor(); }
            }
        ]
    },

    after:{
        editorShow : function(o){
            o.inputNode.focus();
           // o.inputNode.select();
        }
    }

};


Y.DataTable.EditorOptions.date = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'date',
    overlayContent: '<input type="text" title="inline cell editor" class="{classInput}" />',
    inputKeys:  true,

    inputWidth: 75,

    // Function to call prior to displaying editor, to put a human-readable Date into
    //  the INPUT box initially ...
    prepFn: function(v){
        var dfmt = this.get('dateFormat') || "%D" || "%m/%d/%Y";
        return Y.DataType.Date.format(v,{format:dfmt});
    },

    // Function to call after Date editing is complete, prior to saving to DataTable ...
    //  i.e. converts back to "Date" format that DT expects ...
    saveFn: function(v){
        return Y.DataType.Date.parse(v);
    }
};


Y.DataTable.EditorOptions.calendar = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'calendar',
    overlayContent: 'Enter Date: &nbsp; <input type="text" title="inline cell editor" class="{classInput}"  />'
                     + '<br/><div class="yui3-dt-editor-calendar"></div>',
    inputKeys:  true,

    // setup two buttons "Save" and "Cancel" for the containing overlay
    overlayConfig:{
        buttons:   [
            { name:'save', value: 'Save',
                action:function(){
                    var val = (this._inputNode) ? this._inputNode.get('value') : null;
                    this.saveEditor(val);
                }
            },
            { name:'cancel', value: 'Cancel',
                action:function(){ this.cancelEditor(); }
            }
        ]
    },

    inputWidth: 75,

    // Function to call prior to displaying editor, to put a human-readable Date into
    //  the INPUT box initially ...
    prepFn: function(v){
        var dfmt = this.get('dateFormat') || "%D" || "%m/%d/%Y";
        return Y.DataType.Date.format(v,{format:dfmt});
    },

    // Function to call after Date editing is complete, prior to saving to DataTable ...
    //  i.e. converts back to "Date" format that DT expects ...
    saveFn: function(v){
        return Y.DataType.Date.parse(v);
    },

    //
    // Setup a Widget for this view
    //   a) ATTR "widget" : sets the widget class to use
    //   b) ATTR "widgetOptions" contains setup options the Editor uses as configuration
    //        for the widget instance it creates.
    //
    //        srcNode:  the default srcNode relative to Editor contentbox to use
    //        valueAttr:  the value ATTR of the widget for value setting / getting
    //        config:  configuration object to pass to Widget during instantiation
    //        on / after : listeners to attach to widget, where "this" is the widget context
    //                     AND an attribute "editor" is added to the widget
    //
    widget:         Y.Calendar,
    widgetOptions:  {
        srcNode:    '.yui3-dt-editor-calendar',     // selector for rendering Calendar into
        valueAttr:   "date",

        config:{
            // don't define a srcNode in here, because we are creating the node ...
            height: '215px',
            width:  '200px',
            showPrevMonth: true,
            showNextMonth: true,

            // Widget event listeners ...
            after:{
                // updates the Editor's INPUT box on a widget date selection ...
                selectionChange : function(o){
                    var newDate = o.newSelection[0],
                        editor  = this.get('editor'),
                        prepFn  = editor.get('prepFn'),
                        inpn = editor._inputNode;

                    inpn.set('value', (prepFn) ? prepFn.call(this,newDate) : newDate );
                },

                // just called once, at instantiation, to setup the plugin
                render: function(){
                    if(Y.Plugin.Calendar && Y.Plugin.Calendar.JumpNav) {
                        this.plug( Y.Plugin.Calendar.JumpNav, {
                            yearStart: 1988, yearEnd:   2021
                        });
                    }
                }
            }
        }
    },

    // editor event listeners ...
    after:{
        // Setup the widget to display the record's Date value on initial display
        editorShow: function(o){
            var val = o.value;  //this.get('value');
            this.get('widget').selectDates(val);
            this._setInputValue(val);
        }
    }
};

Y.DataTable.EditorOptions.autocomplete = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'autocomplete',
    overlayContent: '<input type="text" title="inline cell editor" class="{classInput}" />',
    inputKeys:      true
};


Y.DataTable.EditorOptions.radio = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'radio',
    overlayContent: ' ',
    overlayWidth:   250,  // initial width for whole overlay (may vary by no. of items!!)

    // Define a collection of HTML elements ...
    inputCollection: {
        tagType:        'radio',
        wrapperContent: '<div class="myradios">{items}</div>',
        itemContent:    '<input type="radio" name="dt-editor-radio" value="{value}"> {text}',

        // custom listeners on this collection
        after: {
            click: {
                selector: '.myradios input[type="radio"]',
                action:  function(e){
                    var chk = e.currentTarget,
                        cvalue = chk.get('value') || false;

                    if(cvalue!==null && cvalue!==undefined) {
                        this.saveEditor(cvalue);
                    }
                }

            }
        }
    },

    // Editor level Listeners ...
    on: {
        // update the "checks" when editor is shown ...
        editorShow : function(o){
            var chks  = this.overlay.get('contentBox').one('.myradios').all('input[type="radio"]'),
                val   = o.value,  //this.get('value');
                chk;

            chks.each(function(n){
                if(n && n.get('value')==val){   // not a === check, to account for mixed vars
                    chk = n;
                    return true;
                }
                n.set('checked',false);
            });

            if(chk) {
                chk.set('checked',true);
            }
        }
    }

};



Y.DataTable.EditorOptions.dropdown = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'dropdown',
    overlayContent: ' ',

    // Define an "input collection" i.e. the view content includes
    //    (a) an outer wrapper of HTML for the collection,
    //    (b) inner item HTML for each member of the collection
    inputCollection: {
        tagType:        'select',
        wrapperContent: '<select class="myselect">{items}</select>',
        itemContent:    '<option value="{value}">{text}</option>',

        // Listeners applied to the INPUT collection ...
        after:{

            // dropdown "change" event fired ...
            change:{
                selector: '.myselect',
                action:  function(e){
                    var select = e.currentTarget,
                        svalue = select.get('value');

                    if( svalue!==null && svalue!== undefined ) {
                        this.saveEditor(svalue);
                    }
                }
            }
        }

    }, // end inputColl

    // Listeners applied to the overall Editor instance ...
    on: {

        // Update the "selected" dropdown item based on the cell value prior to display ...
        editorShow : function(o){
            var sel   = this.overlay.get('contentBox').one('.myselect'),
                sopts = sel.get('options'),
                val   = this.get('value') || o.value,
                sopt;

            sopts.some(function(n){
                if(n && n.get('value') == val) {  // not a === check, to account for mixed vars
                    sopt = n;
                    return true;
                }
            });

            if(sopt) {
                sopt.set('selected',true);
            }

        }
    }

};

Y.DataTable.EditorOptions.select = Y.DataTable.EditorOptions.dropdown;
Y.DataTable.EditorOptions.combobox = Y.DataTable.EditorOptions.dropdown;

Y.DataTable.EditorOptions.checkbox = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:           'checkbox',
    overlayContent: ' ',
    overlayWidth:   200,

    // Define a collection of HTML elements ...
    inputCollection: {
        tagType:        'checkbox',
        wrapperContent: '<input type="checkbox" title="inline cell editor" class="mycheckbox" />',
        itemContent:    '',

        // INPUT collection listeners ...
        after:{
            click: {
                selector: '.mycheckbox',
                action:  function(e){
                    var chk    = e.currentTarget,
                        cvalue = chk.get('checked') || false,
                        chkopt = (this.get('checkboxHash')) ? this.get('checkboxHash') : { 'true':true, 'false':false },
                        val    = chkopt[cvalue];

                    if(val!==null && val!== undefined) {
                        this.saveEditor(val);
                    }
                }

            }

        }
    },

    // Editor level Listeners ...
    on:{
        // update the "checks" when editor is shown ...
        editorShow : function(o){
            var chk    = this.overlay.get('contentBox').one('input[type="checkbox"]'),
                val    = o.value, //this.get('value'),
                chkopt = (this.get('checkboxHash')) ? this.get('checkboxHash') : { 'true':true, 'false':false },
                chkst  = false;

            if(chk && val !== undefined ) {
                chkst = (val === chkopt['true'] ) ? true : false;
                chkst = (val === chkopt['false'] ) ? false : chkst;
                chk.set('checked',chkst);
            }
        }
    }

};


//TODO:  THIS IS INCOMPLETE !!!
Y.DataTable.EditorOptions.checkboxgroup = {
    baseViewClass:  Y.DataTable.BaseCellPopupEditor,
    name:               'checkboxgroup',
    overlayContent:     ' ',
    overlayWidth:       150,
    checkboxOptions:    [{value:0,text:'No'},{value:1,text:'Yes'}],

    // Define a collection of HTML elements ...
    inputCollection: {
        tagType:        'checkbox',
        wrapperContent: '<div class="mycheckbox">{items}</div>',
        itemContent:    '<input type="checkbox" value="{value}"> {text}',

        // custom listeners on this collection ...
        after:{
            click: {
                selector: '.mycheckbox input[type="checkbox"]',
                action:  function(e){
                    var chk = e.currentTarget,
                        cvalue = chk.get('value') || false;

                    this.set('value',cvalue);
                    this.saveEditor(cvalue);
                    this.hideEditor();
                }

            }
        }
    },  // inputCollection

    // Editor level Listeners ...
    on:{
        // update the "checks" when editor is shown ...
        editorShow : function(){
            var chks  = this.overlay.get('contentBox').one('.mycheckbox').all('input[type="checkbox"]'),
                val   = this.get('value'),
                chk;

            chks.each(function(n){
                if(n && n.get('value') == val ){  // not a === check, to account for mixed vars
                    chk = n;
                    return true;
                }
                n.set('checked',false);
            });

            if(chk) {
                chk.set('checked',true);
            }
        }
    }

};

