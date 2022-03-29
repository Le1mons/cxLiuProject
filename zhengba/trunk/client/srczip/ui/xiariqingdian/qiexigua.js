(function () {
    //切西瓜

    var ID = 'qiexigua';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_sj.clearAllTimers();
            //var etime = G.time + 58;
            X.timeout1(me.nodes.txt_sj,me.nodes.txt_sj, 60, function () {
                me.isStart = false;
                me.getPrize();

                if(me.timer){
                    me.ui.clearTimeout(me.timer);
                    delete me.timer;
                }
                me.timer = me.ui.setTimeout(function(){
                    G.tip_NB.show(L("wanglouyichang"));
                    me.remove();
                },5000);
            }, function () {
                // cc.log("step~~~~~");
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
        },

        scorechange: function(num){
            var me = this;
            me.score = me.score + num < 0 ? 0 : me.score + num;
            me.nodes.txt_jf.setString(L("GHZ_BLJF1") + me.score);
        },

        getPrize: function () {
            var me = this;

            var multiple = me.data().multiple || 1;
            G.ajax.send('xiariqingdian_xiaoyouxi',[me.score,multiple], function (str, data) {
                if (data.s == 1) {
                    G.frame.jiangli.data({
                        prize: data.d.prize
                    }).show();
                    G.frame.xiariqingdian.DATA.myinfo = data.d.myinfo;
                    G.frame.xiariqingliang_qiexigua.setContent();
                    me.remove()
                }
            });
        },

        onOpen: function () {
            var me = this;

            me.score = 0;
            me.roleSpeed = 8;

            me.nodes.panel_js.setTouchEnabled(true);
            me.nodes.panel_dl.setTouchEnabled(true);

            me.initUi();
            me.bindBtn();
            me.scorechange(0);
        },

        onShow: function () {
            var me = this;
            me.setContent();

            me.isStart = true;
            me.xigua1(100);
            me.xigua2(100);
            me.xigua3(100);
        },
        setContent: function(){
            var me = this;

            var rw = me.nodes.panel_js;
            // rw.setBackGroundColor(cc.color("#000000"));
            // rw.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            rw.removeAllChildren();
            rw.canMove = true;
            rw.shihua = function () {
                var that = this;
                that.canMove = false;
                that.model.runAni(0, "shihua", true);
                that.xuanyunstate = true;
                me.scorechange(-10)
                that.setTimeout(function () {
                    that.canMove = true;
                    that.xuanyunstate = false;
                    that.wait = true;
                    that.model.runAni(0, "wait", true);
                }, 2000);
            };

            X.spine.show({
                json:'spine/'+ 'jskan_dh' +'.json',
                addTo : rw,
                noRemove: true,
                cache: true,
                x: rw.width / 2, y:0, z:0,
                autoRemove:false,
                onload : function(node){
                    rw.model = node;
                    rw.model.runAni(0, "wait", true);
                    rw.xuanyunstate = false;
                    rw.update = function () {
                        if (this.xuanyunstate) return;
                        if (this.state == "stop" || !this.canMove) {
                            this.isRun = false;
                            if (!this.wait) {
                                this.wait = true
                                this.model.runAni(0, "wait", true);
                            }
                            return
                        };

                        if (this.toX > this.x && this.state == "jia" && (this.x < cc.winSize.width - this.width / 2)) {
                            if (!this.isRun) {
                                this.model.runAni(0, "skill", true);
                                this.isRun = true;
                                this.wait = false;
                            }
                            this.model.setScaleX(1);
                            this.x += me.roleSpeed;
                            if (this.x >= this.toX) {
                                if (!this.wait) {

                                    this.wait = true
                                    this.model.runAni(0, "wait", true);
                                }
                                this.isRun = false;

                            }
                        }
                        if (this.toX < this.x && this.state == "jian" && (this.x > this.width / 2)) {
                            if (!this.isRun) {
                                this.model.runAni(0, "skill", true);
                                this.wait = false;
                                this.isRun = true;
                            }
                            this.model.setScaleX(-1);
                            this.x -= me.roleSpeed;
                            if (this.x < this.toX) {
                                this.isRun = false;
                                if (!this.wait) {
                                    this.wait = true
                                    this.model.runAni(0, "wait", true);
                                }

                            }
                        }
                    }
                    rw.scheduleUpdate();
                }
            });

            rw.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    bPos = sender.getTouchBeganPosition();
                    nPos = rw.getPosition();
                } else if (type == ccui.Widget.TOUCH_MOVED) {
                    var mPos = sender.getTouchMovePosition();
                    var juli = bPos.x - mPos.x;
                    var zPos;
                    if (nPos.x - juli < 0) {
                        zPos = rw.width / 2;
                    } else if (nPos.x - juli > cc.winSize.width) {
                        zPos = cc.winSize.width - rw.width / 2;
                    } else {
                        zPos = nPos.x - juli;
                    }
                    rw.state = nPos.x > zPos ? "jian" : "jia";
                    rw.toX = zPos
                } else if (type == ccui.Widget.TOUCH_ENDED) {
                    rw.state = "stop"

                } else if (type == ccui.Widget.TOUCH_CANCELED) {
                    rw.state = "stop"
                }
            });

            me.nodes.panel_dl.touch(function (sender, type) {

                if (type == ccui.Widget.TOUCH_BEGAN) {
                    bPos = sender.convertToWorldSpace(sender.getTouchBeganPosition());
                    mPos = rw.getPosition()
                    nPos = rw.getPosition();
                    var juli = mPos.x - bPos.x;
                    var zPos;
                    if (nPos.x - juli < 0) {
                        zPos = rw.width / 2;
                    } else if (nPos.x - juli > cc.winSize.width) {
                        zPos = cc.winSize.width - rw.width / 2;
                    } else {
                        zPos = nPos.x - juli;
                    }
                    rw.state = nPos.x > zPos ? "jian" : "jia";
                    rw.toX = zPos
                } else if (type == ccui.Widget.TOUCH_MOVED) {
                    // var mPos = sender.getTouchMovePosition();
                    // var juli = bPos.x - mPos.x;
                    // var zPos;
                    // if (nPos.x - juli < 0) {
                    //   zPos = rw.width / 2;
                    // } else if (nPos.x - juli > cc.winSize.width) {
                    //   zPos = cc.winSize.width - rw.width / 2;
                    // } else {
                    //   zPos = nPos.x - juli;
                    // }
                    // rw.state = nPos.x > zPos ? "jian" : "jia";
                    // rw.toX = zPos
                } else if (type == ccui.Widget.TOUCH_ENDED) {
                    rw.state = "stop"

                } else if (type == ccui.Widget.TOUCH_CANCELED) {
                    rw.state = "stop"
                }
            });

            rw.toX = rw.getPosition().x;
        },

        xigua1: function (time) {
            var me = this;
            if (!me.isStart) return;
            var cd = time || X.rand(1,4)*1000;

            me.ui.setTimeout(function () {
                var node = me.initxigua(1);
                me.nodes.panel_dl.addChild(node);
                me.xigua1();
            },cd)
        },
        xigua2: function (time) {
            var me = this;
            if (!me.isStart) return;
            var cd = time || X.rand(1,4)*1000;
            me.ui.setTimeout(() => {
                var node = me.initxigua(2);
                me.nodes.panel_dl.addChild(node);
                me.xigua2();
            }, cd);
        },
        xigua3: function (time) {
            var me = this;
            if (!me.isStart) return;
            var cd = time || X.rand(1,4)*1000;
            me.ui.setTimeout(() => {
                var node = me.initxigua(3);
                me.nodes.panel_dl.addChild(node);
                me.xigua3();
            }, cd);
        },

        initxigua: function (type) {
            var me = this;
            var layout = new ccui.Layout();
            layout.speed = X.rand(4,8);
            layout.setAnchorPoint(0.5, 0.5);
            layout.setContentSize(cc.size(94, 94));
            // layout.setBackGroundColor(cc.color("#e9361e"));
            // layout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            G.class.ani.show({
                json:'xrhd_tx_xigua' + type,
                addTo: layout,
                x:layout.width / 2,
                y:layout.height / 2,
                repeat:true,
                autoRemove:false,
                onload : function(node,action){
                    layout.aniaction = action;
                    action.play('wait',false);
                }
            });


            layout.y = 1700;
            layout.type = type;
            layout.x = X.rand(35, cc.winSize.width  - 35);
            layout.update = function () {
                var _me = this;
                if( _me.isPlay) return;
                _me.y -= _me.speed;
                if (_me.y <= 200) {
                    _me.delete();
                }
                if (!cc.isNode(_me)) return;
                var pos = me.nodes.panel_js.getPosition();
                var __pos = me.nodes.panel_js.convertToWorldSpaceAR();
                var size = me.nodes.panel_js.getContentSize();
                if (
                    _me.y < (pos.y + size.height / 2) &&
                    // (
                    //     (pos.x - size.width / 2 - 10 <= this.x && pos.x + size.width / 2  + 10 >= this.x ) ||
                    //     (pos.x - size.width / 2 - 10 <= (this.x + this.width ) && pos.x + size.width / 2 + 10 >= (this.x + this.width))
                    // )
                    Math.abs(__pos.x - this.x) <= size.width / 2 + 25
                    &&
                    !me.nodes.panel_js.xuanyunstate

                ) {
                    _me.isPlay = true;
                    _me.aniaction.playWithCallback('shouji',false,function () {
                        _me.delete();
                    });
                    switch (this.type) {
                        case 1:
                            me.scorechange(5);
                            break
                        case 2:
                            me.scorechange(50);
                            break
                        case 3:
                            me.nodes.panel_js.shihua()
                            break
                    }
                }
            };
            layout.delete = function () {
                this.unscheduleUpdate();
                this.removeFromParent();
            };
            layout.scheduleUpdate();
            return layout;
        },


    });
    G.frame[ID] = new fun('xiariqingdian_qxg.json', ID);
})();