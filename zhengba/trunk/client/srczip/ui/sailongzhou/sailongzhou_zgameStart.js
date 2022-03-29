(function() {
    // 赛龙舟 - 比赛界面
    var me = G.frame.sailongzhou_slz;

    var _fun = {
        //比赛结束设置四条龙舟的排名
        setLongzhouEnd:function (select) {
            var me = this;
            var lzinfo = G.gc.longzhou.longzhouinfo;
            me.nodes.panel_lz.removeAllChildren();
            me.nodes.panel_jd.hide();
            me.nodes.img_zd.show();
            for (var i=0;i<4;i++){
                (function (idx) {
                    var lz = me.nodes.list.clone();
                    // lz.setScale(.6);
                    X.autoInitUI(lz);
                    lz.show();
                    lz.id = idx+1;
                    var d = me.getJieguodata(idx+1);
                    lz.data = d;
                    var info = lzinfo[idx+1];
                    lz.nodes.txt_lz.setString(info.name);
                    X.enableOutline(lz.nodes.txt_lz,'#000000',2);
                    lz.nodes.img_lz.setBackGroundImage('img/duanwu/'+info.img,1);
                    lz.nodes.panel_pm.hide();
                    lz.nodes.sz_phb.hide();
                    if (d.rank<4){
                        lz.nodes.panel_pm.show();
                        lz.nodes.panel_pm.setBackGroundImage('img/public/img_paihangbang_'+d.rank+'.png',1);
                    } else {
                        lz.nodes.sz_phb.setString(d.rank);
                        lz.nodes.sz_phb.show();
                    }
                    lz.nodes.panel_zw.hide();
                    if (lz.id == select){
                        lz.nodes.panel_zw.setBackGroundImage('img/duanwu/img_zw.png',1);
                        lz.nodes.img_qz.setBackGroundImage('img/duanwu/img_lz_qz2.png',1);
                    }else {
                        lz.nodes.panel_zw.setBackGroundImage('img/duanwu/img_zw2.png',1);
                        lz.nodes.img_qz.setBackGroundImage('img/duanwu/img_lz_qz1.png',1);
                    }
                    lz.setPosition(520,75*(2*idx+1));
                    lz.setTouchEnabled(true);
                    lz.click(function (sender,type) {
                        if (me.timeType != "djs"){
                            return;
                        }
                        me.setBottom(sender.id);
                    });
                    me.nodes.panel_lz.addChild(lz);
                })(i)
            }
        },
        getJieguodata:function (lzid) {
            var me = this;
            var jieguo = me.DATA.jieguo;
            var d = '';
            for (var i in jieguo){
                jieguo[i].rank = i*1+1;
                if (jieguo[i].id == lzid){
                    d = jieguo[i];
                }
            }
            return d;
        },
        gameStart:function () {
            var me = this;
            me.nodes.img_zd.hide();
            me.nodes.panel_lz.removeAllChildren();
            me.zhuanchangAni(function () {
                me.initObstacle();
                me.initLongzhou();
                me.runActionbg();
                // me.setJdt();
            });
        },
        zhuanchangAni:function(callback){
          var me = this;
            G.class.ani.show({
                json: "dw_cjqh_tx",
                addTo: cc.director.getRunningScene(),
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {
                    me.ruchangAni = node;
                    action.playWithCallback('ruchang',false,function () {
                        action.playWithCallback('chuchang',false,function () {
                            callback && callback();
                        });
                    });
                }
            });
        },
        setJdt:function(jd){
          var me = this;
            me.nodes.panel_jd.show();
            // me.nodes.panel_xlz.runActions([
            //     cc.moveTo(40, cc.p(340, 25)),
            // ]);
            if (jd>=1)jd = 1;
            me.nodes.panel_xlz.x = 330*jd
        },
        //船待机的时候背景移动
        updateBgByWait:function(){
          var me = this;
            var bg2 = me.nodes.img_bg2;
            var bg6 = me.nodes.img_bg2.clone();
            bg2.x = 0;
            bg6.x = bg2.width;
            me.nodes.img_bg.addChild(bg6);
            me.nodes.img_bg.scheduleUpdate();
            me.nodes.img_bg.update = function () {
                bg6.x -= 0.5;
                bg2.x -= 0.5;
                if (bg6.x == bg6.width * -1) {
                    bg6.x = bg6.width;
                }
                if (bg2.x == bg2.width * -1) {
                    bg2.x = bg2.width;
                }
            };
        },
        resetBg:function(){
            var me = this;
            me.nodes.img_bg1.setPositionX(0);
            me.nodes.img_bg2.setPositionX(0);
            me.nodes.img_bg3.setPositionX(0);
            me.nodes.img_bg4.setPositionX(0);
            me.nodes.img_bg5.hide();
            me.nodes.img_bg6.hide();
            me.nodes.img_bg7.hide();
            me.nodes.img_bg8.hide();
        },
        runActionbg:function(){
          var me = this;
            var bg1 = me.nodes.img_bg1;
            var bg2 = me.nodes.img_bg2;
            var bg3 = me.nodes.img_bg3;
            var bg4 = me.nodes.img_bg4;
            //2
            var bg5 = me.nodes.img_bg1.clone();
            bg5.zIndex = 0;
            me.nodes.img_bg5 = bg5;
            var bg6 = me.nodes.img_bg2.clone();
            bg6.zIndex = 0;
            me.nodes.img_bg6 = bg6;
            var bg7 = me.nodes.img_bg3.clone();
            bg7.zIndex = 0;
            me.nodes.img_bg7= bg7;
            var bg8 = me.nodes.img_bg4.clone();
            bg8.zIndex = 0;
            me.nodes.img_bg8 = bg8;

            //3
            var bg9 = me.nodes.img_bg1.clone();
            var bg10 = me.nodes.img_bg2.clone();
            var bg11 = me.nodes.img_bg3.clone();
            var bg12 = me.nodes.img_bg4.clone();

            me.nodes.img_bg.addChild(bg8);
            me.nodes.img_bg.addChild(bg7);
            me.nodes.img_bg.addChild(bg6);
            me.nodes.img_bg.addChild(bg5);
            //
            // me.nodes.img_bg.addChild(bg9);
            // me.nodes.img_bg.addChild(bg10);
            // me.nodes.img_bg.addChild(bg11);
            // me.nodes.img_bg.addChild(bg12);
            bg1.x = 0;
            bg2.x = 0;
            bg3.x = 0;
            bg4.x = 0;
            //
            bg5.x = bg1.width;
            bg6.x = bg2.width;
            bg7.x = bg3.width;
            bg8.x = bg4.width;

            // bg9.x = bg1.width*2;
            // bg10.x = bg2.width*2;
            // bg11.x = bg3.width*2;
            // bg12.x = bg4.width*2;
            bg1.scheduleUpdate();
            bg1.update = function () {
                    if (!me.movebg){
                        me.resetBg();
                        return;
                    };
                    bg1.x -= 1;
                bg5.x -= 1;
                    if (bg1.x == bg1.width * -1) {
                        bg1.x = bg1.width;
                    }
                if (bg5.x == bg5.width * -1) {
                    bg5.x = bg5.width;
                }
            };
            bg2.scheduleUpdate();
            bg2.update = function () {
                if (!me.movebg){
                    me.resetBg();
                    return;
                };
                bg6.x -= 1;
                bg2.x -= 1;
                if (bg6.x == bg6.width * -1) {
                    bg6.x = bg6.width;
                }
                if (bg2.x == bg2.width * -1) {
                    bg2.x = bg2.width;
                }
            };
            bg3.scheduleUpdate();
            bg3.update = function () {
                if (!me.movebg){
                    me.resetBg();
                    return;
                };
                bg7.x -= 1;
                bg3.x -= 1;
                if (bg7.x == bg7.width * -1) {
                    bg7.x = bg7.width;
                }
                if (bg3.x == bg3.width * -1) {
                    bg3.x = bg3.width;
                }
            };
            bg4.scheduleUpdate();
            bg4.update = function () {
                if (!me.movebg){
                    me.resetBg();
                    return;
                };
                bg8.x -= 1;
                bg4.x -= 1;
                if (bg8.x == bg8.width * -1) {
                    bg8.x = bg8.width;
                }
                if (bg4.x == bg4.width * -1) {
                    bg4.x = bg4.width;
                }
            }
        },
        initUpdate:function(){
          var me = this;
            var num = 0;
            //一米 = 64像素
            //根据配置的初始速度对半移动障碍(实际上是放满了四倍)
            me.ui.update = function () {
                if (num%60==0){
                    for (var i=1;i<=4;i++){
                        (function (idx) {
                            var firspeed = me.conf.longzhouinfo[idx].basespeed*10*64/4;
                            var node = me.lzObsItem[idx];
                            if (cc.isNode(node)){
                                node.runActions([
                                    cc.moveTo(1, cc.p( node.getPosition().x-80, node.y)),
                                ]);
                            }
                        })(i)
                    }
                        if (me.DATA.myinfo.select){
                            if (cc.isNode(me.lzObsItem[me.DATA.myinfo.select])){
                                if (me.lzObsItem[me.DATA.myinfo.select].x<0){
                                    var jd = (Math.abs(me.lzObsItem[me.DATA.myinfo.select].x)/8100).toFixed(2);
                                    me.setJdt(jd);
                                }else {
                                    me.setJdt(0);
                                }
                            }else {
                                me.setJdt(0);
                            }
                        } else {
                            if (cc.isNode(me.lzObsItem[1])){
                                if (me.lzObsItem[1].x<0){
                                    var jd = (Math.abs(me.lzObsItem[1].x)/8100).toFixed(2);
                                    me.setJdt(jd);
                                }else {
                                    me.setJdt(0);
                                }
                            } else {
                                me.setJdt(0);
                            }
                        }
                }
                num++;
                if (!me.isUpdate) return;
                var maxlz = me.getNowXMaxlz();
                me.keepParentPos(maxlz);
            };
            me.ui.scheduleUpdate();
        },
        //需要计算当前最快的龙舟相对于panel_lz的偏移量,让我的最快的龙舟始终处于屏幕内
        keepParentPos:function(maxlz){
          var me = this;
          var basex = 320;
          //右边四分之三的位置
            var rightX = 640*0.75 - maxlz.width*1;
          if (maxlz.x>0){
              me.nodes.panel_lz.x = basex - maxlz.x + rightX;
          }else {
              me.nodes.panel_lz.x = basex + Math.abs(maxlz.x)+ rightX;
          }
        },
        getNowXMaxlz:function(){
          var me = this;
          var lz = me.lzItems;
          if (X.keysOfObject(lz).length<1)return ;
          var max = lz[1];
          for (var i in lz){
              if (lz[i].convertToWorldSpace().x > max.convertToWorldSpace().x){
                  max = lz[i];
              }
          }
          return max;
        },
        //初始化路线
        initObstacle:function(){
          var me = this;
            for (var i=1;i<=4;i++){
                (function (idx) {
                    //绘制四条路线
                    var d = me.getJieguodata(idx);//龙舟结果数据
                    var obsRood = me.getObstacleconf(d.log);
                    var obslist = me.createRood(obsRood,idx);
                    me.nodes.panel_lz.addChild(obslist);
                })(i)
            }
        },
        //绘制路线
        createRood:function(obsRood,verk){
          var me = this;
          var img = {
              'haicao':'img/duanwu/img_daoju2.png',
              'shunfeng':'img/duanwu/img_daoju1.png',
          };
          //hork:水平位置的idx
            //verk:竖直四条路线的idx
            //一米 = 64像素.10个障碍总长度120米,所以每个障碍间隔12米
            var _lay = new ccui.Layout();
            _lay.setAnchorPoint(0.5,0.5);
            _lay.setPosition(320,75*(2*verk-1));
            _lay.setName('obstacle_' +verk);
            _lay.setContentSize(640, 150);
            //每一个的间隔,120米,
            var jiange = parseInt(120/obsRood.length)*64;
            for (var k=0;k<obsRood.length;k++){
                var posLay = new ccui.Layout();
                posLay.setAnchorPoint(0,0.5);
                posLay.setPosition((k+1)*jiange,75);
                posLay.setName(obsRood[k] +verk+'_'+(k+1));
                posLay.setContentSize(75, 75);
                posLay.setBackGroundImage(img[obsRood[k]], 1);
                if (k == obsRood.length-1){
                    posLay.isend = true;
                }
                posLay.buff = obsRood[k];
                _lay.addChild(posLay);
            }
            me.lzObsItem[verk] = _lay;
            //创建终点
            return _lay;
        },
        getObstacleconf:function (obs) {
            var me = this;
            var arr = [];
            for (var i in obs){
                if (obs[i].buff){
                    arr.push(X.keysOfObject(obs[i].buff)[0]);
                }
            }
            return arr;
        },
        initLongzhou:function () {
            var me = this;
            var lzinfo = G.gc.longzhou.longzhouinfo;
            for (var i in lzinfo){
                var lz = G.class.createLongzhou(lzinfo[i],me.getJieguodata(i),i,1);
                me.lzItems[i] = lz;
                if (me.getJieguodata(i) && me.timeType != "djs"){
                    lz.move1();
                    me.initUpdate();
                }
                me.nodes.panel_lz.addChild(lz);
            }
            if (me.timeType == "djs"){
                if (me.DATA.myinfo.select){
                    me.lzItems[me.DATA.myinfo.select].triggerTouch(ccui.Widget.TOUCH_ENDED);
                } else {
                    me.lzItems['1'].triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
            }
            me.nodes.img_zd.buff = 'end';
        },
        //检测与障碍物的碰撞
        checkIsCollision:function (item,coll,isend) {
            var me = this;
            if (!cc.isNode(coll))return ;
            if (!coll.visible)return;
            var pos = item.convertToWorldSpace();
            var point = cc.p(pos.x + item.width / 2, pos.y + item.height / 2);
            var pos2 = coll.convertToWorldSpace();

            if (point.x >= pos2.x
                && point.x <= pos2.x + item.width) {
                return coll;
            } else return false;

        },
        //获得速度最快的龙舟跑到屏幕三分之二处所用时间
        getMaxlzTime:function () {
            var me = this;
            var maxspeed = 80;//像素
            var distance = 640*0.75 - 200;
            var time = distance/maxspeed;
            return time;
        }
        // checkRectangleCrash: function (pos, curPos, size) {
        //     if (curPos.x >= pos.x - size.width / 2
        //         && curPos.x <= pos.x + size.width / 2
        //         && curPos.y >= pos.y - size.height / 2
        //         && curPos.y <= pos.y + size.height / 2) return true;
        //     else return false;
        // },
        // checkRectangleEnd: function (pos, curPos, size) {
        //     if (curPos.x >= pos.x - size.width / 2) return true;
        //     else return false;
        // },
    };
    cc.mixin(me, _fun, true);
})();
