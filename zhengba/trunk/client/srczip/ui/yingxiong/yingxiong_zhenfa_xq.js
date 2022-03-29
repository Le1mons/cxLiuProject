/**
 * Created by wfq on 2018/6/9.
 */
(function () {
    //英雄-阵法-详情
    var ID = 'yingxiong_zhenfa_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
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
        onShow: function () {
            var me = this;

            me.DATA = me.data();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;
            var conf = G.class.zhenfa.getById(data.id);

            var layIco = me.nodes.panel_jn;
            var txtName = me.nodes.txt_jn_name;
            var txtIntr = me.nodes.panel_jnnr;
            var txt_h = txtIntr.height;

            txtName.setString('');
            layIco.setBackGroundImage('img/zhenfa/' + conf.ico + '.png', 1);

            var str = '<font size=22 color=' + G.gc.COLOR.n1 + '>' + conf.title + '</font><br>';
            str += L('YINGXIONG_ZHENFA_TIP_1');
            var rhName = new X.bRichText({
                size:18,
                maxWidth:txtName.width,
                lineHeight:20,
                color:G.gc.COLOR.n5,
                family: G.defaultFNT,
            });
            rhName.text(str);
            rhName.setPosition(cc.p(0,-10));
            txtName.removeAllChildren();
            txtName.addChild(rhName);


            var strIntr = conf.intr;
            // conf.buff = {
            //     atk:10,
            //     def:10,
            //     hp:100
            // };
            var buffKeys = X.keysOfObject(conf.buff);
            buffKeys.sort(function (a,b) {
                return a < b ? -1 : 1;
            });

            for (var i = 0; i < buffKeys.length; i++) {
                var key = buffKeys[i];
                var obj = {};
                obj[key] = conf.buff[key];
                var tip = X.fmtBuff(obj,'<font color='+ G.gc.COLOR.n1 +'>{1}</font>    +{2}')[0].tip;
                strIntr += '<br>' + tip;
            }

            var rt = new X.bRichText({
                size: 20,
                lineHeight: 20,
                color: G.gc.COLOR.n5,
                maxWidth: txtIntr.width,
                family: G.defaultFNT,
            });
            rt.text(strIntr);
            rt.setAnchorPoint(0, 1);
            rt.setPosition( cc.p((txtIntr.width - rt.trueWidth())*0.5, txtIntr.height) );
            txtIntr.removeAllChildren();
            txtIntr.addChild(rt);


            // me.nodes.bg_top.height += (txtIntr.height - txt_h);
            // me.nodes.bg_top.y -= (txtIntr.height - txt_h);
            me.nodes.bg_top.height += (rt.trueHeight() - txt_h);
            me.nodes.bg_top.y -= (rt.trueHeight() - txt_h);

            me.setPos();
        },
        setPos: function () {
            var me = this;

            var panel = me.nodes.panel_top;
            panel.y = cc.director.getWinSize().height / 2 - panel.height / 2;
        }
    });

    G.frame[ID] = new fun('ui_top2.json', ID);
})();