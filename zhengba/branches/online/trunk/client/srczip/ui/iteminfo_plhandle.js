/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //道具-批量处理
    var ID = 'iteminfo_plhandle';

    var fun = X.bUi.extend({
        extConf:{
            equip:{
                btnCs: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    me.setMoneyState(true);
                    me.setMoney();
                    node.setTitleText(L('BTN_CHUSHOU'));
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            me.setNum();
                            me.setMoney();
                            G.ajax.send('equip_sale',[sender.tid,sender.showtype,me.csNum],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('CHUSHOU') + L('SUCCESS'));
                                    if (d.d.prize) {
                                        G.frame.jiangli.data({
                                            prize:[].concat(d.d.prize)
                                        }).once('show', function () {
                                            me.remove();
                                            G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                        }).show();
                                    }
                                }
                            },true);
                        }
                    });
                },
                btnPlus: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum > 1) {
                                me.csNum--;
                                me.setCsNum();
                                me.setMoney();
                            }
                        }
                    });
                },
                btnAdd: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum < me.maxNum) {
                                me.csNum++;
                                me.setCsNum();
                                me.setMoney();
                            }
                        }
                    });
                }
            },
            shipin:{
                btnCs: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    me.setMoneyState(true);
                    me.setMoney();
                    node.setTitleText(L('BTN_CHUSHOU'));
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            me.setNum();
                            me.setMoney();
                            G.ajax.send('equip_sale',[sender.tid,sender.showtype,me.csNum],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('CHUSHOU') + L('SUCCESS'));
                                    if (d.d.prize) {
                                        G.frame.jiangli.data({
                                            prize:[].concat(d.d.prize)
                                        }).once('show', function () {
                                            me.remove();
                                            G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                        }).show();
                                    }
                                }
                            },true);
                        }
                    });
                },
                btnPlus: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum > 1) {
                                me.csNum--;
                                me.setCsNum();
                                me.setMoney();
                            }
                        }
                    });
                },
                btnAdd: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum < me.maxNum) {
                                me.csNum++;
                                me.setCsNum();
                                me.setMoney();
                            }
                        }
                    });
                }
            },
            item:{
                btnCs: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    me.setMoneyState(false);
                    node.setTitleText(L('BTN_SHIYONG'));
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            me.setNum();
                            G.ajax.send('item_use',[sender.itemid,me.csNum],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    if (d.d.prize && d.d.prize.length > 0) {
                                        G.frame.jiangli.data({
                                            prize:[].concat(d.d.prize)
                                        }).show();
                                    }
                                    if(G.class.getItem(sender.itemid) && G.class.getItem(sender.itemid).usetype == 6) {
                                        G.tip_NB.show(L("JH") + G.class.getItem(sender.itemid).name + L("SUCCESS"));
                                    }
                                    me.remove();
                                    G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                }
                            },true);
                        }
                    });
                },
                btnPlus: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum > 1) {
                                me.csNum--;
                                me.setCsNum();
                            }
                        }
                    });
                },
                btnAdd: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum < me.maxNum) {
                                me.csNum++;
                                me.setCsNum();
                            }
                        }
                    });
                }
            },
            suipian:{
                btnCs: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    me.setMoneyState(false);
                    node.setTitleText(L('BTN_HECHENG'));
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            me.setNum();
                            if(me.csNum == 0){
                                G.tip_NB.show(L('WUFAHECHENG'));
                                return;
                            }
                            var list = G.DATA.yingxiong.list;
                            var keys = X.keysOfObject(list);
                            if(keys.length + me.csNum > G.DATA.heroCell.maxnum && me.DATA._type !== "3"){
                                G.frame.alert.data({
                                    sizeType: 3,
                                    cancelCall: null,
                                    okCall: function () {
                                        G.frame.yingxiong.show();
                                    },
                                    richText: L("YXLBYM"),
                                }).show();
                                me.remove();
                            }else{
                                G.ajax.send('item_use',[sender.itemid,me.csNum],function(d) {
                                    if(!d) return;
                                    var d = JSON.parse(d);
                                    if(d.s == 1) {
                                        if (d.d.prize) {
                                            G.frame.jiangli.data({
                                                prize:[].concat(d.d.prize),
                                                mapItem:function (item) {
                                                    item.txt_num.setString('x'+item.data.n);
                                                },
                                                isAni: true
                                            }).once('show', function () {
                                                me.remove();
                                                G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                            }).show();
                                        }
                                    }
                                },true);
                            }
                        }
                    });
                },
                btnPlus: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum > 1) {
                                me.csNum--;
                                me.setCsNum();
                            }
                        }
                    });
                },
                btnAdd: function (node) {
                    var me = G.frame.iteminfo_plhandle;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum < me.maxNum) {
                                me.csNum++;
                                me.setCsNum();
                            }
                        }
                    });
                }
            }
        },
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

            me.curId = me.data().tid;
            me.DATA = me.data().data;
            me.csNum = me.DATA.num;
            new X.bView('zhuangbei_tip3.json', function (view) {
                me._view = view;
                view.y = -60;
                view.nodes.panel_bg.setTouchEnabled(true);
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
            var data = me.DATA;
            var panel = me._view;
            var layIco = panel.nodes.panel_1;
            var txtName = panel.nodes.text_1;
            var btnPlus = panel.nodes.btn_1;
            var btnAdd = panel.nodes.btn_2;
            var btnCs = panel.nodes.btn_3;
            var txtNum = panel.nodes.textfield_5;
            txtNum.setTextHorizontalAlignment(1);
            txtNum.setTextVerticalAlignment(1);
            // txtNum.ft = me;
            // txtNum.addEventListener(me.sr, txtNum);
            X.setInput(txtNum, function () {
                me.csNum = txtNum.getString().trim() > me.maxNum ? me.maxNum : txtNum.getString().trim();
                if(data._type == 1 || data.type == 4) {
                    me.setCsNum();
                    me.setMoney();
                }else {
                    me.setCsNum();
                }
            });

            layIco.removeAllChildren();

            var  wid = G.class.sitem(data);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);
            // if(data._type == "3"){
            //     wid.finds("num").setString(data.sumNum);
            // }

            setTextWithColor(txtName,wid.conf.name,G.gc.COLOR[wid.conf.color || 1]);

            if(me.DATA.sumNum){
                me.csNum = me.maxNum = me.DATA.sumNum;
            }
            if (me.DATA.a == 'equip') {
                me.csNum = me.maxNum = me.DATA.num - me.DATA.usenum;
            }
            me.setCsNum();

            var obj = {
                1:'equip',
                2:'item',
                3:'suipian',
                4:'shipin'
            };
            me.extConf[obj[data._type]].btnPlus(btnPlus);
            me.extConf[obj[data._type]].btnAdd(btnAdd);

            btnCs.tid = me.curId;
            btnCs.showtype = wid.conf.type || '5'; //5代表饰品的装备类型
            btnCs.itemid = wid.conf.itemid;
            me.extConf[obj[data._type]].btnCs(btnCs);

            // txtNum.addEventListener(function (sender, type) {
            //     var txt = sender.getString().trim();
            //     me.inputNumber = txt * 1;
            // },me);
        },
        sr: function(sender, type){
            switch (type){
                case ccui.TextField.EVENT_INSERT_TEXT:
                    var aa = parseInt(sender.getString()[sender.getString().length - 1]);
                    if(aa >= 0 && sender.getString()[0] !== "0"){

                    }else{
                        G.tip_NB.show(L("QSRZQDSZ"));
                        sender.setString("");
                        return
                    }
                    break;
                default:
                    break;
            }
        },
        setCsNum: function () {
            var me = this;

            var panel = me._view;
            var txtNum = panel.nodes.textfield_5;
            txtNum.setString(me.csNum);

            me.setBtns();
        },
        setNum: function(){
            var me = this;
            var panel = me._view;
            var txtNum = panel.nodes.textfield_5;
            var txt = parseInt(txtNum.getString());
            if(txt >= 0 && txt <= me.csNum){
                me.csNum = txt;
            }else if(txt > me.csNum){
                
            }else{
                me.csNum = 1;
                txtNum.setString(1);
            }
        },
        setMoneyState: function (bool) {
            var me = this;

            var panel = me._view;
            var imgAttr = panel.finds('image_3');
            var txtAttr = panel.nodes.text_2;
            var imgBg = panel.finds('image_2');

            imgAttr.setVisible(bool);
            txtAttr.setVisible(bool);
            imgBg.setVisible(bool);
        },
        setMoney: function () {
            var me = this;

            var panel = me._view;
            var imgAttr = panel.finds('image_3');
            var txtAttr = panel.nodes.text_2;
            var data = me.DATA;

            var conf = null;
            if (data.a == 'equip') {
                conf = G.class.equip.getById(data.eid);
            } else if (data.a == 'item') {
                conf = G.class.getItem(data.itemid);
            } else if (data.a == 'shipin') {
                conf = G.class.shipin.getById(data.spid);
            }

            var sale = conf.sale;

            imgAttr.loadTexture(G.class.getItemIco(sale[0].t),1);
            txtAttr.setString(sale[0].n * me.csNum);
        },
        setBtns: function () {
            var me = this;

            var btnAdd = me._view.nodes.btn_2;
            var btnPlus = me._view.nodes.btn_1;

            btnAdd.setTouchEnabled(false);
            btnAdd.setEnableState(false);
            btnPlus.setTouchEnabled(false);
            btnPlus.setEnableState(false);

            if (me.csNum > 1) {
                btnPlus.setTouchEnabled(true);
                btnPlus.setEnableState(true);
            }
            if (me.csNum < me.maxNum) {
                btnAdd.setTouchEnabled(true);
                btnAdd.setEnableState(true);
            }
        }
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();