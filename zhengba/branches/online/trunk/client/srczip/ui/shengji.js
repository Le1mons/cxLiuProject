/**
 * Created by zhangming on 2018-01-24
 */
(function () {
    //升级
    var ID = 'shengji';

    G.event.on('playerLvup', function (data) {
        // if (data.lv == 2 || data.lv == 4)return;
        // G.interceptor.dispatch(data.code, 'shengji', function () {
            if (G.frame.shengji.isShow) {
                G.frame.shengji.hide();
            }
            //刷新等级
            G.view.toper.updateData();
            // G.frame.shengji.data(data).show();
        // });

    });
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;

            me._super(json, id, {action:true});
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;

            if (data) {
                me.ui.render({
                    txt_1_1:data.olv, // 玩家等级
                    txt_1_2:data.lv,

                    txt_2_1:data.olv, // 兵种等级上限
                    txt_2_2:data.lv,

                    txt_3_1:G.DAO.zhuangbei.getMaxQhLv(data.olv), // 军备强化上限值
                    txt_3_2:G.DAO.zhuangbei.getMaxQhLv(data.lv),
                });
            }

            var conf = G.class.shengji.get();
            // var key = data.lv+1;
            var list = [];
            //var a;
            //往前推
            if (data.lv - data.olv > 1) {
                for (var okey = data.lv; okey > data.olv; okey--) {
                    if (!conf[okey]) continue;
                    for (var m = 0; m < conf[okey].length; m++) {
                        if (conf[okey] && conf[okey][m].name) {
                            var b = {};
                            b['lv'] = okey;
                            b['conf'] = conf[okey][m];
                            list.push(b);
                            if (list.length == 2) {
                                break;
                            }
                        }
                    }
                    if(list.length==2){
                        break;
                    }
                }
            }
            var key;
            if(list.length==0){
                key = data.lv;
            }else{
                key = data.lv+1;
            }
            while (list.length < 3) {
                if (key >= Object.keys(conf).length) {
                    break;
                }
                for (var k = 0; k < conf[key].length; k++) {
                    if (conf[key] && conf[key][k].name) {
                        var a = {};
                        a['lv'] = key;
                        a['conf'] = conf[key][k];
                        list.push(a);
                        if(list.length==3){
                            break;
                        }
                    }
                }
                key++;
            }
            if (list.length == 0) {
                // me.ui.finds('img_wf').show();
            } else {
                list.sort(function(a,b){
                    return a['lv']-b['lv'];
                });

                var listView = me.ui.nodes.listview;
                listView.setScrollBarEnabled && listView.setScrollBarEnabled(false);
                listView.removeAllItems();

                for (var j = 0; j < list.length; j++) {
                    var item = me.ui.nodes.list.clone();
                    X.autoInitUI(item);

                    item.nodes.txt_name.setString(list[j]['conf']['name']);
                    item.nodes.txt_ms.setString(list[j]['conf']['intr']);

                    if (list[j].lv <= data.lv) {
                        // item.finds('ico').loadTexture('img/gxsj/img_xgn.png', ccui.Widget.PLIST_TEXTURE); // 新功能
                        item.nodes.wz_gongxishengji_ykq.show();
                        item.nodes.txt_wkq.hide();
                    } else {
                        // item.finds('ico').loadTexture('img/gxsj/img_jjkq.png', ccui.Widget.PLIST_TEXTURE); // 即将开启
                        item.nodes.wz_gongxishengji_ykq.hide();
                        item.nodes.txt_wkq.show();
                        item.nodes.txt_wkq.setString(X.STR(L('NJKQ'), list[j]['lv']));
                    }
                    item.show();
                    listView.pushBackCustomItem(item);
                }
            }

            me.ui.setTimeout(function () {
                me.removeMe();
            }, 3000);
            X.audio.playEffect('sound/shengji.mp3', false);
        },
        removeMe: function(){
            var me = this;

            // me.action.playWithCallback('out', false, function () {
                me.ui.nodes.listview.removeAllItems();
                me.remove();
            // });
        },
        bindUI: function () {
            var me = this;
            me.ui.nodes.mask.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    me.removeMe();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.action.playWithCallback('in', false, function () {
                me.action.play('wait', true);
            });
            // G.class.ani.show({
            //     addTo: me.dh,
            //     json: 'dh_gxsj',
            //     x: me.dh.width / 2,
            //     y: me.dh.height / 2,
            //     repeat: false,
            //     cache:false,
            //     autoRemove: false
            // });

            me.DATA = me.data();
            me.setContents();

            me.ui.zIndex = 9999998;
        },
        onRemove: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('gongxishengji.json', ID);
})();