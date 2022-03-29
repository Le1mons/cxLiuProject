/**
 * Created by
 */
G.event.on("attrchange_over", function () {
    if(G.frame.yuandan.isShow) {
        G.frame.yuandan.showAttr();
    }
    if(G.frame.yuandan_sc.isShow) {
        G.frame.yuandan_sc.setAttr();
    }
});
(function () {
    //
    var ID = 'yuandan';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.panel_xyyd.click(function () {//元旦礼包
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.yuandan_lb.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.panel_ydsc.click(function () {//元旦商城
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.yuandan_sc.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.panel_jzgf.click(function () {//手工饺子
                G.frame.yuandan_sgjz.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.panel_xsdl.click(function () {//元旦掉落
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.yuandan_dl.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.panel_ydhl.click(function () {//任务
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.yuandan_rw.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.btn_fp.click(function () {//翻牌
                G.frame.yuandan_fp.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS111')
                }).show();
            });
        },
        onShow: function () {
            var me = this;

            G.DAO.yuandan.getServerData(function(){
                me.setContents();
                me.checkHongDian();
            });
            me.showAttr();
            me.showAni();
        },
        showAni:function(){
            var me = this;
            me.ui.finds('panel_bg').setTouchEnabled(true);
            G.class.ani.show({
                json: "yuandan_denglongda_dh",
                addTo: me.nodes.panel_ydhl,
                x: 30,
                y: 50,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            G.class.ani.show({
                json: "yuandan_kongmingdeng_dh",
                addTo: me.nodes.panel_xsdl,
                x: 100,
                y: 145,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            G.class.ani.show({
                json: "yuandan_xuyuan_dh",
                addTo: me.nodes.panel_xyyd,
                x: me.nodes.panel_xyyd.width / 2,
                y: me.nodes.panel_xyyd.height / 2,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            //灯笼
            G.class.ani.show({
                json: "yuandan_denglongxiao_dh",
                addTo: me.nodes.panel_denglong1,
                x: me.nodes.panel_denglong1.width / 2,
                y: me.nodes.panel_denglong1.height-25,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                }
            });
            G.class.ani.show({
                json: "yuandan_denglongxiao_dh",
                addTo: me.nodes.panel_denglong2,
                x: me.nodes.panel_denglong2.width / 2,
                y: me.nodes.panel_denglong2.height -25,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setScaleX(-1);
                }
            });
            G.class.ani.show({
                json: "yuandan_reqi_dh",
                addTo: me.nodes.panel_rq,
                x: 130,
                y: 115,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                }
            });
        },
        showAttr: function () {
            var me = this;
            me.nodes.btn_jia1.click(function (sender, type) {
                G.frame.dianjin.once("hide", function () {
                    me.showAttr();
                }).show();
            });

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.once("hide", function () {
                    me.showAttr();
                }).show();
            });
            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        onAniShow: function () {
            this.action.play('wait', true);
        },
        getWorkShopHD: function(){
            var me = this;
            var cache = X.cacheByUid("yuandanWorkshop");
            if(cache) return false;

            var gfHd = false;
            var work = G.gc.newyear.workshop;
            for(var i=0;i<work.length;i++){
                var needs = work[i].need;
                var maxNum = 0;

                for(var _n=0;_n<needs.length;_n++){
                    var need = needs[_n].n;
                    var has = G.class.getOwnNum(needs[_n].t, needs[_n].a);
                    var num = Math.floor(has / need);

                    if(maxNum == 0 || maxNum >  num){
                        maxNum = num;
                    }
                }
                if(maxNum > 0){
                    gfHd = true;
                    break;
                }
            }
            return gfHd && !cache;
        },
        getTimebool:function(){
            var me = this;
            return X.isHavItem(G.DATA.asyncBtnsData.midautumn) && G.DATA.asyncBtnsData.midautumn.rtime && G.DATA.asyncBtnsData.midautumn.rtime < G.time;
        },
        setContents: function () {
            var me = this;
            X.render({
                txt_cs: function(node){ // 倒计时
                    if (X.isHavItem(G.DATA.asyncBtnsData.midautumn) && G.DATA.asyncBtnsData.midautumn.rtime){
                        if (G.DATA.asyncBtnsData.midautumn.rtime > G.time){
                            var rtime = G.DAO.yuandan.getRefreshTime();
                            me.ui.finds('Text_5').setString('活动时间:');
                        }else if (G.DATA.asyncBtnsData.midautumn.etime > G.time){
                            var rtime = G.DATA.asyncBtnsData.midautumn.etime;
                            me.ui.finds('Text_5').setString('兑换时间:');
                        }
                    }
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                        G.view.mainView.getAysncBtnsData(function () {
                            me.remove();
                        }, false);
                    }, null, {
                        showDay: true
                    });
                }
            }, me.nodes);
        },
        checkHongDian: function () {
            if(!cc.isNode(this.ui)) return;
            var me = this;
            var taskHd = false;
            var task = G.class.newyear.getTask();
            var taskData = G.DATA.yuandan.task;

            for(var i=0;i<task.length;i++){
                var taskid = X.keysOfObject( task[i] )[0];
                var p = task[i][taskid];
                var nval = taskData.data[taskid] || 0;
                var isFinish = X.inArray(taskData.rec, taskid);
                if(nval >= p.pval && !isFinish){
                    taskHd = true;
                    break;
                }
            }

            if(taskHd && !me.getTimebool()){
                G.setNewIcoImg(me.nodes.panel_ydhl.finds('ty_di11'),0.8);
                // me.nodes.panel_ydhl.finds('redPoint').setPosition(118,296);
            }else {
                G.removeNewIco(me.nodes.panel_ydhl);
            }

            // if(!G.DATA.yuandan.xixi){
            //     G.setNewIcoImg(me.nodes.btn_fp);
            //     me.nodes.btn_fp.finds('redPoint').setPosition(118,296);
            // }else {
            //     G.removeNewIco(me.nodes.btn_fp);
            // }

            var gfHd = false;
            var work = G.gc.newyear.workshop;
            for(var i=0;i<work.length;i++){
                var needs = work[i].need;
                var maxNum = 0;

                for(var _n=0;_n<needs.length;_n++){
                    var need = needs[_n].n;
                    var has = G.class.getOwnNum(needs[_n].t, needs[_n].a);
                    var num = Math.floor(has / need);

                    if(maxNum == 0 || maxNum >  num){
                        maxNum = num;
                    }
                }
                if(maxNum > 0){
                    gfHd = true;
                    break;
                }
            }

            if(me.getWorkShopHD()){
                G.setNewIcoImg(me.nodes.panel_jzgf.finds('ty_di11'),0.8);
                // me.nodes.btn_sjz.finds('redPoint').setPosition(177,43);
            }else {
                G.removeNewIco(me.nodes.panel_jzgf.finds('ty_di11'));
            }

            G.hongdian.checkYuanDan();
        }
    });
    G.frame[ID] = new fun('event_yuandan.json', ID);
})();