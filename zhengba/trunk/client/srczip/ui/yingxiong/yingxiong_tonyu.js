/**
 * Created by LYF on 2018/11/6.
 */
(function () {
    //英雄-统御
    G.class.yingxiong_tonyu = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('yingxiong.json');
            G.frame.yingxiong_xxxx.tongyu = me;
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me._menus[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.isRecevie = me.DATA.destinyprize ? true : false;
            });
        },
        checkRedPoint: function() {
            var me = this;
            if(G.DATA.hongdian.destiny) {
                G.setNewIcoImg(me.nodes.btn_jl, .9);
            }else G.removeNewIco(me.nodes.btn_jl);
        },
        setContents: function () {
            var me = this;

        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_jl.click(function (sender) {
                G.frame.yingxiong_tianming.show();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.nodes.img_zzbg_du.hide();
            me.nodes.scrollview1.show();
            me.nodes.scrollview.hide();
            me.nodes.ty_sx.show();
            cc.enableScrollBar(me.nodes.scrollview1);
        },
        getData: function(callback) {
            var me = this;

            me.ajax("hero_gettongyu", [], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        onShow: function () {
            var me = this;

            me.createMenu();
            me.setTianMing();
            me.refreshPanel();
            me.checkRedPoint();
        },
        onRemove: function () {
            var me = this;
        },
        createMenu: function(){
            var me = this;
            me._menus = [];

            //图标中，1指的是全部
            for(var i=0;i<7;i++){
                var panel = me.nodes['panel_' + (i+1)];

                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.setPosition(cc.p(panel.width*0.5, panel.height*0.5 + 2));

                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        if(node.data == sender.data){
                            if(me.curType && me.curType == sender.data) return;
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            if(sender.ani) {
                                sender.ani.show();
                            }else {
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node) {
                                        sender.ani = node;

                                    }
                                })
                            }
                        }else{
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                });
                me._menus.push(list_ico);
                panel.addChild(list_ico);
            }
        },
        getFilterData: function(type) {
            var me = this;

            if(type == 0) {
                return G.class.tongyu.get().base.herozu;
            }else {
                return G.class.tongyu.getHeroByZhongzu(type);
            }
        },
        fmtItemList: function () {
            var me = this;
            var data = me.getFilterData(me.curType);

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview1, me.nodes.list_ty, 3, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 12, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            }else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var me = this;
            var dd = me.DATA.data[data];
            var active = dd ? true : false;
            var conf = G.class.tongyu.getHerosByID(data);
            var model;
            var hid;

            if(dd) {
                if(dd.maxlv == 6) {
                    model = conf[1].tenstarmodel;
                    hid = data + "6";
                }else if(dd.maxlv != 1){
                    model = conf[1].model;
                    hid = conf[1].model;
                }else {
                    model = conf[0].model;
                    hid = conf[0].model;
                }
            }else {
                model = conf[0].model;
                hid = conf[0].model;
            }

            if(dd && dd.mylv == dd.maxlv) {
                ui.nodes.img_kpy.hide();
            }else {
                ui.nodes.img_kpy.setVisible(active);
            }
            ui.nodes.ico_zy.loadTextureNormal('img/public/ico/ico_zz' + (conf[0].zhongzu + 1) + '_s.png', 1);
            ui.nodes.ty_ysdi.loadTextureNormal("ico/ghbossico/zhongzu_" + conf[0].zhongzu + ".png");
            ui.nodes.ty_rw.loadTextureNormal("ico/heroicon/" + G.class.fmtItemICON(model) + ".png");
            ui.nodes.ty_bq.setVisible(active);
            ui.nodes.ico_zy.setBright(active);
            ui.nodes.ty_ysdi.setBright(active);
            ui.nodes.ty_rw.setBright(active);
            ui.nodes.bg_kuang.setBright(active);

            if(dd) {
                ui.nodes.txt_ty.setString(L("TY") + dd.mylv + "/" + dd.maxlv || (conf[1].tenstarmodel ? 10 - 4 : 9 - 4));
            }

            ui.model = model;
            ui.id = data;
            ui.data = dd;
            ui.conf = conf;
            ui.hid = hid;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(!sender.data) {
                        G.tip_NB.show(L("DQYXWJH"));
                        return;
                    }
                    var obj = {
                        model: sender.model,
                        id: sender.id,
                        data: sender.data,
                        conf: sender.conf,
                        hid: sender.hid
                    };
                    me.select = sender;
                    G.frame.yingxiong_tongyu_xq.data(obj).show();
                }
            });
            ui.show();
        },
        setTianMing: function () {
            var me = this;
            var hppro = 0;
            var atkpro = 0;
            var str = L("ZWDW");
            var num = P.gud.destiny || 0;
            var conf = G.class.tongyu.get().base.destiny;

            me.nodes.txt_tm.setString(num);

            for (var i = 0; i < conf.length; i ++) {
                var con = conf[i];
                if(num >= con[0] && (!conf[i + 1] || num < conf[i + 1][0])) {
                    str = con[1].title;
                    hppro = con[1].buff[0].hppro;
                    atkpro = con[1].buff[1].atkpro;
                    me.index = i;
                    break;
                }
            }

            me.nodes.txt_dw.setString(str);
            me.nodes.txt_gj.setString("+" + (atkpro / 10) + "%");
            me.nodes.txt_sm.setString("+" + (hppro / 10) + "%");
        }
    });
})();