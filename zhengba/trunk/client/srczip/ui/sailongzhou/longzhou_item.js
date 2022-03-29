(function () {
    G.class.createLongzhou = function (conf, data,idx,scale) {
        var item = G.frame.sailongzhou_slz.nodes.list.clone();
        item.show();
        X.autoInitUI(item);
        item.conf = conf;
        item.data = data;
        item.id = idx;
        item.setName('longzhou'+idx);
        item.setAnchorPoint(0,0.5);
        item.setScale(scale);
        item.nodes.txt_lz.setString(conf.name);
        X.enableOutline(item.nodes.txt_lz,'#000000',2);
        item.nodes.img_lz.removeBackGroundImage();
        item.nodes.img_xz.setBackGroundImage('img/duanwu/img_lz'+idx+'_h.png',1);
        if (data){
            if (data.rank<4){
                item.nodes.panel_pm.setBackGroundImage('img/public/img_paihangbang_'+data.rank+'.png',1);
            } else {
                item.nodes.sz_phb.setString(data.rank);
            }

        }
        item.nodes.panel_pm.hide();
        item.nodes.sz_phb.hide();
        item.nodes.panel_zw.show();
        item.nodes.img_xz.hide();
        item.nodes.img_qz.show();
        item.setPosition(0, 75*(2*idx-1));
        item.createEffort = function () {
            G.class.ani.show({
                json: "duanwu_chuan_tx1",
                addTo: item.nodes.img_lz,
                cache: true,
                x: item.nodes.img_lz.width / 2,
                y: item.nodes.img_lz.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    X.autoInitUI(node);
                    node.nodes.panel_chuan.setBackGroundImage('img/duanwujie/chuan'+item.id+'.png',1);
                    action.play('wait', true);
                    item.aniNode = node;
                }
            });
        };
        item.setZhuweiQz = function(seletId){
            if (item.id == seletId){
                item.nodes.panel_zw.setBackGroundImage('img/duanwu/img_zw.png',1);
                item.nodes.img_qz.setBackGroundImage('img/duanwu/img_lz_qz2.png',1);

            } else {
                item.nodes.panel_zw.setBackGroundImage('img/duanwu/img_zw2.png',1);
                item.nodes.img_qz.setBackGroundImage('img/duanwu/img_lz_qz1.png',1);
            }
        };
        item.createEffort();
        item.setZhuweiQz(G.frame.sailongzhou_slz.DATA.myinfo.select);

        item.haicao = function (callback) {
            var _data = this.data;
            var rank = {
                '1':2,
                '2':2.1,
                '3':2.2,
                '4':2.3,
            };
            var speed = 80;
            var time = rank[_data.rank];
            var distance = speed*time;
            item.aniNode &&  item.aniNode.action.play('wait',true);
            if (item.haicaoNode){
                item.haicaoNode.show();
                item.haicaoNode.runAni(0,'wait',true);
            }else {
                X.spine.show({
                    json:'spine/haicao.json',
                    addTo : item.nodes.img_lz,
                    noRemove: true,
                    cache: true,
                    x: item.nodes.img_lz.width / 2,
                    y: 0,
                    z:0,
                    autoRemove:false,
                    onload : function(node){
                        item.haicaoNode = node;
                        node.runAni(0,'wait',true);
                    }
                });
            }
            this.runActions([
                cc.moveTo(time, cc.p(item.x - distance, item.y)),
                cc.callFunc (function () {
                    item.aniNode &&  item.aniNode.action.play('run',true);
                    item.haicaoNode && item.haicaoNode.hide();
                    callback && callback();
                }),
            ]);
        };
        item.shunfeng = function (callback) {
            var _data = this.data;
            var basespeed = 80;
            var rank = {
                '1':2.3,
                '2':2.2,
                '3':2.1,
                '4':2,
            };
            var time = rank[_data.rank];
            var distance = basespeed*time;
            item.aniNode &&  item.aniNode.action.play('jiasu',true);
            this.runActions([
                cc.moveTo(time, cc.p(item.x + distance, item.y)),
                cc.callFunc (function () {
                    item.aniNode &&  item.aniNode.action.play('run',true);
                    callback && callback();
                }),
            ]);
        };
        item.end = function () {
            item.isend = true;
            item.aniNode &&  item.aniNode.action.play('wait',true);
            if (item.data.rank<4){
                this.nodes.panel_pm.show();
            } else {
                this.nodes.sz_phb.show();
            }
            this.nodes.panel_zw.hide();
            G.frame.sailongzhou_slz.movebg = false;
            G.frame.sailongzhou_slz.isChongbo = true;
            G.frame.sailongzhou_slz.setBtn();
        };
        {
            item.update = function (dt) {
                var thisobspanel = G.frame.sailongzhou_slz.lzObsItem[item.id];
                if (!thisobspanel)return ;
                var allobs = thisobspanel.getChildren();
                var zhongdian =  G.frame.sailongzhou_slz.nodes.img_zd;
                for (var i in allobs) {
                    if ((allobs[i] && cc.isNode(allobs[i]) && G.frame.sailongzhou_slz.checkIsCollision(item,allobs[i]) && G.frame.sailongzhou_slz.checkIsCollision(item,allobs[i]).buff)) {
                        var iscollision = G.frame.sailongzhou_slz.checkIsCollision(item,allobs[i]);
                        var buff = iscollision.buff;
                        if (iscollision){
                            allobs[i].buff = '';
                            allobs[i].hide();
                            item[buff](function () {
                                if (iscollision.isend){
                                    if (G.frame.sailongzhou_slz.isUpdate){
                                        G.frame.sailongzhou_slz.isUpdate = false;
                                    }
                                    G.frame.sailongzhou_slz.nodes.img_zd.show();
                                    item.move();
                                }
                            });
                        }
                        break;
                    }
                }
                if (G.frame.sailongzhou_slz.checkIsCollision(item,zhongdian,true) && G.frame.sailongzhou_slz.checkIsCollision(item,zhongdian,true).buff && !item.isend){
                    var iscollision = G.frame.sailongzhou_slz.checkIsCollision(item,zhongdian,true);
                    var buff = iscollision.buff;
                    if (iscollision){
                        item[buff](function () {

                        });
                    }
                }

            };
            item.scheduleUpdate();
        };
        item.move1 = function(){
            var initvel = item.conf.basespeed*10*64/4;
            item.aniNode &&  item.aniNode.action.play('run',true);
            var time = G.frame.sailongzhou_slz.getMaxlzTime();
            var distance = initvel*time;
            var posx = item.x + distance;
            this.runActions([
                cc.moveTo(time, cc.p(posx, item.y)),
                cc.callFunc (function () {
                    G.frame.sailongzhou_slz.isUpdate = true;
                }),
            ]);
        };
        item.move = function () {
            var _data = this.data;
            item.aniNode &&  item.aniNode.action.play('run',true);
            var rank = {
                '1':90,
                '2':85,
                '3':80,
                '4':75,
            }
            var distance = G.frame.sailongzhou_slz.nodes.img_zd.convertToWorldSpace().x - item.convertToWorldSpace().x;
            var basespeed = rank[_data.rank];
            var time = parseInt(distance/basespeed);
            this.runActions([
                cc.moveTo(time, cc.p(item.x+distance, item.y)),
            ]);
        };
        item.setTouchEnabled(true);
        item.click(function (sender,type) {
            if (G.frame.sailongzhou_slz.timeType != "djs"){
                return;
            }
            if (G.frame.sailongzhou_slz.selectItem){
                G.frame.sailongzhou_slz.selectItem.aniNode.nodes.panel_chuan.setBackGroundImage('img/duanwujie/chuan'+G.frame.sailongzhou_slz.selectItem.id+'.png',1);
            }
            sender.aniNode.nodes.panel_chuan.setBackGroundImage('img/duanwu/img_lz'+sender.id+'_h.png',1);
            G.frame.sailongzhou_slz.selectItem = sender;
            G.frame.sailongzhou_slz.setBottom(sender.id);
        });
        return item;
    }
})();