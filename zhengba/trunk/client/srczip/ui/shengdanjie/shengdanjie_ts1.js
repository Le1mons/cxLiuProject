(function () {
    var ID = 'shengdanjie_ts1';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },

        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

        },

        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.DATA = me.data();
            me.bindBtn();
            me.setContents();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        setContents:function () {
            var me = this;
            me.nodes.tip_title.setString(X.STR(L("shengdanjie_txt7"),L(me.DATA.day)));
            var taskdata = JSON.parse(JSON.stringify(G.gc.christmas.task));
            var arr = [];
            for(var i in taskdata){
                if(taskdata[i].day == me.DATA.day){
                    taskdata[i].id = i;
                    arr.push(taskdata[i]);
                }
            }

            me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                me.setItem(ui, data);
            });
            me.table.setData(arr);
            me.table.reloadDataWithScroll(true);
        },
        setItem:function (ui,data) {
            var me = this;
            ui.show();
            X.autoInitUI(ui);

            ui.nodes.img_suo.hide();
            var mytask = G.frame.shengdanjie.DATA.myinfo.task;
            var num = (mytask.data[data.id] || 0) > data.pval?data.pval:(mytask.data[data.id] || 0);
            if(!data.spprize){
                if(G.frame.shengdanjie.DATA.myinfo.buysptask){
                    ui.nodes.txt_xz.setString(data.detail + X.STR(L("shengdanjie_txt11"),num,data.pval));
                }else{
                    ui.nodes.txt_xz.setString(data.intr + X.STR(L("shengdanjie_txt11"),num,data.pval));
                }
            }else{
                if(G.frame.shengdanjie.DATA.myinfo.buysptask){
                    ui.nodes.txt_xz.setString(data.detail + X.STR(L("shengdanjie_txt11"),num,data.pval));
                }else{
                    ui.nodes.txt_xz.setString(L("shengdanjie_txt10"));
                    ui.nodes.img_suo.show();
                }
            }
            if (data.spprize && G.frame.shengdanjie.DATA.myinfo.buysptask  && me.DATA.day==1){
                var prize = data.prize.concat(data.spprize);
            } else {
                var prize =data.prize;
            }
            ui.setTouchEnabled( true);
            ui.prize = prize;
            ui.click(function (sender) {
                G.frame.jiangliyulan.data({
                    prize: sender.prize
                }).show();
            });
        }
    });
    G.frame[ID] = new fun('sdhd_tk1.json', ID);
})();