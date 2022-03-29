/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-记录
    var ID = 'kaogu_jilu';

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
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.type = me.data().type;//地图类型
            me.time = me.data().time;//时间
            me.road = me.data().road;//路程
            me.num = me.data().num;//次数
            me.energe = me.data().energe;//获得的能源
            me.exp = me.data().exp;//获得的经验
        },
        onShow:function(){
            var me = this;
            me.setContents();
            me.showGet();
        },
        //泰坦能源和考古经验的获得
        showGet:function(){
            var me = this;
            var yijidis = [];//经过的遗迹点id
            for(var k in G.gc.yjkg.map[me.type].yiji){
                if(me.road >= G.gc.yjkg.map[me.type].yiji[k].distance)
                yijidis.push(k);
            }
            me.nodes.txt_kgjg.setString(X.STR(L("KAOGU49"),yijidis.length));
            ////经验 对应地图每米本地图经验*本次考古距离*（1+仪器考古经验加成百分比）
            //var exp = parseInt(G.gc.yjkg.map[me.type].exp * me.road * (1 + G.gc.yjkg.yiqi.exp[G.frame.kaogu_map.DATA.yiqi.speed].add));
            //if(exp < 0) exp = 0;
            //
            ////泰坦能源 （对应地图每米泰坦能源*本次考古距离*（1+技能提供的基础泰坦能源提升百分比））+技能提供经过遗迹点时获得的泰坦能源
            //var energypro = 0;//能源百分比，技能表中类型是4
            //var energynum = 0;//能源数量，技能表中类型是3
            //if(G.frame.kaogu_map.DATA.skill[me.type]){//有解锁的技能
            //    for(var i = 0; i < G.frame.kaogu_map.DATA.skill[me.type].length; i++){
            //        var skillid = G.frame.kaogu_map.DATA.skill[me.type][i];
            //        var skillconf = G.gc.yjkgskill[me.type][skillid];
            //        if(skillconf.type == 4){
            //            energypro += skillconf.pro;
            //        }else if(skillconf.type == 3){
            //            if(X.inArray(yijidis, skillconf.yiji)){
            //                energynum += num;
            //            }
            //        }
            //    }
            //}
            //var energy = parseInt(G.gc.yjkg.map[me.type].energe * me.road * (1+energypro)) + energynum;
            //if(energy < 0) energy = 0;
            me.nodes.tsxt_sl1.setString(X.fmtValue(parseInt(me.energe)));
            me.nodes.tsxt_sl2.setString(X.fmtValue(parseInt(me.exp)));
        },
        setContents:function(){
            var me = this;
            me.nodes.bg_list.loadTextureNormal("img/kaogu/img_kg_zl_" + me.type + ".png",1);//背景
            //总里程
            var line;
            if(me.road > 1000){
                line = (me.road / 1000).toFixed(1) + L("KAOGU16");
            }else {
                line = me.road + L("KAOGU15");
            }
            me.nodes.txt_zgss.setString(X.STR(L("KAOGU57"),line));
            //时长
            var str;
            if(me.time > 60*60){//一小时以上
                var hour = parseInt(me.time / 3600);
                var min = parseInt(me.time % 3600 / 60);
                str = hour + L("KAOGU47") + min + L("KAOGU48");
            }else {
                var min = parseInt(me.time / 60);
                str = min + L("KAOGU48");
            }
            me.nodes.txt_jnxx.setString(X.STR(L("KAOGU46"),str));
            //考古次数
            //me.nodes.txt_kgcs.setString(X.STR(L("KAOGU7"),me.num));
            me.nodes.txt_kgcs.hide();
            var prize = me.data().prize;
            if(prize.length < 1) return me.nodes.img_zwjl.show();
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                },cc.size(me.nodes.list.width+20, me.nodes.list.height));
                me.table.setData(prize);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(prize);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var item = G.class.sitem(data,true);
            G.frame.iteminfo.showItemInfo(item);
            item.setSwallowTouches(false);
            ui.setSwallowTouches(false);
            ui.setTouchEnabled(false);
            item.setPosition(0,0);
            item.setAnchorPoint(0,0);
            ui.removeAllChildren();
            ui.addChild(item);
        }
    });

    G.frame[ID] = new fun('kaogu_jilu.json', ID);
})();