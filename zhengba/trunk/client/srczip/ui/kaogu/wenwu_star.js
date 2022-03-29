/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//文物升星
    var ID = 'wenwu_star';

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
            me.nodes.btn_xq.click(function(){
                me.ajax('wenwu_upgrade',[me.floor,me.index],function(str,data){
                    if(data.s == 1){
                        me.ajax("exhibition_open",[],function(str,data){
                            if(data.s == 1){
                                G.frame.kaogu_main.wwDATA = data.d;
                                me.wwstar = data.d.data[me.floor][me.index];
                                me.playAni(me.wwstar-1);
                                me.setContents();
                                G.frame.kaogu_map.checkzlgRedPoint();
                                G.hongdian.getData('yjkg',1);
                                G.frame.kaogu_display.setContents();
                            }
                        });
                    }
                })
            })
        },
        playAni:function (index){
            var me = this;
            G.class.ani.show({
                json:"ani_kaogu_sx",
                addTo:me.nodes.panel_dh,
                repeat:false,
                auotRemove:true,
                onkey: function (n, a, k) {
                    if (k == "hit") {
                        G.class.ani.show({
                            json:"ani_ronghun_shuxingtisheng",
                            addTo:me.nodes.listview.children[index],
                            repeat:false,
                            auotRemove:true
                        })
                    }
                }
            })
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.wwid = me.data().wwid;
            me.wwstar = me.data().star;
            me.floor = me.data().floor;
            me.index = me.data().index;
            me.maxstar = parseInt(X.keysOfObject(G.gc.wenwu[me.wwid])[X.keysOfObject(G.gc.wenwu[me.wwid]).length-1]);//最大星级
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var item = G.class.swenwu(me.wwid,false,true);
            item.setAnchorPoint(0,0);
            me.nodes.panel_wp.removeAllChildren();
            me.nodes.panel_wp.addChild(item);
            me.nodes.panel_name.setString(G.class.wenwu.getById(me.wwid).name);//名字
            me.nodes.panel_wzns.setString(G.gc.wenwuinfo[me.wwid].place);//考古点
            //星级
            var stararr = [];
            for(var i = 0; i < X.keysOfObject(G.gc.wenwu[me.wwid]).length; i++){
                var star = X.keysOfObject(G.gc.wenwu[me.wwid])[i];
                if(star > 0){
                    if(me.wwstar >= parseInt(star)){
                        var img = new ccui.ImageView('img/kaogu/img_kg_zlg_xx.png',1);
                    }else {
                        var img = new ccui.ImageView('img/kaogu/img_kg_zlg_xxd.png',1);
                    }
                    stararr.push(img)
                }
            }
            X.left(me.nodes.panel_xx, stararr, 1,2,0);
            me.nodes.txt_pjl.setString(G.class.wenwu.getById(me.wwid).intr);//说明
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
                    if(me.wwstar >= parseInt(k)){
                        list.nodes.panel_wzms1.setTextColor(cc.color("#d9ccb1"));
                    }else {
                        list.nodes.panel_wzms1.setTextColor(cc.color("#92958f"));
                    }
                    list.nodes.panel_wzms1.setString(X.STR(L("KAOGU54"),k) + str);
                    me.nodes.listview.pushBackCustomItem(list);
                }
            }
            //升星按钮
            if(me.wwstar >= me.maxstar){
                me.nodes.btn_xq.setBtnState(false);
                me.nodes.txt_xq.setString(L("KAOGU25"));
                me.nodes.txt_xq.setTextColor(cc.color(G.gc.COLOR.n15));
                me.nodes.txt_xhww.hide();
            }else {
                me.nodes.btn_xq.setBtnState(true);
                me.nodes.txt_xq.setString(L("KAOGU26"));
                me.nodes.txt_xq.setTextColor(cc.color(G.gc.COLOR.n13));
                me.nodes.txt_xhww.show();
                var need = G.gc.wenwu[me.wwid][me.wwstar].need;
                if(need){
                    var hasnum = G.class.getOwnNum(need[0].t,need[0].a);
                    me.nodes.txt_xhww.setString(X.STR(L("KAOGU27"),hasnum,need[0].n));
                }
            }
        }
    });

    G.frame[ID] = new fun('kaogu_wwsm1.json', ID);
})();