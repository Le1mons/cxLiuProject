/**
 * Created by  on 2019//.
 */
(function () {
    //武魂回收
    var ID = 'wuhun_recycle';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.whtid = me.data();
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_3.click(function(){
                me.ajax("wuhun_recycle",[me.whtid],function(str,data){
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:data.d.prize
                        }).show();
                        me.remove();
                    }
                })
            });
            me.nodes.btn_4.click(function(){
                me.ajax("wuhun_recycle",[me.whtid],function(str,data){
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:data.d.prize
                        }).show();
                        me.remove();
                    }
                })
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            //var conf = G.gc.wuhuncom.base.recycle;
            var cost = G.DATA.wuhun[me.whtid].lv > 1 ? 500 : 0;
            var rh = X.setRichText({
                parent:me.nodes.txt_wz,
                str:X.STR(L("WUHUN10"),cost)
            });
            me.nodes.btn_3.setVisible(cost == 0);
            me.nodes.btn_4.setVisible(cost != 0);
            me.nodes.zs_wz.setString(cost);
            //自己算回收的奖励,武魂币，升级消耗的精华，金币
            // var prize = [].concat(conf.prize);
            // var wuhunnum = 0;
            // var jinbinum = 0;
            // for(var i in G.gc.wuhuncom.base.need){
            //     if(G.DATA.wuhun[me.whtid].lv > parseInt(i)){
            //         wuhunnum += G.gc.wuhuncom.base.need[i].num;
            //         jinbinum += G.gc.wuhuncom.base.need[i].need[0].n;
            //     }
            // }
            // var prize1 = {"a":"item","t":G.gc.wuhuncom.base.item,"n":wuhunnum};
            // var prize2 = {"a":"attr","t":"jinbi","n":jinbinum};
            // if(wuhunnum){
            //     prize.push(prize1);
            // }
            // if(jinbinum){
            //     prize.push(prize2);
            // }
            X.alignItems(me.nodes.panel_1,me.getPrize(me.whtid),"center",{
                scale:1,
                touch:true
            });
        },
        getPrize: function (tid) {
            var conf = G.gc.wuhuncom.base.recycle;
            var prize = [].concat(conf.prize);
            var wuhunnum = 0;
            var jinbinum = 0;
            for(var i in G.gc.wuhuncom.base.need){
                if(G.DATA.wuhun[tid].lv > parseInt(i)){
                    wuhunnum += G.gc.wuhuncom.base.need[i].num;
                    jinbinum += G.gc.wuhuncom.base.need[i].need[0].n;
                }
            }
            var prize1 = {"a":"item","t":G.gc.wuhuncom.base.item,"n":wuhunnum};
            var prize2 = {"a":"attr","t":"jinbi","n":jinbinum};
            if(wuhunnum){
                prize.push(prize1);
            }
            if(jinbinum){
                prize.push(prize2);
            }
            return prize;
        }
    });
    G.frame[ID] = new fun('shengwu_huishou.json', ID);
})();