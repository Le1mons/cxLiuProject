(function () {
    //封测返利
    G.class.huodong_fengcefanli = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_shoufafanli.json");
        },
        refreshPanel: function () {
            var me = this;
            me.getData(function () {
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            G.frame.huodong.getData(me._type.hdid,function(d){
                me.DATA = d;
                callback && callback();
            })
        },
        bindBTN: function() {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;
            me.ui.finds('btn_lq').hide();
            me.ui.finds('bg_10').hide();
            me.ui.finds('ylq').hide();

            me.refreshPanel();
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;
            var item = [];
            for(var i=1;i<=4;i++){
                item.push( me.ui.finds('ico_wupin'+i) );
            }

            if(data.myinfo.val){
                me.ui.finds('btn_lq').hide();
                me.ui.finds('ylq').show();

                me.ui.finds('bg_10').show();

                for(var i = 0;i<data.myinfo.gotarr.length;i++){
                    X.alignCenter(item[i],[data.myinfo.gotarr[i]],false,true);
                }
            }else {
                me.getDataFromGameConfig({binduid:P.gud.binduid, hdid: me._type.hdid , uid:P.gud.uid, rolename:P.gud.name},function (d) {
                    var data = d;
                    if(data.s == 1){
                        me.ui.finds('btn_lq').show();
                        me.ui.finds('bg_10').show();
                        for(var i = 0;i<data.prize.length;i++){
                            X.alignCenter(item[i],[data.prize[i]],false,true);
                        }
                        me.ui.finds('btn_lq').data = data.data;

                        me.ui.finds('btn_lq').click(function (sender) {
                            G.ajax.send('huodong_fengcefanli',[sender.data,me._type.hdid],function(data){
                                var data = JSON.parse(data);
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize: data.d
                                    }).show();
                                    me.ui.finds('btn_lq').hide();
                                    me.ui.finds('ylq').show();
                                }
                            });
                        });

                    }else {
                        me.ui.finds('img_wz').loadTexture('img/event/sffl2.png',1);
                        me.ui.finds('btn_lq').hide();
                        me.ui.finds('bg_10').hide();
                    }
                });
            };
        },
        getDataFromGameConfig : function (data,callback) {
            var me = this;
            var shoufafuliUrl = "http://gameconfig.legu.cc/?app=api&act=getFanLiInfo";
            var sing = X.MD5('' + data.binduid + data.hdid + data.uid +'xW3t8sTw');
            var url = shoufafuliUrl+"&binduid="+data.binduid+"&hdid="+data.hdid+"&uid="+data.uid+"&rolename="+data.rolename+"&sign="+sing;
            X.ajax.get(url,{},function(txt) {
                var d = X.toJSON(txt);
                callback && callback(d);
            });
        }
    })
})();