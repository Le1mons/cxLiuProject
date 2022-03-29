/**
 * Created by WLX on 2019/10/26.
 */
(function () {
    //累充返利

    G.class.back_lcfl = X.bView.extend({

        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("event_scrollview.json");
        },
        bindBtn:function () {
            var me = this;
        },
        onOpen:function () {
            var me = this;
            me.type = "recharge";
            me.bindBtn();
        },
        onShow:function () {
            var me = this;
            X.viewCache.getView("event_list4.json", function (node) {
                me.list = node.nodes.panel_list;

                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
        },
        refreshView: function () {
            var me = this;
            me.ajax('return_open', [], function(str, data){
                if(data.s == 1) {
                    me.DATA = data.d;
                    me.setContents();
                }
            });
        },
        setContents:function () {
            var me = this;
            me.conf = G.gc.returnhome;
            me.setBanner();
            me.setList();
        },
        //列表上方的图片
        setBanner:function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner25.png', 0);
                },
                panel_title: function (node) {
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
                    rh.text(me.conf.intr[me.type]);
                    rh.setAnchorPoint(0,1);
                    rh.setPosition(0, node.height);
                    node.addChild(rh);
                },
                txt_count: L("SYSJ"),
                txt_time: function (node) {
                    X.timeout(node, me.DATA.v, function () {
                        me.setContents();
                    },null, conf = {"timeLeftStr":"h:mm:s"});
                },
            },me.nodes);
        },
        setList:function () {
            var me = this;
            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            var listdata = me.conf[me.type];

            if(!me.table) {
                var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]+pos[1]);
                }, null, null, 1, 3);
                table.setData(listdata);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(listdata);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data,index) {
            var me = this;
            X.autoInitUI(ui);

            if(me.DATA.recharge < data.pval){//不满足条件，不可领取
                ui.nodes.btn_txt.setString(L('LQ'));
                ui.nodes.btn.setEnableState(false);
                ui.nodes.btn.setBright(false);
                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
            }else {
                if(X.inArray(me.DATA.receive.recharge,index)){//已领取
                    ui.nodes.btn_txt.setString(L('YLQ'));
                    ui.nodes.btn.setEnableState(false);
                    ui.nodes.btn.setBright(false);
                    ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                    G.removeNewIco(ui.nodes.btn);
                }else {//可领取
                    ui.nodes.btn.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    ui.nodes.btn_txt.setString(L('LQ'));
                    ui.nodes.btn.setEnableState(true);
                    ui.nodes.btn.setBright(true);
                    ui.nodes.btn_txt.setTextColor(cc.color("#2f5719"));
                    G.setNewIcoImg(ui.nodes.btn, .9);
                }
            }

            X.render({
                btn: function (node) {
                    node.click(function (sender, type) {
                        me.ajax('return_receive', [me.type, index], function (str, dd) {
                            if(dd.s == 1){
                                G.frame.jiangli.data({
                                    prize: dd.d.prize
                                }).show();
                                //刷新当前界面状态
                                ui.nodes.btn_txt.setString(L('YLQ'));
                                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                                ui.nodes.btn.setEnableState(false);
                                //刷新数据
                                G.frame.playerback_main.getData();
                                G.frame.playerback_main.updateTop();
                                //刷新红点
                                G.removeNewIco(ui.nodes.btn);
                                G.hongdian.getData("return", 1, function () {
                                    G.frame.playerback_main.checkRedPoint();
                                })
                            }
                        })
                    })
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(L("backtip2"),data.pval,me.DATA.recharge,data.pval),G.defaultFNT, 22);
                    txt.setTextColor(cc.color(me.DATA.recharge >= data.pval ? G.gc.COLOR[1] : G.gc.COLOR[5]));
                    txt.setAnchorPoint(0,0.5);
                    txt.setPosition(0, node.height / 2);
                    node.addChild(txt);
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.prize, "left", {
                        touch: true,
                    })
                },
            }, ui.nodes);
            ui.show();
        }
    })
})();