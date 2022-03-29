/**
 * Created by wfq on 2018/6/15.
 */
(function () {
    //游戏中的全局监听事件

    //日期更迭时刷新主界面UI
    G.event.on('dayChange', function (d) {
        if (!d) return;

        // G.mainMenu.ui.setTimeout(function () {
        //     G.mainMenu.getBtnsListFromSer();
        // },1000);
        if(!G.view.mainView) return;
        cc.director.getRunningScene().setTimeout(function () {
            G.view.mainView.getAysncBtnsData(function(){
                G.view.mainView.allBtns["lefttop"] = [];
                G.view.mainView.setSvrBtns();
            }, false);
        }, 5000);
        X.cacheByUid("dmj_bj", 0);
        X.cacheByUid("dmj_jumpFight", 0);
        X.cacheByUid("ghtanhe",0);
        X.cacheByUid("todayTipRed", 0);
        G.hongdian.getHongdian(1);
    });

    //特定小时时更新主界面ui
    G.event.on('hourChange', function (d) {
        if (!d) return;

        var newDay = d.n,
            needFreshHours;
        needFreshHours = [12,13,18,19];
        if (X.inArray(needFreshHours,newDay.getHours())) {
            // G.mainMenu.ui.setTimeout(function () {
            //     G.mainMenu.getBtnsListFromSer();
            //     // if(newDay.getHours() == 12 && G.frame.map.isShow){
            //     //     if (G.frame.taishou.isShow) G.frame.taishou.refreshUI();
            //     //     G.frame.map.loadCityData(function () {
            //     //         if (G.frame.map.isShow) G.frame.map.setTaishou();
            //     //     });
            //     // }
            // },1000);
        }

    });
    //特定分钟时更新主界面ui
    G.event.on('minuteChange', function (d) {
        if (!d) return;
        // var newDay = d.n;
        if(G.view.mainView){
            G.hongdian.getData("guajitime", 1, function () {
                G.hongdian.getData("tanxian", 1, function () {
                    G.hongdian.checkTX();
                });
                if(G.frame.tanxian.isShow){
                    if(G.DATA.hongdian.guajitime > 0){
                        G.setNewIcoImg(G.frame.tanxian.nodes.btn1_on, .8);
                    }
                    G.removeNewIco(G.view.mainMenu.nodes.btn_tanxian);
                }
            })
        }
    });

    //登录完成后的事件处理
    G.event.on('loginOver', function () {
        // G.event.emit('needRefleshAttr');

        //重置新手引导的变量
        // G.DATA.guide_val = 0;
        // G.event.emit('need_get_hongdian',true);
        
        G.view.mainView.getAysncBtnsData(function () {
            G.view.mainView.setSvrBtns();
            G.view.mainView.nodes.panel_kfkh.hide();
            G.view.mainView.nodes.panel_sc.hide();

            // var kfkh = G.view.mainView.nodes.panel_ui.finds('kaifukuanghuan');
            // var shouchong = G.view.mainView.nodes.panel_ui.finds('shouchong');
            // var up = G.view.mainView.nodes.panel_ui.finds('ui_up');
            // if(kfkh){
            //     var pos = G.view.mainView.nodes.panel_ui.convertToWorldSpaceAR(kfkh.getPosition());
            // }
            // if(shouchong){
            //     var pos3 = G.view.mainView.nodes.panel_ui.convertToWorldSpaceAR(shouchong.getPosition());
            // }
            // var pos1 = G.view.mainView.nodes.panel_ui.convertToWorldSpaceAR(up.getPosition());
            // if(pos){
            //     var y = pos.y - pos1.y;
            //     var h = up.height * up.getAnchorPoint().y;
            //     up.setPosition(cc.p(up.x,up.y + y - h));
            // }
        });
    });
})();