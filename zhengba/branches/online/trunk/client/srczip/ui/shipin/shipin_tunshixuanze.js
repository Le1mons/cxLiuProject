/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //饰品-吞噬选择
    var ID = 'shipin_tunshixuanze';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
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

            me.curType = '5';
            me.item = me.data().item;
            me.curTid = me.item.data.tid;
            me.curId = me.item.data.spid;
            me.conf = G.class.shipin.getById(me.curId);

            me.ui.nodes.panel_nr.removeAllChildren();

            new X.bView('zhuangbei_tip1.json', function (view) {
                me._view = view;

                me.defHeight = me._view.height;
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

            //头像
            var wid = G.class.sshipin(conf);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            // 名字
            setTextWithColor(txtName,conf.name,G.gc.COLOR[conf.color || 1]);
            // 类型
            txtType.setString(L('ZHUANGBEI_TYPE_' + me.curType));

            // buffar
            var str = '';
            var buffArr = X.fmtBuff(conf.buff);
            for (var i = 0; i < buffArr.length; i++) {
                var bObj = buffArr[i];
                str += bObj.tip + '<br>';
            }
            var rh = new X.bRichText({
                size:22,
                maxWidth:layBuff.width,
                lineHeight:34,
                color:G.gc.COLOR.n5,
                family:G.defaultFNT,
            });
            if(conf.intr){
                str += conf.intr + "<br>";
            }
            if (!conf.zhongzu || conf.zhongzu == '') {
                rh.text(str);
            } else {
                //种族特性

                var zzBuffArr = X.fmtBuff(conf.zhongzubuff);
                str += '<font size=20 color='+ G.gc.COLOR.n10 +'>' + X.STR(L('ZHONGZU_NEED'),L('zhongzu_' + conf.zhongzu)) + '</font>' + '<br>';

                for (var i = 0; i < zzBuffArr.length; i++) {
                    var zzbObj = zzBuffArr[i];
                    str += '<font color=' + G.gc.COLOR.n10 + '>' + zzbObj.tip + '</font><br>';
                }

                rh.text(str);
            }
            var offsetY = rh.trueHeight();
            panel.nodes.panel_bg.setContentSize( cc.size(panel.nodes.panel_bg.width,panel.nodes.panel_bg.height + offsetY + panel.nodes.panel_3.height + 10));
            ccui.helper.doLayout( panel.nodes.panel_bg);

            rh.setPosition(cc.p(0,0));
            layBuff.addChild(rh);
        },
        setBtns: function () {
            var me = this;

            var panel = me._view;
            var layBtns = panel.nodes.panel_3;

            layBtns.removeAllChildren();

            var state = {
                btns:[
                    {
                        setBtn: function (item) {
                            // 加入一个
                            item.loadTextureNormal('img/public/btn/btn3_on.png',1);
                            item.setTitleText(L('BTN_ADD1'));
                            item.setTitleColor(cc.color(G.gc.COLOR.n14));
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_ENDED) {
                                    if(me.conf.color > 3){
                                        var str = X.STR(L("OKCOLOR"), me.conf.color == 4 ? L("CCOLOR"):L("HCOLOR"));
                                        G.frame.alert.data({
                                            title: L("TS"),
                                            cancelCall: function () {
                                                me.remove();
                                            },
                                            okCall: function () {
                                                var callback = me.data().callback;
                                                callback && callback({id:me.curTid,num:1,spid:me.curId});
                                                var lessnum = G.frame.beibao.DATA.shipin.list[me.curTid].num - G.frame.shipin_shengji.selectedData[me.curId];
                                                me.item.num.setString(lessnum);
                                            },
                                            richText: str,
                                        }).show();
                                    }else{
                                        var callback = me.data().callback;
                                        callback && callback({id:me.curTid,num:1,spid:me.curId});
                                        var lessnum = G.frame.beibao.DATA.shipin.list[me.curTid].num - G.frame.shipin_shengji.selectedData[me.curId];
                                        me.item.num.setString(lessnum);
                                    }



                                }
                            });
                        }
                    },
                    {
                        setBtn: function (item) {
                            //加入十个
                            item.setTitleText(L('BTN_ADD10'));
                            item.setTitleColor(cc.color(G.gc.COLOR.n13));
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_ENDED) {
                                    if(me.conf.color > 3){
                                        var str = X.STR(L("OKCOLOR"), me.conf.color == 4 ? L("CCOLOR"):L("HCOLOR"));
                                        G.frame.alert.data({
                                            title: L("TS"),
                                            cancelCall: function () {
                                                me.remove();
                                            },
                                            okCall: function () {
                                                var callback = me.data().callback;
                                                callback && callback({id:me.curTid,num:10,spid:me.curId});
                                                var lessnum = G.frame.beibao.DATA.shipin.list[me.curTid].num - G.frame.shipin_shengji.selectedData[me.curId];
                                                me.item.num.setString(lessnum);
                                            },
                                            richText: str,
                                        }).show();
                                    }else{
                                        var callback = me.data().callback;
                                        callback && callback({id:me.curTid,num:10,spid:me.curId});
                                        var lessnum = G.frame.beibao.DATA.shipin.list[me.curTid].num - G.frame.shipin_shengji.selectedData[me.curId];
                                        me.item.num.setString(lessnum);
                                    }

                                }
                            });
                        }
                    }
                ]
            };

            var btn = new ccui.Button();
            var img = 'img/public/btn/btn1_on.png';
            btn.loadTextures(img,'','',1);
            btn.setTitleFontName(G.defaultFNT);
            btn.setTitleFontSize(24);
            X.autoLayout_new({
                parent:layBtns,
                item:btn,
                num:state.btns.length,
                mapItem: function (item) {
                    var idx = item.idx;
                    var btnsConf = state.btns;
                    btnsConf[idx].setBtn(item);
                }
            });

        }
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();