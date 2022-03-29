/**
 * Created by LYF on 2018/10/10.
 */
(function () {
    //节日掉落
    G.class.huodong_jrdl = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('event_jieridiaoluo.json');
        },
        refreshPanel:function () {
            var me = this;
            me.getData(function(){
                me.setContents();
            })
        },
        onOpen: function () {
            var me = this;
            me.initUi();
        },
        initUi:function(){
            var me = this;

        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            G.frame.huodong.getData(me._type.hdid,function(d){
                me.DATA = d;
                callback && callback();
            })
        },
        setContents: function () {
            var me = this;
            var data = me.DATA.info;
            var str = "";
            var prize = [];
            for(var i = 0; i < data.arr.length; i ++) {
                prize.push(data.arr[i].p[0]);
                if(i != 0) {
                    str += "、" + G.class.getItem(data.arr[i].p[0].t).name;
                }else {
                    str += G.class.getItem(data.arr[i].p[0].t).name;
                }
            }

            me.nodes.wz1.setString(X.STR(L("SJDL"), str));

            if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                me.nodes.wz2.setString(X.moment(me.DATA.info.etime - G.time));
            }else {
                X.timeout(me.nodes.wz2, me.DATA.info.etime, function () {
                    X.uiMana.closeAllFrame();
                })
            }

            for(var i = 0; i < prize.length; i ++) {
                prize[i].n = 0;
                me.nodes["ico_daibi" + (i + 1)].show();
                me.nodes["ico_daibi" + (i + 1)].children[0].setBackGroundImage(G.class.getItemIco(prize[i].t), 1);
                me.nodes["ico_daibi" + (i + 1)].children[1].setString(G.class.getOwnNum(prize[i].t, prize[i].a))
            }

            X.alignCenter(me.nodes.neirong, prize, {
                touch: true
            });
        }
    });

})();