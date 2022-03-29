/**
 * Created by wfq on 2018/7/8.
 */
(function () {
    //登录奖励
    G.class.huodong_denglu = X.bView.extend({
        extConf:{
            maxday:30
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('event_sign.json');
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_sign.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.ajax.send('sign_getprize',[],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.event.emit('sdkevent',{
                                event:'activity',
                                data:{
                                    joinActivityType:me._type.id,
                                    consume:[],
                                    get:d.d.prize,
                                }
                            });
                            for (var key in d.d) {
                                if (key == 'prize') continue;
                                me.DATA[key] = d.d[key];
                            }
                            G.frame.jiangli.data({
                                prize: [].concat(d.d.prize)
                            }).show();
                            me.refreshData();
                            G.frame.huodong.updateTop();
                            G.hongdian.getData("sign", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            })
                        }
                    },true);
                }
            });

            me.nodes.btn_info.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.help.data({
                        intr:L('TS12')
                    }).show();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.guang = [];
            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            // me.DATA = {
            //     alreadyget:1,
            //     remainnum:3, //最多30天
            //     data:[{a:'attr',t:'rmbmoney',n:100},{a:'attr',t:'rmbmoney',n:100},{a:'attr',t:'rmbmoney',n:100}]
            // };
            // callback && callback();
            G.ajax.send('sign_denglujiangliopen',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            },true);
        },
        setContents: function () {
            var me = this;

            me.setBanner();
            me.setTable();
            me.setBaseInfo();
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        refreshData: function () {
            var me = this;

            me.table.setData(me.DATA.data);
            me.table.reloadDataWithScroll(false);
            me.setBaseInfo();
        },
        setBanner: function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner8.png', 0);
                    G.class.ani.show({
                        json:'ani_choukajuese',
                        addTo:node,
                        x:130,
                        y:node.height/2 - 40,
                        repeat:true,
                        autoRemove:false,
                        onload:function (node) {
                            
                        }
                    });
                }
            },me.nodes);
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var table = me.table = new X.TableView(scrollview,me.nodes.list_item,5, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1);
            table.setData(me.DATA.data);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
            if(me.DATA.remainnum > 10) {
                table.reloadDataWithScrollToBottomRight();
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var isCz = me.DATA.chongzhi.length > 0 ? true : false;
            var isLq = me.DATA.chongzhi[0] && me.DATA.chongzhi[0].v ? true : false;
        
            X.autoInitUI(ui);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            X.render({
                ico_item: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.sitem(data.prize);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    ui.wid = wid;
                    node.addChild(wid);
                    G.frame.iteminfo.showItemInfo(wid);
                },
                img_sign: function (node) {
                    node.hide();
                    while (node.getChildByTag(999999)){
                        node.getChildByTag(999999).removeFromParent();
                    }
                    if (data.daynum > me.DATA.alreadyget && (me.DATA.remainnum + me.DATA.alreadyget) >= data.daynum) {
                        node.show();
                        G.class.ani.show({
                            json: "ani_qiandao_1",
                            addTo: node,
                            x: 64,
                            y: 49,
                            repeat: true,
                            autoRemove: false,
                            onload :function(node,action){
                                node.setTag(999999);
                                node.setScale(1.2);
                            }
                        });
                    }
                },
                img_gou: function (node) {
                    node.hide();
                    ui.nodes.img_zlyc_wz.hide();
                    // ui.nodes.img_zlyc_wz.opacity = 0;
                    if (data.daynum <= me.DATA.alreadyget) {
                        if(data.daynum == me.DATA.alreadyget + me.DATA.remainnum && !isLq) {
                            node.hide();
                            ui.nodes.img_zlyc_wz.show();

                            if(isCz) {
                                G.class.ani.show({
                                    json: "ani_zailingyici",
                                    addTo: ui.nodes.img_zlyc_wz,
                                    x: ui.nodes.img_zlyc_wz.width / 2,
                                    y: ui.nodes.img_zlyc_wz.height / 2,
                                    cache: true,
                                    repeat: true,
                                    autoRemove: false
                                });
                                ui.wid.touch(function (sender, type) {
                                    if(type == ccui.Widget.TOUCH_NOMOVE) {
                                        
                                        me.ajax("sign_getprize", [], function (str, dd) {
                                            if(dd.s == 1) {
                                                G.event.emit('sdkevent',{
                                                    event:'activity',
                                                    data:{
                                                        joinActivityType:me._type.id,
                                                        consume:[],
                                                        get:dd.d.prize,
                                                    }
                                                });
                                                G.frame.jiangli.data({
                                                    prize: [].concat(dd.d.prize)
                                                }).show();
                                                me.getData(function () {
                                                    me.refreshData();
                                                });
                                                G.frame.huodong.updateTop();
                                                G.hongdian.getData("sign", 1, function () {
                                                    G.frame.huodong.checkRedPoint();
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
                                ui.wid.touch(function (sender, type) {
                                    if(type == ccui.Widget.TOUCH_NOMOVE) {

                                        G.frame.alert.data({
                                            sizeType: 3,
                                            cancelCall: null,
                                            okCall: function () {
                                                G.frame.chongzhi.once("hide", function () {
                                                    me.getData(function () {
                                                        me.refreshData();
                                                    });
                                                }).show();
                                            },
                                            richText: L('DTCZRYJEZL')
                                        }).show();
                                    }
                                });
                            }
                        } else {
                            node.show();
                        }
                    }
                }
            },ui.nodes);
            
        },
        setBaseInfo: function () {
            var me = this;

            X.render({
                txt_number:me.DATA.alreadyget + '/' + me.extConf.maxday,
                btn_sign: function (node) {
                    node.setTouchEnabled(false);
                    node.setEnableState(false);
                    node.setTitleColor(cc.color(G.gc.COLOR.n15));
                    G.removeNewIco(node);
                    if (me.DATA.remainnum > 0) {
                        node.setTouchEnabled(true);
                        node.setEnableState(true);
                        node.setTitleColor(cc.color(G.gc.COLOR.n13));
                        G.setNewIcoImg(node, .95);
                    }
                }
            },me.nodes);
        }
    });

})();