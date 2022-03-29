/**
 * Created by
 */
(function () {
    //传说大厅
    var ID = 'csdt_csdh';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.csdt;
            me.heroid = X.keysOfObject(me.conf.herodz)[0];
            me.prizeid = X.keysOfObject(me.conf.itemdz)[0];
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            me.initUi();

            me.showToper();

            X.spine.show({
                json: 'spine/datie_dh.json',
                addTo: me.nodes.panel_dh,
                cache: true,
                autoRemove: false,
                y:100,
                rid: 1,
                onload: function (node,action) {
                    node.runAni(0, "wait", true);
                    me.spine = node;
                }
            });
            // G.class.ani.show({
            //     json: 'zhucheng_xiaodonghua_tiejiang_dh',
            //     addTo: me.ui,
            //     repeat: true,
            //     autoRemove: false,
            //     onload:function(node){
            //         node.setScale(7);
            //     },
            // });
        },
        initUi: function (prize) {
            var me = this;
            me.nodes.panel_wp.removeAllChildren();
            if (prize) {
                X.alignItems(me.nodes.panel_wp, prize, 'center', {
                    touch: false,
                });
                me.nodes.btn_jh.hide();
            } else {
                me.nodes.btn_jh.show();
            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_lan.setTouchEnabled(false);
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
                panel_1: function (node) {
                    node.click(function () {
                        G.frame.csdt_tk1.show();
                    });
                },
                panel_btn1: function (node) {

                    node.click(function () {
                        if (!me.num) {
                            return G.tip_NB.show('未放入消耗物品');
                        }
                        if (!me.prizeid) return G.tip_NB.show('请选择需要打造的道具');
                        me.spine.runAni(0, "dianji", true);
                        me.spine.setEventListener(function(traceIndex, event){
                            G.ajax.send("csdt_duanzhao", ['itemdz', me.prizeid * 1, me.num], function (str, data) {
                                if (!data) return;
                                if (data.s == 1) {
                                    if(event.data.name == 'hit'){
                                        me.spine.runAni(0, "wait", true);
                                        G.frame.jiangli.data({
                                            prize: data.d.itemprize
                                        }).show();
                                    }
                                    me.initUi();
                                    G.frame.csdt_main.downItem();
                                }
                            });
                            
                        });
                        
                    });
                },
            }, me.nodes);
        },
        setContents: function () {
            var me = this;
            me.nodes.btn_jh.setTouchEnabled(false);
            me.nodes.panel_wp.setTouchEnabled(false);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('csdt_csdh.json', ID);
})();