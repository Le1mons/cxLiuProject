/**
 * Created by 嘿哈 on 2020/4/11.
 */
(function () {
//遗迹点
    var ID = 'kaogu_place';

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
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.mapid = me.data().mapid;
            me.yjid = me.data().yjid;
            me.list = new ccui.Layout();
            me.list.setContentSize(cc.size(100,100));
            me.ui.addChild(me.list);
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var conf = G.gc.yjkg.map[me.mapid].yiji[me.yjid];
            me.nodes.txt_title.setString(conf.name);//名字
            //据出发点
            if(conf.distance > 1000){
                me.nodes.txt_kgd.setString((conf.distance/1000).toFixed(1) +L("KAOGU16"));
            }else {
                me.nodes.txt_kgd.setString(conf.distance +L("KAOGU15"));
            }
            me.nodes.txt_wzjs.setString(conf.intr);//描述
            //奖励
            var data = [].concat(G.gc.diaoluo[conf.dlz]);
            for(var i = 0; i < data.length; i++){
                if(data[i].t == ""){
                    data.splice(i,1);
                }
            }
            data.sort(function(a,b){
                var colorA = G.class.getItem(a.t, a.a).color;
                var colorB = G.class.getItem(b.t, b.a).color;
                return colorA > colorB ? -1:1;
            });
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
            var item = G.class.sitem(data);
            G.frame.iteminfo.showItemInfo(item);
            item.setAnchorPoint(0,0);
            ui.removeAllChildren();
            ui.addChild(item);
        }
    });

    G.frame[ID] = new fun('kaogu_yjd.json', ID);
})();