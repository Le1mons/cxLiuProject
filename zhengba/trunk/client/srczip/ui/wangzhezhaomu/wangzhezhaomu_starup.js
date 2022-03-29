/**
 * Created by  on 2019//.
 */
(function () {
    //王者升星
    G.class.wangzhezhaomu_starup = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            X.viewCache.getView('event_list4.json', function (node) {
                me.list = node.nodes.panel_list;
                me.getData(function () {
                    me.setBanner();
                    me.setContents();
                });
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setBanner: function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner31.png', 0);
                },
                txt_count:L("SYSJ"),
                txt_time:function (node) {
                    if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                        node.setString(X.moment(me.DATA.info.etime - G.time));
                    }else {
                        X.timeout(node, me.DATA.info.etime, function () {
                            me.timeout = true;
                        });
                    }
                }
            },me.nodes);
        },
        setContents:function () {
            var me = this;
            var data = [].concat(me.DATA.info.data.openinfo.peiyang.arr);
            for(var i = 0; i < data.length; i++){
                if(X.inArray(me.DATA.peiyang.reclist,data[i].index)){
                    data[i].order = 0;
                }else if(me.DATA.peiyang.val[i] >= data[i].val){
                    data[i].order = 2;
                }else {
                    data[i].order = 1;
                }
            }
            data.sort(function(a,b){
                if(a.order != b.order){
                    return a.order > b.order ? -1:1;
                }else {
                    return a.index < b.index ? -1:1;
                }
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
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
            X.alignItems(ui.nodes.ico_item,data.p,"left",{
                touch:true
            });
            var heroconf = G.gc.hero;
            for(var k in heroconf){
                if(heroconf[k].pinglunid == data.id){
                    var heroname = heroconf[k].name;
                    break;
                }
            }
            var str1 = X.STR('(<font color={1}>{2}</font>/{3})',me.DATA.peiyang.val[data.index] >= 1?'#00a41f':'#f55f46',me.DATA.peiyang.val[data.index] || 0,1);
            var str2 = X.STR(data.intr,heroname,data.val);
            var rh = X.setRichText({
                parent:ui.nodes.txt,
                str:str2+str1,
                size:19,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: ui.nodes.txt.height / 2}
            });
            G.removeNewIco(ui.nodes.btn);
            ui.nodes.btn.loadTextureNormal('img/public/btn/btn1_on.png',1);
            if(X.inArray(me.DATA.peiyang.reclist,data.index)){
                ui.nodes.btn.setBtnState(false);
                ui.nodes.btn_txt.setString(L("YLQ"));
                ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
            }else{
                ui.nodes.btn_txt.setString(L("LQ"));
                if(me.DATA.peiyang.val[data.index] >= 1){
                    ui.nodes.btn.setBtnState(true);
                    ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n13));
                    G.setNewIcoImg(ui.nodes.btn);
                    ui.nodes.btn.finds('redPoint').setPosition(120,50);
                }else{
                    ui.nodes.btn.setBtnState(false);
                    ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                }
            }
            ui.nodes.btn.data = data;
            ui.nodes.btn.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax("wangzhezhaomu_peiyangprize",[sender.data.index],function(str,data){
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            me.DATA.peiyang.reclist.push(sender.data.index);
                            me.setContents();
                            G.hongdian.getData('wangzhezhaomu',1,function(){
                                G.frame.wangzhezhaomu_main.checkRedPoint();
                            })
                        }
                    })
                }
            })
        },
        getData:function(callback){
            var me = this;
            me.ajax('wangzhezhaomu_open',['peiyang'],function(str,data){
                if(data.s == 1){
                    me.DATA = data.d;
                    for(var i = 0; i < me.DATA.info.data.openinfo.peiyang.arr.length; i++){
                        me.DATA.info.data.openinfo.peiyang.arr[i].index = i;
                    }
                    callback && callback();
                }
            })
        }
    });
})();