/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //英雄主题活动
    var ID = 'yingxiongzhuti';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes = ['zhounianqing1.png', 'zhounianqing1.plist'];
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
                panel_rk1: function (node) {
                    node.click(function () {
                        G.frame.yxzt_yjzm.data(me.DATA.myinfo).show();
                    });
                    G.class.ani.show({
                        json: 'yingxiongyure_cs01_dh',
                        addTo: node,
                        x: 165,
                        y: 170,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            aniNode = node;
                            action.playWithCallback('in', false, function () {
                                action.play('wait', true);
                            });
                        }
                    })
                },
                panel_rk2: function (node) {
                    node.click(function () {
                        G.frame.yxzt_blsl.data({
                            myinfo: me.DATA.myinfo,
                            rank: me.DATA.ranklist,
                        }).show();
                    });
                },
                panel_rk3: function (node) {
                    node.click(function () {
                        G.frame.yxzt_zhl.data(me.DATA.myinfo).show();
                    });

                },
                panel_rk4: function (node) {
                    node.click(function () {
                        G.frame.yxzt_blcf.data(me.DATA.myinfo).show();
                    });
                },
                panel_rk5: function (node) {
                    node.click(function () {
                        G.frame.yxzt_yxth.data(me.DATA.myinfo).show();
                    });

                },
                btn_bz: function (node) {
                    node.click(function () {
                        G.frame.help.data({
                            intr: L('TS106')
                        }).show();
                    });
                },
            }, me.nodes);
            X.spine.show({
                json: 'spine/yxyl_dh01.json',
                addTo: me.nodes.panel_dh1,
                cache: true,
                x: 80,
                y: -100,
                z: 0,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "animation", true);
                }
            });
            X.spine.show({
                json: 'spine/dijing.json',
                addTo: me.nodes.panel_dh2,
                cache: true,
                x: 100,
                y: 0,
                z: 0,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "dj", true);
                }
            });
        },
        onOpen: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.nodes.panel_ui.setTouchEnabled(false);
            me.getData(function () {
                me.bindBtn();
                me.setContents();
                me.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;
            X.timeout(me.nodes.txt_sj, G.DATA.asyncBtnsData.herotheme.etime, function () {
                G.tip_NB.show(L('HUODONG_HD_OVER'));
                me.remove();
            }, null, {
                showDay: true
            });
            // X.timeout(me.nodes.txt_sj, );
        },
        checkRedPoint:function(){
          var me = this;
          var myinfo  = me.DATA.myinfo;
            if (myinfo.shilian.fightnum>0){
                G.setNewIcoImg(me.nodes.panel_rk2);
            } else {
                G.removeNewIco(me.nodes.panel_rk2);
            }
            //战魂令
            var zhlconf = G.gc.herotheme;
            var zhllv = Math.floor(myinfo.flag.exp / zhlconf.upflagexp) + 1;
            var zhlprize = zhlconf.flagprize;
            var zhlhd = 0;
            var zhltaskhd = 0;
            for (var i in zhlprize){
                if (zhllv>=i && !X.inArray(myinfo.flag.free,i)){
                    zhlhd = 1;
                    break;
                }
                if (myinfo.buy==1){
                    if (zhllv>=i && !X.inArray(myinfo.flag.pay(),i)){
                        zhlhd = 1;
                        break;
                    }
                }
            }
            //
            var task = zhlconf.task;
            var rec = myinfo.task.rec;
            var jindu = myinfo.task.data;
            for (var i in task){
                var nval = jindu[i]||0;
                if (!X.inArray(rec,i)){
                    if (nval>=task[i].pval){
                        zhltaskhd = 1;
                        break;
                    }
                }
            };
            if (zhlhd==1 || zhltaskhd == 1){
                G.setNewIcoImg(me.nodes.panel_rk3);
            } else {
                G.removeNewIco(me.nodes.panel_rk3);
            }
            //兑换红点
            var dhhd = 0;
            var duihuan = zhlconf.duihuan;
            var myown = G.class.getOwnNum(zhlconf.duihuanNeed[0].t,zhlconf.duihuanNeed[0].a);
            for (var i in duihuan){
                var needn = duihuan[i].need[0].n;
                if (myown>=needn){
                    dhhd=1;
                    break;
                }
            }
            if (dhhd==1 && !X.cacheByUid('duihuan_byday')){
                G.setNewIcoImg(me.nodes.panel_rk5);
            } else {
                G.removeNewIco(me.nodes.panel_rk5);
            }
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send("herotheme_open", [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
    });
    G.frame[ID] = new fun('yingxiongzhuti.json', ID);
})();