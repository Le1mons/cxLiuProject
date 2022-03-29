<?php
header('Access-Control-Allow-Origin: *');
error_reporting(0);
$URL = $_GET['apiUrl'];//'http://root.legu.cc/leguadmin/?app=api&gid=heros';

//获取文件内容
function _svrGetFile($filename,$clearBOM=1){
	$content = '';
	if(function_exists('file_get_contents')) {
		@$content = file_get_contents($filename);
	} else {
		if(@$fp = fopen($filename, 'r')) {
			@$content = fread($fp, filesize($filename));
			@fclose($fp);
		}
	}
	//清除BOM信息
	if($clearBOM==1){
		$charset[1]=substr($content, 0, 1);
		$charset[2]=substr($content, 1, 1);
		$charset[3]=substr($content, 2, 1);
		if (ord($charset[1])==239 && ord($charset[2])==187 && ord($charset[3])==191) {
			$content=substr($content,3);
		}	
	}
	return $content;
}

//写入文件
function _svrSetFile($filename, $writetext, $openmod='w') {
	if(@$fp = fopen($filename, $openmod)) {
		flock($fp, 2);
		fwrite($fp, $writetext);
		fclose($fp);
		return true;
	} else {
		return false;
	}
}

//更新列表
function update(){
	global $URL;
	$url = $URL;
	
	$res = file_get_contents($url);
	if($res!=''){
		return (int)(_svrSetFile('_svrlistauto_.txt',$res));	
	}else{
		return -1;
	}
}

//获取MD5
function getMd5(){
	$res = _svrGetFile('_svrlistauto_.txt');	
	return md5($res);
}

//获取配置数组
function getListArray(){
	$res = array();
	$txt = _svrGetFile('_svrlistauto_.txt');
	$arr = json_decode($txt,true);
	return $arr;	
}


//生成SID2GMAPI数组，主要用于原config.php中的配置
function sid2GMApi(){
	$res = array();
	$arr = getListArray();
	foreach($arr as $sid=>$data){
		$sid = (string)$sid;
		$port3Arr = explode(',',$data['port3']);
		$res[$sid] = $port3Arr[0];
	}
	return $res;
}


$act = $_GET['act'];
$callback = $_GET['callback'];

if($act=='update'){
	$res = update();
	echo "1";
}elseif($act=='md5'){
	$res = getMd5();
	echo $res;
}

?>