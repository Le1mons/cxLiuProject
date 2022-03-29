/**
 * Created by  on 2019//.
 */
(function () {
    //扫荡结果
    var ID = 'alaxi_sdjg';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data().data;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_qd.click(function () {
                me.remove();
            });
            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });
            me.ui.finds('panel_dh').setTouchEnabled(true);
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var fightdata = JSON.parse(JSON.stringify(me.DATA.fightlog));
            var jifen = me.DATA.jifeninfolist;
            var mvp;
            var fail = 0;
            var win = 0;
            var add = 0;
            for (var i=0;i<fightdata.length;i++){
                if (fightdata[i].winside == 0){
                    if (!mvp)mvp = fightdata[i];
                    win++;
                }else {
                    fail++;
                }
                if (jifen[i].win_uid == P.gud.uid){
                    add+=jifen[i].add;
                    fightdata[i].add = jifen[i].add;
                    fightdata[i].reduce = jifen[i].reduce;
                }else {
                    fightdata[i].add = 0;
                    fightdata[i].reduce = jifen[i].reduce;
                }
            }
            if (!mvp)mvp = fightdata[0];
            me.setMvp(mvp);
            me.nodes.txt_ljhs.removeAllChildren();


            var rh = X.setRichText({
                str: X.STR(L('alaxi_tip1'),win,fail,add),
                parent: me.nodes.txt_ljhs,
                color: '#ffe77d',
                size: 20,
            });
            rh.setPosition(me.nodes.txt_ljhs.width / 2 - rh.trueWidth() / 2, me.nodes.txt_ljhs.height / 2 - rh.trueHeight() / 2);


            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.nodes.scrollview,false);
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list,1, function (ui, data, pos) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(fightdata);
            table.reloadDataWithScroll(true);
        },
        setItem:function(ui,data){
          var me = this;
          X.autoInitUI(ui);
            var head = G.class.shead(data.headdata[0]);
            head.setPosition(ui.nodes.panel_tx1.width / 2, ui.nodes.panel_tx1.height / 2);
            ui.nodes.panel_tx1.removeAllChildren();
            ui.nodes.panel_tx1.addChild(head);
            ui.nodes.txt_name1.setString(P.gud.name);
            ui.nodes.txt_df1.removeAllChildren();
            var rh1 = X.setRichText({
                str: X.STR(L("alaxi_tip2"),data.add?'+'+data.add:0),
                parent: ui.nodes.txt_df1,
                color: '#f4e8c9',
                size: 18
            });
            rh1.x = 0;
            //
            ui.nodes.panel_tx2.removeAllChildren();
            var head2 = G.class.shead(data.headdata[1]);
            head2.setPosition(ui.nodes.panel_tx2.width / 2, ui.nodes.panel_tx2.height / 2);
            ui.nodes.panel_tx2.removeAllChildren();
            ui.nodes.panel_tx2.addChild(head2);
            ui.nodes.txt_name2.setString(data.headdata[1].name);
            ui.nodes.txt_df2.removeAllChildren();
            var rh2 = X.setRichText({
                str: X.STR(L("alaxi_tip2"), data.reduce>0?'+'+data.reduce:data.reduce),
                parent: ui.nodes.txt_df2,
                color: '#f4e8c9',
                size: 18
            });
            rh2.x = ui.nodes.txt_df2.width-rh2.trueWidth();
            var mypic = data.add?'img_jjc_sl':'img_jjc_sb';
            var enepic = data.reduce?'img_jjc_sl':'img_jjc_sb';
            ui.nodes.img_sl.loadTexture('img/jingjichang/'+mypic+'.png',1);
            ui.nodes.img_sb.loadTexture('img/jingjichang/'+enepic+'.png',1);
        },
        setMvp:function (data) {
            var from = this;
            data = data || {};
            if (!data.signdata) return from.nodes.panel_mvp.hide();
            X.autoInitUI(from.nodes.panel_mvp);

            var obj = {};
            for (var rid in data.signdata) {
                if (!data.signdata[rid]) return from.nodes.panel_mvp.hide();
                if (data.winside == 0){
                    if (data.signdata[rid].hid && data.signdata[rid].side == 0) {
                        obj[rid] = data.signdata[rid];
                    }
                } else {
                    if (data.signdata[rid].hid && data.signdata[rid].side == 1) {
                        obj[rid] = data.signdata[rid];
                    }
                }
            }
            if (Object.keys(obj).length < 1) return null;
            var maxRid;
            var allDps = 0;
            for (var rid in obj) {
                allDps += obj[rid].dps;
                if (!maxRid) maxRid = rid;
                else if (obj[rid].dps > obj[maxRid].dps) maxRid = rid;
            }

            var heroConf = G.gc.hero[data.signdata[maxRid].hid] || {};
            X.render({
                txet_name: heroConf.name || "",
                panel_rw: function (node) {
                    X.setHeroModel({
                        parent: node,
                        data: data.signdata[maxRid]
                    });
                },
                txt_fntzt: data.signdata[maxRid].dps + " (" + (data.signdata[maxRid].dps / allDps * 100).toFixed(2) + "%" + ")"
            }, from.nodes.panel_mvp.nodes);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhandoushengli_alxzc.json', ID);
})();