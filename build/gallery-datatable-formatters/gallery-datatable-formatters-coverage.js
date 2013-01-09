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
_yuitest_coverage["build/gallery-datatable-formatters/gallery-datatable-formatters.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-datatable-formatters/gallery-datatable-formatters.js",
    code: []
};
_yuitest_coverage["build/gallery-datatable-formatters/gallery-datatable-formatters.js"].code=["YUI.add('gallery-datatable-formatters', function (Y, NAME) {","","/**"," Define a \"named\" Column Formatters object and attach it to the Y.DataTable namespace."," The named formatters are defined as a series of format strings that are typically used by the"," data formatting function Y.DataType.Number.format and Y.DataType.Date.format.",""," The function [`namedFormatter`](#method_namedFormatter) is defined that can be used to call as a column formatter which"," formats the column cell using the [`formatStrings`](#property_formatStrings) object.",""," This module includes an override of the [Y.DataTable.BodyView._createRowHTML](#method_Y.DataTable.BodyView._createRowHTML) method."," Therefore implementers shouldn't call the `namedFormatter` method directly because the overridden method handles the call if the"," entered formatter string name is recognized.",""," ###Usage"," The format string names can be used in a column configuration object as follows;","","		var dt1 = new Y.DataTable({","            data: some_data,","            columns: [","                { key:\"start_date\", label:\"Start\", formatter:\"fullDate\" },","                { key:\"end_date\", label:\"End\", formatter:\"default\", ","                  formatOptions:{ type:'date', formatConfig:{ format:'%F' } } },","                { key:\"qty\", label:\"Inventory Qty\", formatter:\"comma\" },","                { key:\"cost\", label:\"Carried Cost\", formatter:\"currency\",","                  formatConfig:{ prefix:'£', thousandsSeparator:\",\"} }","    	    ]","		}).render();",""," ####Pre-Defined `formatStrings` settings; (specifically, Y.DataTable.Formatters.formatStrings)"," For \"number\" formatting, using [Y.DataType.Number](http://yuilibrary.com/yui/docs/api/classes/DataType.Number.html#method_format).",""," <table><tr><th>string</th><th>Formatter Object</th><th>Formatted Example</th></tr>"," <tr><td>`general`</td><td>{ decimalPlaces:0 }</td><td>123457</td></tr>"," <tr><td>`general2`</td><td>{ decimalPlaces:2 }</td><td>123456.79</td></tr>"," <tr><td>`currency`</td><td>{ prefix:'$', decimalPlaces:0, thousandsSeparator:',' }</td><td>$ 123,457</td></tr>"," <tr><td>`currency2`</td><td>{ prefix:'$', decimalPlaces:2, thousandsSeparator:',' }</td><td>$ 123,456.78</td></tr>"," <tr><td>`currency3`</td><td>{ prefix:'$', decimalPlaces:3, thousandsSeparator:',' }</td><td>$ 123,457.789</td></tr>"," <tr><td>`comma`</td><td>{ decimalPlaces:0, thousandsSeparator:','}</td><td>123,457</td></tr>"," <tr><td>`comma2`</td><td>{ decimalPlaces:2, thousandsSeparator:','}</td><td>123,456.78</td></tr>"," <tr><td>`comma3`</td><td>{ decimalPlaces:3, thousandsSeparator:','}</td><td>123,457.789</td></tr>"," </table>",""," For \"date\" formatting, using [Y.DataType.Date](http://yuilibrary.com/yui/docs/api/classes/DataType.Date.html#method_format)."," <br/>(Please refer to the Date.format method above for the proper use of \"strftime\" format strings)"," <table><tr><th>string</th><th>Formatter Object</th><th>Formatted Example</th></tr>"," <tr><td>`shortDate`</td><td>{ format:'%D' }</td><td>03/12/92</td></tr>"," <tr><td>`longDate`</td><td>{ format:'%m/%d/%Y' }</td><td>03/12/1992</td></tr>"," <tr><td>`fullDate`</td><td>{ format:'%B %e, %Y' }</td><td>March 12, 1992</td></tr>"," <tr><td>`isoDate`</td><td>{ format:'%F'}</td><td>1992-03-12</td></tr>"," <tr><td>`isoDateTime`</td><td>{ format:'%FT%T'}</td><td>1992-03-12T22:11:07</td></tr>"," </table>",""," ####Replaceable Hash"," This utility can also replace the cell value with values from a data hash (i.e. JS simple object, consisting of key:value pairs)."," Access to this capability is by providing a `formatter` as any string not-recognizable in the `formatStrings` object"," **AND** by providing a `formatConfig` object (equal to the hash) in the column definition.",""," ####User-Defined `formatStrings`"," Implementers may add their own \"named\" formatting strings for their own use-cases simply by adding more named formatters to"," the `formatStrings` object as;","","	Y.DataTable.Formatters.formatStrings['myNumberFmtr'] = {","		type:'number',","		formatConfig:{ thousandsSeparator:'x', decimalPlaces:11 }","	};","	Y.DataTable.Formatters.formatStrings['myDateFmtr'] = {","		type:'date',","		formatConfig:{ format:{ \"At the tone the TIME will be %T\" }","	};","",""," @module gallery-datatable-formatters"," @class Y.DataTable.Formatters"," @extends DataTable"," @since 3.6.0"," **/","Y.DataTable.Formatters = {","","    /**","     Object containing referenceable format strings","     @property formatStrings","     @public","     **/","    formatStrings: {","","        general:   { type:'number', formatConfig:{ decimalPlaces:0 } },","        general2:  { type:'number', formatConfig:{ decimalPlaces:2 } },","        currency:  { type:'number', formatConfig:{ prefix:'$', decimalPlaces:0, thousandsSeparator:',' } },","        currency2: { type:'number', formatConfig:{ prefix:'$', decimalPlaces:2, thousandsSeparator:',' } },","        currency3: { type:'number', formatConfig:{ prefix:'$', decimalPlaces:3, thousandsSeparator:',' } },","        comma:     { type:'number', formatConfig:{ decimalPlaces:0, thousandsSeparator:','} },","        comma2:    { type:'number', formatConfig:{ decimalPlaces:2, thousandsSeparator:',' } },","        comma3:    { type:'number', formatConfig:{ decimalPlaces:3, thousandsSeparator:',' } },","","        shortDate: { type:'date',  formatConfig:{ format:'%D' } },","        longDate:  { type:'date',  formatConfig:{ format:'%m/%d/%Y' } },","        fullDate:  { type:'date',  formatConfig:{ format:'%B %e, %Y' } },","        isoDate:   { type:'date',  formatConfig:{ format:'%F'} },","        isoDateTime:  { type:'date',  formatConfig:{ format:'%FT%T'} },","","        'array' :  { type:'array', formatConfig:{ value:'value', text:'text'} },","        'object' : { type:'object', formatConfig:null },","        hash :     { type:'hash', formatConfig:null },","","      //  link : { type:'html', formatConfig:{}},  // incomplete","","        'default': {}","","    },","","    /**","     * Formatter function called that executes a standard \"named\" formatter defined by `fmtrName`.","     * The parameter `fmtrName` maps to a member of the \"formatStrings\" object, that includes a type","     * declaration and a formatConfig string to be substituted in the DataType.Number.format or Date.format","     * function.","     *","     * @method namedFormatter","     * @param {String} fmtrName Name of formatter object from \"formatStrings\", i.e. \"currency2\", \"fullDate\"","     * @param {Object} o The passed-in column formatter object","     * @return {Mixed} value","     */","    namedFormatter: function(fmtrName,o) {","        var fmtObj  =  Y.DataTable.Formatters.formatStrings[fmtrName] || null,","            fmtOptions = o.column.formatOptions || o.column.formatConfig,","            value   = o.value,","            fmtType,fmtConf,akey,aval,isStr,kl;","","        //","        //  Pre-process the entered 'formatConfig' or 'formatOptions' column properties","        //","        fmtType = o.column.type || ( (fmtObj) ? fmtObj.type : null );","        if(!fmtType) {","            fmtType = (fmtOptions && fmtOptions.type) ? fmtOptions.type : null;","        }","        fmtConf = o.column.formatConfig || ( (fmtObj) ? fmtObj.formatConfig : null);","","        //","        //  Switch over the formatter \"type\"","        //","        if(fmtType) {","            switch(fmtType) {","                case 'date':","                    value = Y.DataType.Date.format(o.value,fmtConf);","                    break;","","                case 'number':","                    value = Y.DataType.Number.format(o.value,fmtConf);","                    break;","","                case 'array':","                    akey = (fmtConf) ? fmtConf.value : 'value';","                    aval = (fmtConf) ? fmtConf.text : 'text';","","                    Y.Array.each(fmtOptions,function(r){","                        if( r[akey] === o.value ) {","                            value = r[aval];","                        }","                    });","                    break;","","                case 'object':","                case 'hash':","                    isStr = Y.Lang.isString(o.value);","                    Y.Object.each(fmtOptions,function(v,k){","                        kl = (isStr) ? k : (+k);","                        if( kl === o.value ) {","                            value = v;","                        }","                    });","                    break;","","            }","        }","","        return value;","    }","","","};","","/**"," Override of method _createRowHTML from DataTable.BodyView extended to permit use of named"," formatter functions from Y.DataTable.Formatters.",""," Additional functionality was added to facilitate using a template approach for {o.value} within"," the column, by using Y.Lang.sub (as fromTemplate) with the replacement object hash provided"," as column configuration \"formatConfig\" (o.column.formatConfig).",""," @method Y.DataTable.BodyView._createRowHTML"," @param model"," @param index"," @param columns"," @return {*}"," @private"," **/","Y.DataTable.BodyView.prototype._createRowHTML = function (model, index, columns) {","    var Lang         = Y.Lang,","        isArray      = Lang.isArray,","        isNumber     = Lang.isNumber,","        isString     = Lang.isString,","        fromTemplate = Lang.sub,","        htmlEscape   = Y.Escape.html,","        toArray      = Y.Array,","        bind         = Y.bind,","        YObject      = Y.Object;","","    var data     = model.toJSON(),","        clientId = model.get('clientId'),","        values   = {","            rowId   : this._getRowId(clientId),","            clientId: clientId,","            rowClass: (index % 2) ? this.CLASS_ODD : this.CLASS_EVEN","        },","        host = this.host || this,","        i, len, col, token, value, formatterData;","","    for (i = 0, len = columns.length; i < len; ++i) {","        col   = columns[i];","        value = data[col.key];","        token = col._id || col.key;","","        values[token + '-className'] = '';","","        if (col.formatter) {","            formatterData = {","                value    : value,","                data     : data,","                column   : col,","                record   : model,","                className: '',","                rowClass : '',","                rowIndex : index","            };","","            if (typeof col.formatter === 'string') {","                if (value !== undefined) {","                    // TODO: look for known formatters by string name","","                // ADDED: by T. Smith, following for named formatters ... i.e. {key:'foo', formatter:'comma2' ...}","                    if ( Y.DataTable.Formatters.namedFormatter && Y.DataTable.Formatters.formatStrings[col.formatter] ) {","                        value = Y.DataTable.Formatters.namedFormatter.call(host,col.formatter,formatterData);","                    } else if ( col.formatConfig ) {    // do string replacement of values from col.formatConfig","                        value = fromTemplate(\"{\" + value + \"}\", col.formatConfig );","                    } else {","                        value = fromTemplate(col.formatter, formatterData);","                    }","                }","            } else {","                // Formatters can either return a value","                value = col.formatter.call(host, formatterData);","","                // or update the value property of the data obj passed","                if (value === undefined) {","                    value = formatterData.value;","                }","","                values[token + '-className'] = formatterData.className;","                values.rowClass += ' ' + formatterData.rowClass;","            }","        }","","        if (value === undefined || value === null || value === '') {","            value = col.emptyCellValue || '';","        }","","        values[token] = col.allowHTML ? value : htmlEscape(value);","","        values.rowClass = values.rowClass.replace(/\\s+/g, ' ');","    }","","    return fromTemplate(this._rowTemplate, values);","};","","","","}, '@VERSION@', {","    \"supersedes\": [","        \"\"","    ],","    \"requires\": [","        \"datatype-date-format\",","        \"datatype-number-format\",","        \"datatable-base\"","    ],","    \"optional\": [","        \"\"","    ]","});"];
_yuitest_coverage["build/gallery-datatable-formatters/gallery-datatable-formatters.js"].lines = {"1":0,"78":0,"124":0,"132":0,"133":0,"134":0,"136":0,"141":0,"142":0,"144":0,"145":0,"148":0,"149":0,"152":0,"153":0,"155":0,"156":0,"157":0,"160":0,"164":0,"165":0,"166":0,"167":0,"168":0,"171":0,"176":0,"197":0,"198":0,"208":0,"218":0,"219":0,"220":0,"221":0,"223":0,"225":0,"226":0,"236":0,"237":0,"241":0,"242":0,"243":0,"244":0,"246":0,"251":0,"254":0,"255":0,"258":0,"259":0,"263":0,"264":0,"267":0,"269":0,"272":0};
_yuitest_coverage["build/gallery-datatable-formatters/gallery-datatable-formatters.js"].functions = {"(anonymous 2):155":0,"(anonymous 3):165":0,"namedFormatter:123":0,"_createRowHTML:197":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-datatable-formatters/gallery-datatable-formatters.js"].coveredLines = 53;
_yuitest_coverage["build/gallery-datatable-formatters/gallery-datatable-formatters.js"].coveredFunctions = 5;
_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 1);
YUI.add('gallery-datatable-formatters', function (Y, NAME) {

/**
 Define a "named" Column Formatters object and attach it to the Y.DataTable namespace.
 The named formatters are defined as a series of format strings that are typically used by the
 data formatting function Y.DataType.Number.format and Y.DataType.Date.format.

 The function [`namedFormatter`](#method_namedFormatter) is defined that can be used to call as a column formatter which
 formats the column cell using the [`formatStrings`](#property_formatStrings) object.

 This module includes an override of the [Y.DataTable.BodyView._createRowHTML](#method_Y.DataTable.BodyView._createRowHTML) method.
 Therefore implementers shouldn't call the `namedFormatter` method directly because the overridden method handles the call if the
 entered formatter string name is recognized.

 ###Usage
 The format string names can be used in a column configuration object as follows;

		var dt1 = new Y.DataTable({
            data: some_data,
            columns: [
                { key:"start_date", label:"Start", formatter:"fullDate" },
                { key:"end_date", label:"End", formatter:"default", 
                  formatOptions:{ type:'date', formatConfig:{ format:'%F' } } },
                { key:"qty", label:"Inventory Qty", formatter:"comma" },
                { key:"cost", label:"Carried Cost", formatter:"currency",
                  formatConfig:{ prefix:'£', thousandsSeparator:","} }
    	    ]
		}).render();

 ####Pre-Defined `formatStrings` settings; (specifically, Y.DataTable.Formatters.formatStrings)
 For "number" formatting, using [Y.DataType.Number](http://yuilibrary.com/yui/docs/api/classes/DataType.Number.html#method_format).

 <table><tr><th>string</th><th>Formatter Object</th><th>Formatted Example</th></tr>
 <tr><td>`general`</td><td>{ decimalPlaces:0 }</td><td>123457</td></tr>
 <tr><td>`general2`</td><td>{ decimalPlaces:2 }</td><td>123456.79</td></tr>
 <tr><td>`currency`</td><td>{ prefix:'$', decimalPlaces:0, thousandsSeparator:',' }</td><td>$ 123,457</td></tr>
 <tr><td>`currency2`</td><td>{ prefix:'$', decimalPlaces:2, thousandsSeparator:',' }</td><td>$ 123,456.78</td></tr>
 <tr><td>`currency3`</td><td>{ prefix:'$', decimalPlaces:3, thousandsSeparator:',' }</td><td>$ 123,457.789</td></tr>
 <tr><td>`comma`</td><td>{ decimalPlaces:0, thousandsSeparator:','}</td><td>123,457</td></tr>
 <tr><td>`comma2`</td><td>{ decimalPlaces:2, thousandsSeparator:','}</td><td>123,456.78</td></tr>
 <tr><td>`comma3`</td><td>{ decimalPlaces:3, thousandsSeparator:','}</td><td>123,457.789</td></tr>
 </table>

 For "date" formatting, using [Y.DataType.Date](http://yuilibrary.com/yui/docs/api/classes/DataType.Date.html#method_format).
 <br/>(Please refer to the Date.format method above for the proper use of "strftime" format strings)
 <table><tr><th>string</th><th>Formatter Object</th><th>Formatted Example</th></tr>
 <tr><td>`shortDate`</td><td>{ format:'%D' }</td><td>03/12/92</td></tr>
 <tr><td>`longDate`</td><td>{ format:'%m/%d/%Y' }</td><td>03/12/1992</td></tr>
 <tr><td>`fullDate`</td><td>{ format:'%B %e, %Y' }</td><td>March 12, 1992</td></tr>
 <tr><td>`isoDate`</td><td>{ format:'%F'}</td><td>1992-03-12</td></tr>
 <tr><td>`isoDateTime`</td><td>{ format:'%FT%T'}</td><td>1992-03-12T22:11:07</td></tr>
 </table>

 ####Replaceable Hash
 This utility can also replace the cell value with values from a data hash (i.e. JS simple object, consisting of key:value pairs).
 Access to this capability is by providing a `formatter` as any string not-recognizable in the `formatStrings` object
 **AND** by providing a `formatConfig` object (equal to the hash) in the column definition.

 ####User-Defined `formatStrings`
 Implementers may add their own "named" formatting strings for their own use-cases simply by adding more named formatters to
 the `formatStrings` object as;

	Y.DataTable.Formatters.formatStrings['myNumberFmtr'] = {
		type:'number',
		formatConfig:{ thousandsSeparator:'x', decimalPlaces:11 }
	};
	Y.DataTable.Formatters.formatStrings['myDateFmtr'] = {
		type:'date',
		formatConfig:{ format:{ "At the tone the TIME will be %T" }
	};


 @module gallery-datatable-formatters
 @class Y.DataTable.Formatters
 @extends DataTable
 @since 3.6.0
 **/
_yuitest_coverfunc("build/gallery-datatable-formatters/gallery-datatable-formatters.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 78);
Y.DataTable.Formatters = {

    /**
     Object containing referenceable format strings
     @property formatStrings
     @public
     **/
    formatStrings: {

        general:   { type:'number', formatConfig:{ decimalPlaces:0 } },
        general2:  { type:'number', formatConfig:{ decimalPlaces:2 } },
        currency:  { type:'number', formatConfig:{ prefix:'$', decimalPlaces:0, thousandsSeparator:',' } },
        currency2: { type:'number', formatConfig:{ prefix:'$', decimalPlaces:2, thousandsSeparator:',' } },
        currency3: { type:'number', formatConfig:{ prefix:'$', decimalPlaces:3, thousandsSeparator:',' } },
        comma:     { type:'number', formatConfig:{ decimalPlaces:0, thousandsSeparator:','} },
        comma2:    { type:'number', formatConfig:{ decimalPlaces:2, thousandsSeparator:',' } },
        comma3:    { type:'number', formatConfig:{ decimalPlaces:3, thousandsSeparator:',' } },

        shortDate: { type:'date',  formatConfig:{ format:'%D' } },
        longDate:  { type:'date',  formatConfig:{ format:'%m/%d/%Y' } },
        fullDate:  { type:'date',  formatConfig:{ format:'%B %e, %Y' } },
        isoDate:   { type:'date',  formatConfig:{ format:'%F'} },
        isoDateTime:  { type:'date',  formatConfig:{ format:'%FT%T'} },

        'array' :  { type:'array', formatConfig:{ value:'value', text:'text'} },
        'object' : { type:'object', formatConfig:null },
        hash :     { type:'hash', formatConfig:null },

      //  link : { type:'html', formatConfig:{}},  // incomplete

        'default': {}

    },

    /**
     * Formatter function called that executes a standard "named" formatter defined by `fmtrName`.
     * The parameter `fmtrName` maps to a member of the "formatStrings" object, that includes a type
     * declaration and a formatConfig string to be substituted in the DataType.Number.format or Date.format
     * function.
     *
     * @method namedFormatter
     * @param {String} fmtrName Name of formatter object from "formatStrings", i.e. "currency2", "fullDate"
     * @param {Object} o The passed-in column formatter object
     * @return {Mixed} value
     */
    namedFormatter: function(fmtrName,o) {
        _yuitest_coverfunc("build/gallery-datatable-formatters/gallery-datatable-formatters.js", "namedFormatter", 123);
_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 124);
var fmtObj  =  Y.DataTable.Formatters.formatStrings[fmtrName] || null,
            fmtOptions = o.column.formatOptions || o.column.formatConfig,
            value   = o.value,
            fmtType,fmtConf,akey,aval,isStr,kl;

        //
        //  Pre-process the entered 'formatConfig' or 'formatOptions' column properties
        //
        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 132);
fmtType = o.column.type || ( (fmtObj) ? fmtObj.type : null );
        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 133);
if(!fmtType) {
            _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 134);
fmtType = (fmtOptions && fmtOptions.type) ? fmtOptions.type : null;
        }
        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 136);
fmtConf = o.column.formatConfig || ( (fmtObj) ? fmtObj.formatConfig : null);

        //
        //  Switch over the formatter "type"
        //
        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 141);
if(fmtType) {
            _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 142);
switch(fmtType) {
                case 'date':
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 144);
value = Y.DataType.Date.format(o.value,fmtConf);
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 145);
break;

                case 'number':
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 148);
value = Y.DataType.Number.format(o.value,fmtConf);
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 149);
break;

                case 'array':
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 152);
akey = (fmtConf) ? fmtConf.value : 'value';
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 153);
aval = (fmtConf) ? fmtConf.text : 'text';

                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 155);
Y.Array.each(fmtOptions,function(r){
                        _yuitest_coverfunc("build/gallery-datatable-formatters/gallery-datatable-formatters.js", "(anonymous 2)", 155);
_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 156);
if( r[akey] === o.value ) {
                            _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 157);
value = r[aval];
                        }
                    });
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 160);
break;

                case 'object':
                case 'hash':
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 164);
isStr = Y.Lang.isString(o.value);
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 165);
Y.Object.each(fmtOptions,function(v,k){
                        _yuitest_coverfunc("build/gallery-datatable-formatters/gallery-datatable-formatters.js", "(anonymous 3)", 165);
_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 166);
kl = (isStr) ? k : (+k);
                        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 167);
if( kl === o.value ) {
                            _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 168);
value = v;
                        }
                    });
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 171);
break;

            }
        }

        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 176);
return value;
    }


};

/**
 Override of method _createRowHTML from DataTable.BodyView extended to permit use of named
 formatter functions from Y.DataTable.Formatters.

 Additional functionality was added to facilitate using a template approach for {o.value} within
 the column, by using Y.Lang.sub (as fromTemplate) with the replacement object hash provided
 as column configuration "formatConfig" (o.column.formatConfig).

 @method Y.DataTable.BodyView._createRowHTML
 @param model
 @param index
 @param columns
 @return {*}
 @private
 **/
_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 197);
Y.DataTable.BodyView.prototype._createRowHTML = function (model, index, columns) {
    _yuitest_coverfunc("build/gallery-datatable-formatters/gallery-datatable-formatters.js", "_createRowHTML", 197);
_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 198);
var Lang         = Y.Lang,
        isArray      = Lang.isArray,
        isNumber     = Lang.isNumber,
        isString     = Lang.isString,
        fromTemplate = Lang.sub,
        htmlEscape   = Y.Escape.html,
        toArray      = Y.Array,
        bind         = Y.bind,
        YObject      = Y.Object;

    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 208);
var data     = model.toJSON(),
        clientId = model.get('clientId'),
        values   = {
            rowId   : this._getRowId(clientId),
            clientId: clientId,
            rowClass: (index % 2) ? this.CLASS_ODD : this.CLASS_EVEN
        },
        host = this.host || this,
        i, len, col, token, value, formatterData;

    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 218);
for (i = 0, len = columns.length; i < len; ++i) {
        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 219);
col   = columns[i];
        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 220);
value = data[col.key];
        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 221);
token = col._id || col.key;

        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 223);
values[token + '-className'] = '';

        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 225);
if (col.formatter) {
            _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 226);
formatterData = {
                value    : value,
                data     : data,
                column   : col,
                record   : model,
                className: '',
                rowClass : '',
                rowIndex : index
            };

            _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 236);
if (typeof col.formatter === 'string') {
                _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 237);
if (value !== undefined) {
                    // TODO: look for known formatters by string name

                // ADDED: by T. Smith, following for named formatters ... i.e. {key:'foo', formatter:'comma2' ...}
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 241);
if ( Y.DataTable.Formatters.namedFormatter && Y.DataTable.Formatters.formatStrings[col.formatter] ) {
                        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 242);
value = Y.DataTable.Formatters.namedFormatter.call(host,col.formatter,formatterData);
                    } else {_yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 243);
if ( col.formatConfig ) {    // do string replacement of values from col.formatConfig
                        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 244);
value = fromTemplate("{" + value + "}", col.formatConfig );
                    } else {
                        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 246);
value = fromTemplate(col.formatter, formatterData);
                    }}
                }
            } else {
                // Formatters can either return a value
                _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 251);
value = col.formatter.call(host, formatterData);

                // or update the value property of the data obj passed
                _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 254);
if (value === undefined) {
                    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 255);
value = formatterData.value;
                }

                _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 258);
values[token + '-className'] = formatterData.className;
                _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 259);
values.rowClass += ' ' + formatterData.rowClass;
            }
        }

        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 263);
if (value === undefined || value === null || value === '') {
            _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 264);
value = col.emptyCellValue || '';
        }

        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 267);
values[token] = col.allowHTML ? value : htmlEscape(value);

        _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 269);
values.rowClass = values.rowClass.replace(/\s+/g, ' ');
    }

    _yuitest_coverline("build/gallery-datatable-formatters/gallery-datatable-formatters.js", 272);
return fromTemplate(this._rowTemplate, values);
};



}, '@VERSION@', {
    "supersedes": [
        ""
    ],
    "requires": [
        "datatype-date-format",
        "datatype-number-format",
        "datatable-base"
    ],
    "optional": [
        ""
    ]
});
