/**
 * Created by yaosong on 2018/12/28.
 */
 (function () {
    //王者荣耀-大乱斗
    var ID = 'wangzherongyao_dld';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ['wangzherongyao3.plist','wangzherongyao3.png'];
            me.fullScreen = true;
            me._super(json, id);
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('wangzhe_dldopen',[], function (data) {
                if (!data) return;
                var data = X.toJSON(data);
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            },true);

        },
        initUI: function () {
            var me = this;
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.btn_fanhui.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.btnTz = me.ui.nodes.panel_rw;
            me.btnTz.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    G.ajax.send('crosswz_userdetails',[me.enemy.uid],function(rd) {
                        rd = X.toJSON(rd);

                        if (rd.s === 1) {
                            G.frame.wangzherongyao_wjxx.data({
                                frame:me.ID(), 
                                data: rd.d,
                                callback:function(){
                                    G.frame.wangzherongyao_wjxx.remove();
                                    G.frame.jingjichang_gjfight.data({
                                        type: 'pvwz',
                                        data: me.enemy.uid,
                                        callback: function(node) {
                                            var data = node.getDefendData();

                                            G.ajax.send("wangzhe_daluandou", [me.enemy.uid, data], function(d) {
                                                if (!d) return;
                                                var d = JSON.parse(d);
                                                if (d.s == 1) {

                                                    G.frame.fight.data({
                                                        pvType: 'pvwzdld',
                                                        prize: d.d.prize,
                                                        session: 0,
                                                        fightlength: d.d.fightres.length,
                                                        fightData:d.d,
                                                        callback: function(session) {
                                                            G.frame.fight.demo(d.d.fightres[session]);
                                                        }
                                                    }).once('hide', function() {
                                                        G.frame.jingjichang_gjfight.remove();
                                                        me.freshData();
                                                    }).demo(d.d.fightres[0]);
                                                }
                                            }, true);
                                        }
                                    }).show();
                                }
                            }).show();
                        }
                    },true);

                }
            });

            me.btnRank = me.ui.nodes.button_lqjl;
            me.btnRank.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    G.frame.wangzherongyao_dld_ph.show();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.showToper();
            me.initUI();
            me.bindUI();
        },
        onAniShow: function () {
            var me = this;
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_gonghuiboss",
                addTo: me.nodes.dh_jian,
                x: me.nodes.dh_jian.width / 2,
                y: me.nodes.dh_jian.height / 2,
                repeat: true,
                autoRemove: false
            });
            me.nodes.dh_jian.setTouchEnabled(false);
            me.nodes.dh_jian.hide();

            me.status = me.data().status;
            me.setContents();
        },
        onHide: function () {
            var me = this;
            G.frame.wangzherongyao.freshData();
        },
        setContents: function () {
            var me = this;

            me.setTop();
            me.setCenter();
            me.setBottom();
        },
        freshData: function () {
            var me = this;

            me.getData(function () {
                me.setTop(true);
                me.setCenter();
                me.showFind();
                me.setBottom();
            });
        },
        setTop: function (isAni) {
            var me = this;

            var panel = me.ui.finds('panel_wz');
            var txtScore = me.ui.nodes.wz_fs1;
            var txtRank = me.ui.nodes.wz_pm1;
            var txtNum = me.ui.nodes.wz_tz1;

            var data = me.DATA;

            txtScore.setString(data.myinfo.jifen);
            var maxNum = G.class.wangzherongyao.getOpenNum();
            txtRank.setString(data.myinfo.rank > maxNum ? X.STR(L('X_rank'),maxNum) : data.myinfo.rank);
            txtNum.setString(data.myinfo.remainnum);

            for(var i=0;i<15;i++) {
                var img = me.ui.nodes["img_" + (i+1)];
                if (!img) continue;
                if (data.myinfo.fightdata[i] != undefined) {
                    img.show();
                    img.removeAllChildren();
                    img.setBackGroundImage("img/wangzherongyao/img_" + (data.myinfo.fightdata[i] == 0 ? "l" : "h") + "dian.png", 1);
                    (function (img,i) {
                        if(isAni && data.myinfo.fightdata[i + 1] == undefined) {
                            G.class.ani.show({
                                addTo:img,
                                json:"ani_wzry_shengfu",
                                x:img.width / 2,
                                y:img.height / 2,
                                cache: true,
                                repeat: false,
                                autoRemove: true,
                                onload: function (node,action) {
                                    action.play(data.myinfo.fightdata[i] == 0 ? "shengli" : "shibai", true);
                                }
                            });
                        }
                    })(img,i);
                } else {
                    img.hide();
                }
            }

        },
        setCenter: function () {
            var me = this;
            var layYx = me.ui.nodes.panel_rw;
            var layName = me.ui.nodes.name1;

            var data = me.DATA;

            // var myData = data.myinfo;
            var enemyData = me.enemy = data.toinfo;

            G.class.ani.show({
                json: "ani_wzry_shuaxin",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: 0,
                repeat: false,
                autoRemove: true,
                onload: function (node, action) {
                    me.nodes.dh_jian.hide();
                    X.setHeroModel({
                        parent: layYx,
                        data: enemyData,
                    });
                    layYx.opacity = 100;
                    layYx.runActions([
                        cc.fadeIn(0.3),
                        cc.callFunc(function () {
                            me.nodes.dh_jian.show();
                        })
                    ])
                }
            });

            me.ui.nodes.qu1.setString(enemyData.ext_servername || '');
            me.ui.nodes.txt_name.setString(enemyData.name);
            me.ui.nodes.sz.setString(enemyData.zhanli || '');
            layName.show();
        },
        setBottom: function () {
            var me = this;

            var btnSx = me.ui.nodes.btn_tzds;
            var txtSyNum = me.ui.nodes.txt_cs;

            var data = me.DATA;

            txtSyNum.setString((data.myinfo.refrash || 0) + L("Ci"));

            if(!data.myinfo.refrash) {
                btnSx.setBright(false);
                txtSyNum.setTextColor(cc.color("#6c6c6c"));
            }

            btnSx.setTouchEnabled(true);
            btnSx.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    //me.showFind();
                    G.ajax.send('wangzhe_refighter',[], function (d) {
                        if (!d) return;
                        var d = X.toJSON(d);
                        if (d.s == 1) {
                            for(var k in d.d) {
                                for(var item in d.d[k]) {
                                    me.DATA[k][item] = d.d[k][item];
                                }
                            }
                            G.tip_NB.show(L('SX') + L('SUCCESS'));
                            me.setCenter();
                            me.showFind();
                            me.setBottom();
                        }
                    },true);
                }
            });
        },
        showFind: function () {
            var me = this;

            me.setFindAni(function () {
            });
            if (me.timer_1) {
                me.ui.clearTimeout(me.timer_1);
                delete me.timer_1;
            }
            me.timer_1 = me.ui.setTimeout(function () {
                me.refreshing = false;
                me.playAni();
                //me.setCenter();
                // me.ui.finds('czds').hide();
                // me.ui.finds('panel_rw3').show();
                // me.ui.finds('name2').show();
            },500);
        },
        setFindAni: function (callback) {
            var me = this;
            callback && callback();
            return;

            me.refreshing = true;
            var layYx = me.ui.nodes.panel_rw;

            var layName = me.ui.nodes.name1;

            layYx.hide();
            layName.hide();

            var txConf = G.class.zaoxing.getByType('head');
            var keys = X.keysOfObject(txConf);
            keys = X.arrayShuffle(keys);

            function play() {
                if (keys.length < 1) {
                    callback && callback();
                    return;
                }
                var key = keys.shift();
                var p = G.class.szaoxing({type:'head',id:key},false);
                p.setAnchorPoint(0,0);
                layIco.removeAllChildren();
                layIco.addChild(p);
                layIco.setTimeout(function () {
                    play();
                },10);
            }

            play();
        },
        playAni: function (callback) {
            var me = this;

            var layDh = me.ui.nodes.panel_dh;

            if (layDh.getChildByTag(11111)) {
                layDh.getChildByTag(11111).remove();
            }
            // G.class.ani.show({
            //     addTo:layDh,
            //     json:'ani_shuaxingds',
            //     x:layDh.width / 2,
            //     y:layDh.height / 2,
            //     repeat:false,
            //     autoRemove:true,
            //     onload: function (node, action) {
            //         node.setTag(11111);
            //     },
            //     onend: function (node, action) {
            //         callback && callback();
            //     }
            // });
            callback && callback();
            layDh.show();
        }
    });

G.frame[ID] = new fun('wangzherongyao_dld.json', ID);
})();
