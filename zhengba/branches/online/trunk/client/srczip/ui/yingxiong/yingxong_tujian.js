/**
 * Created by wfq on 2018/5/22.
 */
(function () {
    //英雄-图鉴
    G.class.yingxiong_tujian = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('yingxiong.json');
        },
        refreshPanel: function () {
            var me = this;

            if (me.curType) {
                delete me.curType;
            }

            me.render({
                txt_sl: function (node) {
                    node.hide();
                },
                btn_jia: function (node) {
                    node.hide();
                }
            });

            me.setContents();
        },
        setContents: function () {
            var me = this;

            var type = me.curType || 0;
            me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.nodes.scrollview1.hide();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;

            me.createMenu();
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        createMenu: function () {
            var me = this;

            me._menus = [];

            //图鉴中不需要图标所有的展示
            for(var i=1;i<7;i++){
                var panel = me.nodes['panel_' + i];

                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.setPosition(cc.p(panel.width*0.5, panel.height*0.5));

                list_ico.data = i;
                list_ico.setTouchEnabled(true);
                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
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
                panel.x += panel.width * 0.75;
                panel.addChild(list_ico);
            }
        },
        fmtItemList: function () {
            var me = this;

            me.nodes.scrollview.removeAllChildren();

            var data = me.getFilterData(me.curType);

            //增加10星的数据
            data = data.concat(me.getTenStarData(me.curType));

            me._hidArr = data;


            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list,4, function (ui, data) {
                me.setItem(ui, data);
            },null,null,12,3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui,data) {
            var me = this;

            ui.setName(data);
            X.autoInitUI(ui);
            var arr = data.split('_'),
                conf = X.clone(G.class.hero.getById(arr[0]));
            if (arr.length > 1) {
                var starup = G.class.herostarup.getByIdAndDengjie(arr[0],'10');
                conf.lv = starup.maxlv;
                conf.star = 10;
                conf.dengjielv = '10';
            } else {
                conf.dengjielv = conf.star;
                conf.lv = G.class.herocom.getMaxlv(arr[0], conf.dengjielv);
            }


            var widget = G.class.shero(conf);

            widget.setAnchorPoint(0.5,1);
            // widget.setScale(0.9);
            widget.setPosition(cc.p( ui.nodes.ico.width*0.5, ui.nodes.ico.height));
            ui.nodes.ico.removeAllChildren();
            ui.nodes.ico.addChild(widget);

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            if(X.inArray(G.frame.yingxiong.headData, data)) {
                widget.setEnabled(true);
            }else{
                widget.setEnabled(false);
            }
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.yingxiong_xxxx.data({
                        // uid: P.gud.uid,
                        tid:sender.data,
                        list:me._hidArr,
                        frame:'yingxiong_tujian',
                    }).show();
                }
            });
            ui.show();
        },
        getFilterData: function (type) {
            var me = this;

            var data = G.class.hero.getHerosByZhongzu(type * 1);

            data.sort(function (a,b) {
                var confA = G.class.hero.getById(a),
                    confB = G.class.hero.getById(b);
                if (confA.star != confB.star) {
                    return confA.star < confB.star ? -1 : 1;
                } else {
                    return confA.pinglunid * 1 < confB.pinglunid * 1 ? -1 : 1;
                }
            });

            return data;
        },
        getTenStarData: function (type) {
            var me = this;

            var data = G.class.herostarup.getTenHerosByZhongzu(type * 1);

            data.sort(function (a,b) {
                var confA = G.class.hero.getById(a),
                    confB = G.class.hero.getById(b);
                if (confA.star != confB.star) {
                    return confA.star < confB.star ? -1 : 1;
                } else {
                    return confA.pinglunid * 1 < confB.pinglunid * 1 ? -1: 1;
                }
            });

            for (var i = 0; i < data.length; i++) {
                data[i] = data[i] + '_1';
            }

            return data;
        }
    });

})();