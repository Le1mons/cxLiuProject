;(function() {

    /*
     cc.loader.loadJSON不会处理cc.loader.resPath，并且没有优先热更目录，导致热更失效
     */
    X.load = function (file, callback) {

        if (cc.sys.isNative) {
            var resFile = file;
            var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
            var hotJson = storagePath + file;
            var _bak = cc.loader.resPath;

            if (jsb.fileUtils.isFileExist(hotJson)) {
                //如果热更目录里有，则优先热更目录
                resFile = hotJson;
                //cc.loader.load方法会自动加上cc.loader.resPath，这里需要去掉
                cc.loader.resPath = "";
            }
            cc.loader.load(resFile, function (err, json) {
                callback && callback(err, json);
            });
            cc.loader.resPath = _bak;
        } else {
            cc.loader.load(file, function (err, json) {
                callback && callback(err, json);
            });
        }
    };
    X.loadJSON = function (file, callback) {
        var resFile = cc.loader.resPath + '/' + file;
        if (cc.sys.isNative) {
            var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
            var hotJson = storagePath + file;
            if (jsb.fileUtils.isFileExist(hotJson)) {
                resFile = hotJson;
            }
        }
        cc.loader.loadJson(resFile, function (err, json) {
            callback && callback(err, json);
        });
    };

    //控制防止web下重复加载
    var _preloadState = {};
    var _preloadEvent = cc.EventEmitter.create();
    _preloadEvent.setMaxListeners(5000);

    cc.baseEvent.on('gameRestart',function(){
        _preloadEvent.removeAllListeners();
    });

    //预加载plist&png，并且addSpriteFrames所有plist
    X.loadPlist = function (files, callback) {
        if (!cc.isArray(files)) files = [files];

        function addSprite(fs) {
            for (var i = 0; i < fs.length; i++) {
                var fname = fs[i];
                if (cc.path.extname(fname) != '.plist')continue;
                cc.spriteFrameCache.addSpriteFrames(fname);
            }
        }

        if (files.length == 0) {
            files = null;
            callback && callback();
            return;
        }

        if (cc.sys.isNative) {
            addSprite(files);
            callback && callback();
        } else {
            //如果正在加载中，则不重复处理
            var _eventKey = 'plistLoaded_'+ files.join(',');
            var _state = _preloadState[_eventKey];
            if( _state == 'loading'){
                _preloadEvent.once(_eventKey,callback);
                return;
            }

            _preloadState[_eventKey] = "loading";
            cc.loader.load(files, function (result, count, loadedCount) {
            }, function () {
                delete _preloadState[_eventKey];
                addSprite(files);
                callback && callback();
                _preloadEvent.emit(_eventKey);
            });
        }
    };

    X._preloadJSON = function (json, callback) {
        var _eventKey = 'jsonLoaded_'+json;

        //如果正在加载中，则不重复处理
        var _state = _preloadState[_eventKey];
        if( _state == 'loading'){
            _preloadEvent.once(_eventKey,callback);
            return;
        }

        _preloadState[_eventKey] = "loading";
        cc.loader.load(json, function (res, result, loadedCount) {
            if (
                result && result[0] && result[0].Content && result[0].Content.Content
                && result[0].Content.Content.UsedResources
                && result[0].Content.Content.UsedResources.length > 0
            ) {
                var _resources = result[0].Content.Content.UsedResources;
                //cc.log('UsedResourcesInfo',json,_resources.length);
                X.loadPlist(_resources, function () {
                    delete _preloadState[_eventKey];
                    callback && callback();
                    _preloadEvent.emit(_eventKey);
                })
            } else {
                delete _preloadState[_eventKey];
                callback && callback();
                _preloadEvent.emit(_eventKey);
            }
        });
    }

    //加载CCUI的json配置，并预加载所需的资源
    X.ccui = function (json, callback, conf) {
        if (cc.sys.isNative) {
            var _loader = X.ccsload(json, conf);
            callback && callback(_loader);
            _loader = null;
        } else {
            X._preloadJSON(json, function () {
                //如果是web时，确保callback异步执行，统一逻辑
                cc.director.getRunningScene().setTimeout(function(){
                    var _loader = X.ccsload(json, conf);
                    callback && callback(_loader);
                    _loader = null;
                },0);
            });
        }
    };

    X.ccsload = function (file, conf) {

        var loadConf = {
            "action": true,
        };
        if (conf)cc.mixin(loadConf, conf, true);

        //cc.log('ccsload',file,JSON.stringify(conf));

        if (ccs.CSLoader && cc.sys.isNative && C.USECSB) {
            //如果扩展支持加载csb模式
            var csbfile = file.replace('.json', '.csb');
            var loader = {
                node: ccs.CSLoader.createNode(csbfile)
            };
            if (loadConf.action == true) {
                loader.action = ccs.CSLoader.createTimeline(csbfile);
            }
            loadConf = null;
            return loader;
        } else {
            var loader = ccs.load(file);
            //保持数据结构统一，不需要时删除掉action
            if (!loadConf.action) {
                delete loader.action;
            }
            loadConf = null;
            return loader;
        }
    };

    //设置或读取缓存
    X.cache = function (k, v) {
        if (v == null) {
            var v = cc.sys.localStorage.getItem(k);
            if (v != null)v = decodeURIComponent(cc.sys.localStorage.getItem(k));
            return v;
        } else {
            cc.sys.localStorage.setItem(k, encodeURIComponent(v));
        }
    };
    //清空缓存
    X.delCache = function (k) {
        cc.sys.localStorage.removeItem(k);
    };

    //字符串转json
    X.toJSON = function (str) {
        var _json = null;
        try {
            _json = JSON.parse(str);
        } catch (e) {
            cc.log('to JSON ERROR=' + str);
        }
        return _json;
    };

    function _S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    //生成UUID，s4Len=多少节，每节4位
    X.UUID = function (s4Len) {
        var str = "";
        for (var i = 0; i < s4Len; i++) {
            str += _S4();
        }
        return str;
    };

    /**
     * 随机字符串
     * @param n : Number(字符串长度)
     * @returns {string}
     * @constructor
     */
    X.UID = function (n) {
        var s = [];
        for (var i = 0; i < n; i++) {
            var a = parseInt(X.rand(0, 25)) + (Math.random() > 0.5 ? 65 : 97);
            s[i] = Math.random() > 0.5 ? parseInt(Math.random() * 9) : String.fromCharCode(a);
        }
        return s.join("");
    };

    /**
     * 判断对象类型
     * @param o : *
     * @param type : String(String|Number|Object|Array|...)
     * @returns {boolean}
     */
    X.instanceOf = function (o, type) {
        return toString.apply(o) === ('[object ' + type + ']') || typeof o === type.toLowerCase();
    };

    //生成under~over之间的闭区间整数
    X.rand = function (under, over) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * under + 1);
            case 2:
                return parseInt(Math.random() * (over - under + 1) + under);
            default:
                return 0;
        }
    };

    //从arr中随机取1个值
    X.arrayRand = function (arr) {
        return arr[X.rand(0, arr.length - 1)];
    };

    //数组洗牌，随机排序
    X.arrayShuffle = function(arr){
        for (var i = arr.length - 1; i > 0; i--) {
            var j = 0|(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    };

    /**
     * 找到所有key
     * @param object
     * @returns {Array}
     */
    X.clone = function(v, isIn){
        if (!v) return;
        var b;
        if (X.instanceOf(v,'Array')){
            b = [];
            for(var i = 0; i < v.length; i++){
                if(isIn) {
                    b.push(v[i]);
                }else {
                    b.push(X.clone(v[i]));
                }
            }
        }
        else{
            b = v.constructor ? new v.constructor : {};
            for(var k in v){
                var d = v[k];
                b[k] = (X.instanceOf(d,"Object") || X.instanceOf(d,"Array")) && d && !(d instanceof cc.Node) ? X.clone(d) : d;
            }
        }
        return b || v;
    };

    //X.STR('test{1}_xx{2}',['a','b'])  ->  testa_xxb
    X.STR = function () {
        if (arguments.length < 2) return;
        var str = arguments[0];
        if (arguments.length == 2 && cc.isArray(arguments[1])) {
            var args = arguments[1];
            for (var i = 0; i < args.length; i++) {
                var regx = new RegExp('\\{' + (i*1+1) + '\\}', 'g');
                str = str.replace(regx, args[i]);
            }
        } else {
            for (var i = 1; i < arguments.length; i++) {
                var regx = new RegExp('\\{' + i + '\\}', 'g');
                str = str.replace(regx, arguments[i]);
            }
        }
        return str;
    };
    /**
     * 是否在数组中
     * @param array : Array
     * @param item : Object
     * @returns {boolean}
     */
    X.inArray = function (array, item) {
        if (!array) return false;
        var a = ',' + array.join(',') + ',';
        return a.indexOf(',' + item + ',') > -1;
    };
    /**
     * 在数组中找，返回下标，如果没有返回-1
     * @param array : Array
     * @param item : Object
     * @param key : String
     * @returns {number}
     */
    X.arrayFind = function (array, item, key) {
        var idx = -1;
        for (var i = 0; i < array.length; i++) {
            if (array[i] == item || array[i][key] == item) {
                idx = i;
                break;
            }
        }
        return idx;
    };

    //当前时间戳
    X.time = function () {
        return Math.round(new Date().getTime() / 1000);
    };
    //格式化，x时前，或 还有x时 等格式
    //senconds=负数，表示x时前，senconds>=0 表示还有x时
    //fmtStrConf = {d:"{1}天前",h:"{1}小时前",mm:"{1}分钟前",j:"刚刚"}
    X.moment = function(senconds,fmtStrConf){
        fmtStrConf = fmtStrConf || {};
        var t;
        if(senconds<0){
            senconds = Math.abs(senconds);
            if (senconds >= 86400){
                t = Math.floor(senconds/86400);
                if (t > 3) t = 3;
                return X.STR(fmtStrConf.d||"{1}天前",t);
            }else if(senconds >= 3600){
                t = Math.floor(senconds/3600);
                return X.STR(fmtStrConf.h||"{1}小时前",t);
            }else if (senconds >= 60){
                t = Math.floor(senconds/60);
                return X.STR(fmtStrConf.mm||"{1}分钟前",t);
            }else {
                return fmtStrConf.j||"刚刚";
            }
        }else{
            if (senconds >= 86400){
                t = Math.floor(senconds/86400);
                return X.STR(fmtStrConf.d||"还有{1}天",t);
            }else if(senconds >= 3600){
                t = Math.floor(senconds/3600);
                return X.STR(fmtStrConf.h||"还有{1}小时",t);
            }else if (senconds >= 60){
                t = Math.floor(senconds/60);
                return X.STR(fmtStrConf.mm||"还有{1}分钟",t);
            }else{
                return fmtStrConf.j||"1分以内";
            }
        }
    };

    //将一个时间戳转换为文本格式
    X.timetostr = function(time,fmtStr){
        fmtStr = fmtStr || 'y-m-d h:mm:s';
        var t = new Date(time*1000);
        var y = t.getFullYear();
        var m = t.getMonth() + 1;
        var d = t.getDate();
        var h = t.getHours();
        var mm = t.getMinutes();
        var s = t.getSeconds();
        if (mm < 10) mm = '0' + mm;
        if (s < 10) s = '0' + s;

        fmtStr = fmtStr.replace(/y/ig,y);
        fmtStr = fmtStr.replace(/mm/ig,mm);
        fmtStr = fmtStr.replace(/m/ig,m);
        fmtStr = fmtStr.replace(/d/ig,d);
        fmtStr = fmtStr.replace(/h/ig,h);
        fmtStr = fmtStr.replace(/s/ig,s);
        return fmtStr;
    };

    /*
    * node = Label控件
    * toTime = 未来时间戳
    * conf = {"timeLeftStr":"h:mm:s||mm:s","showStr":"倒计时{1}"}
    * */
    X.timeout = function(node,toTime,endcall,stepcall,conf){
        if(!cc.isNode(node))return;
        G.time = G.time || X.time();
        conf = conf || {};
        toTime+=1;

        var setText = function () {
            //cc.log('xxxx',G.time,toTime);
            var _leftSeconds = toTime-G.time;
            var _leftStr = X.timeLeft(_leftSeconds,conf.timeLeftStr);

            if(conf.showStr)_leftStr = X.STR(conf.showStr,_leftStr);
            if(node instanceof ccui.Text || node instanceof ccui.TextBMFont || node instanceof ccui.TextField || node instanceof ccui.TextAtlas
                || node instanceof cc.LabelTTF || node instanceof cc.LabelAtlas  || node instanceof cc.LabelBMFont || node instanceof cc.TextFieldTTF){
                node.setString( _leftStr );
            }

            stepcall && stepcall(_leftStr);

            if(G.time >= toTime ){
                endcall && endcall();
                return;
            }
        };
        setText();

        if(node.__timeoutTimer){
            node.clearTimeout(node.__timeoutTimer);
            delete node.__timeoutTimer;
        }

        var _diffTime = toTime-G.time;
        if(_diffTime>1){
            node.__timeoutTimer = node.setTimeout(function(){
                setText();
            },1000,_diffTime-1);
        }

        return node.__timeoutTimer;
    };

    //将一个>0的秒数转换为h:mm:s 或者 mm:s 格式
    //fmtStr = h:mm:s || mm:s
    X.timeLeft = function(senconds,fmtStr){
        fmtStr = fmtStr || "h:mm:s";
        var h=0,mm=0,s=0;
        if(senconds>0){
            if(fmtStr.indexOf('h')!=-1){
                h = Math.floor(senconds/3600);
                mm = Math.floor((senconds%3600)/60);
                s = (senconds%3600)%60;
            }else{
                mm = Math.floor(senconds/60);
                s = (senconds%60)%60;
            }
        }
        if (s < 10)s = '0' + s;
        if (mm < 10)mm = '0' + mm;
        fmtStr = fmtStr.replace(/mm/ig,mm);
        fmtStr = fmtStr.replace(/h/ig,h);
        fmtStr = fmtStr.replace(/s/ig,s);
        return fmtStr;
    };

    //对一个[{"a":1,"b":1},{"a":2,"b":2}]的数据，通过指定的key+orderBy排序
    X.sortArrayByKey = function(array,key,orderBy){
        if(orderBy==null)orderBy='asc';
        array.sort(function(a,b){
            if(orderBy=='asc'){
                return a[key] - b[key];
            }else if(orderBy=='desc'){
                return b[key] - a[key];
            }
        });
        return array;
    };

    //数组[1,2,3]或[{"a":1},{"a":2}]中最大值
    X.maxOf = function (array,key)   {
        array.sort(function (a, b) {
            if (key){
                return b[key] - a[key];
            }
            return b - a;
        });
        return array[0];
    };

    //数组中最小值
    X.minOf = function (array,key)   {
        array.sort(function (a, b) {
            if (key){
                return a[key] - b[key];
            }
            return a - b;
        });
        return array[0];
    };

    //将 2015-8-12 15:00:00 这样的字符串，转为DATA型
    X.str2Date = function(str){
        return new Date(Date.parse(str.replace(/-/g,"/")));
    };

    /*
     链式异步执行
     X.async([function(callback){
        a(1,callback)
     },function(callback){
        b(2,callback)
     },function(callback){
        c(3,callback)
     }],function(){
        alert('over');
     });
     */
    X.async = function(funArray,endCall,delay){
        ~function next(){
            if(funArray.length==0){
                endCall && endCall();
                return;
            }
            if(delay && delay>0){
                var scene = cc.director.getRunningScene();
                scene && scene.setTimeout(function(){
                    var fn = funArray.shift();
                    fn && fn(next);
                },delay)
            }else{
                var fn = funArray.shift();
                fn && fn(next);
            }
        }();
    };

    /*
     在某个节点下通过name查找节点
     ifcache查找到后是否缓存，若缓存，可以提高二次查找时的速度，默认为false
     从fromNode开始查找
     a.b.c.d 的模式，表示按节点父子关系，逐一查找
     xx 的模式，表示递归查找到第一个符合的node为止
     */
    X.findChild = function(fromNode,v,ifcache){
        var node = fromNode;

        if(ifcache){
            fromNode._findCache = fromNode._findCache || {};
            if(fromNode._findCache[v]){
                cc.log('fromCache',v);
                return fromNode._findCache[v];
            }
        }

        var res = null;
        if(v.indexOf('.')!=-1){
            var child , segments = v.split('.');
            for (var i = 0; i < segments.length; i++) {
                var item = segments[i];
                child = node.getChildByName(item);

                /*var names=[],childs=node.getChildren();
                childs.forEach(function(_c){
                    names.push( _c.getName() );
                });
                cc.log('finds',item,node,child,names.join(','));*/

                if (child) {
                    node = child
                } else {
                    node = null;
                    break;
                }
            }
            res = node;
        }else{
            res = cc.seekWidgetByName(node,v);
        }

        if(ifcache){
            fromNode._findCache[v] = res;
        }

        return res;
    };

    /*
     使用举例：
     //MyName     : 递归访问fromNode的所有子节点。查找匹配name为 "MyName" 的子节点
     [STR] : 匹配[a-zA-z0-9]中的任意字符串
     [NUM] : 匹配任意数字
     Abby/Normal  在fromNode的孙子节点中查找 节点为"Normal"，且父节点为"Abby"的节点
     //Abby/Normal  递归访问fromNode的所有子节点，查找 节点为"Normal"，且父节点为"Abby"的节点

     对找到的节点，逐一执行callback，如果callback返回true，则会终止迭代
    */
    X.eachChild = function(fromNode,v,callback){
        if(v==null || v=="" || !callback || !cc.isNode(fromNode)){
            return;
        }
        if(!cc.sys.isNative){
            v = v.replace(/\[STR\]/g,'[a-zA-Z0-9]+');
            v = v.replace(/\[NUM\]/g,'[0-9]+');
        }else{
            v = v.replace(/\[STR\]/g,'[[:alnum:]]+');
            v = v.replace(/\[NUM\]/g,'[[:digit:]]+');
        }
        fromNode.enumerateChildren(v,function(child){
            return callback(child);
        });
    };

    //将一组btn设置为单选
    // X.radio = function(btns,onFocus,conf){
    //     var colorFocus,colorBlur;
    //     var outlineColor = null;
    //     conf = conf || {};

    //     if (conf.color) {
    //         colorFocus = conf.color[0];
    //         colorBlur = conf.color[1];
    //         if(typeof(colorFocus)=='string')colorFocus = cc.color(colorFocus);
    //         if(typeof(colorBlur)=='string')colorBlur = cc.color(colorBlur);
    //     }else{
    //         colorFocus = cc.color('#ffba35');
    //         colorBlur = cc.color('#b1b1b1');
    //     }

    //     if (conf.outline instanceof cc.color ) {
    //         outlineColor = conf.outline;
    //     }else if(conf.outline){
    //         outlineColor = cc.color('#553e1e');
    //     }

    //     for(var i=0;i<btns.length;i++){
    //         btns[i].touch(function(sender,type,fromwhere){
    //             if(type==ccui.Widget.TOUCH_ENDED){
    //                 if (fromwhere!='fromcode' && !sender.isBright()){
    //                     return;
    //                 }
    //                 for(var j = 0;j<btns.length;j++){
    //                     if(sender==btns[j]){
    //                         if (!sender.disable) {
    //                             sender.setBright(false);
    //                             sender.setTitleColor && sender.setTitleColor(colorFocus);
    //                             /*if (outlineColor != null && cc.isNode(btns[j].finds('wz'))) {
    //                              X.enableOutline(btns[j].finds('wz'),outlineColor);
    //                              }*/
    //                         }
    //                         sender.setTimeout(function(){
    //                             onFocus && onFocus(sender);
    //                             sender.onFocus && sender.onFocus();
    //                         },1);
    //                     }else{
    //                         if (!sender.disable) {
    //                             btns[j].setTitleColor && btns[j].setTitleColor(colorBlur);
    //                             btns[j].setBright(true);
    //                             sender.onBlur && sender.onBlur();

    //                             /*if (outlineColor != null && cc.isNode(btns[j].finds('wz'))) {
    //                              X.disableOutline(btns[j].finds('wz'));
    //                              }*/
    //                         }
    //                     }
    //                 }
    //             }
    //         });
    //     }
    // };

    var _radioData = {},
        _radioIndex = 0;
    X.radio = function(btns,onChange,obj,onTouch){
        var color1,color2;
        _radioIndex++;

        obj = obj || {};
        var color = obj.color;
        var cb1 = obj.callback1;
        var cb2 = obj.callback2;
        var onTxtColor = obj.noTextColor;

        if (color) {
            color1 = color[0];
            color2 = color[1];
        } else {
            color1 = '#e8fdff';
            color2 = '#9d8d8a';
        }
        for(var i=0;i<btns.length;i++){
            btns[i]._radioIndex = _radioIndex;

            if (btns[i].disableTouch){
                continue;
            }

            btns[i].touch(function(sender,type,fromwhere){
                if (type == ccui.Widget.TOUCH_BEGAN){
                      var txt = getText(sender);
                    !onTxtColor && txt && txt.setTextColor && txt.setTextColor(C.color(color1));
                    onTouch && onTouch(sender);
                }

                if ((type == ccui.Widget.TOUCH_CANCELED || type == ccui.Widget.TOUCH_MOVED) && sender.isBright()){
                    var txt = getText(sender);
                    !onTxtColor && txt && txt.setTextColor && txt.setTextColor(C.color(color2));
                    sender.setCurrent && sender.setCurrent(false);
                }
                if(type==ccui.Widget.TOUCH_ENDED){

                    if (fromwhere!='fromcode' && !sender.isBright()){
                        return;
                    }
                    if(obj && obj.cd!=null && obj.cd>0 && sender._radioIndex && fromwhere!='fromcode'){
                        var _myRadioIndex = sender._radioIndex;
                        var _lastTouchEnd = _radioData['r'+_myRadioIndex];
                        if(!_lastTouchEnd)_lastTouchEnd=0;

                        _radioData['r'+_myRadioIndex] = new Date().getTime();
                        if(new Date().getTime() - _lastTouchEnd < obj.cd){
                            cc.log('click fast...');
                            return;
                        }
                    }

                    if(sender.checkLv) {
                        G.tip_NB.show(sender.show);
                        return;
                    }

                    for(var j = 0;j<btns.length;j++){

                        var txt = getText(btns[j]);
                        if (!onTxtColor && txt) {
                            X.enableShadow(txt,cc.color('#34221d'));
                        }

                        if(sender == btns[j]){
                            if(!onTxtColor && txt && !obj.no_enableOutline){
                                X.enableOutline(txt,cc.color('#0A1021'),2);
                            }
                            if (!sender.disable) {
                                sender.setBright && sender.setBright(false);
                                sender.setTitleColor && sender.setTitleColor(C.color(color1));
                            }

                            if (!onTxtColor && txt) {
                                // txt.setColor && txt.setColor(C.color(color1));
                                txt.setTextColor && txt.setTextColor(C.color(color1));
                            }
                            sender.setCurrent && sender.setCurrent(true);
                            //sender.setTimeout(function(){
                                onChange && onChange(sender);
                            //},1);

                            cb1 && cb1(btns[j]);
                        }else{
                            if(!onTxtColor && txt && !obj.no_enableOutline){
                                X.enableOutline(txt,cc.color('#44281d'),2);
                            }
                            if (!btns[j].disable) {
                                btns[j].setTitleColor && btns[j].setTitleColor(C.color(color2));
                                btns[j].setBright && btns[j].setBright(true);
                            }

                            if (!onTxtColor && txt) {
                                // txt.setColor && txt.setColor(C.color(color2));
                                txt.setTextColor && txt.setTextColor(C.color(color2));
                            }
                            btns[j].setCurrent && btns[j].setCurrent(false);

                            cb2 && cb2(btns[j]);
                        }
                    }
                }
            });

            function getText(btn) {
                var children = btn.getChildren();
                var txt = null;
                for (var j = 0; j < children.length; j++) {
                    var child = children[j];
                    if (child instanceof ccui.Text) {
                        txt = child;
                        break;
                    }
                }
                return txt;
            }
        }
    };

    X.dumpUI = function (root, db, dumpIndex,ifRoot) {

        dumpIndex = dumpIndex || 1;
        db = db || {};
        ifRoot = ifRoot==null?true:false;

        if(!cc.isNode(root)){
            cc.log('X.dumpUI error,root is null');
            return;
        }
        var children = root.getChildren(),
            length = children.length;
        for (var i = 0; i < length; i++) {
            var child = children[i];

            var _key,
                _name = (child.getName ? child.getName() : null),
                _tag = (child.getTag ? child.getTag() : null),
                _index = dumpIndex;

            dumpIndex++;

            if (_name) {
                _key = '#idx# [' + _name + '] #widgetName#@@@' + _index;
            } else if (_tag) {
                _key = '#idx# [' + _tag + '] #widgetName#@@@' + _index;
            } else {
                _key = '#idx# [unkonw' + _index + '] #widgetName#@@@' + _index;
            }

            var _widgetName = "";
            for (var _n in ccui) {
                if (typeof(ccui[_n]) != 'function')continue;
                if (child instanceof ccui[_n]) {
                    _widgetName = _n;
                }
            }
            _key = _key.replace('#widgetName#', _widgetName);

            db[_key] = {};
            if (child.getChildrenCount() > 0) {
                X.dumpUI(child, db[_key],null,false);
            }
        }

        if (ifRoot) {
            function dump(arr, level) {
                var dumped_text = "";
                if (!level) level = 0;
                var level_padding = "";
                for (var j = 0; j < level + 1; j++) level_padding += "|   ";

                if (typeof(arr) == 'object') {
                    for (var item in arr) {
                        var value = arr[item];

                        var showItem = item.split('@@@')[0];
                        showItem = showItem.replace('#idx#', level);
                        if (typeof(value) == 'object') {
                            dumped_text += level_padding + showItem + "\n";
                            dumped_text += dump(value, level + 1);
                        }
                    }
                }
                return dumped_text;
            }

            console . log(dump(db));
            delete db;
            delete dumpIndex;
        }
    };
    //遍历所有节点
    X.forEachChild = function(root,callback){
        var children = root.getChildren();
        var len = children.length;
        for (var i=0;i<len;i++){
            callback && callback( children[i] );
        }
        for (var i=0;i<len;i++){
            X.forEachChild( children[i] , callback );
        }
    };

    //UI设计时，所有以 $ 结尾的控件，会自动以name为key，映射到view层的 saveTo 字典中，方便代码中直接绑定代码逻辑
    X.autoInitUI  = function(root,saveTo){
        if(!cc.isNode(root)){
            cc.log('root is null when X.autoInitUI');
            return;
        }
        if(saveTo==null)saveTo='nodes';
        root[saveTo] = {};

        X.forEachChild(root,function(node){
            if(node.name && (node.name.toString()).substr(-1)=='$') {
                var _key = node.name.substr(0, node.name.length-1);
                // if(root[saveTo][_key])cc.log("警告：view中出现同名的动态控件", _key);
                root[saveTo][ _key ] = node;
            }
        });
    };

    //将data数据，渲染到nodes集合中
    X.render = function(data,nodes){
        for(var name in data){
            var _node = nodes[name],
                _val = data[name];

            if(!cc.isNode(_node) ){
                cc.log('node is null when render','【===' + name + '===】',this._json||"");
                continue;
            }
            if(_val==null){
                cc.log('val is null when render',name,this._json||"");
                continue;
            }

            if (typeof(_val) == 'object' && !Array.isArray(_val)) {
                _node.attr( _val );
                continue;
            }

            //传入的是方法时
            if (typeof _val == 'function') {
                _val && _val(_node);
                continue;
            }

            if(_node instanceof ccui.Text || _node instanceof ccui.TextBMFont || _node instanceof ccui.TextField || _node instanceof ccui.TextAtlas
                || _node instanceof cc.LabelTTF || _node instanceof cc.LabelAtlas  || _node instanceof cc.LabelBMFont || _node instanceof cc.TextFieldTTF
            ){
                //文本
                _node.setString( _val + '');
            }else if(_node instanceof ccui.Slider || _node instanceof ccui.LoadingBar){
                //进度条
                _node.setPercent( _val );
            }else if(_node instanceof ccui.ImageView){
                //图片
                if( _val.substr(0,1) == '#' ){
                    _node.loadTexture(_val.substr(1,_val.length) , ccui.Widget.PLIST_TEXTURE);
                }else{
                    _node.loadTexture(_val , ccui.Widget.LOCAL_TEXTURE);
                }
            }else if(_node instanceof cc.Sprite){
                //精灵
                _node.setSpriteFrame( _val );
            }else if(_node instanceof ccui.Layout && (typeof(_val)=='string' || Array.isArray(_val))){
                //如果节点是layout且值是文本，则当做富文本处理，默认定位于node左上角
                var _richTextConf = cc.mixin(X.defaultRichTextConf,{
                    "maxWidth":_node.width
                }, true);

                //将颜色方法替换成键值对
                _richTextConf.color = _richTextConf.colorFunc();

                var rt = new X.bRichText(_richTextConf);
                rt.text.apply(rt, [].concat(_val));
                rt.setAnchorPoint(0, 1);
                rt.setPosition(cc.p(0,_node.height));
                _node.removeAllChildren();
                _node.addChild(rt);
            }else{
                cc.log('unkonwn node type when render',name,this._json||"");
            }
        }
    };


    X.releaseRes = function(res){
        //手动释放资源
        cc.each(res,function(v){
            var extName = cc.path.extname(v);
            if(extName=='.png'){
                cc.textureCache.removeTextureForKey(v);
            }else if(extName=='.plist'){
                cc.spriteFrameCache.removeSpriteFramesFromFile(v);
            }
        });
        cc.sys.isNative && cc.sys.os== cc.sys.OS_WINDOWS && cc.textureCache.getCachedTextureInfo && console . log(cc.textureCache.getCachedTextureInfo());
    },

    X.toFixed = function (v,n) {
        if ((v + '').indexOf('.') > 0)
            return X.removeInvalidZeroFromNum(v.toFixed(n));
        else
            return X.removeInvalidZeroFromNum(v);
    };

    X.clipString = function (str, len) {
        if (str.length > len){
            var s = str.substr(0,len) + '...';
            return s;
        }else{
            return str;
        }
    };

    X.keysOfObject = function(object){
        if(Object.keys){
            return object==null?[]:Object.keys(object);
        }else{
            var keys = [];
            if (object){
                for(var key in object){
                    keys.push(key);
                }
            }
            return keys;
        }
    };
})();
