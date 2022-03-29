/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-效果总览
    var ID = 'kaogu_xgzl';

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
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.wwDATA = G.frame.kaogu_main.wwDATA;
        },
        onShow:function(){
            var me = this;
            me.showWwbuff();
            me.showWwteambuff();
        },
        showWwbuff:function(){
            var me = this;
            var allbuff = {};//key是属性，value是总值
            //展览馆中所有文物的四种属性和
            for(var k in G.gc.yjkg.exhibition){
                for(var i = 0; i < G.gc.yjkg.exhibition[k].data.length; i++){
                    if(me.wwDATA.data[k][i] > 0){//找出0星以上的文物
                        //算出这个文物每个星级的属性加成
                        var wwid = G.gc.yjkg.exhibition[k].data[i];
                        for(var n in G.gc.wenwu[wwid]){
                            if(X.keysOfObject(G.gc.wenwu[wwid][n].showbuff).length > 0 && parseInt(n) <= me.wwDATA.data[k][i]){
                                for(var j in G.gc.wenwu[wwid][n].showbuff){
                                    if(allbuff[j]){
                                        allbuff[j] += G.gc.wenwu[wwid][n].showbuff[j];
                                    }else {
                                        allbuff[j] = G.gc.wenwu[wwid][n].showbuff[j];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            var buffico = [];
            var bufftype = ["atk","hp","atkpro","hppro"];
            for(var k = 0; k < bufftype.length; k++){
                var list = me.nodes.list_wp.clone();
                X.autoInitUI(list);
                list.show();
                list.nodes.img_wp.removeBackGroundImage();
                list.nodes.img_wp.setBackGroundImage('img/kaogu/img_ww_' + bufftype[k] + ".png",1);
                if(allbuff[bufftype[k]]){
                    if(bufftype[k].indexOf("pro") != -1){
                        list.nodes.txt_zyjls.setString(allbuff[bufftype[k]] / 10 + "%");
                    }else {
                        list.nodes.txt_zyjls.setString(allbuff[bufftype[k]]);
                    }
                }else {
                    list.nodes.txt_zyjls.setString(0);
                }
                list.nodes.txt_zyjls.setTextColor(cc.color("#ffd86e"));
                X.enableOutline(list.nodes.txt_zyjls,"#7d4206");
                buffico.push(list);
            }
            me.nodes.panel_jcww.setAnchorPoint(0.5,1);
            X.center(buffico,me.nodes.panel_jcww);
        },
        showWwteambuff:function(){
            var me = this;
            var data = [];
            for (var k in G.gc.yjkg.exhibition){
                var conf = JSON.parse(JSON.stringify(G.gc.yjkg.exhibition[k]));
                conf.id = k;
                data.push(conf);
            }
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.txt_name.setString(data.name);
            for(var k in data.buff){
                var type = L(k);
                if(k.indexOf("pro") == -1){
                    var value = data.buff[k];
                }else {
                    var value = data.buff[k] / 10 + "%";
                }
            }
            ui.nodes.txt_ddms.setString(X.STR(L("KAOGU32"),type,value));
            //是否领奖
            ui.nodes.txt_name.setTextColor(cc.color("#ffffff"));
            X.enableOutline(ui.nodes.txt_name,"#373737");
            if(!X.inArray(me.wwDATA.rec,data.id)){
                ui.nodes.btn_bq.setBright(false);
                ui.nodes.txt_ddms.setTextColor(cc.color("#6c6664"));
                ui.nodes.bg_list.loadTexture('img/kaogu/img_kg_xhzl_di1.png',1);
            }else {
                ui.nodes.btn_bq.setBright(true);
                ui.nodes.txt_ddms.setTextColor(cc.color("#bd4a18"));
                ui.nodes.bg_list.loadTexture('img/kaogu/img_kg_xhzl_di.png',1);
            }
        }

    });

    G.frame[ID] = new fun('kaogu_xgzl.json', ID);
})();