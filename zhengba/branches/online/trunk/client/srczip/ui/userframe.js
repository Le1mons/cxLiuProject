/**
 * Created by wfq on 2018/1/25.
 */
(function () {
    //用户数据界面
    G.userframe = {
        _id:['binduid','ext_servername'],
        _str:'binduid:{1}<br>servername:{2}<br>',

        init: function () {
            var me = this;

            var scene = cc.director.getRunningScene();
            var winSize = cc.director.getWinSize();

            //创建view加入游戏场景中
            var view = me.ui = new ccui.Layout();
            view.setName('uFrame');
            view.setContentSize(winSize);
            view.setAnchorPoint(cc.p(0.5,0.5));
            view.setPosition(cc.p(winSize.width / 2,winSize.height / 2));
            scene.addChild(view);
            view.setLocalZOrder(100000000);

            me.addUI();
        },
        addUI: function () {
            var me = this;

            var panel = me.ui;
            var data = P.gud || {};

            var uView = new ccui.Layout();
            uView.setName('uView');
            uView.setContentSize(cc.size(200,200));
            uView.setAnchorPoint(cc.p(0.5,0.5));
            uView.setPosition(cc.p(panel.width - 200 / 2,panel.height - 200 / 2));
            panel.addChild(uView);

            var d = [];
            for (var i = 0; i < me._id.length; i++) {
                var id = me._id[i];
                d.push(P.gud[id] || null);
            }

            var str = X.STR(me._str,d);
            var rh = new X.bRichText({
                size:14,
                maxWidth:200,
                lineHeight:20,
                eachText: function (node) {
                    X.enableOutline(node,'#000000');
                },
                color:'#fffff'
            });
            rh.text(str);
            rh.setPosition(cc.p( 0,uView.height - rh.trueHeight()));
            uView.removeAllChildren();
            uView.addChild(rh);
        }
    };

    G.event.onnp('loginOver', function () {
        if (G.DATA.PROJECT_DEBUG) {
            G.userframe.init();
        }
    });
})();