/**
 * Created by yaosong on 2018/12/28.
 */
(function () {
    //王者荣耀-战斗日志
    var ID = 'wangzherongyao_log';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUI();
            me.bindUI();
        },
        onShow: function () {
            var me = this;
            me.getData();

        },
        onAniShow:function(){
            var me = this;

        },
        onHide: function () {
            var me = this;

        },
        initUI: function () {
            var me = this;
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        getData: function () {
            var me = this;
            G.ajax.send('crosswz_winlog',[me.data().uid,me.data().deep],function (rd) {
                rd = X.toJSON(rd);
                if (rd.s == 1){
                    me.setData(rd.d);
                }
            })
        },
        setData: function (data) {
            var me = this;
            var players = data.fightuser,
                logs = data.winlog;

            // me.ui.finds('bg_' + logs.length).show();
            me.ui.nodes.panel_tip.setString(L('WZRY_LOG' + logs.length));

            for (var i = 0; i < 2; i++){
                var wj = me.ui.nodes["panel_js" + (i+1)];
                me.setWJ(wj,players[i],(i+1));
            }

            function setItem(item, log, id) {
                X.autoInitUI(item);
                item.nodes.txt_cs.setString(X.STR(L("WZRY_DJC"),L(id)));
                if (log.showtime > G.time) {
                    item.nodes.btn_qd.hide();
                    item.nodes.panel_sz1.setBackGroundImage('img/wangzherongyao/img_lxdd.png', ccui.Widget.PLIST_TEXTURE);
                    item.nodes.panel_sz2.setBackGroundImage('img/wangzherongyao/img_lxdd.png', ccui.Widget.PLIST_TEXTURE);
                } else {
                    item.nodes.btn_qd.touch(function(sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.ajax.send('crosszb_fightreplay', [log.fid], function(rd) {
                                if (!rd) return;
                                rd = X.toJSON(rd);
                                if (rd.s == 1) {
                                    // G.frame.fightVedio.once('fightEnd', function(d) {
                                    //
                                    // }).title(L('fight_review')).startFight(rd.d.flog).show();
                                    G.frame.fight.data({
                                        pvType: 'pvwz',
                                        isVideo: true,
                                        session: 0,
                                        fightlength: rd.d.length,
                                        fightData:rd.d,
                                        callback: function(session) {
                                            G.frame.fight.demo(rd.d[session]);
                                        }
                                    }).once('show', function() {

                                    }).demo(rd.d[0]);

                                }
                            }, true);
                        }
                    });
                    var winside = X.arrayFind(players, log.winuid);
                    item.nodes.panel_sz1.setBackGroundImage('img/wangzherongyao/img_lx' + ['sl', 'sb'][winside] + '.png', ccui.Widget.PLIST_TEXTURE);
                    item.nodes.panel_sz2.setBackGroundImage('img/wangzherongyao/img_lx' + ['sb', 'sl'][winside] + '.png', ccui.Widget.PLIST_TEXTURE);
                }
                item.show();
            }
            var listview = me.ui.nodes.listview_lx;
            listview.removeAllChildren();
            var list = me.ui.nodes.list;
            var listview_h = (list.height + 3) * logs.length - listview.height;
            me.nodes.panel_bg.height += listview_h;
            ccui.helper.doLayout(me.nodes.panel_bg);
            listview.setTouchEnabled(false);

            for (var i = 0; i < logs.length; i++) {
                var list_c = list.clone();
                setItem(list_c, logs[i], (i+1));
                listview.pushBackCustomItem(list_c);
            }

        },
        setWJ: function (wj, uid, idx) {
            var me = this;
            X.autoInitUI(wj);
            var data = G.frame[me.data().frame].DATA.playerList[uid];
            wj.nodes["panel_tx" + idx].removeAllChildren();
            var head = G.class.shead(data,false);
            head.setAnchorPoint(0,0);

            var panel_name = wj.nodes["panel_name" + idx];
            var str1 = data.name + "<font color=#FFC355>(" + data.ext_servername + ")</font>";
            var rh1 = new X.bRichText({
                size:16,
                maxWidth:panel_name.width,
                lineHeight:20,
                family:G.defaultFNT,
                color:G.gc.COLOR.n5
            });
            rh1.text(str1);
            rh1.setPosition(cc.p((panel_name.width - rh1.trueWidth())/2,0));
            panel_name.addChild(rh1);
            wj.nodes["panel_tx" + idx].addChild(head);
            // wj.nodes["txt_name" + idx].setString(data.name);
            // wj.nodes["txt_qf" + idx].setString(data.ext_servername);
            wj.nodes["txt_name" + idx].hide();
            wj.nodes["txt_qf" + idx].hide();
            wj.nodes["txt_zl" + idx].setString(data.zhanli || "");
            wj.setTouchEnabled(true);
            wj.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED){
                    G.ajax.send('crosswz_userdetails',[uid],function(rd) {
                        rd = X.toJSON(rd);

                        if (rd.s === 1) {
                            G.frame.wangzherongyao_wjxx.data({frame:me.ID(), data: rd.d}).show();
                        }
                    },true);
                }
            });
        },
    });

    G.frame[ID] = new fun('wangzherongyao_top1.json', ID);
})();
