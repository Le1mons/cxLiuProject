/**
 * Created by  on 2019//.
 */
(function () {
    //双十一奖池
    var ID = 'double_jiangchi';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.prizePool = {};
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            me.nodes.btn_1.click(function () {
                G.frame.double_cj.show();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS78')
                }).show();
            });
            //我的抽奖
            me.nodes.btn_jcyl.click(function () {
                G.frame.double_myreward.show();
            });
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;
            me.getData(function () {
                _super.apply(me,arg);
            });
        },
        onShow: function () {
            var me = this;

            me.showLog();
            me.initPrizePool();
            me.showPrizeNum();
            me.showNeedNum();
            me.setState();
        },
        setState: function () {
            var me = this;
            var timeConf = G.gc.double11.openday.choujiang;
            var starTime = G.DATA.asyncBtnsData.double11.stime;
            var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间
            if (G.time < starZeroTime + timeConf[1]*24*3600) {
                me.nodes.btn_1.show();
                me.nodes.txt_tj.hide();
                me.ui.finds('txt_sj').setString(L('cjdjs'));
                X.timeout(me.nodes.txt_djs, starZeroTime + timeConf[1]*24*3600, function () {
                    me.setState();
                });
            } else {
                me.nodes.btn_1.hide();
                me.nodes.txt_tj.show();
                me.ui.finds('txt_sj').setString(L('kjdjs'));
                X.timeout(me.nodes.txt_djs, starZeroTime + timeConf[1]*24*3600 + 12 * 3600);
            }
        },
        onAniShow: function () {
            var me = this;
            me.action.play('wait', true);
        },
        onRemove: function () {
            var me = this;
        },
        getData:function (callback) {
            var me = this;
            connectApi('double11_open',[true],function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        showLog: function () {
            var me = this;

            for (var index = 0; index < me.DATA.log.length; index ++) {
                me.nodes.txt_zjjrwz.pushBackCustomItem(me.setLog(me.nodes.list_wz.clone(), me.DATA.log[index]));
            }
        },
        setLog: function (ui, data) {
            var me = this;
            var rh = X.setRichText({
                str: X.STR(L("double_jclog"), data.name, data.args[1], G.gc.double11.prizepool[data.args[0]].name || 'xx'),
                parent: ui
            });
            rh.setPosition(0, ui.height / 2 - rh.trueHeight() / 2);
            return ui;
        },
        initPrizePool: function () {
            var me = this;
            var conf = G.gc.double11.prizepool;

            for (var index = 0; index < conf.length; index ++) {
                me.nodes.listview.pushBackCustomItem(me.setPrize(me.nodes.list.clone(), conf[index], index));
            }
            me.selectPrize(0);
        },
        setPrize: function (ui, data, index) {
            var me = this;
            ui.index = index;
            X.autoInitUI(ui);
            X.render({
                panel_ico: function (node) {
                    var prize = G.class.sitem(data.prize[0][0]);
                    prize.setPosition(node.width / 2, node.height / 2);
                    node.addChild(prize);
                }
            }, ui.nodes);
            me.prizePool[index] = ui;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.noMove(function () {
                me.selectPrize(index);
            });
            ui.show();
            return ui;
        },
        showPrizeNum: function () {
            var me = this;

            cc.each(me.prizePool, function (prizeNode) {
                var num = me.DATA.sum[prizeNode.index] || 0;
                prizeNode.nodes.txt_title.setString(X.STR(L("double_jclj"),
                    parseInt(num / G.gc.double11.prizepool[prizeNode.index].jindu)));
            });
        },
        selectPrize: function (index) {
            var me = this;
            var pool = me.DATA.v[index] || {};
            var num = me.DATA.sum[index] || 0;
            var conf = G.gc.double11.prizepool[index];
            me.selectIndex = index;

            me.nodes.sz_phb.setString(parseInt(num / conf.jindu));
            X.alignCenter(me.nodes.panel_wp, [].concat(conf.prize[0], conf.prize[1]), {
                touch: true
            });

            var rh = X.setRichText({
                str: X.STR(L("double_jlzj"), conf.jindu),
                parent: me.nodes.txt_wz1,
                color: '#fff8e1',
                outline: '#000000'
            });
            rh.setPosition(me.nodes.txt_wz1.width / 2 - rh.trueWidth() / 2,
                me.nodes.txt_wz1.height / 2 - rh.trueHeight() / 2);

            var rh1 = X.setRichText({
                str: X.STR(L("double_myjoin"), pool[P.gud.uid] || 0),
                parent: me.nodes.txt_wz2,
                color: '#fff8e1',
            });
            rh1.setPosition(me.nodes.txt_wz2.width / 2 - rh1.trueWidth() / 2,
                me.nodes.txt_wz2.height / 2 - rh1.trueHeight() / 2);

            me.nodes.jdt100.setPercent(num % conf.jindu / conf.jindu * 100);
            me.nodes.txt_jd.setString((num % conf.jindu) + '/' + conf.jindu);
        },
        showNeedNum: function () {
            var me = this;
            me.nodes.ico_zs.setBackGroundImage(G.class.getItemIco(G.gc.double11.poolneed[0].t), 1);
            me.nodes.txt_zs.setString(X.fmtValue(G.class.getOwnNum(G.gc.double11.poolneed[0].t, G.gc.double11.poolneed[0].a)));
        }
    });
    G.frame[ID] = new fun('event_double11_xyjc.json', ID);
})();