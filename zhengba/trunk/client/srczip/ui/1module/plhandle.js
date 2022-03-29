/**
 * Created by wfq on 2017/1/3.
 */
(function () {
    //批量处理
    var ID = 'plhandle';
    var _CONF = {
        // baowu:{  //宝物的暂未使用
        //     need_tip_color:[4],
        //     default_show_color:[1,2,3],
        //     api:'baowu_jinglian'
        // },
        hero: {
            need_tip_color: [3, 4],
            default_show_color: [1, 2],
            api: 'army_plchuli'
        },
        equip: {
            need_tip_color: [3, 4],
            default_show_color: [1, 2],
            api: 'equip_plchuli'
        }
    };

    G.event.on('plhandle_success', function (d) {
        if (!d) return;
        if (d.type == 'hero' || d.typ == 'equip') return;
        G.frame.plhandle['callback_' + d.type] && G.frame.plhandle['callback_' + d.type](d.d);
    });

    G.event.on('new_army_data', function (d) {
        if (!d) return;
        if (G.frame.plhandle.isShow) {
            G.frame.plhandle.ui.setTimeout(function () {
                G.frame.plhandle.setContents();
                G.frame.plhandle.callback_hero();
            }, 500);
        }
    });
    G.event.on('new_equip_data', function (d) {
        if (!d) return;
        if (G.frame.plhandle.isShow) {
            G.frame.plhandle.ui.setTimeout(function () {
                G.frame.plhandle.setContents();
                G.frame.plhandle.callback_equip();
            }, 500);
        }
    });
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        setContents: function () {
            var me = this;
            me.setBaseInfo();
            me.colorArr = [].concat(_CONF[me.curType].default_show_color);
            var color2Arr = me.color2Arr = me['getColor2ArrFrom' + me.curType]();
            for (var j = 0; j < 4; j++) {
                me.view.nodes['txt_fxk' + (j + 1)].setString(L('COLOR' + (j + 1)) + L(me.curType) + 'x' + color2Arr[j + 1].length);
                me.view.nodes['btn_fxk' + (j + 1)].idx = j + 1;
                me.view.nodes['btn_fxk' + (j + 1)].setSelected(X.inArray(me.colorArr, j + 1));
                me.view.nodes['btn_fxk' + (j + 1)].click(function (sender, type) {
                    var idx = X.arrayFind(me.colorArr, sender.idx);
                    if (idx != -1) {
                        me.colorArr.splice(idx, 1);
                    } else {
                        me.colorArr.push(sender.idx);
                    }
                });
            }
        },
        setBaseInfo: function () {
            var me = this;
            me.ui.nodes.top_title.setString(L('PL_TIP_TITLE_' + me.curType));
            me.view.nodes.txt_1.setString(L('PL_TIP_1_' + me.curType));
            me.view.nodes.txt_2.setString(L('PL_TIP_2_' + me.curType));
        },
        // getColor2ArrFrombaowu: function () {
        //     var obj = {};
        //     for (var j = 1; j < 5; j++) {
        //         obj[j] = [];
        //     }
        //
        //     var baowu = G.DATA.baowu;
        //     for (var k in baowu) {
        //         if (!baowu[k].tsbuff && !baowu[k].lock && (!baowu[k].useitem || baowu[k].useitem == '' || baowu[k].side == undefined)) {
        //             // C.log(baowu[k]['color']);
        //             obj[baowu[k]['color']].push(k);
        //         }
        //     }
        //     return obj;
        // },
        getColor2ArrFromarmy: function () {
            var obj = {};
            for (var j = 1; j < 5; j++) {
                obj[j] = [];
            }

            var data = G.DAO.budui.getCanHuiShouList(0);
            for (var k in data) {
                var conf = G.class.getItem(data[k].hid, 'hero');
                obj[conf.color].push(k);
            }
            return obj;
        },
        getColor2ArrFromequip: function () {
            var obj = {};
            for (var j = 1; j < 5; j++) {
                obj[j] = [];
            }

            var data = G.DAO.zhuangbei.getCanLianHuaList(0);
            for (var k in data) {
                var conf = G.frame.beibao.DATA.zhuangbei.list[data[k]];
                obj[conf.color].push(k);
            }
            return obj;
        },
        // callback_baowu: function (d) {
        //     if (d.addjl > 0) {
        //         G.tip_NB.show(L('JINGLIAN') + '*' + d.addjl);
        //     }
        //     var bw = d.newbw;
        //     if (bw && X.isHavItem(bw)) {
        //         var p = [];
        //
        //         for (var k in bw) {
        //             p.push({a: 'baowu', t: bw[k].bid, n: bw[k].num || 1, c: bw[k].color});
        //         }
        //         G.tip_NB.show(X.createPrizeInfo(p, 0, 1));
        //     }
        //     G.frame.tiejiangpu.showTk(d);
        //     G.frame.tiejiangpu._bwSelectedArr = [];
        //     G.frame.tiejiangpu.initJL();
        // },
        callback_hero: function (d) {
            var me = G.view.barrack_huishou;
            me._fjlist = [];
            me.nodes.btn_yjtj.setTouchEnabled(true);
            me.nodes.btn_hs.setTouchEnabled(true);
            me.setFJ();
        },
        callback_equip: function (d) {
            var me = G.view.institute_huishou;
            me._lhlist = [];
            me.nodes.btn_yjtj.setTouchEnabled(false);
            me.nodes.btn_hs.setTouchEnabled(false);
            me.setLH();
            G.event.emit('equip_lianhua');
        },
        initUI: function () {
            var me = this;
            // for (var j = 0; j < 4; j++) {
            //     me.panelArr.push(me.ui.finds('panel' + (j + 1)));
            // }
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.btn_gb.click(function (sender, type) {
                me.remove();
            });
            var qxfun = function () {
                me.remove();
            };
            var qdfun = function () {
                if (me.colorArr.length < 1) {
                    G.tip_NB.show(L('TJP_NO_SELECT_COLOR_' + me.curType));
                    return;
                }
                var tip = false;
                for (var j = 0; j < _CONF[me.curType].need_tip_color.length; j++) {
                    var need = _CONF[me.curType].need_tip_color[j];
                    if (X.inArray(me.colorArr, need) && me.color2Arr[need].length > 0) {
                        tip = true;
                    }
                }

                function send() {
                    G.ajax.send(_CONF[me.curType].api, [me.colorArr], function (data) {
                        if (!data) return;
                        var data = X.toJSON(data);
                        if (data.s == 1) {
                            G.tip_NB.show(X.createPrizeInfo(data.d.prize, 0, 1));
                            G.event.emit('plhandle_sucess', {type: me.curType, d: data.d});
                        }
                    });
                }

                if (tip) {
                    var str = L('TJP_COLOR_TIP_' + me.curType);
                    G.frame.alert.data({
                        cancelCall: null,
                        okCall: function () {
                            send();
                        },
                        sizeType: 3,
                        close: true,
                        closeCall: null,
                        richText: str
                    }).show();
                } else {
                    send();
                }
            };
            X.addBtn(me.view.nodes.panel_btn, {
                count: 2,
                texture: ['btn_hong.png', 'btn_lan.png'],
                title: [L('BTN_CANCEL'), L('BTN_OK')],
                callback: [qxfun, qdfun]
            });
        },
        onOpen: function () {
            var me = this;
            me.curType = me.data().type;
            new X.bView('ui_tip_sz.json', function (view) {
                me.ui.nodes.panel_nr.addChild(view);
                me.view = view;
                me.initUI();
                me.bindUI();
                me.setContents();
            });
        },
        onShow: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();