function bug() {
    var txt = "\n====================\n\nBUG描述：\n服务器名：" + G._SERVERNAME + "\n";
    txt += "API地址：" + G._API + "\n";
    if (P && P.gud) {
        txt += "账号：" + P.gud.binduid + "\n";
        txt += "uid：" + P.gud.uid + "\n";
        txt += "角色名：" + P.gud.name + "\n";
        txt += "P：" + JSON.stringify(P) + "\n";
    }
    txt += "\n\n==============================\n";
    console.log(txt);
}

//按组别平均显示scrollview的子坐标
//{rownum:一行显示多少个,type:'fill||avg' 铺满还是平均}
ccui.ScrollView.prototype.setAutoChildrenPosByGroup = function(c) {
    if (!c.group) {
        return this.setAutoChildrenPos(c);
    }

    var me = this;
    var w = me.width; //总宽度

    if (cc.sys.isObjectValid(me.groupUIList) && me.groupUIList.length > 0) {
        for (var i in me.groupUIList) {
            me.groupUIList[i].removeFromParent();
        }
    }

    var children = me.getChildren();
    if (children.length == 0) 
        return;
    
    if (c.order) 
        children.sort(c.order);
    
    var cw = children[0].width,
        ch = children[0].height; //子元素尺寸

    var type = c.type || 'fill';
    var maxrow = 1;
    var _g = null,
        _n = 0,
        _gh = 0;
    for (var i in children) {
        if (_g != children[i].group) {
            _g = children[i].group;
            maxrow += Math.ceil(_n / c.rownum);
            _n = 1;
            _gh += c.groupUIHeight;
        } else {
            _n++;
        }
    }

    var lineheight = c.lineheight || ch;

    var innerHeight = me.height;
    if (innerHeight < maxrow * lineheight + _gh) 
        innerHeight = maxrow * lineheight + _gh;
    me.innerHeight = innerHeight;

    var _lineidx = 0;
    var _anchor = C.ANCHOR[1];
    var len = children.length;
    //分组时
    var groupType = null,
        groupHeight = 0,
        idx = 0;
    for (var i = 0; i < len; i++) {

        if (groupType != children[i].group) {
            if (idx > 0) {
                _lineidx++;
            }
            groupType = children[i].group;
            var label = c.groupUI(c.group[groupType]);
            label.setAnchorPoint(_anchor);
            label.x = 0;
            label.y = innerHeight - _lineidx * lineheight - groupHeight;
            me.addChild(label);
            me.groupUIList = me.groupUIList || [];
            me.groupUIList.push(label);
            groupHeight += c.groupUIHeight;
            idx = 0;
        }

        if (type == 'fill') {
            //填充满
            var sw = (w - cw) / (c.rownum - 1);
            children[i].x = idx * sw;
        } else if (type == 'avg') {
            //平均排布
            var margin = w - cw * c.rownum,
                smargin = margin / (c.rownum + 1);
            children[i].x = idx * cw + smargin * (idx + 1);
        }
        children[i].setAnchorPoint(_anchor);
        children[i].y = innerHeight - _lineidx * lineheight - groupHeight;
        idx++;
        if (idx == c.rownum) {
            idx = 0;
            _lineidx++;
        }
    }
};

X.posTo = function(a, b, d) {
    var angle = cc.pToAngle(cc.pSub(b, a));
    return cc.p(b.x - d * Math.cos(angle), b.y - d * Math.sin(angle));
};

G.class.touchsound = function() {
    X.audio.playEffect('sound/touch.mp3', false);
};

function num2str(num) {
    if (num == 0) 
        return '';
    if (num > 0) 
        return ' +' + num;
    else 
        return L('XIAOHAO') + '' + Math.abs(num);
    }

/*
{
    json:'xxx.json',
    addTo:node,
    x:
    y:
    z:
    repeat:true||false
    onend : fucntion(node,action){},
    onkey : function(node, this, e.getEvent()){},
    onload : fucntion(node,action){},
    uniqueid:string, addTo下只会存在一个uniqueid的ani
}
* */

G.class.ani = {
    show: function(conf) {
        //动画缓存
        var me = this;
        conf = conf || {};
        conf.action = true;
        if (conf.autoFillSize == null) 
            conf.autoFillSize = false;
        if (conf.autoRemove == null) 
            conf.autoRemove = true;
        
        if (conf.cache) {
            var view = X.viewCache.getView(conf.json + '.json', function(view) {
                return me._created(view, conf);
            }, conf);
        } else {
            var view = new X.bView(conf.json + '.json', function(view) {
                return me._created(view, conf);
            }, conf);
        }
    },
    _created: function(node, conf) {
        var _parentSize;

        if (!conf.addTo) {
            conf.addTo = cc.director.getRunningScene();
            _parentSize = cc.director.getWinSize();
        } else {
            _parentSize = conf.addTo.getContentSize();
        }

        var _winSize = cc.director.getWinSize();
        node.x = conf.x != null
            ? conf.x
            : _parentSize.width / 2;
        node.y = conf.y != null
            ? conf.y
            : _parentSize.height / 2;
        node.zIndex = conf.z != null
            ? conf.z
            : 100;

        node.action.setLastFrameCallFunc(function() {
            this.clearLastFrameCallFunc();
            conf.onend && conf.onend(node, node.action);
            conf.autoRemove && node.removeFromParent();
        });

        node.action.setFrameEventCallFunc(function(e) {
            if (e.getEvent().length > 0) {
                conf.onkey && conf.onkey(node, this, e.getEvent());
            }
        });
        node.action.gotoFrameAndPlay(0, conf.repeat || false);

        delete node.onRemove;
        if (conf.uniqueid) {
            var _uniKey = '__classAni_' + conf.uniqueid;
            node.onRemove = function() {
                delete conf.addTo[_uniKey];
            };
            cc.isNode(conf.addTo[_uniKey]) && conf.addTo[_uniKey].removeFromParent();
            conf.addTo[_uniKey] = node;
        }

        node.setOpacity = function (opacity) {
            var t = this;

            var _fun = function (nd) {
                if (!nd.getChildren || nd.getChildren().length < 1) {
                    nd.setOpacity && nd.setOpacity(opacity);
                    return ;
                }

                var children = nd.getChildren();
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (!child.getChildren || child.getChildren().length < 1) {
                        child.setOpacity && child.setOpacity(opacity);
                    } else {
                        _fun(child);
                    }
                }
            };
            
            _fun(t);
        };

        conf.addTo.addChild(node);
        conf.onload && conf.onload(node, node.action);
        return node;
    }
};

//过场动画
G.class.transition = {
    _node: null,
    show: function(callback) {
        var me = this;
        if (cc.isNode(me._node)) {
            return;
        }
        G.class.ani.show({
            json: 'tiaozhuandh',
            cache: true,
            autoRemove: true,
            z: 999999,
            onload: function(node, action) {
                me._node = node;
                action.playWithCallback('in', false, function() {
                    callback && callback();
                });
            }
        })
    },
    hide: function() {
        var me = this;
        if (cc.isNode(me._node)) {
            me._node.action.playWithCallback('out', false, function() {
                me._node.runAction(cc.removeSelf());
                delete me._node;
            });
        }
    }
};

ccui.Button.prototype.setEnableState = function(v) {
    this.setEnabled(v);
    this.setBright(v);
    // this.setTitleColor(C.color(G.gc.COLOR[v?0:10]));
};

/**
 * 设置文字内容和颜色
 * @param target 文本ui
 * @param text 文字内容
 * @param color 文字颜色
 * @param targetClass ui类,label/button
 */
function setTextWithColor(target, text, color, targetClass) {
    targetClass = targetClass
        ? targetClass.toLowerCase()
        : 'label';
    if (targetClass == 'label') {
        target.setString(text);
        target.setTextColor(cc.color(color));
    } else if (targetClass == 'button') {
        target.setTitleText(text);
        target.setTitleColor(cc.color(color));
    }
}

function setPanelTitle(target, text, color) {
    if (target instanceof ccui.Layout) {
        var rt = new X.bRichText({
            size: 24,
            lineHeight: 24,
            color: color || '#FFE8C0',
            maxWidth: target.width,
            family: G.defaultFNT
        });
        rt.text(text);
        rt.setAnchorPoint(0, 1);
        rt.setPosition(cc.p((target.width - rt.trueWidth()) * 0.5, target.height));
        target.removeAllChildren();
        target.addChild(rt);
    } else if (target instanceof ccui.Text) {
        target.setString(text);
        if (color) {
            target.setTextColor(cc.color(color));
        }
    }
}

//data {}
X.isHavItem = function(data) {
    if (data == null) 
        return false;
    return (Object.keys(data)).length > 0;

    /*
    var keys = X.keysOfObject(data);
    if (keys.length === 0) {
        return false;
    } else {
        return true;
    }*/
};
//格式化大数值
X.fmtValue = function(data, fix) {
    var str = '';
    data = parseInt(data);

    if(data < 100000) {
        str = data;
    } else if(data < 100000000) {
        str = (data / 10000).toFixed(1) + L("w");
    } else {
        str = (data / 100000000).toFixed(2) + L("YI");
    }

    return str;
};

//格式化大数值_之前的方法大于1亿会四舍五入
X.fmtValue_new = function(data, fix) {
    var str = '';
    data = parseInt(data);

    if(data < 100000) {
        str = data;
    } else if(data < 100000000) {
        str = (data / 10000).toFixed(1) + L("w");
    } else {
        str = (data / 100000000).toFixed(2) + L("YI");
    }

    return str;
};


function changeData(nd, od, notAdd) {
    for (var k in nd) {
        if (od[k] != undefined || !notAdd) {
            var d = nd[k];
            if (X.instanceOf(d, 'Array')) {
                od[k] = d;
            } else if (X.instanceOf(d, 'Object')) {
                od[k] = od[k] || {};
                changeData(d, od[k]);
            } else {
                od[k] = d;
            }
        }
    }
}

function averageOfArray(array) {
    var sum = 0;
    for (var i in array) {
        sum += array[i];
    }
    return sum / array.length;
}

//最小
function minOfArray(array) {
    /*var min = array[0];
    for (var i = 1; i < array.length; i++) {
        if (min > array[i]) {
            min = array[i];
        }
    }
    return min;*/
    return Math.min.apply(Math.min, array);
}

//最大
function maxOfArray(array) {
    /*var max = array[0];
    for (var i = 1; i < array.length; i++) {
        if (max < array[i]) {
            max = array[i];
        }
    }
    return max;*/
    return Math.max.apply(Math.max, array);
}

//对JSON数据按指定的key排序
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return (
            (x < y)
            ? -1
            : (
                (x > y)
                ? 1
                : 0));
    });
}

X.setRichText = function(arg) {
    var str = arg.str;
    var parent = arg.parent;
    var node = arg.node;
    var anchor = arg.anchor;
    var pos = arg.pos;
    var size = arg.size;
    var color = arg.color;
    var outline = arg.outline;

    var rh = new X.bRichText({
        size: size || 18,
        maxWidth: parent.width,
        lineHeight: 22,
        color: color || "#804326",
        family: G.defaultFNT,
        eachText: function (node) {
            outline && X.enableOutline(node, outline, 1);
        }
    });
    if(node) rh.text(str, [node]);
    else rh.text(str);
    rh.setAnchorPoint(anchor);
    rh.setPosition(pos);
    parent.removeAllChildren();
    parent.addChild(rh);
};

X.setModel = function(args) {
    var parent = args.parent;
    var data = args.data;
    var scale = args.scale || 1;
    var callback = args.callback;
    var direction = args.direction;
    var model = data.hid;

    if(model.split("_").length > 1) {
        var str = model.split("_")[0];
        str[str.length - 1] = 'a';
        model = str;
    }


    if(!cc.isNode(parent))return;
    parent.removeAllChildren();

    X.spine.show({
        json: 'spine/' + model + '.json',
        addTo: parent,
        cache: true,
        x: parent.width / 2,
        y: 0,
        z: 0,
        autoRemove: false,
        rid: data.rid,
        onload: function (node) {
            node.stopAllAni();
            node.setTimeScale(1);
            node.opacity = 255;
            node.setScale(scale);
            node.runAni(0, "wait", true);
            if(direction) node.setScaleX(direction);
            callback && callback(node);
        }
    })
};

//设置英雄动画或者img
X.setHeroModel = function(args) {
    var parent = args.parent;
    var data = args.data;
    var scaleNum = args.scaleNum || 1;
    var callback = args.callback;
    var noParentRemove = args.noParentRemove;
    var direction = args.direction;

    if (!parent || !data) {
        return;
    }

    if (!noParentRemove) {
        parent.removeAllChildren();
    }

    //显示图片或者动画
    // console.log('请在这里设置造型======', 1);

    var model = args.model || G.class.hero.getModel(data);
    console.log('此模型id为======', model);
    X.spine.show({
        json:'spine/'+ model +'.json',
        // json:'spine/'+ 41066 +'.json',
        addTo : parent,
        cache:true,
        x:parent.width / 2,
        y:0,
        z:0,
        autoRemove:false,
        rid : data.rid,
        onload : function(node){
			node.stopAllAni();
			node.setTimeScale(1);
			node.opacity = 255;
            node.setScale(scaleNum);

            node.runAni(0, "wait", true);
            node.rid = data.rid;
            node.parent = parent;
            if(direction) node.setScaleX(direction);
            callback && callback(node);
        }
    });
    // new G.class.armyAni('hero', data.hid, data.level || 1, 'z', function(node) {
    //     if (scaleNum != null && scaleNum != 1) {
    //         node.scale = scaleNum;
    //     }
    //     node.setAnchorPoint(0.5, 0);
    //     node.setPosition(data.position || cc.p(parent.getContentSize().width / 2, 0));
    //     parent.addChild(node);
    //     node.byatk();
    //     callback && callback();
    // });
};

X.testModel = function (model) {

    var scene = cc.director.getRunningScene();

    while (scene.getChildByTag(20180629)) {
        scene.getChildByTag(20180629).removeFromParent();
    }

    console.log('此模型id为======', model);
    X.spine.show({
        json:'spine/'+ model +'.json',
        // json:'spine/'+ 41066 +'.json',
        addTo : scene,
        cache:true,
        x:scene.width / 2,
        y:scene.height / 2,
        z:0,
        autoRemove:false,
        rid : 1,
        onload : function(node){
            node.runAni(0, "wait", true);
            node.setTag(20180629);
        }
    });
};

X.playSpine = function(name, parent, pos, callback) {
    X.spine.show({
        json: 'spine/' + name + '.json',
        addTo: parent,
        cache: true,
        x: pos.x,
        y: pos.y,
        z: 0,
        autoRemove: false,
        onload: function (node) {
            node.stopAllAni();
            node.setTimeScale(1);
            node.opacity = 255;
            node.setScale(1);
            callback && callback(node);
            // node.runAni(0, "baoxiang_daiji", false);
            // node.setCompleteListener(function () {
            //     G.frame.jiangli.once("hide", function () {
            //         node.removeFromParent();
            //         me.playAni(function () {
            //             target.show();
            //             me.ui.finds("ico_qizi").show();
            //             me.ui.finds("btn_an").show();
            //         });
            //         me.zz.hide();
            //     }).data({
            //         prize: winPrize.val
            //     }).show();
            // })
        }
    })
};

//加载粒子动画
X.loadParticle = function(ui, json, callback) {
    X.ccui(json, function(loader) {
        var node = loader.node,
            action = loader.action;

        node.setPosition(cc.p(ui.width / 2, ui.height / 2));
        ui.removeAllChildren();
        ui.addChild(node);
        node.runAction(loader.action);
        action.gotoFrameAndPlay(0, true);

        callback && callback();
    });
};

//add
//G.tip_NB.show(X.createPrizeInfo({a:'attr',t:'jinbi',n:700},0,1))
//plus
//G.tip_NB.show(X.createPrizeInfo({a:'attr',t:'jinbi',n:700},0,5))
X.createPrizeInfo = function(prize, type, color) {

    if (color == 5) {
        return X.createPrizeInfo2(prize, type, color);
    }

    var tips = [];
    var prizeInfo = [];
    prize = [].concat(prize);
    for (var i in prize) {
        var p = prize[i];

        if (p.n == 0) 
            continue;
        
        if (p.a == 'attr') {
            prizeInfo.push({
                n: G.class.attricon.getById(p.t).name,
                c: p.c || G.class.attricon.getById(p.t).color || 0,
                v: Math.floor(p.n),
                p: p
            });
        } else if (p.a == 'item') {
            var c = G.class.getItem(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.color || p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'equip') {
            var c = G.class.equip.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'hero') {
            var c = G.class.hero.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'baowu') {
            var c = G.class.baowu.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'baoshi') {
            var c = G.class.baoshi.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'shipin') {
            var c = G.class.shipin.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'hunshi') {
            var c = G.class.hunshi.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
    }
    while (prizeInfo.length > 0) {
        var prizeItem = prizeInfo.shift();
        var str = '';
        var color = '#ffffff';
        switch (prizeItem.p.a) {
            case 'attr':
                break;
            case 'item':
                var con = G.class.getItem(prizeItem.p.t);
                if (con.showtype == 9) {
                    str += color + '|' + L('HUODE') + L('SUIPIAN') + ',';
                } else if (X.inArray(con.arg, 'fuwen')) {
                    str += color + '|' + L('HUODE') + L('FUWEN') + ',';
                } else {
                    str += color + '|' + L('HUODE') + L('DAOJU') + ',';
                }
                break;
            case 'hero':
                str += color + '|' + L('HUODE') + L('YONGBING') + ',';
                break;
            case 'equip':
                var con = G.class.equip.getById(prizeItem.p.t);
                if (con.etype == 0) {
                    str += color + '|' + L('HUODE') + L('SUIPIAN') + ',';
                } else {
                    str += color + '|' + L('HUODE') + L('zhuangbei') + ',';
                }
                break;
            case 'baowu':
                var con = G.class.baowu.getById(prizeItem.p.t);
                str += color + '|' + L('HUODE') + L('BAOWU') + ',';
                break;
            case 'baoshi':
                var con = G.class.baoshi.getById(prizeItem.p.t);
                str += color + '|' + L('HUODE') + L('BAOSHI') + ',';
                break;
            case 'shipin':
                var con = G.class.shipin.getById(prizeItem.p.t);
                str += color + '|' + L('HUODE') + L('SHIPIN') + ',';
                break;
            default:
                break;
        }
        if (type) {
            str += (
                prizeItem.p.a != 'attr'
                ? '['
                : '') + prizeItem.n;
        } else {
            str += (G.gc.COLOR[prizeItem.c] || G.gc.COLOR[1]) + '|' + (
                prizeItem.p.a != 'attr'
                ? '['
                : '') + prizeItem.n;
        }
        if (prizeItem.p.a != 'attr') {
            if (type != 2) {
                str += '+';
            }
            str += prizeItem.v + ']';
        } else {
            if (prizeItem.c == 5) {
                str += '-' + Math.abs(prizeItem.v);
            } else {
                if (prizeItem.v >= 0 || type) {
                    str += '+' + prizeItem.v;
                }
            }
        }
        tips.push(str);
    }
    return tips;
};
X.createPrizeInfo2 = function(prize, type, color) {
    // TODO
    // alert('该方法需要废弃，和 X.createPrizeInfo 统一规划并重写');

    var tips = [];
    var prizeInfo = [];
    prize = [].concat(prize);
    for (var i in prize) {
        var p = prize[i];

        if (p.n == 0) 
            continue;
        
        if (p.a == 'attr') {
            prizeInfo.push({
                n: G.class.attricon.getById(p.t).name,
                c: color || G.class.attricon.getById(p.t).c || 0,
                v: Math.floor(p.n),
                p: p
            });
        } else if (p.a == 'item') {
            var c = G.class.getItem(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.color || p.c || color || c.color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'equip') {
            var c = G.class.equip.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || color || c.color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'hero') {
            var c = G.class.hero.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || color || c.color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'baowu') {
            var c = G.class.baowu.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || color || c.color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'baoshi') {
            var c = G.class.baoshi.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || color || c.color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'shipin') {
            var c = G.class.shipin.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || color || c.color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'hunshi') {
            var c = G.class.hunshi.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || color || c.color || 'hui',
                v: p.n,
                p: p
            });
        }
    }
    while (prizeInfo.length > 0) {
        var prizeItem = prizeInfo.shift();
        var str = '';
        // var color = '#ffffff';
        var col = '#ffffff';
        var hdxh = L(
            color == 5
            ? ''
            : 'HUODE');

        switch (prizeItem.p.a) {
            case 'attr':
                break;
            case 'item':
                var con = G.class.getItem(prizeItem.p.t);
                if (con.showtype == 9) {
                    str += (
                        color == 5
                        ? ''
                        : col + '|' + hdxh + L('SUIPIAN') + ',');
                } else if (X.inArray(con.arg, 'fuwen')) {
                    str += (
                        color == 5
                        ? ''
                        : col + '|' + hdxh + L('FUWEN') + ',');
                } else {
                    str += (
                        color == 5
                        ? ''
                        : col + '|' + hdxh + L('DAOJU') + ',');
                }
                break;
            case 'hero':
                str += (
                    color == 5
                    ? ''
                    : col + '|' + hdxh + L('YONGBING') + ',');
                break;
            case 'equip':
                var con = G.class.equip.getById(prizeItem.p.t);
                if (con.etype == 0) {
                    str += (
                        color == 5
                        ? ''
                        : col + '|' + hdxh + L('SUIPIAN') + ',');
                } else {
                    str += (
                        color == 5
                        ? ''
                        : col + '|' + hdxh + L('zhuangbei') + ',');
                }
                break;
            case 'baowu':
                var con = G.class.baowu.getById(prizeItem.p.t);
                str += (
                    color == 5
                    ? ''
                    : col + '|' + hdxh + L('BAOWU') + ',');
                break;
            case 'baoshi':
                var con = G.class.baoshi.getById(prizeItem.p.t);
                str += (
                    color == 5
                        ? ''
                        : col + '|' + hdxh + L('BAOSHI') + ',');
                break;
            case 'shipin':
                var con = G.class.shipin.getById(prizeItem.p.t);
                str += (
                    color == 5
                        ? ''
                        : col + '|' + hdxh + L('SHIPIN') + ',');
                break;
            default:
                break;
        }

        str += G.gc.COLOR[prizeItem.c] + '|' + '' + prizeItem.n;

        if (color == 5) {
            str += '-' + Math.abs(prizeItem.v);
        } else {
            str += '+' + prizeItem.v;
        }

        tips.push(str);
    }
    return tips;
};

X.createShotPrizeInfo = function(prize, type, color, onlyReturnPrize) {
    // alert('该方法需要废弃，和 X.createPrizeInfo 统一规划并重写');
    var tips = [];
    var prizeInfo = [];
    prize = [].concat(prize);
    for (var i in prize) {
        var p = prize[i];
        if (p.a == 'attr') {
            prizeInfo.push({
                n: G.class.attricon.getById(p.t).name,
                c: color || G.class.attricon.getById(p.t).c || 0,
                v: Math.floor(p.n),
                p: p
            });
        } else if (p.a == 'item') {
            var c = G.class.getItem(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.color || p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'equip') {
            var c = G.class.equip.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'hero') {
            var c = G.class.hero.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        } else if (p.a == 'baowu') {
            var c = G.class.baowu.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'baoshi') {
            var c = G.class.baoshi.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'shipin') {
            var c = G.class.shipin.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
        else if (p.a == 'hunshi') {
            var c = G.class.hunshi.getById(p.t);
            prizeInfo.push({
                n: c.name,
                c: p.c || c.color || color || 'hui',
                v: p.n,
                p: p
            });
        }
    }
    if (onlyReturnPrize) {
        return prizeInfo;
    }
    while (prizeInfo.length > 0) {
        var prizeItem = prizeInfo.shift();
        var str = '';
        if (type) {
            str += prizeItem.n;
        } else {
            str += (G.gc.COLOR[prizeItem.c] || G.gc.COLOR[1]) + '|' + prizeItem.n;
        }
        if (prizeItem.p.a != 'attr') {
            str += '+' + prizeItem.v;
        } else {
            if (prizeItem.c == 5) {
                str += '-' + Math.abs(prizeItem.v);
            } else {
                if (prizeItem.v >= 0 || type) {
                    str += '+' + prizeItem.v;
                }
            }
        }
        tips.push(str);
    }
    return tips;
};

//obj相减
//[2,3,4] - [2,4,6,7] = [3]
X.arraySub = function(from, to) {
    var toStr = ',' + to.join(',') + ',';
    var res = [];
    cc.each(from, function(v, i) {
        if (toStr.indexOf(',' + v + ',') == -1) {
            res.push(v);
        }
    });
    return res;
};
//小兵属性发生变化时，信息提示，o=oldbuff，n=newbuff，
X.showAttrChange = function(o, n) {
    var notShow = [
        'hid',
        'lv',
        'pinzhi',
        'tid',
        'zhanli',
        'qnskill',
        'qnlv'
    ];
    if (o) {
        for (var k in n) {
            if (!X.inArray(notShow, k)) {
                if ((n[k] - o[k]) !== 0) {
                    var str = (
                        n[k] - o[k] > 0
                        ? G.gc.COLOR[1] + '|+'
                        : G.gc.COLOR[5] + '|-') + L('ITEM_ATTR_' + k) + Math.abs(n[k] - o[k]);

                    G.tip_NB.show(str);
                }
            }
        }
    }
};
//红点动画
G.setNewIco = function(target, type, position) {
    if (!target) 
        return;
    if (target.hasNewIcon) 
        G.removeNewIco(target);
    type = type || 0;
    position = position || [
        cc.p(75, 70),
        cc.p(85, 85),
        cc.p(110, 40),
        cc.p(450, 110)
    ][type];

    X.ccui('hdsg.json', function(loader) {
        var node = loader.node;
        node.setPosition(position);
        node.setTag(987654321);
        node.setLocalZOrder(5);
        target.addChild(node, 10000);
        node.runAction(loader.action);
        loader.action.gotoFrameAndPlay(0, true);
    });

    target.hasNewIcon = true;
};
//红点图片
//key = new||full ||q    type = mainbtn 0 || mainmenubtn  1|| 标签  2|| list 3
G.setNewIcoImg = function(target, pos, num) {
    if (!target) return;

    G.removeNewIco(target);
    if(!num){
        var img = new ccui.ImageView("img/public/img_point.png", 1);
        img.setName("redPoint");
        img.setLocalZOrder(5);
        img.setAnchorPoint(0.5, 0.5);
        if(pos){
            img.setPosition(target.width * pos, target.height * pos);
        }else{
            img.setPosition(target.width * 0.75, target.height * 0.75);
        }
        target.addChild(img);
        img.zIndex = 999;
    }else{
        var img = new ccui.ImageView("img/public/img_point1.png", 1);
        img.setName("redPoint");
        img.setLocalZOrder(5);
        img.setAnchorPoint(0.5, 0.5);
        if(pos){
            img.setPosition(target.width * pos, target.height * pos);
        }else{
            img.setPosition(target.width * 0.75, target.height * 0.75);
        }
        target.addChild(img);

        var num = new ccui.Text(num, G.defaultFNT, 14);
        X.enableOutline(num, "#4a1d09", 2);
        num.setTextColor(cc.color("#fff1c9"));
        num.setAnchorPoint(0.5, 0.5);
        num.setPosition(img.width / 2, img.height / 2);
        img.addChild(num);
        img.zIndex = 999;
    }
};
G.removeNewIco = function(target) {
    if (!target) 
        return;

    while (target.finds("redPoint")) {
        target.finds("redPoint").removeFromParent();
    }
};
//箭头动画  可与红点动画同时存在
G.setNewArrow = function(target, type, position) {
    if (!target) 
        return;
    if (target.hasNewArrow) 
        G.removeNewArrow(target);
    type = type || 0;
    position = position || [
        cc.p(75, 70),
        cc.p(85, 85),
        cc.p(110, 40),
        cc.p(450, 110)
    ][type];

    X.ccui('ani_jiantou.json', function(loader) {
        var node = loader.node;
        node.setPosition(position);
        node.setTag(9876543210);
        node.setLocalZOrder(5);
        target.addChild(node, 10000);
        node.runAction(loader.action);
        loader.action.gotoFrameAndPlay(0, true);
    });

    target.hasNewArrow = true;
};
G.removeNewArrow = function(target) {
    if (!target || target.hasNewArrow != true) 
        return;
    var node = target.getChildByTag(9876543210);
    if (node) {
        node.removeFromParent();
        target.hasNewArrow = false;
    }
};
X.splitZbData = function() {
    //装备数据
    var zbData = G.frame.beibao.DATA.zhuangbei.list;
    var spEidConfig = G.class.equip.getZbByStype(0);

    var zbspData = {};
    var zbzbData = {};
    for (var k in zbData) {
        if (X.inArray(spEidConfig, zbData[k].eid)) {
            zbspData[k] = zbData[k];
        } else {
            if (!zbData[k].eid) 
                continue;
            zbzbData[k] = zbData[k];
        }
    }

    G.DATA.zbsp = zbspData;
    G.DATA.zbzb = zbzbData;
};
X.getZbspHdState = function() {

    var zbspData = G.DATA.zbsp;
    var zbspKeys = X.keysOfObject(zbspData);
    for (var j = 0; j < zbspKeys.length; j++) {
        var key = zbspKeys[j];
        var conf = G.class.equip.getById(zbspData[key].eid);
        if (zbspData[key].num >= conf.hcnum) {
            return true;
        }
    }
    return false;
};
X.getXbspHdState = function() {

    var spData = G.frame.chengbao.getXbSpData();
    var spKeys = X.keysOfObject(spData);
    G.DATA.xbspstate = false;
    for (var j = 0; j < spKeys.length; j++) {
        var key = spKeys[j];
        var conf = G.class.item.getById(spData[key].itemid);
        if (spData[key].num >= conf.hcnum) {
            G.DATA.xbspstate = true;
            return true;
        }
    }
    return false;
};
//比较数量选择容器
X.lengthChangeByPanel = function(arr, layout, listview, args){
    if(!arr) return;

    args = args || {};

    layout.hide();
    listview.hide();

    var num = args.num || 5;
    if(arr.length > num){
        listview.removeAllChildren();
        cc.enableScrollBar(listview);
        for(var i = 0; i < arr.length; i ++){
            var item = G.class.sitem(arr[i]);
            if(args.touch){
                G.frame.iteminfo.showItemInfo(item);
            }
            listview.pushBackCustomItem(item);
        }
        listview.show();
    }else{
        var type = args.type || "center";
        layout.removeAllChildren();
        X.alignItems(layout, arr, type, {touch: true});
        layout.show();
    }
};
//居中对齐
X.alignCenter = function(target,arr,extraParams) {
    if (!cc.sys.isObjectValid(target)) return;

    target.removeAllChildren();

    if (arr.length < 1) return;

    var name = extraParams.name;
    var touch = extraParams.touch;
    var scale = extraParams.scale || 1;
    var mapItem = extraParams.mapItem;

    var data = null;
    var item = null;

    var maxWidth = target.width;
    var itemWidth = G.class.sitem().width;

    var intervalWidth = (maxWidth - (arr.length * itemWidth)) / (arr.length + 1);

    // var interval = extraParams.interval || 5 / 8;
    var interval = extraParams.interval || intervalWidth;
    for(var j=0;j<arr.length;j++) {
        data = arr[j];
        item = G.class.sitem(data,name);
        if (scale) {
            item.setScale(scale);
        }
        item.setPosition(cc.p(item.width / 2 * j + (interval + item.width / 2) * (j + 1),target.height / 2));
        target.addChild(item);
        mapItem && mapItem(item);
        if (touch) {
            G.frame.iteminfo.showItemInfo(item);
        }
    }
};
//容器居中对齐
X.center = function(arr, target, extraParams){
    if (!cc.sys.isObjectValid(target)) return;
    if (arr.length < 1) return;
    target.removeAllChildren();

    extraParams = extraParams || {};
    var callback = extraParams.callback;

    var scale = extraParams.scale || 1;
    var maxWidth = target.width;
    var itemWidth = arr[0].width;
    var intervalWidth = (maxWidth - (arr.length * itemWidth)) / (arr.length + 1);
    var interval = extraParams.interval || intervalWidth;

    for(var j=0;j<arr.length;j++) {
        arr[j].setPosition(cc.p(arr[j].width / 2 * j + (interval + arr[j].width / 2) * (j + 1),target.height / 2));
        arr[j].setScale(scale);
        target.addChild(arr[j]);

        callback && callback(arr[j]);
    }
};

X.getItem = function(data, name) {
    var wid = null;

    if (data.a == 'item') {
        wid = G.class.sitem(data, name);
    } else if (data.a == 'attr') {
        wid = G.class.sattr(data, name);
    } else if (data.a == 'equip') {
        wid = G.class.szhuangbei(data, name);
    } else if (data.a == 'hero') {
        wid = G.class.shero(data, name);
    } else if (data.a == 'skill') {
        wid = G.class.sskill(data, name);
    } else if (data.a == 'head') {
        wid = G.class.shead(data, name);
    } else if (data.a == 'baowu') {
        wid = G.class.sbaowu(data, name);
    }
    else if (data.a == 'baoshi') {
        wid = G.class.sbaoshi(data, name);
    }
    else if (data.a == 'shipin') {
        wid = G.class.sshipin(data, name);
    }
    else {
        wid = G.class.sitem(data, name);
    }

    return wid;
};
X.createPicRichText = function(target, currency, need, own, pos) {
    target.removeAllChildren();
    var rh = new X.bRichText({size: 20, lineHeight: 15, maxWidth: target.width, color: G.gc.COLOR.n5});
    var color = G.gc.COLOR[1];
    if (need > own) {
        color = G.gc.COLOR[5];
    }
    var str = L('$XIAOHAO$：{1}', '<font node=1></font><font color=' + color + '>{1}</font>');
    var aaa = new ccui.ImageView();
    aaa.loadTexture(G.class.attricon.getById(currency).ico, ccui.Widget.PLIST_TEXTURE);
    rh.text.apply(rh, [
        X.STR(str, X.fmtValue(need)),
        aaa
    ]);
    var ppp = pos || cc.p((target.width - rh.trueWidth()) * 0.5, target.height - rh.trueHeight());
    rh.setPosition(ppp);

    target.addChild(rh);
};
X.createPicRichText_noAttr = function(target, currency, need, own, pos) {
    target.removeAllChildren();
    var rh = new X.bRichText({size: 20, lineHeight: 15, maxWidth: target.width, color: '#FFD8B6'});
    var color = G.gc.COLOR[1];
    if (need > own) {
        color = G.gc.COLOR[5];
    }
    var str = '<font node=1></font><font color=#ffffff> {1}</font>' + '(' + L('YONGYOU') + '<font color=' + color + '> {2}</font>' + ')';
    var aaa = new ccui.ImageView();
    aaa.loadTexture(G.class.attricon.getById(currency).ico, ccui.Widget.PLIST_TEXTURE);
    rh.text.apply(rh, [
        X.STR(str, X.fmtValue(need), X.fmtValue(own)),
        aaa
    ]);
    var ppp = pos || cc.p(0, target.height - 10);
    rh.setPosition(ppp);

    target.addChild(rh);

};
X.getArmyName = function(data, isLv, pos) {
    var conf = G.class.hero.getById(data.hid);

    var s = null;
    var lv = '';
    if (isLv) {
        lv = L('DENGJI') + (data.lv || 1) + ' ';
    }
    if (data.pinzhi && data.pinzhi != 0) {
        s = lv + conf.name + ' +' + data.pinzhi;
    } else {
        s = lv + conf.name;
    }
    return s;
};
// X.createNameRichText = function (target, data, isLv, pos) {
//     target.removeAllChildren();

//     var conf = G.class.hero.getById(data.hid);
//     var nameColor = G.gc.COLOR[conf.color];

//     var rh = new X.bRichText({
//         size: 24,
//         lineHeight: 15,
//         maxWidth: target.width,
//         eachText: function (node) {
//             node.enableShadow && node.enableShadow(cc.color(0, 0, 0, 255), cc.size(1, -1));
//         },
//         color: '#FFD8B6'
//     });
//     var s = null;
//     var str = '<font color=' + nameColor + '>{1} </font>';
//     var lv = '';
//     if (isLv) {
//         lv = L('DENGJI') + (data.lv || 1) + ' ';
//     }
//     if (data.pinzhi && data.pinzhi != 0) {
//         var img;
//         if (data.pinzhi > 6) {
//             img = 'img/pinzhi_3.png';
//         } else if (data.pinzhi > 3) {
//             img = 'img/pinzhi_2.png';
//         } else {
//             img = 'img/pinzhi_1.png';
//         }
//         var imgView = new ccui.ImageView();
//         imgView.loadTexture(img, ccui.Widget.PLIST_TEXTURE);
//         str += '<font color=' + nameColor + '>{2}</font><font node=1></font>';
//         s = X.STR(str, lv + conf.name, '+' + data.pinzhi);
//         rh.text.apply(rh, [s, imgView]);
//     } else {
//         s = X.STR(str, lv + conf.name);
//         rh.text(s);
//     }

//     var ppp = pos || cc.p(target.width / 2 - rh.trueWidth() / 2, target.height / 2);
//     rh.setPosition(ppp);
//     target.addChild(rh);
// };

X.createJueweiNameRichText = function(target, data) {
    target.removeAllChildren();

    var rh = new X.bRichText({
        size: data.size || 24,
        lineHeight: 15,
        maxWidth: target.width,
        color: data.color || '#ffffff'
    });
    var str = "";
    var arguments = [];
    if (data.juewei) {
        str += '<font node=1></font> ';
        arguments.push(new ccui.ImageView(G.class.juewei.getIcoByLv(data.juewei), ccui.Widget.LOCAL_TEXTURE));
    }
    str += data.name || "";
    rh.text(str, arguments);

    var ppp = data.pos || cc.p(target.width / 2 - rh.trueWidth() / 2, target.height / 2);
    rh.setPosition(ppp);
    target.addChild(rh);
};

X.showJianZhuShengJiAni = function(bui) {
    var build = G.view.mainView.city.nodes[bui];
    while (build.getChildByTag(67890123)) {
        build.getChildByTag(67890123).removeFromParent();
    }
    var conf = G.class.facilityclient.getById(bui).shengjiani;
    G.class.ani.show({
        json: 'jianzhu_shengji',
        addTo: build,
        x: build.width * 0.5 + conf[0],
        y: build.height * 0.5 + conf[1],
        repeat: false,
        autoRemove: true,
        onload: function(node, action) {
            node.setTag(67890123);
            node.setScale(conf[2]);
        }
    });
};
X.getXbAllExp = function(lv, color) {
    var allExp = 0;
    var curLvExp = 0;
    for (var j = 1; j < lv; j++) {
        curLvExp = Math.round((1000 + Math.pow(10 + j, 2) + Math.pow(j * 2 * color, 2)) / 1000) * 1000;
        allExp += curLvExp;
    }

    return allExp;
};
X.resetToMainCity = function() {
    G.mainMenu.showMainCity();
    G.mainMenu.showFocusAni(G.mainMenu.m_btn_huicheng);
    G.class.touchsound();
};
X.handleOnePersonCache = function(k, v) {
    if (!P) {
        console.log('P not exist!');
        return;
    }

    if (v == null) {
        var v = cc.sys.localStorage.getItem(P.gud.uid + '_' + k);
        if (v != null) 
            v = decodeURIComponent(cc.sys.localStorage.getItem(P.gud.uid + '_' + k));
        return v;
    } else {
        cc.sys.localStorage.setItem(P.gud.uid + '_' + k, encodeURIComponent(v));
    }
};
X.delOnePersonCache = function(type) {
    cc.sys.localStorage.removeItem(P.gud.uid + '_' + type);
};
//判断符合[{a,t,n}]的item是否满足现实红点的需求
X.checkItemHongdian = function(arr) {
    if (!arr) 
        return false;
    var showHd = false;
    for (var j = 0; j < arr.length; j++) {
        var a = arr[j];
        switch (a.a) {
            case 'attr':
                showHd = P.gud[a.t] >= a.n;
                break;
            case 'item':
                showHd = G.DATA.itemid2num[a.t]
                    ? (G.DATA.itemid2num[a.t] >= a.n)
                    : false;
                break;
            case 'equip':
                showHd = G.DATA.eid2num[a.t]
                    ? (G.DATA.eid2num[a.t] >= a.n)
                    : false;
                break;
            case 'hero':
                //todo   待扩展
                break;
            default:
                break;
        }
        if (showHd) {
            return showHd;
        }
    }
    return showHd;
};
//获得罪恶值对应的颜色
X.getZeColor = function(v) {
    var color = '#ffffff';
    if (v > 70) {
        color = '#d60000';
    } else if (v > 30) {
        color = '#ffff00';
    }
    return color;
};

function getRealLen(str) {
    return str.replace(/[^\x00-\xff]/g, '__').length; //这个把所有双字节的都给匹配进去了
}

//匹配角色名称是否合法
X.getValidName = function(name) {
    if (name == null || name == '') {
        G.tip_NB.show(L('NAME_TIP'));
        return null;
    } else {
        var len = getRealLen(name);
        var strMaxLen = 12;
        if (len > strMaxLen) {
            G.tip_NB.show(X.STR(L('NAME_MAX'), strMaxLen / 2));
            return null;
        }

        //匹配中英文数字
        var reg = new RegExp("^[a-zA-Z0-9\u4e00-\u9fa5]+$");
        if (reg.test(name)) {
            return name;
        } else {
            G.tip_NB.show(L('NAME_REG'));
            return null;
        }
    }
};
//匹配公会名字是否合法
X.getValidGHname = function(name) {
    if (name == null || name == '') {
        G.tip_NB.show(L('NAME_TIP'));
        return null;
    } else {
        var len = getRealLen(name);
        var strMaxLen = 10;
        if (len > strMaxLen) {
            G.tip_NB.show(X.STR(L('NAME_MAX'), strMaxLen / 2));
            return null;
        }
    }

    return name
};
//按钮加动画
X.addBtnAni = function(btn, ani, obj) {
    btn.getChildByTag(12345) && btn.getChildByTag(12345).removeFromParent(true);
    var btnConf = {
        tongyongtx_chang: {
            width: 170,
            height: 96,
            offsetX: 0,
            offsetY: 7
        },
        shouchong_anniu: {
            width: 166,
            height: 50,
            offsetX: -2,
            offsetY: -2
        }
    }[ani];
    G.class.ani.show({
        addTo: btn,
        json: ani,
        x: btn.width / 2 + btnConf.offsetX,
        y: btn.height / 2 + btnConf.offsetY,
        repeat: true,
        autoRemove: false,
        onload: function(node) {
            node.setTag(12345);
            node.setScale(X.toFixed(btn.width / btnConf.width, 2), X.toFixed(btn.height / btnConf.height, 2));
        }
    });
};
//可取指定位整数，负数向前取整
X.round = function(v, key) {
    key = key || 0;
    var fomula = Math.pow(10, key);
    var a = Math.round(v * fomula);

    return a / fomula;
};
//获取到指定时间的时间差值
X.getF5Time = function(f5time) {
    var time = new Date(G.time * 1000);
    var f5Time = f5time;
    //if (time.getHours() < f5Time){
    //    time.setHours(f5Time);
    //}else{
    //    time.setHours(f5Time);
    //    time.setUTCDate(time.getUTCDate() + 1);
    //}
    time.setHours(f5Time);
    time.setUTCDate(time.getUTCDate() + 1);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    var v = time.getTime() / 1000 - G.time;

    return v;
};

function setPHB(ui, rank, imgUrl) {
    ui.removeAllChildren();
    imgUrl = imgUrl || 'img/public/img_pm_{1}.png';
    if (rank < 4) {
        var img = new ccui.ImageView();
        img.loadTexture(X.STR(imgUrl, rank), 1);
        img.setAnchorPoint(0.5, 0.5);
        img.setPosition(cc.p(ui.width * 0.5, ui.height * 0.5));
        ui.addChild(img);
    } else {
        var label = new cc.LabelBMFont();
        label.setString(rank);
        label.setFntFile("img/fnt/sz_pm.fnt");
        label.setAnchorPoint(0, 0.5);
        label.setContentSize(cc.size((rank + '').length * 37, 45));
        label.setPosition(cc.p((ui.width - label.width) * 0.5, (ui.height + 20) * 0.5));
        ui.addChild(label);
    }
}

//该方法需要废弃，如果有用到此方法的地方，联系刺鸟
/*G.interceptor = {
    _list: {},
    add: function (type, blockType) {
        this._list[type] = this._list[type] || [];
        var event = new cc.EventEmitter();
        this._list[type].push({blockType: blockType, event: event});
        return {type: type, blockType: blockType, event: event};
    },
    remove: function (handler) {
        if (handler.type && this._list[handler.type]) {
            for (var i = 0; i < this._list[handler.type].length; i++) {
                if (!handler.event && this._list[handler.type][i].blockType == handler.blockType) {
                    this._list[handler.type].splice(i, 1);
                    i--;
                } else if (this._list[handler.type][i].event == handler.event) {
                    this._list[handler.type].splice(i, 1);
                    break;
                }
            }
        }
    },
    dispatch: function (type, blockType, block) {
        var noInterceptor = true;
        if (this._list[type] && this._list[type].length > 0) {
            for (var i in this._list[type]) {
                if (this._list[type][i].blockType == blockType) {
                    this._list[type][i].event.once(type, block);
                    noInterceptor = false;
                }
            }
        }
        if (noInterceptor) {
            block && block();
        }
    },
    perform: function (handler) {
        handler.event && handler.event.emit(handler.type);
        this.remove(handler);
    }
};*/

X.num2Cn = function(v) {
    if (v < 10) {
        return L(v);
    } else {
        var a = Math.floor(v / 10),
            b = v % 10;
        return (
            a > 1
            ? L(a)
            : '') + L(10) + (
            b > 0
            ? L(b)
            : '');
    }
};

// 数字转希腊数字
X.num2Gre = function(v) {
    if (v < 11) {
        return L('XILA_SHUZI')[v];
    } else if (v < 40) {
        var a = Math.floor(v / 10),
            b = v % 10,
            result = '';
        for (var i = 0; i < a; i++) {
            result += L('XILA_SHUZI')[10];
        }
        result += (
            b > 0
            ? L('XILA_SHUZI')[b]
            : '');
        return result;
    }
    // 数字在40及以上就不太规律, 暂不做处理, 有需求再修改
    return '';
};

X.enableShadow = function(target, color, size) {
    var color = color || cc.color(0, 0, 0, 255);
    var size = size || cc.size(1, -1);

    target.enableShadow && target.enableShadow(color, size);
};
//获得佣兵天赋满层后的天赋类型，123对应天地人
// X.getArmyTfType = function (qnlist) {
//     if (!qnlist || !X.isHavItem(qnlist)) return null;
//
//     var con = G.class.armyqianneng;
//     var arr = con.getSkillArr();
//
//     if (X.isHavItem(qnlist)) {
//         var keys = X.keysOfObject(qnlist);
//         if (keys.length < 1) {
//             return null;
//         }
//         for (var i = 0; i < keys.length; i++) {
//             var key = keys[i];
//             var conf = con.getSkillById(key);
//             if (X.inArray(arr,key) && qnlist[key] >= conf.maxlv) {
//                 return con.getSkillById(key).mtype;
//             }
//         }
//         return null;
//     } else {
//         return null;
//     }
// };
// 设置佣兵天赋开启后的特效动画
// X.setArmyTfAni = function (ui, data,scale) {
//     var tf_guang = ui;
//     tf_guang.removeAllChildren();
//     var scale = scale || 1;
//
//     if (X.getArmyTfType(data.qnskill) != null) {
//         var mtype = X.getArmyTfType(data.qnskill);
//          var mtype = 1;
//         G.class.ani.show({
//             addTo:tf_guang,
//             json:['shensheng','tiandiren','heianxi'][mtype - 1],
//             x:tf_guang.width / 2,
//             y:tf_guang.height / 2,
//             repeat:true,
//             autoRemove:false,
//             onload: function (node, action) {
//                  node.setTag(666666);
//                 node.setScale(scale);
//             }
//         });
//     }
// };
//获得佣兵天赋满层后的天赋类型，123对应天地人
X.getArmyTfType = function(qnlist) {
    if (!qnlist || !X.isHavItem(qnlist)) 
        return null;
    
    var con = G.class.armyqianneng;
    var arr = con.getSkillArr();
    var mTypeArr = [];

    if (X.isHavItem(qnlist)) {
        var keys = X.keysOfObject(qnlist);
        if (keys.length < 1) {
            return null;
        }
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var conf = con.getSkillById(key);
            if (X.inArray(arr, key) && qnlist[key] >= conf.maxlv) {
                // return con.getSkillById(key).mtype;
                if (!X.inArray(mTypeArr, con.getSkillById(key).mtype)) {
                    mTypeArr.push(con.getSkillById(key).mtype);
                }
            }
        }
        //返回包含类型的数组
        if (mTypeArr.length < 1) {
            return null;
        } else {
            return mTypeArr;
        }
    } else {
        return null;
    }
};
//设置佣兵天赋开启后的特效动画
X.setArmyTfAni = function(ui, frontui, data, scale) {
    var tf_guang = ui;
    tf_guang.removeAllChildren();
    var frontUi = frontui;
    frontUi.removeAllChildren();
    var scale = scale || 1;

    var mTypeArr = X.getArmyTfType(data.qnskill);
    if (mTypeArr != null) {
        //播放，动画中的天、地、人，对应 攻击，防御，生命
        G.class.ani.show({
            addTo: tf_guang,
            json: 'ani_qianneng_jihuo',
            x: tf_guang.width / 2,
            y: tf_guang.height / 2,
            repeat: true,
            autoRemove: false,
            onload: function(node, action) {
                // node.setTag(666666);
                node.setScale(scale);
            }
        });

        var posArr = [];
        for (var i = 0; i < 3; i++) {
            var pos = cc.p(frontUi.width * (i / 2), frontUi.height * (((i + 1) % 2) / 2));
            if (i == 0) {
                pos.x = pos.x - 50;
                pos.y = pos.y - 30;
            } else if (i == 2) {
                pos.x = pos.x + 50;
                pos.y = pos.y - 30;
            }
            posArr.push(pos);
        }

        for (var i = 0; i < 3; i++) {
            if (X.inArray(mTypeArr, i + 1)) {
                X.playDefaulyAni({
                    ui: frontUi,
                    json: ['ani_qianneng_gong', 'ani_qianneng_fang', 'ani_qianneng_ming'][i],
                    tag: 20170409 + i,
                    pos: posArr[i],
                    repeat: true,
                    autoRemove: false
                });
            } else {
                if (frontUi.getChildByTag(20170409 + i)) {
                    frontUi.getChildByTag(20170409 + i).remove();
                }
            }
        }
    }
};
//通过name链的方式寻找配置中的val，dic是所需的字典，keys为name链所分解成的数组
X.getDicValByKeys = function(dic, keys) {
    function getVal(dic, key) {
        return dic[key];
    }

    var val = dic;
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        val = getVal(val, key);
        if (!val) {
            console.log('name链完成查找失败，失败key======', key);
        }
    }

    return val;
};

//供服务器端写的接口快速调用升级等功能
function bingo() {
    var arr = [];

    for (var k in arguments) {
        arr.push(arguments[k]);
    }
    G.ajax.send('console', arr, function(data) {
        if (!data) 
            return;
        var data = JSON.parse(data);
        if (data.s == 1) {
            !cc.sys.isNative && console.groupCollapsed('帮助信息');
            for (var kk in data.d) {
                if (!cc.sys.isNative) {
                    console.info(kk + '==' + data.d[kk]);
                } else {
                    console.log(kk + '==' + data.d[kk]);
                }

            }
            !cc.sys.isNative && console.groupEnd();
        }
    }, true);
};

X.getCocosJsonTree = function(ui) {
    if (!cc.sys.isObjectValid(ui)) 
        return;
    
    function getJsonTree(target) {
        if (!target || !cc.isFunction(target.getChildren) || target.getChildren().length == 0) 
            return;
        
        console.groupCollapsed('(' + target._className + ')' + target.getName());
        for (var i = 0; i < target.getChildren().length; i++) {
            var child = target.getChildren()[i];
            if (child.getChildren().length == 0) {
                console.info('(' + child._className + ') ' + '==== ' + child.getName());
            }
            getJsonTree(child);
        }
        console.groupEnd();
    }

    getJsonTree(ui);
};

//设置阴影
X.enableShadow = function(target, color, size) {
    var color = color || cc.color(0, 0, 0, 255);
    var size = size || cc.size(1, -1);
    if (target.enableOutline) {
        return;
        target.enableOutline(cc.color(color), 2);
    } else {
        target.enableShadow && target.enableShadow(color, size);
    }
};
//设置描边
//需要手动设置ttf字体,例如setFontName('cctyt.ttf')
X.enableOutline = function(target, color, width) {
    color = color
        ? cc.color(color)
        : cc.color(0, 0, 0, 255);
    width = width
        ? (
            width.width
            ? width.width
            : 2)
        : 2;
    target.enableOutline(cc.color(color), width);
};
X.disableOutline = function(target) {
    target.enableOutline(cc.color(255, 255, 255, 0), 1);
};
G.playEffect = function(file, repeat, notNeedStop) {
    if (this._soundId && !notNeedStop) {
        X.audio.stopEffect(this._soundId);
    }
    delete this._soundId;
    if (!G.frame.guide.isPlaying) {
        this._soundId = X.audio.playEffect(file, repeat);
    }
};
//移除数字或者字符串数字中的无效零
X.removeInvalidZeroFromNum = function(num) {
    var str = typeof num == 'number'
        ? num.toString()
        : num;

    var arr = str.split('.');
    if (arr.length == 1) {
        return Number(str);
    }
    var subStr = arr[1];

    function handle(str) {
        if (str.length == 1) 
            return str;
        if (str.substr(str.length - 1) == '0') {
            str = str.substr(0, str.length - 1);
            return handle(str);
        } else {
            return str;
        }
    }

    var ss = handle(subStr);
    if (ss.length == 1 && ss == '0') {
        return Number(arr[0]);
    } else {
        return Number([].concat(arr[0], ss).join('.'));
    }
};

//存取当天数据
X.cacheByDay = function(uid, frameid, data) {
    if (!frameid || !uid) 
        return null;
    
    var date;
    if (data) {
        date = X.timetostr(G.time, 'y-m-d');
        data['date'] = date;
        if (X.cache(uid + '_' + frameid)) 
            X.delCache(uid + '_' + frameid);
        X.cache(uid + '_' + frameid, JSON.stringify(data));
        return true;
    } else {
        if (!X.cache(uid + '_' + frameid)) 
            return null;
        var d = JSON.parse(X.cache(uid + '_' + frameid));
        date = X.timetostr(G.time, 'y-m-d');
        if (date == d.date) {
            d['date'] = null;
            delete d['date'];
            return d;
        } else {
            return false;
        }
    }
};

//循环移动
X.circulateMoving = cc.Class.extend({
    _mask_panel: null,
    _moving_ui_list: [],
    _isCirculated: true,
    _posMap: {
        '-2': cc.p(0, 537),
        '-1': cc.p(100, 276),
        '0': cc.p(310, 117),
        '1': cc.p(540, 276),
        '2': cc.p(640, 537)
    },
    _scaleMap: {
        '-2': 0.0,
        '-1': 0.7,
        '0': 1,
        '1': 0.7,
        '2': 0.0
    },
    _stateRange: {
        min: -1,
        max: 1
    },
    _curUi: null, //当前节点
    /*
     delegate = {
     canMoveOn: function(v){return bool;},//能否继续移动,v==1向右移,v==-1向左移
     setUiContent: function(ui,index){}//设置ui内容
     }
     */
    _delegate: null,
    /**
     *
     * @param mask touchMove panel
     * @param uiList move ui list
     * @param isCirculated if circulate or not
     */
    ctor: function(mask, uiList, isCirculated) {
        this._mask_panel = mask;
        this._moving_ui_list = [].concat(uiList || []);
        this._stateRange.min = -Math.floor(this._moving_ui_list.length / 2);
        this._stateRange.max = -this._stateRange.min;
        if (isCirculated != undefined) {
            this._isCirculated = isCirculated;
        }
        if (cc.sys.isObjectValid(this._mask_panel)) {
            this._setTouchMoveHandler();
        }
    },
    _setTouchMoveHandler: function() {
        var me = this;
        me._mask_panel.touch(function(sender, type) {
            if (type == ccui.Widget.TOUCH_ENDED) {
                var start = sender.getTouchBeganPosition(),
                    end = sender.getTouchEndPosition();
                sender.setTouchEnabled(false);
                if (end.x > start.x + 20) {
                    me._moveTo(-1, function() {
                        sender.setTouchEnabled(true);
                    });
                } else if (end.x < start.x - 20) {
                    me._moveTo(1, function() {
                        sender.setTouchEnabled(true);
                    });
                }
            }
        });
    },
    _moveTo: function(v, actionEndCallback) {
        var me = this;
        if (!me._delegate) {
            cc.log('err: "move to" has no delegate');
            return;
        }

        if (me._delegate.canMoveOn && !me._delegate.canMoveOn(v)) {
            return;
        }

        me._delegate.circulateMovingWillMoveTo && me._delegate.circulateMovingWillMoveTo(v);

        var dur = 0.2;
        var setAction = function(ui, nextState) {
            ui.moveTo(dur, me._posMap[nextState]).then(function() {
                ui.state = nextState;
                ui.setTouchEnabled(true);
                if (nextState == 0) {
                    me._curUi = ui;
                    actionEndCallback && actionEndCallback();
                }
                me._setUiContent(ui);
            }).run();
            ui.scaleTo(dur, me._scaleMap[nextState]).run();
        };
        for (var i in me._moving_ui_list) {
            var ui = me._moving_ui_list[i];
            ui.setTouchEnabled(false);
            var state = ui.state;
            var nstate = state - v;
            if (nstate > me._stateRange.max) 
                nstate = me._stateRange.min;
            if (nstate < me._stateRange.min) 
                nstate = me._stateRange.max;
            ui.stopAllActions();
            setAction(ui, nstate);
        }
    },
    _setUiContent: function(ui) {
        var state = ui.state;
        if (this._delegate && this._delegate.setUiContent) {
            this._delegate.setUiContent(ui, state + this._stateRange.max);
        }
    },
    setPositionMap: function(map) {
        if (!map) {
            map = {};
            var max = this._stateRange.max;
            for (var i = this._stateRange.min; i <= max; i++) {
                map[i] = this._moving_ui_list[i + max].getPosition();
            }
        }
        this._posMap = map;
    },
    setScaleMap: function(map) {
        if (!map) {
            map = {};
            var max = this._stateRange.max;
            for (var i = this._stateRange.min; i <= max; i++) {
                map[i] = this._moving_ui_list[i + max].getScale();
            }
        }
        this._scaleMap = map;
    },
    setDelegate: function(delegate) {
        this._delegate = delegate;
    },
    initContent: function() {
        var max = this._stateRange.max;
        for (var i = this._stateRange.min; i <= max; i++) {
            var ui = this._moving_ui_list[i + max];
            ui.state = i;
            ui.setScale(this._scaleMap[i]);
            ui.setPosition(this._posMap[i]);
            if (this._delegate && this._delegate.setUiContent) {
                this._delegate.setUiContent(ui, i + max);
            }
        }
    },
    move: function(v, callback) {
        this._moveTo(v, callback);
    },
    curUi: function() {
        return this._curUi;
    }
});

X.TableView = cc.Class.extend({
    _table: null, _initFun: null, _listItemTemplate: null,
    /**
     *
     * @param scrollView
     * @param listItemTemplate
     * @param rowNum
     * @param initItemCallback
     * @param cellSize
     * @param offsetY
     */
    ctor: function(scrollView, listItemTemplate, rowNum, initItemCallback, cellSize, offsetY, adjustListItemHeight,paddingTop) {
        this._initFun = initItemCallback;
        this._listItemTemplate = listItemTemplate;
        adjustListItemHeight = adjustListItemHeight || 0;
        var listItemTemplateHeight;
        if (X.instanceOf(listItemTemplate, 'Function')) {
            listItemTemplateHeight = listItemTemplate().height;
        } else {
            listItemTemplateHeight = listItemTemplate.height;
        }
        var table = new cc.myTableView({
            rownum: rowNum || 1,
            type: 'fill',
            lineheight: listItemTemplateHeight + adjustListItemHeight,
            offsetY: offsetY || 0,
            paddingTop: paddingTop || 0
        });
        if (scrollView.getDirection() == cc.SCROLLVIEW_DIRECTION_HORIZONTAL) {
            table.setCellSize(-1, cellSize);
        }
        table.data([]);
        table.setDelegate(this);
        table.bindScrollView(scrollView);
        this._table = table;
    },
    isEnabled: function() {
        return cc.sys.isObjectValid(this._table.tableView);
    },
    /**
     * 数据模板
     * @returns {*}
     */
    cellDataTemplate: function() {
        if (X.instanceOf(this._listItemTemplate, 'Function')) {
            return this._listItemTemplate();
        } else {
            return this._listItemTemplate.clone();
        }
    },
    /**
     * 数据初始化
     * @param ui
     * @param data
     */
    cellDataInit: function(ui, data, pos) {
        if (data == undefined) {
            ui.hide();
            return;
        }
        this._initFun(ui, data, pos);
        ui.show();
    },
    setData: function(data) {
        this._table.data(data);
    },
    addCellSize: function(index, size) {
        this._table.setCellSize(index, size);
    },
    removeCellSize: function(index) {
        this._table.delCellSize(index);
    },
    cellByName: function(name) {
        return this._table.getItemByName(name);
    },
    cellDataUpdate: function(name, data) {
        return this._table.cellDataUpdate(name, data);
    },
    reloadDataWithScroll: function(isScroll) {
        this._table.reloadDataWithScroll(isScroll);
    },
    reloadDataWithScrollToBottomRight: function() {
        this._table.reloadDataWithScrollToBottomRight();
    },
    scrollToCell: function(cellIndex) {
        this._table.scrollToCell(cellIndex);
    },
    reloadDataWithScrollToCellAtIndex: function(idx) {
        this._table.reloadDataWithScrollToCellAtIndex(idx);
    },
    createExScrollEventMask: function(eventHandler) {
        if (!X.instanceOf(eventHandler, 'Function')) {
            return;
        }
        var me = this;
        var mask = new ccui.Layout();
        mask.setName('scrollEventMask');
        mask.setContentSize(this._table.tableSize);
        mask.setTouchEnabled(true);
        mask.setSwallowTouches(false);
        mask.setAnchorPoint(0, 0);
        mask.touch(function(sender, type) {
            eventHandler(sender, type, me);
        });
        return mask;
    },
    //获得所有节点
    getAllChildren: function () {
        var me = this;

        var arr = [];
        var parent = me._table.tableView.getChildren()[0];
        for (var i = 0; i < parent.getChildren().length; i++) {
            var children = parent.getChildren()[i];
            for (var j = 0; j < children.getChildren().length; j++) {
                var child = children.getChildren()[j];
                if (!child.isVisible()) continue;

                arr.push(child);
            }
        }

        return arr;
    }
});


X.newExtendLayout = function(parentNode, param){
    var _panel = parentNode;
    var _dataCount = param.dataCount; // 数据长度
    var _extend = param.extend; // 两边伸展
    var _delay = param.delay != null ? param.delay : 0; // 延迟加载, int or false
    var _cellCount = param.cellCount; // 列数
    var _nodeWidth = param.nodeWidth; // 克隆项的宽度
    var _rowHeight = param.rowHeight || 10; // 行高
    var _interval = param.interval || 10; // 默认间隔

    if (!cc.sys.isObjectValid(_panel)) {
        cc.log('error: (layout) panel is undefined');
        return;
    }

    if(_dataCount == 0){
        return;
    }

    if(_extend){
        // if(_dataCount >= cellCount){
        var panel_width = _panel.width - _nodeWidth*2; // 减去左右两个贴边项的宽度
        var cell_count = _cellCount - 2;
        _interval = (panel_width - _nodeWidth * cell_count) / (_cellCount-1); // 间隔宽度
        // }else{
        //     _interval = Math.ceil((_panel.width - _nodeWidth * cellCount) / cellCount); // 间隔宽度
        // }
    }

    var idx = 0;
    var y = _panel.height;
    for (var i = 0; i < _dataCount; i++) {
        var item;
        if (param.itemAtIndex) {
            (function(index){
                var _call = function () {
                    item = param.itemAtIndex(index);
                    if (cc.isNode(item)) {
                        item.setAnchorPoint(0, 1);
                        item.setPosition(idx > 0 ? idx * _nodeWidth + idx * _interval : 0, y);
                        idx += 1;
                        if ((index + 1) % _cellCount == 0) {
                            idx = 0;
                            y -= _rowHeight;
                        }

                        // item.show();
                        _panel.addChild(item);
                    }
                };
                if(_delay === false){
                    _call();
                }else{
                    _panel.setTimeout(function(){
                        _call();
                    },_delay);
                }
            })(i)
        }
    }
};


X.extendLayout = cc.Class.extend({
    _panel: null, _cellCount: null, _delegate: null,
    /**
     *
     * @param parentNode panel
     * @param dataCount int
     * @param extend Boole true 两边伸展, false 顺序摆放
     */
    ctor: function(parentNode, dataCount, extend) {
        this._panel = parentNode;
        this._dataCount = dataCount || 0;
        this._extend = extend; // 两边伸展
    },
    setDelegate: function(delegate) {
        this._delegate = delegate;
    },
    layout: function() {
        var me = this;
        if (!cc.sys.isObjectValid(me._panel)) {
            cc.log('error: (layout) panel is undefined');
            return;
        }
        if (!me._delegate) {
            cc.log('error: (layout) delegate is undefined');
            return;
        }
        var delegate = me._delegate,
            panel = me._panel;

        var nodeWidth = delegate.nodeWidth
            ? delegate.nodeWidth()
            : 0; // 克隆项的宽度
        var cellCount = delegate.cellCount
            ? delegate.cellCount()
            : 1; // 列数

        // var intervalWidth = Math.ceil(panel.width / cellCount) - nodeWidth;  间隔宽度
        // var intervalWidth = Math.ceil((panel.width - nodeWidth * cellCount) / cellCount);  间隔宽度
        var intervalWidth = 10;

        if (this._extend) {
            // if(me._dataCount >= cellCount){
            var panel_width = panel.width - nodeWidth * 2; // 减去左右两个贴边项的宽度
            var cell_count = cellCount - 2;
            intervalWidth = (panel_width - nodeWidth * cell_count) / (cellCount - 1); // 间隔宽度
            // }else{
            //     intervalWidth = Math.ceil((panel.width - nodeWidth * cellCount) / cellCount);  间隔宽度
            // }
        }

        var rowHeight = delegate.rowHeight
            ? delegate.rowHeight()
            : 10;

        var idx = 0;
        var y = panel.height;
        for (var i = 0; i < me._dataCount; i++) {
            var item;
            if (delegate.itemAtIndex) {
                item = delegate.itemAtIndex(i);
                if (cc.isNode(item)) {
                    item.setAnchorPoint(0, 1);
                    item.setPosition(
                        idx > 0
                        ? idx * nodeWidth + idx * intervalWidth
                        : 0,
                    y);
                    idx += 1;
                    if ((i + 1) % cellCount == 0) {
                        idx = 0;
                        y -= rowHeight;
                    }

                    item.show();
                    panel.addChild(item);
                }
            }
        }
    }

});

X.autoLayout = cc.Class.extend({
    _panel: null, _maxNumPerRow: 1,
    /*
     delegate = {
     //所有item数量
     countOfAllItems:function(){return Int;},
     //某行item数量
     countOfItemsAtRow:function(rowIndex){return Int;},
     //某行某列所在item
     itemAtIndex:function(rowIndex,colIndex,uiIndex){return widget;},
     //某行的高
     rowHeight:function(index){return height;}
     }
     */
    _delegate: null,
    /**
     *
     * @param parentNode panel
     * @param num maxItemNum
     */
    ctor: function(parentNode, num) {
        this._panel = parentNode;
        this._maxNumPerRow = num || 1;
    },
    setDelegate: function(delegate) {
        this._delegate = delegate;
    },
    layout: function() {
        var me = this;
        if (!cc.sys.isObjectValid(me._panel)) {
            cc.log('error: (layout) panel is undefined');
            return;
        }
        if (!me._delegate) {
            cc.log('error: (layout) delegate is undefined');
            return;
        }
        var delegate = me._delegate,
            panel = me._panel,
            maxHeight = panel.height,
            maxWidth = panel.width;
        me._panel.removeAllChildren();
        var allNum = delegate.countOfAllItems
                ? delegate.countOfAllItems()
                : 0,
            rowNum = Math.ceil(allNum / me._maxNumPerRow),
            sumHeight = 0;

        var count = 0;
        for (var i = 0; i < rowNum; i++) {
            var itemCount = me._maxNumPerRow;
            if (delegate.countOfItemsAtRow) {
                itemCount = delegate.countOfItemsAtRow(i);
            }
            var perWidth = maxWidth / itemCount;
            var curHeight = delegate.rowHeight
                ? delegate.rowHeight(i)
                : maxHeight / rowNum;
            sumHeight += curHeight;
            for (var j = 0; j < itemCount; j++) {
                var item;
                if (delegate.itemAtIndex) {
                    item = delegate.itemAtIndex(i, j, count);
                    if (cc.sys.isObjectValid(item)) {
                        panel.addChild(item);
                        item.setAnchorPoint(0.5, 0);
                        item.setPosition(j * perWidth + perWidth / 2, maxHeight - sumHeight + 10);
                        count++;
                    }
                }
            }
        }
    }
});
//格式化buff数据
X.fmtBuff = function(buff, fmt,args) {
    var args = args || {};

    function handle() {
        var name = L(k);
        if (k.indexOf('pro') > 0 || k.indexOf('drop') > 0){
            // b = Math.floor(b * 1000)/10 + '%';
            b = Math.floor(b) / 10 + '%';
        }
        var obj = {
            tip:X.STR(fmt,L(name),b),
            name:name,
            sz:b,
            k:k
        };
        list.push(obj);
    }

    //不过滤值为0的buff，默认情况下是直接过滤掉的
    var noFiltValZero = args.nofilterZero;
    var list = [];
    fmt = fmt || '+{2}{1}';
    for (var k in buff){
        var b = Math.abs(buff[k]);
        if (noFiltValZero) {
            handle();
        } else {
            if (b){
                handle();
            }
        }

    }
    return list;
};

// G.getItemNum = function(a, t, used) {
//     if (a == 'attr') {
//         return P.gud[t];
//     }
//     if (a == 'item') {
//         return 0; // G.DAO.beibao.getItemNumByItemId(t);
//     }
//     if (a == 'hunshi') {
//         return G.DAO.shenyuanduohun.getHunShiNumByHsid(t, used);
//     }
// };

//螺旋阵列算法
G.grass = function(row, col, start, arr) {
    var startRow = 0,
        startCol = 0,
        curRow = 0,
        curCol = 0,
        endRow = row - 1,
        endCol = col - 1;
    for (var i = 0; i < row * col; i++) { ~ function(v) {
            arr[curRow] = arr[curRow] || [];
            arr[curRow][curCol] = v;
            if (curRow < endRow && curCol == startCol) {
                curRow++;
            } else if (curRow == endRow && curCol < endCol) {
                curCol++;
            } else if (curRow == endRow && curCol == endCol) {
                curRow--;
            } else if (curRow > startRow && curCol == endCol) {
                curRow--;
            } else if (curRow == startRow && curCol == endCol) {
                curCol--;
            } else if (curRow == startRow && curCol > startCol + 1) {
                curCol--;
            } else if (curRow == startRow && curCol == startCol + 1) {
                startRow++;
                startCol++;
                endRow--;
                endCol--;
                curRow++;
            }
        }(i + start);
    }
};

//获得出售按钮文字
X.showSaleFrame = function(conf) {
    var data = conf.data;
    var intr = conf.intr;
    var callback = conf.callback;

    var saleData = G.class.saledata.getItem(data.a, data.t);
    var str2 = X.STR(conf.intr, saleData.sale[0].n);
    var btnTitleArr = [];
    var myOwnNum = data.a == 'item'
        ? G.frame.beibao.getItemNumByItemId(data.t)
        : G.frame.zhuangbei.getZhuangBeiNumByEid(data.t);
    var saleNum = 0;
    for (var i = 0; i < saleData.title.length; i++) {
        var num = saleData.title[i];
        var str;
        if (num == 1) {
            // str = L('BTN_CS');
            str = X.STR(L('CS_X'), num);
        } else if (num == -1) {
            str = L('CS_0');
        } else {
            if (myOwnNum < num) {
                str = L('CS_0');
                saleNum = myOwnNum;
            } else {
                str = X.STR(L('CS_X'), num);
                saleNum = num;
            }
        }
        btnTitleArr.push(str);
    }

    G.frame.alert.data({
        sizeType: 3,
        cancel: {
            wz: btnTitleArr[1]
        },
        cancelCall: function() {
            if (myOwnNum < 1) {
                G.tip_NB.show(L('SALEDATA_BZU'));
                return;
            }
            G.frame.iteminfo.sale([
                data.a, data.t, saleNum
            ], function(d) {
                var prize = [
                    {
                        a: saleData.sale[0].a,
                        t: saleData.sale[0].t,
                        n: saleData.sale[0].n * saleNum
                    }
                ];
                G.tip_NB.show(X.createPrizeInfo(prize, 0, 1));
                var ownNum = data.a == 'item'
                    ? G.frame.beibao.getItemNumByItemId(data.t)
                    : G.frame.zhuangbei.getZhuangBeiNumByEid(data.t);
                if (ownNum < 1) {
                    G.frame.alert.hide();
                }
                callback && callback(d);
            });
        },
        ok: {
            wz: btnTitleArr[0]
        },
        okCall: function() {
            if (myOwnNum < 1) {
                G.tip_NB.show(L('SALEDATA_BZU'));
                return;
            }
            G.frame.iteminfo.sale([
                data.a, data.t, saleData.title[0]
            ], function(d) {
                var prize = [
                    {
                        a: saleData.sale[0].a,
                        t: saleData.sale[0].t,
                        n: saleData.sale[0].n * saleData.title[0]
                    }
                ];
                G.tip_NB.show(X.createPrizeInfo(prize, 0, 1));
                var ownNum = data.a == 'item'
                    ? G.frame.beibao.getItemNumByItemId(data.t)
                    : G.frame.zhuangbei.getZhuangBeiNumByEid(data.t);
                if (ownNum < 1) {
                    G.frame.alert.hide();
                }
                callback && callback(d);
            });
        },
        autoClose: false,
        close: true,
        richText: str2,
        nohide: true
    }).show();

};

//获得佣兵json
X.getArmyJson = function(data) {

    var json;
    if (data.skin && data.skin != '') {
        json = G.class.armyskin.getJsonById(data.skin);
    } else {
        json = G.gc.hero[data.hid].json;
    }

    return json;
};
//通过配置表现动画
X.playDefaulyAni = function(arg) {
    alert('X.playDefaulyAni需要废弃，请直接使用G.class.ani.show');
    // var arg = {
    //     ui:'',
    //     json:'',
    //     tag:'',
    //     pos:'',
    //     repeat:'',
    //     cache:'',
    //     autoRemove:'',
    //     startCall:'',
    //     endCall:''
    // };

    /*while (arg.ui.getChildByTag(arg.tag)) {
        arg.ui.getChildByTag(arg.tag).remove();
    }

    G.class.ani.show({
        addTo: arg.ui,
        json: arg.json,
        x: arg.pos.x,
        y: arg.pos.y,
        repeat: arg.repeat || false,
        autoRemove: arg.autoRemove,
        cache: arg.cache,
        onload: function (node, action) {
            node.setTag(arg.tag);
            arg.startCall && arg.startCall(node, action);
        },
        onend: function (node, action) {
            arg.endCall && arg.endCall(node, action);
        }
    });
    */
};
//抽奖转盘动画
X.showZhuanPanAni = function zpAni(target, type, imgXzk, icoArr, zxIndex, callback) {
    imgXzk.show();
    var speedTime = 1000; //speed变化间隔
    var iTime = 0; //speed变化引起的时长变化
    var times = 0; //speed变化次数
    var copyIcoArr = []; //icoArr数组拷贝
    var oneTimes = 2;
    var tenTimes = 2;

    addTimer3();
    clearTimer2();
    target._zpTimer2 = target.setInterval(function() {
        times++;
        if (type == 1 && times >= oneTimes) {
            times = oneTimes;
        }
        if (type == 10 && times >= tenTimes) {
            times = tenTimes;
        }
        addTimer3();
    }, speedTime);

    function addTimer3() {
        iTime = type == 10
            ? (50 - times * 25) / 10
            : 50 + times * 100;
        //console.log('times=',times);
        clearTimer3();
        target._zpTimer3 = target.setInterval(function() {
            if (copyIcoArr.length <= 0) {
                copyIcoArr = [].concat(icoArr);
            }
            var ico = copyIcoArr.shift();
            imgXzk.setPosition(ico.getPosition());
            //to 抽奖10次逻辑
            if (type == 10 && times == tenTimes) {
                clearTimer2();
                clearTimer3();
                //console.log('zhongjiang10==');
                // callback && callback();
                target.setTimeout(function() {
                    callback && callback();
                }, 500);
            }

            //to 抽奖一次逻辑
            if (type == 1 && times == oneTimes && X.arrayFind(icoArr, ico) == zxIndex) {
                clearTimer2();
                clearTimer3();
                //console.log('zhongjiang1==',zxIndex + 1);
                target.setTimeout(function() {
                    callback && callback();
                }, 500);

            }
        }, iTime);
    }

    function clearTimer2() {
        if (target._zpTimer2) {
            target.clearInterval(target._zpTimer2);
            delete target._zpTimer2;
        }
    }

    function clearTimer3() {
        if (target._zpTimer3) {
            target.clearInterval(target._zpTimer3);
            delete target._zpTimer3;
        }
    }
};

//判断日期是否满足要求
X.compareDate = function(time1, time2, intervalTime) {
    var intervalTime = intervalTime || 0;

    function getFormat(time) {
        var date = new Date(time * 1000);

        return X.STR('{1}-{2}-{3}', date.getFullYear(), date.getMonth(), date.getDate());
    }

    return getFormat(time1) == getFormat(time2 - intervalTime);
};
//切换到下一个
X.showNext = function(v, args) {
    var idx = args.idx,
        panelTouch = args.panelTouch,
        list = args.list,
        item = args.item,
        preCall = args.preCall,
        repeat = args.repeat || false,
        callback = args.callback;

    panelTouch.setTouchEnabled(false);
    preCall && preCall();
    if (item) {
        if (!repeat && (idx == 0 || idx == list.length - 1)) {
            handle();
        } else {
            item.moveBy(0.3, cc.p(-C.WS.width / 2 * v, 0)).then(function() {
                handle();
            }).run();
        }
    } else {
        handle();
    }

    function handle() {
        var nextIdx = idx + v;
        if (repeat) {
            if (nextIdx < 0) {
                nextIdx = list.length - 1;
            } else if (nextIdx > list.length - 1) {
                nextIdx = 0;
            }
        } else {
            if (nextIdx < 0) {
                nextIdx = 0;
            } else if (nextIdx > list.length - 1) {
                nextIdx = list.length - 1;
            }
        }

        callback && callback(nextIdx);
    }
};
X.getTopFrames = function() {
    var topFrame = [];
    for (var k in G.openingFrame) {
        if (G.frame[k].isTop) {
            topFrame.push(k);
        }
    }
    return topFrame;
};

//附加当前uid后缓存数据
X.cacheByUid = function(key, data) {
    if (!P || !P.gud || !P.gud.uid) {
        console.log('P.gud.uid参数有误======', 1);
        return;
    }
    var uid = P.gud.uid;

    var newKey = uid + '_' + key;
    if (data != undefined) {
        X.cache(newKey, JSON.stringify(data));
    } else {
        try {
            return JSON.parse(X.cache(newKey));
        } catch (e) {
            return null;
        }

    }
};
// 删除附加当前uid后的缓存数据
X.delCacheByUid = function(key) {
    if (!P || !P.gud || !P.gud.uid) {
        console.log('P.gud.uid参数有误======', 1);
        return;
    }
    var uid = P.gud.uid;

    var newKey = uid + '_' + key;
    if (X.cache(newKey)) {
        delete X.delCache(newKey);
    }
};
//获得指定时间的日期格式
X.getDateByTime = function(t) {
    var time = new Date(t * 1000);
    var y = time.getFullYear(),
        m = time.getMonth() + 1, //获取当前月份的日期
        d = time.getDate();

    return y + '/' + m + '/' + d;
};

//该方法需要废弃，如果有用到此方法的地方，请查看base/bx中的 X.moment  X.timetostr   X.timeout   X.timeLeft
X.timeFormat = function(t1, t2) {
    console.trace("trace");
    alert('X.timeFormat需要废弃，请查看base/bx中的 X.moment  X.timetostr   X.timeout   X.timeLeft');
};

X.addCenterChild = function(target, child) {
    if (!cc.isNode(target) || !cc.isNode(child)) {
        cc.log('target or child is not a node');
        return;
    }
    target.removeAllChildren();
    target.addChild(child);
    child.setPosition(cc.p(target.width / 2, target.height / 2));
};

//带勋章的名字
X.createXzName = function(target, data, pos) {
    target.removeAllChildren();
    var xid = data.xunzhang || data;
    var conf = G.class.zaoxing.getXunZhangById(xid);

    var rh = new X.bRichText({size: 20, lineHeight: target.height, maxWidth: target.width, color: '#ffffff'});
    var fmtStr = '<font node=1></font><font color=#ffffff>{1}</font>';
    var img = new cc.Sprite('item/' + conf.img);
    // img.loadTexture('item/' + conf.img, ccui.Widget.LOCAL_TEXTURE);
    // img.loadTexture('img/public/ico/ico_bg_wq1.png', ccui.Widget.PLIST_TEXTURE);
    img.setScale(0.3);
    var lay = new ccui.Layout();
    lay.setContentSize(20, 20);
    lay.addChild(img);
    img.setPosition(cc.p(0, 10));
    rh.text.apply(rh, [
        X.STR(fmtStr, data.name),
        lay
    ]);
    var ppp = pos || cc.p(10, 10);
    rh.setPosition(ppp);

    target.addChild(rh);
};
/*
*  conf:{
       count:2,
       texture:[],
       title:[],
       callback:[fun,fun,fun],
       btnData:[]
*  }
*/
X.addBtn = function(panel, conf) {
    if (!conf) {
        cc.log('conf is required');
        return;
    }
    if (!conf.count) {
        cc.log('count is required');
        return;
    }
    for (var i = 0; i < conf.count; i++) {
        var btn = new ccui.Button();
        btn.setTouchEnabled(true);
        btn.setName('btn_cancel');
        btn.setAnchorPoint(C.ANCHOR[5]);
        btn.setTitleFontSize(24);
        btn.loadTextureNormal('img/public/btn/' + (
        conf.texture && conf.texture[i]), ccui.Widget.PLIST_TEXTURE);
        btn.setTitleText((conf.title && conf.title[i]) || '');
        btn.setTitleFontName(G.defaultFNT);
        btn.data = (conf.btnData && conf.btnData[i]) || null;
        btn.callback = conf.callback[i];
        btn.click(function(sender, type) {
            sender.callback && sender.callback(sender.data);
        });
        panel.addChild(btn);
    }
    var w = panel.width;
    var h = panel.height;
    var count = panel.getChildrenCount();
    for (var k = 0; k < count; k++) {
        var button = panel.getChildren()[k];
        var size = button.getSize();
        var x = w / 2 + (k + .5 - count / 2) * (size.width + 80);
        var y = h / 2;
        button.setPosition(cc.p(x, y));
    }
};
//通过G。time获得本周周一零点的时间
X.getLastMondayZeroTime = function() {
    var time = new Date(G.time * 1000);
    var week = time.getDay();
    var hours = time.getHours();
    var mins = time.getMinutes();
    var secs = time.getSeconds();

    if (week == 0) {
        week = 7;
    }

    var offsetTime = (week - 1) * 24 * 60 * 60 + hours * 60 * 60 + mins * 60 + secs;

    return G.time - offsetTime;
};
//获得今天零点的时间
X.getTodayZeroTime = function() {
    //var time = new Date(G.time * 1000);
	//获取北京时间今天的0点
	var zoneOffset = 8;
	var offset = new Date().getTimezoneOffset()* 60 * 1000;
	var time = new Date(G.time*1000 + offset + zoneOffset*60*60*1000);


    var hours = time.getHours();
    var mins = time.getMinutes();
    var secs = time.getSeconds();

    var offsetTime = hours * 60 * 60 + mins * 60 + secs;

    return G.time - offsetTime;
};
// 奖励根据一定的格式对其
X.alignItems = function(ui, dataArr, type, extraParams) {
    if (!ui) {
        console.log('参数错误======', 1);
        return;
    }

    ui.removeAllChildren();

    if (!cc.isArray(dataArr)) {
        console.log('参数为数组======', 1);
        return;
    }

    var types = {
        left: 0,
        center: 1,
        right: 2
    };
    var name = extraParams.name || false;
    var interval = extraParams.interval || 10;
    var scale = extraParams.scale || 1;
    var touch = extraParams.touch || false;
    var outline = extraParams.outline;
    var callback = extraParams.callback;
    var mapItem = extraParams.mapItem;

    var alignment = types[type] || types['left'];

    switch (alignment) {
        case 0:
            left();
            break;
        case 1:
            //居中对齐的间隔，目前是定死的，如有必要，需要修改源码
            X.alignCenter(ui, dataArr, {
                name:name,
                touch:touch,
                scale:scale,
                mapItem:mapItem
            });
            break;
        case 2:
            right();
            break;
        default:
            break;
    }

    //回调便于满足定制化需求
    callback && callback(ui);

    function left() {
        for (var i = 0; i < dataArr.length; i++) {
            var p = G.class.sitem(dataArr[i], name);
            p.setAnchorPoint(cc.p(0, 0.5));
            p.setPosition(cc.p(i * (110 * scale + interval), ui.height / 2));
            if (outline) {
                X.enableOutline(p.title, cc.color('#000000'), 2);
            }
            p.scale = scale;
            mapItem && mapItem(p);
            ui.addChild(p);
            // if (p.conf && p.conf.color == 4){
            //     G.frame.fight_win.showItemDH(p);
            // }
            p.setTouchEnabled(false);
            if (touch) {
                p.setTouchEnabled(true);
                G.frame.iteminfo.showItemInfo(p);
            }
        }
    }
    function right() {
        for (var i = 0; i < dataArr.length; i++) {
            var p = G.class.sitem(dataArr[i], name);
            p.setAnchorPoint(cc.p(0, 0.5));
            p.setPosition(cc.p(ui.width - i * (110 * scale + interval) - 110 * scale, ui.height / 2));
            if (outline) {
                X.enableOutline(p.title, cc.color('#000000'), 2);
            }
            p.scale = scale;
            ui.addChild(p);
            // if (p.conf && p.conf.color == 4){
            //     G.frame.fight_win.showItemDH(p);
            // }
            p.setTouchEnabled(false);
            if (touch) {
                p.setTouchEnabled(true);
                G.frame.iteminfo.showItemInfo(p);
            }
        }
    }
};

X.fmtTimeStampToTime = function(stamp) {
    // stamp的单位是秒

    return new Date(stamp * 1000);
};
// 创建星级的显示
X.createStarsLayout = function(panel, star, args) {
    var align2type = {
        center: 0,
        left: 1,
        right: 2
    };
    
    args = args || {};
    //是否显示所有星
    var isAll = args.isall || false;
    var align = args.align || 'center';
    var scale = args.scale || 1;
    var interval = args.interval;
    var callback = args.callback;
    var isLight = args.isLight || false;
    var imgStar = args.imgstar;
    var cb = args.cb;

    panel.removeAllChildren();
    var width = panel.width;
    var height = panel.height;

    var pVal = args.maxStar || 5;
    var nVal = star;

    var imgLightStarPath = 'img/public/img_xing_h.png';
    //灰星暂未设置
    var imgGrayStarPath = imgStar || 'img/public/img_xing2.png';

    var imgLightStar = new ccui.ImageView(imgLightStarPath, 1);
    imgLightStar.setScale(scale);
    var starWidth = imgLightStar.width;
    var starHeight = imgLightStar.height;
    interval = interval || (width - imgLightStar.width * pVal * scale) / (pVal - 1);

    // 在英雄头像上时星星间隔1像素
    if (align2type[align] == 1) {
        interval = 1;
    }

    var imgStar,
        pos;
    if (isAll) {
        //显示所有星  所有星暂时没有除居中以外的排列
        var imgGrayStar = new ccui.ImageView(imgGrayStarPath, 1);
        imgGrayStar.setScale(scale);
        for (var i = 0; i < pVal; i++) {
            if (nVal > i) {
                imgStar = imgLightStar.clone();
            } else {
                imgStar = imgGrayStar.clone();
            }
            pos = cc.p(starWidth / 2 * scale + (interval + starWidth * scale) * i, height / 2);
            setStar(imgStar, i, pos);
        }
    } else {
        //仅显示拥有星
        var imgGrayStar = new ccui.ImageView(imgGrayStarPath, 1);
        imgGrayStar.setScale(scale);
        var startInterval = (width - starWidth * nVal * scale - (interval * (nVal - 1))) / 2;
        for (var i = 0; i < nVal; i++) {
            imgStar = isLight ? imgLightStar.clone() : imgGrayStar.clone();
            if (align2type[align] == 0) {
                pos = cc.p(startInterval + starWidth / 2 * scale + (interval + starWidth * scale) * i, height / 2);
            } else if (align2type[align] == 1) {
                pos = cc.p(starWidth / 2 * scale + (interval + starWidth * scale) * i, height / 2);
            }
            setStar(imgStar, i, pos);
        }
    }

    function setStar(imgStar, idx, pos) {
        imgStar.setName('star_' + (
        idx + 1));
        imgStar.setPosition(pos);
        panel.addChild(imgStar);
        cb && cb(imgStar);
    }

    callback && callback(panel);
};
X.autoLayout_new = function (args) {
    var types = {
        1:'left',
        2:'center',
        3:'right'
    };
    var parent = args.parent;
    var item = args.item;
    var num = args.num;
    var offset = args.offset || 0;
    var type = types[args.type || 2];
    var mapItem = args.mapItem;

    if (!parent || !item) {
        return;
    }
    if (num == undefined) {
        return;
    }

    parent.removeAllChildren();
    var maxWidth = parent.width;
    var itemWidth = item.width;

    var intervalWidth = {
        left: function () {
            return (maxWidth - (num * itemWidth)) / (num - 1);
        },
        center: function () {
            return (maxWidth - (num * itemWidth)) / (num + 1);
        },
        right: function () {
            return (maxWidth - (num * itemWidth)) / (num - 1);
        }
    };

    for (var i = 0; i < num; i++) {
        var wid = item.clone();
        if (type == 'center') {
            wid.setPosition(cc.p((intervalWidth[type]() + offset + itemWidth / 2) * (i + 1) + itemWidth / 2 * i,parent.height / 2));
        } else {
            //左右对齐需重新计算，目前是两端对齐
            wid.setPosition(cc.p(itemWidth / 2 * (i + 1) + (intervalWidth[type]() + offset + itemWidth / 2) * i,parent.height / 2));
        }
        wid.idx = i;
        parent.addChild(wid);

        mapItem && mapItem(wid);
    }
};
//快速查看ccui的json树信息
X.getCCUIJsonTree = function (json) {
    var arr = json.split('.');
    json = arr[0] + '.json';

    X.loadJSON(json, function (err,txt) {
        if (err) {
            console.log('err======', err);
            return;
        }

        getJsonTree(txt.Content.Content.ObjectData);
    });

    function getJsonTree(target) {
        if (!target || !target.Children || target.Children.length < 1) return;

        var className = null,
            str = '';
        className = target.ctype.split('ObjectData')[0];
        str = '(' + className + ') ===== ' + target.Name;
        if (target.FileData) {
            str += ' (Path === ' + target.FileData.Path + ')';
        }
        console.groupCollapsed(str);

        for (var i = 0; i < target.Children.length; i++) {
            var child = target.Children[i];
            if (!child.Children) {
                className = child.ctype.split('ObjectData')[0];
                str = '(' + className + ') ===== ' + child.Name;
                if (child.FileData) {
                    str += ' (Path === ' + child.FileData.Path + ')';
                }
                console.info(str);
            }
            getJsonTree(child);
        }
        console.groupEnd();
    }
};
//宝箱动画
X.addBoxAni = function (args) {
    var layIco = args.parent;
    var imgBox = args.boximg;
    var callback = args.callback;

    if (!layIco) {
        console.log('缺失参数======', 1);
        return;
    }

    G.class.ani.show({
        addTo:layIco,
        json:'ani_baoxianglingqu',
        x:layIco.width / 2,
        y:layIco.height / 2,
        repeat:true,
        autoRemove:false,
        onload: function (node,action) {
            node.finds('baoxiang').setBackGroundImage(imgBox, 1);
            callback && callback(node,action);
        }
    });
};
//node子节点缩放
X.setChildrenScale = function (args) {
    var parent = args.parent;
    var scale = args.scale;

    function check(target) {
        if (!target || target.getChildren().length < 1) return;

        for (var i = 0; i < target.getChildren().length; i++) {
            var child = target.getChildren()[i];
            if (child.getChildren().length < 1) {
                child.setScale(scale);
            } else {
                check(child);
            }
        }
    }

    check(parent);
};
//叠色方案
X.setNodeColor = function (args) {
    var bool = args.bool;
    var parent = args.parent;
    var colorArr = args.color || ['#AAAAAA', '#FFFFFF'];

    if (!parent.setColor) {
        console.log('node的setColor方法不存在！');
        return ;
    }

    parent.setColor(cc.color(colorArr[bool ? 1 : 0]));
};

//获得标题图片
X.getTitleImg = function (name) {
    return 'img/title_wz/wz_title_' + name + '.png';
};

X.playSound = function (sender, fromwhere){
    if(fromwhere == "fromcode") return;
    if(!(sender instanceof ccui.Button)) return;
    if(sender.data && sender.data.length < 1) return;

    var btnName = sender.getName();
    var noUSE = ["btn_yxjt$", "btn_rhjt$", "btn_jsfz$", "btn_sjs$", "btn_fst$", "btn_zhd$", "btn_xsrw$", "btn_jjc$",
        "btn_szjyz$", "btn_tjp$", "btn_lt$", "btn_mrsl$", "btn_xyc$", "btn_jchd$", "$btn_fanhui"];

    if(X.inArray(noUSE, btnName)) return;
    X.audio.playEffect("sound/dianji.mp3", false);
};

X.getVipIcon = function(vipLv) {
    var imgPath = "";

    if(vipLv <= 3) {
        imgPath = "img/sale/ico_sale_vip1.png";
    }else if(vipLv <= 6) {
        imgPath = "img/sale/ico_sale_vip2.png";
    }else if(vipLv <= 9) {
        imgPath = "img/sale/ico_sale_vip3.png";
    }else if(vipLv <= 12) {
        imgPath = "img/sale/ico_sale_vip4.png";
    }else {
        imgPath = "img/sale/ico_sale_vip5.png";
    }

    return imgPath;
};

X.playViewAni = function(view, father) {
    view.hide();
    var _view = view.clone();
    _view.show();

    _view.setPositionY(view.y - 500);
    father.addChild(_view);

    var action = cc.moveBy(0.2, cc.p(0, 500));
    _view.runAction(cc.sequence(action, cc.callFunc(function(){
        _view.removeFromParent();
        view.show();
    })))
};

X.playAniByJsonName = function(name, clean) {
    if(clean) {
        while (cc.director.getRunningScene().getChildByName("curAni")) {
            cc.director.getRunningScene().getChildByName("curAni").removeFromParent();
        }
        return;
    }
    G.class.ani.show({
        json: name,
        addTo: cc.director.getRunningScene(),
        x: cc.director.getRunningScene().width / 2,
        y: cc.director.getRunningScene().height / 2,
        repeat: true,
        autoRemove: false,
        onload: function (node) {
            node.setName("curAni");
        }
    })
};

X.setInput = function(target, callback) {
    target.addEventListener(function (sender, type) {
        switch (type) {
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                var str = parseInt(sender.getString().trim());
                if(!cc.isNumber(str) || isNaN(str)) str = 0;
                sender.setString(str);
                callback && callback();
                break;
            case ccui.TextField.EVENT_INSERT_TEXT:
                var str = sender.getString()[sender.getString().length - 1];
                if(!cc.isNumber(parseInt(str))) {
                    sender.setString(0);
                }
        }
    });
};

X.setInputIn = function(target, callback) {
    target.addEventListener(function (sender, type) {
        switch (type) {
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                var str = parseInt(sender.getString().trim());
                if(!cc.isNumber(str) || isNaN(str)) str = 0;
                sender.setString(str);
                callback && callback();
                break;
            case ccui.TextField.EVENT_INSERT_TEXT:
                var str = sender.getString()[sender.getString().length - 1];
                if(!cc.isNumber(parseInt(str))) {
                    sender.setString(0);
                }
                callback && callback();
                break;
            case ccui.TextField.EVENT_DELETE_BACKWARD:
                callback && callback();
                break;
        }
    });
};

X.addSpine = function(args) {
    var model = args.model;
    var parent = args.parent;
    var pos = args.pos || {x: 0, y: 0, z: 0};
    var isCache = args.cache || false;
    var callback = args.callback;
    var callbackNode = args.callbackNode;

    if(model.split("_").length > 1 && model.split("_")[0] * 1 > 0) {
        var str = model.split("_")[0];
        str = str.substring(0, str.length - 1);
        str += 'a';
        model = str;
    }

    X.spine.show({
        json:'spine/'+ model +'.json',
        addTo: parent,
        cache: isCache, x: pos.x, y: pos.y, z: pos.z,
        autoRemove: false,
        onload: function (node) {
            node.opacity = 255;
            node.stopAllAni();
            node.setTimeScale(1);
            callback && callback();
            callbackNode && callbackNode(node);
        }
    });
};

X.Filter = {
    DEFAULT_VERTEX_SHADER:
    "attribute vec4 a_position; \n"
    + "attribute vec2 a_texCoord; \n"
    + "varying mediump vec2 v_texCoord; \n"
    + "void main() \n"
    + "{ \n"
    + "    gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;  \n"
    + "    v_texCoord = a_texCoord; \n"
    + "}",

    GRAY_SCALE_FRAGMENT_SHADER:
    "varying vec2 v_texCoord;   \n"
    + "uniform sampler2D tex0; \n"
    + "void main() \n"
    + "{  \n"
    + "    vec4 texColor = texture2D(tex0, v_texCoord);  \n"
    + "    float gray = texColor.r * 0.299 + texColor.g * 0.587 + texColor.b * 0.114; \n"
    + "    gl_FragColor = vec4(gray, gray, gray, texColor.a);  \n"
    + "}",

    SEPIA_FRAGMENT_SHADER:
    "varying vec2 v_texCoord;   \n"
    + "uniform sampler2D tex0; \n"
    + "uniform float u_degree; \n"
    + "void main() \n"
    + "{  \n"
    + "    vec4 texColor = texture2D(tex0, v_texCoord);  \n"
    + "    float r = texColor.r * 0.393 + texColor.g * 0.769 + texColor.b * 0.189; \n"
    + "    float g = texColor.r * 0.349 + texColor.g * 0.686 + texColor.b * 0.168; \n"
    + "    float b = texColor.r * 0.272 + texColor.g * 0.534 + texColor.b * 0.131; \n"
    + "    gl_FragColor = mix(texColor, vec4(r, g, b, texColor.a), u_degree);  \n"
    + "}",
    SHADER_POSITION_GRAY_FRAG:
    "varying vec4 v_fragmentColor;\n"+
    "varying vec2 v_texCoord;\n"+
    ((typeof document !== 'undefined')? "uniform sampler2D CC_Texture0;\n":"")+
    "void main()\n"+
    "{\n"+
    "    vec4 v_orColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);\n"+
    "    float gray = dot(v_orColor.rgb, vec3(0.299, 0.587, 0.114));\n"+
    "    gl_FragColor = vec4(gray, gray, gray, v_orColor.a);\n"+
    "}\n",
    SHADER_POSITION_GRAY_VERT :
    "attribute vec4 a_position;\n"+
    "attribute vec2 a_texCoord;\n"+
    "attribute vec4 a_color;\n"+
    "\n"+
    "varying vec4 v_fragmentColor;\n"+
    "varying vec2 v_texCoord;\n"+
    "\n"+
    "void main()\n"+
    "{\n"+
    "gl_Position = "+ ((typeof document !== 'undefined')?"(CC_PMatrix * CC_MVMatrix)":"CC_PMatrix") + " * a_position;\n"+
    "v_fragmentColor = a_color;\n"+
    "v_texCoord = a_texCoord;\n"+
    "}",

    programs:{},

    /**
     * 灰度
     * @param sprite
     */
    grayScale: function (sprite) {
        var program = this.programs["grayScale"];
        if(!program){
            program = new cc.GLProgram();
            if(typeof document!== 'undefined'){
                //判断是否是web环境
                program.initWithString(this.DEFAULT_VERTEX_SHADER, this.GRAY_SCALE_FRAGMENT_SHADER);
            }else{
                program.initWithString(this.SHADER_POSITION_GRAY_VERT, this.SHADER_POSITION_GRAY_FRAG);
            }
            program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);        //cocos会做初始化的工作
            program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
            program.link();
            program.updateUniforms();
            this.programs["grayScale"] = program;
        }
        gl.useProgram(program.getProgram());
        sprite.shaderProgram = program;
    }
};
function api(api, args) {
    G.ajax.send(api, args, function(d) {
        if (!d) 
            return;
        var d = JSON.parse(d);
        if (d.s == 1) {
            console.log('返回数据======', d);
            return d;
        }
    });
}

//修改rootNode下的节点随机换颜色，用于提审时防截屏查重
var getRandomColor = function(){
    var str = '#';
    for(var i=0;i<6;i++){
        str += X.arrayRand(['a','b','c','d','e','f'])
    }
    return str;
};
function changeAllNodesColor(rootNode){
    if(!G.tiShenIng)return;
    rootNode.setColor && rootNode.setColor(cc.color(getRandomColor()));

    X.forEachChild(rootNode||cc.director.getRunningScene(),function(node){
        if( node instanceof ccui.ImageView ||  node instanceof cc.Sprite ||  node instanceof ccui.Button){
            node.color = cc.color(getRandomColor());
        }
    });
}