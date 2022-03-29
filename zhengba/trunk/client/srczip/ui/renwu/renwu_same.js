(function () {
    //任务/成就通用

    G.class.renwu_same = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me.type = type;
            me._super("task.json",null,{cache:true});
        },
        initUi: function(){
            var me = this;
        },
        bindBtn: function(){
            var me = this;
        },
        onOpen:function(){
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        viewUI: function(){
            var me = this;

            if(me.type == 1){
                me.nodes.panel_top.hide();
                me.nodes.panel_top1.show();
                me.nodes.panel_refresh.hide();
                me.nodes.panel_list._setHeight(610);
                me.nodes.panel_list.setPositionY(620);
                ccui.helper.doLayout(me.nodes.panel_list);
                me.nodes.btn_up.hide();//一键领取
            }else {
                me.nodes.panel_top.show();
                me.nodes.panel_top1.hide();
                me.nodes.panel_refresh.show();
                me.nodes.panel_list._setHeight(490);
                me.nodes.panel_list.setPositionY(546.0204);
                ccui.helper.doLayout(me.nodes.panel_list);
                me.nodes.btn_up.show();//一键领取
            }
        },
        onShow: function() {
            var me = this;
            me.getData(function () {
                me.viewUI();
                me.setContents();
            })
        },
        setContents: function () {
            var me = this;
            var data = me.setData(me.DATA.tasklist);
            var dd = [];
            var prize = [];

            for(var i = 0; i < data.length; i ++){
                if(data[i].stype == 1) {
                    prize.push(data[i]);
                }else {
                    dd.push(data[i]);
                }
            }

            if(!cc.isNode(me)){
                return;
            }

            if(me.type == 2){
                me.setBarAndTime(prize);
                me.nodes.btn_up.setBright(false);//一键领取按钮
                me.nodes.txt_yjlq.setTextColor(cc.color(G.gc.COLOR.n15));
                me.nodes.btn_up.click(function(){
                    G.tip_NB.show(L("RENWUYIJIANLQ"));
                });
                for(var j = 0; j < dd.length; j++){
                    if(dd[j].nval >= dd[j].pval && !dd[j].isreceive){
                        me.nodes.btn_up.setBright(true);
                        me.nodes.txt_yjlq.setTextColor(cc.color(G.gc.COLOR.n13));
                        me.nodes.btn_up.click(function(){
                            me.ajax('task_onekey',[],function(str,data){
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize:data.d.prize,
                                    }).show();
                                    me.getData(function () {
                                        me.setContents();
                                    });
                                    G.hongdian.getData(["succtask", "dailytask"], 1, function () {
                                        G.frame.renwu.checkRedPoint();
                                    })
                                }
                            })
                        });
                        break;
                    }
                }
            }else {
                me.setSuc();
            }
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                me.setTask(ui, data);
            }, null, null, 8,10);
            table.setData(dd);
            table.reloadDataWithScroll(true);
        },
        setSuc: function() {
            var me = this;

            me.nodes.txt_cjdsz.setString(P.gud.success);
        },
        setTask: function(ui, data){
            X.autoInitUI(ui);
            var me = this;
            var conf = G.class.task.getTaskByTaskId(data.taskid);
            var str = X.STR(conf.title, data.pval);

            ui.nodes.txt_name.setString(str);
            ui.nodes.txt_jdt.setString(data.nval + "/" + data.pval);
            ui.nodes.img_jdt.setPercent(data.nval / data.pval * 100);
            X.enableOutline(ui.nodes.txt_jdt, "#584115", 1);

            if(data.nval < data.pval) {
                if(conf.tujing == 0){
                    ui.nodes.btn_go.hide();
                    ui.nodes.img_received.hide();
                    ui.nodes.btn_receive.hide();
                }else{
                    ui.nodes.btn_go.show();
                    ui.nodes.img_received.hide();
                    ui.nodes.btn_receive.hide();
                }
            }else{
                if(data.isreceive == 1){
                    ui.nodes.img_received.show();
                    ui.nodes.btn_go.hide();
                    ui.nodes.btn_receive.hide();
                }else{
                    ui.nodes.btn_receive.show();
                    ui.nodes.btn_receive.setTitleColor(cc.color(G.gc.COLOR.n13));
                    ui.nodes.btn_go.hide();
                    ui.nodes.img_received.hide();
                }
            }

            ui.nodes.img_item.removeAllChildren();
            for(var i = 0; i < conf.prize.length; i ++){
                var item = G.class.sitem(conf.prize[i]);
                // item.setScale(.8);
                item.setAnchorPoint(0.5, 0.5);
                item.setPosition(item.width / 2 + i * 120, ui.nodes.img_item.height / 2);
                ui.nodes.img_item.addChild(item);
                G.frame.iteminfo.showItemInfo(item);
            }

            ui.nodes.btn_receive.click(function (sender, type) {
                G.ajax.send("task_receive", [me.type, data.taskid], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.jiangli.data({
                            prize: d.d.prize
                        }).show();
                        var prizetype = [];
                        var prizeid = [];
                        var prizenum = [];
                        for(var i = 0; i < d.d.prize.length; i++){
                            prizetype.push(d.d.prize[i].a);
                            prizeid.push(d.d.prize[i].t);
                            prizenum.push(d.d.prize[i].n);
                        }
                        G.event.emit('sdkevent',{
                            event:'task',
                            data:{
                                taskType:me.type,
                                taskID:data.taskid,
                                get:d.d.prize
                            }
                        });
                        me.getData(function () {
                            me.setContents();
                        });
                        G.hongdian.getData(["succtask", "dailytask"], 1, function () {
                            G.frame.renwu.checkRedPoint();
                        })
                    }
                })
            });
            ui.nodes.btn_go.click(function (sender, type) {
                X.tiaozhuan(conf.tujing);
            })
        },
        setBarAndTime: function(dd){
            var me = this;
            var list = me.nodes.list_bx;
            var listView = me.nodes.listview_bx;

            listView.setItemsMargin(55);
            listView.removeAllChildren();

            dd.sort(function (a, b) {
                return a.pval * 1 < b.pval ? -1 : 1;
            });

            me.nodes.img_tiao2.setPercent(dd[0].nval / dd[0].pval * 100);

            for (var i = 1; i < 4; i ++) {
                var jdt = me.nodes["img_tiao" + (i + 2)];
                jdt.setPercent(((dd[3].nval - 3) - (i - 1) * 3) / 3 * 100);
            }

            for (var i = 0; i < dd.length; i ++) {
                var li = list.clone();
                var d = dd[i];
                (function (li, d, i) {
                    X.autoInitUI(li);
                    var img = i == dd.length - 1 ? "img_task_bx1" : "img_task_bx2";
                    li.show();
                    G.removeNewIco(li);
                    li.nodes.text_cs2.setFontName(G.defaultFNT);
                    li.nodes.text_cs2.setString((d.nval > d.pval ? d.pval : d.nval) + "/" + d.pval);
                    li.nodes.text_cs2.setTextColor(cc.color(G.gc.COLOR.n5));
                    X.enableOutline(li.nodes.text_cs2,'#4A1D09',2);
                    li.data = d.prize;
                    li.id = d.taskid;
                    li.is = d.nval >= d.pval ? true : false;
                    if(d.isreceive) {
                        li.nodes.img_ylq.show();
                        li.nodes.panel_bx.setBackGroundImage("img/task/" + img + "_d.png", 1);
                        li.setTouchEnabled(false);
                    }else {
                        li.setTouchEnabled(true);
                        if(d.nval >= d.pval) {
                            X.addBoxAni({
                                parent: li.nodes.panel_bx,
                                boximg: "img/task/" + img + ".png"
                            });
                            G.setNewIcoImg(li);
                        }else {
                            li.nodes.panel_bx.setBackGroundImage("img/task/" + img + ".png", 1);
                        }
                    }
                    li.click(function (sender) {
                        if(!sender.is) {
                            G.frame.jiangliyulan.data({
                                prize: sender.data
                            }).show();
                            return;
                        }
                        me.ajax("task_receive", [me.type, sender.id], function (str, data) {
                            if(data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                G.event.emit('sdkevent',{
                                    event:'task',
                                    data:{
                                        taskType:me.type,
                                        taskID:sender.id,
                                        get:data.d.prize
                                    }
                                });
                                me.getData(function () {
                                    me.setContents();
                                });
                                G.hongdian.getData(["succtask", "dailytask"], 1, function () {
                                    G.frame.renwu.checkRedPoint();
                                });
                            }
                        });
                    });
                    listView.pushBackCustomItem(li);
                })(li, d, i);
            }

            X.timeout(me.nodes.txt_time, X.getTodayZeroTime() + 24 * 3600,function () {
                me.getData(function () {
                    me.setContents();
                });
            });
        },

        setData: function (data) {
            for(var i = 0; i < data.length; i ++){
                var n = data[i].nval;
                var p = data[i].pval;
                var is = data[i].isreceive;
                if(n < p){
                    data[i].rank = 2;
                }else{
                    if(is == 0){
                        data[i].rank = 1;
                    }else{
                        data[i].rank = 3;
                    }
                }
            }
            data.sort(function (a, b) {
                var confA = G.gc.task[a.taskid];
                var confB = G.gc.task[b.taskid];
                if(a.rank != b.rank) {
                    return a.rank < b.rank ? -1 : 1;
                }else if(confA.paixu != confB.paixu){
                    return confA.paixu < confB.paixu ? -1 : 1;
                }
            });
            return data;
        },

        getData: function(callback){
            var me = this;

            G.ajax.send("task_open", [me.type], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
    })

})();