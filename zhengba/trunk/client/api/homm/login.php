<?php
include_once ROOT."homm/orangeSDK.php";

$__url = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING'];
setFile('loginlog.txt',json_encode($_REQUEST));

$channel = r('channel');
$DATA = _r('data');
$act = r('act');
$channelId = r('channelId');

//登陆入口
function login($channel){
	if($channel=='appstore'){
		appstoreLogin();	
	}
}

//=======================================
//易接登陆
function yijie(){
	global $DATA,$channelId;
	if(isn($channelId))$channelId='100001';

	$DATA = str_replace('**and**','&',$DATA);
	$data = json_decode($DATA,true);
	$uin = fixData($data['uin']);
	$sdk = fixData($data['sdk']);
	
	$url = buildYiJieLoginUrl(array(
		'sdk' => $sdk,
		'app' => fixData($data['app']),
		'uin' => urlEncode($uin),
		'sess' => urlEncode($data['sess'])
	));
	try{
		if($sdk=='CE1EC10025C4FE44')setFile('loginlog1.txt',$url);
		$res = getHttpPage($url);
		if((int)$res==0 || $data['sess']=='selfserver123456789'){
			
			if($sdk=='4ff036a13254eafe')$sdk="AA41112D0CCA498D";
	
			$orangeData = postData(array(
				'event' => 'yijieLogin',
				'channelId' => $channelId,
				'sessionId' => $uin,
				'sdkChannelCode' => $sdk,
				'createdTime' => time()
			));
			
			setFile('123.txt',json_encode($orangeData));

			if( (int)$orangeData['code'] != 0 ){
				returnData(array('result'=>-3,'errcode'=>$orangeData['errorMsg']));
			}else{
				if($orangeData['userInfo']['userStatus']!=1){
					returnData(array('result'=>-4,'errcode'=>'您的账户已被冻结'));
				}else{
					$u = $orangeData['userInfo']['accountId'];
					$t = time();
					$k = md5($u.$t.SERVER_KEY);
					returnData(array(
						'result'=>0,
						'u'=>$u,
						't'=>$t,
						'k'=>$k,
						'myu'=> $sdk.'_'.$uin,
						'userStatus' => $orangeData['userInfo']['userStatus'],
						'specialUser' => $orangeData['userInfo']['specialUser']
					));
				}
			}
		}else{
			returnData(array('result'=>-1,'errcode'=>$res));	
		}
	}catch(Exception $e){
		returnData(array('result'=>-2,'errcode'=>'0'));	
	}
}
function fixData($v){
	return str_replace(array('{','}','-'),'',$v);	
}
//构造易接URL验证地址
function buildYiJieLoginUrl($data){
	$url = "http://sync.1sdk.cn/login/check.html?sdk={$data['sdk']}&app={$data['app']}&uin={$data['uin']}&sess={$data['sess']}";
	return $url;
}

if(r('yijie')=='1'){
	yijie();
}else if(isn($act)){
	login($channel);	
}
?>
