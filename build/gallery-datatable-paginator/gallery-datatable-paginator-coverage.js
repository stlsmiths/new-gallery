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
_yuitest_coverage["build/gallery-datatable-paginator/gallery-datatable-paginator.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-datatable-paginator/gallery-datatable-paginator.js",
    code: []
};
_yuitest_coverage["build/gallery-datatable-paginator/gallery-datatable-paginator.js"].code=["YUI.add('gallery-datatable-paginator', function (Y, NAME) {","","/**"," Defines a Y.DataTable class extension to add capability to support a Paginator View-Model and allow"," paging of actively displayed data within the DT instance.",""," Works with either client-side pagination (i.e. local data, usually in form of JS Array) or"," in conjunction with remote server-side pagination, via either DataSource or ModelSync.REST.",""," Allows for dealing with sorted data, wherein the local data is sorted in place, and in the case of remote data the \"sortBy\""," attribute is passed to the remote server.",""," <h4>Usage</h4>","","     var dtable = new Y.DataTable({","         columns:    [ 'firstName','lastName','state','age', 'grade' ],","         data:       enrollment.records,","         scrollable: 'y',","         height:     '450px',","         sortBy:     [{lastName:'asc'}, {grade:-1}],","         paginator:  new PaginatorView({","            model:      new PaginatorModel({itemsPerPage:50, page:3}),","            container:  '#pagContA'","         }),","         resizePaginator: true","     });",""," <h4>Client OR Server Pagination</h4>",""," Pagination can either be done solely on the \"client\", or from a remote \"server\".  The attribute [paginationSource](#attr_paginationSource)"," is set to either of these strings.  The trivial case is where the data is coming locally (i.e. in a JS array) and the user requests"," \"client\" pagination.  Likewise when pagination occurs solely on a remote device, \"server\" is very straightforward.  This module also"," provides a middle-path where the initial payload is obtained from a remote source, and then after loading, pagination is to be done"," on the \"client\" (see below).",""," A determination of whether the source of `data` is either \"local\" data (i.e. a Javascript Array or Y.ModelList), or is"," provided from a server (either DataSource or ModelSync.REST) is performed within the method [_afterDataReset](#method__afterDataReset).",""," For server-side pagination, the OUTGOING request must include (as a minimum);  `page` and `itemsPerPage` querystring"," parameters (all others, including `sortBy` are optional).  Likewise, the INCOMING (returned response) must include as \"meta-data\" at"," least `totalItems`, plus any other PaginatorModel attributes.   The key item within the returned response is `totalItems'. If the returned"," response does not contain `totalItems` metadata <b>the PaginatorView will not be shown!</b>.",""," We have provided an attribute [serverPaginationMap](#attr_serverPaginationMap) as an object hash to translate both outgoing"," querystring parameter names and incoming (response returned) parameter names in order to match what is expected by the"," PaginatorModel.  Please see this attribute or the examples for how to utilize this map for your use case.",""," <h4>Loading the \"data\" For a Page</h4>"," Once the \"source of data\" is known, the method [processPageRequest](#method_processPageRequest) fires on a `pageChange`.",""," For the case of \"client\" pagination, an internal buffer [_mlistArray](#property__mlistArray) is set to hold all of the data."," Each page request in this circumstance involves using simply Array slicing methods from the buffer."," (See method [paginatorLocalRequest](#method_paginatorLocalRequest) for details)",""," The case of \"remote data\" (from a server) is actually more straightforward.  For the case of ModelSync.REST remote data the"," current \"pagination state\" is processed through the [serverPaginationMap](#attr_serverPaginationMap) hash (to convert to"," queryString format) and the ModelList.load() method is called.  For the case of a DataSource, a similar approach is used where"," the [requestStringTemplate](#attr_requestStringTemplate) is read, processed through the serverPaginationMap hash and a"," datasource.load() request is fired."," (See methods [paginatorMLRequest](#method_paginatorMLRequest) and [paginatorDSRequest](#method_paginatorDSRequest)for details)",""," This extension DOES NOT \"cache\" pages for remote data, it simply inserts the full returned data into the DT.  So as a consequence,"," a pagination state change for remote data involves a simple request sent to the server source (either DataSource or ModelSync.REST)"," and the response results are loaded in the DT as in any other \"response\".",""," <h4>Loading the \"initial data\" remotely - then using \"client\" Pagination</h4>",""," A recent revision to this module now allows for the initial payload of data that constitutes the entire \"dataset\" to be loaded"," from a remote source (by the standard DataSource or ModelSync.REST methods).",""," By setting the [paginationSource](#attr_paginationSource) attribute to \"client\", this module proceeds with paginating the DataTable"," as if the data was initially set within the \"data\" property.",""," <h4>Sorting</h4>",""," This module supports sorting for both client and server side Pagination.  Note that sorting for \"server-side\" is required to be"," accomplished by the remote server; the \"sortBy\" settings are passed in a remote page request.",""," For client-side Pagination the task is a more complex.  We utilize an internal buffer to store the client-side data, so therefore"," the requested \"sorting\" is accomplished internally within method [paginatorSortLocalData](#method_paginatorSortLocalData)."," Basic \"client-side\" sorting is supported in this method (limited to one sort key at a time)."," Implementers may override this method for more complex sorting needs.",""," @module gallery-datatable-paginator"," @class Y.DataTable.Paginator"," @extends DataTable"," @since 3.6.0"," **/","function DtPaginator() {}","","","DtPaginator.ATTRS = {","","    /**","     * Adds a paginator view (specifically Y.PaginatorView) instance to the DataTable.","     *","     * @attribute paginator","     * @type Y.View","     * @default null","     */","    paginator:  {","        value : null,","        setter: '_setPaginator'","    },","","    /**","     * Defines a hash to convert expected PaginatorModel attributes to outgoing request queryString","     * or returned (incoming response) meta data back to PaginatorModel attributes.","     *","     * @example","     *          serverPaginationMap : {","     *              totalItems :    'totalRows',","     *              page :          {toServer:'requestedPage', fromServer:'returnedPageNo'},","     *              itemIndexStart: 'startRecord',","     *              itemsPerPage:   'numPageRows'","     *          }","     *","     *          // would map to an outgoing request of (for url:/data/orders) ;","     *          /data/orders/{cust_no}?requestedPage={requestedPage}&numPageRows={numPageRows}","     *","     *          // for a JSON response of ...","     *          { \"reply\":\"ok\", \"totalRows\":478, \"returnedPageNo\":17, \"startRecord\":340, \"numPageRows\":20,","     *            \"results\":[ {...} 20 total rows returned {...}] }","     *","     * For default value, see [_defPagMap](#method__defPagMap)","     *","     * @attribute serverPaginationMap","     * @type {Object}","     * @default","     */","    serverPaginationMap:{","        valueFn:    '_defPagMap',","        setter:     '_setPagMap',","        validator:  Y.Lang.isObject","    },","","    /**","     * Attribute to track the full pagination state (i.e. the PaginatorModel) attributes all in one object.","     * Also includes the `sortBy` property internally.","     *","     * @attribute paginationState","     * @type Object","     * @default unset","     * @beta","     */","    paginationState: {","        valueFn: null, //'_defPagState',","        setter:  '_setPagState',","        getter:  '_getPagState'","    },","","    /**","     * (SERVER DataSource only!)","     * Includes the request queryString for a DataSource request (only!), which contains the pagination","     * replacement strings to be appended to the DataSource's \"source\" string.","     *","     * @example","     *          requestStringTemplate:  \"?currentPage={page}&pageRows={itemsPerPage}&sorting={sortBy}\"","     *","     * Note, the replacement parameters within this template should match the settings from the PaginatorModel","     * attributes.","     *","     * In cases where your server expects differing query parameters, you can utilize ATTR [serverPaginationMap](#attr_serverPaginationMap).","     *","     * @attribute requestStringTemplate","     * @type String","     * @default \"\"","     */","    requestStringTemplate: {","        value:      \"\",","        validator:  Y.Lang.isString","    },","","    /**","     * Flag to indicate if the Paginator container should be re-sized to the DataTable size","     * after rendering is complete.","     *","     * This attribute works best with a \"bar\" type of Paginator that is intended to look integral with a DataTable.","     *","     * @attribute paginatorResize","     * @type Boolean","     * @default false","     */","    paginatorResize: {","        value:      false,","        validator:  Y.Lang.isBoolean","    },","","    /**","     *  A flag to indicate if client-side pagination or server-side pagination is desired.","     *  Specifically, this attribute determines whether Page Requests are sent remotely or are","     *  handled internally.","     *","     *  Recognized settings are \"client\" (the default) or \"server\".","     *","     *  Note: In cases where the initial payload of data is obtained from a DS or ModelSyncREST","     *  server, but after data is received the user desires \"client-side\" pagination, this would","     *  be set to \"client\".","     *","     * @attribute paginationSource","     * @type String","     * @default 'client'","     */","    paginationSource: {","        value:      'client',","        validator:  Y.Lang.isString","    }","","};","","","Y.mix( DtPaginator.prototype, {","    /**","     * Holder for the \"original\" un-paged data that the DataTable was based upon.","     *","     * This property is stored as an Array, from the original \"data\" ModelList, only used","     * for case of \"local\" data, is sliced as needed to re-set each data Page.","     *","     * Populated in method [_afterDataReset](#method__afterDataReset)","     *","     * @property _mlistArray","     * @type Array","     * @default null","     * @static","     * @since 3.6.0","     * @protected","     */","    _mlistArray: null,","","","    /**","     * Placeholder for a text flag indicating the original provider of \"data\" for this DataTable,","     *  this is set initially in method _afterDataReset.","     *","     * Set to either 'local', 'ds' or 'mlist' in method [_afterDataReset](#method__afterDataReset)","     *","     * Populated in _afterDataReset.  Utilized in processPageRequest","     *","     * @property _pagDataSrc","     * @type String","     * @default null","     * @static","     * @since 3.6.0","     * @protected","     */","    _pagDataSrc: null,","","    /**","     * Array to hold Event handles to allow for cleanup in the destructor","     * @property _evtHandlesPag","     * @type Array","     * @default null","     * @static","     * @protected","     */","    _evtHandlesPag: null,","","    /**","     * A convenience property holder for the DataTable's \"paginator\" attribute (the Paginator-View instance).","     *","     * @property paginator","     * @type {Y.PaginatorView|View}","     * @default null","     * @public","     * @since 3.6.0","     */","    paginator: null,","","    /**","     * A convenience property holder for the Paginator-View's Model attribute.","     * @property pagModel","     * @type {Y.PaginatorModel|Model}","     * @default null","     * @public","     * @since 3.6.0","     */","    pagModel: null,","","    /*----------------------------------------------------------------------------------------------------------*/","    /*                  L I F E - C Y C L E    M E T H O D S                                                    */","    /*----------------------------------------------------------------------------------------------------------*/","","    /**","     * This initializer sets up the listeners related to the original DataTable instance, to the","     *  PaginatorModel changes and related to the underlying \"data\" attribute the DT is based upon.","     *","     * @method initializer","     * @protected","     * @return this","     * @chainable","     */","    initializer: function(){","        //","        // Setup listeners on PaginatorModel and DT changes ...","        //   Only do these if the \"paginator\" ATTR is set","        //","        if ( this.get('paginator') ) {","","            this.paginator = this.get('paginator');","            this._evtHandlesPag = [];","","            // If PaginatorModel exists, set listeners for \"change\" events ...","            if ( this.paginator.get('model') ) {","                this.pagModel = this.get('paginator').get('model');","                this._evtHandlesPag.push( this.pagModel.after('pageChange', Y.bind(this._pageChangeListener,this) ) );","                this._evtHandlesPag.push( this.pagModel.after('itemsPerPageChange', Y.bind(this._pageChangeListener,this)) );","                this._evtHandlesPag.push( this.pagModel.after('totalItemsChange', Y.bind(this._totalItemsListener,this)) );","            }","","            // Define listeners to the \"data\" change events ....","            this._evtHandlesPag.push( this.data.after(\"reset\", Y.bind(this._afterDataReset,this)) );","            this._evtHandlesPag.push( this.data.after(\"add\", Y.bind(this._afterDataAdd,this)) );","            this._evtHandlesPag.push( this.data.after(\"remove\", Y.bind(this._afterDataRemove,this)) );","","            // Added listener to sniff for DataSource existence, for its binding","            this._evtHandlesPag.push( Y.Do.after( this._afterSyncUI, this, '_syncUI', this) );","","            // Add listener for \"sort\" events on DataTable ...","            this._evtHandlesPag.push( this.after('sort', this._afterSortPaginator) );","","            // Try to determine when DT is finished rendering records, this is hacky .. but seems to work","            this._evtHandlesPag.push( this.after( 'renderView', this._notifyRender) );","","        }","","","        return this;","    },","","    /**","     * Destructor to clean up listener event handlers and the internal storage buffer.","     *","     * @method destructor","     * @protected","     */","    destructor: function () {","","        // Clear up the listeners that were defined ...","","        Y.Array.each( this._evtHandlesPag,function(item){","            if (!item) {","                return;","            }","","            if(Y.Lang.isArray(item)) {","                Y.Array.each(item,function(si){","                    si.detach();","                });","            } else {","                item.detach();","            }","","        });","","        // and clean-up the Arrays created","        this._mlistArray = null;","        this._evtHandlesPag = null;","","        // And delete the static properties set","        delete this.pagModel;","        delete this.paginator;","","    },","","    /*----------------------------------------------------------------------------------------------------------*/","    /*                  P U B L I C      M E T H O D S                                                          */","    /*----------------------------------------------------------------------------------------------------------*/","","    /**","     *  Primary workhorse method that is fired when the Paginator \"page\" changes,","     *  and returns a new subset of data for the DT (local data)","     *  or sends a new request to a remote source to populate the DT (remote data)","     *","     *  @method processPageRequest","     *  @param  {Integer} page_no Current page number to change to","     *  @param  {Object} pag_state Pagination state object (this is NOT populated in local .. non-server type pagination) including;","     *      @param {Integer} pag_state.indexStart Starting index returned from server response","     *      @param {Integer} pag_state.numRecs Count of records returned from the response","     *  @public","     *  @return nothing","     */","    processPageRequest: function(page_no, pag_state) {","        var rdata = this._mlistArray,","            pagv  = this.get('paginator'),","            pagm  = pagv.get('model'),","            rpp   = pagm.get('itemsPerPage'),","            sortby= this.get('sortBy') || {},","            istart, iend, url_obj, prop_istart, prop_ipp, prop_iend, prop_page, rqst_str;","        //","        //  Get paginator indices","        //","        if ( pag_state ) {","            istart = pag_state.itemIndexStart;","            iend   = pag_state.itemIndexEnd || istart + rpp;","        } else {","            // usually here on first pass thru, when paginator initiates ...","            istart = ( page_no - 1 ) * rpp;","            iend = istart + rpp - 1;","            iend = ( rdata && iend > rdata.length ) ? rdata.length : iend;","        }","","        //","        //  Store the translated replacement object for the request converted","        //  from `serverPaginationMap` (or defaults if none) to a \"normalized\" format","        //","","        url_obj     = {},","        prop_istart = this._srvPagMapObj('itemIndexStart'),","        prop_ipp    = this._srvPagMapObj('itemsPerPage');","        prop_page   = this._srvPagMapObj('page');","        prop_iend   = this._srvPagMapObj('itemIndexEnd');","","        url_obj[prop_page]   = page_no;      // page","        url_obj[prop_istart] = istart;      // itemIndexStart","        url_obj[prop_iend]   = iend;        // itemIndexEnd","        url_obj[prop_ipp]    = rpp;         // itemsPerPage","        url_obj.sortBy       = Y.JSON.stringify( sortby );","","        // mix-in the model ATTRS with the url_obj","        url_obj = Y.merge(this.get('paginationState'), url_obj);","","        //","        //  This is the main guts of retrieving the records,","        //    we already figured out if this was 'local' or 'server' based.","        //","        //   Now, process this page request thru either local data array slicing or","        //    simply firing off a remote server request ...","        //","        switch(this._pagDataSrc) {","","            case 'ds':","","                // fire off a request to DataSource, mixing in as the request string","                //  with ATTR `requestStringTemplate` with the \"url_obj\" map","","                rqst_str = this.get('requestStringTemplate') || '';","                this.paginatorDSRequest( Y.Lang.sub(rqst_str,url_obj) );","","                break;","","            case 'mlist':","","                // fire off a ModelSync.REST load \"read\" request, note that it mixes","                //   the ModelList ATTRS with 'url_obj' in creating the request","","                this.paginatorMLRequest(url_obj);","","                break;","","            case 'local':","","                //this.paginatorLocalRequest(page_no,istart,iend);","                this.paginatorLocalRequest(url_obj);","","","        }","","        this.resizePaginator();","        this.fire('pageUpdate',{ state:pag_state, view:pagv, urlObj: url_obj });","    },","","    /**","     * Fires after the DataTable-Paginator updates the page data and/or sends the remote request for more data","     * @event pageUpdate","     * @param {Object} pagStatus containing following;","     *  @param {Object} pagStatus.pag_state Of Paginator Model `getAttrs()` as an Object","     *  @param {View} pagStatus.view Instance of the Paginator View","     */","","    /**","     * Utility method that fires a request for the currently active page, effectively","     * \"refreshing\" the Paginator UI","     *","     * @method refreshPaginator","     * @public","     */","    refreshPaginator: function() {","        this.processPageRequest(this.pagModel.get('page'));","    },","","    /**","     * Overrideable method to send the Pagination request to the ModelList for the \"load\" request.","     * The default method simply passes the url_object (created/populated within method [processPageRequest](#method_processPageRequest))","     * to the ModelList's \"load\" method (assuming ModelSync.REST or other handling is provided).","     *","     * Implementers are free to override this method to incorporate their own remote request.","     *","     * @method paginatorMLRequest","     * @param {Object} url_object The pagination URL request object passed to the ModelList's sync layer","     * @public","     */","    paginatorMLRequest: function(url_object){","        this.data.load(url_object);","    },","","    /**","     * Overrideable method to send the Pagination request to the DataSource.","     * By default the constructed `requestString` is sent, but implementers can override this method to","     * include additional information in their remote request.","     *","     * @method paginatorDSRequest","     * @param {String} requestString DataSource remote request string sent via DataTable.datasource load method","     * @public","     */","    paginatorDSRequest: function(requestString) {","        this.datasource.load({","            request: requestString","        });","    },","","    /**","     * Overrideable method to handle a Pagination request when using \"local\" data.  This method","     * takes care of slicing and resetting the \"local data\" array and re-syncing the DataTable.","     *","     * @method paginatorLocalRequest","     * @param {Object} url_obj","     *  @param {Number} itemIndexStart Calculated ending index for this page number","     *  @param {Number} itemIndexEnd Calculated ending index for this page number","     * @public","     */","    paginatorLocalRequest: function(url_obj) {","        var istart = url_obj.itemIndexStart,","            iend   = url_obj.itemIndexEnd,","            rdata = this._mlistArray || [],","            data_new;","","        data_new = rdata.slice(istart,iend+1);","        this.data.reset( data_new, {silent:true} );","        this.syncUI();","    },","","","    /**","     * Method to sync the container for the paginator View with the underlying DataTable","     *  'table' element.","     *","     *  Unfortunately, there isn't a distinct, definitive 'render' complete event due to","     *   DT's complex rendering, so I use a timer function to attempt a resize.","     *","     * @method resizePaginator","     * @public","     */","    resizePaginator: function() {","        if ( this.get('paginatorResize') !== true )  {","            return;","        }","","        //TODO:  this is a total HACK, should figure a better way than Y.later ...","        Y.later( 25, this, function(){ this._syncPaginatorSize(); } );","    },","","    /**","     *  Method to re-initialize the original entire dataset when used with \"client\" pagination.","     *","     * @method resetLocalData","     * @param {Array|ModelList} data Data to be reset to ... either as a JS Array or a Y.ModelList","     * @public","     * @return this","     * @chainable","     */","    resetLocalData: function(data){","        if ( data instanceof Y.ModelList ) {","            this._mlistArray = [];","            data.each(function(model){","                this._mlistArray.push( model.toJSON() );","            },this);","        } else if (Y.Lang.isArray(data) ) {","            this._mlistArray = [].concat(data);","        }","        this.pagModel.set('totalItems', this._mlistArray.length );","        this.refreshPaginator();","        return this;","    },","","    /**","     * Method that sorts the buffered local data (in _mlistArray) after a DataTable","     * sort event is fired.","     *","     * TODO: ONLY WORKS FOR single column sort presently and for \"known\" sorting","     * methods (i.e. string, number, date)","     *","     * Implementers can override this method to incorporate more advanced sorting","     *","     * @method paginatorSortLocalData","     * @public","     */","    paginatorSortLocalData: function(){","        var rdata  = [], //this._mlistArray,","            sortBy = this.get('sortBy'),","            sortObj,sortKey,sortDir;","","        if(Y.Lang.isArray(sortBy)) {","","            Y.Array.each(this._mlistArray, function(r){ rdata.push(r); });","","            sortObj = sortBy[0],","            sortKey = Y.Object.keys(sortObj)[0],","            sortDir = sortObj[sortKey];","","        //","        //  Server-based sorting, sort prior to sending response back","        //  (supports String, Number and Date sorting ...)","        //","            rdata.sort(function(a,b){","                var rtn,atime,btime;","                if(Y.Lang.isString(a[sortKey])) {","","                    rtn = ( a[sortKey]<b[sortKey] ) ? -sortDir : sortDir;","","                } else if(Y.Lang.isNumber(a[sortKey])){","","                    rtn = (a[sortKey]-b[sortKey]<0) ? -sortDir : sortDir;","","                } else if(Y.Lang.isDate(a[sortKey]) ){","","                    //rtn = ((a[sortKey].getTime() - b[sortKey].getTime())<0) ? -sortDir : sortDir;","                    atime = a[sortKey], //.getTime(),","                    btime = b[sortKey]; //.getTime();","                    rtn = (sortDir === -1) ? (btime - atime) : (atime - btime);","","                }","                return rtn;","","            });","","            this._mlistArray = rdata;","","        }","","        this.refreshPaginator();","","    },","","","    /**","     * Method to return the entire internal buffer array used for client-side pagination.","     * Note: This only applies to client-side pagination","     *","     * @method getLocalData","     * @return {Array} data Array of internal buffer used for client-side pagination","     * @public","     */","    getLocalData: function() {","        return this._mlistArray;","    },","","    /**","     * Helper method that responds to DT's \"data:add\" event (via .addRow/addRows), by adding","     * the new record (in o.newVal) to the internal buffer and refreshing the Paginator UI.","     *","     * NOTE: This only applies to FOR LOCAL DATA ONLY, for client-side pagination","     *","     * Implementers are welcome to override this method with their own !!","     *","     * @method addLocalData","     * @param {Object} o Event object from the ModelList.add event","     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset","     * @public","     */","    addLocalData: function(o,pgIndex) {","        var data  = (o && o.model && o.model.toJSON) ? o.model.toJSON() : null,","            mdata, newData, first, second;","","        if (data) {","            if(data.id) {","                delete data.id;","            }","","            mdata = this._mlistArray;","            newData = [];","","            if(pgIndex === 0){","                newData = newData.concat(data,mdata);","            } else {","                first = mdata.slice(0,pgIndex);","                second = mdata.slice(pgIndex);","                newData = newData.concat(first,data,second);","            }","","            this.resetLocalData(newData);","        }","","    },","","    /**","     * Helper method that responds to DT's \"data:remove\" event (invoked by .removeRow), by adding","     * the new record (in o.newVal) to the internal buffer and refreshing the Paginator UI.","     *","     * NOTE: This only applies to FOR LOCAL DATA ONLY, for client-side pagination","     *","     * Implementers are welcome to override this method with their own !!","     *","     * @method removeLocalData","     * @param {Object} o Event object from the ModelList.remove event","     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset","     * @public","     */","    removeLocalData: function(o, pgIndex) {","        var data  = (o && o.model && o.model.toJSON) ? o.model.toJSON() : null,","            mdata = [];","","        if(data && pgIndex !== null ) {","            mdata = this._mlistArray;","            mdata.splice(pgIndex,1);","            this.resetLocalData(mdata);","        }","","    },","","    /**","     * Overridable method that fires for server-side pagination when a data item is added","     * via either \"data:add\" or .addRow.","     *","     * It is up to implementers to either override this method or provide a mechanism","     * (why not than ModelSync.REST!) to respond to the provided event.","     *","     * @method addRemoteData","     * @param {Object} o Change event payload object from ModelList's .add method","     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset","     */","    addRemoteData: function(o,pgIndex) {","        this.fire('addRemoteRecord',{","            oPayload: o,","            pagIndex: pgIndex","        });","    },","","    /**","     * Overridable method that fires for server-side pagination when a data item is deleted","     * via either \"data:remove\" or .removeRow.","     *","     * It is up to implementers to either override this method or provide a mechanism","     * (why not than ModelSync.REST!) to respond to the provided event.","     *","     * @method removeRemoteData","     * @param {Object} o Change event payload object from ModelList's .remove method","     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset","     */","    removeRemoteData: function(o,pgIndex) {","        this.fire('removeRemoteRecord',{","            oPayload: o,","            pagIndex: pgIndex","        });","    },","","","    /*----------------------------------------------------------------------------------------------------------*/","    /*                  P R I V A T E    M E T H O D S                                                          */","    /*----------------------------------------------------------------------------------------------------------*/","","    /**","     * Method called to ensure that the _afterDataReset method is called, specifically for the case","     * where a DataSource is used (which is hard to track when it is plugged in ...)","     *","     * @method _afterSyncUI","     * @private","     */","    _afterSyncUI: function(){","        if ( !this._pagDataSrc ) {","            this._afterDataReset({});","        }","    },","","","    /**","     * A primary method for initially determining the origin of the \"data\" for paginating.","     * DataTable calls \"this.data.reset()\" many times, most importantly at the very beginning","     * before and before any remote responses have been received.","     *","     * We use this fact to set an initial \"type\" of data origin (either 'mlist', 'ds' or 'local')","     * to represent a ModelSync.REST origin, DataSource or just locally assigned data (default).","     *","     * Then after the initial typing, listeners are set for the appropriate remote source of","     * data, or for local data the assigned \"data\" attribute is used as the initial data.","     *","     * After this method is first completed,","     *","     * @method _afterDataReset","     * @param {Object} o Event object from the Model.reset event","     * @private","     */","    _afterDataReset: function(o){","        if(this._pagDataSrc !== null) {","            return;","        }","","        var localPagDataSrc = '';","","    // ----","    //  Step 1. Determine if a ModelSync REST is setup, or a DataSource,","    //          or if all fail then fallback to local data","    // ----","","        // For no DS and a ModelSync.REST with \"url\" static property ===>> ModelList","        if ( !this.datasource && this.data.url && this._pagDataSrc === null ) {","","            localPagDataSrc = 'mlist';","","        } else if ( this.datasource && !this.data.url && this._pagDataSrc === null ) {","","        // or With a DS defined and no \"url\" static property of the Data  ===>> DataSource","            localPagDataSrc = 'ds';","","        } else {","","        // ... or finally, assume \"local\" data","            localPagDataSrc = 'local';","","        }","","    // ----","    //  Step 2. Define listeners for the specific data provider, either ModelSync.REST","    //          or DataSource or for \"local\" data (set via \"data\" ATTR)","    //","    //   Note: Handle \"special case\" where the <b>initial payload</b> is sent from a remote","    //         source, but once received the user wants \"client\" pagination.","    // ----","","        switch( localPagDataSrc ) {","","            case 'mlist':","                // Set listener for ModelSync.REST custom event \"response\" ... after .parse is processed","                this._evtHandlesPag.push( this.data.after( \"response\", this._afterMLResponse, this) );","               // this.data.after( \"response\", this._afterMLResponse, this)","","                if( /client/i.test(this.get('paginationSource')) ){","                    this._pagDataSrc = 'local';","                } else {","                    this._pagDataSrc = 'mlist';","                }","","                break;","","            case 'ds':","                this._evtHandlesPag.push( this.datasource.get('datasource').after(\"response\", Y.bind(this._afterDSResponse,this) ) );","                //this.datasource.get('datasource').after(\"response\", Y.bind(this._afterDSResponse,this) )","","                if( /client/i.test(this.get('paginationSource')) ) {","                    this._pagDataSrc = 'local';","                } else {","                    this._pagDataSrc = 'ds';","                }","","                break;","","            case 'local':","                this._setLocalData(o);","                break;","","        }","","    },","","    /**","     * Method that stores the \"local\" data in an internal buffer within the _mlistArray static","     * property.  The _mlistArray is stored as a simple JS Array type (for speed), and is used to","     * select current \"pages\" by Array slicing methods.","     *","     * If the argument \"o\" is provided, it will be used as the new dataset for local data, if it","     * is not set, then the current DT \"data\" attribute is used.","     *","     * On a \"sort\" event, the buffer needs to be sorted first, then sliced for paging.","     *","     * @method _setLocalData","     * @param {Array|ModelList} o Optional data to set as full local dataset","     * @private","     */","    _setLocalData: function(o){","        // Get the DT's \"data\" attribute as the full local dataset","        var mdata = this.get('data');","","        // Use the passed in argument only if it exists and is Array or ML, otherwise","        //   just use the current \"data\" setting","        if(o && (Y.Lang.isArray(o) || o instanceof Y.ModelList) ) {","            mdata = o;","        }","","        this._pagDataSrc = 'local';     // reset this, in case it wasn't already","        //","        //   Store the full local data in property _mlistArray (as an array)","        //","        this.resetLocalData(mdata);","","        this._set('paginationState',this._defPagState());","    },","","","    /**","     * Listener method that is called after the DataTable's data \"add\" event fires","     * @method _afterDataAdd","     * @param {Object} o Event payload from ModelList's \"add\" event","     * @private","     */","    _afterDataAdd: function(o){","        var pgIndexStart = this.pagModel.get('itemIndexStart'),","            index        = o.index || null,","            pgIndex      = (index!==null) ? pgIndexStart + index : null;","","        if(this._pagDataSrc === 'local') {","            this.addLocalData(o,pgIndex);","        } else {","            this.addRemoteData(o,pgIndex);","        }","","        this.fire('afterDataAdd',{","            oPayload:   o,","            pagIndex:   pgIndex","        });","    },","","    /**","     * Event fired when the DataTable's \"data:add\" event is fired, that includes","     * ModelList.add's event payload.","     *","     * This event could be used by implementers to handle refreshing of the local data.","     * (not presently implemented)","","     * @event afterDataAdd","     * @param {Object} obj","     *  @param {Object} oPayload Event payload from ModelList.add","     *  @param {Number} pagIndex Calculated absolute index of the record within the entire dataset","     */","","    /**","     * Over-ridable method to call after the DataTable's data \"remove\" event fires","     * @method _afterDataRemove","     * @param {Object} o Event payload from ModelList.remove","     * @private","     */","    _afterDataRemove: function(o){","        var pgIndexStart = this.pagModel.get('itemIndexStart'),","            index        = o.index || null,","            pgIndex      = (index !== null) ? pgIndexStart + index : null;","","        if(this._pagDataSrc === 'local'){","            this.removeLocalData(o,pgIndex);","        } else {","            this.removeRemoteData(o,pgIndex);","        }","","        this.fire('afterDataRemove',{","            oPayload:   o,","            pagIndex:   pgIndex","        });","    },","","    /**","     * Event fired when the DataTable's \"data:remove\" event is fired, that includes","     * the ModelList.remove's event payload.","     *","     * This event could be used by implementers to handle refreshing of the local data.","     * (not presently implemented)","     *","     * @event afterDataRemove","     * @param {Object} obj","     *  @param {Object} oPayload Event payload from ModelList.remove","     *  @param {Number} pagIndex Calculated absolute index of the record within the entire dataset","     */","","    /**","     * Listener that fires after the DT \"sort\" event processes.  The Paginator must be","     * reset to the currently selected new \"page\", based on the sorting criteria.","     *","     * For remote sources this is easy, just send another remote page request.","     *","     * For local data source it is more complex, as we have to deal with sorting the full","     * local data array ...","     *","     * @method _afterSortPaginator","     * @private","     */","    _afterSortPaginator: function() {","        if(!this._pagDataSrc) {","            return;","        }","","        switch(this._pagDataSrc) {","","            case 'mlist':","            case 'ds':","                this.processPageRequest(this.pagModel.get('page'));","                break;","","            case 'local':","                this.paginatorSortLocalData();","","        }","","    },","","    /**","     * Method fires after the \"response\" event from DataSource OR after the custom ModelList fires","     * a REQUIRED user-defined \"response\" event.  (typically a custom ModelList's .parse() method","     * is over-ridden to provide the custom \"response\" event including {results:, meta:} properties.","     *","     * Usage Note: The user is REQUIRED to provide a custom \"response\" event in the ModelList","     *  parse function in order for this to work properly.","     *","     * @method _afterRemoteResponse","     * @param {Object} o Includes results and meta properties passed in via \"response\" custom event;","     *  @param {Array} o.results Array of result Objects","     *  @param {Object} o.meta Object including properties mapped to include pagination properties","     * @param {String} rsource Source of response, either 'ds' or 'mlist'","     * @private","     */","    _afterRemoteResponse: function(o,rsource){","        var resp          = ( rsource === 'ds') ? o.response : o,","            totalItemProp = this.get('serverPaginationMap').totalItems || null,","            respItemTotal = (totalItemProp && resp.meta && resp.meta[totalItemProp] !== undefined) ? resp.meta[totalItemProp]: null;","","        // Process through the \"response\", checking the \"totalItems\" returned","        //   ... if no \"totalItems\" was included in the response, then set the response to \"local\" data","        if ( resp.results ) {","            if ( totalItemProp && respItemTotal !== null ) {","","                // The response included totalItems:0 ... special case of a null set","                if( respItemTotal === 0) {","","                    this.pagModel.set('totalItems', 0 );","                    this.pagModel.set('page',1);","                    this.data.reset( null, {silent:true} );","                    this.syncUI();","                    this.paginator.render();","","                } else {","","                    this.pagModel.set('totalItems', respItemTotal);","","                }","","            } else {","","                this._setLocalData(resp.results);","            }","        }","        this.resizePaginator();","    },","","    /**","     * Method fires after DataTable/DataSource plugin fires it's \"response\" event, which includes","     * the response object, including {results:, meta:} properties.","     *","     * @method _afterDSResponse","     * @param {Object} e Event object from DataSource's \"response\" event","     * @private","     */","    _afterDSResponse: function(e) {","        this._afterRemoteResponse(e,'ds');","    },","","    /**","     * Method fires after custom ModelSync.REST \"load\" action fires a user-defined \"response\" event.","     * This can be implemented by extending ModelSync.REST by adding .parse() method which fires","     * a custom \"response\" event including {results:, meta:} properties.","     *","     * Usage Note: The user is REQUIRED to provide a custom \"response\" event in the ModelList","     *  parse overridden function in order for this to work properly.","     *","     * @method _afterMLResponse","     * @param {Object} resp Includes results and meta properties","     *  @param {String} resp.resp Original raw response argument received into ModelList \"parse\" method","     *  @param {Object} resp.parsed Parsed raw response object after conversion (typically via JSON)","     *  @param {Array} resp.results Array of result Objects","     *  @param {Object} resp.meta Object including properties mapped to include pagination properties","     * @private","     */","    _afterMLResponse: function(resp){","        this._afterRemoteResponse(resp,'mlist');","    },","","    /**","     * Listener that fires when the Model's 'pageChange' fires, this extracts the current page from the state","     * object and then makes the appropriate processPageRequest call.","     *","     * @method _pageChangeListener","     * @param {Object} o Change event facade for the PaginatorModel 'pageChange' event","     * @private","     */","    _pageChangeListener: function(o){","        var newPage = +o.newVal || 1;","        newPage = this.pagModel.get('page');","        this.processPageRequest(newPage, this.get('paginationState'));","    },","","    /**","     * A listener that monitors the \"totalItems\" attribute of the Paginator Model and","     * if a zero list of items is returns it fires the \"paginatorZeroItems\" custom event.","     * @method _totalItemsListener","     * @param {Object} Change event facade from the PaginatorModel 'totalItemsChange' event","     * @private","     */","    _totalItemsListener: function(o) {","        if(o.newVal===0) {","            this.fire('paginatorZeroItems');","        }","    },","","    /**","     * Event fired when the \"totalItems\" setting of the Paginator Model is set to zero,","     * due to a null response froma remote request or a null Array or ModelList being set.","     * @event paginatorZeroItems","     */","","    /**","     * Method to adjust the CSS width of the paginator container and set it to the","     *  width of the underlying DT.","     *","     * Reworked this to reset width to \"yui3-datatable-columns\", i.e. the THEAD element for","     *  both scrollable and non-scrollable to get around a 2px mismatch.","     *","     * @method _syncPaginatorSize","     * @return Boolean if success","     * @private","     */","    _syncPaginatorSize: function() {","        var tblCols = this.get('boundingBox').one('.'+this.getClassName('columns'));","        if ( !tblCols ) {","            return false;","        }","","        this.paginator.get('container').setStyle('width',tblCols.getComputedStyle('width'));","        this.fire('paginatorResize');","        return true;","    },","","    /**","     * Event fired after the _syncPaginatorSize method is called  (requires ATTR paginatorResize)","     * to be set true","     * @event paginatorResize","     */","","","    /**","     * Helper method that searches the 'serverPaginationMap' ATTR and returns the requested","     * property, including if it is nested as \"toServer\" or \"fromServer\" subattribute.","     * ( Used in processPageRequest )","     *","     * @example","     *    _srvPagMapObj(\"itemsPerPage\")","     *         { itemsPerPage : 'numPageRecords' }","     *         { itemsPerPage : {toServer:'pageRows', fromServer:'pageRecordCount' }","     *","     * @method _srvPagMapObj","     * @param {String} prop Property name to search for (expected matches in PaginatorModel ATTRS)","     * @param {String} dir Directional (optional), either \"to\" (matches toServer) or \"from\" (matches fromServer)","     * @return {String} rprop Attribute name from RHS of map","     * @private","     */","    _srvPagMapObj: function(prop,dir){","        var spm   = this.get('serverPaginationMap') || {},","            rprop = spm[prop];","","        dir   = dir || 'to';","","        if ( rprop && dir === 'to' && rprop.toServer )   {","            rprop = rprop.toServer;","        }","","        if ( rprop && dir !== 'to' && rprop.fromServer ) {","            rprop = rprop.fromServer;","        }","","        return rprop;","    },","","    /**","     * Default 'valueFn' function setting for the ATTR `serverPaginationMap`, where","     * the defaults are simply the member names.","     * @method _defPagMap","     * @return {Object} obj","     * @private","     */","    _defPagMap: function() {","        return    {","            page:           'page',","            totalItems:     'totalItems',","            itemsPerPage:   'itemsPerPage',","            itemIndexStart: 'itemIndexStart',","            itemIndexEnd:   'itemIndexEnd'","        };","    },","","    /**","     * Setter method for the `serverPaginationMap` attribute, which can be used to","     *  merge the \"default\" object with the user-supplied object.","     * @method _setPagMap","     * @param {Object} val Object hash to serve as the attribute setting","     * @return {Object}","     * @private","     */","    _setPagMap: function(val) {","        var defObj = this._defPagMap();","        return Y.merge(defObj,val);","    },","","","    /**","     * Sets default for the \"paginationState\" DataTable attribute complex object as an","     * object with all of PaginatorModel ATTRS and the `sortBy` setting.","     * @method _defPagState","     * @return {Object}","     * @private","     */","    _defPagState: function(){","        var rtn = {};","        if ( this.get('paginator') && this.get('paginator').model ) {","            rtn = this.get('paginator').model.getAttrs(['page','totalItems','itemsPerPage','itemIndexStart','itemIndexEnd','totalPages']);","            //rtn = this.get('paginator').model.getAttrs();","            rtn.sortBy = this.get('sortBy');","        }","        return rtn;","    },","","    /**","     * Getter for the \"paginationState\" DataTable attribute complex object.","     * @method _gefPagState","     * @return {Object}","     * @private","     */","    _getPagState: function(){","        if(!this.get('paginator')) {","            return null;","        }","        var rtn = (this.pagModel) ? this.pagModel.getAttrs(['page','totalItems','itemsPerPage','itemIndexStart','itemIndexEnd','totalPages']) : {};","    //        var rtn = (this.pagModel) ? this.pagModel.getAttrs(true) : {};","        rtn.sortBy = this.get('sortBy');","        return rtn;","    },","","    /**","     * Sets default for the \"paginationState\" DataTable attribute complex object.","     * @method _sefPagState","     * @param {Object} val Pagination state complex object settings","     * @return {Object}","     * @private","     */","    _setPagState: function(val) {","        if(!this.get('paginator')) {","            return null;","        }","","        if ( val.initialized !== undefined ){","            delete val.initialized;","        }","","        if ( val.sortBy !== undefined ){","            this.set('sortBy',val.sortBy);","        }","","        if ( this.pagModel ) {","            this.pagModel.setAttrs(val);","        }","        return val;","    },","","","    /**","     * This is a setter for the 'paginator' attribute, primarily to set the public property `paginator` to the","     * attribute value.","     *","     * @method _setPaginator","     * @param {PaginatorView|View} val The PaginatorView instance to set","     * @return {*}","     * @private","     */","    _setPaginator : function(val){","        if ( !val ) {","            return;","        }","        this.paginator = val;","        this.initializer();","        return val;","    },","","","","    /**","     * A method that fires after the DataTable `renderView` method completes, that is *approximately* when","     * the DataTable has finished rendering.","     *","     * @method _notifyRender","     * @private","     */","    _notifyRender: function() {","        if ( this.get('paginatorResize') === true ) {","            this.resizePaginator();","        }","        this.fire('render');","    }","","    /**","     * Fires after the DataTable 'renderView' event fires","     * @event render","     */","","});","","Y.DataTable.Paginator = DtPaginator;","Y.Base.mix(Y.DataTable, [Y.DataTable.Paginator]);","","","}, '@VERSION@', {\"requires\": [\"datatable-base\", \"base-build\", \"datatype\", \"json\"]});"];
_yuitest_coverage["build/gallery-datatable-paginator/gallery-datatable-paginator.js"].lines = {"1":0,"89":0,"92":0,"212":0,"297":0,"299":0,"300":0,"303":0,"304":0,"305":0,"306":0,"307":0,"311":0,"312":0,"313":0,"316":0,"319":0,"322":0,"327":0,"340":0,"341":0,"342":0,"345":0,"346":0,"347":0,"350":0,"356":0,"357":0,"360":0,"361":0,"383":0,"392":0,"393":0,"394":0,"397":0,"398":0,"399":0,"407":0,"410":0,"411":0,"413":0,"414":0,"415":0,"416":0,"417":0,"420":0,"429":0,"436":0,"437":0,"439":0,"446":0,"448":0,"453":0,"458":0,"459":0,"478":0,"493":0,"506":0,"522":0,"527":0,"528":0,"529":0,"544":0,"545":0,"549":0,"562":0,"563":0,"564":0,"565":0,"567":0,"568":0,"570":0,"571":0,"572":0,"588":0,"592":0,"594":0,"596":0,"604":0,"605":0,"606":0,"608":0,"610":0,"612":0,"614":0,"617":0,"619":0,"622":0,"626":0,"630":0,"644":0,"661":0,"664":0,"665":0,"666":0,"669":0,"670":0,"672":0,"673":0,"675":0,"676":0,"677":0,"680":0,"699":0,"702":0,"703":0,"704":0,"705":0,"722":0,"740":0,"759":0,"760":0,"783":0,"784":0,"787":0,"795":0,"797":0,"799":0,"802":0,"807":0,"819":0,"823":0,"826":0,"827":0,"829":0,"832":0,"835":0,"838":0,"839":0,"841":0,"844":0,"847":0,"848":0,"870":0,"874":0,"875":0,"878":0,"882":0,"884":0,"895":0,"899":0,"900":0,"902":0,"905":0,"931":0,"935":0,"936":0,"938":0,"941":0,"973":0,"974":0,"977":0,"981":0,"982":0,"985":0,"1007":0,"1013":0,"1014":0,"1017":0,"1019":0,"1020":0,"1021":0,"1022":0,"1023":0,"1027":0,"1033":0,"1036":0,"1048":0,"1068":0,"1080":0,"1081":0,"1082":0,"1093":0,"1094":0,"1116":0,"1117":0,"1118":0,"1121":0,"1122":0,"1123":0,"1150":0,"1153":0,"1155":0,"1156":0,"1159":0,"1160":0,"1163":0,"1174":0,"1192":0,"1193":0,"1205":0,"1206":0,"1207":0,"1209":0,"1211":0,"1221":0,"1222":0,"1224":0,"1226":0,"1227":0,"1238":0,"1239":0,"1242":0,"1243":0,"1246":0,"1247":0,"1250":0,"1251":0,"1253":0,"1267":0,"1268":0,"1270":0,"1271":0,"1272":0,"1285":0,"1286":0,"1288":0,"1298":0,"1299":0};
_yuitest_coverage["build/gallery-datatable-paginator/gallery-datatable-paginator.js"].functions = {"DtPaginator:89":0,"initializer:292":0,"(anonymous 3):346":0,"(anonymous 2):340":0,"destructor:336":0,"processPageRequest:382":0,"refreshPaginator:477":0,"paginatorMLRequest:492":0,"paginatorDSRequest:505":0,"paginatorLocalRequest:521":0,"(anonymous 4):549":0,"resizePaginator:543":0,"(anonymous 5):564":0,"resetLocalData:561":0,"(anonymous 6):594":0,"(anonymous 7):604":0,"paginatorSortLocalData:587":0,"getLocalData:643":0,"addLocalData:660":0,"removeLocalData:698":0,"addRemoteData:721":0,"removeRemoteData:739":0,"_afterSyncUI:758":0,"_afterDataReset:782":0,"_setLocalData:868":0,"_afterDataAdd:894":0,"_afterDataRemove:930":0,"_afterSortPaginator:972":0,"_afterRemoteResponse:1006":0,"_afterDSResponse:1047":0,"_afterMLResponse:1067":0,"_pageChangeListener:1079":0,"_totalItemsListener:1092":0,"_syncPaginatorSize:1115":0,"_srvPagMapObj:1149":0,"_defPagMap:1173":0,"_setPagMap:1191":0,"_defPagState:1204":0,"_getPagState:1220":0,"_setPagState:1237":0,"_setPaginator:1266":0,"_notifyRender:1284":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-paginator/gallery-datatable-paginator.js"].coveredLines = 219;
_yuitest_coverage["build/gallery-datatable-paginator/gallery-datatable-paginator.js"].coveredFunctions = 43;
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1);
YUI.add('gallery-datatable-paginator', function (Y, NAME) {

/**
 Defines a Y.DataTable class extension to add capability to support a Paginator View-Model and allow
 paging of actively displayed data within the DT instance.

 Works with either client-side pagination (i.e. local data, usually in form of JS Array) or
 in conjunction with remote server-side pagination, via either DataSource or ModelSync.REST.

 Allows for dealing with sorted data, wherein the local data is sorted in place, and in the case of remote data the "sortBy"
 attribute is passed to the remote server.

 <h4>Usage</h4>

     var dtable = new Y.DataTable({
         columns:    [ 'firstName','lastName','state','age', 'grade' ],
         data:       enrollment.records,
         scrollable: 'y',
         height:     '450px',
         sortBy:     [{lastName:'asc'}, {grade:-1}],
         paginator:  new PaginatorView({
            model:      new PaginatorModel({itemsPerPage:50, page:3}),
            container:  '#pagContA'
         }),
         resizePaginator: true
     });

 <h4>Client OR Server Pagination</h4>

 Pagination can either be done solely on the "client", or from a remote "server".  The attribute [paginationSource](#attr_paginationSource)
 is set to either of these strings.  The trivial case is where the data is coming locally (i.e. in a JS array) and the user requests
 "client" pagination.  Likewise when pagination occurs solely on a remote device, "server" is very straightforward.  This module also
 provides a middle-path where the initial payload is obtained from a remote source, and then after loading, pagination is to be done
 on the "client" (see below).

 A determination of whether the source of `data` is either "local" data (i.e. a Javascript Array or Y.ModelList), or is
 provided from a server (either DataSource or ModelSync.REST) is performed within the method [_afterDataReset](#method__afterDataReset).

 For server-side pagination, the OUTGOING request must include (as a minimum);  `page` and `itemsPerPage` querystring
 parameters (all others, including `sortBy` are optional).  Likewise, the INCOMING (returned response) must include as "meta-data" at
 least `totalItems`, plus any other PaginatorModel attributes.   The key item within the returned response is `totalItems'. If the returned
 response does not contain `totalItems` metadata <b>the PaginatorView will not be shown!</b>.

 We have provided an attribute [serverPaginationMap](#attr_serverPaginationMap) as an object hash to translate both outgoing
 querystring parameter names and incoming (response returned) parameter names in order to match what is expected by the
 PaginatorModel.  Please see this attribute or the examples for how to utilize this map for your use case.

 <h4>Loading the "data" For a Page</h4>
 Once the "source of data" is known, the method [processPageRequest](#method_processPageRequest) fires on a `pageChange`.

 For the case of "client" pagination, an internal buffer [_mlistArray](#property__mlistArray) is set to hold all of the data.
 Each page request in this circumstance involves using simply Array slicing methods from the buffer.
 (See method [paginatorLocalRequest](#method_paginatorLocalRequest) for details)

 The case of "remote data" (from a server) is actually more straightforward.  For the case of ModelSync.REST remote data the
 current "pagination state" is processed through the [serverPaginationMap](#attr_serverPaginationMap) hash (to convert to
 queryString format) and the ModelList.load() method is called.  For the case of a DataSource, a similar approach is used where
 the [requestStringTemplate](#attr_requestStringTemplate) is read, processed through the serverPaginationMap hash and a
 datasource.load() request is fired.
 (See methods [paginatorMLRequest](#method_paginatorMLRequest) and [paginatorDSRequest](#method_paginatorDSRequest)for details)

 This extension DOES NOT "cache" pages for remote data, it simply inserts the full returned data into the DT.  So as a consequence,
 a pagination state change for remote data involves a simple request sent to the server source (either DataSource or ModelSync.REST)
 and the response results are loaded in the DT as in any other "response".

 <h4>Loading the "initial data" remotely - then using "client" Pagination</h4>

 A recent revision to this module now allows for the initial payload of data that constitutes the entire "dataset" to be loaded
 from a remote source (by the standard DataSource or ModelSync.REST methods).

 By setting the [paginationSource](#attr_paginationSource) attribute to "client", this module proceeds with paginating the DataTable
 as if the data was initially set within the "data" property.

 <h4>Sorting</h4>

 This module supports sorting for both client and server side Pagination.  Note that sorting for "server-side" is required to be
 accomplished by the remote server; the "sortBy" settings are passed in a remote page request.

 For client-side Pagination the task is a more complex.  We utilize an internal buffer to store the client-side data, so therefore
 the requested "sorting" is accomplished internally within method [paginatorSortLocalData](#method_paginatorSortLocalData).
 Basic "client-side" sorting is supported in this method (limited to one sort key at a time).
 Implementers may override this method for more complex sorting needs.

 @module gallery-datatable-paginator
 @class Y.DataTable.Paginator
 @extends DataTable
 @since 3.6.0
 **/
_yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 89);
function DtPaginator() {}


_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 92);
DtPaginator.ATTRS = {

    /**
     * Adds a paginator view (specifically Y.PaginatorView) instance to the DataTable.
     *
     * @attribute paginator
     * @type Y.View
     * @default null
     */
    paginator:  {
        value : null,
        setter: '_setPaginator'
    },

    /**
     * Defines a hash to convert expected PaginatorModel attributes to outgoing request queryString
     * or returned (incoming response) meta data back to PaginatorModel attributes.
     *
     * @example
     *          serverPaginationMap : {
     *              totalItems :    'totalRows',
     *              page :          {toServer:'requestedPage', fromServer:'returnedPageNo'},
     *              itemIndexStart: 'startRecord',
     *              itemsPerPage:   'numPageRows'
     *          }
     *
     *          // would map to an outgoing request of (for url:/data/orders) ;
     *          /data/orders/{cust_no}?requestedPage={requestedPage}&numPageRows={numPageRows}
     *
     *          // for a JSON response of ...
     *          { "reply":"ok", "totalRows":478, "returnedPageNo":17, "startRecord":340, "numPageRows":20,
     *            "results":[ {...} 20 total rows returned {...}] }
     *
     * For default value, see [_defPagMap](#method__defPagMap)
     *
     * @attribute serverPaginationMap
     * @type {Object}
     * @default
     */
    serverPaginationMap:{
        valueFn:    '_defPagMap',
        setter:     '_setPagMap',
        validator:  Y.Lang.isObject
    },

    /**
     * Attribute to track the full pagination state (i.e. the PaginatorModel) attributes all in one object.
     * Also includes the `sortBy` property internally.
     *
     * @attribute paginationState
     * @type Object
     * @default unset
     * @beta
     */
    paginationState: {
        valueFn: null, //'_defPagState',
        setter:  '_setPagState',
        getter:  '_getPagState'
    },

    /**
     * (SERVER DataSource only!)
     * Includes the request queryString for a DataSource request (only!), which contains the pagination
     * replacement strings to be appended to the DataSource's "source" string.
     *
     * @example
     *          requestStringTemplate:  "?currentPage={page}&pageRows={itemsPerPage}&sorting={sortBy}"
     *
     * Note, the replacement parameters within this template should match the settings from the PaginatorModel
     * attributes.
     *
     * In cases where your server expects differing query parameters, you can utilize ATTR [serverPaginationMap](#attr_serverPaginationMap).
     *
     * @attribute requestStringTemplate
     * @type String
     * @default ""
     */
    requestStringTemplate: {
        value:      "",
        validator:  Y.Lang.isString
    },

    /**
     * Flag to indicate if the Paginator container should be re-sized to the DataTable size
     * after rendering is complete.
     *
     * This attribute works best with a "bar" type of Paginator that is intended to look integral with a DataTable.
     *
     * @attribute paginatorResize
     * @type Boolean
     * @default false
     */
    paginatorResize: {
        value:      false,
        validator:  Y.Lang.isBoolean
    },

    /**
     *  A flag to indicate if client-side pagination or server-side pagination is desired.
     *  Specifically, this attribute determines whether Page Requests are sent remotely or are
     *  handled internally.
     *
     *  Recognized settings are "client" (the default) or "server".
     *
     *  Note: In cases where the initial payload of data is obtained from a DS or ModelSyncREST
     *  server, but after data is received the user desires "client-side" pagination, this would
     *  be set to "client".
     *
     * @attribute paginationSource
     * @type String
     * @default 'client'
     */
    paginationSource: {
        value:      'client',
        validator:  Y.Lang.isString
    }

};


_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 212);
Y.mix( DtPaginator.prototype, {
    /**
     * Holder for the "original" un-paged data that the DataTable was based upon.
     *
     * This property is stored as an Array, from the original "data" ModelList, only used
     * for case of "local" data, is sliced as needed to re-set each data Page.
     *
     * Populated in method [_afterDataReset](#method__afterDataReset)
     *
     * @property _mlistArray
     * @type Array
     * @default null
     * @static
     * @since 3.6.0
     * @protected
     */
    _mlistArray: null,


    /**
     * Placeholder for a text flag indicating the original provider of "data" for this DataTable,
     *  this is set initially in method _afterDataReset.
     *
     * Set to either 'local', 'ds' or 'mlist' in method [_afterDataReset](#method__afterDataReset)
     *
     * Populated in _afterDataReset.  Utilized in processPageRequest
     *
     * @property _pagDataSrc
     * @type String
     * @default null
     * @static
     * @since 3.6.0
     * @protected
     */
    _pagDataSrc: null,

    /**
     * Array to hold Event handles to allow for cleanup in the destructor
     * @property _evtHandlesPag
     * @type Array
     * @default null
     * @static
     * @protected
     */
    _evtHandlesPag: null,

    /**
     * A convenience property holder for the DataTable's "paginator" attribute (the Paginator-View instance).
     *
     * @property paginator
     * @type {Y.PaginatorView|View}
     * @default null
     * @public
     * @since 3.6.0
     */
    paginator: null,

    /**
     * A convenience property holder for the Paginator-View's Model attribute.
     * @property pagModel
     * @type {Y.PaginatorModel|Model}
     * @default null
     * @public
     * @since 3.6.0
     */
    pagModel: null,

    /*----------------------------------------------------------------------------------------------------------*/
    /*                  L I F E - C Y C L E    M E T H O D S                                                    */
    /*----------------------------------------------------------------------------------------------------------*/

    /**
     * This initializer sets up the listeners related to the original DataTable instance, to the
     *  PaginatorModel changes and related to the underlying "data" attribute the DT is based upon.
     *
     * @method initializer
     * @protected
     * @return this
     * @chainable
     */
    initializer: function(){
        //
        // Setup listeners on PaginatorModel and DT changes ...
        //   Only do these if the "paginator" ATTR is set
        //
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "initializer", 292);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 297);
if ( this.get('paginator') ) {

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 299);
this.paginator = this.get('paginator');
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 300);
this._evtHandlesPag = [];

            // If PaginatorModel exists, set listeners for "change" events ...
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 303);
if ( this.paginator.get('model') ) {
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 304);
this.pagModel = this.get('paginator').get('model');
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 305);
this._evtHandlesPag.push( this.pagModel.after('pageChange', Y.bind(this._pageChangeListener,this) ) );
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 306);
this._evtHandlesPag.push( this.pagModel.after('itemsPerPageChange', Y.bind(this._pageChangeListener,this)) );
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 307);
this._evtHandlesPag.push( this.pagModel.after('totalItemsChange', Y.bind(this._totalItemsListener,this)) );
            }

            // Define listeners to the "data" change events ....
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 311);
this._evtHandlesPag.push( this.data.after("reset", Y.bind(this._afterDataReset,this)) );
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 312);
this._evtHandlesPag.push( this.data.after("add", Y.bind(this._afterDataAdd,this)) );
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 313);
this._evtHandlesPag.push( this.data.after("remove", Y.bind(this._afterDataRemove,this)) );

            // Added listener to sniff for DataSource existence, for its binding
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 316);
this._evtHandlesPag.push( Y.Do.after( this._afterSyncUI, this, '_syncUI', this) );

            // Add listener for "sort" events on DataTable ...
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 319);
this._evtHandlesPag.push( this.after('sort', this._afterSortPaginator) );

            // Try to determine when DT is finished rendering records, this is hacky .. but seems to work
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 322);
this._evtHandlesPag.push( this.after( 'renderView', this._notifyRender) );

        }


        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 327);
return this;
    },

    /**
     * Destructor to clean up listener event handlers and the internal storage buffer.
     *
     * @method destructor
     * @protected
     */
    destructor: function () {

        // Clear up the listeners that were defined ...

        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "destructor", 336);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 340);
Y.Array.each( this._evtHandlesPag,function(item){
            _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "(anonymous 2)", 340);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 341);
if (!item) {
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 342);
return;
            }

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 345);
if(Y.Lang.isArray(item)) {
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 346);
Y.Array.each(item,function(si){
                    _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "(anonymous 3)", 346);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 347);
si.detach();
                });
            } else {
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 350);
item.detach();
            }

        });

        // and clean-up the Arrays created
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 356);
this._mlistArray = null;
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 357);
this._evtHandlesPag = null;

        // And delete the static properties set
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 360);
delete this.pagModel;
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 361);
delete this.paginator;

    },

    /*----------------------------------------------------------------------------------------------------------*/
    /*                  P U B L I C      M E T H O D S                                                          */
    /*----------------------------------------------------------------------------------------------------------*/

    /**
     *  Primary workhorse method that is fired when the Paginator "page" changes,
     *  and returns a new subset of data for the DT (local data)
     *  or sends a new request to a remote source to populate the DT (remote data)
     *
     *  @method processPageRequest
     *  @param  {Integer} page_no Current page number to change to
     *  @param  {Object} pag_state Pagination state object (this is NOT populated in local .. non-server type pagination) including;
     *      @param {Integer} pag_state.indexStart Starting index returned from server response
     *      @param {Integer} pag_state.numRecs Count of records returned from the response
     *  @public
     *  @return nothing
     */
    processPageRequest: function(page_no, pag_state) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "processPageRequest", 382);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 383);
var rdata = this._mlistArray,
            pagv  = this.get('paginator'),
            pagm  = pagv.get('model'),
            rpp   = pagm.get('itemsPerPage'),
            sortby= this.get('sortBy') || {},
            istart, iend, url_obj, prop_istart, prop_ipp, prop_iend, prop_page, rqst_str;
        //
        //  Get paginator indices
        //
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 392);
if ( pag_state ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 393);
istart = pag_state.itemIndexStart;
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 394);
iend   = pag_state.itemIndexEnd || istart + rpp;
        } else {
            // usually here on first pass thru, when paginator initiates ...
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 397);
istart = ( page_no - 1 ) * rpp;
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 398);
iend = istart + rpp - 1;
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 399);
iend = ( rdata && iend > rdata.length ) ? rdata.length : iend;
        }

        //
        //  Store the translated replacement object for the request converted
        //  from `serverPaginationMap` (or defaults if none) to a "normalized" format
        //

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 407);
url_obj     = {},
        prop_istart = this._srvPagMapObj('itemIndexStart'),
        prop_ipp    = this._srvPagMapObj('itemsPerPage');
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 410);
prop_page   = this._srvPagMapObj('page');
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 411);
prop_iend   = this._srvPagMapObj('itemIndexEnd');

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 413);
url_obj[prop_page]   = page_no;      // page
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 414);
url_obj[prop_istart] = istart;      // itemIndexStart
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 415);
url_obj[prop_iend]   = iend;        // itemIndexEnd
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 416);
url_obj[prop_ipp]    = rpp;         // itemsPerPage
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 417);
url_obj.sortBy       = Y.JSON.stringify( sortby );

        // mix-in the model ATTRS with the url_obj
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 420);
url_obj = Y.merge(this.get('paginationState'), url_obj);

        //
        //  This is the main guts of retrieving the records,
        //    we already figured out if this was 'local' or 'server' based.
        //
        //   Now, process this page request thru either local data array slicing or
        //    simply firing off a remote server request ...
        //
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 429);
switch(this._pagDataSrc) {

            case 'ds':

                // fire off a request to DataSource, mixing in as the request string
                //  with ATTR `requestStringTemplate` with the "url_obj" map

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 436);
rqst_str = this.get('requestStringTemplate') || '';
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 437);
this.paginatorDSRequest( Y.Lang.sub(rqst_str,url_obj) );

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 439);
break;

            case 'mlist':

                // fire off a ModelSync.REST load "read" request, note that it mixes
                //   the ModelList ATTRS with 'url_obj' in creating the request

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 446);
this.paginatorMLRequest(url_obj);

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 448);
break;

            case 'local':

                //this.paginatorLocalRequest(page_no,istart,iend);
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 453);
this.paginatorLocalRequest(url_obj);


        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 458);
this.resizePaginator();
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 459);
this.fire('pageUpdate',{ state:pag_state, view:pagv, urlObj: url_obj });
    },

    /**
     * Fires after the DataTable-Paginator updates the page data and/or sends the remote request for more data
     * @event pageUpdate
     * @param {Object} pagStatus containing following;
     *  @param {Object} pagStatus.pag_state Of Paginator Model `getAttrs()` as an Object
     *  @param {View} pagStatus.view Instance of the Paginator View
     */

    /**
     * Utility method that fires a request for the currently active page, effectively
     * "refreshing" the Paginator UI
     *
     * @method refreshPaginator
     * @public
     */
    refreshPaginator: function() {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "refreshPaginator", 477);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 478);
this.processPageRequest(this.pagModel.get('page'));
    },

    /**
     * Overrideable method to send the Pagination request to the ModelList for the "load" request.
     * The default method simply passes the url_object (created/populated within method [processPageRequest](#method_processPageRequest))
     * to the ModelList's "load" method (assuming ModelSync.REST or other handling is provided).
     *
     * Implementers are free to override this method to incorporate their own remote request.
     *
     * @method paginatorMLRequest
     * @param {Object} url_object The pagination URL request object passed to the ModelList's sync layer
     * @public
     */
    paginatorMLRequest: function(url_object){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "paginatorMLRequest", 492);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 493);
this.data.load(url_object);
    },

    /**
     * Overrideable method to send the Pagination request to the DataSource.
     * By default the constructed `requestString` is sent, but implementers can override this method to
     * include additional information in their remote request.
     *
     * @method paginatorDSRequest
     * @param {String} requestString DataSource remote request string sent via DataTable.datasource load method
     * @public
     */
    paginatorDSRequest: function(requestString) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "paginatorDSRequest", 505);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 506);
this.datasource.load({
            request: requestString
        });
    },

    /**
     * Overrideable method to handle a Pagination request when using "local" data.  This method
     * takes care of slicing and resetting the "local data" array and re-syncing the DataTable.
     *
     * @method paginatorLocalRequest
     * @param {Object} url_obj
     *  @param {Number} itemIndexStart Calculated ending index for this page number
     *  @param {Number} itemIndexEnd Calculated ending index for this page number
     * @public
     */
    paginatorLocalRequest: function(url_obj) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "paginatorLocalRequest", 521);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 522);
var istart = url_obj.itemIndexStart,
            iend   = url_obj.itemIndexEnd,
            rdata = this._mlistArray || [],
            data_new;

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 527);
data_new = rdata.slice(istart,iend+1);
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 528);
this.data.reset( data_new, {silent:true} );
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 529);
this.syncUI();
    },


    /**
     * Method to sync the container for the paginator View with the underlying DataTable
     *  'table' element.
     *
     *  Unfortunately, there isn't a distinct, definitive 'render' complete event due to
     *   DT's complex rendering, so I use a timer function to attempt a resize.
     *
     * @method resizePaginator
     * @public
     */
    resizePaginator: function() {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "resizePaginator", 543);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 544);
if ( this.get('paginatorResize') !== true )  {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 545);
return;
        }

        //TODO:  this is a total HACK, should figure a better way than Y.later ...
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 549);
Y.later( 25, this, function(){ _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "(anonymous 4)", 549);
this._syncPaginatorSize(); } );
    },

    /**
     *  Method to re-initialize the original entire dataset when used with "client" pagination.
     *
     * @method resetLocalData
     * @param {Array|ModelList} data Data to be reset to ... either as a JS Array or a Y.ModelList
     * @public
     * @return this
     * @chainable
     */
    resetLocalData: function(data){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "resetLocalData", 561);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 562);
if ( data instanceof Y.ModelList ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 563);
this._mlistArray = [];
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 564);
data.each(function(model){
                _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "(anonymous 5)", 564);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 565);
this._mlistArray.push( model.toJSON() );
            },this);
        } else {_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 567);
if (Y.Lang.isArray(data) ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 568);
this._mlistArray = [].concat(data);
        }}
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 570);
this.pagModel.set('totalItems', this._mlistArray.length );
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 571);
this.refreshPaginator();
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 572);
return this;
    },

    /**
     * Method that sorts the buffered local data (in _mlistArray) after a DataTable
     * sort event is fired.
     *
     * TODO: ONLY WORKS FOR single column sort presently and for "known" sorting
     * methods (i.e. string, number, date)
     *
     * Implementers can override this method to incorporate more advanced sorting
     *
     * @method paginatorSortLocalData
     * @public
     */
    paginatorSortLocalData: function(){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "paginatorSortLocalData", 587);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 588);
var rdata  = [], //this._mlistArray,
            sortBy = this.get('sortBy'),
            sortObj,sortKey,sortDir;

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 592);
if(Y.Lang.isArray(sortBy)) {

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 594);
Y.Array.each(this._mlistArray, function(r){ _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "(anonymous 6)", 594);
rdata.push(r); });

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 596);
sortObj = sortBy[0],
            sortKey = Y.Object.keys(sortObj)[0],
            sortDir = sortObj[sortKey];

        //
        //  Server-based sorting, sort prior to sending response back
        //  (supports String, Number and Date sorting ...)
        //
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 604);
rdata.sort(function(a,b){
                _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "(anonymous 7)", 604);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 605);
var rtn,atime,btime;
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 606);
if(Y.Lang.isString(a[sortKey])) {

                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 608);
rtn = ( a[sortKey]<b[sortKey] ) ? -sortDir : sortDir;

                } else {_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 610);
if(Y.Lang.isNumber(a[sortKey])){

                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 612);
rtn = (a[sortKey]-b[sortKey]<0) ? -sortDir : sortDir;

                } else {_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 614);
if(Y.Lang.isDate(a[sortKey]) ){

                    //rtn = ((a[sortKey].getTime() - b[sortKey].getTime())<0) ? -sortDir : sortDir;
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 617);
atime = a[sortKey], //.getTime(),
                    btime = b[sortKey]; //.getTime();
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 619);
rtn = (sortDir === -1) ? (btime - atime) : (atime - btime);

                }}}
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 622);
return rtn;

            });

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 626);
this._mlistArray = rdata;

        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 630);
this.refreshPaginator();

    },


    /**
     * Method to return the entire internal buffer array used for client-side pagination.
     * Note: This only applies to client-side pagination
     *
     * @method getLocalData
     * @return {Array} data Array of internal buffer used for client-side pagination
     * @public
     */
    getLocalData: function() {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "getLocalData", 643);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 644);
return this._mlistArray;
    },

    /**
     * Helper method that responds to DT's "data:add" event (via .addRow/addRows), by adding
     * the new record (in o.newVal) to the internal buffer and refreshing the Paginator UI.
     *
     * NOTE: This only applies to FOR LOCAL DATA ONLY, for client-side pagination
     *
     * Implementers are welcome to override this method with their own !!
     *
     * @method addLocalData
     * @param {Object} o Event object from the ModelList.add event
     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset
     * @public
     */
    addLocalData: function(o,pgIndex) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "addLocalData", 660);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 661);
var data  = (o && o.model && o.model.toJSON) ? o.model.toJSON() : null,
            mdata, newData, first, second;

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 664);
if (data) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 665);
if(data.id) {
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 666);
delete data.id;
            }

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 669);
mdata = this._mlistArray;
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 670);
newData = [];

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 672);
if(pgIndex === 0){
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 673);
newData = newData.concat(data,mdata);
            } else {
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 675);
first = mdata.slice(0,pgIndex);
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 676);
second = mdata.slice(pgIndex);
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 677);
newData = newData.concat(first,data,second);
            }

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 680);
this.resetLocalData(newData);
        }

    },

    /**
     * Helper method that responds to DT's "data:remove" event (invoked by .removeRow), by adding
     * the new record (in o.newVal) to the internal buffer and refreshing the Paginator UI.
     *
     * NOTE: This only applies to FOR LOCAL DATA ONLY, for client-side pagination
     *
     * Implementers are welcome to override this method with their own !!
     *
     * @method removeLocalData
     * @param {Object} o Event object from the ModelList.remove event
     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset
     * @public
     */
    removeLocalData: function(o, pgIndex) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "removeLocalData", 698);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 699);
var data  = (o && o.model && o.model.toJSON) ? o.model.toJSON() : null,
            mdata = [];

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 702);
if(data && pgIndex !== null ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 703);
mdata = this._mlistArray;
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 704);
mdata.splice(pgIndex,1);
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 705);
this.resetLocalData(mdata);
        }

    },

    /**
     * Overridable method that fires for server-side pagination when a data item is added
     * via either "data:add" or .addRow.
     *
     * It is up to implementers to either override this method or provide a mechanism
     * (why not than ModelSync.REST!) to respond to the provided event.
     *
     * @method addRemoteData
     * @param {Object} o Change event payload object from ModelList's .add method
     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset
     */
    addRemoteData: function(o,pgIndex) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "addRemoteData", 721);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 722);
this.fire('addRemoteRecord',{
            oPayload: o,
            pagIndex: pgIndex
        });
    },

    /**
     * Overridable method that fires for server-side pagination when a data item is deleted
     * via either "data:remove" or .removeRow.
     *
     * It is up to implementers to either override this method or provide a mechanism
     * (why not than ModelSync.REST!) to respond to the provided event.
     *
     * @method removeRemoteData
     * @param {Object} o Change event payload object from ModelList's .remove method
     * @param {Number} pgIndex Calculated absolute index of the record within the entire dataset
     */
    removeRemoteData: function(o,pgIndex) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "removeRemoteData", 739);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 740);
this.fire('removeRemoteRecord',{
            oPayload: o,
            pagIndex: pgIndex
        });
    },


    /*----------------------------------------------------------------------------------------------------------*/
    /*                  P R I V A T E    M E T H O D S                                                          */
    /*----------------------------------------------------------------------------------------------------------*/

    /**
     * Method called to ensure that the _afterDataReset method is called, specifically for the case
     * where a DataSource is used (which is hard to track when it is plugged in ...)
     *
     * @method _afterSyncUI
     * @private
     */
    _afterSyncUI: function(){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterSyncUI", 758);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 759);
if ( !this._pagDataSrc ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 760);
this._afterDataReset({});
        }
    },


    /**
     * A primary method for initially determining the origin of the "data" for paginating.
     * DataTable calls "this.data.reset()" many times, most importantly at the very beginning
     * before and before any remote responses have been received.
     *
     * We use this fact to set an initial "type" of data origin (either 'mlist', 'ds' or 'local')
     * to represent a ModelSync.REST origin, DataSource or just locally assigned data (default).
     *
     * Then after the initial typing, listeners are set for the appropriate remote source of
     * data, or for local data the assigned "data" attribute is used as the initial data.
     *
     * After this method is first completed,
     *
     * @method _afterDataReset
     * @param {Object} o Event object from the Model.reset event
     * @private
     */
    _afterDataReset: function(o){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterDataReset", 782);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 783);
if(this._pagDataSrc !== null) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 784);
return;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 787);
var localPagDataSrc = '';

    // ----
    //  Step 1. Determine if a ModelSync REST is setup, or a DataSource,
    //          or if all fail then fallback to local data
    // ----

        // For no DS and a ModelSync.REST with "url" static property ===>> ModelList
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 795);
if ( !this.datasource && this.data.url && this._pagDataSrc === null ) {

            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 797);
localPagDataSrc = 'mlist';

        } else {_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 799);
if ( this.datasource && !this.data.url && this._pagDataSrc === null ) {

        // or With a DS defined and no "url" static property of the Data  ===>> DataSource
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 802);
localPagDataSrc = 'ds';

        } else {

        // ... or finally, assume "local" data
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 807);
localPagDataSrc = 'local';

        }}

    // ----
    //  Step 2. Define listeners for the specific data provider, either ModelSync.REST
    //          or DataSource or for "local" data (set via "data" ATTR)
    //
    //   Note: Handle "special case" where the <b>initial payload</b> is sent from a remote
    //         source, but once received the user wants "client" pagination.
    // ----

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 819);
switch( localPagDataSrc ) {

            case 'mlist':
                // Set listener for ModelSync.REST custom event "response" ... after .parse is processed
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 823);
this._evtHandlesPag.push( this.data.after( "response", this._afterMLResponse, this) );
               // this.data.after( "response", this._afterMLResponse, this)

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 826);
if( /client/i.test(this.get('paginationSource')) ){
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 827);
this._pagDataSrc = 'local';
                } else {
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 829);
this._pagDataSrc = 'mlist';
                }

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 832);
break;

            case 'ds':
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 835);
this._evtHandlesPag.push( this.datasource.get('datasource').after("response", Y.bind(this._afterDSResponse,this) ) );
                //this.datasource.get('datasource').after("response", Y.bind(this._afterDSResponse,this) )

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 838);
if( /client/i.test(this.get('paginationSource')) ) {
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 839);
this._pagDataSrc = 'local';
                } else {
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 841);
this._pagDataSrc = 'ds';
                }

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 844);
break;

            case 'local':
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 847);
this._setLocalData(o);
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 848);
break;

        }

    },

    /**
     * Method that stores the "local" data in an internal buffer within the _mlistArray static
     * property.  The _mlistArray is stored as a simple JS Array type (for speed), and is used to
     * select current "pages" by Array slicing methods.
     *
     * If the argument "o" is provided, it will be used as the new dataset for local data, if it
     * is not set, then the current DT "data" attribute is used.
     *
     * On a "sort" event, the buffer needs to be sorted first, then sliced for paging.
     *
     * @method _setLocalData
     * @param {Array|ModelList} o Optional data to set as full local dataset
     * @private
     */
    _setLocalData: function(o){
        // Get the DT's "data" attribute as the full local dataset
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_setLocalData", 868);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 870);
var mdata = this.get('data');

        // Use the passed in argument only if it exists and is Array or ML, otherwise
        //   just use the current "data" setting
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 874);
if(o && (Y.Lang.isArray(o) || o instanceof Y.ModelList) ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 875);
mdata = o;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 878);
this._pagDataSrc = 'local';     // reset this, in case it wasn't already
        //
        //   Store the full local data in property _mlistArray (as an array)
        //
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 882);
this.resetLocalData(mdata);

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 884);
this._set('paginationState',this._defPagState());
    },


    /**
     * Listener method that is called after the DataTable's data "add" event fires
     * @method _afterDataAdd
     * @param {Object} o Event payload from ModelList's "add" event
     * @private
     */
    _afterDataAdd: function(o){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterDataAdd", 894);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 895);
var pgIndexStart = this.pagModel.get('itemIndexStart'),
            index        = o.index || null,
            pgIndex      = (index!==null) ? pgIndexStart + index : null;

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 899);
if(this._pagDataSrc === 'local') {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 900);
this.addLocalData(o,pgIndex);
        } else {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 902);
this.addRemoteData(o,pgIndex);
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 905);
this.fire('afterDataAdd',{
            oPayload:   o,
            pagIndex:   pgIndex
        });
    },

    /**
     * Event fired when the DataTable's "data:add" event is fired, that includes
     * ModelList.add's event payload.
     *
     * This event could be used by implementers to handle refreshing of the local data.
     * (not presently implemented)

     * @event afterDataAdd
     * @param {Object} obj
     *  @param {Object} oPayload Event payload from ModelList.add
     *  @param {Number} pagIndex Calculated absolute index of the record within the entire dataset
     */

    /**
     * Over-ridable method to call after the DataTable's data "remove" event fires
     * @method _afterDataRemove
     * @param {Object} o Event payload from ModelList.remove
     * @private
     */
    _afterDataRemove: function(o){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterDataRemove", 930);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 931);
var pgIndexStart = this.pagModel.get('itemIndexStart'),
            index        = o.index || null,
            pgIndex      = (index !== null) ? pgIndexStart + index : null;

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 935);
if(this._pagDataSrc === 'local'){
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 936);
this.removeLocalData(o,pgIndex);
        } else {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 938);
this.removeRemoteData(o,pgIndex);
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 941);
this.fire('afterDataRemove',{
            oPayload:   o,
            pagIndex:   pgIndex
        });
    },

    /**
     * Event fired when the DataTable's "data:remove" event is fired, that includes
     * the ModelList.remove's event payload.
     *
     * This event could be used by implementers to handle refreshing of the local data.
     * (not presently implemented)
     *
     * @event afterDataRemove
     * @param {Object} obj
     *  @param {Object} oPayload Event payload from ModelList.remove
     *  @param {Number} pagIndex Calculated absolute index of the record within the entire dataset
     */

    /**
     * Listener that fires after the DT "sort" event processes.  The Paginator must be
     * reset to the currently selected new "page", based on the sorting criteria.
     *
     * For remote sources this is easy, just send another remote page request.
     *
     * For local data source it is more complex, as we have to deal with sorting the full
     * local data array ...
     *
     * @method _afterSortPaginator
     * @private
     */
    _afterSortPaginator: function() {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterSortPaginator", 972);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 973);
if(!this._pagDataSrc) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 974);
return;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 977);
switch(this._pagDataSrc) {

            case 'mlist':
            case 'ds':
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 981);
this.processPageRequest(this.pagModel.get('page'));
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 982);
break;

            case 'local':
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 985);
this.paginatorSortLocalData();

        }

    },

    /**
     * Method fires after the "response" event from DataSource OR after the custom ModelList fires
     * a REQUIRED user-defined "response" event.  (typically a custom ModelList's .parse() method
     * is over-ridden to provide the custom "response" event including {results:, meta:} properties.
     *
     * Usage Note: The user is REQUIRED to provide a custom "response" event in the ModelList
     *  parse function in order for this to work properly.
     *
     * @method _afterRemoteResponse
     * @param {Object} o Includes results and meta properties passed in via "response" custom event;
     *  @param {Array} o.results Array of result Objects
     *  @param {Object} o.meta Object including properties mapped to include pagination properties
     * @param {String} rsource Source of response, either 'ds' or 'mlist'
     * @private
     */
    _afterRemoteResponse: function(o,rsource){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterRemoteResponse", 1006);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1007);
var resp          = ( rsource === 'ds') ? o.response : o,
            totalItemProp = this.get('serverPaginationMap').totalItems || null,
            respItemTotal = (totalItemProp && resp.meta && resp.meta[totalItemProp] !== undefined) ? resp.meta[totalItemProp]: null;

        // Process through the "response", checking the "totalItems" returned
        //   ... if no "totalItems" was included in the response, then set the response to "local" data
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1013);
if ( resp.results ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1014);
if ( totalItemProp && respItemTotal !== null ) {

                // The response included totalItems:0 ... special case of a null set
                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1017);
if( respItemTotal === 0) {

                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1019);
this.pagModel.set('totalItems', 0 );
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1020);
this.pagModel.set('page',1);
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1021);
this.data.reset( null, {silent:true} );
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1022);
this.syncUI();
                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1023);
this.paginator.render();

                } else {

                    _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1027);
this.pagModel.set('totalItems', respItemTotal);

                }

            } else {

                _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1033);
this._setLocalData(resp.results);
            }
        }
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1036);
this.resizePaginator();
    },

    /**
     * Method fires after DataTable/DataSource plugin fires it's "response" event, which includes
     * the response object, including {results:, meta:} properties.
     *
     * @method _afterDSResponse
     * @param {Object} e Event object from DataSource's "response" event
     * @private
     */
    _afterDSResponse: function(e) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterDSResponse", 1047);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1048);
this._afterRemoteResponse(e,'ds');
    },

    /**
     * Method fires after custom ModelSync.REST "load" action fires a user-defined "response" event.
     * This can be implemented by extending ModelSync.REST by adding .parse() method which fires
     * a custom "response" event including {results:, meta:} properties.
     *
     * Usage Note: The user is REQUIRED to provide a custom "response" event in the ModelList
     *  parse overridden function in order for this to work properly.
     *
     * @method _afterMLResponse
     * @param {Object} resp Includes results and meta properties
     *  @param {String} resp.resp Original raw response argument received into ModelList "parse" method
     *  @param {Object} resp.parsed Parsed raw response object after conversion (typically via JSON)
     *  @param {Array} resp.results Array of result Objects
     *  @param {Object} resp.meta Object including properties mapped to include pagination properties
     * @private
     */
    _afterMLResponse: function(resp){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_afterMLResponse", 1067);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1068);
this._afterRemoteResponse(resp,'mlist');
    },

    /**
     * Listener that fires when the Model's 'pageChange' fires, this extracts the current page from the state
     * object and then makes the appropriate processPageRequest call.
     *
     * @method _pageChangeListener
     * @param {Object} o Change event facade for the PaginatorModel 'pageChange' event
     * @private
     */
    _pageChangeListener: function(o){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_pageChangeListener", 1079);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1080);
var newPage = +o.newVal || 1;
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1081);
newPage = this.pagModel.get('page');
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1082);
this.processPageRequest(newPage, this.get('paginationState'));
    },

    /**
     * A listener that monitors the "totalItems" attribute of the Paginator Model and
     * if a zero list of items is returns it fires the "paginatorZeroItems" custom event.
     * @method _totalItemsListener
     * @param {Object} Change event facade from the PaginatorModel 'totalItemsChange' event
     * @private
     */
    _totalItemsListener: function(o) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_totalItemsListener", 1092);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1093);
if(o.newVal===0) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1094);
this.fire('paginatorZeroItems');
        }
    },

    /**
     * Event fired when the "totalItems" setting of the Paginator Model is set to zero,
     * due to a null response froma remote request or a null Array or ModelList being set.
     * @event paginatorZeroItems
     */

    /**
     * Method to adjust the CSS width of the paginator container and set it to the
     *  width of the underlying DT.
     *
     * Reworked this to reset width to "yui3-datatable-columns", i.e. the THEAD element for
     *  both scrollable and non-scrollable to get around a 2px mismatch.
     *
     * @method _syncPaginatorSize
     * @return Boolean if success
     * @private
     */
    _syncPaginatorSize: function() {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_syncPaginatorSize", 1115);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1116);
var tblCols = this.get('boundingBox').one('.'+this.getClassName('columns'));
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1117);
if ( !tblCols ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1118);
return false;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1121);
this.paginator.get('container').setStyle('width',tblCols.getComputedStyle('width'));
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1122);
this.fire('paginatorResize');
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1123);
return true;
    },

    /**
     * Event fired after the _syncPaginatorSize method is called  (requires ATTR paginatorResize)
     * to be set true
     * @event paginatorResize
     */


    /**
     * Helper method that searches the 'serverPaginationMap' ATTR and returns the requested
     * property, including if it is nested as "toServer" or "fromServer" subattribute.
     * ( Used in processPageRequest )
     *
     * @example
     *    _srvPagMapObj("itemsPerPage")
     *         { itemsPerPage : 'numPageRecords' }
     *         { itemsPerPage : {toServer:'pageRows', fromServer:'pageRecordCount' }
     *
     * @method _srvPagMapObj
     * @param {String} prop Property name to search for (expected matches in PaginatorModel ATTRS)
     * @param {String} dir Directional (optional), either "to" (matches toServer) or "from" (matches fromServer)
     * @return {String} rprop Attribute name from RHS of map
     * @private
     */
    _srvPagMapObj: function(prop,dir){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_srvPagMapObj", 1149);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1150);
var spm   = this.get('serverPaginationMap') || {},
            rprop = spm[prop];

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1153);
dir   = dir || 'to';

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1155);
if ( rprop && dir === 'to' && rprop.toServer )   {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1156);
rprop = rprop.toServer;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1159);
if ( rprop && dir !== 'to' && rprop.fromServer ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1160);
rprop = rprop.fromServer;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1163);
return rprop;
    },

    /**
     * Default 'valueFn' function setting for the ATTR `serverPaginationMap`, where
     * the defaults are simply the member names.
     * @method _defPagMap
     * @return {Object} obj
     * @private
     */
    _defPagMap: function() {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_defPagMap", 1173);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1174);
return    {
            page:           'page',
            totalItems:     'totalItems',
            itemsPerPage:   'itemsPerPage',
            itemIndexStart: 'itemIndexStart',
            itemIndexEnd:   'itemIndexEnd'
        };
    },

    /**
     * Setter method for the `serverPaginationMap` attribute, which can be used to
     *  merge the "default" object with the user-supplied object.
     * @method _setPagMap
     * @param {Object} val Object hash to serve as the attribute setting
     * @return {Object}
     * @private
     */
    _setPagMap: function(val) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_setPagMap", 1191);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1192);
var defObj = this._defPagMap();
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1193);
return Y.merge(defObj,val);
    },


    /**
     * Sets default for the "paginationState" DataTable attribute complex object as an
     * object with all of PaginatorModel ATTRS and the `sortBy` setting.
     * @method _defPagState
     * @return {Object}
     * @private
     */
    _defPagState: function(){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_defPagState", 1204);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1205);
var rtn = {};
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1206);
if ( this.get('paginator') && this.get('paginator').model ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1207);
rtn = this.get('paginator').model.getAttrs(['page','totalItems','itemsPerPage','itemIndexStart','itemIndexEnd','totalPages']);
            //rtn = this.get('paginator').model.getAttrs();
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1209);
rtn.sortBy = this.get('sortBy');
        }
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1211);
return rtn;
    },

    /**
     * Getter for the "paginationState" DataTable attribute complex object.
     * @method _gefPagState
     * @return {Object}
     * @private
     */
    _getPagState: function(){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_getPagState", 1220);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1221);
if(!this.get('paginator')) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1222);
return null;
        }
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1224);
var rtn = (this.pagModel) ? this.pagModel.getAttrs(['page','totalItems','itemsPerPage','itemIndexStart','itemIndexEnd','totalPages']) : {};
    //        var rtn = (this.pagModel) ? this.pagModel.getAttrs(true) : {};
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1226);
rtn.sortBy = this.get('sortBy');
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1227);
return rtn;
    },

    /**
     * Sets default for the "paginationState" DataTable attribute complex object.
     * @method _sefPagState
     * @param {Object} val Pagination state complex object settings
     * @return {Object}
     * @private
     */
    _setPagState: function(val) {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_setPagState", 1237);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1238);
if(!this.get('paginator')) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1239);
return null;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1242);
if ( val.initialized !== undefined ){
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1243);
delete val.initialized;
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1246);
if ( val.sortBy !== undefined ){
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1247);
this.set('sortBy',val.sortBy);
        }

        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1250);
if ( this.pagModel ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1251);
this.pagModel.setAttrs(val);
        }
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1253);
return val;
    },


    /**
     * This is a setter for the 'paginator' attribute, primarily to set the public property `paginator` to the
     * attribute value.
     *
     * @method _setPaginator
     * @param {PaginatorView|View} val The PaginatorView instance to set
     * @return {*}
     * @private
     */
    _setPaginator : function(val){
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_setPaginator", 1266);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1267);
if ( !val ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1268);
return;
        }
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1270);
this.paginator = val;
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1271);
this.initializer();
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1272);
return val;
    },



    /**
     * A method that fires after the DataTable `renderView` method completes, that is *approximately* when
     * the DataTable has finished rendering.
     *
     * @method _notifyRender
     * @private
     */
    _notifyRender: function() {
        _yuitest_coverfunc("build/gallery-datatable-paginator/gallery-datatable-paginator.js", "_notifyRender", 1284);
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1285);
if ( this.get('paginatorResize') === true ) {
            _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1286);
this.resizePaginator();
        }
        _yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1288);
this.fire('render');
    }

    /**
     * Fires after the DataTable 'renderView' event fires
     * @event render
     */

});

_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1298);
Y.DataTable.Paginator = DtPaginator;
_yuitest_coverline("build/gallery-datatable-paginator/gallery-datatable-paginator.js", 1299);
Y.Base.mix(Y.DataTable, [Y.DataTable.Paginator]);


}, '@VERSION@', {"requires": ["datatable-base", "base-build", "datatype", "json"]});
