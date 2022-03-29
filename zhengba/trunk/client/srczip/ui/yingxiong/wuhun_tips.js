/**
 * Created by  on 2019//.
 */
(function () {
    //武魂tips
    var ID = 'wuhun_tips';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.zhuangtai2.show();
            me.nodes.zhuangtai1.hide();
            cc.enableScrollBar(me.nodes.scrollview2);
            me.ui.finds('txt_yl').setString(L("WUHUN16"));
            me.wuhundata = me.data().data;
            me.whtid = me.data().whid;
            me.whlv = me.data().whlv;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
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
            var wuhunitem = G.class.wuhun(me.wuhundata);
            wuhunitem.setAnchorPoint(0,0);
            me.nodes.ico.removeAllChildren();
            me.nodes.ico.addChild(wuhunitem);
            me.nodes.txt_name.setString(me.wuhundata.name);
            me.nodes.txt_name.setTextColor(cc.color(G.gc.COLOR[me.wuhundata.color]));
            //属性
            for(var i = 0; i < X.keysOfObject(me.wuhundata.buff).length; i++){
                var rh = X.setRichText({
                    parent:me.nodes['shuxing_wz' + (i+1)],
                    str:L(X.keysOfObject(me.wuhundata.buff)[i]) + "<font color=#1c9700>" + "+" + me.wuhundata.buff[X.keysOfObject(me.wuhundata.buff)[i]] + "</font>",
                    color:"#f6ebcd",
                });
                rh.x = 0;
            }
            //专属武将
            me.nodes.shuxingwz.setString(G.gc.hero[me.wuhundata.hero].name + L("WUHUN14"));

            var data = [];
            var info = JSON.parse(JSON.stringify(G.gc.wuhun[me.whtid]));
            for(var i in info){
                info[i].k = i;
                if(i*1 <= G.gc.wuhuncom.base.maxlevel && (info[i].skillintro || X.keysOfObject(info[i].exbuffshow).length > 0)){
                    data.push(info[i]);
                }
            }
            me.infolist = data;
            me.getStr();
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview2, me.nodes.txt_nr, 1, function (ui, data, pos) {
                    me.setItem(ui, data);
                }, null, 0, 0, 15);
                for(var i = 0; i < me.listarr.length; i++){
                    table.addCellSize(me.listarr[i],cc.size(520,70));
                }
                for(var i = 0; i < me.longstr.length; i++){
                    table.addCellSize(me.longstr[i],cc.size(520,70));
                }
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            var k = data.k*1;
            ui.show();
            X.autoInitUI(ui);
            var str1 = X.STR(L("WUHUN2"),k);
            var str2 = data.skillintro ? L("WUHUN3") : L("WUHUN4");
            var str3 = "";
            if(data.skillintro){//专属属性
                str3 = data.skillintro;
            }else {//特殊属性
                for(var i in data.exbuffshow){
                    if(i.indexOf("pro") == -1){
                        str3 += L(i) + "+" + data.exbuffshow[i];
                    }else {
                        str3 += L(i) + "+" + data.exbuffshow[i] / 10 + "%";
                    }
                }
            }
            var color;
            if(me.whlv >= k){
                color = "#77ef6b";
            }else {
                color = "#968f90";
            }
            ui.removeAllChildren();
            var str  = str1 + str2 + str3;
            var rh = X.setRichText({
                parent:ui,
                str:str,
                color:color,
            });
            rh.setPosition(0, ui.height - rh.trueHeight());
        },
        //提前知道哪些描述有多行
        getStr:function () {
            var me = this;
            me.listarr = [];
            me.longstr = [];
            for(var j = 0; j < me.infolist.length; j++){
                var k = me.infolist[j].k*1;
                var data = me.infolist[j];
                var str1 = X.STR(L("WUHUN2"),k);
                var str2 = data.skillintro ? L("WUHUN3") : L("WUHUN4");
                var str3 = "";
                if(data.skillintro){//专属属性
                    str3 = data.skillintro;
                }else {//特殊属性
                    for(var i in data.exbuffshow){
                        if(i.indexOf("pro") == -1){
                            str3 += L(j) + "+" + data.exbuffshow[j];
                        }else {
                            str3 += L(j) + "+" + data.exbuffshow[j] / 10 + "%";
                        }
                    }
                }
                var str  = str1 + str2 + str3;
                if(str.length > 60){
                    me.longstr.push(j);
                }else if(str.length >= 32){
                    me.listarr.push(j);
                }
            }
        },
    });
    G.frame[ID] = new fun('shengwu_xz2.json', ID);
})();