/**
 * Created by
 */
(function () {
    //
    var ID = 'yingxiongyure_qrjl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.frame.yingxiongyure.DATA;
            me.today = me.DATA.myinfo.idx;
            me.initUi();
        },
        onHide: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setQiandao();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var qiandao = me.DATA.info.qiandao;
            var arr1 = [];
            var arr2 = [];
            var list1 = [];
            var list2 = [];
            for (var i=0;i<7;i++){
                var item = {};
                item.prize = qiandao[i];
                item.day = i;
                if (i<4){
                    arr1.push(item);
                } else {
                    arr2.push(item);
                }
            }
            for (var i=0;i<arr1.length;i++){
                var list = me.getListItem(arr1[i]);
                list1.push(list);
            }
            for (var i=0;i<arr2.length;i++){
                var list = me.getListItem(arr2[i]);
                list2.push(list);
            }
            X.center(list1,me.nodes.panel_7tian);
            X.center(list2,me.nodes.panel_7tian1);
            me.nodes.txt_tt.setString((parseInt(me.DATA.myinfo.idx)+1)+'/'+'7');

            me.nodes.btn_commit.click(function (sender,type) {
               if (me.DATA.myinfo.idx == me.today && X.inArray(me.DATA.myinfo.qiandao,me.today)){
                   return G.tip_NB.show(L('yrhd_tip8'));
               }
                me.ajax('huodong_use', [G.frame.yingxiongyure.hdid,'5', me.today, 1], function (str, dd) {
                    if (dd.s == 1){

                        G.frame.jiangli.data({
                            prize: dd.d.prize
                        }).show();
                        me.DATA.myinfo = dd.d.myinfo;
                        me.setQiandao();
                        me.setContents();
                        G.frame.yingxiongyure.DATA.myinfo = dd.d.myinfo;
                        G.frame.yingxiongyure.checkRedPoint();
                        G.hongdian.getData('heropreheat');
                    }
                },true);
            });
        },
        getListItem:function (data) {
            var me = this;
            var list = me.nodes.list.clone();
            X.autoInitUI(list);
            list.show();
            list.setAnchorPoint(0.5,0.5);
            list.nodes.tip_ts.setString('第'+(parseInt(data.day)+1)+'天');
            list.nodes.ico_wp.removeAllChildren();
            var wid = G.class.sitem(data.prize[0]);
            wid.setAnchorPoint(0,0);
            wid.setPosition(0,0);
            list.nodes.ico_wp.addChild(wid);
            var qiandao = me.DATA.myinfo.qiandao;
            wid.setGou(X.inArray(qiandao,data.day));
            list.nodes.img_bq.hide();
            if (me.DATA.myinfo.idx>data.day && !X.inArray(qiandao,data.day)){
                //可以补签
                list.nodes.img_bq.show();
            }
            if (me.DATA.myinfo.idx == data.day && !X.inArray(qiandao,data.day)){
                G.class.ani.show({
                    json: "ani_wupingkuang",
                    addTo:  list.nodes.ico_wp,
                    x: 50,
                    y: 50,
                    repeat: true,
                    autoRemove: false,
                    onload :function(node,action){
                    }
                });
            }
            list.setTouchEnabled(true);
            list.data = data;
            list.click(function (sender,type) {
                G.frame.iteminfo.data(wid).show();
            });
            return list;
        },
        setQiandao:function () {
            var me = this;
            var txtjf =  me.nodes.txt_jg;
            me.nodes.txt_jg.removeAllChildren();
            var bqneed = me.DATA.info.buqianneed[0];
            var qiandao = me.DATA.myinfo.qiandao;
            var today = me.DATA.myinfo.idx;
            var str1 = '签到';
            var yy = 15;
            var node = new ccui.ImageView(G.class.getItemIco(bqneed.t), 1);
            if (!X.inArray(qiandao,today)){
                //今天还未签到
                me.today = today;
                str1 = '签到';
            }else {
                //今天已经签到
                for (var i=0;i<today;i++){
                    if (!X.inArray(qiandao,i)){
                        //说明可以补签
                        me.today = i;
                        var str1 = X.STR(L("yrhd_tip9"), bqneed.n);
                         yy = 10;
                        break;
                    }
                } 
            }
            txtjf.removeAllChildren();
            var rh = X.setRichText({
                parent:txtjf,
                str:str1,
                anchor: {x: 0.5, y: 0.5},
                pos: {x: txtjf.width / 2, y: yy},
                color:"#311e00",
                node:node,
                size:20,
            });
        },
    });
    G.frame[ID] = new fun('yingxiongyure_tk2.json', ID);
})();