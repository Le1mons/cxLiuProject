/**
 * Created by
 */
G.event.on("itemchange_over", function () {
    if(G.frame.sf_xnfd.isShow) {
        G.frame.sf_xnfd.showAttr();
    }
    if(G.frame.sf_xcsp.isShow) {
        G.frame.sf_xcsp.showAttr();
    }
});
(function () {
    //昔年孵蛋
    var ID = 'sf_xnfd';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.btn_rw.hide();
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS117')
                }).show();
            });
            var need = G.gc.newyear3.eigneed;

            me.nodes.btn_yjzd.click(function (sender,type) {
                G.frame.sf_yjzd.data({
                    data:{'a':need[0].a,'t':need[0].t,'n':G.class.getOwnNum(need[0].t,need[0].a)},
                    num:G.class.getOwnNum(need[0].t,need[0].a),
                    callback:function (num) {
                        G.ajax.send('newyear3_yjeig',[num],function(d) {
                            if(!d) return;
                            var d = JSON.parse(d);
                            if(d.s == 1) {
                                var eggArr = G.DATA.springfestival.myinfo.eig;
                                G.DATA.springfestival.myinfo = d.d.myinfo;
                                var noBreakegg = [];
                                for (var i=1;i<=7;i++){
                                    var parent = me.nodes['panel_dan'+i];
                                    if (!X.inArray(eggArr,i)){
                                        noBreakegg.push(parent);
                                    }
                                }
                                for (var i=0;i<noBreakegg.length;i++){
                                    (function (idx) {
                                        if (num>idx){
                                            noBreakegg[idx].ani && noBreakegg[idx].ani.action.playWithCallback('zadan',false,function () {
                                                noBreakegg[idx].ani.action.play('wait2',true);
                                                if (d.d.prize && d.d.prize.length>0){
                                                    G.frame.jiangli.data({
                                                        prize: d.d.prize
                                                    }).show();
                                                }
                                                noBreakegg[idx].setTouchEnabled(false);
                                                if (idx == noBreakegg.length-1){
                                                    me.setContents();
                                                    me.initEgg();
                                                }
                                            });
                                        }
                                    })(i)
                                }
                            }
                        },true);
                    }
                }).show();
            });
        },
        initUI:function(){
            var me = this;
            X.render({
                txt_sj2: function(node){ // 倒计时
                    var rtime = G.DAO.springfestival.getRefreshTime();
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    }, null, {
                        showDay: true
                    });
                },
            }, me.nodes);
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.showAttr();
            me.initUI();
            me.initEgg();
        },
        showAttr: function () {
            var me = this;
            me.nodes.btn_jia1.hide();
            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.show();
            });
            me.nodes.txt_jb.setString(G.class.getOwnNum('5105','item'));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        setContents: function () {
            var me = this;
            var danprize = G.gc.newyear3.eigprize;
            var jifen = G.DATA.springfestival.myinfo.val;
            // var maxjifen = danprize[danprize.length-1].val;
            // var jdt = Math.abs(jifen/maxjifen*100);
            // me.nodes.jdt.setPercent(jdt);
            var eggArr = G.DATA.springfestival.myinfo.eigrec;
            for (var i=0;i<danprize.length;i++){
                if (jifen>=danprize[i].val){
                    me.nodes['jdt'+(i+1)].setPercent(100);
                }else {
                    if (i==0){
                        var jdt = (jifen)/(danprize[i].val)*100;
                    } else {
                        var jdt = (jifen-danprize[i-1].val)/(danprize[i].val-danprize[i-1].val)*100;
                    }
                    me.nodes['jdt'+(i+1)].setPercent(jdt);
                }
                var parent = me.nodes['panel_'+(i+1)];
                parent.removeAllChildren();
                var list = me.nodes.list.clone();
                list.show();
                list.idx = i;
                me.setItem(list,danprize[i]);
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);
                parent.addChild(list);
                parent.setTouchEnabled(true);
                parent.data = danprize[i];
                parent.idx = i;
                parent.click(function (sender) {
                    if (!X.inArray(eggArr,sender.idx) && jifen>=sender.data.val){
                        G.DAO.springfestival.ageReceive(sender.idx,function (dd) {
                            if (dd.prize && dd.prize.length>0){
                                G.frame.jiangli.data({
                                    prize: dd.prize
                                }).show();
                            }
                            me.setContents();
                        });
                    }else {
                        G.frame.sf_jlyl.data({
                            prize: sender.data.prize,
                            title:'奖励预览'
                        }).show();
                    }
                });
            };
            var zdcs = jifen/G.gc.newyear3.eigjifen;
            me.nodes.txt_sj4.setString(zdcs);
        },
        setItem:function (ui,data) {
            var me = this;
            var jifen = G.DATA.springfestival.myinfo.val;
            X.autoInitUI(ui);
            ui.nodes.txt_day.setString(data.val);
            ui.nodes.img_ylq.setVisible(X.inArray(G.DATA.springfestival.myinfo.eigrec,ui.idx));
            ui.nodes.panel_bx.removeAllChildren();
            if (!X.inArray(G.DATA.springfestival.myinfo.eigrec,ui.idx) && jifen>=data.val){
                X.addBoxAni({
                    parent: ui.nodes.panel_bx,
                    boximg: 'img/chunjiehuodong/img_bx.png'
                });
            }

        },
        initEgg:function () {
            var me = this;
            me.isBreakAni = false;
            var eggArr = G.DATA.springfestival.myinfo.eig;
            for (var i=1;i<=7;i++){
                (function (idx) {
                    var parent = me.nodes['panel_dan'+idx];
                    parent.removeAllChildren();
                    parent.id = i;
                    G.class.ani.show({
                        json: "xinnian_zadan_dh",
                        addTo:parent,
                        repeat: true,
                        cache:true,
                        y:15,
                        autoRemove: false,
                        onload: function (node, action) {
                            node.setScale(.5);
                            if (X.inArray(eggArr,idx)){
                                action.play('wait2',true);
                            } else {
                                action.play('wait1',true);
                            }
                            parent.ani = node;
                        },
                    });
                    parent.setTouchEnabled(!X.inArray(eggArr,idx));
                    parent.click(function (sender,type) {
                        if (me.isBreakAni) return;
                        me.isBreakAni = true;
                        G.DAO.springfestival.breakage(sender.id,function (dd) {
                            sender.ani && sender.ani.action.playWithCallback('zadan',false,function () {
                                sender.ani.action.play('wait2',true);
                                if (dd.prize && dd.prize.length>0){
                                    G.frame.jiangli.once('willClose',function () {
                                        me.isBreakAni = false;
                                    }).data({
                                        prize: dd.prize
                                    }).show();
                                }
                                sender.setTouchEnabled(false);
                                me.setContents();
                                me.initEgg();
                            });
                        });
                    },500);
                })(i)
            }
        }
    });
    G.frame[ID] = new fun('chunjie_xnfd.json', ID);
})();