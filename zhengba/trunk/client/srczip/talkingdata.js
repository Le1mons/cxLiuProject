var TD = {
    'setAccount' : function(obj){
        var fun = 'TGA'+ (cc.sys.os == cc.sys.OS_IOS?':':'');
        jsbHelper.callNative(null,fun,{
            'act':'setAccount',
            'uid':obj.uid,
            'lv':parseInt(obj.lv)||1,
            'servername':obj.servername||'',
            'binduid' :obj.binduid||"",
            'serverid' : (P.gud.svrindex+"")
        });
    },
    'event' : function(eventName,dict){
        var fun = 'TGA'+ (cc.sys.os == cc.sys.OS_IOS?':':'');
        dict['act'] = "event";
        dict['eventname'] = eventName;

        jsbHelper.callNative(null,fun,dict);
    }
};