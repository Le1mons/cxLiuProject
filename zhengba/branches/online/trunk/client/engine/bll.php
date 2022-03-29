<?php
require("common.php");
require("jsmin.php");
$auto_appConfig = array('//本文件由BLL中自动生成');

//生成designSize
function designSize(){
	global $auto_appConfig,$designSize,$resourceSize;
	$auto_appConfig[] = "var designSize = {'width':{$designSize[0]},'height': {$designSize[1]}};";
}

//重置project.json文件
function fixProjectJson(){
	$v = getFile('project.json');
	$json = json_decode($v,true);
	global $JSCONT;
	if(r('debug')=='1'){
		//$json['jsList'] = array("src/game.min.js?_=".md5($JSCONT)); //getSrcMin();
	}else{
		//$json['jsList'] = array("src/game.min.js");
	}

	$v = jsonFormat($json);
	if(isn($v)){
		we('project.json错误');	
	}else{
		setFile('project.json',$v);
		$v = str_replace('src/game.min.js','../src/game.min.js',$v);
		setFile('./exe/project.json',$v);
	}
}

function getVersion(){
	$v = getFile('_version.json');
	$json = json_decode($v,true);

	$diffVer = $_GET['ver'];
	if($diffVer=='develop' || $diffVer=='neiwang'){
		$json['versionName'] = '9.9';
		$json['versionCode'] = '99999999';
	}

	setFile('srczip/version.js',"//请勿直接修改本文件，在version.json中修改\r\nG.VERSION='". $json['versionName'] ."';\r\nG.VERSIONCODE='". $json['versionCode'] ."';");
	
	$packageUrl = $json['packageUrl'];
	$remoteManifestUrl = $json['remoteManifestUrl'];
	$remoteVersionUrl = $json['remoteVersionUrl'];

	if(!isn($diffVer)){
		$conftxt = getFile("diff/{$diffVer}/conf.json");
		if(!isn($conftxt)){
			$confjson = json_decode($conftxt,true);

			$packageUrl = $confjson['packageUrl'];
			$remoteManifestUrl = $confjson['remoteManifestUrl'];
			$remoteVersionUrl = $confjson['remoteVersionUrl'];
		}
	}

	$json['versionCode'] = $json['versionCode'];

	
	$manifest = array(
		"packageUrl" => $packageUrl,
		"remoteManifestUrl" => $remoteManifestUrl."&clientver=".$json['versionCode'],
		"remoteVersionUrl" => $remoteVersionUrl."&clientver=".$json['versionCode'],
		"version" => "".$json['versionCode'],
		"engineVersion" => "Cocos2d-JS V3.9",
		"assets" => array("del"=>"del"),
		"searchPaths" => array()
	);
	
	$manifestText = jsonFormat($manifest);
	
	$manifestText = str_replace(array(
			'\\/',
			'"del":"del"'
		),array(
			'/',
			''
	),$manifestText);
	setFile('res/_project.manifest',$manifestText);
	/*
	$manifest = getFile('res/_project.manifest');
	preg_match('/(clientver=\d*)\"/i',$manifest,$match);
	$manifest = str_replace($match[1],'clientver='.$json['versionCode'],$manifest);

	preg_match('/(\"version\" : \"\d*\"),/i',$manifest,$match2);
	$manifest = str_replace($match2[1],'"version" : "'. $json['versionCode'] .'"',$manifest);
	
	setFile('res/_project.manifest',$manifest);
	*/
}

//获取srcmin下所有js文件列表
function getSrcMin(){
	$js = getFileList('src/*.js');
	asort($js);
	return $js;
}

/** Json数据格式化
* @param  Mixed  $data   数据
* @param  String $indent 缩进字符，默认4个空格
* @return JSON
*/
function myJson($data){
	array_walk_recursive($data, 'jsonFormatProtect');
	$data = json_encode($data);
	$data = urldecode($data);
	return $data;
}
function jsonFormat($data, $indent=null){
    // 对数组中每个元素递归进行urlencode操作，保护中文字符
    array_walk_recursive($data, 'jsonFormatProtect');
    // json encode
    $data = json_encode($data);
    // 将urlencode的内容进行urldecode
    $data = urldecode($data);
    // 缩进处理
    $ret = '';
    $pos = 0;
    $length = strlen($data);
    $indent = isset($indent)? $indent : '    ';
    $newline = "\n";
    $prevchar = '';
    $outofquotes = true;

    for($i=0; $i<=$length; $i++){
        $char = substr($data, $i, 1);
        if($char=='"' && $prevchar!='\\'){
            $outofquotes = !$outofquotes;
        }elseif(($char=='}' || $char==']') && $outofquotes){
            $ret .= $newline;
            $pos --;
            for($j=0; $j<$pos; $j++){
                $ret .= $indent;
            }
        }

        $ret .= $char;
        if(($char==',' || $char=='{' || $char=='[') && $outofquotes){
            $ret .= $newline;
            if($char=='{' || $char=='['){
                $pos ++;
            }

            for($j=0; $j<$pos; $j++){
                $ret .= $indent;
            }
        }
        $prevchar = $char;
    }

    return $ret;
}

/** 将数组元素进行urlencode
* @param String $val
*/
function jsonFormatProtect(&$val){
    if($val!==true && $val!==false && $val!==null){
        $val = urlencode($val);
    }
}


//获取后缀
function getExtension($file){
	return pathinfo($file, PATHINFO_EXTENSION);
}

$RESFILES = array();
function listRES($dir){
	global $RESFILES;

    $dir .= substr($dir, -1) == '/' ? '' : '/';
    foreach (glob($dir.'*') as $v) {
        if(is_dir($v)){
            listRES($v);
        }else{
			$RESFILES[] = $v;
		}
    }
    return $RESFILES;
}


function listDir($dir,$ext){
	$dirInfo = array();

	if($dir=='res'){
		global $RESFILES;
		if(count($RESFILES)==0){
			listRES('res');
		}
		foreach ($RESFILES as $v) {
			if(getExtension($v)==$ext){
				$dirInfo[] = $v;
			}
		}
		return $dirInfo;
	}

    $dir .= substr($dir, -1) == '/' ? '' : '/';

    foreach (glob($dir.'*') as $v) {
        if(is_dir($v)){
            $dirInfo = array_merge($dirInfo, listDir($v,$ext));
        }else{
			if(getExtension($v)==$ext){
				$dirInfo[] = $v;
			}
		}
    }
    return $dirInfo;
}

function getFileList($dir){
	$list = glob($dir);
	return $list;
}

//生成JS文件列表
function setJSList(){
	global $auto_appConfig;
	$list = array();

	$base = getFileList('srczip/base/*.js');
	asort($base);
	foreach($base as $file){
		//base目录，排除common
		if(indexOf($file,'common.js')!=-1)continue;
		$list[] = $file;
	}
	
	$list[] = 'srczip/_myApp.js';
	$list[] = 'srczip/_lng.js';
	$list[] = 'srczip/_conf.js';

	$ui = getFileList('srczip/ui/*.js');
	foreach($ui as $file){
		$list[] = $file;
	}

	$ui = getFileList('srczip/ui/*/*.js');
	foreach($ui as $file){
		$list[] = $file;
	}
	
	$js = getFileList('srczip/*.js');
	asort($js);
	foreach($js as $file){
		//排除auto_appconfig
		if(indexOf($file,'auto_appconfig.js')!=-1)continue;
		if(indexOf($file,'_myApp.js')!=-1)continue;
		if(indexOf($file,'_lng.js')!=-1)continue;
		if(indexOf($file,'_conf.js')!=-1)continue;
		$list[] = $file;
	}

	//如果传递了ver参数，则把diff中对应的版本合并
	$diffVer = $_GET['ver'];
	if(!isn($diffVer)){
		$diffArray = getFileList("diff/{$diffVer}/*.js");
		asort($diffArray);
		$list =  array_merge($list,$diffArray);
	}

	array_unshift($list,'srczip/auto_appconfig.js','srczip/base/common.js');
	$jsCont = '';
	foreach($list as $_js){
		$_c = getFile($_js);
		//if(r('debug')!='1')$_c = JSMin::minify($_c);
		$jsCont.= ';'. $_c."\r\n;";
	}


	$jsCont = str_replace(array(
		'console.log',
		//'cc.log'
	),array(
		'cc.log',
		//'C.log'
	),$jsCont);
	
	
	if(r('debug')=='1'){
		$jsCont .= ';C["DEBUG"]=true;';
	}
	setFile('src/game.min.js',$jsCont);
	global $JSCONT;
	$JSCONT = $jsCont;
}


function noRes(&$res){
	foreach($res as $index=>$v){
		$res[$index] = str_replace('res/','',$v);
	}
}

//生成res资源列表
function setResList(){
	global $auto_appConfig;
	$list = array();
	$preLoadList = array();
	
	$txt = 'var R=R||{};';
	
//	$d = listDir('res','png');
//	foreach($d as $f){
//		if(indexOf($f,'.preload.')!=-1){
//			$preLoadList[] = $f;
//		}
//	}
//	
	//$d = listDir('res','ttf');
	//foreach($d as $f){
	//	$preLoadList[] = $f;
	//}

	$d = listDir('res','json');
	//压缩所有json文件
	if(r('min')=='1'){
		foreach(glob('res/*.json') as $f){
			$cc = file_get_contents($f);
			if(!isn($cc)){
				$decode = json_decode($cc,true);
				if(!isn($decode)){
					$_jsonRes = str_replace("\\/", "/",json_encode($decode));
					setFile($f,$_jsonRes);
				}
			}
		}
	}
	//$d = getFileList('res/*.json');
	//noRes($d);
	//$preLoadList = array_merge($preLoadList,$d);

	$d = listDir('res','plist');
	foreach($d as $f){
		$cc = file_get_contents($f);
		if(!isn($cc)){
			if(r('min')=='1'){
				$cc = str_replace(array("\r","\n","\t"),"",$cc);
				setFile($f,$cc);
			}
		}
	}

	
	/*
	$d = listDir('res','plist');
	foreach($d as $f){
		$cc = file_get_contents($f);
		if(!isn($cc)){
			if(r('min')=='1'){
				$cc = str_replace(array("\r","\n","\t"),"",$cc);
				setFile($f,$cc);
			}
			if(indexOf($cc,'maxParticles')!=-1){
				//干掉所有粒子
				$cc = preg_replace("/<key>maxParticles<\/key>\r\n\s{0,}<real>.*?<\/real>/is", "<key>maxParticles</key>\r\n<real>0</real>", $cc);
				
				//$ccc = str_replace('<integer>770</integer>','<integer>1</integer>',$cc);
				if($ccc!=$cc){
					setFile($f,$cc);
				}
			}
		}
	}
	*/

	$d = listDir('res','fnt');
	noRes($d);
    $preLoadList = array_merge($preLoadList,$d);

	$txt .= "\r\n//预加载\r\n R.preload=". str_replace('\/','/',json_encode($preLoadList)) .";";
	
	$auto_appConfig[] = $txt;
}

$moduleMap = json_decode(getFile('./frameworks/cocos2d-html5/moduleConfig.json'),true);
$jsAddedCache = array();


function getExtname($f){
	if(indexOf($f,'.')==-1)return "";
	$fArr = explode('.',$f);
	return $fArr[count($fArr)-1];
}
function getModuJS($module){
	global $moduleMap,$jsAddedCache;
	$tempList = $moduleMap['module'][$module];
	$jsList = array();
	for ($i = 0; $i < count($tempList); $i++) {
		$item = $tempList[$i];
		if($jsAddedCache[$item])continue;
		$extname = getExtname($item);
		
		if($extname==''){
			$arr = getModuJS($item);
			$jsList = array_merge($jsList,$arr);
		}else if($extname=='js'){
			$jsList[] = $item;
		}
		$jsAddedCache[$item] = true;
	}
	return $jsList;
}

function buildCocosMin(){
	global $jsAddedCache;
	$project = json_decode(getFile('./project.json'),true);
	$modules = $project['modules'];
	$jsList = array();
	foreach($modules as $index=>$m){
		$list = getModuJS($m);
		$jsList = array_merge($jsList,$list);
	}
	
	$jsContent=array();
	foreach($jsList as $js){
		$cont = getFile('./frameworks/cocos2d-html5/'.$js);
		if(isn($cont)){
			we("read $js error");
		}
		$jsContent[] = $cont;
	}
	setFile('./src/cocos.min.js',implode(";;;\r\n;;;",$jsContent));
}

designSize();
getVersion();
setJSList();
setResList();
setFile("srczip/auto_appconfig.js",implode("\r\n",$auto_appConfig));
fixProjectJson();
if(!is_file('./src/cocos.min.js')){
	buildCocosMin();
}


function strencode($string) {
    $string = base64_encode($string);
    $key = md5('mykeys');
    $len = strlen($key);
    $code = '';
    for ($i = 0; $i < strlen($string); $i++) {
        $k = $i % $len;
        $code .= $string [$i] ^ $key [$k];
    }
    return base64_encode($code);
}

function encodeJson(){
	$res=array();
	$arr = listDir('res/json/','json');
	$arr = array_merge($arr,listDir('res/samejson/','json'));

	foreach($arr as $f){
		$cont = getFile($f);
		$left1 = substr($cont,0,1);
		if($left1==ord(1))continue;
		$encode = ord(1).strencode($cont);
		$encode = strencode($cont);
		$cname = str_replace('.json','.conf',$f);
		setFile($f,$encode);
	}
}
//encodeJson();

?>
