/**
 * Created by zhangming on 2020-09-21
 */
 (function () {
    // 金秋活动
    var ID = 'jinqiu_main';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            me.DATA = G.DATA.jinqiu;
            me.etime=G.DATA.asyncBtnsData.midautumn2.etime;
            me.rtime=G.DATA.asyncBtnsData.midautumn2.rtime;
            if(G.time < me.rtime){
                me.nodes.txt_sj1.setString(L("HDSJ"));
                X.timeout(me.nodes.txt_sj2, me.rtime, function () {
                });
            }else{
                me.nodes.txt_sj1.setString(L("DHSJ"));
                X.timeout(me.nodes.txt_sj2, me.etime, function () {
                });
            }
            
        },
        checkHongDian: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.DATA = G.DATA.jinqiu;
            G.hongdian.getData("midautumn2", 1);
            if(G.time > G.DATA.asyncBtnsData.midautumn2.rtime){
                return ;
            }
            if(G.class.getOwnNum(G.gc.midautumn2.lotteryneed[0].t,G.gc.midautumn2.lotteryneed[0].a)>0){
                G.setNewIcoImg(me.nodes.btn_qrjc);
                me.nodes.btn_qrjc.finds('redPoint').setPosition(150,130);
            }else{
                G.removeNewIco(me.nodes.btn_qrjc);
            }
            var data=X.keysOfObject(G.gc.midautumn2.task)
            for(var i = 0 ;i < data.length ; i++){
                if(me.DATA.myinfo.task.data[data[i]] >= G.gc.midautumn2.task[data[i]].pval
                    && !X.inArray(me.DATA.myinfo.task.rec,data[i])){
                    G.setNewIcoImg(me.nodes.btn_fsxd);
                    me.nodes.btn_fsxd.finds('redPoint').setPosition(150,130);
                    return ;
                }else{
                    G.removeNewIco(me.nodes.btn_fsxd);
                }
            }
            
            if(me.DATA.myinfo.gamenum <= 0){
                G.setNewIcoImg(me.nodes.btn_jqxb);
                me.nodes.btn_jqxb.finds('redPoint').setPosition(150,130);
            }else{
                G.removeNewIco(me.nodes.btn_jqxb);
            }
        },

        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });
            me.nodes.btn_bz.click(function (sender) {
                G.frame.help.data({
                    intr:L("TS103")
                }).show();
            })
            //秋日奖池
            me.nodes.btn_qrjc.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn2 && G.time>=G.DATA.asyncBtnsData.midautumn2.etime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.jinqiu_qrjc.once('close', function(){
                    me.checkHongDian();
                }).show();
            });
            //金秋兑换
            me.nodes.btn_jqth.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn2 && G.time>=G.DATA.asyncBtnsData.midautumn2.etime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.jinqiu_dh.once('close', function(){
                    me.checkHongDian();
                }).show();
            });
            //季节礼包
            me.nodes.btn_jjlb.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn2 && G.time>=G.DATA.asyncBtnsData.midautumn2.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.jinqiu_jrlb.once('close', function(){
                    me.checkHongDian();
                }).show();
            });
            //丰收行动
            me.nodes.btn_fsxd.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn2 && G.time>=G.DATA.asyncBtnsData.midautumn2.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.jinqiu_fsxd.once('close', function(){
                    me.checkHongDian();
                }).show();
            });
            //金秋寻宝
            me.nodes.btn_jqxb.click(function(sender,type){
                if(G.DATA.asyncBtnsData.midautumn2 && G.time>=G.DATA.asyncBtnsData.midautumn2.rtime){
                    G.tip_NB.show(L("HDJS"));
                    return ;
                }
                G.frame.jinqiu_jqxb.once('close', function(){
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

            G.DAO.jinqiu.getServerData(function(){
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

    G.frame[ID] = new fun('event_main_jinqiuxunbao.json', ID);
})();