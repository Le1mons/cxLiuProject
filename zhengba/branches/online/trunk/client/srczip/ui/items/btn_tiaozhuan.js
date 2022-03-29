(function () {
    X.loadPlist(["lujing.png", "lujing.plist"]);
    G.class.setTZ = function (idx) {

        var is = true;
        var conf = G.class.tiaozhuan.getById(idx);
        var openLv = G.class.opencond.getLvById(conf.checkOpenId);
        if(conf.checkOpenId){
            openLv = G.class.opencond.getLvById(conf.checkOpenId);
            if(P.gud.lv < openLv){
                is = false;
            }
        }

        var btn = new ccui.Button;
        btn.is = is;
        btn.idx = idx;
        btn.setAnchorPoint(0.5, 0.5);
        btn.setContentSize(70, 70);
        btn.loadTextureNormal("img/lujing/" + conf.img, 1);
        btn.setBright(is);
        btn.click(function (sender, type) {
            if(!is){
                G.tip_NB.show(X.STR(L("DQGNXJKQ"), openLv));
                return;
            }
            X.tiaozhuan(sender.idx);
            if(G.frame.iteminfo.isShow) G.frame.iteminfo.remove();
            if(G.frame.qianwang.isShow) G.frame.qianwang.remove();
            if(G.frame.woyaobianqiang.isShow) G.frame.woyaobianqiang.remove();
            if(G.frame.ui_tip_xuanze.isShow) G.frame.ui_tip_xuanze.remove();
            if(G.frame.yingxiong_hecheng.isShow) G.frame.yingxiong_hecheng.remove();
        });
        return btn;
    }
})();