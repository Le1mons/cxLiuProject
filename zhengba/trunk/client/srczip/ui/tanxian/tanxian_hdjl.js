/**
 * Created by LYF on 2019/4/24.
 */
(function () {
    //探险-获得奖励
    var ID = 'tanxian_hdjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes['1txt_djgb'].setTouchEnabled(true);
            me.nodes['1txt_djgb'].click(function () {
                return me.nodes.mask.triggerTouch(ccui.Widget.TOUCH_ENDED);
            });

            me.nodes.txt_djgb.hide();
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();

            G.class.ani.show({
                json: "ani_tanxianshouyi_shalou",
                addTo: me.nodes.panel_sl,
                repeat: true,
                autoRemove: false
            });
        },
        onAniShow: function () {
            var me = this;
            G.guidevent.emit('jiangliShowOver');
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
            me.ui.setTimeout(function () {
                me.setContents();
            }, 300);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var jdt = me.nodes.img_jdt;
            var data = G.DATA.P;
            me.nodes.txt_sj.setString(X.timeLeft(me.DATA.time));

            var head = G.class.shead(P.gud);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(me.nodes.panel_tx.width / 2, me.nodes.panel_tx.height / 2);
            me.nodes.panel_tx.addChild(head);

            me.nodes.txt_name.setString(L("PHB_DJ") + P.gud.lv + L("JI"));

            if(data.old_lv != data.new_lv && G.DATA.islvChange) {
                var old_maxExp = G.class.getConf('player')[data.old_lv].maxexp;
                var old_exp = data.old_exp;

                var new_maxExp = G.class.getConf('player')[data.new_lv].maxexp;
                var new_exp = data.new_exp;

                me.nodes.img_jdt.setPercent(old_exp / old_maxExp * 100);
                me.ui.setTimeout(function () {
                    me.nodes.img_jdt.setPercentAni(100, function () {
                        me.nodes.img_jdt.setPercent(0);
                        me.ui.setTimeout(function () {
                            me.nodes.img_jdt.setPercentAni(new_exp / new_maxExp * 100, null, true);
                        }, 200);
                    }, true);
                }, 200);
            } else {
                var old_exp = data.old_exp;
                var new_exp = data.new_exp;
                var new_maxExp = G.class.getConf('player')[P.gud.lv].maxexp;
                var oldPer = old_exp / new_maxExp * 100;
                var newPer = new_exp / new_maxExp * 100;
                me.nodes.img_jdt.setPercent(oldPer);

                me.ui.setTimeout(function () {
                    cc.log("++++++++++++++++++++++开始涨到当前");
                    me.nodes.img_jdt.setPercentAni(newPer, null, true);
                }, 200);
            }

            me.nodes.txt_jdt_wz.setString(P.gud.exp + "/" + G.class.getConf('player')[P.gud.lv].maxexp);

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list, 5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 12, 5);
            table.setData(me.DATA.prize);
            table.reloadDataWithScroll(true);

            var _data = G.frame.tanxian.DATA;
            var kstxNum = _data.freetxnum > 0 || _data.maxbuytxnum - _data.txnum > 0;
            me.nodes.txt_djgb.setVisible(kstxNum && !me.data().noShow && !G.guide.view);
            me.nodes['1txt_djgb'].setVisible(G.guide.view != null);
            if  (kstxNum) {
                if (_data.freetxnum > 0) {
                    me.nodes.zs_wz.setString(0);
                    me.nodes.daojishi.setString(L('FREENUM') + _data.freetxnum);
                } else {
                    me.nodes.daojishi.setString(L('LEFTNUM') + (_data.maxbuytxnum - _data.txnum));
                    var need = G.class.tanxian.getKstxNeed(_data.txnum);
                    me.nodes.zs_wz.setString(need[0].n);
                }
                me.nodes.txt_djgb.click(function () {
                    var dq_jifen = P.gud.jifen;
                    G.ajax.send('tanxian_fasttx',[],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.event.emit("sdkevent", {
                                event: "tanxian_fasttx"
                            });
                            G.frame.tanxian.checkRedPoint();
                            G.frame.tanxian.getData(function () {
                                G.class.ani.show({
                                    json: "ani_kuaisutiaozhan",
                                    addTo: G.frame.tanxian.ui,
                                    repeat: false,
                                    autoRemove: true,
                                    onload: function(node, action){
                                        X.audio.playEffect("sound/kuaisu.mp3", false);
                                        G.DATA.tanxianAni = true;
                                    },
                                    onend: function (node, action) {
                                        G.frame.tanxian_hdjl.data({
                                            time: 7200,
                                            prize: d.d.prize,
                                        }).show();
                                        G.DATA.tanxianAni = false;
                                        G.event.emit("aniEnd");
                                        for(var jf in d.d.prize){
                                            if(d.d.prize[jf].t == 'jifen'){
                                                G.frame.tanxian.yuan_jdl(dq_jifen,d.d.prize[jf].n);
                                                continue;
                                            }
                                        }
                                    }
                                });
                            });
                            G.view.mainView.getMainCityEvent();
                            me.remove();
                        }
                    },true)
                });
            }


        },
        setItem: function (ui, data) {
            ui.removeAllChildren();
            ui.data = data;
            var item = G.class.sitem(data);
            item.setPosition(ui.width / 2, ui.height / 2);
            ui.addChild(item);

            G.frame.iteminfo.showItemInfo(ui);
        }
    });
    G.frame[ID] = new fun('guajishouyi.json', ID);
})();