/**
 * Created by yaosong on 2018/12/28.
 */
(function () {
    //王者荣耀
    var ID = 'wangzherongyao';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        getData: function (callback) {
            var me = this;
             G.ajax.send('crosswz_main', [], function (data) {
                 if (!data) return;
                 var data = JSON.parse(data);
                 if (data.s == 1) {
                     me.DATA = data.d;
                     callback && callback();
                 }
             }, true);

        },
        setContents: function () {
            var me = this;

            var data = me.DATA;
            me.openNum = G.class.wangzherongyao.getOpenNum();
            var btnDLD = me.ui.nodes.dld;
            var btnZSS = me.ui.nodes.zss;
            var btnWZS = me.ui.nodes.wzs;

            btnDLD.setBright(false);
            btnZSS.setBright(false);
            btnWZS.setBright(false);
            X.enableOutline(me.nodes.txt_bm, "#4b4747", 2);
            me.btnGHZX.hide();
            me.btnJCWZ.hide();

            if (data.num >= me.openNum) {
                if (data.status == 3 || data.status == 4) {
                    btnDLD.setBright(true);
                    me.isDLDtime = true;
                    X.enableOutline(me.nodes.txt_bm, "#2C59A5", 2);
                    if (data.isbm && data.status == 3 && data.ldpknum && data.ldpknum > 0) {
                        G.setNewIcoImg(btnDLD, .7);
                        btnDLD.getChildByName("redPoint").setPosition(590, 170);
                    } else {
                        G.removeNewIco(btnDLD);
                    }
                }
                if (data.status == 5 || data.status == 6) {
                    btnZSS.setBright(true);
                }
                if (data.status == 7 || data.status == 8) {
                    btnWZS.setBright(true);
                }

                if (data.status == 6 || data.status == 7 || data.status == 8) {
                    me.btnJCWZ.show();
                    me.btnJCWZ.removeAllChildren();

                    if (data.status == 6 && P.gud.vip >= 1 && (!data.isyz || data.isyz == 0)) {
                        G.setNewIcoImg(me.btnJCWZ, .7);
                    } else {
                        G.removeNewIco(me.btnJCWZ);
                    }
                }
            }

            //是否可以晋级钻石赛
            if (data.num >= me.openNum && data.isbm && data.status >= 5 &&  data.isjjzs) {
                me.btnGHZX.show();
            }

            me.setBaseInfo();
            me.showBaoMing();
            me.setZDBM();

            btnDLD.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    if (data.num < me.openNum) {
                        var ssstr = L('WZRY_HUODONG_NOOPEN');
                        if (data.status == 1) {
                            ssstr = L('WZRY_HUODONG_BAOMING');
                        }
                        G.tip_NB.show(ssstr);
                        return;
                    }
                    if (data.status == 1 || data.status == 2) {
                        G.tip_NB.show(L('WZRY_MAIN_HD_NOOPEN'));
                    } else {
                        if (data.isbm == 0) {
                            G.tip_NB.show(L('WZRY_MAIN_DLD_NOBM'));
                            return;
                        }
                        G.frame.wangzherongyao_dld.data({status:me.DATA.status}).show();
                    }
                    // G.frame.wangzherongyao_dld.data({status:me.DATA.status}).show();
                }
            });

            btnZSS.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    if (data.num < me.openNum) {
                        var ssstr = L('WZRY_HUODONG_NOOPEN');
                        if (data.status == 1) {
                            ssstr = L('WZRY_HUODONG_BAOMING');
                        }
                        G.tip_NB.show(ssstr);
                        return;
                    }
                    if (data.status == 1 || data.status == 2 || data.status == 3 || data.status == 4) {
                        G.tip_NB.show(L('WZRY_MAIN_HD_NOOPEN'));
                    } else {
                        // if (data.isbm == 0) {
                        //     G.tip_NB.show(L('WZRY_MAIN_DLD_NOBM'));
                        //     return;
                        // }
                        G.frame.wangzherongyao_zuanshisai_fenzhu.show();
                    }
                    // G.frame.wangzherongyao_zuanshisai_fenzhu.checkShow();
                }
            });

            btnWZS.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    if (data.num < me.openNum) {
                        var ssstr = L('WZRY_HUODONG_NOOPEN');
                        if (data.status == 1) {
                            ssstr = L('WZRY_HUODONG_BAOMING');
                        }
                        G.tip_NB.show(ssstr);
                        return;
                    }
                    if (data.status != 7 && data.status != 8) {
                        G.tip_NB.show(L('WZRY_MAIN_HD_NOOPEN'));
                    } else {
                        // if (data.isbm == 0) {
                        //     G.tip_NB.show(L('WZRY_MAIN_DLD_NOBM'));
                        //     return;
                        // }
                        G.frame.wangzherongyao_wangzhesai.show();
                    }
                    // G.frame.wangzherongyao_wangzhesai.checkShow();
                }
            });
        },

        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.ui.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            //更换阵型
            me.btnGHZX = me.ui.nodes.but_ghzx;
            me.btnGHZX.touch(function(sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    if (!me.getZXState()) {
                        G.tip_NB.show(L('WZRY_MAIN_ZX'));
                        return;
                    }

                    var str = L('WZRY_GHZX');
                    G.frame.alert.data({
                        close:true,
                        sizeType:3,
                        ok:{wz:L('GENGHUAN')},
                        okCall: function () {
                            G.frame.jingjichang_gjfight.data({
                                type: 'pvwz',
                                def: true,
                                callback: function(node) {
                                    var sdata = node.getDefendData();
                                    G.ajax.send('crosswz_upload', [sdata], function (data) {
                                        if (!data) return;
                                        var data = X.toJSON(data);
                                        if (data.s == 1) {
                                            X.cacheByUid("pvwz", sdata);
                                            G.tip_NB.show(L('BAOCUN') + L('SUCCESS'));
                                            G.frame.jingjichang_gjfight.remove();
                                        }
                                    },true);
                                }
                            }).show();
                        },
                        autoClose:true,
                        richText:str
                    }).show();

                }
            });

            //王者之巅
            me.btnWZZD = me.ui.nodes.but_wzry;
            me.btnWZZD.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    G.frame.wangzherongyao_ryzd.checkShow();
                }
            });

            //荣耀奖励
            me.btnRYJL = me.ui.nodes.but_pmjl;
            me.btnRYJL.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    G.frame.wangzherongyao_ryjl.show();
                }
            });
            //帮助
            me.btn_bz = me.ui.nodes.but_bz;
            me.btn_bz.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    G.frame.help.data({
                        intr: L('TS26')
                    }).show();
                }
            });
            me.btn_fanhui = me.ui.nodes.btn_fanhui;
            me.btn_fanhui.click(function(){
                me.remove();
            });

            //竞猜王者
            me.btnJCWZ = me.ui.nodes.but_jcwz;
            me.btnJCWZ.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    G.frame.wangzherongyao_jcwz.show();
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
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.setContents();
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("crosswz", 1, function () {
                G.frame.jingjichang.isShow && G.frame.jingjichang.checkRedPoint();
            });
        },
        freshData: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        setBaseInfo: function () {
            var me = this;

            var data = me.DATA;
            var txtState = me.ui.nodes.jssj;
            var txtIntr = me.ui.nodes.sj;

            var stateConf = G.class.wangzherongyao.getStateById(data.status);
            if (me.timerHd) {
                me.ui.clearTimeout(me.timerHd);
                delete me.timerHd;
            }

            //活动未开启时显示
            if (data.status != 1 && data.num < me.openNum) {
                txtState.setString(G.class.wangzherongyao.getStateById(2).intr1);
                txtIntr.setString('');
                return;
            }

            if (data.status == 1 || data.status == 2) {
                var openNum = me.openNum;
                if (data.num >= openNum) {
                    txtState.setString(stateConf.intr);
                    me.timerHd = X.timeout(txtIntr,data.cd, function () {
                        me.freshData();
                    });
                } else {
                    txtState.setString(stateConf.intr1);
                    if (data.status == 1) {
                        txtIntr.setString(data.num);
                    } else{
                        txtIntr.setString('');
                    }
                }
            } else{
                txtState.setString(stateConf.intr);
                me.timerHd = X.timeout(txtIntr,data.cd, function () {
                    me.freshData();
                });
            }

        },
        showBaoMing: function () {
            var me = this;

            var d = me.DATA;
            var txtBm = me.txtBm = me.ui.nodes.bm;

            if (d.status != 1 && d.status != 2) {
                txtBm.hide();
                return;
            }

            if (d.isbm) {
                txtBm.show();
            } else {
                if (d.status == 1) {
                    var needLv = G.class.wangzherongyao.getOpen().lv;
                    var str = X.STR(L('WZRY_MAIN_tip_1'),needLv);
                    G.frame.alert.data({
                        sizeType:3,
                        ok: {wz: L("BAOMING")},
                        okCall: function () {
                            if(P.gud.lv < needLv){
                                G.tip_NB.show(L("DJBZ"));
                                return;
                            }
                            if(!me.DATA.ifformat){
                                G.frame.jingjichang_gjfight.data({
                                    type: 'pvwz',
                                    txt: L("BAOMING"),
                                    def: true,
                                    callback: function(node) {
                                        var data = node.getDefendData();
                                        G.ajax.send('wangzhe_baoming',[data], function (d) {
                                            if (!d) return;
                                            var d = X.toJSON(d);
                                            if (d.s == 1) {
                                                me.freshData();
                                                G.tip_NB.show(L('BAOMING') + L('SUCCESS'));
                                                d.d.prize && G.frame.jiangli.data({
                                                    prize: d.d.prize
                                                }).show();
                                                G.frame.jingjichang_gjfight.remove();
                                            }
                                        },true);
                                    }
                                }).show();
                            }else{
                                G.ajax.send('wangzhe_baoming',[], function (d) {
                                    if (!d) return;
                                    var d = X.toJSON(d);
                                    if (d.s == 1) {
                                        me.freshData();
                                        G.tip_NB.show(L('BAOMING') + L('SUCCESS'));
                                        d.d.prize && G.frame.jiangli.data({
                                            prize: d.d.prize
                                        }).show();
                                        G.frame.jingjichang_gjfight.remove();
                                    }
                                },true);
                            }
                            // me.DATA.isbm = 1;
                            // me.showBaoMing();
                        },
                        autoClose:true,
                        richText:str
                    }).show();
                }
            }
        },
        //获得阵型可点击状态
        getZXState: function () {
            var me = this;

            var data = me.DATA;
            var timeInterval = 30 * 60;
            var status = true;
            if (data.status == 5 || data.status == 6 || data.status == 7) {
                var arr = data.matchtime;
                for (var i = 0; i < arr.length; i++) {
                    var time = arr[i];
                    if (Math.abs(G.time - time) < timeInterval) {
                        status = false;
                        break;
                    }
                }
            }


            return status;
        },
        //自动报名
        setZDBM: function () {
            var me = this;

            var data = me.DATA;
            var checkbox = me.ui.nodes.fxk;
            var imgWz = me.ui.nodes.zdbm;
            imgWz.setTouchEnabled(true);
            imgWz.setSwallowTouches(true);
            if (data.iszdbm) {
                checkbox.show();
            } else {
                checkbox.hide();
            }

            var status = checkbox.isVisible();
            imgWz.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    set(checkbox);
                } else if (type == ccui.Widget.TOUCH_CANCELED) {
                    checkbox.setVisible(!status);
                }
            });


            function set(sender) {
                var needLv = G.class.wangzherongyao.getOpen().lv;
                if (P.gud.lv < needLv) {
                    G.tip_NB.show(X.STR(L('WZRY_BM_TIP_1'), needLv));
                    sender.hide();
                    return;
                }
                var bmCond = G.class.wangzherongyao.getZDBMCond();
                if (P.gud.vip < bmCond) {
                    G.tip_NB.show(L('WZRY_BM_TIP_2'));
                    sender.hide();
                    return;
                }
                function f() {
                    G.ajax.send('wangzhe_autobm',[],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            for(var k in d.d) {
                                me.DATA[k] = d.d[k];
                            }
                            G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                            me.setZDBM();
                        }
                    },true);
                }
                if(checkbox.isVisible()) {
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            f();
                        },
                        richText: L("QXBM"),
                    }).show();
                } else {
                    f();
                }

            }
        }
    });

    G.frame[ID] = new fun('wangzherongyao_wzry.json', ID);
})();
