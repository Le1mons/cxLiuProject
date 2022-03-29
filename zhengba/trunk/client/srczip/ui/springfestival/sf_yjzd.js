/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //道具-批量处理
    var ID = 'sf_yjzd';

    var fun = X.bUi.extend({
        extConf:{
            item:{
                btnCs: function (node) {
                    var me = G.frame.sf_yjzd;
                    node.setTitleText(L('BTN_SHIYONG'));
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            me.setNum();
                            me.data().callback && me.data().callback(me.csNum);
                            me.remove();
                        }
                    });
                },
                btnPlus: function (node) {
                    var me = G.frame.sf_yjzd;
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
                    var me = G.frame.sf_yjzd;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.csNum < me.maxnum) {
                                me.csNum++;
                                me.setCsNum();
                            }
                        }
                    });
                }
            },
        },
        ctor: function (json, id) {
            var me = this;
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
            me.DATA = me.data().data;
            me.csNum = me.data().num;
            me.maxnum = me.data().num;
            new X.bView('zhuangbei_tip3.json', function (view) {
                me._view = view;
                view.y = -60;
                view.nodes.panel_bg.setTouchEnabled(true);
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                me.setMoneyState3();
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
            X.setInput(txtNum, function () {
                me.csNum = txtNum.getString().trim() > me.maxnum ? me.maxnum : txtNum.getString().trim();
                me.setCsNum();
            });

            layIco.removeAllChildren();

            var  wid = G.class.sitem(data);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            setTextWithColor(txtName,wid.conf.name,G.gc.COLOR[wid.conf.color || 1]);
            me.setCsNum();

            var obj = {
                1:'item',
            };
            me.extConf[obj[1]].btnPlus(btnPlus);
            me.extConf[obj[1]].btnAdd(btnAdd);

            btnCs.itemid = wid.conf.itemid;
            me.extConf[obj[1]].btnCs(btnCs);
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
        setMoneyState3: function (bool) {
            var me = this;

            var panel = me._view;
            var imgAttr = panel.finds('image_3');
            var txtAttr = panel.nodes.text_2;
            var imgBg = panel.finds('image_2');

            imgAttr.setVisible(bool);
            txtAttr.setVisible(bool);
            imgBg.setVisible(bool);
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
            if (me.csNum < me.maxnum) {
                btnAdd.setTouchEnabled(true);
                btnAdd.setEnableState(true);
            }
        }
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();