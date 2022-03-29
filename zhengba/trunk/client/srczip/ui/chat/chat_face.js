(function () {
    var func = {
        initFaceData: function () {
            var me = this;
            var face = me.face;
            var data = [];
            var arr = [];

            for (var index = 0; index < face.length; index ++) {
                if (arr.length == 15) {
                    data.push(arr);
                    arr = [];
                }
                arr.push(face[index]);
            }
            if (arr.length > 0) data.push(arr);
            return data;
        },
        initFaceUi: function () {
            var me = this;
            me.nodes.list_btn.hide();
            me.initPageView();
            me.initPoint(0);
        },
        initPageView: function () {
            var me = this;
            var data = me.initFaceData();
            var pageview = me.pageview = me.nodes.pageview;
            pageview.setCustomScrollThreshold(10 * 0.01 * pageview.width);

            for (var i = 0; i < data.length; i++){
                var page = me.nodes.list_bq.clone();
                X.autoInitUI(page);
                page.show();
                for (var j = 0; j < 15; j++){
                    var faceUi = page.nodes["panel_bq" + (j + 1)];
                    faceUi.setTouchEnabled(true);
                    if (data[i][j]) {
                        faceUi.setBackGroundImage('img/chat/img_bq' + data[i][j] + '.png', 1);
                        faceUi.data = data[i][j];
                        faceUi.click(function (sender,type) {
                            if (type == ccui.Widget.TOUCH_ENDED){
                                if (me.chatType == 7 && !me.selectUid) return G.tip_NB.show(L("QXZSLDX"));
                                if (X.inArray([6, 7, 2], me.chatType) && P.gud.lv < 30) {
                                    return G.tip_NB.show(L('gonghuipindao'));
                                }
                                var _sendData = ['[' + sender.data + ']', me.chatType, me.selectUid || '', '', '', '',
                                    X.cacheByUid("hideVip") ? 1 : 0, me.getProvince(), me.getCity()];
                                me.sendChat(_sendData,function () {
                                    me.nodes.close_option.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                });
                            }
                        });
                    } else {
                        faceUi.hide();
                    }
                }
                pageview.addWidgetToPage(page, i, true);
            }
            pageview.scrollToPage(0);
            pageview.addEventListener(function (sender,type) {
                var pageview = sender;
                var idx = pageview.getCurPageIndex().valueOf() - 0 + 1;
                pageview.scrollToPage(idx-1);
                me.pointShow(idx - 1);
            });
        },
        pointShow:function(idx){
            var me = this;
            for (var i=0;i<me.nodes.panel_dian.getChildren().length;i++){
                var chirld = me.nodes.panel_dian.getChildren()[i];
                if (i == idx){
                    chirld.setBright(false);
                }else {
                    chirld.setBright(true);
                }
            }
        },
        initPoint:function (idx) {
            var me = this;
            var arr = [];
            me.nodes.panel_dian.removeAllChildren();
            for (var i = 0;i<me.initFaceData().length;i++){
                var point = me.nodes.list_btn.clone();
                point.show();
                arr.push(point);
            }
            X.center(arr, me.nodes.panel_dian);
            me.nodes.panel_dian.getChildren()[idx].setBright(false);
        }
    };

    cc.mixin(G.frame.chat, func);
})();