(function () {
    var ID = 'shengdanjie_sdlx';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },

        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.panel_rw2.setTouchEnabled(true);
            me.nodes.panel_rw2.click(function () {
                if(!G.frame.shengdanjie.DATA.myinfo.buysptask){
                    G.frame.shengdanjie_ts2.data({
                        callback:function () {
                            G.frame.shengdanjie.getData(function () {
                                me.setContents();
                            });
                        }}).show();
                }
            });

        },
        onOpen: function () {
            var me = this;
            X.cacheByDay(P.gud.uid, "sdj_task", {});
        },

        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var prize = G.frame.shengdanjie.DATA.prize;
            if(prize && prize.length > 0){
                G.frame.jiangli.once("close",function () {
                    G.frame.shengdanjie.DATA.prize = [];
                }).data({
                    prize: prize
                }).show();
            }
            me.bindBtn();
            me.setContents();
            me.setBaseInfo();
        },
        setContents:function () {
            var me = this;
            var myinfo = G.frame.shengdanjie.DATA.myinfo;
            var sdj = G.gc.christmas;
            me.nodes.txt_1.setString(L("shengdanjie_txt3"));
            if(myinfo.buysptask){
                me.nodes.txt_2.setString(L("shengdanjie_txt5"));
            }else{
                me.nodes.txt_2.setString(L("shengdanjie_txt4"));
            }

            var day = G.frame.shengdanjie.DATA.hdinfo.day;
            for(var i = 1 ; i < 8 ;i++){
                var list = me.nodes.list.clone();
                list.show();
                list.setName("clist_" + i);
                X.autoInitUI(list);
                list.nodes.txt_t.setString(X.STR(L("shengdanjie_txt7"),L(i)));
                list.nodes.txt_xs.setString(X.STR(L("shengdanjie_txt8"),L(i)));
                if(day < i){
                    list.nodes.panel_zz.show();
                    list.nodes.img_suo.show();
                    list.nodes.txt_xs.hide();
                }else{
                    list.nodes.panel_zz.hide();
                    list.nodes.img_suo.hide();
                    list.nodes.txt_xs.show();
                    var taskover = true;
                    for(var j in sdj.task){
                        if(sdj.task[j].day == i){
                            if(!myinfo.task.data[j] || sdj.task[j].pval > myinfo.task.data[j]){
                                taskover = false;
                                break;
                            }
                        }
                    }
                    if(taskover){
                        list.nodes.img_gou.show();
                    }else{
                        list.nodes.img_gou.hide();
                    }
                    list.idx = i;
                    list.setTouchEnabled(true);
                    list.click(function (sender) {
                        G.frame.shengdanjie_ts1.data({day:sender.idx}).show();
                    })
                }
                list.setPosition(cc.p(me.nodes["panel_list" + i].width/2,me.nodes["panel_list" + i].height/2));
                me.nodes["panel_list" + i].removeAllChildren();
                me.nodes["panel_list" + i].addChild(list);
            }
        },
        setBaseInfo: function (obj) {
            var me = this;

            obj = obj || {};

            var attr1 = me.need1 = obj.need1 || {a:'attr',t:'jinbi'};
            var attr2 = me.need2 = obj.need2 || {a:'attr',t:'rmbmoney'};

            me.nodes.panel_up.finds("token_jb").loadTexture(G.class.getItemIco(attr1.t), 1);
            me.nodes.panel_up.finds("token_zs").loadTexture(G.class.getItemIco(attr2.t), 1);
            X.render({
                txt_jb:X.fmtValue(G.class.getOwnNum(attr1.t,attr1.a)),
                txt_zs:X.fmtValue(G.class.getOwnNum(attr2.t,attr2.a)),
                btn_jia1: function (node) {
                    if (attr1.t == 'jinbi') node.show();
                    else node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.once("hide", function () {
                                me.setContents();
                            }).show();
                        }

                    });
                },
                btn_jia2: function (node){
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.once("hide", function () {
                                me.setContents();
                            }).show();
                        }
                    })
                }
            },me.nodes);
        },
    });
    G.frame[ID] = new fun('shengdanlaixi.json', ID);
})();