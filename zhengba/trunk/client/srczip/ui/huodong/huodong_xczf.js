/**
 * Created by
 */

(function () {
    //新春祝福
    var ID = 'huodong_xczf';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.hdid = G.DATA.asyncBtnsData.newyearwish.hdid;
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
            X.cacheByUid('firstLogincjhd',1);
            me.nodes.txt_2.removeAllChildren();
            var rh1 = X.setRichText({
                parent: me.nodes.txt_2,
                str:L('newyear_tip9'),
                maxWidth:me.nodes.txt_2.width,
                anchor: {x: 0, y: 0},
                color:"#FFF7B0",
                size:20,
            });
            rh1.setPosition(0, 70);
            me.nodes.btn_1.loadTextureNormal('img/public/btn/btn2_on.png',1);
            me.nodes.btn_1.click(function () {
                me.ajax('huodong_use', [me.hdid,1,1], function(str, data){
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize:data.d.prize
                        }).show();
                        me.remove();
                    }
                });
            });
        },
    });
    G.frame[ID] = new fun('chunjie_zhufu.json', ID);
})();