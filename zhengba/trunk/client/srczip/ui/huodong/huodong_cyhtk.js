/**
 * Created by  on 2019//.
 */
(function () {
    //财运亨通卡
    G.class.huodong_cyhtk = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json");
        },
        onOpen: function () {
            var me = this;
            me.type = me._data.stype == '10054' ? 1 : 2;
            me.bindBtn();
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.btn_htk_y.click(function () {
                if(P.gud.lv < me.DATA.info.lv){
                    var str = me.type == 1 ? L('CYHTKBKLQ') : L('ZNJNKKLQ');
                    return G.tip_NB.show(X.STR(str,me.DATA.info.lv))
                }
                G.frame.cyhtk_prize.data({
                    prize:me.DATA.info.arr,
                    needmoney:me.DATA.info.needmoney,
                    proid:me.DATA.info.chongzhi.proid,
                }).show();
            });
        },
        onShow: function () {
            var me = this;

            me.nodes.panel_banner2.hide();
            me.nodes.btn_htk_y.show();
            me.nodes.panel_htk_t.show();

            if(me.type == 1){
                me.nodes.panel_banner.setBackGroundImage("img/event/img_event_banner26.png", 0);
            }else {
                me.nodes.panel_banner.setBackGroundImage("img/event/img_event_banner32.png", 0);
            }
            X.viewCache.getView("event_list9.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
            var rh = new X.bRichText({
                size:22,
                maxWidth:me.nodes.panel_title.width + 60,
                lineHeight:24,
                family:G.defaultFNT,
                color:G.gc.COLOR.n5,
                eachText: function (node) {
                    X.enableOutline(node,'#000000');
                },
            });
            rh.text(me._data.intr);
            rh.setAnchorPoint(0,1);
            rh.setPosition(0, me.nodes.panel_title.height);
            me.nodes.panel_title.addChild(rh);
        },
        setContents:function(isTop){
            var me = this;
            //是否已经激活
            if(me.DATA.myinfo.tq){
                me.nodes.btn_htk_txt.setString(L("YJH"));
                me.nodes.btn_htk_y.setTouchEnabled(false);
            }else {
                me.nodes.btn_htk_txt.setString(me.DATA.info.needmoney+L("YUAN"));
                me.nodes.btn_htk_y.setTouchEnabled(true);
            }
            me.nodes.txt_cxts.setString(X.STR(L("CYHTKCXSJ"),me.DATA.myinfo.maxday));//持续多少天
            //时间
            var th = X.setRichText({
                str:X.STR(L("CUHTKHDSJ"),me.DATA.myinfo.day,me.DATA.myinfo.maxday),
                parent:me.nodes.txt_jrlc,
                color: "#2bdf02",
                outline: "#000000"
            });
            me.setTable(isTop);
        },
        setTable:function(isTop){
            var me = this;

            var data = X.keysOfObject(me.DATA.info.arr);
            var jumpindex = 0;
            for(var i = 0; i < data.length; i++){
                if(
                    (parseInt(data[i]) <= me.DATA.myinfo.day && !X.inArray(me.DATA.myinfo.gotarr.pt, data[i])) ||
                    (me.DATA.myinfo.tq && !X.inArray(me.DATA.myinfo.gotarr.tq,data[i]))
                ){
                    jumpindex = i;
                    break;
                }
            }
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
                me.table._table.scrollToCell(jumpindex);//跳到指定位置
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var info = me.DATA.info.arr[data];
            X.render({
                ico_item1:function (node) {
                    X.alignItems(node, info.p, "center", {
                        touch:true,
                        mapItem: function (item) {
                            item.setGet(X.inArray(me.DATA.myinfo.gotarr.pt,data));
                        }
                    });
                },
                ico_item2:function (node) {
                    X.alignItems(node, info.tqp, "center", {
                        touch:true,
                        mapItem: function (item) {
                            item.setGet(X.inArray(me.DATA.myinfo.gotarr.tq,data));
                            item.setSuo(!me.DATA.myinfo.tq);
                            item.icon.setBright(me.DATA.myinfo.tq);
                            if(me.DATA.myinfo.tq){
                                item.background.loadTexture("img/public/ico/ico_bg" + item.conf.color + '.png', 1);
                            }else {
                                item.background.loadTexture('img/public/ico/ico_bg_hui.png', 1);
                            }
                        }
                    });
                },
                sz_phb:data,
                img_ylq:function (node) {
                    if(X.inArray(me.DATA.myinfo.gotarr.pt,data) && X.inArray(me.DATA.myinfo.gotarr.tq,data)) return node.show();
                    return node.hide();
                }
            },ui.nodes);
            //按钮状态
            if(parseInt(data) > me.DATA.myinfo.day){//不能领取
                ui.nodes.btn.show();
                ui.nodes.btn.setBtnState(false);
                ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                ui.nodes.btn_txt.setString(L("LQ"));
            }else {
                if(!X.inArray(me.DATA.myinfo.gotarr.pt,data) || (!X.inArray(me.DATA.myinfo.gotarr.tq,data)&&me.DATA.myinfo.tq)){//领取奖励
                    ui.nodes.btn.show();
                    ui.nodes.btn.setBtnState(true);
                    ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n13));
                    ui.nodes.btn_txt.setString(L("LQ"));
                    ui.nodes.btn.loadTextureNormal("img/public/btn/btn1_on.png",1);
                }else if(!me.DATA.myinfo.tq){//激活领取
                    ui.nodes.btn.show();
                    ui.nodes.btn.setBtnState(true);
                    ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n12));
                    ui.nodes.btn_txt.setString(L("CYHTKJJLQ"));
                    ui.nodes.btn.loadTextureNormal("img/public/btn/btn2_on.png",1);
                }else if(X.inArray(me.DATA.myinfo.gotarr.pt,data) && X.inArray(me.DATA.myinfo.gotarr.tq,data)){//已领
                    ui.nodes.btn.hide();
                }
            }
            ui.nodes.btn.click(function () {
                if(P.gud.lv < me.DATA.info.lv){
                    var str = me.type == 1 ? L('CYHTKBKLQ') : L('ZNJNKKLQ');
                    return G.tip_NB.show(X.STR(str,me.DATA.info.lv));
                }else {
                    if(!me.DATA.myinfo.tq && X.inArray(me.DATA.myinfo.gotarr.pt,data)){
                        G.frame.cyhtk_prize.data({
                            prize:me.DATA.info.arr,
                            needmoney:me.DATA.info.needmoney,
                            proid:me.DATA.info.chongzhi.proid,
                        }).show();
                    }else {
                        G.ajax.send('huodong_use', [me._data.hdid, 1, data], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if(d.s == 1){
                                G.frame.jiangli.data({
                                    prize: d.d.prize
                                }).show();
                                me.refreshPanel();
                                if(me._data.isqingdian){
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                            }
                        })
                    }
                }
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
    });
})();