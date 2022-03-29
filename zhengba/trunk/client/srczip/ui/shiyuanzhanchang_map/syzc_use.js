(function () {
    var ID = 'syzc_use';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn()
            new X.bView('zhuangbei_tip1.json', function (view) {
                me._view = view;

                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                view.setTouchEnabled(true);
            }, { action: true });
        },
        setContents: function () {
            var me = this;
            me.DATA = me.data().data;
            var wid = G.class.sitem(me.DATA.need[0]);
            me.conf = wid.conf;
            me.setBtns();
            me.setTop();
        },
        setTop: function () {
            var me = this;

            var panel = me._view;
            var conf = me.conf;
            var mask = me.ui.finds('panel_1');
            var btnHqtj = panel.nodes.btn_hqtj;
            var layIco = panel.nodes.panel_1;
            var layBuff = panel.nodes.panel_2;
            var txtName = panel.nodes.text_1;
            var txtType = panel.nodes.text_2;
            var txtHqtj = panel.finds('text_hqtj');
            var layYx = panel.nodes.panel_4;

            mask.setBackGroundColorOpacity(255 * 0.7);


            mask.click(function () {
               me.remove();
            });

            layIco.removeAllChildren();
            layBuff.removeAllChildren();
            layYx.removeAllChildren();
            txtHqtj.show();
            txtHqtj.setString('持有:'+G.class.getOwnNum(me.DATA.need[0].t,me.DATA.need[0].a));
            //头像
            var wid = G.class.sitem(me.DATA.need[0]);
            wid.setPosition(cc.p(layIco.width / 2 - 5, layIco.height / 2));
            layIco.addChild(wid);

            wid.num.hide();

            // 名字
            setTextWithColor(txtName, conf.name, G.gc.COLOR[conf.color || 0]);


            // 类型
            txtType.setString(L('DAOJU_TYPE_' + me.DATA.a));

            //介绍
            var str = "";

            str += conf.intr;
            var rh = new X.bRichText({
                size: 22,
                maxWidth: layBuff.width,
                lineHeight: 34,
                family: G.defaultFNT,
                color: G.gc.COLOR.n5
            });
            str += '<br><font size=20>' + ' ' + '</font>';
            rh.text(str);


            var offsetY = rh.trueHeight();
            rh.setPosition(cc.p(0, -15));
            // if(!me.DATA.tid){
            //     if(me.conf.usetype == undefined || me.conf.usetype != '2'){
            //         rh.setPosition(cc.p(0,panel.nodes.panel_3.height*(-1)));
            //         // panel.nodes.panel_3.height = 0;
            //     }
            // }
            panel.nodes.panel_bg.setContentSize(cc.size(panel.nodes.panel_bg.width, panel.nodes.panel_bg.height + offsetY + panel.nodes.panel_3.height + 20 - 100));
            ccui.helper.doLayout(panel.nodes.panel_bg);
            if (me.conf.usetype != undefined && me.conf.usetype == '2' || !me.DATA.tid || me.conf.usetype == '7') {
                layBuff.y -= 10;
                panel.finds("bg_1").height -= 60;
            }
            layBuff.y -= 10;
            layBuff.addChild(rh);


        },
        setBtns: function () {
            var me = this;
            var panel = me._view;

            var layBtns = panel.nodes.panel_3;
            // usetype
            // 1 可使用礼包类型道具
            // 2 不可使用道具
            // 3 可合成饰品碎片
            // 4 可合成英雄碎片
            var btnsState = me.getBtnsState();

            var btnArr = [];
            btnArr.push(btnsState.qushiyong());

            for (var i = 0; i < btnArr.length; i++) {
                var btn = btnArr[i];
                btn.setTitleFontName(G.defaultFNT);
                btn.setTitleFontSize(24);
                btn.setTitleColor(cc.color('#2f5719'));
                var intervalWidth = (layBtns.width - (btnArr.length * btn.width)) / (btnArr.length + 1);
                btn.setPosition(cc.p((intervalWidth + btn.width / 2) * (i + 1) + btn.width / 2 * i, layBtns.height / 2));
                layBtns.addChild(btn);
            }
            me.btn_num = btnArr.length;
            X.autoInitUI(me.ui);
        },
        getBtnsState: function () {
            var me = this;
            var state = {
                qushiyong: function () {
                    var btn = new ccui.Button();
                    var img = 'img/public/btn/btn1_on.png';
                    btn.loadTextures(img, '', '', 1);
                    btn.setTitleText(L('BTN_QSY'));
                    btn.setName('btn_qushiyong$');
                    btn.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            me.data().callback && me.data().callback(me.DATA.id)

                        }
                    });

                    return btn;
                }
            };

            return state;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('panel_nr.json', ID);
})();