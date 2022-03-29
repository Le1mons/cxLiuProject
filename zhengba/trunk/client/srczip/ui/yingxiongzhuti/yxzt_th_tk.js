/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //
    var ID = 'yxzt_th_tk';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = me.data().conf;
            me.num = 1;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            me.ui.finds('bg_1').setTouchEnabled(true);
            me.nodes.txt_qr.setString(L('DUIHUAN'));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            var maxnum = me.DATA.num || me.conf.duihuan[me.DATA.id].maxnum;
            X.render({
                btn_1: function (node) {
                    node.click(function (sender) {
                        if (me.num > 1) {
                            me.num--;
                            me.setContents();
                        }
                    })
                },
                btn_2: function (node) {
                    node.click(function (sender) {
                        if (me.num < maxnum) {
                            me.num++;
                            me.setContents();
                        }
                    })
                },
                btn_jian10: function (node) {
                    node.click(function (sender) {
                        if (me.num - 10 > 0) {
                            me.num -= 10;
                            me.setContents();
                        }
                    })
                },
                btn_jia10: function (node) {
                    node.click(function (sender) {
                        if (me.num + 10 <= maxnum) {
                            me.num += 10;
                            me.setContents();
                        }
                    })
                },
                btn_qr: function (node) {
                    node.id = me.DATA.id
                    node.click(function (sender) {
                        if (me.data().type == 'yxzt') {
                            me.herotheme(sender.id);
                        } else if(me.data().type == 'sdj'){
                            me.christmas(sender.id);
                        }
                    })
                },
            }, me.nodes);
        },
        christmas: function (id) {
            var me = this;
            G.ajax.send("christmas_duihuan", [id, me.num], function (str, data) {
                if (data.s == 1) {
                    G.frame.jiangli.once('close', function () {
                        // G.hongdian.getData('herotheme');
                        // G.frame.yingxiongzhuti.checkRedPoint();
                    }).data({
                        prize: data.d.prize
                    }).show();
                    G.frame.shengdanjie.DATA.myinfo = data.d.myinfo;
                    G.frame.shengdanjie_sdhl.DATA.myinfo = data.d.myinfo;
                    G.frame.shengdanjie_sdhl.setContents();
                    me.remove();
                }
            });
        },
        herotheme: function (id) {
            var me = this;
            G.ajax.send("herotheme_duihuan", [id, me.num], function (str, data) {
                if (data.s == 1) {
                    G.frame.jiangli.once('close', function () {
                        G.hongdian.getData('herotheme');
                        G.frame.yingxiongzhuti.checkRedPoint();
                    }).data({
                        prize: data.d.prize
                    }).show();
                    me.DATA = data.d.myinfo;
                    G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                    G.frame.yxzt_yxth.DATA = data.d.myinfo;
                    G.frame.yxzt_yxth.setContents();
                    me.remove();
                }
            });
        },
        setContents: function () {
            var me = this;
            var prize1 = [];
            for (var i = 0; i < me.num; i++) {
                var conf = me.conf.duihuan[me.DATA.id];
                prize1.push(conf.prize[0]);
            }
            var data = X.mergeItem(prize1);
            X.alignItems(me.nodes.panel_1, data, 'center', {
                touch: true,
                // scale: 0.8,
            });
            X.render({
                textfield_5: function (node) {
                    node.setString(me.num);
                },
                panel_hbrq: function (node) {
                    node.hide();
                },
            }, me.nodes);
        },
    });
    G.frame[ID] = new fun('zhanhunlin_tk2.json', ID);
})();