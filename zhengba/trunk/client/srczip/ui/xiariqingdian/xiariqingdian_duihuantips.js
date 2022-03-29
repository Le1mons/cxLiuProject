(function () {

    var ID = 'xiariqingdian_huihuantips';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            X.render({
                text_1: function (node) {
                    node.setString(L("JUEDOUSHENGDIAN38"));
                },
                text_2: function (node) {
                    node.setString("");
                },
                btn_zs: function (node) {
                    node.setTitleText(L("QUEDIN"));
                },
                panel_1: function (node) {
                    node.show();
                    X.alignItems(node, me.DATA.prize, 'center', {
                        touch: true
                    });
                }

            },me.nodes);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });

            me.nodes.btn_zs.click(function (sender, type) {
                me.DATA.callback && me.DATA.callback(me.multiple);
                me.remove();
            });
        },

        onOpen: function () {
            var me = this;
            me.DATA = me.data();

            me.hasneednums = G.class.getOwnNum(me.DATA.need[0].t,me.DATA.need[0].a);
            me.maxhuihuan = parseInt(me.hasneednums / me.DATA.need[0].n);

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },

        onShow: function () {
            var me = this;
            me.multiple = 0;
            me.setContent();
            me.refresh(1);
        },


        setContent: function(){
            var me = this;

            X.render({
                btn_1: function (node) {
                    node.click(function () {
                        me.refresh(-1);
                    })
                },
                btn_2: function (node) {
                    node.click(function () {
                        me.refresh(1);
                    })
                },
                btn_jian10: function (node) {
                    node.click(function () {
                        me.refresh(-10);
                    })
                },
                btn_jia10: function (node) {
                    node.click(function () {
                        me.refresh(10);
                    })
                }
            },me.nodes);
        },

        refresh: function (v) {
            var me = this;

            var need = me.DATA.need;

            me.multiple += v;
            if (me.multiple < 0) me.multiple = 1;
            if (me.multiple > me.maxhuihuan ) me.multiple =  me.maxhuihuan;

            if(me.multiple > me.DATA.hasnums) me.multiple = me.DATA.hasnums;

            X.render({
                panel_xh: function (node) {
                    var ico = new ccui.ImageView(G.class.getItemIco(need[0].t),1);
                    ico.setScale(0.8);
                    var str = X.STR(L('JUEDOUSHENGDIAN37'),me.multiple * need[0].n,me.hasneednums);
                    var rh = X.setRichText({
                        parent:node,
                        str:str,
                        anchor: {x: 0.5, y: 0.5},
                        pos: {x: node.width / 2, y: node.height / 2},
                        color:"#ffffff",
                        node:ico,
                        size:20,
                        outline:"#000000",
                    });
                },
                textfield_5: function (node) {
                    node.setString(me.multiple);
                }
            },me.nodes);
        },
    });
    G.frame[ID] = new fun('xiariqingdian_tk1.json', ID);
})();