/**
 * Created by  on 2019/3/12.
 */
(function () {
    //附魔-大师提升
    var ID = 'fumo_top';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
            me.curLv = me.data();
            me.type = G.frame.zhuangbeifumo.type;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var lastConf = G.gc.zbfm.base.master[me.curLv - 1];
            var curConf = G.gc.zbfm.base.master[me.curLv];

            me.nodes.txt_fmsxcs1.setString(me.curLv - 1);
            me.nodes.txt_dsmax1.setString(me.curLv);


        }
    });
    G.frame[ID] = new fun('fumo_top2.json', ID);
})();