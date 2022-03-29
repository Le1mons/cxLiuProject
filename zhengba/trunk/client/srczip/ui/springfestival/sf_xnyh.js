/**
 * Created by
 */

(function () {
    //新年烟火
    var ID = 'sf_xnyh';
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
            me.nodes.btn_bz.hide();
        },
        onShow: function () {
            var me = this;
            me.qdday = G.DAO.springfestival.getQiandaoDay();
            me.setContents();
            me.showAttr();
            me.initUI();
        },
        initUI:function(){
            var me = this;
            X.render({
                txt_sj2: function(node){ // 倒计时
                    var rtime = G.DAO.springfestival.getRefreshTime();
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    }, null, {
                        showDay: true
                    });
                },
            }, me.nodes);
            G.class.ani.show({
                json: "xinnian_yanhua_dh",
                addTo:me.nodes.panel_dh,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play('wait',true);
                    me.aniNode = node;
                },
            });
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
        setContents: function () {
            var me = this;
            var prize = G.gc.newyear3.qiandao;
            for (var i=1;i<=7;i++){
                var parent = me.nodes['panel_'+i];
                parent.removeAllChildren();
                var list = me.nodes.list.clone();
                list.show();
                list.day = i;
                me.setItem(list,prize[i-1]);
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);
                parent.addChild(list);
                parent.setTouchEnabled(true);
                parent.prize = prize[i-1].prize;
                parent.click(function (sender) {
                    G.frame.sf_jlyl.data({
                        prize: sender.prize,
                        title:'奖励预览'
                    }).show();
                });
            }
            var ylnum = G.DATA.springfestival.myinfo.qiandao.length;//已经领取的数量
            var jdt = Math.abs(ylnum/7*100);
            me.nodes.jdt.setPercent(jdt);
            me.nodes.panel_btn1.setTouchEnabled(false);
            me.nodes.btn_lan.click(function () {
                if (ylnum >= me.qdday) return G.tip_NB.show(L('newyear_tip2'));
                G.DAO.springfestival.qiandao(function (dd) {
                    me.aniNode && me.aniNode.action.playWithCallback('fashe',false,function () {
                        if (dd.prize && dd.prize.length>0){
                            G.frame.jiangli.data({
                                prize: dd.prize
                            }).show();
                        }
                        me.aniNode && me.aniNode.action.play('wait',true);
                    });
                    me.setContents();
                });
            });
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.nodes.txt_day.setString('第'+ui.day+'天');
            ui.nodes.img_ylq.setVisible(X.inArray(G.DATA.springfestival.myinfo.qiandao,(ui.day-1)));
        }
    });
    G.frame[ID] = new fun('chunjie_xnyh.json', ID);
})();