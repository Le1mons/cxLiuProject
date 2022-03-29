(function () {
//每日迷宫
    G.class.huodong_mrmg = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_mrmg.json");
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
        },
        onOpen:function(){
            var me = this;
            if(me._data.etime - G.time > 24*3600){
                me.nodes.txt_time.setString(X.moment(me._data.etime - G.time));
            }else{
                X.timeout(me.nodes.txt_time,me._data.etime,function(){
                    me.nodes.txt_time.setString(L("YJS"));
                    G.tip_NB.show(L('HUODONG_HD_OVER'));
                    G.frame.huodong.remove();
                })
            }
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            me.nodes.btn_qw.click(function () {
                G.frame.maze.show();
            });
        },
    });
})();