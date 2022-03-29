/**
 * Created by
 */
(function () {
    //
    var ID = 'wyhd_cj';
    var fun = X.bUi.extend({
        ptGrid: ['01', '02', '03', '04',
                '06', '07', '08', '09',
                '11', '12', '13', '14',
                '16', '17', '18', '19'],
        tsGrid: ['05', '10', '15', '20', '25', '24', '23', '22', '21'],
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.needShowToper = true;
            me._super(json, id, {action:true});
        },
        createGrid: function () {
            var me = this;

            me.ptGridArr = [];
            me.tsGridArr = [];
            function add(type) {
                cc.each(me[type + 'Grid'], function (id, index) {
                    var grid = me.nodes['panel_' + id];
                    var list = grid.list = me.nodes.list.clone();
                    var conf = type == 'pt' ? G.gc.wyhd.lottery[index] : G.gc.wyhd.extprize[index];
                    X.autoInitUI(list);
                    list.show();
                    list.setPosition(grid.width / 2, grid.height / 2);
                    X.render({
                        ico_wp: function (node) {
                            conf && X.alignCenter(node, conf.prize, {
                                touch: true,
                                mapItem: function (node) {
                                    grid.item = node;
                                }
                            });
                        },
                        ico_bg: function (node) {
                            type == 'ts' && node.setBackGroundImage('img/wuyipaidui/ico_bg1.png', 1);
                        }
                    }, list.nodes);

                    grid.index = type == 'pt' ? index : index;
                    grid.addChild(list);
                    grid.conf = conf;
                    me[type + 'GridArr'].push(grid);
                });
            }
            add('pt');
            add('ts');
        },
        onOpen: function () {
            var me = this;
            var need = G.gc.wyhd.lotteryneed[0];
            me.nodes.panel_db1.setBackGroundImage(G.class.getItemIco(need.t), 1);
            me.nodes.panel_db2.setBackGroundImage(G.class.getItemIco(need.t), 1);
            me.nodes.txt_xh1.setString(need.n);

            me.createGrid();

            me.nodes.btn_1.click(function () {
                me.lottery(1);
            });

            me.nodes.btn_2.click(function (sender) {
                me.lottery(sender.num);
            });

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.changeToperAttr({
                attr1: {a: need.a, t: need.t}
            });
        },
        lottery: function (num) {
            var me = this;

            me.ajax('labour_lottery', [num], function (str, data) {
                if (data.s == 1) {
                    cc.mixin(G.frame.wyhd.DATA.myinfo, data.d.myinfo, true);
                    if (data.d.extprize && data.d.extprize.length > 0) {
                        var tsNode = {};
                        var ptNode = {};

                        cc.each(data.d.extprize, function (index) {
                            tsNode[index]= me.tsGridArr[index];

                            var conf = G.gc.wyhd.extprize[index];
                            cc.each(conf.cond, function (_index) {
                                if (!ptNode[_index]) {
                                    ptNode[_index] = me.ptGridArr[_index];
                                }
                            })
                        });
                        function addAni(node) {
                            G.class.ani.show({
                                json: 'wuyi_hd_xz1',
                                addTo: node.nodes.ico_bg,
                            });
                        }
                        cc.each(tsNode, function (node) {
                            addAni(node.list);
                        });
                        cc.each(ptNode, function (node) {
                            addAni(node.list);
                        });
                        me.ui.setTimeout(function () {
                            data.d.prize && data.d.prize.length > 0 && G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
                            me.onShow();
                        }, 1000);
                    } else {
                        data.d.prize && data.d.prize.length > 0 && G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        me.onShow();
                    }
                }
            });
        },
        onShow: function () {
            var me = this;

            me.showBtnState();
            me.refreshGridArr();
        },
        onHide: function () {
            this.changeToperAttr();
        },
        showBtnState: function () {
            var me = this;
            var need = G.gc.wyhd.lotteryneed[0];
            var haveNum = G.class.getOwnNum(need.t, need.a);
            var num = haveNum <= 0 || haveNum >= 10 ? 10 : haveNum;
            me.nodes.btn_2.num = num;
            me.nodes.txt_xh2.setString(num);
            me.nodes.txt_2.setString(num + L("CI"));
        },
        refreshGridArr: function () {
            var me = this;
            var data = G.frame.wyhd.DATA.myinfo;

            function refresh(type) {
                cc.each(me[type + 'GridArr'], function (grid) {
                    if (!grid.conf) return;
                    var key = type == 'pt' ? 'lottery' : 'extrec';
                    var over = type == 'pt' ? data[key][grid.index] > 0 : X.inArray(data[key], grid.index);
                    X.render({
                        img_yhd: function (node) {
                            type == 'ts' && node.setVisible(over);
                        }
                    }, grid.list.nodes);
                    type == 'pt' && over && grid.item.setGou(true);
                });
            }
            refresh('pt');
            refresh('ts');
        }
    });
    G.frame[ID] = new fun('wuyipaidui_zp.json', ID);
})();