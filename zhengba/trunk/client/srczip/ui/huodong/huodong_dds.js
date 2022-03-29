(function(){
    //打地鼠
    G.class.huodong_dds = X.bView.extend({
        extConf: {
            ds: [
                {score: 3, num: 30, time: [1.5,2, 2.5, 3], live: [1.5, 2, 2.5, 3]},
                {score: 5, num: 22, time: [2.5,3,3.5,4], live: [1, 1.5, 2]},
                {score: -2, num: 25, time: [2.5,3,3.5,4], live: [1, 1.5, 2]},
            ]
        },
        gridNum: 16,
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super('event_fkdj.json', null, {action: true});
        },
        onOpen: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);

            me.nodes.btn_gm.click(function () {
                me.gameStart();
            });
            me.nodes.btn_lx.click(function () {
                me.gameStart();
            });
            me.nodes.btn_lq.click(function () {
                me.tz = true;
                me.gameStart(true);
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS80')
                }).show();
            });
        },
        onShow: function () {
            var me = this;

            me.grid = {};
            me.getData(function () {
                me.showPrize();
                me.setContents();
            });
            me.initGrid();
            me.score = 0;
            me.showScore();

            if(me._data.rtime - G.time > 24*3600){
                me.nodes.txt_djs.setString(X.moment(me._data.rtime - G.time));
            }else {
                X.timeout(me.nodes.txt_djs, me._data.rtime, function () {
                    me.DATA.myinfo.gotarr = true;
                    me.nodes.txt_yj.setString(L("YJS"));
                });
            }
        },
        getData: function(callback){
            var me = this;

            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    if (G.time > me._data.rtime) {
                        me.DATA.myinfo.gotarr = true;
                    }
                    callback && callback();
                }
            });
        },
        setContents: function () {
            var me = this;

            me.setButtonState();
            me.showRankList();
        },
        showScore: function () {
            this.nodes.txt_bljf.setString(this.score);
        },
        showPrize: function () {
            var me = this;

            for (var index = 0; index < me.DATA.info.arr.length; index ++) {
                var data = me.DATA.info.arr[index];
                var list = me.nodes.list1.clone();
                list.show();
                X.autoInitUI(list);
                X.render({
                    txt_fs: data[0] > 0 ? data[0] + L("FEN") : L("CYJ"),
                    panel_token: function (node) {
                        node.setBackGroundImage(G.class.getItemIco(data[2][0].t), 1);
                    },
                    txt_sz: X.fmtValue(data[2][0].n),
                    panel_token2: function (node) {
                        data[2][1] && node.setBackGroundImage(G.class.getItemIco(data[2][1].t), 1);
                    },
                    txt_sz2: function (node) {
                        data[2][1] && node.setString(X.fmtValue(data[2][1].n));
                    }
                }, list.nodes);
                list.setPosition(me.nodes.panel_jl.width / 2, me.nodes.panel_jl.height - list.height / 2 - index * list.height - index * 4);
                me.nodes.panel_jl.addChild(list);
            }
        },
        showRankList: function () {
            var me = this;

            me.nodes.listview.removeAllChildren();
            for (var index = 0; index < 3; index ++) {
                var data = me.DATA.list[index] || {};
                var list = me.nodes.list2.clone();
                list.show();
                X.autoInitUI(list);
                X.render({
                    txt_mc: index + 1,
                    txt_name: data.name || L("XWYD"),
                    txt_jf: (data.val || 0) + L("FEN")
                }, list.nodes);
                me.nodes.listview.pushBackCustomItem(list);
            }
            X.render({
                txt_wdfs: me.DATA.rank > 0 ? me.DATA.rank : L("WSB"),
                txt_wdjf: (me.DATA.myinfo.val || 0) + L("FEN")
            }, me.nodes);
        },
        addScore: function (score) {
            var me = this;
            if (!cc.isNumber(score) || score === NaN) {
                score = 0;
            }
            me.score += score;
            if (me.score < 0) me.score = 0;
            me.showScore();
        },
        initGrid: function () {
            var me = this;

            me.ui.finds('Image_1').hide();
            me.ui.finds('Image_1_0').hide();

            for (var index = 0; index < me.gridNum; index ++) {
                var parent = me.nodes['panel_dj' + (index + 1)];
                var list = me.grid[index + 1] = me.nodes.panel_list.clone();
                list.index = index + 1;
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
                X.autoInitUI(list);
                list.show();
                list.setTouchEnabled(true);
                list.nodes.panel_ds.removeBackGroundImage();
                list.nodes.panel_fs.removeBackGroundImage();
                list.click(function (sender) {
                    if (me.gameOver) return null;
                    if (sender.cd) return null;
                    if (!sender.score) return null;
                    if (!cc.isNode(sender.ani)) return null;
                    if (sender.aniIn) return null;
                    me.addScore(sender.score);
                    if (sender.timeFun) {
                        sender.clearTimeout(sender.timeFun);
                    }
                    sender.aniIn = true;
                    G.class.ani.show({
                        json: 'fengkuangdijing_cz_tx',
                        addTo: me.nodes.panel_1,
                        x: sender.getParent().x,
                        y: sender.getParent().y,
                        onkey: function (n, a, e) {
                            if (e == 'hit') {
                                sender.ani.action.playWithCallback('baozha', false, function () {
                                    sender.nodes.panel_ds.removeAllChildren();
                                    sender.score = undefined;
                                    me.gridCd(sender);
                                    sender.aniIn = false;
                                });
                            }
                        }
                    });
                });
            }
        },
        gridCd: function (grid) {
            grid.cd = true;
            grid.setTimeout(function () {
                grid.cd = false
            }, 300);
        },
        gameStart: function () {
            var me = this;

            me.gameOver = false;
            me.score = 0;
            me.showScore();
            me.nodes.btn_gm.hide();
            me.nodes.btn_lx.hide();
            me.nodes.btn_lq.hide();
            me.nodes.txt_yxdjs.show();
            me.ui.finds('txt_yxsj').show();

            var time = 60;
            me.nodes.txt_yxdjs.setString(time);
            me.ui.setTimeout(function () {
                -- time;
                me.nodes.txt_yxdjs.setString(time);
                if (time == 0) {
                    me.gameOver = true;
                    me.gameOverFun();
                }
            }, 1000, 60);
            me.CONF = JSON.parse(JSON.stringify(me.extConf.ds));
            for (var index = 0; index < me.CONF.length; index ++) {
                me.gameLoop(index);
            }
        },
        gameLoop: function (index) {
            if (this.gameOver) return null;
            var me = this;
            var conf = me.CONF[index];
            if (me.CONF[index].num <= 0) {
                conf = me.CONF[0];
            }
            var gridArr = [];
            cc.each(me.grid, function (grid) {
                if (!grid.cd && !grid.score) gridArr.push(grid);
            });
            if (gridArr.length == 0) {
                return me.ui.setTimeout(function () {
                    me.gameLoop(index);
                }, 100);
            }
            conf.num --;
            var grid = X.arrayRand(gridArr);
            grid.score = conf.score;
            grid.live = X.arrayRand(conf.live);
            grid.time = X.arrayRand(conf.time);

            grid.setTimeout(function () {
                me.gameLoop(index);
            }, grid.time * 1000);
            me.showGrid(grid);
        },
        showGrid: function (grid) {
            if (this.gameOver) return null;
            var me = this;
            var ani = grid.score == -2 ? 1 : (grid.score == 3 ? 2 : 3);
            grid.nodes.panel_ds.removeAllChildren();
            G.class.ani.show({
                json: 'fengkuangdijing_dj_tx' + ani,
                addTo: grid.nodes.panel_ds,
                autoRemove: false,
                onload: function (node, action) {
                    grid.ani = node;
                    action.play('wait', true);
                }
            });
            grid.timeFun = grid.setTimeout(function () {
                grid.nodes.panel_ds.removeAllChildren();
                grid.score = undefined;
                me.gridCd(grid);
            }, grid.live * 1000);
        },
        gameOverFun: function () {
            var me = this;

            me.nodes.img_js.show();
            me.ui.setTimeout(function () {
                cc.each(me.grid, function (grid) {
                    if (grid.timeFun) {
                        grid.clearTimeout(grid.timeFun);
                    }
                    grid.cd = false;
                    grid.score = undefined;
                    grid.nodes.panel_ds.removeAllChildren();
                });
                if(me.tz) {
                    me.tz = false;
                    me.ajax('huodong_use', [me._data.hdid, 1, me.score], function (str, data) {
                        if (data.s == 1) {
                            data.d.prize && G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
                            me.getData(function () {
                                me.setContents();
                            });
                            if(me._data.isqingdian){
                                G.hongdian.getData("qingdian", 1, function () {
                                    G.frame.zhounianqing_main.checkRedPoint();
                                });
                            }else {
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                            }
                        }
                    });
                } else {
                    me.setButtonState();
                }
                me.nodes.txt_yxdjs.hide();
                me.ui.finds('txt_yxsj').hide();
                me.nodes.img_js.hide();
            }, 1000);
        },
        setButtonState: function () {
            var me = this;

            me.nodes.btn_lx.setVisible(me.DATA.myinfo.gotarr);
            me.nodes.btn_gm.setVisible(!me.DATA.myinfo.gotarr);
            me.nodes.btn_lq.setVisible(!me.DATA.myinfo.gotarr);
        },
    });
})();