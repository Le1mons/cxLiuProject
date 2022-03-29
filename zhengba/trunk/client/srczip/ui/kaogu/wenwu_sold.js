/**
 * Created by 嘿哈 on 2020/4/10.
 */
(function () {
//文物批量出售
    var ID = 'wenwu_sold';

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
            me.nodes.btn_qd.click(function(){
                me.ajax('wenwu_sale',[me.selectcolor],function(str,data){
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:data.d.prize
                        }).show();
                        if(G.frame.wenwu_bag.isShow){
                            G.frame.wenwu_bag.showSold();
                            me.wenwu = G.frame.wenwu_bag.soldwenwu;
                            me.setContents();
                            G.frame.wenwu_bag.setContents();
                        }
                        if(G.frame.kaogu_main._panels[3]){
                            G.frame.kaogu_main._panels[3].showNum();
                        }
                        G.frame.kaogu_map.checkzlgRedPoint();
                        G.hongdian.getData('yjkg',1);
                    }
                })
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.wenwu = me.data();
            me.selectcolor = [];//选中了哪几个品质的文物
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var colornum = me.wenwu;//相同品质的数量
            for(var i = 0; i < 5; i++){
                me.nodes['txt_dw' + (i+1)].setString(X.STR(L("KAOGU30"),L("COLOR" + (i+1)),colornum[i+1] || 0));
                me.nodes['panel_dw' + (i+1)].finds('Image_8').setTouchEnabled(true);
                me.nodes['img_gou' + (i+1)].setTouchEnabled(false);
                me.nodes['panel_dw' + (i+1)].finds('Image_8').index = (i+1);
                me.nodes['panel_dw' + (i+1)].finds('Image_8').coloridx = (i+1);
                me.nodes['panel_dw' + (i+1)].finds('Image_8').click(function(sender){
                    if(X.inArray(me.selectcolor,sender.coloridx)){
                        me.nodes['img_gou' + sender.index].hide();
                        me.selectcolor.splice(me.selectcolor.indexOf(sender.coloridx),1);//删除已选中的品质
                    }else {
                        me.nodes['img_gou' + sender.index].show();
                        me.selectcolor.push(sender.coloridx);
                    }
                    me.showGet();
                })
            }
            var pricetype = {};
            for(var k in G.gc.yjkg.sale){
                var need = JSON.parse(JSON.stringify(G.gc.yjkg.sale[k][0]));
                if(!pricetype[need.t]){
                    pricetype[need.t] = need;
                }
            }
            me.pricetype = pricetype;
            for(var i = 0; i < X.keysOfObject(pricetype).length; i++){
                me.nodes['panel_token' + (i+1)].removeBackGroundImage();
                me.nodes['panel_token' + (i+1)].setBackGroundImage(G.class.getItemIco(X.keysOfObject(pricetype)[i]),1);
            }
            //默认数量是0
            me.nodes.txt_kdsz1.setString(0);//销售白绿蓝的获得
            me.nodes.txt_kdsz2.setString(0);//销售紫橙的获得
        },
        showGet:function(){
            var me = this;
            for(var i in me.pricetype){
                me.pricetype[i].n = 0;
            }
            for(var i = 0; i < me.selectcolor.length; i++){
                var soldprice = G.gc.yjkg.sale[me.selectcolor[i]][0];//售出的单价
                for(var k in me.pricetype){
                    if(k == soldprice.t){
                        if(me.wenwu[me.selectcolor[i]] > 0){
                            me.pricetype[k].n += soldprice.n * me.wenwu[me.selectcolor[i]];
                        }
                    }
                }
            }
            for(var j = 0; j < X.keysOfObject(me.pricetype).length; j++){
                var id = X.keysOfObject(me.pricetype)[j];
                me.nodes['txt_kdsz' + (j+1)].setString(me.pricetype[id].n);
            }
        }
    });

    G.frame[ID] = new fun('kaogu_plcs.json', ID);
})();