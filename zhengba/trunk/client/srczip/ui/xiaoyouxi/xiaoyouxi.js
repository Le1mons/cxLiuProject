/**
 * Created by
 */
(function () {
    //
    var ID = 'xiaoyouxi';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.listArr = [];
            var key =['xiaoyouxi'];
            var conf = G.gc.xyx;
            var txt="";
            if (me.DATA['jsmz'].act == 1 || me.DATA['jsmz'].stime >= G.time){
                key.push('jsmz');
            }
            if(me.DATA['jssl'].etime>=G.time){
                key.push('jssl');
            }

            (function create(index) {
                if (index > key.length) return null;
                var list = me.nodes.list.clone();
                list.show();
                X.autoInitUI(list);
                me.nodes.listview.pushBackCustomItem(list);
                me.listArr.push(list);
                if(key[index]=='jsmz'){
                    list.nodes.btn_list.loadTextureNormal('img/jianshengtulong/img_jstl3.png', 1);
                    if(me.DATA['jsmz'].stime>=G.time){
                        list.nodes.text_1.setString(L("JSMZ") + "(" + L('WKQ') + ")");
                        var str = Math.ceil((me.DATA['jsmz'].stime - G.time) / (3600 * 24)) + "天后开启";
                        list.nodes.btn_list.click(function () {
                            G.tip_NB.show(str);
                        });
                    }else{
                        list.nodes.text_1.setString(L("JSMZ"));
                        list.nodes.btn_list.click(function(){
                            G.frame.huodong.data({
                                type: 1,
                                stype:10052
                            }).show();
                        })
                    }

                }else if(key[index]=='jssl'){
                    if(me.DATA['jssl'].stime>=G.time){
                      list.nodes.text_1.setString(L("JSSL") + "(" + L('WKQ') + ")");
                      
               
                      var str = Math.ceil((me.DATA['jssl'].stime - G.time) / (3600 * 24)) + "天后开启";
                      list.nodes.btn_list.click(function () {
                          G.tip_NB.show(str);
                      });

                    }else{
                        list.nodes.text_1.setString(L("JSSL"));
                        list.nodes.btn_list.click(function () {
                            G.frame.huodong.data({
                                type: 1,
                                stype:10050
                            }).show();
                        });
                    }
                    list.nodes.btn_list.loadTextureNormal('img/jianshengtulong/img_jstl2.png', 1);

                }else if(key[index]=='xiaoyouxi'){
                    var _conf = conf[0];
                    if (_conf) {
                        list.nodes.btn_list.setZoomScale(0.02);
                        list.refresh = function () {
                            list.nodes.text_1.setString(_conf.name + '(' + me.DATA['xiaoyouxi'][0].length + '/' + _conf.level.length + ')');
                        };

                        list.nodes.btn_list.click(function () {
                            if (_conf.type == 'jstl') {
                                G.frame.jstl_level.show();
                            }
                        });
                        list.checkRedPoint = function () {
                            var isHave = false;
                            for (var i = 0; i < _conf.level.length; i ++) {
                                var con = _conf.level[i];
                                if (P.gud.maxmapid - 1 >= con.cond[0] && !X.inArray(me.DATA['xiaoyouxi'][0], i)) {
                                    isHave = true;
                                    break;
                                }
                            }
                            if (isHave) {
                                G.setNewIcoImg(list);
                                list.redPoint.setPosition(523, 204);
                            } else {
                                G.removeNewIco(list);
                            }
                        };
                    }
                } else {
                    list.nodes.btn_list.setTouchEnabled(false);
                    list.nodes.btn_list.loadTextureNormal('img/jianshengtulong/img_zw.png', 1);
                }
                index ++;
                create(index);
            })(0);
        },
        getData: function (type, callback) {
            var me = this;

            me.ajax('xiaoyouxi_open', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(null, function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        setContents: function () {
            var me = this;

            cc.each(me.listArr, function (list) {
                list.refresh && list.refresh();
                list.checkRedPoint && list.checkRedPoint();
            });
        }
    });
    G.frame[ID] = new fun('jianshengtulong.json', ID);
})();