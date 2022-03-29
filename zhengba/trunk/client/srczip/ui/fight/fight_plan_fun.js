(function (){
    G.class.plan_role = ccui.Layout.extend({
        ctor : function(data, pos, side, noAni, noImg) {
            var me = this;
            this._super.apply(this, arguments);
            this.pos = pos;
            this.side = side;
            this.data = data;
            this.posConf = JSON.parse(JSON.stringify(G.gc.posConf["side" + side + "pos" + pos]));
            this.isClone = noImg != undefined;
            this.initThis(noImg);
            this.restPos();
            data && me.showRole(noAni);
            return this;
        },
        initThis: function(noImg) {
            var me = this;

            me.setContentSize(80, 110);
            me.setAnchorPoint(0.5, 0.5);

            if (noImg) return;
            var posImg = me.posImg = new ccui.ImageView("img/zhandou/img_wztx" + me.pos + ".png", 1);
            //.hide();
            posImg.setAnchorPoint(0.5, 0.5);
            posImg.setPosition(me.width / 2, 0);
            me.addChild(posImg);
        },
        initAni: function (callback) {
            var me = this;
            if (this.side != 0) return callback();
            callback && callback();
        },
        ani_norm: function () {

            if (!this.ani) return;
            if (!this.data) return;
            if (!this.aniNorm) {
                this.aniNorm = true;
                this.aniRun = false;
            }
        },
        ani_run: function () {

            if (!this.ani) return;
            if (!this.data) return;
            if (!this.aniRun) {
                this.aniNorm = false;
                this.aniRun = true;
            }
        },
        ani_hide: function () {

            if (!this.ani) return;
            this.aniRun = false;
            this.aniNorm = false;
        },
        showRole : function(noAni, idx) {
            var me = this;
            var data = this.data;

            if (!data) {
                me.removeRole();
                return;
            }
            cc.isNode(me.infoUi) && me.infoUi.removeFromParent();
            if (!this.isClone && me.side == 0) {
                var infoUi = me.infoUi = G.frame.juedoushengdian_fightplan.nodes.zz_xx.clone();
                X.autoInitUI(infoUi);
                infoUi.show();
                infoUi.zIndex = 999;
                infoUi.setPosition(me.width / 2, 0);
                me.addChild(infoUi);
                X.render({
                    wz_11: function (node) {
                        node.setString('lv.300');
                    },
                    zz: function (node) {
                        var zhongzu = data.zhongzu != undefined ? data.zhongzu : G.gc.hero[data.hid].zhongzu;
                        node.removeBackGroundImage();
                        if (zhongzu == 7){
                            node.setBackGroundImage('img/public/ico/ico_zz11_s.png', 1);
                        }else {
                            node.setBackGroundImage('img/public/ico/ico_zz' + (zhongzu + 1) + '_s.png', 1);
                        }

                    },
                }, infoUi.nodes);
            }

            this.addColorAni(false);
            if (me.role) me.role.removeFromParent();

            this.posImg && this.posImg.hide();
            if(G.frame.juedoushengdian_main.DATA.myinfo.skin[data.hid]){
                var model = G.frame.juedoushengdian_main.DATA.myinfo.skin[data.hid];
            }else {
                var model = data.tenstarmodel || data.hero || G.class.hero.getModel(data);
            }
            X.spine.show({
                json:'spine/'+ model +'.json',
                addTo : me,
                noRemove: true,
                cache: true, x: me.width / 2, y:0, z:0,
                autoRemove:false,
                onload : function(node){
                    me.role = node;
                    node.setVisible(false);
                    node.stopAllAni();
                    node.setTimeScale(1);
                    node.opacity = 255;
                    node.runAni(0,'wait',true);
                    node.setScale(1);
                    node.setVisible(true);
                    me.loadRoleOver(node);
                    me.ani_norm();

                    if (!noAni) {

                    }

                }
            });
            this.addColorAni(true);
        },
        addColorAni: function (bool) {
            var me = this;
            return null;
            if (bool) {
                var json = '';
                var color = me.data.color ? me.data.color : G.gc.hero[me.data.hid].color;
                var colorJson = {
                    0: 'bai',
                    1: 'lv',
                    2: 'lan',
                    3: 'zi',
                    4: 'cheng',
                    5: 'hong'
                };
                if (me.data.star >= 11) json = 'jin';
                else json = colorJson[color];
                G.class.ani.show({
                    json: "beizhan_bushu_" + json + "_dh",
                    addTo: me,
                    x: me.width / 2,
                    y: 0,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.zIndex = -1;
                        me.colorAni = node;
                    }
                });
            } else {
                cc.isNode(me.colorAni) && me.colorAni.removeFromParent();
                delete me.colorAni;
            }
        },
        status: function (status) {
            var me = this;
        },
        loadRoleOver: function (node) {
            var data = this.data;
            if (!data) return;
            node.scale = 0.65;
            node.scale *= this.posConf.s;
            if (data.enlargepro) {
                node.scaleX *= data.enlargepro;
                node.scaleY *= data.enlargepro;
            }
            node.scaleX *= (this.side == 1? (this.zm ? 1 : -1) : 1);
        },
        restPos: function () {
            this.x = this.posConf.x;
            this.y = this.posConf.y;
            this.zIndex = this.posConf.z;
        },
        removeRole: function () {
            this.ani_hide();
            this.addColorAni(false);
            this.posImg.show();
            cc.isNode(this.role) && this.role.removeFromParent();
            delete this.role;
            cc.isNode(this.infoUi) && this.infoUi.removeFromParent();
            delete this.infoUi;
        }
    })
})();