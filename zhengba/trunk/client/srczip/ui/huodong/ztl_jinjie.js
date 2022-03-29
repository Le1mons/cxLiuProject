/**
 * Created by 嘿哈 on 2020/3/5.
 */
(function () {
    var ID = 'ztl_jinjie';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            me.nodes.mask.click(function(){
                me.remove();
            });
            //进阶
            me.nodes.btn_4.click(function () {//去充值
                G.event.once('paysuccess',function () {
                    me.once("willClose", function () {
                        G.frame.huodong._panels.refreshPanel();
                    });
                    G.frame.jiangli.once("willClose",function () {
                        me.remove();
                    }).data({
                        prize:G.gc.zhengtao.base.flagprize
                    }).show()
                });
                G.event.emit('doSDKPay', {
                    pid: 'zhengtao_128',
                    logicProid: 'zhengtao_128',
                    money: 12800,
                });
            }, 2000);

            //购买
            me.nodes.btn_3.click(function(){
                me.ajax('zhengtao_buy',[me.buynum],function(str,data){
                    if(data.s == 1){
                        me.once("willClose",function () {
                            G.frame.huodong._panels.refreshPanel();
                        });
                        me.remove();
                    }
                })
            });
            me.nodes.btn_1.click(function () {//减
                if (me.buynum > 1) {
                    me.buynum--;
                }else if (me.buynum == 1) {
                    me.nodes.btn_1.setBtnState(false);
                }
                me.showGetPrize(me.buynum,"click");
            });
            me.nodes.btn_2.click(function () {//加
                if(me.buynum < me.maxbuynum){
                    me.buynum++;
                }else if(me.buynum >= me.maxbuynum){
                    me.nodes.btn_2.setBtnState(false);
                }
                me.showGetPrize(me.buynum,"click");
            });
            //滑动条
            me.nodes.img_hdt.addEventListener(function (sender,type) {
                switch (type) {
                    case ccui.Slider.EVENT_PERCENT_CHANGED:
                        var percent = sender.getPercent();
                        var num = parseInt(percent * me.maxbuynum / 100);
                        if(num < 1) num = 1;
                        me.showGetPrize(num);
                        break;
                    default:
                        break;
                }
            });
        },
        onOpen:function(){
            var me = this;
            me.type = me.data().type;
            me.nodes.txt_shiy.setString(L("ZHENGTAOLING6"));
            me.bindBtn();
        },
        onShow:function(){
            var me = this;
            me.prize = me.data().prize;
            me.DATA = [];
            for(var k in me.prize){
                me.DATA.push(me.prize[k]);
            }
            if(me.type == "jinjie"){
                me.showJinjie();
            }else {
                me.showBuy();
            }
        },
        //进阶界面
        showJinjie:function(){
            var me = this;
            me.nodes.Panel_1.show();
            me.nodes.Panel_2.hide();
            //奖励总和
            var prize = {};
            var allprize = [];
            for(var i = 0; i < me.DATA.length; i++){
                for(var j = 0; j < me.DATA[i].base.length;j++){
                    if(prize[me.DATA[i].base[j].t]){
                        prize[me.DATA[i].base[j].t].n += me.DATA[i].base[j].n;
                    }else {
                        prize[me.DATA[i].base[j].t] = {a:me.DATA[i].base[j].a, n:me.DATA[i].base[j].n};
                    }
                }
                for(var k = 0; k < me.DATA[i].jinjie.length;k++){
                    if(prize[me.DATA[i].jinjie[k].t]){
                        prize[me.DATA[i].jinjie[k].t].n += me.DATA[i].jinjie[k].n;
                    }else {
                        prize[me.DATA[i].jinjie[k].t] = {a:me.DATA[i].jinjie[k].a, n:me.DATA[i].jinjie[k].n};
                    }
                }
            }
            for(var m in prize){
                var item = {a:prize[m].a,t:m,n:prize[m].n};
                allprize.push(item);
            }
            for(var i = 0; i <allprize.length; i++){
                var conf = G.class.getItemByType(allprize[i].t,allprize[i].a);
                if(conf.color >= 5){
                    allprize[i].rank = 1;
                }else {
                    allprize[i].rank = 2;
                }
            }
            allprize.sort(function(a,b){
                if(a.rank != b.rank){
                    return a.rank < b.rank ? -1:1
                }
            });

            X.alignCenter(me.nodes.panel_wp1, [].concat(allprize), {
                scale:0.8,
                touch: true
            });

            //头像框奖励
            X.alignCenter(me.nodes.panel_wp2, G.gc.zhengtao.base.flagprize, {
                scale:0.8,
                touch: true
            });
        },
        //购买界面
        showBuy:function(){
            var me = this;
            me.nodes.Panel_1.hide();
            me.nodes.Panel_2.show();
            me.exp = me.data().exp;
            me.conf = me.data().conf;
            //判断当前经验在哪一档
            var cur = 0;
            for(k in me.conf){
                if(me.exp >= me.conf[k]) cur++;
            }
            me.cur = cur;
            var need = G.gc.zhengtao.base.upgrade_need[0];
            //进界面默认是购买最大数量
            me.nodes.img_hdt.setPercent(100);
            var maxbuynum = me.maxbuynum = X.keysOfObject(me.conf).length - me.cur;
            if(G.class.getOwnNum(need.t,need.a) < need.n * maxbuynum){//钱不够
                maxbuynum = me.maxbuynum = parseInt(G.class.getOwnNum(need.t,need.a) / need.n);
            }
            me.showGetPrize(maxbuynum);

        },
        //买入后可获得的奖励
        showGetPrize:function(buynum,type){
            var me = this;
            me.buynum = buynum;
            var buyexp = buynum * G.gc.zhengtao.base.addexp;
            me.nodes.btn_1.setBtnState(buynum > 1);
            me.nodes.btn_2.setBtnState(buynum < me.maxbuynum);
            //通过点击加减号要改变滑动条的值
            if(type == "click"){
                me.nodes.img_hdt.setPercent(buynum / me.maxbuynum * 100);
            }
            //购买英勇值数量
            var tx = X.setRichText({
                parent:me.nodes.txt_wzgm,
                str: X.STR(L("ZHENGTAOLING5"),buyexp),
                color:"#ffffff",
                outline:"#6f291c",
                size:22
            });
            tx.setPosition(me.nodes.txt_wzgm.width / 2 - tx.trueWidth() / 2, me.nodes.txt_wzgm.height / 2 - tx.trueHeight() / 2)
            //奖励显示
            var prize = {};
            var allprize = [];
            for(var i = me.cur; i < me.cur + buynum; i++){
                for(var j = 0; j < me.DATA[i].base.length; j++){
                    if(prize[me.DATA[i].base[j].t]){
                        prize[me.DATA[i].base[j].t].n += me.DATA[i].base[j].n;
                    }else {
                        prize[me.DATA[i].base[j].t] = {a:me.DATA[i].base[j].a, n:me.DATA[i].base[j].n};
                    }
                }
                for(var k = 0; k < me.DATA[i].jinjie.length;k++){
                    if(prize[me.DATA[i].jinjie[k].t]){
                        prize[me.DATA[i].jinjie[k].t].n += me.DATA[i].jinjie[k].n;
                    }else {
                        prize[me.DATA[i].jinjie[k].t] = {a:me.DATA[i].jinjie[k].a, n:me.DATA[i].jinjie[k].n};
                    }
                }
            }
            for(var m in prize){
                var item = {a:prize[m].a,t:m,n:prize[m].n};
                allprize.push(item);
            }
            X.alignCenter(me.nodes.panel_wp, [].concat(allprize), {
                scale:0.8,
                touch: true
            });
            //消耗
            me.nodes.txt_shiy1.setString(G.gc.zhengtao.base.upgrade_need[0].n * buynum);
        }
    });

    G.frame[ID] = new fun('ztl_jhzq.json', ID);
})();