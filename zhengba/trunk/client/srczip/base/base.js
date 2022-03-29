function _L(str){
    if(LNG[str]){
        return LNG[str];    
    }else{
        return str;
    }
}
function L(str,args){
    if(args==null)return _L(str);
    //将str中 $xx$ 的字符，替换为语言包里的配置，并且执行X.STR 逻辑
    str = str.replace(/\$\d*?\D+?\d*?\$/g,function(word){
        var _word = word.replace(/\$/g,'')
        return _L(_word);
    });

    if (cc.isArray(args)) {
        return X.STR(str, args);
    }else{
        var _arr = [];
        for(var i=1;i<arguments.length;i++){
            _arr.push(arguments[i]);
        }
        return X.STR(str, _arr);
    }
}