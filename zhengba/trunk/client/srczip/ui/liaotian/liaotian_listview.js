(function() {
    // 聊天
    var me = G.frame.liaotian;

    var _fun = {
        initUi_listview: function() {
            cc.enableScrollBar(me.ui.nodes.scrollview_chat, false);
            me._idx = 0;
            // 私聊列表
            me.ui.nodes.scrollview_chat.removeAllChildren();
            var table1 = new cc.myTableView({
                rownum: 1,
                type: 'fill',
                lineheight: me.ui.nodes.list_dialogue.height + 10,
                paddingTop: 10
            });
            me.ui_table1 = table1;
            table1.setDelegate(this);
            me.ui_table1.data([]);
            table1.bindScrollView(me.ui.nodes.scrollview_chat);
            var item  = me.ui.nodes.list_dialogue.clone();
            X.autoInitUI(item);
            var right_item = item.nodes.list_lb_r;
            var system_item = item.nodes.list_system;
            X.autoInitUI(right_item);
            me.defHeight = right_item.nodes.img_player_chat_r.height;
            me.defLineheight = me.ui.nodes.list_dialogue.height + 10;
            X.autoInitUI(system_item);
            me.defbgheight = system_item.nodes.bg_system.height;
            me.defItemHeight = item.height;
        },
        setItem: function(item, data, idx) {
            var me = this;
            X.autoInitUI(item);
            var right_item = item.nodes.list_lb_r;
            var left_item = item.nodes.list_lb;
            var system_item = item.nodes.list_system;
            var wzsx_item = item.nodes.list_zqwz;
            left_item.setPositionY(122);
            item.setContentSize(cc.size(item.width,me.defItemHeight));
            wzsx_item.hide();
            if ((!data.pmd && data.uid == P.gud.uid && data.t != 1) || (data.t == 4 && P.gud.uid == data.uid)) {
                X.autoInitUI(right_item);
                var tx = right_item.nodes.panel_tx_r;
                tx.removeAllChildren();

                var vip = right_item.nodes.fnt_vip_r;
                var vipImg = right_item.finds("bg_vip_r");
                var name = right_item.nodes.txt_player_name_r;
                var send_time = right_item.nodes.txt_send_time_r;
                var chat = right_item.nodes.txt_player_chat_r;
                var panel_chat = right_item.nodes.panel_player_chat_r;
                var img_player = right_item.nodes.img_player_chat_r;
                var head = G.class.shead(data);
                var vip1 = right_item.finds('panel_vip_r');
                var ch = right_item.nodes.panel_ch_r;
                head.data = data;
                head.setScale(1);
                head.setName(data.uid);
                head.setAnchorPoint(0, 0);
                tx.addChild(head);

                vip.setTextColor(cc.color('#ffecaa'));
                X.enableOutline(vip, '#250e00',1);
                vip1.setPositionX(name.x - name.getAutoRenderSize().width - vip1.width * 0.75);
                if(data.vip != 0 && data.t != 4) {
                    vip.setString(data.vip);
                    vipImg.loadTexture(X.getVipIcon(data.vip), 0);
                    name.removeAllChildren();
                    me.namePulsVip(name,vip1,data.name,2,data.svrname,data.hidevip);
                }else {
                    vip1.hide();
                    name.removeAllChildren();
                    if(data.t == 4){
                        name.setString(data.svrname + '-' + data.name);
                    }else{
                        name.setString(data.name);
                    }
                }

                if(G.frame.liaotian.szData.hideVip == 0) {
                    vip1.hide();
                }

                if (data.chenghao){
                    ch.setBackGroundImage("img/public/chenghao_" + data.chenghao + ".png", 1);
                }
                ch.setVisible(data.chenghao != '');
                send_time.setVisible(data.chenghao == '');
                send_time.setString(X.timetostr(data.ctime, '[m-d h:mm]'));
                headtouch(head);
                setMsg(right_item, 1);
                right_item.show();
                left_item.hide();
                system_item.hide();
                return;
            } else if ((!data.pmd && data.uid !== P.gud.uid && data.t != 1 && data.uid != "SYSTEM") || (data.t == 4 && data.uid !== P.gud.uid && !data.pmd)) {
                if(data.guild) {
                    X.autoInitUI(system_item);
                    var bg = system_item.nodes.bg_system;
                    var txt = system_item.nodes.txt_system;
                    var ico = system_item.finds('img_horn');
                    var msg = me.getMsg(data);
                    var richText = new X.bRichText({
                        size: 22,
                        maxWidth: txt.width,
                        lineHeight: 22,
                        color: '#804326',
                        family: G.defaultFNT
                    });
                    richText.text(L('systemXX') + ':' + msg);
                    txt.removeAllChildren();
                    txt.addChild(richText);
                    richText.setAnchorPoint(0, 1);
                    bg.height = me.defbgheight;
                    bg.setContentSize( cc.size(bg.width,bg.height + richText.trueHeight() - 22));
                    ico.setPositionY(bg.height / 2);
                    ccui.helper.doLayout(bg);
                    richText.setPositionY(36);
                    left_item.hide();
                    right_item.hide();
                    system_item.show();
                } else {
                    X.autoInitUI(left_item);
                    var tx = left_item.nodes.panel_tx;
                    tx.removeAllChildren();

                    var vip = left_item.nodes.fnt_vip;
                    var vipImg = left_item.finds("bg_vip");
                    var name = left_item.nodes.txt_player_name;
                    var send_time = left_item.nodes.txt_send_time;
                    var chat = left_item.nodes.txt_player_chat;
                    var panel_chat = left_item.nodes.panel_player_chat;
                    var img_player = left_item.nodes.img_player_chat;
                    var btn = left_item.nodes.btn_apply;
                    var head = G.class.shead(data);
                    var vip1 = left_item.finds('panel_vip');
                    var ch = left_item.nodes.panel_ch;
                    head.data = data;
                    head.setScale(1);
                    head.setAnchorPoint(0, 0);
                    head.setName(data.uid);
                    tx.addChild(head);
                    vip.setTextColor(cc.color('#ffecaa'));
                    X.enableOutline(vip, '#250e00',1);
                    vip1.setPositionX(name.x + name.getAutoRenderSize().width + vip1.width * 0.75);
                    if(data.vip != 0 && data.t != 4) {
                        vip.setString(data.vip);
                        vipImg.loadTexture(X.getVipIcon(data.vip), 0);
                        name.removeAllChildren();
                        me.namePulsVip(name,vip1,data.name,1,data.svrname,data.hidevip);
                    }else {
                        vip1.hide();
                        name.removeAllChildren();
                        if(data.t == 4){
                            name.setString(data.name + '-' + data.svrname);
                        }else{
                            name.setString(data.name);
                        }
                    }

                    if (data.chenghao){
                        ch.setBackGroundImage("img/public/chenghao_" + data.chenghao + ".png", 1);
                    }
                    ch.setVisible(data.chenghao != '');
                    send_time.setVisible(data.chenghao == '');
                    send_time.setString(X.timetostr(data.ctime, '[m-d h:mm]'));
                    headtouch(head);
                    setMsg(left_item, 2);
                    left_item.show();
                    btn.hide();
                    right_item.hide();
                    system_item.hide();
                }

                return;
            } else if (data.pmd) {
                left_item.hide();
                right_item.hide();
                if (data.iszqwz) {
                    system_item.hide();
                    wzsx_item.show();
                    X.autoInitUI(wzsx_item);
                    var txt = wzsx_item.nodes.txt_system;
                    var richText = new X.bRichText({
                        size: 22,
                        maxWidth: txt.width,
                        lineHeight: 22,
                        color: '#804326',
                        family: G.defaultFNT
                    });
                    richText.text(data.m);
                    txt.removeAllChildren();
                    txt.addChild(richText);
                    richText.setPosition(txt.width / 2 - richText.trueWidth() / 2, txt.height / 2 - richText.trueHeight() / 2);
                    wzsx_item.nodes.bg_system.removeAllChildren();
                    G.class.ani.show({
                        json: "ani_zuiqiangwangzhe_tanchuang",
                        addTo: wzsx_item.nodes.bg_system,
                        autoRemove: false,
                        onload: function (node, action) {
                            action.playWithCallback("in", false, function () {
                                action.play("wait", true);
                            });
                        }
                    });
                } else {
                    X.autoInitUI(system_item);
                    var bg = system_item.nodes.bg_system;
                    var txt = system_item.nodes.txt_system;
                    var ico = system_item.finds('img_horn');
                    var msg = me.getMsg(data);
                    var richText = new X.bRichText({
                        size: 22,
                        maxWidth: txt.width,
                        lineHeight: 22,
                        color: '#804326',
                        family: G.defaultFNT
                    });
                    richText.text(L('systemXX') + ':' + msg);
                    txt.removeAllChildren();
                    txt.addChild(richText);
                    richText.setAnchorPoint(0, 1);
                    bg.height = me.defbgheight;
                    bg.setContentSize( cc.size(bg.width,bg.height + richText.trueHeight() - 22));
                    ico.setPositionY(bg.height / 2);
                    ccui.helper.doLayout(bg);
                    richText.setPositionY(36);
                    system_item.show();
                }
            } else if (data.t == 1) {
                X.autoInitUI(left_item);
                var tx = left_item.nodes.panel_tx;
                tx.removeAllChildren();

                var vip = left_item.nodes.fnt_vip;
                var panel_vip = left_item.finds('panel_vip');
                var name = left_item.nodes.txt_player_name;
                var send_time = left_item.nodes.txt_send_time;
                var chat = left_item.nodes.txt_player_chat;
                var panel_chat = left_item.nodes.panel_player_chat;
                var img_player = left_item.nodes.img_player_chat;
                var btn = left_item.nodes.btn_apply;
                var head = G.class.shead(data);
                var vipImg = left_item.finds("bg_vip");
                head.data = data;
                head.setScale(1);
                head.setAnchorPoint(0, 0);
                headtouch(head);

                tx.addChild(head);
                vip.setString(data.vip ? data.vip : 0);
                vip.setTextColor(cc.color('#ffecaa'));
                X.enableOutline(vip, '#250e00',1);
                send_time.setString(X.timetostr(data.ctime, '[m-d h:mm]'));
                var idx = me.ghidx++;
                if(data.vip != 0){
                    vipImg.loadTexture(X.getVipIcon(data.vip), 0);
                    name.removeAllChildren();
                    me.namePulsVip(name,panel_vip,data.name,1, "", G.frame.liaotian.szData.hideVip ? 0 : 1);
                }else{
                    name.removeAllChildren();
                    name.setString(data.name);
                }
                item.setContentSize(cc.size(item.width,230));
                ccui.helper.doLayout(item);
                setMsg(left_item, 2, idx);
                btn.hide();
                left_item.show();
                right_item.hide();
                system_item.hide();
                return;
            }else if(data.uid == "SYSTEM") {
                X.autoInitUI(left_item);
                var tx = left_item.nodes.panel_tx;
                tx.removeAllChildren();

                var vip = left_item.nodes.fnt_vip;
                var vipImg = left_item.finds("bg_vip");
                var name = left_item.nodes.txt_player_name;
                var send_time = left_item.nodes.txt_send_time;
                var chat = left_item.nodes.txt_player_chat;
                var img_player = left_item.nodes.img_player_chat;
                var head = G.class.shead();
                var vip1 = left_item.finds('panel_vip');
                head.data = "system";
                head.num.setString(999);
                head.icon.loadTextureNormal("ico/itemico/gmtx.png", 0);
                head.setScale(1);
                head.setAnchorPoint(0, 0);
                head.setName(data.uid);
                tx.addChild(head);
                vip.setTextColor(cc.color('#ffecaa'));
                X.enableOutline(vip, '#250e00',1);
                name.setString(data.name);
                vip1.show();
                vip.hide();
                vip1.setPositionX(name.x + name.getAutoRenderSize().width + vip1.width * 0.75);

                vipImg.loadTexture("img/sale/ico_sale_zdy.png", 0);

                send_time.setString(X.timetostr(data.ctime, '[m-d h:mm]'));
                headtouch(head);
                setMsg(left_item, "system");
                left_item.show();
                right_item.hide();
                system_item.hide();
                return;
            }

            function setMsg(ui, type, ghidx) {
                if(data.chatborder) {
                    var img = G.class.zaoxing.getChatById(data.chatborder).img;
                    if(cc.isNode(ui.finds("img_player_chat$"))) {
                        ui.finds("img_player_chat$").loadTexture("img/chat/" + img, 1);
                    }
                    if(cc.isNode(ui.finds("img_player_chat_r$"))){
                        ui.finds("img_player_chat_r$").loadTexture("img/chat/" + img, 1);
                    }
                }else{
                    if(cc.isNode(ui.finds("img_player_chat$"))) {
                        ui.finds("img_player_chat$").loadTexture("img/chat/wz_bg_chat.png", 1);
                    }
                    if(cc.isNode(ui.finds("img_player_chat_r$"))){
                        ui.finds("img_player_chat_r$").loadTexture("img/chat/wz_bg_chat.png", 1);
                    }
                }
                img_player.finds('aa') && img_player.finds('aa').removeFromParent();
                var msg = me.getMsg(data);
                var color = type == "system" ? "#be1b1a" :
                    (data.chatborder == 2 ? "#f5ff37": (data.vip && data.vip >= 7 ? "#eb3a3a" :
                        (data.chatborder == 4 ? "#ff2e1d" : '#804326')));
                if (data.chatborder == 3) color = "#fff000";
                if (data.isyang) color = "#258e2f";
                var richText = new X.bRichText({
                    size: 22,
                    maxWidth: 385,
                    lineHeight: 22,
                    color: color,
                    family: G.defaultFNT
                });
                var h = 0;
                if(data.t == 1){
                    img_player.width = 415;
                }
                if (type == 1) {
                    richText.setPositionX(richText.x + 50);
                    richText.setAnchorPoint(1, 1);
                } else {
                    richText.setAnchorPoint(0, 1);
                }
                if (data.sendType && data.sendType != '') {
                    var img = new ccui.ImageView('img/public/ico/ico_zdl.png', 1);
                    img.setScale(.5);
                    richText.text(msg, [img]);
                    richText.idx = me.armyidx++;
                    h = -8;
                } else if(data.t == 1){
                    var btn = ui.nodes.btn_apply.clone();
                    ui.nodes.btn_apply.hide();
                    btn.setName("aa");
                    btn.idx = ghidx;
                    btn.show();
                    btn.click(function (sender, type) {
                        G.frame.gonghui_main.gonghuiApply(me.ghlist[sender.idx]);
                    });
                    richText.text(msg);
                    btn.setAnchorPoint(0,0);
                    img_player.height = me.defHeight;
                    img_player.setContentSize(cc.size(img_player.width,img_player.height + richText.trueHeight() / 2 ));
                    btn.setPosition(img_player.width - 100,3);
                    
                    if(richText.trueHeight() > 60){
                        ui.setPositionY(230);
                        if(!me.isMove) me.isMove = true;
                    }else{
                        if(me.isMove){
                            ui.setPositionY(200);
                            me.isMove = false;
                        }else{
                            ui.setPositionY(230);
                        }
                    }
                    img_player.finds('aa') && img_player.finds('aa').removeFromParent();
                    img_player.addChild(btn);
                }else {
                    richText.text(msg);
                }
                richText.setPositionY(33 + h);
                if(data.t != 1){
                    img_player.width = richText.trueWidth() > 415 ? 415 : richText.trueWidth() + 27;
                    img_player.height = me.defHeight;
                    img_player.setContentSize(cc.size(img_player.width,img_player.height + richText.trueHeight() - 25));
                   
                }
                ccui.helper.doLayout(img_player);
                chat.removeAllChildren();
                chat.addChild(richText);
            }

            function headtouch(head) {

                head.setTouchEnabled(true);
                head.icon.setTouchEnabled(false);
                head.touch(function(sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        if(sender.data == "system") {
                            G.tip_NB.show(L("XSYDY"));
                            return;
                        }
                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.uid,
                            iskf: sender.data.sid != P.gud.sid,
                            showBy: G.frame.liaotian._curType == 4
                        }).checkShow();
                    }
                });
            }
        },
        namePulsVip:function(name,vip,data,type,svrname, isHide){
            var me = this;
            var node = vip.clone();
            vip.hide();

            node.setName('vipInfoNearByName');

            var _idx = 1;
            X.forEachChild(node,function(_nd){
                _nd.setName("_node"+ _idx);
                _idx++;
            });

            if(isHide) {
                node.hide();
            } else {
                node.show();
            }

            name.setString('');
            if(type == 2){
                if(me._curType == 4){
                    var str = '<font node=1></font>' + svrname + '-' + data;
                }else{
                    var str = '<font node=1></font>' + data;
                }
            }else{
                if(me._curType == 4){
                    var str = data + '-' + svrname + '<font node=1></font>';
                }else{
                    var str = data + '<font node=1></font>';
                }
                
            }
            var richText = new X.bRichText({
                size: 22,
                maxWidth: 385,
                lineHeight: 22,
                color: '#6b2605',
                family: G.defaultFNT
            });
            richText.text(str,[node]);
            richText.setPositionX(type == 2 ? name.width - richText.trueWidth() : 0);
            name.removeAllChildren();
            name.addChild(richText);
        },
        setTableViewData: function(data) {
            var me = this;
            var table = me.ui_table;
            data.sort(function(a, b) {
                return a.ctime - b.ctime;
            });
            table.data(data);
        },
        fmtItemList: function(data) {
            var me = this;
            data = data || [];
            data.sort(function(a, b) {
                return a.ctime - b.ctime;
            });
            me.ui_table1.data(data);
            me.ui_table1.reloadDataWithScroll(!me.isNew);
            if(!me.isNew)me.ui_table1.reloadDataWithScrollToBottomRight(me.isNew);
            me.isNew = true;
        },
        /**
         * 数据模板
         * @returns {*}
         */
        cellDataTemplate: function() {
            return this.ui.nodes.list_dialogue.clone();
        },
        /**
         * 数据初始化
         * @param ui
         * @param data
         */
        cellDataInit: function(ui, data) {
            if (!data) {
                ui.hide();
                return;
            }
            ui.setName('liebiao');
            this.setItem(ui, data, me._idx++);
            ui.show();
        },
        getTableviewCanScroll: function(type) {
            var me = this;

            var table = type == 4 ? me.ui_table1 : me.ui_table;
            if (!table) return false;

            var tableview = table.tableView.getChildren()[0];

            return tableview.y >= -50;
        },
    };
    cc.mixin(me, _fun, true);
})();