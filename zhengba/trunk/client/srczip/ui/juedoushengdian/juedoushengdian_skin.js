/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典皮肤
    var ID = 'juedoushengdian_skin';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.txt_title.setString(L("XZPF"));
            me.skinList = me.data().skinList;
            me.curhid = me.data().curhid;
            me.DATA = G.frame.juedoushengdian_main.DATA.myinfo.skin;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            new X.bView("pifu_tip_xq.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(view.nodes.scrollview_txk);
                me.setContents();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            if (!me.table) {
                me.table = new X.TableView(me.view.nodes.scrollview_txk, me.view.nodes.list_txk, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(me.skinList);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.skinList);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,skinid) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var skinConf = G.gc.skin[skinid];
            X.render({
                txt_txkwz1: skinConf.name,
                btn: function (node) {
                    node.skinid = skinid;
                    node.setVisible(!me.DATA[me.curhid] || me.DATA[me.curhid] != skinid);
                    node.click(function (sender) {
                        me.ajax('gpjjc_wear',[me.curhid,{'skin': sender.skinid}],function (str,data) {
                            if(data.s == 1){
                                G.frame.juedoushengdian_main.DATA.myinfo = data.d.myinfo;
                                me.DATA = G.frame.juedoushengdian_main.DATA.myinfo.skin;
                                me.setContents();
                                G.frame.juedoushengdian_heroinfo.getData(function () {
                                    G.frame.juedoushengdian_heroinfo.changeSkin();
                                    G.frame.juedoushengdian_heroinfo.setDowmContent();
                                })
                            }
                        })
                    });
                },
                btn_xq: function (node) {
                    node.skinid = skinid;
                    node.setVisible(me.DATA[me.curhid] && me.DATA[me.curhid] == skinid);
                    node.click(function (sender) {
                        me.ajax('gpjjc_wear',[me.curhid,{'skin': ""}],function (str,data) {
                            if(data.s == 1){
                                G.frame.juedoushengdian_main.DATA.myinfo = data.d.myinfo;
                                me.DATA = G.frame.juedoushengdian_main.DATA.myinfo.skin;
                                me.setContents();
                                G.frame.juedoushengdian_heroinfo.getData(function () {
                                    G.frame.juedoushengdian_heroinfo.changeSkin();
                                    G.frame.juedoushengdian_heroinfo.setDowmContent();
                                })
                            }
                        })
                    });
                },
                txt_yj: L("YJ"),
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var obj = {};
                    cc.mixin(obj, G.gc.hero[me.curhid], true);
                    obj.star = 10;
                    G.frame.juedoushengdian_main.addSkin(obj);
                    var hero = G.class.shero(obj);
                    hero.setPosition(node.width / 2, node.height / 2);
                    node.addChild(hero);
                },
                txt_txkwz2: me.showBuff(skinConf.buff),
                img_bjditu: "img/pifu/chuandai/img_pf_" + skinid + ".png"
            }, ui.nodes);
        },
        showBuff: function (buff) {
            var str = '';
            var index = 0;
            for (var i in buff) {
                if (index != 0) str += " ";
                str += L(i) + " +";
                str += i.indexOf("pro") != -1 ? buff[i] / 10 + "%" : buff[i];
                index ++;
            }
            return str;
        }
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();