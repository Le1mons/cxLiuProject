/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-背包
    var ID = 'wenwu_bag';

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
            me.nodes.btn_qd.click(function(){
                if(me.ifsold){
                    G.frame.wenwu_sold.data(me.soldwenwu).show();
                }else {
                    G.tip_NB.show(L("KAOGU29"));
                }
            })
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.list = new ccui.Layout();
            me.list.setContentSize(cc.size(100,100));
            me.ui.addChild(me.list);
            me.DATA = G.frame.kaogu_main.wwDATA;
        },
        onShow:function(){
            var me = this;
            me.setContents();
            me.showSold();
        },
        setContents:function(){
            var me = this;
            var data = me.sortData();

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                },null, null, 10, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            var item = G.class.swenwu(data.wid,true,true);
            item.setAnchorPoint(0,0);
            ui.removeAllChildren();
            ui.addChild(item);
            ui.setSwallowTouches(false);
        },
        //批量出售按钮:文物背包中有同名文物已满星的文物
        showSold:function(){
            var me = this;
            var wenwu = {};//key是id，value是文物星级
            me.soldwenwu = {};//可以出售的文物 key是品质 value是数量
            for(var k in G.gc.yjkg.exhibition){
                for(var i = 0; i < G.gc.yjkg.exhibition[k].data.length; i++){
                    wenwu[G.gc.yjkg.exhibition[k].data[i]] = me.DATA.data[k][i];
                }
            }
            me.wenwu = wenwu;
            me.nodes.btn_qd.setBright(false);
            me.nodes.txt_qd.setTextColor(cc.color(G.gc.COLOR.n15));
            me.ifsold = false;
            for(var m in G.DATA.wenwu){
                for(var j in wenwu){
                    var maxstar = G.frame.kaogu_main.getWenwuMaxstar(j);
                    if(G.DATA.wenwu[m].wid == j && wenwu[j] >= maxstar){//同名且满级
                        if(me.soldwenwu[G.gc.wenwuinfo[j].color]){
                            me.soldwenwu[G.gc.wenwuinfo[j].color] += G.DATA.wenwu[m].num;
                        }else {
                            me.soldwenwu[G.gc.wenwuinfo[j].color] = G.DATA.wenwu[m].num;
                        }
                        me.nodes.btn_qd.setBright(true);
                        me.nodes.txt_qd.setTextColor(cc.color(G.gc.COLOR.n13));
                        me.ifsold = true;
                        break;
                    }
                }
            }
        },
        sortData:function(){
            var me = this;
            //先比较品质，再比较数量
            var arr = [];
            for(var k in G.DATA.wenwu){
                arr.push(G.DATA.wenwu[k]);
            }
            arr.sort(function(a,b){
                var colorA = G.gc.wenwuinfo[a.wid].color;
                var colorB = G.gc.wenwuinfo[b.wid].color;
                if(colorA != colorB){
                    return colorA > colorB ? -1:1;
                }else {
                    return a.num > b.num ? -1:1;
                }
            });
            return arr;
        },
    });

    G.frame[ID] = new fun('kaogu_beibao.json', ID);
})();