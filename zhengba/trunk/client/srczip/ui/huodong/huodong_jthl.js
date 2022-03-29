/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //积天豪礼
    G.class.huodong_jthl = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_scrollview.json");
        },
        refreshView: function () {
            var me = this;
            me.refreshPanel();
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.viewCache.getView("event_list4.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
        },
        onRemove: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("jthl_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    for(var i = 0; i < me.DATA.data.length; i++){
                        me.DATA.data[i].index = i;
                    }
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            me.setBanner();
            me.setTable();
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        refreshData: function () {
            var me = this;
            me.getData(function () {
                me.table.setData(me.DATA.prize);
                me.table.reloadDataWithScroll(false);
            });
        },
        setBanner: function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner28.png', 0);
                },
                panel_title: function(node) {
                    var rh = new X.bRichText({
                        size:22,
                        maxWidth:node.width + 60,
                        lineHeight:24,
                        family:G.defaultFNT,
                        color:G.gc.COLOR.n5,
                        eachText: function (node) {
                            X.enableOutline(node,'#000000');
                        },
                    });
                    rh.text(X.STR(L("LEIJICHONGZHI1"),G.gc.jthl[me.DATA.key].money));
                    rh.setAnchorPoint(0,1);
                    rh.setPosition(0, node.height);
                    node.addChild(rh);
                },
                txt_time:function (node) {
                    node.setString(X.STR(L("LEIJICHONGZHI2"),me.DATA.val,me.DATA.data.length));
                }
            },me.nodes);
        },
        setTable: function () {
            var me = this;
            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);
            var data = [].concat(me.DATA.data);
            for (var index = 0; index < data.length; index ++) {
                data[index].index = index;
                if (X.inArray(me.DATA.rec,data[index].index)){//已领奖
                    data[index].hasrec = 0;
                }else if(me.DATA.val >= data[index].val) {//可领
                    data[index].hasrec = 2;
                }else {//不可领
                    data[index].hasrec = 1;
                }
            }

            me.gotoindex = null;
            for (var index = 0; index < data.length; index ++) {
                if(me.DATA.val < data[index].val && me.DATA.money < G.gc.jthl[me.DATA.key].money){//不能领的第一个且今天充值不够
                    me.gotoindex = index;
                    break;
                }
            }

            data.sort(function (a,b) {
                if(a.hasrec != b.hasrec){
                    return a.hasrec > b.hasrec ? -1 : 1;
                }else{
                    return a.index < b.index ? -1 : 1;
                }

            });

            var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
        },
        setItem: function (ui, data) {
            var me = this;
            ui.show();
            X.autoInitUI(ui);
            ui.nodes.btn.data = data;
            X.render({
                ico_item:function(node){
                    node.removeAllChildren();
                    X.alignItems(node, data.p, 0, {
                        touch: true,
                        callback: function () {
                        }
                    })
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(L("LEIJICHONGZHI"),data.val) + X.STR('({1}/{2})',me.DATA.val,data.val), G.defaultFNT, 22);
                    txt.setTextColor(cc.color(me.DATA.val >= data.val ? G.gc.COLOR[1] : G.gc.COLOR[5]));
                    txt.setAnchorPoint(0,0.5);
                    txt.setPosition(0, node.height / 2);
                    node.addChild(txt);
                },
                btn: function (node) {
                    node.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    G.removeNewIco(node);
                    if(X.inArray(me.DATA.rec,data.index)){//已领取
                        node.setBtnState(false);
                        ui.nodes.btn_txt.setString(L('YLQ'));
                        ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                    }else {
                        ui.nodes.btn_txt.setString(L('LQ'));
                        if(me.DATA.val >= data.val){//可领取
                            node.setBtnState(true);
                            node.state = 'lq';
                            ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n13));
                            G.setNewIcoImg(node);
                            node.finds('redPoint').setPosition(117,45);
                        }else {//不可领取
                            if(data.index == me.gotoindex){
                                node.loadTextureNormal("img/public/btn/btn2_on.png", 1);
                                node.setBtnState(true);
                                node.state = 'qw';
                                ui.nodes.btn_txt.setString(L('QW'));
                                ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n12));
                            }else {
                                node.setBtnState(false);
                                ui.nodes.btn_txt.setString(L('LQ'));
                                ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                            }
                        }
                    }
                    node.click(function (sender, type) {
                        if(sender.state == 'lq'){
                            me.ajax('jthl_receive', [sender.data.index], function (str, dd) {
                                if (dd.s == 1){
                                    G.frame.jiangli.data({
                                        prize: data.p
                                    }).show();
                                    me.refreshPanel();
                                    G.hongdian.getData("jthl", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    })
                                }
                            },true);
                        }else if(sender.state == 'qw'){
                            G.frame.chongzhi.data({
                                type:2
                            }).once("hide", function () {
                                me.refreshPanel();
                                G.hongdian.getData("jthl", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                })
                            }).show();
                        }

                    })
                },
            },ui.nodes)
        }
    })
})();
