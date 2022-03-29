/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-创建
    G.class.gonghui_create = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('gonghui_ghjl.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;

            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            //设置输入过高上移
            //X.editbox.create(me.nodes.text_ghnr);
            X.editbox.create(me.nodes.text_ghmc);

            me.nodes.text_ghmc.addEventListener(me.setName, me.nodes.text_ghmc);

            me.objData = {};
            X.render({
                panel_qz: function (node) {
                    var flagId = me.getRandFlag();

                    me.setFlag(flagId);
                },
                btn_xz: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.gonghui_selectflag.data({
                                flag:me.objData.flag,
                                callback: function (data) {
                                    me.setFlag(data);
                                }
                            }).show();
                        }
                    });
                },
                text_ghmc: function (node) {
                    // node.addEventListener(function (sender, type) {
                    //     if (type == ccui.TextField.EVENT_DETACH_WITH_IME) {
                    //         me.objData.ghname = sender.getString();
                    //     }
                    // },node);
                    node.setPlaceHolder(L('GONGHUI_NAME_INFO'));
                    node.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
                },
                text_ghnr: function (node) {
                    // node.addEventListener(function (sender, type) {
                    //     if (type == ccui.TextField.EVENT_DETACH_WITH_IME) {
                    //         me.objData.info = sender.getString();
                    //     }
                    // },node);
                    node.setTouchEnabled(false);
                    node.setPlaceHolder(L('GHMRNR'));
                    node.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
                },
                btn_jl: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            me.objData.info = me.nodes.text_ghnr.getString();
                            me.objData.ghname = me.nodes.text_ghmc.getString();

                            // console.log('me.objData======', me.objData);
                            // return;


                            G.ajax.send('gonghui_create',[me.objData],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('CHUANGJIAN') + L('SUCCESS'));
                                    G.frame.gonghui_main.once('show', function () {
                                        if (me.isShow) {
                                            me.remove();
                                        }
                                    }).checkShow();
                                }
                            },true);
                        }
                    });
                },
                text_sl: function (node) {
                    var need = G.class.gonghui.get().base.createghneed;
                    var ownNum = G.class.getOwnNum(need[0].t,need[0].a);
                    setTextWithColor(node,need[0].n,G.gc.COLOR[ownNum >= need[0].n ? 'n1' : "n16"]);
                }
            },me.nodes);
        },
        getRandFlag: function () {
            var me = this;

            var conf = G.class.gonghui.get().base.flags;
            var keys = X.keysOfObject(conf);

            return X.arrayRand(keys);
        },
        setName: function(sender, type) {

            switch (type) {
                case ccui.TextField.EVENT_INSERT_TEXT:
                    if(sender.getString().length > 6) {
                        sender.setString(sender.getString().substring(0, 6));
                    }
                    break;
            }
        },
        setFlag: function (flagId) {
            var me = this;

            var node = me.nodes.panel_qz;
            node.removeBackGroundImage();

            var conf = G.class.gonghui.get().base.flags[flagId];
            node.setBackGroundImage('img/gonghui/' + conf.img,1);

            me.objData.flag = flagId;
        }
    });

})();