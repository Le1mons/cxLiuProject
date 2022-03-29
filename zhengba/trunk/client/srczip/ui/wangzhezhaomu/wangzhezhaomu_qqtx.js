/**
 * Created by  on 2019//.
 */
(function () {
    //权倾天下
    G.class.wangzhezhaomu_qqtx = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_chuanqitiaozhan.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_bangzhu.click(function(){
                G.frame.help.data({
                    intr:(L("TS73"))
                }).show();
            });
            //兑换商店
            me.nodes.btn_dhsd.click(function () {
                G.frame.qqtx_scjf.data({
                    prize:me.DATA.info.data.openinfo.boss.duihuan,
                    buyinfo:me.DATA.boss.buyinfo
                }).show();
            });
            //积分奖励
            me.nodes.btn_jfjl.click(function () {
                G.frame.qqtx_jfjl.data({
                    prize:me.DATA.info.data.openinfo.boss.jifenprize,
                    reclist:me.DATA.boss.reclist,
                    jifen:me.DATA.boss.jifen
                }).show();
            });
            //挑战奖励
            me.nodes.btn_jtzjl.click(function () {
                G.frame.qqtx_tzjf.data({
                    prize:me.DATA.info.data.openinfo.boss.dpsprize
                }).show();
            });
            //挑战
            me.nodes.btn_shici.click(function(){
                if(me.ifnum){
                    G.frame.yingxiong_fight.data({
                        pvType: 'wangzhezhaomu',
                        data: {
                            enemy: true,
                            isNpc: true,
                        },
                    }).show();
                }else {
                    G.tip_NB.show(L("TZCSBZ"));
                }
            })
        },
        onShow: function () {
            var me = this;
            me.getData(function(){
                me.setContents();
                me.checkRedPoint();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(){
            var me = this;
            X.timeCountPanel(me.nodes.txt_hdsj, me.DATA.info.etime, {
                str: "<font color=#fff8e1>剩余时间：</font>" + (me.DATA.info.etime - G.time > 24 * 3600 * 2 ? X.moment(me.DATA.info.etime - G.time) : "{1}")
            });
            me.nodes.sycishu.setString(X.STR(L("WANZGHEZHAOMU21"),(me.DATA.info.data.openinfo.boss.val - me.DATA.boss.num + "/" + me.DATA.info.data.openinfo.boss.val)));
            if(me.DATA.info.data.openinfo.boss.val - me.DATA.boss.num > 0){
                me.ifnum = true;
                me.nodes.btn_shici.setBright(true);
                me.nodes.txt_szq2.setTextColor(cc.color(G.gc.COLOR.n12));
                G.setNewIcoImg(me.nodes.btn_shici);
                me.nodes.btn_shici.finds('redPoint').setPosition(120,50);
            }else {
                me.ifnum = false;
                me.nodes.btn_shici.setBright(false);
                me.nodes.txt_szq2.setTextColor(cc.color(G.gc.COLOR.n15));
                G.removeNewIco(me.nodes.btn_shici);
            }
            me.nodes.rw.removeAllChildren();
            X.setHeroModel({
                parent:me.nodes.rw,
                data:{},
                model : me.DATA.info.data.plid + 'a'
            })
        },
        checkRedPoint:function(){
            var me = this;
            G.removeNewIco(me.nodes.btn_jfjl);
            for(var i = 0; i < me.DATA.info.data.openinfo.boss.jifenprize.length; i++){
                if(!X.inArray(me.DATA.boss.reclist,i) && me.DATA.boss.jifen >= me.DATA.info.data.openinfo.boss.jifenprize[i].val){
                    G.setNewIcoImg(me.nodes.btn_jfjl);
                    break;
                }
            }
        },
        getData:function(callback){
            var me = this;
            me.ajax('wangzhezhaomu_open', ['boss'], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        }
    });
})();