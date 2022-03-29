/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-效果总览
    var ID = 'kaogu_yulan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me.preLoadRes = ["kaogu4.png", "kaogu4.plist"];
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.removeAllChildren();
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.DATA = G.frame.kaogu_map.DATA;
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            for(var i in G.gc.yjkg.map){
                var list = me.nodes.list_rank.clone();
                me.setItem(list,G.gc.yjkg.map[i],i);
                me.nodes.listview.pushBackCustomItem(list);
            }
        },
        setItem:function(ui,data,key){
            var me = this;
            X.autoInitUI(ui);
            ui.show();

            ui.nodes.bg_list.setTouchEnabled(false);
            if(X.inArray(G.frame.kaogu_map.DATA.unlockmap,key)){
                ui.nodes.img_wkq.hide();
                ui.nodes.txt_kgcs.show();
                ui.nodes.txt_zgss.show();
                ui.nodes.txt_jnxx.show();
                ui.nodes.txt_kgcs.setString(X.STR(L("KAOGU7"), G.frame.kaogu_map.DATA.num[key] || 0));
                ui.nodes.txt_kgcs.setTextColor(cc.color("ffffff"));
                X.enableOutline(ui.nodes.txt_kgcs,"#362016",1);
                if(G.frame.kaogu_map.DATA.milage[key]){
                    if(G.frame.kaogu_map.DATA.milage[key] > 1000){
                        ui.nodes.txt_zgss.setString(X.STR(L("KAOGU8"),(G.frame.kaogu_map.DATA.milage[key] / 1000).toFixed(1) + L("KAOGU16")));
                    }else {
                        ui.nodes.txt_zgss.setString(X.STR(L("KAOGU8"),(G.frame.kaogu_map.DATA.milage[key]).toFixed(1) + L("KAOGU15")));
                    }
                }else {
                    ui.nodes.txt_zgss.setString(X.STR(L("KAOGU8"),0 + L("KAOGU15")));
                }
                ui.nodes.txt_jnxx.setString(X.STR(L("KAOGU9"), X.keysOfObject(G.frame.kaogu_map.DATA.skill[key]).length, X.keysOfObject(G.gc.yjkgskill[key]).length));
                ui.nodes.txt_zgss.setTextColor(cc.color("#ffffff"));
                ui.nodes.txt_jnxx.setTextColor(cc.color("#ffffff"));
                X.enableOutline(ui.nodes.txt_zgss,"#362016",1);
                X.enableOutline(ui.nodes.txt_jnxx,"#362016",1);
                ui.nodes.bg_list.loadTextureNormal("img/kaogu/img_kg_zl_" + key + ".png",1);
            }else {
                ui.nodes.img_wkq.show();
                ui.nodes.txt_kgcs.hide();
                ui.nodes.txt_zgss.hide();
                ui.nodes.txt_jnxx.hide();
                ui.nodes.bg_list.loadTextureNormal("img/kaogu/img_kg_zl_" + key + "_hui.png",1);
            }

        }
    });

    G.frame[ID] = new fun('kaogu_zl.json', ID);
})();