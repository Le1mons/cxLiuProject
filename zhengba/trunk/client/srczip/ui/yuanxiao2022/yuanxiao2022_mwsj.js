/**
 * Created by
 */

(function () {
    //美味升级
    var ID = 'yuanxiao2022_mwsj';
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
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var duihuan = G.gc.yuanxiao2022.duihuan;
            var last = [];
            for (var i in duihuan){
                duihuan[i].dhid = i;
                last.push(duihuan[i]);
            }
            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.nodes.scrollview,false);
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(last);
            table.reloadDataWithScroll(true);
            var ico = me.ui.finds('token_hnjb');
            var need = duihuan['1']['need'][0];
            ico.loadTexture(G.class.getItemIco(need.t),1);
            me.nodes.txt_jb.setString(G.class.getOwnNum(need.t,need.a));
            me.nodes.txt_jb.setTextHorizontalAlignment(1);
        },
        getData:function(arr){
            var me = this;
            var data = G.DATA.yuanxiao2022.myinfo.task;
            var arr1 = [];
            var arr2 = [];
            var arr3 = [];
            for (var i=0;i<arr.length;i++){
                var nval = data.data[arr[i].taskid]||0;
                if (X.inArray(data.rec,arr[i].taskid)){
                    arr3.push(arr[i].taskid);
                } else {
                    if (nval >= arr[i].pval){
                        arr1.push(arr[i].taskid);
                    }else {
                        arr2.push(arr[i].taskid);
                    }
                }
            }
            return arr1.concat(arr2.concat(arr3));
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            var dhinfo = data;
            var dhdata = G.DATA.yuanxiao2022.myinfo.duihuan;
            var nval = dhdata[dhinfo.dhid]||0;
            var synum = dhinfo.maxnum - nval;
            var color = synum>0?'#00ff00':'#ee2020';
            ui.nodes.txt_th.removeAllChildren();
            var rh1 = X.setRichText({
                parent:ui.nodes.txt_th,
                str:X.STR(L('newyear_tip7'),color,synum,dhinfo.maxnum),
                anchor: {x: 0, y: 0.5},
                color:"#ffeee1",
                outline: "#320000",
                size:20,
            });
            rh1.setPosition(0,ui.nodes.txt_th.height/2-rh1.trueHeight()/2+10);

            ui.nodes.panel_wp1.removeAllChildren();
            X.alignItems(ui.nodes.panel_wp1, dhinfo.need, "center",{
                touch:true
            });
            //
            ui.nodes.panel_wp2.removeAllChildren();
            X.alignItems(ui.nodes.panel_wp2, dhinfo.prize, "center",{
                touch:true
            });

            if (synum<1){
                ui.nodes.btn.setBright(false);
                ui.nodes.btn.setTouchEnabled(false);
                ui.nodes.btn_txt.setString('已售罄');
                ui.nodes.btn_txt.setTextColor(cc.color('#3d3b3b'));
            }else {
                ui.nodes.btn.setBright(true);
                ui.nodes.btn.setTouchEnabled(true);
                ui.nodes.btn_txt.setString('兑换');
            }
            ui.nodes.btn.data = dhinfo;
            ui.nodes.btn.synum = synum;
            ui.nodes.btn.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.buying.data({
                        num: 1,
                        item: sender.data.prize,
                        need: sender.data.need,
                        maxNum: sender.synum,
                        callback: function (num) {
                            G.DAO.yuanxiao2022.duihuan([sender.data.dhid,num],function (dd) {
                                if (dd.prize && dd.prize.length>0){
                                    G.frame.jiangli.data({
                                        prize: dd.prize
                                    }).show();
                                }
                                G.DATA.yuanxiao2022.myinfo = dd.myinfo;
                                me.setContents();
                            });
                        }
                    }).show();
                }
            })
        }
    });
    G.frame[ID] = new fun('yuanxiao_tk4.json', ID);
})();