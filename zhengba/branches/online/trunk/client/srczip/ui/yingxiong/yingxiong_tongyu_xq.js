/**
 * Created by LYF on 2018/11/7.
 */
(function () {
    //统御详情
    var ID = 'yingxiong_tongyu_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_tity.click(function () {
                if(!me.isMoney) {
                    G.tip_NB.show(L("JB") + L("BUZU"));
                    return;
                }
                var arr = [];
                for (var i in me.selectedData) {
                    for (var j in me.selectedData[i]) {
                        arr.push(me.selectedData[i][j]);
                    }
                }
                me.ajax("hero_tyupgrade", [me.DATA.data.maxlv > 1 ? me.DATA.conf[1].hid : me.DATA.conf[0].hid, arr], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.once("hide", function () {
                            G.class.ani.show({
                                json: "ani_tongyu_shengji",
                                addTo: me.nodes.panel_kuangtx,
                                x: me.nodes.panel_kuangtx.width / 2,
                                y: me.nodes.panel_kuangtx.height / 2,
                                repeat: false,
                                autoRemove: true,
                                onload: function () {
                                    G.class.ani.show({
                                        json: "ani_tongyu_shengji2",
                                        addTo: me.nodes.btn_tity,
                                        x: me.nodes.btn_tity.width / 2,
                                        y: me.nodes.btn_tity.height / 2,
                                        repeat: false,
                                        autoRemove: true,
                                        onload: function () {
                                            me.DATA.data = data.d.data;
                                            me.selectedData = {};
                                            me.setInfo();
                                            G.frame.yingxiong_xxxx.tongyu.DATA.data[me.DATA.id] = data.d.data;
                                            G.frame.yingxiong_xxxx.tongyu.setTianMing();
                                            G.frame.yingxiong_xxxx.tongyu.setItem(G.frame.yingxiong_xxxx.tongyu.select, me.DATA.id);
                                            G.hongdian.getData("destiny", 1, function () {
                                                G.frame.yingxiong.checkRedPoint();
                                                G.frame.yingxiong_xxxx.tongyu.checkRedPoint();
                                            })
                                        }
                                    })
                                }
                            })
                        }).data({
                            prize: data.d.prize
                        }).show();
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.DATA = me.data();
            me.maxlv = me.DATA.conf[1].tenstarmodel ? 10 - 4 : 9 - 4;
            me.selectedData = {};
            me.ui.finds("Image_1").loadTexture("img/bg/tongyu_kapaidi.png");
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var str = X.STR("<font node=1></font> {1}", me.DATA.conf[0].name);
            var img = new ccui.ImageView('img/public/ico/ico_zz' + (me.DATA.conf[0].zhongzu + 1) + '_s.png', 1);
            var rh = new X.bRichText({
                size: 18,
                lineHeight: 32,
                maxWidth: me.nodes.ico_zy.width,
                color: "#ffffff",
                family: G.defaultFNT,
                eachText:function (node) {
                    X.enableOutline(node, "#000000", 1);
                }
            });
            rh.text(str, [img]);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(me.nodes.ico_zy.width / 2, me.nodes.ico_zy.height / 2);
            me.nodes.ico_zy.addChild(rh);

            
            X.setModel({
                parent: me.nodes.ty_rw,
                data: {
                    hid: me.DATA.model
                },
                scale: .94
            });

            G.class.ani.show({
                json: G.class.herocom.getZhongzuById(me.DATA.conf[0].zhongzu).ani,
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2 - 5,
                y: 330,
                repeat: true,
                autoRemove: false
            });

            G.class.ui_star(me.nodes.panel_xx, me.DATA.data.maxlv + 4, 0.8, null, true);

            me.setInfo();
        },
        setInfo: function () {
            var me = this;
            var extneed = [];
            var conf = G.class.tongyu.get().base.need[me.DATA.data.mylv + 1];

            for(var i in conf) {
                if(i == "item") continue;
                for (var j in conf[i]) {
                    extneed.push(conf[i][j]);
                }
            }

            me.nodes.txt_jb.setString(L("TY") + me.DATA.data.mylv + "/" + me.maxlv);

            if(me.DATA.data.mylv >= me.maxlv) {
                me.nodes.txt_zuo.hide();
                me.nodes.txt_you.hide();
                me.nodes.ico_tmd.hide();
                me.nodes.txt_tj.hide();
                me.nodes.txt_dj.hide();
                me.nodes.img_mang.show();
                me.ui.finds("Image_4").hide();
                me.ui.finds("Image_2").hide();
                me.nodes.panel_ico.hide();
                me.nodes.btn_tity.hide();
                me.nodes.huobi_di.hide();
            }else {
                me.nodes.txt_zuo.setString(X.STR(L("SZXJ"), me.DATA.data.mylv + 1));
                me.nodes.txt_you.setString("+" + G.class.tongyu.get().base.tmprize[me.DATA.data.mylv + 1][0].n);
                me.nodes.txt_tj.setString(X.STR(L("SJTJ"), me.DATA.data.mylv + 5));
                me.nodes.txt_dj.setString("(" + (me.DATA.data.maxlv + 4) + "/" + (me.DATA.data.mylv + 5) + ")");
                me.nodes.btn_tity.show();
                me.nodes.txt_dj.setTextColor(cc.color(me.DATA.data.mylv + 5 > me.DATA.data.maxlv + 4 ? "#c80000" : "#69A112"));
                me.isMoney = P.gud[conf.item[0].t] < conf.item[0].n ? false : true;
                me.nodes.ico_jb.setBackGroundImage(G.class.getItemIco(conf.item[0].t), 1);
                me.ui.finds("Text_1").setString(conf.item[0].n);
                me.ui.finds("Text_1").setTextColor(cc.color(!me.isMoney ? "#ff4e4e" : "#ffffff"));
                !me.isMoney && X.enableOutline(me.ui.finds("Text_1"),cc.color("#740000"),1);
                me.nodes.panel_ico.removeAllChildren();

                var autoLayout = new X.extendLayout(me.nodes.panel_ico, extneed.length);
                autoLayout.setDelegate({
                    cellCount: function () {
                        return 3;
                    },
                    nodeWidth: function () {
                        return 110*0.8;
                    },
                    rowHeight: function () {
                        return 110*0.8;
                    },
                    itemAtIndex: function (index) {
                        var need = extneed[index];
                        var needNum = need.num;

                        need.showNum = true;

                        var widget = G.class.new_shero_extneed(need, me.DATA.conf[0]);
                        widget.setScale(.8);
                        widget.setEnabled(false);
                        widget.setTouchEnabled(true);
                        setTextWithColor(widget.txt_num, X.STR('{1}/{2}', 0, needNum), G.gc.COLOR['n16']);
                        X.enableOutline(widget.txt_num,cc.color('#740000'),1);
                        widget.txt_num.setPosition(cc.p(widget.width / 2 ,widget.txt_num.height * (-0.5)));
                        widget.index = index;
                        widget.need = need;
                        widget.click(function (sender) {
                            var callback = function (d) {
                                G.frame.yingxiong_tongyu_xq.selectedData[sender.index] = d;
                                var hav = d.length;
                                setTextWithColor(sender.txt_num, X.STR('{1}/{2}', hav, sender.need.num), G.gc.COLOR[hav >= sender.need.num ? 1 : 'n16']);
                                if(hav < sender.need.num){
                                    X.enableOutline(sender.txt_num,cc.color('#740000'),1);
                                }else{
                                    X.disableOutline(sender.txt_num);
                                    X.enableOutline(sender.txt_num,cc.color('#2a1c0f'),0.1)
                                }
                                sender.setEnabled(hav >= sender.need.num);
                            };
                            G.frame.ui_tip_xuanze.data({
                                need:sender.need,
                                idx:sender.index,
                                hid: me.DATA.conf[0].hid,
                                IdxData:G.frame.yingxiong_tongyu_xq.selectedData[sender.index],
                                selectedData: G.frame.yingxiong_tongyu_xq.selectedData,
                                callback:callback
                            }).show();
                        });
                        return widget;
                    }
                });
                autoLayout.layout();
            }
        }
    });
    G.frame[ID] = new fun('tongyu_tip.json', ID);
})();