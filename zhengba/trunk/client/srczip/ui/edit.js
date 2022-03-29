/**
 * Created by wfq on 2018/6/26.
 */
(function () {
    //编辑通用界面
    var ID = 'edit';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f6";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
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

            me.DATA = me.data();
            // me.DATA = {
            //     type:1,
            //     title:'ww',
            //     info:'aaa',
            //     placeholder:'eeee',
            //     callback:''
            // };
            setPanelTitle(me.nodes.txt_title,me.DATA.title);
            new X.bView('gonghui_tk.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);

                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me['setPanel' + me.DATA.type]();
        },
        showPanel: function (type) {
            var me = this;

            var panel = me._view;
            var txtNameArr = ['panel_input2','panel_input'];
            var btnArr = ['btn_confirm2','btn_confirm'];
            for (var i = 0; i < txtNameArr.length; i++) {
                var txtName = txtNameArr[i];
                var btn = btnArr[i];
                if (type == i) {
                    panel.nodes[txtName].show();
                    panel.nodes[btn].show();
                } else {
                    panel.nodes[txtName].hide();
                    panel.nodes[btn].hide();
                }
            }
        },
        //公会改名类似的
        setPanel0: function () {
            var me = this;

            var panel = me._view;
            me.showPanel(me.DATA.type);
            X.render({
                txt_title: function (node) {
                    node.setString(me.DATA.info);
                },
                panel_input2: function (node) {
                    var txtInput = node.finds('txt_input$');

                    txtInput.setPlaceHolder(me.DATA.placeholder);
                    // txtInput.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
                    txtInput.addEventListener(function (sender, type) {
                        switch (type) {
                            case ccui.TextField.EVENT_INSERT_TEXT:
                                var str = sender.getString();
                                if(str.length > 6) {
                                    sender.setString(str.substring(0, 6));
                                }
                                break;
                        }
                    })
                },
                btn_confirm2: function (node) {
                    node.finds('txt_sl$').hide();
                    node.finds('token_zs').hide();
                    node.finds('txt_confirm2').hide();

                    var need = [].concat(me.DATA.need);
                    if (need) {
                        node.finds('txt_sl$').show();
                        node.finds('token_zs').show();
                        node.finds('txt_confirm2').show();
                        setTextWithColor(node.finds('txt_sl$'),need[0].n,G.gc.COLOR[G.class.getOwnNum(need[0].t,need[0].a) >= need[0].n ? 'n1' : 5]);
                    } else {
                        node.setTitleText(L('BTN_OK'));
                    }
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            var txt = panel.nodes.panel_input2.finds('txt_input$').getString().trim();
                            var callback = me.DATA.callback;
                            callback && callback(txt);
                        }
                    });
                }
            },panel.nodes);
        },
        //公会招募相关的
        setPanel1: function () {
            var me = this;

            var panel = me._view;
            me.showPanel(me.DATA.type);
            X.render({
                txt_title: function (node) {
                    node.setString(me.DATA.info);
                },
                panel_input: function (node) {
                    var txtInput = node.finds('txt_input$');
                    var str = me.DATA.placeholder || X.STR(L('gonghui_gm'),P.gud.ghname);
                    txtInput.setPlaceHolder(str);
                    txtInput.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
                    txtInput.setMaxLength(30);
                    txtInput.setMaxLengthEnabled(true);
                    txtInput.addEventListener(me.textFieldEvent, this);
                },
                txt_input: function (node){
                    X.editbox.create(node);
                },
                btn_confirm: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            var txt = panel.nodes.panel_input.finds('txt_input$').getString().trim();
                            if (txt == '') {
                                txt = panel.nodes.panel_input.finds('txt_input$').getPlaceHolder();
                            }
                            var callback = me.DATA.callback;
                            callback && callback(txt);
                        }
                    });
                }
            },panel.nodes);
        },
        textFieldEvent : function (sender, type) {
            switch (type)
            {
                case ccui.TextField.EVENT_ATTACH_WITH_IME:
                    sender.setPlaceHolder("");
                    cc.log("EVENT_ATTACH_WITH_IME");
                    break;
                case ccui.TextField.EVENT_DETACH_WITH_IME:
                    cc.log("EVENT_DETACH_WITH_IME");
                    break;
                case ccui.TextField.EVENT_INSERT_TEXT:
                    changdu(sender);
                    cc.log("EVENT_INSERT_TEXT");
                    break;
                case ccui.TextField.EVENT_DELETE_BACKWARD:
                    cc.log("EVENT_DELETE_BACKWARD");
                    break;
                default:
                    cc.log("default");
                    break;
            }
            function changdu(sen) {
                var len = getRealLen(sen.getString());
                if(len > 60){
                    var send = sen.substr(0, sen.length - 1);
                    changdu(send);
                }else{
                    return sen;
                }
            }
        },

});

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();