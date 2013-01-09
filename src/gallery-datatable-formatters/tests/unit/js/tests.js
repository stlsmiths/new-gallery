YUI.add('module-tests-dtformatters', function(Y) {

    var suite = new Y.Test.Suite('gallery-datatable-formatters'),
        Assert = Y.Test.Assert;

    function makeDT() {

        var jsData = [
          { em_id: 47,  emarried:0, ecurrent:false, estatus:1, ename:'George Costanza', estart_date:new Date(1998,10,25,0,0,0), esalary: 45000.0, size:'S' },
          { em_id: 31,  emarried:1, ecurrent:false, estatus:2, ename:'John Watson', estart_date:new Date(1984,05,17,0,0,0), esalary: 7800.51, size:'M' },
          { em_id: 129, emarried:0, ecurrent:true,  estatus:3, ename:'Jesse Pinkman',  estart_date:new Date(2009,06,29), esalary: 638000.0, size:'L' },
          { em_id: 41,  emarried:0, ecurrent:true,  estatus:4, ename:'Gilligan',  estart_date:new Date(1966,11,03), esalary: 13000.4, size:'S' },
          { em_id: 17,  emarried:1, ecurrent:false, estatus:5, ename:'Mordred', estart_date:new Date(1969,01,06), esalary: 9007.82, size:'M' },
          { em_id: 741, emarried:0, ecurrent:false, estatus:0, ename:'Astro the Dog', estart_date:new Date(1962,3,05), esalary: 40.0, size:'L' },
          { em_id: 666, emarried:1, ecurrent:true,  estatus:3, ename:'Nick Cheney', estart_date:new Date(2009,01,20), esalary: 230700.0, size:'Z' }
        ];

    //
    //  Define a custom status code hash ... used on column "estatus"
    //
        var estatusCodes = {
            0: "Unknown",
            1: "Furloughed",
            2: "Sick Leave",
            3: "TDY",
            4: "Field Office",
            5: "Headquarters"
        };

        var estatusCodesBasic = [
            { value:1, text:"Furloughed" },
            { value:2, text:"Sick Leave" },
            { value:3, text:"TDY" },
            { value:4, text:"Field Office" },
            { value:0, text:"Unknown" },
            { value:5, text:"Headquarters" }
        ];

        var estatusCodesComplex = [
            {foo:1,  bar:"Furloughed" },
            {foo:0,  bar:"Unknown" },
            {foo:2,  bar:"Sick Leave" },
            {foo:3,  bar:"TDY" },
            {foo:4,  bar:"Field Office" },
            {foo:5,  bar:"Headquarters" }
        ];

        var sizeHash = {
            S: 'Small', M:'Medium', L:'Large', XL:'XLarge'
        };

        // add a "named" formatter to the standard names ...
        Y.DataTable.Formatters.formatStrings['sterling'] = {type:'number', formatConfig:{ prefix:'£', thousandsSeparator:","} };
    //
    //  Define columns for a "formatted" DataTable, using custom format codes ...
    //
        var cols = [
            { key:"em_id", label:'em_id' },  // 0

            { key:"estart_date", label:'estart_date<br/>"shortDate"', formatter:"shortDate" },  // 1
            { key:"estart_date", label:'estart_date<br/>"longDate"', formatter:"longDate" },    // 2
            { key:"estart_date", label:'estart_date<br/>"fullDate"', formatter:"fullDate" },    // 3
            { key:"estart_date", label:'estart_date<br/>(custom)',
                formatter:"default",  formatOptions:{ type:'date',  formatConfig:{ format:'%F' } } // 4
             },

            { key:"esalary", label:'esalary<br/>"currency"', formatter:"currency" },  // 5
            { key:"esalary", label:'esalary<br/>"general2"', formatter:"general2" },  // 6
            { key:"esalary", label:'esalary<br/>(custom)', formatter:"currency", formatConfig:{ prefix:'£', thousandsSeparator:","} }, // 7
            { key:"esalary", label:'esalary<br/>(custom)', formatter:"sterling" },  // 8

            { key:"estatus", label:"estatus<br/>(custom)", formatter:"custom", formatConfig:estatusCodes  },  // 9
            { key:"estatus", label:"estatus<br/>(array)", formatter:"array", formatOptions:estatusCodesBasic  }, // 10
            { key:"estatus", label:"estatus<br/>(hash)", formatter:"hash", formatOptions:estatusCodes  },  // 11
            { key:"estatus", label:"estatus<br/>(array complex)",
                formatter:"array", formatOptions:estatusCodesComplex , formatConfig: { value:'foo', text:'bar' }  // 12
            },

            { key:"emarried", label:"emarried<br/>(custom)", formatter:"custom", formatConfig:{ 0:"No", 1:"Yes"}  },  // 13
            { key:"emarried", label:"emarried<br/>(object)", formatter:"object", formatConfig:{ 0:"No", 1:"Yes"}  },  // 14

            { key:"ecurrent", label:"ecurrent<br/>(custom)", formatter:"custom", formatConfig:{ 'true':"Current", 'false':"No"}  }, // 15
            { key:"ecurrent", label:"ecurrent<br/>(hash)", formatter:"truefalse", formatConfig:{ 'true':"Current", 'false':"No"}  }, // 16

            {key:'size', label:'Size (hash)', formatter:'hash', formatConfig:sizeHash }  // 17

        ];

    //
    // Create the DataTable and render it
    //
        var myDTf = new Y.DataTable({
            columns:	cols,
            data:		jsData
        }).render("#dtable");

        return {
            dt: myDTf,
            hash: estatusCodes,
            'array' : estatusCodesBasic,
            arrayc : estatusCodesComplex,
            shash: sizeHash
        };
    }

    suite.add(new Y.Test.Case({
        name: 'Gallery DataTable-Formatters : basic setup and instance',

        setUp : function () {
            // cols
            // {sid: sname: sdesc: sopen:0, stype:0, stock:0, sprice:, shipst:'s', sdate: },
            var robj = makeDT();
            this.robj = robj;
            this.dt = robj.dt;
            this.tbody = this.dt.get('contentBox').one('.'+this.dt.getClassName('data'));
            this.trs = this.tbody.all('tr');

        },

        tearDown : function () {
            this.dt.destroy();
            delete this.dt;
            delete this.robj;
        },

        'should be an Object': function() {
            Assert.isObject(Y.DataTable.Formatters);
        },

        'formatter namedFunction should be a function': function() {
            Assert.isFunction(Y.DataTable.Formatters.namedFormatter);
        },

        'check formatted cols - dates': function() {
            var dt = this.dt,
            	tb =  this.tbody,//dt.get('contentBox').one('.'+dt.getClassName('data')),
            	trs = this.trs;  // tb.all('tr');

            Assert.isFunction(Y.DataTable.Formatters.namedFormatter);

            Assert.areSame('11/25/98', trs.item(0).all('td').item(1).getHTML());
            Assert.areSame('11/25/1998', trs.item(0).all('td').item(2).getHTML());
            Assert.areSame('November 25, 1998', trs.item(0).all('td').item(3).getHTML());
            Assert.areSame('1998-11-25', trs.item(0).all('td').item(4).getHTML());
        },

        'check formatted cols - number': function() {
            var dt = this.dt,
            	tb =  this.tbody,
            	trs = this.trs,
            	tds0 = trs.item(0).all('td');  

            Assert.areSame('$45,000', tds0.item(5).getHTML());
            Assert.areSame('45000.00', tds0.item(6).getHTML());
            Assert.areSame('£45,000', tds0.item(7).getHTML());
            Assert.areSame('£45,000', tds0.item(8).getHTML());
        },

        'check formatted cols - array': function() {
            var dt = this.dt,
            	tb =  this.tbody,
            	trs = this.trs,
            	tds0 = trs.item(0).all('td');  

            Assert.areSame('Furloughed', tds0.item(9).getHTML());
            Assert.areSame('Furloughed', tds0.item(10).getHTML());
            Assert.areSame('Furloughed', tds0.item(11).getHTML());
            Assert.areSame('Furloughed', tds0.item(12).getHTML());

            // check for data match	
            Assert.areSame(1,dt.data.item(0).get('estatus'));

            // change the data, see if formatted changes
            dt.data.item(0).set('estatus',0);
            Assert.areSame('Unknown', tb.all('tr').item(0).all('td').item(9).getHTML());
            dt.data.item(0).set('estatus',5);
            Assert.areSame('Headquarters', tb.all('tr').item(0).all('td').item(9).getHTML());
        },

        'check formatted cols - hash 0/1': function() {
            var dt = this.dt,
            	tb =  this.tbody,
            	trs = this.trs,
            	tds5 = trs.item(5).all('td'),
            	tds6 = trs.item(6).all('td');  

            Assert.areSame('No', tds5.item(13).getHTML());
            Assert.areSame('No', tds5.item(14).getHTML());

            // check for data match	
            Assert.areSame(0,dt.data.item(5).get('emarried'));

            // change the data, see if formatted changes
            dt.data.item(5).set('emarried',1);
            Assert.areSame('Yes', tb.all('tr').item(5).all('td').item(13).getHTML());
            Assert.areSame('Yes', tb.all('tr').item(5).all('td').item(14).getHTML());

        },

        'check formatted cols - hash t/f': function() {
            var dt = this.dt,
            	tb =  this.tbody,
            	trs = this.trs,
            	tds5 = trs.item(5).all('td'),
            	tds6 = trs.item(6).all('td');  

            Assert.areSame('No', tds5.item(15).getHTML());
            Assert.areSame('No', tds5.item(16).getHTML());

            // check for data match	
            Assert.isFalse(dt.data.item(5).get('ecurrent'));

            // change the data, see if formatted changes
            dt.data.item(5).set('ecurrent',true);
            Assert.areSame('Current', tb.all('tr').item(5).all('td').item(15).getHTML());
            Assert.areSame('Current', tb.all('tr').item(5).all('td').item(16).getHTML());
        },

        'check formatted cols - hash with unknown match': function() {
            var dt = this.dt,
            	tb =  this.tbody,
            	trs = this.trs,
            	tds5 = trs.item(5).all('td'),
            	tds6 = trs.item(6).all('td');  

            Assert.areSame('Large', tds5.item(17).getHTML());
            Assert.areSame('Z', tds6.item(17).getHTML());

            // check for data match	
            Assert.areSame('L',dt.data.item(5).get('size'));
            Assert.areSame('Z',dt.data.item(6).get('size'));

            // change the data, see if formatted changes
            dt.data.item(6).set('size','S');
            Assert.areSame('Small', tb.all('tr').item(6).all('td').item(17).getHTML());

        }

    }));

    Y.Test.Runner.add(suite);


},'', { requires: [ 'test' ] });
