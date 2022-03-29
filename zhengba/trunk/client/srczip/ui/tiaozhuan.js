/**
 * Created by LYF on 2018/7/2.
 */
(function () {
    //跳转
    X.tiaozhuan = function (idx) {
        var conf = G.class.tiaozhuan.getById(idx);
        var str = conf.frameId.split("_");

        var frame = str[0];
        var type = str[1];
        var toFrame;
        function check() {
            if(G.frame.renwu.isShow){
                G.frame[toFrame].once("hide", function () {
                    G.frame.renwu.getData(function () {
                        G.frame.renwu.setContents();
                    });
                })
            }
            if (G.frame.jiangliyulan.isShow) {
                G.frame.jiangliyulan.remove();
            }
            if(G.frame.wangzhezhaomu_main.isShow){
                G.frame[toFrame].once("hide", function () {
                    G.frame.wangzhezhaomu_main.view.getData(function(){
                        G.frame.wangzhezhaomu_main.view.setContents();
                        G.frame.wangzhezhaomu_main.view.showBox();
                        G.frame.wangzhezhaomu_main.view.checkRedPoint();
                        G.hongdian.getData('wangzhezhaomu',1,function(){
                            G.frame.wangzhezhaomu_main.checkRedPoint();
                        })
                    })
                })
            }
            if(G.frame.qixi_zlxy.isShow){
                G.frame[toFrame].once("hide", function () {
                    G.frame.qixi.getData(function () {
                        G.frame.qixi_zlxy.setContent();
                    });
                })
            }
        }
        if(str.length == 1){
            if(conf.checkOpenId){
                var openLv = G.class.opencond.getLvById(conf.checkOpenId);
                if(P.gud.lv < openLv){
                    G.tip_NB.show(X.STR(L("DQGNXJKQ"), openLv));
                    return;
                }
            }
            if(frame == "gonghui"){
                if(!P.gud.ghid){
                    G.ajax.send('gonghui_getlist',[1],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            if(!d.d.applylist) d.d.applylist = [];
                            d.d[1] = d.d.list;
                            G.frame.gonghui_main.once('show', function () {
                                X.uiMana.closeAllFrame(true, function (frame) {
                                    if (frame.ID() == 'gonghui_main') {
                                        return false;
                                    }
                                });
                            }).checkShow(d.d);
                        }
                    },true);
                }else{
                    if(conf.twoFrame){
                        G.frame.gonghui_main.once('show', function () {
                            X.uiMana.closeAllFrame(true, function (frame) {
                                if (frame.ID() == 'gonghui_main') {
                                    return false;
                                }
                            });
                        }).checkShow();
                        G.frame.gonghui_main.once("showOver", function () {
                            G.frame.gonghui_keji.show();
                        })
                    }else{
                        G.frame.gonghui_main.once('show', function () {
                            X.uiMana.closeAllFrame(true, function (frame) {
                                if (frame.ID() == 'gonghui_main') {
                                    return false;
                                }
                            });
                        }).checkShow();
                    }
                }
                toFrame = "gonghui_main";
            }else if(frame == "xuyuanchi"){
                G.frame[frame].show();
                toFrame = frame;
            } else if(frame == "tanxian"){
                // G.frame.tanxian.once('show', function () {
                //     X.uiMana.closeAllFrame(true, function (frame) {
                //         if (frame.ID() == 'tanxian') {
                //             return false;
                //         }
                //     });
                // }).show();
                G.view.mainMenu.nodes.btn_tanxian.triggerTouch(ccui.Widget.TOUCH_ENDED);
                toFrame = frame
            } else if(frame == "shenqi"){
                G.frame.shenqi.checkShow();
                toFrame = frame;
            } else if(frame == "yuwaizhengba") {
                G.frame.yuwaizhengba.checkShow();
                toFrame = frame;
            } else if(frame == "damijing"){
                G.frame.damijing.checkShow();
                toFrame = frame;
            } else{
                if (!G.frame[frame].isShow) G.frame[frame].show();
                toFrame = frame;
            }
            check();
        }else{
            if(conf.checkOpenId){
                var openLv = G.class.opencond.getLvById(conf.checkOpenId);
                if(P.gud.lv < openLv){
                    G.tip_NB.show(X.STR(L("DQGNXJKQ"), openLv));
                    return;
                }
            }

            if(frame == "shop"){
                var obj = {"1": "yxsd", "2": "xysd", "3": "yzsd", "4": "jjsd", "5": "ghsd", "9": "fbsd"};
                if(conf.checkOpenId){
                    var openLv = G.class.opencond.getLvById(conf.checkOpenId);
                    if(P.gud.lv < openLv){
                        G.tip_NB.show(conf.name + X.STR(L("XYLVKQ"), openLv));
                        return;
                    }
                }
                if (G.frame.shop.isShow) {
                    G.frame.shop.remove();
                    G.frame.shop.once("close", function () {
                        G.frame[frame].data({type: type, name: obj[type]}).show();
                    })
                } else {
                    G.frame[frame].data({type: type, name: obj[type]}).show();
                }
                toFrame = frame;
                check();
            }else if(frame == "shopmain"){
                if(conf.checkOpenId){
                    var openLv = G.class.opencond.getLvById(conf.checkOpenId);
                    if(P.gud.lv < openLv){
                        G.tip_NB.show(conf.name + X.STR(L("XYLVKQ"), openLv));
                        return;
                    }
                }
                if (G.frame.shopmain.isShow) {
                    G.frame.shopmain.remove();
                    G.frame.shopmain.once("close", function () {
                        G.frame[frame].data(type).show();
                    })
                } else {
                    G.frame[frame].data(type).show();
                }
                toFrame = frame;
                check();
            } else if(frame == "buy"){
                function call(num) {
                    G.ajax.send("xuyuanchi_buycoin", [num], function (d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1){
                            G.event.emit("sdkevent", {
                                event: "xuyuanchi_buycoin"
                            });
                            if(d.d.prize){
                                G.frame.jiangli.data({
                                    prize: [].concat(d.d.prize)
                                }).show();
                                G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                            }
                        }
                    })
                }
                function call1(num) {
                    G.ajax.send("zypkjjc_buypknum", [num], function (d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1){
                            if(d.d.prize){
                                G.event.emit("sdkevent", {
                                    event: "zypkjjc_buypknum",
                                    num: num
                                });
                                G.frame.jiangli.data({
                                    prize: [].concat(d.d.prize)
                                }).show();
                                G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                            }
                        }
                    })
                }
                function buy(buy, buyneed, callback) {
                    G.frame.iteminfo_plgm.data({
                        buy: buy,
                        num: 0,
                        buyneed: buyneed,
                        callback: callback,
                    }).show();
                }
                if(type == "xuyuanbi"){
                    if(conf.checkOpenId){
                        var openLv = G.class.opencond.getLvById(conf.checkOpenId);
                        if(P.gud.lv < openLv){
                            G.tip_NB.show(X.STR(L("XYLVKQ"), openLv));
                            return;
                        }
                    }
                    buy(G.class.xuyuanchi.get()["common"].buyprize[0],
                        G.class.xuyuanchi.get()["common"].buyneed,
                        call);
                }else{
                    if(conf.checkOpenId){
                        var openLv = G.class.opencond.getLvById(conf.checkOpenId);
                        if(P.gud.lv < openLv){
                            G.tip_NB.show(X.STR(L("XYLVKQ"), openLv));
                            return;
                        }
                    }
                    buy(G.class.jingjichang.get().base.pkneed[0],
                        G.class.jingjichang.get().base.buyneed,
                        call1);
                }
            }else if(frame == "renwu" || frame == "chongzhi"){
                G.frame[frame].data({type: type}).show();
                toFrame = frame;
                check();
            }else if(conf.frameId == "yingxiong_fenjie"){
                G.frame[conf.frameId].show();
                toFrame = conf.frameId;
                check();
            }else if(conf.frameId == "yingxiong_hecheng"){
                G.frame[conf.frameId].show();
                toFrame = conf.frameId;
                check();
            } else {
                G.frame[frame].data({tztype: type}).show();
                toFrame = frame;
                check();
            }
        }
    }
})();