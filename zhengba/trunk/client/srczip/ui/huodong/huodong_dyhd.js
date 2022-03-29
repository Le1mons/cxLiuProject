/**
 * Created by LYF on 2019/8/27.
 */
(function () {
    //钓鱼活动
    G.class.huodong_dyhd = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_diaoyu.json", null, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.panel_yg1.children[1].setTouchEnabled(false);
            me.nodes.panel_yg2.children[1].setTouchEnabled(false);
            me.nodes.panel_yg3.children[1].setTouchEnabled(false);

            me.nodes.btn_yugan1.btnIndex = 1;
            me.nodes.btn_yugan2.btnIndex = 2;
            me.nodes.btn_yugan3.btnIndex = 3;

            if(me._data.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_sjs.setString(X.moment(me._data.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_sjs, me._data.etime, function () {
                    me.timeout = true;
                });
            }

            G.class.ani.show({
                json: "ani_diaoyu_yugan",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                autoRemove: false,
                onload: function (node, action) {
                    me.yg = node;
                    node.hide();
                    node.action = action;
                }
            });

            for (var i = 1; i < 4; i ++) {
                G.class.ani.show({
                    json: "ani_zhounianqing_diaoyuxuanzhong",
                    addTo: me.nodes["panel_dhlz" + i],
                    repeat: true,
                    autoRemove: false,
                });
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS44")
                }).show();
            });

            me.nodes.btn_diaoyu.click(function () {
                G.frame.yufuzhijia.data(me).show();
            });

            X.radio([me.nodes.panel_yg1, me.nodes.panel_yg2, me.nodes.panel_yg3], function (sender) {
                var nameType = {
                    panel_yg1$: 1,
                    panel_yg2$: 2,
                    panel_yg3$: 3
                };
                me.changeType(nameType[sender.getName()]);
            }, {
                callback1: function (sender) {
                    me.sender = sender;
                    sender.children[0].show();
                    sender.children[2].show();
                    sender.children[4].loadTexture("img/diaoyu/yugan_xz2.png", 1);
                },
                callback2: function (sender) {
                    sender.children[0].hide();
                    sender.children[2].hide();
                    sender.children[4].loadTexture("img/diaoyu/yugan_xz1.png", 1);
                }
            });

            me.nodes.btn_yugan1.click(function () {
                me.angling(me._type, 1);
            });

            me.nodes.btn_yugan2.click(function () {
                me.angling(me._type, 1);
            });

            me.nodes.btn_yugan3.click(function () {
                me.angling(me._type, 10);
            });
        },
        angling: function (type, index, callback, num) {
            var me = this;

            me.ajax("huodong_use", [me._data.hdid, type, index, num], function (str, data) {
                if (data.s == 1) {
                    if (type != 4) {
                        G.DATA.noClick = true;
                        me.nodes.panel_yg1.hide();
                        me.nodes.panel_yg2.hide();
                        me.nodes.panel_yg3.hide();
                        for (var i = 0; i < me.btnArr.length; i ++) {
                            me.btnArr[i].hide();
                        }
                        me.yg.show();
                        me.yg.action.playWithCallback("in", false, function () {
                            me.yg.action.playWithCallback("wait", false, function () {
                                me.yg.action.playWithCallback("out", false, function () {
                                    G.DATA.noClick = false;
                                    me.nodes.panel_yg1.show();
                                    me.nodes.panel_yg2.show();
                                    me.nodes.panel_yg3.show();
                                    me.changeType(me._type);
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                    me.yg.hide();
                                });
                            });
                        });
                    } else {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                    }
                    me.DATA.myinfo = data.d.myinfo;
                    me.setBaitNum();
                    callback && callback();
                }
            });
        },
        changeType: function (type) {
            var me = this;
            me._type = type;
            var data = me.DATA.info.arr[type];
            var btnGroup = {
                1: [me.nodes.btn_yugan1],
                2: [me.nodes.btn_yugan2, me.nodes.btn_yugan3]
            };
            var groupId = Object.keys(data).length;
            for (var group in btnGroup) {
                var btnS = btnGroup[group];
                for (var index = 0; index < btnS.length; index ++) {
                    btnS[index].setVisible(group == groupId);
                }
            }
            var btnArr = me.btnArr = btnGroup[groupId];
            me.initBtnNeed(btnArr[0], data[1], type);
            me.initBtnNeed(btnArr[1], data[10], type);
        },
        initBtnNeed: function (btn, conf, type) {
            if (!btn || !conf) return;
            var me = this;
            var needNum = conf.need[0].n;
            var haveNum = G.class.getOwnNum(conf.need[0].t, conf.need[0].a);

            var ico = me.nodes["ico_yu" + btn.btnIndex];
            var txtNum = me.nodes["txt_slcs" + btn.btnIndex];
            if (haveNum < needNum && conf.rmbmoneyneed) {
                txtNum.setString(conf.rmbmoneyneed[0].n);
                ico.setBackGroundImage(G.class.getItemIco(conf.rmbmoneyneed[0].t), 1);
            } else {
                txtNum.setString(needNum);
                ico.setBackGroundImage(G.class.getItemIco(conf.need[0].t), 1);
            }
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onRemove: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.nodes.panel_yg1.triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.setContents();
                me.setBaitNum();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
        setContents: function () {
            var me = this;
        },
        setBaitNum: function () {
            var me = this;

            me.ui.setTimeout(function () {
                me.nodes.txt_gg1.setString(G.class.getOwnNum("2051", 'item'));
                me.nodes.txt_gg2.setString(G.class.getOwnNum("2050", 'item'));
                me.nodes.txt_gg3.setString(G.class.getOwnNum("2049", 'item'));
            }, 300);
        }
    });
})();