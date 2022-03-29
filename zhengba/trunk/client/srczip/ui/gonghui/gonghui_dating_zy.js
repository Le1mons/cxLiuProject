/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-大厅-主页
    G.class.gonghui_dating_zy = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('gonghui_tip1_zy.json');
            G.frame.gonghui_dating.zy = me;
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        checkRedPoint: function() {
            var me = this;
            var data = G.DATA.hongdian.gonghui.apply;

            if(data > 0) {
                G.setNewIcoImg(me.nodes.btn_sqlb, .95);
            }else {
                G.removeNewIco(me.nodes.btn_sqlb);
            }
        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_help.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.help.data({
                        intr:L('TS10')
                    }).show();
                }
            });

            //申请列表
            cc.isNode(me.nodes.btn_sqlb) && me.nodes.btn_sqlb.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.gonghui_dating_applylist.show();
                }
            });
            // 退出公会
            cc.isNode(me.nodes.btn_tcgh) && me.nodes.btn_tcgh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (P.gud.ghpower == 0) {
                        G.tip_NB.show(L('GONGHUI_TIP_1'));
                        return;
                    }

                    var str = L('GONGHUI_TIP_2');
                    G.frame.alert.data({
                        sizeType:3,
                        cancelCall:null,
                        okCall: function () {
                            var id = P.gud.ghid;
                            G.ajax.send('gonghui_exit',[],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('TUICHU') + L('SUCCESS'));
                                    X.uiMana.closeAllFrame();
                                    try{
                                        var _data = G.frame.gonghui_main.DATA.ghdata;
                                        G.event.emit("leguXevent", {
                                            type: 'track',
                                            event: "quit_guild",
                                            data: {
                                                guild_id: id,
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
                                }
                            },true);
                        },
                        richText:str
                    }).show();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.if = false;
            me.DATA = G.frame.gonghui_main.DTDATA;
            me.bindBTN();
            me.setContents();
            me.checkRedPoint();
            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;



            G.frame.gonghui_dating.onnp('updateInfo', function (d) {
                if(G.frame.gonghui_dating.curType == me._type){
                    me.refreshPanel();
                }else{
                    me._needRefresh = true;
                }
            }, me.getViewJson());
        },
        onNodeShow: function () {
            var me = this;

            if (!cc.isNode(me.ui)) {
                return;
            }

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.frame.gonghui_dating.getMemberData(function () {
                callback && callback();
            });
        },
        setContents: function () {
            var me = this;

            me.setPeoples();
            me.setBaseInfo();
        },
        setPeoples: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            cc.enableScrollBar(scrollview);

            me.nodes.list_lb.hide();

            var data = me.if ? G.frame.gonghui_dating.DATA.userlist : me.DATA.userlist;
            me.if = true;
            data = G.frame.gonghui_main.sortData(data);

            var table = me.table = new X.TableView(scrollview,me.nodes.list_ghth,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,8);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            ui.show();
            X.autoInitUI(ui);
            X.render({
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.addChild(wid);
                    wid.setTouchEnabled(true);
                    wid.data = data;
                    wid.click(function (sender, type) {
                        if (P.gud.uid == sender.data.headdata.uid) {
                            return;
                        }
                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.headdata.uid,
                            btnsCall: function (node) {
                                var btnsArr = [];

                            },
                            from:'gonghui'
                        }).checkShow();
                    })
                },
                txt_player_name:data.headdata.name,
                txt_player_class:L('GONGHUI_POWER_' + data.power),
                txt_time: function (node) {
                    var interval = 60;
                    node.setPositionY(61);
                    if (data.hearttime + interval > G.time) {
                        node.setString(L('ZAIXIAN'));
                    } else {
                        node.setString(X.moment(data.hearttime - G.time));
                    }
                    node.setTextColor(cc.color("#BE5E30"));
                },
                btn_tanhe: function (node) {
                    node.hide();
                },
                txt_lsgxwz: L("LSGX"),
                txt_goxian: data.sungongxian
            },ui.nodes);
            if(data.power == 0 && P.gud.uid != data.headdata.uid
                && (G.time - data.hearttime ) >3600 *24 * 3 ){
                ui.nodes.txt_time.setPositionY(86);
                ui.nodes.btn_tanhe.show();
                ui.nodes.btn_tanhe.click(function(sender,type){
                    G.frame.gonghui_tanhe.checkShow();
                })
            } else {
                ui.nodes.txt_time.setPositionY(61);
                ui.nodes.btn_tanhe.hide();
            }
            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
        },
        setBaseInfo: function () {
            var me = this;

            var data = G.frame.gonghui_main.DATA.ghdata;
            X.render({
                img_flag: function (node) {
                    node.setBackGroundImage(G.class.gonghui.getFlagImgById(data.flag), 1);
                },
                txt_name:function (node) {
                    var str = X.STR(L('GONGHUI_NAME') + '：' + '<font color=#be5e30> {1} </font>',P.gud.ghname);
                    var rh = new X.bRichText({
                        size:18,
                        maxWidth:node.width,
                        lineHeight:20,
                        color:G.gc.COLOR.n4,
                        family: G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0,node.height - rh.height));
                    node.removeAllChildren();
                    node.addChild(rh);
                },
                txt_numble: function (node) {
                    var str = X.STR(L('BIANHAO') + '：' + '<font color=#be5e30> {1} </font>',data.codeid);
                    var rh = new X.bRichText({
                        size:18,
                        maxWidth:node.width,
                        lineHeight:20,
                        color:G.gc.COLOR.n4,
                        family: G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0,node.height - rh.height));
                    node.removeAllChildren();
                    node.addChild(rh);
                },
                txt_count: function (node) {
                    var str = X.STR(L('RENSHU') + '：' + '<font color=#be5e30> {1}/{2} </font>',data.usernum , data.maxusernum);
                    var rh = new X.bRichText({
                        size:18,
                        maxWidth:node.width,
                        lineHeight:20,
                        color:G.gc.COLOR.n4,
                        family: G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0,node.height - rh.height));
                    node.removeAllChildren();
                    node.addChild(rh);
                },
                wz_introdue: function (node) {
                    var str = data.notice ? data.notice : L('ZHAOMU_CONTENT');

                    var rh = new X.bRichText({
                        size:18,
                        maxWidth:node.width,
                        lineHeight:20,
                        color:G.gc.COLOR.n4,
                        family: G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0,node.height - rh.height));
                    node.removeAllChildren();
                    node.addChild(rh);
                }
            },me.nodes);
        }
    });

})();