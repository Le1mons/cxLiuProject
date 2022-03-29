(function () {
    //趣味成就

    G.class.renwu_funny = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me.type = type;
            me._super("task_ll.json");
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
        onShow:function () {
            var me = this;
            me.getData(function () {
                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            me.conf = G.gc.qwcj;
            data = me.sortData(X.keysOfObject(me.conf)) ;//排序后的key值

            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                me.setTask(ui, data);
            }, null, null, 8,10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setTask:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.setName("list" + data);
            ui.index = parseInt(data);

            //名字
            ui.nodes.txt_te_name.setString(me.conf[data].title);
            X.enableOutline(ui.nodes.txt_te_name,'#A9681B',2);

            //描述
            str = X.STR(me.conf[data].intro,me.conf[data].pval);
            setTextWithColor(ui.nodes.txt_name,str,cc.color('#804326'));

            //按钮状态
            if(me.DATA.nval[data]){
                if(X.inArray(me.DATA.receive,data)){//达成已领取
                    ui.nodes.btn_receive.hide();
                    ui.nodes.img_received.show();
                    ui.nodes.txt_jdt.setString(me.conf[data].pval + "/" + me.conf[data].pval);
                    ui.nodes.img_jdt.setPercent(me.conf[data].pval / me.conf[data].pval * 100);
                }else {
                    if(me.DATA.nval[data] < me.conf[data].pval){//未达成
                        ui.nodes.btn_receive.hide();
                        ui.nodes.img_received.hide();
                    }else {//达成未领取
                        ui.nodes.btn_receive.show();
                        ui.nodes.img_received.hide();
                    }
                    ui.nodes.txt_jdt.setString(me.DATA.nval[data] + "/" + me.conf[data].pval);
                    ui.nodes.img_jdt.setPercent(me.DATA.nval[data] / me.conf[data].pval * 100);
                }
            }else {
                ui.nodes.btn_receive.hide();
                ui.nodes.img_received.hide();
                ui.nodes.txt_jdt.setString(0 + "/" + me.conf[data].pval);
                ui.nodes.img_jdt.setPercent(0);
            }

            //进度
            X.enableOutline(ui.nodes.txt_jdt,cc.color('#66370e'),2);

            //奖励
            ui.nodes.img_item.removeAllChildren();
            for(var i = 0; i < me.conf[data].prize.length; i ++){
                var item = G.class.sitem(me.conf[data].prize[i]);
                item.setAnchorPoint(0.5, 0.5);
                item.setPosition(item.width / 2 + i * 120, ui.nodes.img_item.height / 2);
                ui.nodes.img_item.addChild(item);
                G.frame.iteminfo.showItemInfo(item);
            }

            //领奖
            ui.nodes.btn_receive.click(function (sender, type) {
                G.ajax.send("qwcj_receive", [data], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.jiangli.data({
                            prize: d.d.prize
                        }).show();
                        me.getData(function () {
                            me.setContents();
                        });
                        //刷新红点
                        G.hongdian.getData(["succtask", "dailytask"], 1, function () {
                            G.frame.renwu.checkRedPoint();
                        })
                    }
                })
            })

        },
        sortData:function(data){
            var me = this;
            var arr1 = [];
            var arr2 = [];
            var arr3 = [];
            for(var i = 0; i < data.length;i++){
                var n = me.DATA.nval[data[i]];
                var p = me.conf[data[i]].pval;
                is = X.inArray(me.DATA.receive,data[i]);
                if(n < p || !n){//不可领
                    arr2.push(data[i]);
                }else {
                    if(is){//已领取
                        arr3.push(data[i]);
                    }else {//可领取
                        arr1.push(data[i]);
                    }
                }
            }
            data = arr1.concat(arr2,arr3);
            return data;
        },
        getData:function (callback) {
          var me = this;
            G.ajax.send("qwcj_open", [], function (d) {
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