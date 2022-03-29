(function(){
    var ID = 'double_kaijiang';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            this.fullScreen = true;
            this._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
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
        onShow: function () {
            var me = this;
            var starTime = G.DATA.asyncBtnsData.double11.stime;
            var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间
            X.timeout(me.nodes.txt_djs, starZeroTime + (G.gc.double11.openday.kaijiang[1] - 1)*24*3600);

            me.setTable();
            me.nodes.txt_jc.setString(L("KJJGGS"));
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;
            me.getData(function () {
                _super.apply(me,arg);
            });
        },
        getData:function (callback) {
            var me = this;
            connectApi('double11_open',[true],function (data) {
                me.DATA = data;
                me.DATA.send = me.DATA.send || {};
                callback && callback();
            });
        },
        setTable: function () {
            var me = this;
            var arr = [];
            var conf = G.gc.double11.prizepool;
            for (var index = 0; index < conf.length; index ++) {
                if (me.DATA.send[index]) {
                    var dd = [];
                    cc.each(me.DATA.send[index], function (data) {
                        if (!dd[data.idx]) dd[data.idx] = [];
                        dd[data.idx].push(data);
                    });
                    cc.each(dd, function (data) {
                        arr.push({
                            conf: conf[index],
                            data: data
                        });
                    })
                } else {
                    arr.push({
                        conf: conf[index],
                        data: []
                    });
                }
            }

            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data, pos) {
                me.setItem(ui, data, pos[0]);
            });
            table.setData(arr);
            table.reloadDataWithScroll(true);

        },
        setItem: function (ui, data, index) {
            var me = this;
            var conf = data.conf;
            var _data = data.data;
            X.autoInitUI(ui);
            X.render({
                panel_wp: function (node) {
                    var prize = _data.length > 0 ? [].concat(conf.prize[_data[0].idx]) : [].concat(conf.prize[0]);
                    X.alignCenter(node, prize, {
                        touch: true
                    });
                },
                txt_jl: _data.length > 0 ? conf.itemname[_data[0].idx] : conf.name,
                txt_sl: _data.length > 0 ? X.STR(L("GCCXXF"), _data.length) : L("WDDKJTJ"),
                txt_wz: function (node) {
                    node.setVisible(_data.length == 0);
                    node.setString(X.STR(L("double_cjfl"), G.gc.item[G.gc.double11.poolreturn].name));
                },
                btn_ck: function (node) {
                    node.setVisible(_data.length > 0);
                    node.click(function () {
                        G.frame.double_cjInfo.data(_data).show();
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun("event_double11_kj.json", ID);
})();