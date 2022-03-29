/**
 * Created by wfq on 2018/7/5.
 */
(function () {
    //玩家-更换列表
    var ID = 'player_changhead';

    var fun = X.bUi.extend({
        extConf:{
            defaultStar:3
        },
        ctor: function (json, id) {
            var me = this;
            // me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.nodes.panel_bt, L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            cc.enableScrollBar(me.nodes.listview_1);
            cc.enableScrollBar(me.nodes.scrollview_);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.flagId = P.gud.head;
            me.getData(function () {
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            // me.DATA = {
            //     avaterlist:['1005']
            // };
            // callback && callback();

            G.ajax.send('user_avaterlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            },true);
        },
        setContents: function () {
            var me = this;

            var panel = me.ui;

            var scrollview = panel.nodes.scrollview_;
            cc.enableScrollBar(scrollview);
            cc.enableScrollBar(me.nodes.listview_1);
            scrollview.removeAllChildren();

            var data = me.DATA.avaterlist;

            var treeStarData = G.class.hero.getHidArrByStar(me.extConf.defaultStar);
            data = me.setHeadData(data,treeStarData);

            // 只有在配置中存在的英雄才处理
            var inConfHeros = [];
            cc.each(data,function(hid){
                if(G.class.zaoxing.getById('head',hid) || G.class.zaoxing.getById('head',hid.split("_")[0])){
                    inConfHeros.push(hid);
                }
            });
            data = inConfHeros;

            if(P.gud.vip >= 5) {
                data.push("1000");
            }

            data.sort(function (a,b) {

                return a * 1 < b * 1 ? -1 : 1;
            });

            var table = me.table = new X.TableView(scrollview,panel.nodes.list_flag,5, function (ui, data) {
                me.setItem(ui, data);
            },null,null,10, 2);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setHeadData: function(data, allData){
            for(var i in data){
                if(!X.inArray(allData, data[i])) {
                    allData.push(data[i]);
                }
            }
            return allData;
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);

            X.render({
                panel_tx: function (node) {
                    node.removeBackGroundImage();
                    node.setBackGroundImage('img/public/ico/ico_bg' + 0 + '.png', 1)
                },
                panel_flag: function(node){
                    node.setScale(.7);
                    node.removeBackGroundImage();

                    var img;
                    if(data.split("_").length > 1) {
                        img = G.class.zaoxing.getById('head',data.split("_")[0]).cond[1].toString();
                        img[img.length - 1] = "a";
                    } else {
                        img = G.class.zaoxing.getById('head',data).cond[1];
                    }
                    node.setBackGroundImage('ico/itemico/' + G.class.fmtItemICON(img) + '.png',0);
                },
                img_confirm: function (node) {
                    node.hide();

                    if (me.flagId == data) {
                        node.show();
                    }
                },
            },ui.nodes);

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (sender.data == me.flagId) {
                        return;
                    }

                    G.ajax.send('user_changeavater',[sender.data],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                            me.remove();
                            G.frame.setting.player.setContents();
                            G.view.toper.updateHead();
                        }
                    },true);


                }
            });
        },
    });

    G.frame[ID] = new fun('ui_top5.json', ID);
})();