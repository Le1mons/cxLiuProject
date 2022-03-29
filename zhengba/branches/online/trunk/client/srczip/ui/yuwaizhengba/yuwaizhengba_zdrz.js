/**
 * Created by LYF on 2018/9/26.
 */
(function () {
    //域外争霸-战斗日志
    var ID = 'yuwaizhengba_zdrz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("crosszb_getzbflog", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d.log;
                    callback && callback();
                }
            })
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview_zjjl);
            me.nodes.listview_zjjl.setItemsMargin(5);
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            if(me.DATA.length < 1) {
                me.ui.finds("img_zw").show();
                return;
            }

            me.DATA.sort(function (a, b) {
                return a.ctime > b.ctime ? -1 : 1;
            });

            for(var i = 0; i < me.DATA.length; i ++) {
                me.nodes.listview_zjjl.pushBackCustomItem(me.setFightLog(me.DATA[i]));
                var xian = me.ui.finds("pan1").clone();
                xian.show();
                me.nodes.listview_zjjl.pushBackCustomItem(xian);
            }
        },
        setFightLog: function (data) {
            var me = this;

            var str = "";
            var text1,text2,text3;

            text1 = L('NI');
            text2 = '<font color=#fdd464'+'>'+data.pkname + '</font>' + '【'+ data.ext_servername +'】';
            text3 = data.rank;
            if (data.iswin == 1) {
                str = X.STR(L('KFZ_ZB_RZ_2'),text1,text2);
            } else {
                str = X.STR( data.rank != undefined ? L('KFZ_ZB_RZ_1') : L('KFZ_ZB_RZ_1_1'),text1,text2,data.rank != undefined ? text3 : '');
            }


            var richText = new X.bRichText({
                size:20,
                lineHeight:32,
                maxWidth: me.nodes.listview_zjjl.width,
                color:'#f6ebcd',
                family: G.defaultFNT
            });
            richText.text(str);
            richText.setAnchorPoint(0, 1);


            return richText;
        }
    });
    G.frame[ID] = new fun('kfzb_zjjl.json', ID);
})();