/**
 * Created by wfq on 2018/5/24.
 */
(function () {
    //宝石-转换
    var ID = 'baoshi_zhuanhuan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('ZHUANHUAN'));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
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

            new X.bView('zhuangbei_shengji.json', function (view) {
                me._view = view;

                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);

                var btnZh = view.nodes.btn_zh;
                me.defaultPosX = btnZh.getPositionX();

                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setCenter();
            me.setXh();
        },
        setCenter: function () {
            var me = this;

            var panel = me._view;
            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.heroData = G.DATA.yingxiong.list[me.curXbId];
            me.bsData = me.heroData.weardata['6'];
            me.curId = X.keysOfObject(me.bsData)[0];
            me.conf = G.class.baoshi.getById(me.curId);

            var conf = me.conf;

            var btnZh = panel.nodes.btn_zh;
            var btnBc = panel.nodes.btn_bc;
            var imgZs = panel.nodes.image_zs;
            var txtZs = panel.nodes.text_sl;
            var checkBox = panel.nodes.checkbox_1;
            var txtCheckbox = panel.finds('text_sd');
            var imgWeizhi = panel.nodes.img_wzsj;
            var layRight = panel.nodes.panel_2;


            layRight.hide();
            btnZh.show();
            btnBc.hide();
            imgWeizhi.show();

            var setBuff = function (i) {
                var lay = panel.nodes['panel_' + (i + 1)];
                var layBuff = lay.finds('panel_sx1$');
                var txtName = lay.finds('text_mz1$');
                var layIco = lay.finds('panel_tb1$');

                var arr = [me.curId,me.curId];
                layIco.removeAllChildren();
                layBuff.removeAllChildren();

                var wid = G.class.sbaoshi(arr[i]);
                wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
                wid.setScale(0.5);
                layIco.addChild(wid);

                setTextWithColor(txtName,wid.conf.name,G.gc.COLOR[wid.conf.color == 0 ? 'n4' : wid.conf.color]);

                var buffid = [me.bsData[me.curId],me.nextId][i];
                var buff = conf.buff[buffid];

                // buff = {
                //     atk:10,
                //     hp:10,
                //     def:10,
                // };
                var str = '';
                var buffArr = X.fmtBuff(buff);
                for (var j = 0; j < buffArr.length; j++) {
                    var bObj = buffArr[j];
                    str += bObj.tip + '<br>';
                }
                var rh = new X.bRichText({
                    size:22,
                    maxWidth:layBuff.width,
                    lineHeight:20,
                    family:G.defaultFNT,
                    color:G.gc.COLOR[i == 1 ? 'n7' : 'n4']
                });
                rh.text(str);
                rh.setPosition(cc.p(0,layBuff.height - rh.trueHeight()));
                layBuff.addChild(rh);
            };

            setBuff(0);
            if (me.needBaocun) {
                setBuff(1);
                imgWeizhi.hide();
                layRight.show();
            }
            // setBuff(1);

            var setZs = function (bool) {
                imgZs.setVisible(bool);
                txtZs.setVisible(bool);
            };

            setZs(false);
            checkBox.hide();
            txtCheckbox.hide();


            if (me.needBaocun) {
                btnZh.setPositionX(me.defaultPosX);
                btnBc.show();
                panel.nodes.panel_wpslxq.hide();
            } else {
                btnZh.setPositionX(btnZh.getParent().width - btnZh.width / 2 - 9);
                panel.nodes.panel_wpslxq.y = 70;
                panel.nodes.panel_wpslxq.show();
            }

            //置换
            btnZh.setTouchEnabled(true);
            btnZh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    sender.setTouchEnabled(true);
                    G.ajax.send('baoshi_buffchange',[me.curXbId],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            me.needBaocun = true;
                            me.nextId = d.d.buffid;
                            me.playAni(me.ui, function () {
                                // G.tip_NB.show(L('YZH'));
                                me.setContents();
                            });
                        } else {
                            sender.setTouchEnabled(true);
                        }
                    },true);
                }
            });

            //保存
            btnBc.setTouchEnabled(true);
            btnBc.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // if (me.needBaocun) delete me.needBaocun;
                    // me.playAni(me.ui, function () {
                    //     me.setContents();
                    // });
                    sender.setTouchEnabled(false);
                    G.ajax.send('baoshi_buffsave',[me.curXbId],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            if (me.needBaocun) delete me.needBaocun;
                            // G.tip_NB.show(L('BAOCUN') + L('SUCCESS'));
                            me.setContents();
                            // me.playAni(me.ui, function () {
                            //
                            // });
                        } else {
                            sender.setTouchEnabled(true);
                        }
                    },true);
                }
            });
        },
        //消耗
        setXh: function () {
            var me = this;

            var view = me._view;

            var conf = me.conf;
            var need = conf.changeneed;

            for (var i = 0; i < need.length; i++) {
                var nneed = need[i];
                var layAttr = view.nodes['panel_token' + (i + 1)];
                var txtAttr = view.nodes['txt_sz' + (i + 1)];

                layAttr.setBackGroundImage(G.class.getItemIco(nneed.t),1);
                var ownNum = G.class.getOwnNum(nneed.t,nneed.a);
                //setTextWithColor(txtAttr,X.fmtValue(ownNum) + '/' + X.fmtValue(nneed.n),G.gc.COLOR[ownNum > nneed.n ? 'white' : 5]);
                setTextWithColor(txtAttr,X.fmtValue(ownNum) + '/' + X.fmtValue(nneed.n),G.gc.COLOR[ownNum >= nneed.n ? 'n8' : 'n16']);
                X.enableOutline(txtAttr,cc.color(ownNum >= nneed.n ? '#000000' : '#740000'),1);
            }

            X.alignItems(view.nodes.panel_wpslxq, need, 'left', {
                touch: true,
                scale: .8,
                mapItem: function (node) {
                    if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                        node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                    }
                }
            });
        },
        playAni: function (panel, callback) {
            var me = this;
            G.class.ani.show({
                json: "ani_baoshishenji",
                addTo: me.ui,
                x: me.ui.width / 2,
                y: me.ui.height / 2,
                repeat: false,
                autoRemove: true,
                onend: function (node, action) {
                    callback && callback();
                }
            });
        }
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();