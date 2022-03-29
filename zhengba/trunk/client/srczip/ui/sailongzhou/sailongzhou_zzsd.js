/**
 * Created by
 */
(function () {
    //赛龙舟-粽子商店
    var ID = 'sailongzhou_zzsd';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.img_banner.setBackGroundImage('img/duanwu/img_banner3.png',1);
            me.nodes.txt_title.setString(L('slz_tip3'));
            me.nodes.txt_sj.hide();
            me.nodes.panel_xh1.removeAllChildren();
            var dfneed = me.conf.duihuanNeed[0];
            var ico = new ccui.ImageView(G.class.getItemIco(dfneed.t), 1);
            ico.scale = .8;
            var myhave = G.class.getOwnNum(dfneed.t,dfneed.a);
            X.setRichText({
                str: '<font node=1></font>' +' X '+ X.fmtValue(myhave),
                parent: me.nodes.panel_xh1,
                node: ico,
                color: '#00ff00',
                size: 20,
                maxWidth: me.nodes.panel_xh1.width
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onHide: function () {
            var me = this;
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.conf = G.gc.longzhou;
            me.setContents();
            me.initUi();
        },
        setContents: function () {
            var me = this;
            me.duihuanData = G.frame.sailongzhou.DATA.myinfo.duihuan;
            var duihuan = me.conf.duihuan;
            var keys = X.keysOfObject(duihuan);
            var _data = me.filterData(keys);
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.nodes.scrollview.removeAllChildren();
            me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao3, 1, function (ui, data) {
                me.setItem(ui, data);
            },null, null, 10, 0);
            me.table.setData(_data);
            me.table.reloadDataWithScroll(true);
        },
        filterData:function(data){
          var me = this;
          var last = [];
            for (var i =0;i<data.length;i++){
                if (me.conf.duihuan[data[i]].rtime>0){
                    if (G.frame.sailongzhou.islast)  last.push(data[i]);
                }else {
                    last.push(data[i]);
                }
            }
            last.sort(function (a,b) {
                var confA = me.conf.duihuan[a];
                var confB = me.conf.duihuan[b];
                var sya = confA.maxnum - (me.duihuanData[a]||0);
                var syb = confB.maxnum - (me.duihuanData[b]||0);
                var orderA = (sya<1)?-1000000:-confA.maxnum;
                var orderB = (syb<1)?-1000000:-confB.maxnum;
                return orderA > orderB ? -1:1;
            });
            return last;
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            var conf = me.conf.duihuan[data];

            var ygm = me.duihuanData[data]||0;
            var synum = conf.maxnum - ygm;
            ui.nodes.item1.removeAllChildren();
            var prize1 = G.class.sitem(conf.need[0]);
            prize1.setPosition(ui.nodes.item1.width / 2, ui.nodes.item1.height / 2);
            ui.nodes.item1.addChild(prize1);
            G.frame.iteminfo.showItemInfo(prize1);

            ui.nodes.item2.removeAllChildren();
            var prize2 = G.class.sitem(conf.prize[0]);
            prize2.setPosition(ui.nodes.item2.width / 2, ui.nodes.item2.height / 2);
            ui.nodes.item2.addChild(prize2);
            G.frame.iteminfo.showItemInfo(prize2);

            ui.nodes.txt.setString(X.STR(L('slz_tip8'),synum));
            ui.nodes.txt.setTextColor(cc.color(synum>0?'#7b531a':'#ff4e4e'));
            X.render({
                btn:function (node) {
                    node.data = conf;
                    node.key = data;

                    node.setBright(synum>0);
                    node.setTouchEnabled(synum>0);
                    node.click(function (sender,type) {
                        me.ajax('longzhou_duihuan', [sender.key,1], function(str, data){
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize:data.d.prize
                                }).show();
                                G.frame.sailongzhou.DATA.myinfo = data.d.myinfo;
                                me.setContents();
                                me.initUi();
                            }
                        });
                    },1000)
                },
                btn_txt:function (node) {
                    node.setString(synum>0?'兑换':'已售罄');
                }
            }, ui.nodes);

        }
    });
    G.frame[ID] = new fun('duanwu_tk2.json', ID);
})();