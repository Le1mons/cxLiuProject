/**
 * Created by LYF on 2019/1/8.
 */

(function() {
    //头像
    G.class.zhanshiyingxiong = X.bView.extend({
        extConf:{
            defaultStar:3
        },
        ctor: function(type) {
            var me = this;
            G.frame.touxiang = me;
            me._type = type;
            me._super('setting_touxiang.json');
        },

        bindBtn: function() {
            var me = this;
        },

        onOpen: function() {
            var me = this;

            me.nodes.txt_txlb.setString(L("XZYXMX"));
        },
        onShow: function() {
            var me = this;
            me.flagId = P.gud.model;
            me.getData(function () {
                me.setContents();
            });
            cc.enableScrollBar(me.nodes.scrollview_tx);
        },
        getData: function(callback) {
            var me= this;
            G.ajax.send('user_avaterlist',[], function(d){
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;
            var scrollview = me.nodes.scrollview_tx;
            var data = me.DATA.avaterlist;

            var treeStarData = G.class.hero.getHidArrByStar(me.extConf.defaultStar);
            data = me.setHeadData(data,treeStarData);

            //只有在配置中存在的英雄才能处理3
            var inConfHeros = [];
            cc.each(data,function(hid){
                hid = hid.toString();
                if(G.class.hero.getById(hid) || G.class.hero.getById(hid.split("_")[0]) || G.gc.skin[hid]){
                    inConfHeros.push(hid);
                }
            });
            data = inConfHeros;

            data.sort(function (a,b){
                return a * 1 < b * 1 ? -1 : 1;
            });

            var table = me.table = new X.TableView(scrollview,me.nodes.list_flag,5,
                function (ui, data) {
                    me.setItem(ui, data);
                },null,null,10, 10);
            table.setData(data);
            table.reloadDataWithScroll(true);

        },
        setHeadData:function(data, allData){
            for(var i in data) {
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
                    node.setScale(.9);
                    node.removeBackGroundImage();
                    var img;
                    if(data.split("_").length > 1) {
                        img = data.split("_")[0];
                        img = img.substring(0, img.length - 1);
                        img += 'a';
                    } else {
                        img = G.class.zaoxing.getById('head',data).cond[1];
                    }
                    node.setBackGroundImage('ico/itemico/' + G.class.fmtItemICON(img) + '.png',0);
                },
                img_confirm: function (node) {
                    node.hide();
                    if (me.flagId == data) {
                        node.show();
                    } else {
                        node.hide();
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
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            me.ajax('user_changemodel',[sender.data],function(str, data) {
                                if(data.s == 1) {
                                    G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                                    me.flagId = sender.data;
                                    var chr = me.table.getAllChildren();
                                    for (var i in chr) {
                                        if(chr[i].data == me.flagId) {
                                            chr[i].finds("img_confirm$").show();
                                        } else {
                                            chr[i].finds("img_confirm$").hide();
                                        }
                                    }
                                }
                            },true);
                        },
                        richText: L("ZSXX"),
                    }).show();



                }
            });
        }

    });
})();