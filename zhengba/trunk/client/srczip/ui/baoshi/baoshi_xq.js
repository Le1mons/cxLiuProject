/**
 * Created by wfq on 2018/5/24.
 */
(function () {
    //宝石-详情
    var ID = 'baoshi_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds('panel_1').touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
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
        onShow: function () {
            var me = this;

            me.curType = '6';
            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.bsData = G.DATA.yingxiong.list[me.curXbId].weardata[me.curType];
            me.curId = X.keysOfObject(me.bsData)[0];
            me.conf = G.class.baoshi.getById(me.curId);


            new X.bView('zhuangbei_tip1.json', function (view) {
                me._view = view;

                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                view.setTouchEnabled(true);
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var keys = X.keysOfObject(me.bsData);
            if(keys[0] * 1 > 1) {
                me._view.nodes.btn_sx.show();
                me._view.nodes.btn_sx.click(function () {
                    if(P.gud.rmbmoney < 100) return G.tip_NB.show(L("ZSBZ"));
                    G.frame.reset.data({
                        needNum: 100,
                        str: L("CZBS"),
                        callback: function () {
                            me.ajax("baoshi_recast", [me.curXbId], function (str, data) {
                                if(data.s == 1) {
                                    G.event.emit("sdkevent", {
                                        event: "baoshi_recast"
                                    });
                                    if(data.d.prize) {
                                        G.frame.jiangli.data({
                                            prize: data.d.prize
                                        }).show();
                                        G.frame.reset.remove();
                                        me.remove();
                                        G.frame.yingxiong_xxxx.emit('updateInfo');
                                    }
                                }
                            });
                        }
                    }).show();
                });
            }
            me.setTop();
            me.setBtns();
        },
        setTop: function () {
            var me = this;

            var panel = me._view;
            var conf = me.conf;

            var btnHqtj = panel.nodes.btn_hqtj;
            var layIco = panel.nodes.panel_1;
            var layBuff = panel.nodes.panel_2;
            var txtName = panel.nodes.text_1;
            var txtType = panel.nodes.text_2;
            var txtHqtj = panel.finds('text_hqtj');
            var layYx = panel.nodes.panel_4;

            layIco.removeAllChildren();
            layBuff.removeAllChildren();
            layYx.removeAllChildren();

            var heroData = G.DATA.yingxiong.list[me.curXbId];
            // 英雄
            var hero = G.class.shero(heroData);
            hero.setPosition(cc.p(layYx.width / 2,layYx.height / 2));
            layYx.addChild(hero);
            //精炼
            var jl=heroData.baoshijinglian ? heroData.baoshijinglian : 0;
            if(jl){
                var jlarr=X.fmtBuff(G.gc.baoshijinglian[me.bsData[me.curId]][jl].buff);
            }
            //头像
            var wid = G.class.sbaoshi(me.curId);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            // 名字
            setTextWithColor(txtName,conf.name,G.gc.COLOR[conf.color || 1]);
            // 类型
            txtType.setString(L('ZHUANGBEI_TYPE')+L('ZHUANGBEI_TYPE_' + me.curType));

            // buff
            //var buffArr = X.fmtBuff(me.conf.buff[me.bsData.buff]);
            var buffArr = X.fmtBuff(wid.conf.buff[me.bsData[me.curId]]);
            var str = '';
            for (var i = 0; i < buffArr.length; i++) {
                var buff = buffArr[i];
                if(jlarr && jlarr.length && jlarr[i]){
                    str += buff.tip +'<font color=#1c9700>(+' + jlarr[i].sz+ jlarr[i].name+ ')</font>' + '<br>';
                }else{
                    str += buff.tip + '<br>';
                }
            }
            var rh = new X.bRichText({
                size:22,
                maxWidth:layBuff.width,
                lineHeight:34,
                family:G.defaultFNT,
                color:G.gc.COLOR.n5
            });
            str += '<br><font size=20>' + ' ' + '</font>';
            rh.text(str);
            // var offsetY = rh.trueHeight() + 50;
            // panel.nodes.panel_bg.height += offsetY;
            // ccui.helper.doLayout(panel.nodes.panel_bg);
            var offsetY = rh.trueHeight();
            panel.nodes.panel_bg.setContentSize( cc.size(panel.nodes.panel_bg.width,panel.nodes.panel_bg.height + offsetY + panel.nodes.panel_3.height + 10 - 100));
            ccui.helper.doLayout( panel.nodes.panel_bg);

            rh.setPosition(cc.p(0, -20));
            layBuff.addChild(rh);
        },
        setBtns: function () {
            var me = this;

            var panel = me._view;
            var layBtns = panel.nodes.panel_3;

            layBtns.removeAllChildren();

            var state2num = {
                btns:[
                    {
                        setBtn: function (item) {
                            // 转换
                            item.setTitleText(L('BTN_ZHUANHUAN'));
                            item.setTitleColor(cc.color(G.gc.COLOR.n12));
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_ENDED) {
                                    G.frame.baoshi_zhuanhuan.once('show',function () {
                                        me.remove();
                                    }).show();
                                }
                            });
                        }
                    },
                    {
                        setBtn: function (item) {
                            //升级
                            item.setTitleText(L('BTN_SHENGJI'));
                            item.setTitleColor(cc.color(G.gc.COLOR.n12));
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_ENDED) {
                                    G.frame.baoshi_shengji.once('show',function () {
                                        me.remove();
                                    }).show();
                                }
                            });
                        },
                    },
                    {
                        setBtn: function (item) {
                            //精炼

                            item.setTitleText(L('BTN_JINGLIAN'));
                            item.setTitleColor(cc.color(G.gc.COLOR.n12));
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_ENDED) {
                                    var heroData = G.DATA.yingxiong.list[me.curXbId];
                                    var jl=heroData.baoshijinglian ? heroData.baoshijinglian : 0;
                                    if(jl >= 30){
                                        G.tip_NB.show(L('JLYMJ'));
                                        return;
                                    }
                                    G.frame.baoshi_jinglian.once('show',function () {
                                        me.remove();
                                    }).show();
                                }
                            });
                        }
                    }
                ]
            };
            var btnarr=[];
            if (me.curId * 1 == G.class.baoshi.getMaxLen()) {
                btnarr.push(state2num.btns[0]);
                btnarr.push(state2num.btns[2]);
            }else{
                btnarr.push(state2num.btns[0]);
                btnarr.push(state2num.btns[1]);
            }

            var btn = new ccui.Button();
            var img = 'img/public/btn/btn2_on.png';
            btn.loadTextures(img,'','',1);
            btn.setTitleFontName(G.defaultFNT);
            btn.setTitleFontSize(24);
            X.autoLayout_new({
                parent:layBtns,
                item:btn,
                num:btnarr.length,
                mapItem: function (item) {
                    var idx = item.idx;
                    var btnsConf = btnarr;
                    btnsConf[idx].setBtn(item);
                }
            });

        }
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();