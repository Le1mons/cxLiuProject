/**
 * Created by
 */
(function () {
    //赛龙舟-比赛奖励
    var ID = 'sailongzhou_bsjl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            var zero = X.getTodayZeroTime();
            var ten05 = zero + 22*3600 + 5*60;//晚上10.15
            var ten15 = zero + 22*3600 + 15*60;//晚上10.15
            if (ten15 > G.time && ten05 < G.time){
                X.timeout(me.nodes.txt_sj, ten15, function () {
                    me.nodes.txt_sj.hide();
                    me.ui.finds('txt_dsj').hide();
                });
            }else {
                me.nodes.txt_sj.hide();
                me.ui.finds('txt_dsj').hide();
            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.setTouchEnabled(true);
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_jl.hide();
            me.nodes.btn_jl.click(function () {
                G.frame.help.data({
                    intr:L("TS91")
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            var me = this;
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.timeType = me.data().type;
            me.lzconf =  G.gc.longzhou;
            me.initButton();
        },
        initButton:function(){
            //今日奖励
            var me = this;
            me.nodes.btn_jjxs.click(function (sender,type) {
                me.type = 'day';
                sender.setBright(false);
                me.nodes.btn_ttxs.setBright(true);
                if (me.timeType == 'result'&& G.frame.sailongzhou.DATA.jieguo && G.frame.sailongzhou.DATA.jieguo.length>0){
                    //有结果
                    me.list = me.nodes.list_lb2;
                    me._data = G.frame.sailongzhou.DATA.jieguo;
                    me.setContents(2);
                }else {
                    //没结果
                    me.list = me.nodes.list_lb1;
                    me._data = [1,2,3,4];
                    me.setContents(1);
                }
            });
            //昨日奖励
            me.nodes.btn_ttxs.click(function (sender,type) {
                if (!G.frame.sailongzhou.DATA.old || G.frame.sailongzhou.DATA.old.length<1){
                    return G.tip_NB.show(L('slz_tip19'));
                }
                sender.setBright(false);
                me.nodes.btn_jjxs.setBright(true);
                me.type = 'old';
                me._data = G.frame.sailongzhou.DATA.old;
                me.list = me.nodes.list_lb2;
                me.setContents(2);
            });
            me.nodes.btn_jjxs.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        setContents: function (idx) {
            var me = this;
            var last = [];
            for (var i =0;i<me._data.length;i++){
                me._data[i].rank = i+1;
                last.push(me._data[i]);
            }
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.nodes.scrollview.removeAllChildren();
            me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                me['setItem'+idx](ui, data);
            });
            me.table.setData(last);
            me.table.reloadDataWithScroll(true);
        },
        setItem1:function (ui,data) {
            var me = this;
            //没数据的
            X.autoInitUI(ui);
            //名次奖励
            ui.nodes.sz_phb2.setString(data);
            var mcprize = me.lzconf.longzhouprize[data-1][1];
            var prize1 = G.class.sitem(mcprize[0]);
            prize1.setPosition(ui.nodes.panel_jl3.width / 2, ui.nodes.panel_jl3.height / 2);
            ui.nodes.panel_jl3.addChild(prize1);
            G.frame.iteminfo.showItemInfo(prize1);
            // ui.nodes.panel_jl3.setBackGroundImage('img/duanwu/img_bg.png', 1);

            ui.nodes.panel_jl4.removeAllChildren();
            //惊喜奖励
            var surprize = me.getSurprize(data);
            ui.nodes.panel_jl4.removeAllChildren();
            X.alignItems(ui.nodes.panel_jl4,surprize, 'left', {
                touch: false,
                mapItem: function (node) {
                    node.num.hide();
                    node.icon.hide();
                    node.star && node.star.hide();
                    node.sui && node.sui.hide();
                    node.panel_zz && node.panel_zz.hide();
                }
            });
            for (var i=0;i<2;i++){
                var item = new ccui.Layout();
                item.setContentSize(100,100);
                item.setAnchorPoint(0,0);
                item.setPosition(100*i+i*20+5,0);
                item.setBackGroundImage('img/jingjichang/img_jjc_wh.png', 1);
                item.setScale(.9);
                ui.nodes.panel_jl4.addChild(item);
            }
            // var rs = G.frame.sailongzhou.DATA.allnum[data]||0;
            // var basenum = me.lzconf.longzhouinfo[data].basenum;//有这么多人投票就会多一分奖励
            // var rsprizenum = parseInt(rs/basenum);
            // if (rsprizenum==0 && rs>0){
            //     rsprizenum =1;
            // }
            // if (rsprizenum >= me.lzconf.longzhouinfo[data].maxnum){
            //     rsprizenum = me.lzconf.longzhouinfo[data].maxnum
            // }
            // var fenzi = (rsprizenum - basenum)>0?(rsprizenum - basenum):0;
            // var bl = parseInt(fenzi/basenum)*100;//比例
            var bl = me.lzconf.longzhouprize[data-1][2];
            var ico = new ccui.ImageView('img/duanwu/img_jt.png', 1);
            X.setRichText({
                str: X.STR(L('slz_tip20'),bl),
                parent: ui.nodes.text_fs2,
                node: ico,
                color: '#1c9700',
                size: 20,
                maxWidth: ui.nodes.text_fs2.width + 20
            });
        },
        setItem2:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            //有数据的
            ui.nodes.text_fs.hide();
            ui.nodes.sz_phb.setString(data.rank);
            ui.nodes.panel_jl1.removeAllChildren();
            var basep = me.lzconf.longzhouprize[data.rank-1][1];
            var prize1 = G.class.sitem(basep[0]);
            prize1.setPosition(ui.nodes.panel_jl1.width / 2, ui.nodes.panel_jl1.height / 2);
            ui.nodes.panel_jl1.addChild(prize1);
            G.frame.iteminfo.showItemInfo(prize1);
            //惊喜奖励
            var surprize = me.getSurprize(data.id);
            ui.nodes.panel_jl2.removeAllChildren();
            X.alignItems(ui.nodes.panel_jl2,surprize, 'left', {
                touch: true,
                // mapItem: function (node) {
                //     node.num.hide();
                // }
            });
            ui.nodes.text_mz.setString(me.lzconf.longzhouinfo[data.id].name);
            ui.nodes.text_mz.setTextColor(cc.color('#ffe8a5'));
            X.enableOutline( ui.nodes.text_mz,'#a01e00',1);
            var zwnum = data.allnum||0;
            ui.nodes.text_rs.setString(X.STR(L('slz_tip13'),zwnum));
            ui.nodes.text_rs.setTextColor(cc.color('#a01e00'));
            //每个龙舟的基础分数 = 投票总人数/该龙舟的basenum+(龙舟名次的百分比)
            // var bsenum = me.lzconf.longzhouinfo[data.id].basenum;
            //奖励总份数
            var maxnum = me.lzconf.longzhouinfo[data.id].maxnum*2;
            var totalnum = data.extprize[0].length+data.extprize[1].length;
            if (totalnum >= maxnum ){
                var bsenum = maxnum;
                var num1 = totalnum - bsenum;
            }else {
                var bsenum = totalnum;
                var num1 = 0;
            }
            ui.nodes.txt_fs.setString('份数:'+bsenum+'('+num1+')');
            ui.nodes.txt_fs.setTextColor(cc.color('#a01e00'));
            // if (me.type == 'day'){
            //     ui.nodes.btn_receive.show();
            // } else {
            //     ui.nodes.btn_receive.hide();
            // }
            ui.nodes.btn_receive.data = data;
            ui.nodes.btn_receive.click(function (sender,type) {
                G.frame.slz_jlzs.data({
                    id:sender.data.id,
                    extprize:sender.data.extprize
                }).show();
            });
        },
        getSurprize:function (id) {
            var me = this;
            var extprize = me.lzconf.extprize[id];
            var arr = [];
            for (var i=0;i<extprize.length;i++){
                arr.push(extprize[i][1][0]);
            }
            return arr;
        }
    });
    G.frame[ID] = new fun('duanwu_tk3.json', ID);
})();