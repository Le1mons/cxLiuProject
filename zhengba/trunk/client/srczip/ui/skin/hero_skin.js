/**
 * Created by LYF on 2018/11/6.
 */
(function () {
    //英雄-皮肤
    G.class.yingxiong_skin = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('yingxiong.json');
            G.frame.yingxiong.skin = me;
        },
        initUi: function () {
            var me = this;

            me.nodes.img_zzbg_du.hide();
            me.nodes.panel_pfjm.show();
            me.nodes.scrollview.hide();
            me.nodes.scrollview1.hide();

            cc.enableScrollBar(me.nodes.scrollview_pf);
            me.finds('Panel_1').setTouchEnabled(false);
            me.nodes.txt_jhpf.setString(X.STR(L("YJHXXGYJPF"), G.frame.yingxiong.getSkinActiveNum(), Object.keys(G.gc.skin).length));
        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_pifu$.click(function () {

                G.frame.skin_target.show();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.createMenu();
            me._menus[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onRemove: function () {
            var me = this;
        },
        createMenu: function(){
            var me = this;
            me._menus = [];

            //图标中，1指的是全部
            for(var i=0;i<8;i++){
                var panel = me.nodes['panel_' + (i+1)];

                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                if (i == 7){
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz11.png', 1);
                } else {
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                }

                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.setPosition(cc.p(panel.width*0.5, panel.height*0.5 + 2));

                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        if(node.data == 7){
                            //第八种族
                            var img = 'img/public/ico/ico_zz11.png';
                        }else {
                            var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        }

                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            if (node.data == 7){
                                img = 'img/public/ico/ico_zz11_g.png';
                            } else {
                                img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            }
                            if (sender.data == 0) {
                                me.nodes.txt_zzwzsl.setString(L("QB") + L("zhongzu"));
                            } else {
                                me.nodes.txt_zzwzsl.setString(L("zhongzu_" + sender.data) + L("zhongzu"));
                            }
                            if(sender.ani){
                                sender.ani.show();
                            }else{
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function(node){
                                        sender.ani = node;
                                    }
                                })
                            }
                        }else{
                            //node.nodes.img_yuan_xz.hide();
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                    //sender.nodes.img_yuan_xz.show();
                });

                me._menus.push(list_ico);
                panel.addChild(list_ico);
            }
        },
        getFilterData: function (type) {
            var me = this;
            var keys = [];
            var conf = G.gc.skin;
            var skinKeys = Object.keys(conf);

            if (type == 0) {
                keys = skinKeys;
            } else {
                for (var i in skinKeys) {
                    if (conf[skinKeys[i]].zhongzu == type) keys.push(skinKeys[i]);
                }
            }

            keys.sort(function (a, b) {
                return conf[a].sort < conf[b].sort ? -1 : 1;
            });

            return keys;
        },
        fmtItemList: function () {
            var me = this;
            var data = me.getFilterData(me.curType);

            me.ui.finds("img_zwnr").setVisible(data.length == 0);

            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview_pf$, me.nodes.list_pf, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 12, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var conf = G.gc.skin[data];

            X.autoInitUI(ui);
            X.render({
                btn_pfd: function (node) {

                    node.loadTextureNormal("img/pifu/pifu/img_pf_" + data + ".png");
                    node.loadTexturePressed("img/pifu/pifu/img_pf_" + data + ".png");
                    node.loadTextureDisabled("img/pifu/pifu/img_pf_" + data + ".png");

                    node.setSwallowTouches(false);
                    node.touch(function (sender, type) {

                        if (type == ccui.Widget.TOUCH_NOMOVE) {

                            G.frame.skin_showmodel.data(data).once("close", function () {
                                var data = me.getFilterData(me.curType);
                                me.table.setData(data);
                                me.table.reloadDataWithScroll(false);
                                
                            }).show();
                        }
                    });
                },
                img_wjh: function (node) {
                    node.setVisible(G.frame.yingxiong.getSkinActiveNum(data) ? false : true);
                },
                img_yyt: function (node) {
                    node.setVisible(G.frame.yingxiong.getSkinActiveNum(data) ? true : false);
                },
                txt_yyts: function (node) {
                    var num = G.frame.yingxiong.getSkinActiveNum(data);

                    node.setString(X.STR(L("YYXT"), num));
                    X.enableOutline(node, "#096130", 2);
                },
                txt_wzpifu: L("CDSX") + ":" + G.frame.skin_change.showBuff(conf.buff)
            }, ui.nodes);

            ui.nodes.txt_wzpifu.setTextColor(cc.color("#fbffd3"));
            X.enableOutline(ui.nodes.txt_wzpifu, "#0d141e", 2);
        }
    });
})();