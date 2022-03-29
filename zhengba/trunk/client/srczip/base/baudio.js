(function(){
//声音处理类
var audioEngine = cc.audioEngine;

//反馈audioEngine在android上加载音效会卡，换成jsb.AudioEngine后不卡了……
var _type2files = {};

X.audio = {
    _musicPlaying: false,
    _curPlayFile: null,
    _effectsVolume : 1
    //播放音乐
    ,playMusic : function(file,ifLoop){
        if(cc.GLOBALTISHEN)return;
        if(cc.sys.os.toLowerCase()=='windows')return;
        this._musicPlaying = true;
        if (this._curPlayFile != file){
            this.stopMusic(this._curPlayFile);
            this._curPlayFile = file;
            return audioEngine.playMusic(file, ifLoop||false);
        }
    }
    //停止音乐
    ,stopMusic : function(file){
        return audioEngine.stopMusic(file);
    }
    //暂停音乐
    ,pauseMusic : function(){
        this._musicPlaying = false;
        return audioEngine.pauseMusic();
    }
    //继续音乐
    ,resumeMusic : function(){
        this._musicPlaying = true;
        return audioEngine.resumeMusic();
    }
    ,pauseResumeMusic: function(){
        if (this._musicPlaying) this.pauseMusic();
        else this.resumeMusic();
    }
    //回放音乐
    ,rewindMusic : function(){
        return audioEngine.rewindMusic();
    }
    //音乐是否播放中
    ,isMusicPlaying : function(){
        return audioEngine.isMusicPlaying();
    }
    //获取声音音量
    ,getMusicVolume : function(){
        return audioEngine.getMusicVolume();
    }
    //设置声音音量
    ,setMusicVolume : function(value){
        value = value / 2;
        return audioEngine.setMusicVolume(value);
    }
    //===================================
    //播放音效 返回soundId
    ,playEffect : function(file,ifRepeat,type){
        if(cc.GLOBALTISHEN)return;
        if(cc.sys.isNative && cc.sys.os != cc.sys.OS_IOS){
        	var soundid = jsb.AudioEngine.play2d(file, ifRepeat||false, this._effectsVolume!=null?this._effectsVolume:1);
        }else{
        	var soundid = audioEngine.playEffect(file,ifRepeat||false,1,0, X.audio.getEffectsVolume());
        }
        if(type){
            if(!_type2files[type])_type2files[type] = [];
            _type2files[type].push(soundid);
        }
        return soundid;
    }
    //停止音效
    ,stopEffect : function(soundId){
        if(soundId!=null){
        	if(cc.sys.isNative && cc.sys.os != cc.sys.OS_IOS){
        		jsb.AudioEngine.stop(soundId);
        	}else{
        		audioEngine.stopEffect(soundId);
        	}
        }
    }
    //停止音效
    ,stopEffectByType : function(type){
        if(!_type2files[type])return;
        if(_type2files[type].length==0)return;
        for(var i=0;i<_type2files[type].length;i++){
            this.stopEffect( _type2files[type][i] );
        }
        _type2files[type] = [];
    }
    //暂停音效
    ,pauseEffect : function(soundId){
    	if(soundId!=null){
        	if(cc.sys.isNative && cc.sys.os != cc.sys.OS_IOS){
        		jsb.AudioEngine.pause(soundId);
        	}else{
        		audioEngine.pauseEffect(soundId);
        	}
        }
    }
    //继续音效
    ,resumeEffect : function(soundId){
    	if(soundId!=null){
        	if(cc.sys.isNative && cc.sys.os != cc.sys.OS_IOS){
        		jsb.AudioEngine.resume(soundId);
        	}else{
        		audioEngine.resumeEffect(soundId);
        	}
        }
    }
    //暂停所有音效
    ,pauseAllEffects : function(){
        //audioEngine.pauseAllEffects();
    }
    //继续所有音效
    ,resumeAllEffects : function(){
        //audioEngine.resumeAllEffects();
    }
    //停止所有音效
    ,stopAllEffects : function(){
    	if(cc.sys.isNative && cc.sys.os != cc.sys.OS_IOS){
    		jsb.AudioEngine.stopAll();
    	}else{
    		audioEngine.stopAllEffects();
    	}
    }
    //释放音效
    ,unloadEffect : function(file){
        audioEngine.unloadEffect(file);
    }
    //获取音效音量
    ,getEffectsVolume : function(){
    	if(cc.sys.isNative && cc.sys.os != cc.sys.OS_IOS){
    		return this._effectsVolume;
    	}else{
    		return audioEngine.getEffectsVolume();
    	}
    }
    //设置音效音量
    ,setEffectsVolume : function(value){
    	if(cc.sys.isNative && cc.sys.os != cc.sys.OS_IOS){
    		this._effectsVolume = value!=null?value:1;
    	}else{
    		return audioEngine.setEffectsVolume(value*1);
    	}
    	//jsb.AudioEngine.setVolume(self._audioID, self._volume);  JSB里需要 audioID?
    }
};

})();