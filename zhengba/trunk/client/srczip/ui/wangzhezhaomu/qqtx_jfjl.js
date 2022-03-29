
(function () {
//积分奖励
    var ID = 'qqtx_jfjl';

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
            me.nodes.mask.click(function () {
                me.remove();
            });

        },
        onOpen:function(){
            var me = this;
            me.nodes.text_zdjl.setString(L("jifenjiangli"));

            me.bindBtn();
            me.DATA = me.data();
            for(var i = 0; i < me.DATA.prize.length;i++){
                me.DATA.prize[i].index = i;
            }
        },
        onShow:function(){
            var me = this;
            new X.bView("event_chuanqitiaozhan_jifenjiangli.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(me.view.nodes.scrollview);
                cc.enableScrollBar(me.view.nodes.listview);
                me.view.nodes.fnt_player.setString(me.DATA.jifen);
                me.setContents();
            });
        },
        setContents:function(){
            var me = this;
            var data = [].concat(me.DATA.prize);
            for(var i = 0; i < data.length; i++){
                if(X.inArray(me.DATA.reclist,data[i].index)){
                    data[i].order = 0;
                }else if(me.DATA.jifen >= data[i].val){
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
                me.table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_rank, 1, function (ui, data) {
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
            // ui.nodes.sz_phb.setString(data.val);
            var str1 = X.STR(L("WANZGHEZHAOMU22"),data.val);
            var str2 = X.STR('(<font color={1}>{2}</font>/{3})',me.DATA.jifen >= data.val?'#2bdf02':'#ff5d3d',me.DATA.jifen,data.val);
            var rh = X.setRichText({
                parent:ui.nodes.shuzhi,
                str:str1+str2,
                size:19,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: ui.nodes.shuzhi.height / 2}
            });
            X.alignItems(ui.nodes.panel_tx1,data.prize,"left",{
                touch:true,
                scale:1,
            });
            G.removeNewIco(ui.nodes.btn_yici);
            if(X.inArray(me.DATA.reclist,data.index)){
                ui.nodes.btn_yici.hide();
                ui.nodes.ylq.show();
            }else {
                ui.nodes.btn_yici.show();
                ui.nodes.ylq.hide();
                if(me.DATA.jifen >= data.val){
                    ui.nodes.btn_yici.setBtnState(true);
                    ui.nodes.txt_szq.setTextColor(cc.color(G.gc.COLOR.n13));
                    ui.nodes.btn_yici.ifget = true;
                    G.setNewIcoImg(ui.nodes.btn_yici);
                    ui.nodes.btn_yici.finds('redPoint').setPosition(120,50);
                }else {
                    ui.nodes.btn_yici.setBtnState(false);
                    ui.nodes.txt_szq.setTextColor(cc.color(G.gc.COLOR.n15));
                    ui.nodes.btn_yici.ifget = false;
                }
            }
            ui.nodes.btn_yici.data = data;
            ui.nodes.btn_yici.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(sender.ifget){
                        me.ajax('wangzhezhaomu_bossjifenprize',[sender.data.index],function(str,data){
                            if(data.s == 1){
                                G.frame.jiangli.data({
                                    prize:data.d.prize
                                }).show();
                                me.DATA.reclist.push(sender.data.index);
                                G.frame.wangzhezhaomu_main.view.DATA.boss.reclist.push(sender.data.index);
                                me.setContents();
                                G.hongdian.getData('wangzhezhaomu',1,function(){
                                    G.frame.wangzhezhaomu_main.checkRedPoint();
                                });
                                G.frame.wangzhezhaomu_main.view.checkRedPoint();
                            }
                        })
                    }else {
                        G.tip_NB.show(L("WANZGHEZHAOMU14"));
                    }
                }
            })
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();