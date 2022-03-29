/**
 * Created by
 */

(function () {
    //元宵福利
    var ID = 'yuanxiao2022_yxfl';
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
            me.qdday = G.DAO.yuanxiao2022.getQiandaoDay();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var _qiandao = G.gc.yuanxiao2022.qiandao;
            for (var i=0;i<_qiandao.length;i++){
                _qiandao[i].day = i+1;
            }
            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.nodes.scrollview,false);
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_yxfl,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(_qiandao);
            table.reloadDataWithScroll(true);
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.nodes.txt_ms.removeAllChildren();
            var rh1 = X.setRichText({
                parent:ui.nodes.txt_ms,
                str:X.STR(L('newyear_tip5'),data.day),
                anchor: {x: 0, y: 0.5},
                color:"#531500",
                size:20,
            });
            rh1.setPosition(0,ui.nodes.txt_ms.height/2-rh1.trueHeight()/2+10);
            ui.nodes.panel_wp.removeAllChildren();
            X.alignItems(ui.nodes.panel_wp, data.prize, "left",{
                touch:true
            });
            ui.nodes.btn.setBright(me.qdday>=data.day && !X.inArray(G.DATA.yuanxiao2022.myinfo.qiandao,(data.day-1)));
            ui.nodes.btn.setTouchEnabled(me.qdday>=data.day && !X.inArray(G.DATA.yuanxiao2022.myinfo.qiandao,(data.day-1)));
            G.removeNewIco(ui.nodes.btn);
            if (X.inArray(G.DATA.yuanxiao2022.myinfo.qiandao,(data.day-1))){
                ui.nodes.btn_txt.setString('已领取');
                ui.nodes.btn_txt.setTextColor(cc.color('#565656'));
            } else {
                ui.nodes.btn_txt.setString('领取');
                if (me.qdday>=data.day){
                    G.setNewIcoImg(ui.nodes.btn,0.8);
                }else {
                    ui.nodes.btn_txt.setTextColor(cc.color('#565656'));
                }
            }

            ui.nodes.btn.day  = data.day-1;
            ui.nodes.btn.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.DAO.yuanxiao2022.qiandao(sender.day,function (dd) {
                        G.frame.jiangli.data({
                            prize:dd.prize
                        }).show();
                        me.setContents();
                        G.frame.yuanxiao2022.showIteminfo();
                    });
                }
            })
        }
    });
    G.frame[ID] = new fun('yuanxiao_tk2.json', ID);
})();