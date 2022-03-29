/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-大厅-申请列表
    var ID = 'gonghui_dating_applylist';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.nodes.text_zdjl, L('UI_TITLE_' + me.ID()));
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

            new X.bView('gonghui_sqlb.json', function (view) {
                me._view = view;

                me.needScroll = true;
                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);

                me.getData(function () {
                    me.setContents();
                });
            });
        },
        onHide: function () {
            var me = this;

            if (me.needRefresh && G.frame.gonghui_dating.isShow) {
                G.frame.gonghui_main.getData(function () {
                    G.frame.gonghui_dating.emit('updateInfo');
                });
            }
            
            G.hongdian.getData("gonghui", 1, function () {
                G.frame.gonghui_main.checkRedPoint();
                G.frame.gonghui_dating.zy.checkRedPoint();
            })
        },
        refreshData: function () {
            var me = this;

            me.needScroll = true;
            me.getData(function () {
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;

            // me.DATA = {
            //     applylist:[
            //         {name:1,lv:1,head:P.gud.head,ctime:-1}
            //     ]
            // };
            // callback && callback();

            G.ajax.send('gonghui_applylist', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            var panel = me._view;
            var scrollview = panel.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            var listview = panel.nodes.listview;
            cc.enableScrollBar(listview);
            scrollview.removeAllChildren();

            var data = me.DATA.applylist;

            if (data.length < 1) {
                cc.isNode(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.show();
                return;
            } else {
                cc.isNode(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.hide();
            }

            var table = me.table = new X.TableView(scrollview,panel.nodes.list_lb,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,8);
            table.setData(data);
            table.reloadDataWithScroll(me.needScroll);
        },
        setItem: function (ui, data) {
            var me = this;

            var zdl_bg = ui.finds('img_zdlbg');
            zdl_bg.setColor(cc.color('#EDE4D0'));

            X.autoInitUI(ui);
            var func = function () {
                X.render({
                    img:X.STR
                })
            };
            X.render({
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.addChild(wid);
                },
                txt_player_name:data.name,
                txt_join_time:X.moment(data.ctime - G.time),
                txt_zdl1:data.maxzhanli,
                btn_accept: function (node) {
                    node.hide();
                    if (G.frame.gonghui_main.getMyPower() <= G.frame.gonghui_main.extConf.power.guanyuan) {
                        node.show();
                    }
                    node.data = data;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.ajax.send('gonghui_join',[sender.data.uid],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('CAOZUO') + L('SUCCESS'));
                                    me.refreshData();
                                    me.needRefresh = true;

                                    try{
                                        var _data = G.frame.gonghui_main.DATA.ghdata;
                                        G.event.emit("leguXevent", {
                                            type: 'track',
                                            event: "join_guild",
                                            data: {
                                                guild_id: sender.data.uid,
                                                guild_name: _data.name,
                                                guild_level: _data.lv,
                                                guild_people_num: _data.usernum,
                                                guild_fighting_capacity: 0,
                                                guild_create_time: _data.ctime
                                                //这里填写excel里对应事件所需记录的数据
                                            }
                                        });
                                    }catch(e){
                                        cc.error(e);
                                    }
                                } else {
                                    me.refreshData();
                                    me.needRefresh = true;
                                }
                            },true);
                        }
                    });
                },
                btn_refuse: function (node) {
                    node.hide();
                    if (G.frame.gonghui_main.getMyPower() <= G.frame.gonghui_main.extConf.power.guanyuan) {
                        node.show();
                    }
                    node.data = data;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.ajax.send('gonghui_refuse',[sender.data.uid],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('CAOZUO') + L('SUCCESS'));
                                    me.refreshData();
                                }
                            },true);
                        }
                    });
                }
            },ui.nodes);
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();