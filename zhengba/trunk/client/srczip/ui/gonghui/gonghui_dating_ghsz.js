/**
 * Created by wfq on 2018/6/26.
 */
(function () {
    //公会-大厅-设置
    var ID = 'gonghui_dating_ghsz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_title.setString(L("SHEZHI"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
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

            new X.bView('gonghui_ghsz.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.objData = {};
            var panel = me._view;

            me.setFlag(G.frame.gonghui_main.DATA.ghdata.flag);
            X.render({
                txt_name:P.gud.ghname,
                btn_modify: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.edit.data({
                                type:0,
                                title:L('XIUGAI') + L('MINGZI'),
                                info:L('GONGHUI_NAME_INFO'),
                                placeholder:L('GONGHUI_NAME_TIP'),
                                need:G.class.gonghui.get().base.changenameneed,
                                callback: function (data) {
                                    // me.setGhName(data);
                                    // G.frame.edit.remove();

                                    G.ajax.send('gonghui_rename',[data],function(d) {
                                        if(!d) return;
                                        var d = JSON.parse(d);
                                        if(d.s == 1) {
                                            G.event.emit("sdkevent", {
                                                event: "gonghui_rename"
                                            });
                                            G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                                            me.setGhName(data);
                                            G.frame.edit.remove();
                                        }
                                    },true);
                                }
                            }).show();
                        }
                    });
                },
                btn_choice: function (node) {
                    node.touch(function (sender, type) {
                        G.frame.gonghui_selectflag.data({
                            flag:me.objData.flag,
                            callback: function (data) {
                                me.setFlag(data);
                            }
                        }).show();
                    });
                },
                img_flag: function(node) {
                    node.setTouchEnabled(true);
                    node.touch(function (sender, type) {
                        G.frame.gonghui_selectflag.data({
                            flag:me.objData.flag,
                            callback: function (data) {
                                me.setFlag(data);
                            }
                        }).show();
                    });
                },
                txt_input: function (node) {
                    node.setPlaceHolder(L('ZHAOMU_CONTENT'));
                    node.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
                    var notice = G.frame.gonghui_main.DATA.ghdata.notice;

                    if (notice && notice != '') {
                        node.setString(notice);
                    }
                },
                txt_field: function (node) {
                    node.setPlaceHolder('0');
                    node.setString(G.frame.gonghui_main.DATA.ghdata.joinlv || 0);
                },
                btn_confirm: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            var joinlv = panel.nodes.txt_field.getString().trim() || 0;
                            var info = panel.nodes.txt_input.getString().trim() || '';

                            me.objData.joinlv = joinlv;
                            me.objData.notice = info;
                            me.objData.auto = panel.nodes.img_txgou.visible ? 1 : 0;

                            // console.log('data======', me.objData);
                            // G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                            // me.remove();
                            // G.frame.gonghui_main.getData(function () {
                            //     G.frame.gonghui_dating.emit('updateInfo');
                            // });
                            G.ajax.send('gonghui_changedata',[me.objData],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                                    me.remove();
                                    G.frame.gonghui_main.getData(function () {
                                        G.frame.gonghui_dating.emit('updateInfo');
                                    });
                                }
                            },true);
                        }
                    });
                },
                img_txgoudi: function (node) {
                    node.setTouchEnabled(true);
                    node.click(function () {

                        panel.nodes.img_txgou.setVisible(!panel.nodes.img_txgou.visible);
                    });
                },
                img_txgou: function (node) {
                    node.setTouchEnabled(false);
                    node.setVisible(G.frame.gonghui_main.DATA.ghdata.auto ? true : false);
                }
            },panel.nodes);
        },
        setGhName: function (name) {
            var me = this;

            var txtName = me._view.nodes.txt_name;
            txtName.setString(name);
        },
        setFlag: function (id) {
            var me = this;

            var imgFlag = me._view.nodes.img_flag;
            imgFlag.setBackGroundImage(G.class.gonghui.getFlagImgById(id), 1);

            me.objData.flag = id;
        }
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();