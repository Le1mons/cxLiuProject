/**
 * Created by LYF on 2018/9/13.
 */
(function () {
    //神器
    var ID = 'shenqi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes = ['gonghui.plist', 'gonghui.png'];
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.sethui();
            me.nodes.list1.finds("p1").setEnabled(true);

        },
        sethui: function() {
            var me = this;
            var num = P.gud.artifact || 0;

            for(var i = 1; i < 6; i ++) {
                if(num >= i - 1) {
                    me.nodes["list" + i].show();
                    me.ui.finds("hui_" + i).hide();
                }else {
                    me.nodes["list" + i].hide();
                    me.ui.finds("hui_" + i).show()
                }
            }
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('artifact_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    G.DATA.shenqi = d.d;
                    G.DATA.artifact = d.d.artifact;
                    callback && callback();
                }
            }, true);
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.action.playWithCallback("animation0", false, function () {
                me.setContents();
                me.checkRedPoint();
                me.ui.setTimeout(function () {
                    G.guidevent.emit("tulongzhiluOpenOver");
                }, 300)
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            function setBtn(target, data, idx) {
                if(idx == 1) G.frame.shenqi.nodes.btn_hmzr = target;
                target.setBright(data ? false : true);
                target.idx = idx;
                target.click(function (sender) {
                    if(!data) {
                        G.tip_NB.show(L("SQ_QXWC"));
                        return;
                    }
                    if(G.guide.view){
                        G.frame.shenqi_info.data({
                            id: idx,
                            artifact: data,
                        }).show();
                    }else if(G.frame.shenqi_info.curId && G.frame.shenqi_info.curId != idx){
                        G.frame.shenqi_info.data({
                            id: sender.idx,
                            artifact: data,
                        }).show();
                    }
                    me.remove();
                })
            }

            for(var i = 1; i < 6; i ++) {
                setBtn(me.nodes["list" + i].finds("p1"), me.DATA.artifact[i], i);
            }
        },
        checkRedPoint: function() {
            var me = this;
            var isHave = false;

            for(var i = 0; i < 6; i ++) {
                G.removeNewIco(me.nodes["list" + i]);
            }

            var idx = X.keysOfObject(me.DATA.artifact).length;
            var task = G.class.shenqi.getTaskById(idx);

            for(var i in me.DATA.task) {
                if(me.DATA.task[i].val >= task[i].val && me.DATA.task[i].finish < idx) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
                G.setNewIcoImg(me.nodes["list" + idx]);
                me.nodes["list" + idx].getChildByName("redPoint").setPosition(idx % 2 == 0 ? {x: 500, y: 140} : {x: 300, y: 140});
            }
        },
        checkShow: function () {
            var me = this;
            if(G.guide && G.guide.view && !P.gud.artifact){
                me.show();
            }else if(!P.gud.artifact || P.gud.artifact < 5){
                me.getData(function(){
                    G.frame.shenqi_info.data({
                        id: P.gud.artifact ? P.gud.artifact + 1 : 1,
                        artifact: me.DATA.artifact[P.gud.artifact],
                    }).show();
                });
            }else if(P.gud.artifact && P.gud.artifact >= 5){
                 G.frame.shenqi_list.show();
            }
        }
    });
    G.frame[ID] = new fun('shenbing.json', ID);
})();