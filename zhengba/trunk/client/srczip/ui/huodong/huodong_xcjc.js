/**
 * Created by
 */
G.event.on("attrchange_over", function () {
    if(G.frame.huodong_xcjc.isShow) {
        G.frame.huodong_xcjc.showAttr();
    }
});
(function () {
    //新春奖池
    var ID = 'huodong_xcjc';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.panel_btn1.setAnchorPoint(0.5,0.5);
            me.nodes.panel_btn1.setPositionY(190);
        },
        onShow: function () {
            var me = this;
            me.hdid = G.DATA.asyncBtnsData.newyearhongbao.hdid;
            me.getData(me.hdid,function () {
                me.setContents();
            });
        },
        getData: function (hdid, callback) {
            var me = this;
            me.ajax('huodong_open', [hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback(data.d);
                } else {
                    if (me.isShow) me.remove();
                }
            });
        },
        setContents: function () {
            var me = this;
            me.showAttr();
            X.render({
                txt_sj2: function(node){ // 倒计时
                    var rtime = G.DATA.asyncBtnsData.newyearhongbao.rtime;
                    var etime = G.DATA.asyncBtnsData.newyearhongbao.etime;
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    if (rtime > G.time){
                        me.timer = X.timeout(node, rtime, function () {
                        }, null, {
                            showDay: true
                        });
                        me.nodes.txt_sj1.setString('开奖倒计时:');
                    }else if (etime > G.time) {
                        me.timer = X.timeout(node, etime, function () {
                        }, null, {
                            showDay: true
                        });
                        me.nodes.txt_sj1.setString('活动倒计时:');
                    }
                },
                panel_btn1:function (node) {
                  node.setTouchEnabled(false);
                },
                btn_lan:function (node) {
                    node.click(function () {
                        if (G.DATA.asyncBtnsData.newyearhongbao.rtime > G.time){
                            G.tip_NB.show(L('DDDJSJS'));
                            return;
                        }
                        me.ajax('huodong_use', [me.hdid,1,1], function(str, data){
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize:data.d.prize
                                }).show();
                                G.DATA.asyncBtnsData.newyearhongbao.act = false;
                                G.view.mainView.checkXinchunjiangchi();
                                me.remove();
                            }
                        });
                    });
                },
            }, me.nodes);
        },
        showAttr: function () {
            var me = this;
            me.nodes.btn_jia1.click(function (sender, type) {
                G.frame.dianjin.show();
            });

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.show();
            });
            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
    });
    G.frame[ID] = new fun('chunjie_xcjc.json', ID);
})();