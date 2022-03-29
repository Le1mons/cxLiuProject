/**
 * Created by wfq on 2018/5/24.
 */
 (function () {
    //宝石-升级
    var ID = 'baoshi_shengji';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('SHENGJI'));

        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(me.isAniShow) return;
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

            var btnSj = panel.nodes.btn_zs;
            var imgZs = panel.nodes.image_zs;
            var txtZs = panel.nodes.text_sl;
            var checkBox = panel.nodes.checkbox_1;

            btnSj.show();
            checkBox.show();
            panel.finds('text_sd').show();

            var buffid = me.bsData[me.curId];

            var setBuff = function (i) {
                var lay = panel.nodes['panel_' + (i + 1)];
                var layBuff = lay.finds('panel_sx1$');
                var txtName = lay.finds('text_mz1$');
                var layIco = lay.finds('panel_tb1$');

                var arr = [me.curId,me.curId*1 + 1];
                layIco.removeAllChildren();
                layBuff.removeAllChildren();

                var wid = G.class.sbaoshi(arr[i]);
                wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
                wid.setScale(0.5);
                layIco.addChild(wid);

                setTextWithColor(txtName,wid.conf.name,G.gc.COLOR[wid.conf.color == 0 ? 'n4' : wid.conf.color]);
                if(!wid.conf.buff)return;
                var buff = wid.conf.buff[buffid];
                var str = '';
                var buffArr = X.fmtBuff(buff);
                for (var j = 0; j < buffArr.length; j++) {
                    var bObj = buffArr[j];
                    str += bObj.tip + '<br>';
                }
                var rh = new X.bRichText({
                    size:18,
                    maxWidth:layBuff.width,
                    lineHeight:20,
                    family:G.defaultFNT,
                    color:G.gc.COLOR[i == 1 ? 'n7' : 'n4']
                });
                rh.text(str);
                var offsetY = rh.trueHeight();
                rh.setPosition(cc.p(0,layBuff.height - offsetY));
                layBuff.addChild(rh);
            };

            setBuff(0);
            // panel.nodes.img_wzsj.show();
            // btnSj.setTitleText(L('BTN_SHENGJI'));
            // setBuff(1);


            var setBuffState = function (bool) {
                if (bool) {
                    panel.nodes.panel_2.show();
                    panel.nodes.img_wzsj.hide();
                    setBuff(1);
                    btnSj.setTitleText('');
                } else {
                    panel.nodes.panel_2.hide();
                    panel.nodes.img_wzsj.show();
                    btnSj.setTitleText(L('BTN_SHENGJI'));
                }
            };

            var setZs = function (bool) {
                imgZs.setVisible(bool);
                imgZs.setScale(1.1);
                txtZs.setVisible(bool);
            };

            setZs(false);
            txtZs.setString(conf.lockneed[0].n);
            me.needLock = 0;
            checkBox.setSelected(false);
            setBuffState(0);

            checkBox.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var isSelected = cc.sys.isNative;
                    
                    setZs(isSelected == sender.isSelected());
                    me.needLock = isSelected == sender.isSelected() ? 1 : 0;
                    setBuffState(me.needLock);
                }
            });

            btnSj.setTouchEnabled(true);
            btnSj.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    sender.setTouchEnabled(false);
                    G.ajax.send('baoshi_lvup',[me.curXbId,me.needLock],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            // G.tip_NB.show(L('SHENGJI') + L('SUCCESS'));
                            G.event.emit("sdkevent", {
                                event: "baoshi_lvup"
                            });
                            me.playAni(me.ui, function () {
                                G.frame.jiangli.data({
                                    prize:[{a:'baoshi',t:me.curId*1 + 1,n:1}]
                                }).once('show', function () {
                                    G.frame.yingxiong_xxxx.emit('updateInfo');
                                    if (me.curId * 1 == G.class.baoshi.getMaxLen() - 1) {
                                        me.ui.setTimeout(function () {
                                            me.remove();
                                        }, 500);
                                    }else{
                                        if(me.needLock){
                                         me.setContents();
                                         checkBox.setSelected(true);
                                         setBuffState(true); 
                                         setZs(true);
                                         txtZs.setString(conf.lockneed[0].n);
                                         me.needLock = true;
                                     }else{
                                        me.setContents();
                                    }
                                }
                            }).show();
                            });
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
            var need = conf.lvupneed;

            for (var i = 0; i < need.length; i++) {
                var nneed = need[i];
                var layAttr = view.nodes['panel_token' + (i + 1)];
                var txtAttr = view.nodes['txt_sz' + (i + 1)];

                layAttr.setBackGroundImage(G.class.getItemIco(nneed.t),1);
                var ownNum = G.class.getOwnNum(nneed.t,nneed.a);
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
            me.isAniShow = true;
            G.class.ani.show({
                json: "ani_baoshishenji",
                addTo: panel,
                x: panel.width / 2,
                y: panel.height / 2,
                repeat: false,
                autoRemove: true,
                onend: function (node, action) {
                    callback && callback();
                    me.isAniShow = false;
                }
            });
        }
    });

G.frame[ID] = new fun('ui_tip2.json', ID);
})();