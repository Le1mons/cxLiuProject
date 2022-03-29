/**
 * Created by
 */
(function () {
    //
    var ID = 'yingxiongyure_dh';
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
            me.nodes.panel_mask.hide();
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.frame.yingxiongyure.DATA;
            me.initUi();
        },
        onHide: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var txtjf = me.nodes.txt_sy;
            var num = G.class.getOwnNum(me.DATA.info.duihuanNeed[0].t,me.DATA.info.duihuanNeed[0].a);
            var str1 = X.STR(L('yrhd_tip4'),num);
            var rh = new X.bRichText({
                size: 18,
                maxWidth: txtjf.width,
                lineHeight: 24,
                family: G.defaultFNT,
                color: '#fef7e0',
                eachText: function (node) {
                    X.enableOutline(node, "#311e00", 2);
                }
            });
            rh.text(str1);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(txtjf.width / 2, txtjf.height / 2);
            txtjf.removeAllChildren();
            txtjf.addChild(rh);
            //
            var duihuan = me.DATA.info.duihuan;
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 8, 5);
            table.setData(X.keysOfObject(duihuan));
            table.reloadDataWithScroll(true);
        },
        setItem:function(ui,idx){
            var me = this;
            var duihuan = me.DATA.info.duihuan[idx];
            X.autoInitUI(ui);
            X.alignItems(ui.nodes.panel_wp1,duihuan.need,'center',{
                touch:true
            });
            X.alignItems(ui.nodes.panel_wp2,duihuan.prize,'center',{
                touch:true
            });
            var fenzi = me.DATA.myinfo.duihuan[idx]||0;
            var fenmu = duihuan.maxnum;
            var synum = fenmu-fenzi;
            ui.nodes.txt_jdt.setString(fenzi+'/'+fenmu);
            ui.nodes.img_jdt.setPercent(fenzi/fenmu*100);
            if (synum<=0){
                //售罄
                ui.nodes.btn_lq.setTouchEnabled(false);
                ui.nodes.btn_lq.setBright(false);
                ui.nodes.btn_lq.setTitleText('售罄');
                ui.nodes.btn_lq.setTitleColor(cc.color("#565656"));
            }else {
                ui.nodes.btn_lq.setTouchEnabled(true);
                ui.nodes.btn_lq.setBright(true);
                ui.nodes.btn_lq.setTitleText('兑换');
            }
            ui.nodes.btn_lq.duihuan = duihuan;
            ui.nodes.btn_lq.idx = idx;
            ui.nodes.btn_lq.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    if (synum<=0){
                        return G.tip_NB.show(L('yrhd_tip5'));
                    }
                    var myown = G.class.getOwnNum(sender.duihuan.need[0].t,sender.duihuan.need[0].a);
                    if (myown < sender.duihuan.need[0].n){
                        return G.tip_NB.show(X.STR(L('yrhd_tip6'),G.class.getItem(sender.duihuan.need[0].t,sender.duihuan.need[0].a).name));
                    }
                    G.frame.buying.data({
                        num: 1,
                        item: [].concat(sender.duihuan.prize),
                        need: sender.duihuan.need,
                        maxNum: synum,
                        btnTxt: L("QD"),
                        hideNeedNode: true,
                        callback: function (num) {
                            me.ajax('huodong_use', [G.frame.yingxiongyure.hdid,'1', sender.idx, num], function(str, dd) {
                                if (dd.s == 1) {
                                    G.frame.jiangli.once('close',function () {
                                        G.frame.yingxiongyure_czzl.setContents();
                                        me.setContents();
                                    }).data({
                                        prize: dd.d.prize
                                    }).show();
                                    me.DATA.myinfo = dd.d.myinfo;

                                    G.frame.yingxiongyure.DATA.myinfo = dd.d.myinfo;
                                }
                            }, true);
                        }
                    }).show();
                }
            });
        },
    });
    G.frame[ID] = new fun('yingxiongyure_tk4.json', ID);
})();