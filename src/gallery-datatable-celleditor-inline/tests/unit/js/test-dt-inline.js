YUI.add('module-tests-dtinline', function(Y) {

    var suite = new Y.Test.Suite('gallery-datatable-celleditor-inline'),
        Assert = Y.Test.Assert;

    function makeDT( colChoice, config_arg ) {
        config_arg = config_arg || {};

        var someData = [
            {sid:10, sname:'Sneakers', sopen:0, stype:0, stock:0, sprice:59.93, shipst:'s', sdate:new Date(2009,3,11) },
            {sid:11, sname:'Varnished Cane Toads', sopen:1,  stype:10, stock:2, shipst:'u', sprice:17.49, sdate:new Date(2009,4,12) },
            {sid:12, sname:'JuJu Beans', sopen:0,  stype:20, stock:1, sprice:1.29, shipst:'s', sdate:new Date(2009,5,13) },
            {sid:13, sname:'Tent Stakes', sopen:1,  stype:30, stock:1, sprice:7.99, shipst:'n', sdate:new Date(2010,6,14) },
            {sid:14, sname:'Peanut Butter', sopen:0,  stype:40, stock:0, sprice:3.29, shipst:'e', sdate:new Date(2011,7,15) },
            {sid:15, sname:'Garbage Bags', sopen:1, stype:50,  stock:2, sprice:17.95, shipst:'r', sdate:new Date(2012,8,18) }
        ];

        // enlarge the dataset
        Y.Array.each(someData,function(d,di){
            d.sdesc = 'Description for Item ' + d.sid + ' : ' + d.sname;
        });
     //   someData = someData.concat(someData,someData);

        //
        // Define some Arrays / Object Hashes to be used by formatters / editor options ...
        //
        var stypes = [
            {value:0,  text:'Standard'},
            {value:10, text:'Improved'},
            {value:20, text:'Deluxe'},
            {value:30, text:'Better'},
            {value:40, text:'Subpar'},
            {value:50, text:'Junk'}
        ];

        var shipTypes = { s:'Shipped', u:'Unknown', n:'Not Shipped', e:'Expedited', r:'Returned' };

        var stypesObj = {};
        Y.Array.each(stypes,function(r){
            stypesObj[r.value] = r.text;
        });

        var stock = { 0:'No ', 1:'Yes ', 2:'B/O ' };
        var sopen = { 0:'No', 1:'Yes'};

    //
    // We use pre-named editors on the "editor" property of the Columns,
    //   in some cases, editorConfig are added to provide stuff to pass to the editor Instance ...

       var colsNoediting = [
            { key:'sid',  editable:false },
            { key:'sopen' },
            { key:'sname' },
            { key:'sdesc' },
            { key:'stype' },
            { key:'stock' },
            { key:'sprice' },
            { key:'sdate' }
        ];

        //var cols = [ colsNoediting, colsBasicEditing, colsEditing ];

        var basic_config = {
            columns: colsNoediting,
            data:    someData,
            defaultEditor:  'inline',
            editOpenType:   'click',
            editable:       true
        };

        var dt = new Y.DataTable(Y.merge(basic_config,config_arg)).render('#dtable');

        return dt;
    }


    suite.add(new Y.Test.Case({
        name: 'Gallery DataTable-Celleditor-Inline : basic setup and configuration of inlines',

        setUp : function () {
            // {sid: sname: sdesc: sopen:0, stype:0, stock:0, sprice:, shipst:'s', sdate: },
            this.dt = makeDT(0);
        },

        tearDown : function () {
            if(this.dt) {
                this.dt.destroy();
                delete this.dt;
            }
        },

        'should be a class': function() {
            Assert.isFunction(Y.DataTable.Editable);
        },

        'each inline should be an object': function() {
            Assert.isObject(Y.DataTable.EditorOptions);
            Assert.isObject(Y.DataTable.EditorOptions.inline);
            Assert.isObject(Y.DataTable.EditorOptions.inlineNumber);
            Assert.isObject(Y.DataTable.EditorOptions.inlineDate);
            Assert.isObject(Y.DataTable.EditorOptions.inlineAC);
        },

        'inline editor should be a View': function() {
            var dt = this.dt,
                ce = dt.getCellEditor('sopen');

            Assert.isInstanceOf( Y.View, ce, 'editor is not an instanceof Y.View');
        },


        'check ATTR defaults' : function(){

        },

        'check destructor' : function(){
            var dt = this.dt,
                ce = dt.getCellEditor('sopen');

            ce.destroy();

            Assert.isNull(ce._subscr,'subscribers should be null');

        }

    }));


    suite.add(new Y.Test.Case({
        name: 'Gallery DataTable-Celleditor-Inline : basic functioning of the editor',

        setUp : function () {
            // {sid: sname: sdesc: sopen:0, stype:0, stock:0, sprice:, shipst:'s', sdate: },
            this.dt = makeDT(0);

        },

        tearDown : function () {
            if(this.dt) {
                this.dt.destroy();
                delete this.dt;
            }
        },

        'check editor counts' : function(){
            var dt = this.dt;

            Assert.isTrue( dt.get('editable'), "set editable to true" );

            var ces = dt.getCellEditors();
            Assert.areSame(7, ces.length, 'there should be 7 cell editors');

            Assert.isNull( dt.getCellEditor('sid'),'column 0 (sid) editor should be null');
            Assert.areSame( 'inline', dt.getCellEditor('sopen').get('name'),'column 1 (sopen) editor name should be inline');

        },

        'check inline editor - row 0 column 6 (sprice)' : function(){
            var dt = this.dt,
                tr0 = dt.getRow(0),
                td6 = tr0.all('td').item(6),
                oe,val,inp;

            // open the editor
            td6.simulate('click');
            oe = dt._openEditor;
            Assert.isTrue(oe.get('visible'),'cell editor col 6 should be visible');

            // hideEditor
            oe.hideEditor();
            Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');
            Assert.isFalse(dt.getCellEditor('sprice').get('visible'),'cell editor col 1 should be closed');

            // showEditor
            oe.showEditor(td6);
            inp = oe._inputNode;

            // ESC cancelEditor
            td6.simulate('click');
            //inp.focus();
            inp.simulate('keypress',{charCode:72}); //  4:52     H:72   i:105
            inp.simulate('keypress',{charCode:52}); //  4:52     H:72   i:105
            inp.simulate('keydown',{keyCode:27});
            Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');
            Assert.isFalse(dt.getCellEditor('sprice').get('visible'),'cell editor col 1 should be closed');

            // cancelEditor
            td6.simulate('click');
            oe = dt._openEditor;
            oe.cancelEditor();
            Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');
            Assert.isFalse(dt.getCellEditor('sprice').get('visible'),'cell editor col 1 should be closed');

            // saveEditor
            td6.simulate('click');
            oe = dt._openEditor;
            oe.saveEditor('abcdefg');
            Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');
            Assert.areSame('abcdefg', oe.get('value'),'after save lastvalue should be abcdefg');
            Assert.areSame(59.93, oe.get('lastValue'),'after save lastvalue should be 59.93');


            // saveEditor with undefined
            //oe.saveEditor(undefined);
            //Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');
            //Assert.areSame('abcdefg', oe.get('value'),'after save lastvalue should be abcdefg');

            td6.simulate('click');
            oe = dt._openEditor;
            oe.hideEditor(true);
            Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');
            Assert.isTrue(oe.get('hidden'),'cell editor col 1 should be hidden');


            inp.simulate('click');
            Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');

            td6.simulate('click');
            oe = dt._openEditor;
            oe.saveEditor('abcdefg');



            //inp.focus();
            Y.one('body').simulate('keypress',{charCode:52}); //  4:52     -:45   .:46
            inp.simulate('keypress',{charCode:53}); //
            inp.simulate('keypress',{charCode:54}); //
            inp.simulate('keypress',{charCode:46}); //
            inp.simulate('keypress',{charCode:55}); //    456.7 ?
            inp.simulate('keydown',{keyCode:13});

        //    Assert.isFalse(oe.get('visible'),'cell editor col 1 should be closed');
        //    Assert.areSame(59.93, oe.get('lastValue'),'after save lastvalue should be 59.93');
        //    Assert.areSame(456.7, oe.get('value'),'after save lastvalue should be 59.93');


        },


        'check initial setup - inline row 0' : function(){
            var dt = this.dt,
                tr0 = this.dt.getRow(0);

            // column 0 of any row is uneditable, make sure ...
            tr0.all('td').item(0).simulate('click');
            Assert.isNull(dt._openEditor,'cell editor col 0 should be null');

            // column 1 of row 0 should open ...
            tr0.all('td').item(1).simulate('click');
            Assert.isNotNull(dt._openEditor,'cell editor col 1 should be open');
            Assert.isTrue(dt._openEditor.get('visible'),'cell editor col 1 should be visible');

            Assert.areSame(0,dt._openEditor.get('value'),'initial editor value of col 1 should be 0');

            // ESC should close
            dt._openEditor._inputNode.simulate('keydown',{keyCode:27});
            Assert.isNull(dt._openEditor,'cell editor col 1 should be closed');

        }


    }));

    Y.Test.Runner.add(suite);

},'', { requires: [ 'test' ] });
