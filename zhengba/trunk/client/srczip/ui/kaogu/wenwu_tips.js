/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//文物说明
    var ID = 'wenwu_tips';

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
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.wwid = me.data();
        },
        onShow:function(){
            var me = this;
            me.setContents()
        },
        setContents:function(){
            var me = this;
            var item = G.class.swenwu(me.wwid,false,true);
            item.setAnchorPoint(0,0);
            me.nodes.panel_wp.removeAllChildren();
            me.nodes.panel_wp.addChild(item);
            me.nodes.panel_name.setString(G.class.wenwu.getById(me.wwid).name);//名字
            me.nodes.txt_pjl.setString(G.class.wenwu.getById(me.wwid).intr);//说明
            me.nodes.panel_wzns.setString(G.gc.wenwuinfo[me.wwid].place);//考古点
            //展览效果
            me.nodes.listview.removeAllChildren();
            for(var k in G.gc.wenwu[me.wwid]){
                var list = me.nodes.list_wz.clone();
                X.autoInitUI(list);
                list.show();
                var str = "";
                if(X.keysOfObject(G.gc.wenwu[me.wwid][k].showbuff).length > 0){
                    var arr = X.keysOfObject(G.gc.wenwu[me.wwid][k].showbuff);
                    for(var i in G.gc.wenwu[me.wwid][k].showbuff){
                        var type = L(i);
                        if(i.indexOf("pro") == -1){
                            var value = G.gc.wenwu[me.wwid][k].showbuff[i];
                        }else {
                            var value = G.gc.wenwu[me.wwid][k].showbuff[i] / 10 + "%";
                        }
                        if(arr.length > 1 && i == arr[0]){//加不加逗号
                            str = str + X.STR(L("KAOGU53"),type,value) + ",";
                        }else {
                            str = str + X.STR(L("KAOGU53"),type,value);
                        }
                        //str += X.STR(L("KAOGU53"),type,value);
                    }
                    list.nodes.panel_wzms1.setTextColor(cc.color("#92958f"));
                    list.nodes.panel_wzms1.setString(X.STR(L("KAOGU54"),k) + str);
                    me.nodes.listview.pushBackCustomItem(list);
                }
            }
        }
    });

    G.frame[ID] = new fun('kaogu_wwsm2.json', ID);
})();