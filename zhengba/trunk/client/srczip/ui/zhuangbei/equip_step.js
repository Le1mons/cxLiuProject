/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'equip_step';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.showToper();
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_rl.click(function () {
                var args = [me.data().id];
                if (me.data().wear) args.push(G.frame.yingxiong_xxxx.curXbId);
                else args.push('');
                me.ajax("equip_shengjie", args, function (str, data) {
                    if (data.s == 1) {
                        G.class.ani.show({
                            json: "shenzhuang_jinjie",
                            addTo: me.nodes.panel_dh,
                            onend: function () {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).once("willClose", function () {
                                    me.remove();
                                }).show();
                            }
                        });
                        if (me.data().wear) {
                            G.frame.yingxiong_xxxx.emit('updateInfo');
                        } else {
                            G.frame.beibao._panels && G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                        }
                    }
                });
            }, 2000);

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L("TS61")
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.equip[me.data().id];
            var stepConf = G.gc.equipstep[conf.type];
            var key, prokey;
            for (var k in stepConf.buff) {
                if (k.indexOf('pro') != -1) prokey = k;
                else key = k;
            }

            me.nodes.panel_dw_6.setBackGroundImage('ico/equipico/' + stepConf.ico + ".png");
            X.render({
                txt_pz1: '红品',
                txt_pz2: '红品+',
                txt_zz1: "无",
                txt_zz2: "随机",
                txt_sh1: conf.buff[prokey] / 10 + '%',
                txt_sh2: stepConf.buff[prokey] / 10 + '%(+' + stepConf.jobbuff[prokey] / 10 + "%)",
                txt_gj1: conf.buff[key],
                txt_gj2: stepConf.buff[key] + '(+' + stepConf.jobbuff[key] + ")",
            }, me.nodes);
            me.ui.finds("txt_3").setString(L(prokey) + ':');
            me.ui.finds("txt_4").setString(L(prokey) + ':');
            me.ui.finds("txt_5").setString(L(key) + ':');
            me.ui.finds("txt_6").setString(L(key) + ':');

            X.alignItems(me.nodes.panel_t_yx, conf.shengjie.need, 'left', {
                touch: true,
                mapItem: function (node) {
                    node.num.setAnchorPoint(0.5, 0.5);
                    node.num.setPosition(50, -21);
                    var num = node.data.a == 'equip' ? me.getNum() : G.class.getOwnNum(node.data.t, node.data.a);
                    var color = num >= node.data.n ? "#3fc814" : "#ee4444";
                    var outline = num >= node.data.n ? "#124100" : "#740000";
                    node.num.setString(X.fmtValue(num) + "/" + X.fmtValue(node.data.n));
                    node.num.setTextColor(cc.color(color));
                    X.enableOutline(node.num, outline, 2);
                }
            });
        },
        getNum: function () {
            var me = this;
            var equipId = me.data().id;
            var num = 0;

            for (var tid in G.frame.beibao.DATA.zhuangbei.list) {
                if (G.frame.beibao.DATA.zhuangbei.list[tid].eid == equipId) {
                    num = G.frame.beibao.DATA.zhuangbei.list[tid].num - G.frame.beibao.DATA.zhuangbei.list[tid].usenum;
                    break;
                }
            }
            if (!num) return num;
            if (me.data().wear) return num;
            return num - 1;
        }
    });
    G.frame[ID] = new fun('ui_shenzhuang.json', ID);
})();