/**
 * Created by zhangming on 2020-09-21
 */
(function () {
    // 中秋活动
    var ID = 'event_zhongqiu';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.txt_cs.removeAllChildren();
            var button = new ccui.Button();
            button.setTouchEnabled(true);
            button.setAnchorPoint(C.ANCHOR[5]);
            button.loadTextureNormal('img/public/btn/btn_bangzhu.png',1);
            button.setTitleFontSize(24);
            button.setTitleColor(cc.color(G.gc.COLOR.n14));
            button.setPosition(cc.p(54,-15));
            button.setScale(0.6);
            button.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS102")
                }).show();
            }, button);
            me.nodes.txt_cs.addChild(button);

            X.render({
                txt_cs: function(node){ // 倒计时
                    var rtime = G.DAO.zhongqiu.getRefreshTime();

                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                   
                    me.timer = X.timeout(node, G.DATA.asyncBtnsData.midautumn.etime, function () {
                        //G.tip_NB.show(L("HUODONG_HD_OVER"));
                    });
                   

                },
                panel_ceby: function(node){
                    X.spine.show({
                        json: 'spine/change.json',
                        addTo: node,
                        x:node.width*0.5,
                        y:0,
                        z:-1,
                        autoRemove: false,
                        noRemove:true,
                        onload: function (spNode) {
                            spNode.stopAllAni();
                            spNode.runAni(0, "wait", true);
                        }
                    });
                }
            }, me.nodes);
        },
        checkHongDian: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            // 任务领奖
            var taskHd = false;
            var task = G.class.midautumn.getTask();
            var taskData = G.DATA.zhongqiu.task;
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

            if(taskHd && G.time < G.DATA.asyncBtnsData.midautumn.rtime){
                G.setNewIcoImg(me.nodes.panel_ceby);
                me.nodes.panel_ceby.finds('redPoint').setPosition(150,-35);
            }else {
                G.removeNewIco(me.nodes.panel_ceby);
            }

            // 嬉戏
            if(!G.DATA.zhongqiu.xixi && G.time < G.DATA.asyncBtnsData.midautumn.rtime){
                G.setNewIcoImg(me.nodes.panel_ytxx);
                me.nodes.panel_ytxx.finds('redPoint').setPosition(150,-10);
            }else {
                G.removeNewIco(me.nodes.panel_ytxx);
            }

            // 月饼工坊
            var gfHd = false;
            var work = G.gc.midautumn.workshop;
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

            if(me.getWorkShopHD() && G.time < G.DATA.asyncBtnsData.midautumn.rtime){
                G.setNewIcoImg(me.nodes.panel_ybgf);
                me.nodes.panel_ybgf.finds('redPoint').setPosition(142,33);
            }else {
                G.removeNewIco(me.nodes.panel_ybgf);
            }

            G.hongdian.checkZhongQiu();
        },
        getWorkShopHD: function(){
            var me = this;
            var cache = X.cacheByUid("zhongqiuWorkshop");
            if(cache) return false;

            var gfHd = false;
            var work = G.gc.midautumn.workshop;
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
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });

            // 嫦娥奔月
            me.nodes.panel_ceby.setTouchEnabled(true);
            me.nodes.panel_ceby.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn && G.time>=G.DATA.asyncBtnsData.midautumn.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.event_zhongqiu_ceby.once('close', function(){
                    me.checkHongDian();
                }).show();
            });

            // 月饼工坊
            me.nodes.panel_ybgf.setTouchEnabled(true);
            me.nodes.panel_ybgf.click(function(sender,type){
                G.frame.event_zhongqiu_ybgf.once('close', function(){
                    me.checkHongDian();
                }).show();
            });

            // 中秋掉落
            me.nodes.panel_zqdl.setTouchEnabled(true);
            me.nodes.panel_zqdl.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn && G.time>=G.DATA.asyncBtnsData.midautumn.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.event_zhongqiu_zqdl.once('close', function(){
                    me.checkHongDian();
                }).show();
            });

            // 中秋商市
            me.nodes.panel_zqss.setTouchEnabled(true);
            me.nodes.panel_zqss.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn && G.time>=G.DATA.asyncBtnsData.midautumn.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.event_zhongqiu_zqss.once('close', function(){
                    me.checkHongDian();
                }).show();
            });

            // 中秋礼包
            me.nodes.panel_zqlb.setTouchEnabled(true);
            me.nodes.panel_zqlb.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn && G.time>=G.DATA.asyncBtnsData.midautumn.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.event_zhongqiu_zqlb.once('close', function(){
                    me.checkHongDian();
                }).show();
            });

            // 月兔嬉戏
            me.nodes.panel_ytxx.setTouchEnabled(true);
            me.nodes.panel_ytxx.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn && G.time>=G.DATA.asyncBtnsData.midautumn.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.event_zhongqiu_ytxx.once('close', function(){
                    me.checkHongDian();
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            G.DAO.zhongqiu.getServerData(function(){
                me.setContents();
                me.checkHongDian();
            });
        },
        onAniShow: function () {
            var me = this;

            me.action.play('wait', true);
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_zhongqiu.json', ID);
})();