/**
 * Created by
 */
(function () {
    //赛龙舟-助威礼包
    var ID = 'sailongzhou_zwlb';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.img_banner.setBackGroundImage('img/duanwu/img_banner2.png',1);
            me.nodes.txt_title.setString(L('slz_tip2'));
            X.timeout(me.nodes.txt_sj, X.getTodayZeroTime() + 24 * 3600, function () {
                G.frame.sailongzhou.getData(function () {
                    G.tip_NB.show(L('slz_tip6'));
                    me.setContents();
                })
            }, null, {showStr: L("slz_tip4")});
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            var me = this;
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.conf = G.gc.longzhou;
            me.setContents();
        },
        setContents: function () {
            var me = this;
            me.libaoData = G.frame.sailongzhou.DATA.myinfo.libao;
            var libao = me.conf.libao;
            var keys = X.keysOfObject(libao);
            keys.sort(function (a,b) {
                var ta =  me.conf.libao[a];
                var tb =  me.conf.libao[b];
                var sya = ta.buynum - (me.libaoData[a]||0);
                var syb = tb.buynum - (me.libaoData[b]||0);
                var orderA = (sya<1)?-1000000:-ta.money||0;
                var orderB = (syb<1)?-1000000:-tb.money||0;
                return orderA > orderB ? -1:1;
            });
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.nodes.scrollview.removeAllChildren();
            me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao2, 1, function (ui, data) {
                me.setItem(ui, data);
            },null, null, 10, 0);
            me.table.setData(keys);
            me.table.reloadDataWithScroll(true);
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            var conf = me.conf.libao[data];
            ui.nodes.libao_mz.setString(conf.name);
            ui.nodes.libao_mz.setTextColor(cc.color('#804326'));
            var ygm = me.libaoData[data]||0;
            var synum = conf.buynum - ygm;
            ui.nodes.ico_nr.setTouchEnabled(false);
            X.alignItems(ui.nodes.ico_nr, conf.prize, 'left', {
                touch: true,
                scale:.8
            });
            ui.nodes.ico_list.hide();
            ui.nodes.wz_xg.setString(X.STR(L('slz_tip8'),synum));
            ui.nodes.wz_xg.setTextColor(cc.color(synum>0?'#7b531a':'#ff4e4e'));
            X.render({
                zs_wz: function (node) {
                    if (synum<=0){
                        node.setString(L("BTN_YSQ"));
                    } else {
                        var need = conf.need[0] || {};
                        node.setString('');
                        node.removeAllChildren();
                        if (conf.money == 0) {
                            var ico = new ccui.ImageView(G.class.getItemIco(need.t), 1);
                            ico.scale = .8;
                            X.setRichText({
                                str: '<font node=1></font>' + X.fmtValue(need.n),
                                parent: node,
                                node: ico,
                                color: synum<1 ? '#6c6c6c' : '#7b531a',
                                size: node.fontSize,
                                maxWidth: node.width + 20
                            });
                        } else {
                            node.setString(conf.money / 100 + L("YUAN"));
                            node.setTextColor(cc.color(synum<1 ? '#6c6c6c' : '#7b531a'));
                        }
                    }
                },
                btn_gm:function (node) {
                    node.data = conf;
                    node.key = data;
                    node.setBright(synum>0);
                    node.setTouchEnabled(synum>0);
                    node.click(function (sender,type) {
                        if (sender.data.money == 0){
                            me.ajax('longzhou_libao', [sender.key], function(str, data){
                                if (data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize:data.d.prize
                                    }).show();
                                    G.frame.sailongzhou.DATA.myinfo = data.d.myinfo;
                                    me.setContents();
                                }
                            });
                        } else {
                            G.event.once('paysuccess', function(arg) {
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: sender.data.prize
                                }).show();
                                G.frame.sailongzhou.getData(function () {
                                    me.setContents();
                                });
                                // G.hongdian.getData('labour', 1, function () {
                                //     G.frame.wyhd.checkRedPoint();
                                // });
                            });
                            G.event.emit('doSDKPay', {
                                pid:sender.data.proid,
                                logicProid: sender.data.proid,
                                money: sender.data.money,
                            });
                        }

                    },1000)
                }
            }, ui.nodes);

        }
    });
    G.frame[ID] = new fun('duanwu_tk2.json', ID);
})();