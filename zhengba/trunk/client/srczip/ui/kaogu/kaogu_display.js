/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-展览馆
    G.class.kaogu_display = X.bView.extend({
        ctor: function (data) {
            var me = this;
            G.frame.kaogu_display = me;
            me._data = data;
            me._super("kaogu_zlg.json", null, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.btn_bz.click(function(){
                G.frame.help.data({
                    intr:L("TS68"),
                }).show()
            });
        },
        onOpen:function(){
            var me = this;
            me.nodes.panel_kp.setTouchEnabled(false);
            me.bindBtn();
            G.class.ani.show({
                json:"ani_choukajuese",
                addTo:me.nodes.ani_rw,
                repeat:true,
                autoRemove:false
            });
            G.class.ani.show({
                json:"ani_lazhu",
                addTo:me.nodes.ani_lz,
                repeat:true,
                autoRemove:false,
                y:0,
                x:0
            });
            G.class.ani.show({
                json:"ani_mofashu",
                addTo:me.nodes.ani_mfs,
                repeat:true,
                autoRemove:false
            })
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var data = X.keysOfObject(G.gc.yjkg.exhibition);
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            me.table._table.tableView.setBounceable(false);
        },
        setItem:function(ui,id){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setPosition(0,0);
            ui.setAnchorPoint(0,0);
            ui.setTouchEnabled(false);
            var teamdata = G.gc.yjkg.exhibition[id];
            var wwdata = G.frame.kaogu_main.wwDATA.data[id];//文物星级
            ui.nodes.text_sl.setString(teamdata.name);
            ui.nodes.text_sl.setTextColor(cc.color("#fff1e1"));
            for(var i = 0; i < teamdata.data.length; i++){
                var list = me.nodes.list_wp.clone();
                me.setlistItem(list,teamdata.data[i],wwdata[i],id,i);
                ui.nodes['list_wp' + (i+1)].removeAllChildren();
                ui.nodes['list_wp' + (i+1)].addChild(list);
            }
            //文物状态
            //文物背景
            if(X.inArray(G.frame.kaogu_main.wwDATA.rec,id)){//已领奖
                ui.nodes.btn_1.show();
                ui.nodes.btn_2.hide();
                ui.nodes.btn_gmtp.hide();
            }else {
                ui.nodes.btn_1.hide();
                for(var i = 0; i < G.frame.kaogu_main.wwDATA.data[id].length; i++){
                    if(G.frame.kaogu_main.wwDATA.data[id][i] == 0){//显示预览
                        ui.nodes.btn_2.show();
                        ui.nodes.btn_gmtp.hide();
                        break
                    }
                    //领奖
                    ui.nodes.btn_2.hide();
                    ui.nodes.btn_gmtp.show();
                    G.setNewIcoImg(ui.nodes.btn_gmtp);
                    ui.nodes.btn_gmtp.finds('redPoint').setPosition(130,45);
                }
            }
            //文物背景
            ui.nodes.btn_1.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.wenwu_bg.data(id).show();
                }
            });
            //奖励预览
            ui.nodes.btn_2.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.wenwu_jlyl.data(id).show();
                }
            });
            //领奖
            ui.nodes.btn_gmtp.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax("exhibition_receive",[id],function(str,data){
                        if(data.s == 1){
                            G.frame.wenwu_getprize.data({
                                prize:data.d.prize,
                                type:id
                            }).show();
                            G.frame.kaogu_main.wwDATA.rec.push(id);
                            me.setContents();
                            G.frame.kaogu_map.checkzlgRedPoint();
                            G.hongdian.getData('yjkg',1);
                        }
                    })
                }
            });
        },
        setlistItem:function (ui,id,star,floor,index){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setPosition(0,0);
            ui.setAnchorPoint(0,0);
            var info = G.gc.wenwuinfo[id];
            ui.nodes.panel_di.removeBackGroundImage();
            ui.nodes.panel_wp.removeBackGroundImage();
            ui.nodes.panel_xx.removeAllChildren();
            var maxstar = X.keysOfObject(G.gc.wenwu[id])[X.keysOfObject(G.gc.wenwu[id]).length-1];//最大星级
            //0星就是个问号
            if(star > 0){
                ui.nodes.panel_wjs.hide();
                ui.nodes.panel_wp.setBackGroundImage('ico/wenwuico/' + info.icon + '.png',0);
                ui.nodes.panel_di.setBackGroundImage('img/kaogu/img_kg_zlg_z1_' + info.color + ".png",1);
                var stararr = [];
                for(var i = 0; i < star; i++){
                    var img = new ccui.ImageView('img/kaogu/img_kg_zlg_xx.png',1);
                    stararr.push(img);
                }
                X.center(stararr,ui.nodes.panel_xx);
            }else {
                ui.nodes.panel_wjs.show();
                ui.nodes.panel_di.setBackGroundImage('img/kaogu/img_kg_zlg_z1_wh.png',1);
            }
            //升星材料足够且没达到最高星就是可升星，升星要消耗同名文物
            if(star < parseInt(maxstar)){
                var need = G.gc.wenwu[id][star].need;
                var hasnum = G.class.getOwnNum(need[0].t,need[0].a);
                ui.nodes.img_ksx.setVisible(hasnum >= need[0].n);//
                if(star == 0 && hasnum < need[0].n){
                    ui.canstar = false;
                }else {
                    ui.canstar = true;
                }
            }else {
                ui.nodes.img_ksx.hide();
                ui.canstar = true;
            }

            ui.id = id;
            ui.star = star;
            ui.floor = floor;
            ui.index = index;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(sender.canstar){
                        G.frame.wenwu_star.data({
                            wwid : sender.id,
                            star : sender.star,
                            floor : sender.floor,
                            index : sender.index
                        }).show();
                        //me.setContents();
                    }else {
                        G.tip_NB.show(L("KAOGU23"));
                    }
                }
            })
        },
    });
})();