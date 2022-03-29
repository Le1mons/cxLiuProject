<?php
include_once ROOT."homm/orangeSDK.php";

$__url = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING'];
setFile('loginlog.txt',json_encode($_REQUEST));

$channel = r('channel');
$user = str_replace(' ','',r('user'));
$pwd = r('pwd');
$channelId = r('channelId');

if(isn($user) || isn($pwd)){
	we(json_encode(array(
		'result'=>-1,
		'errmsg'=>'用户名和密码必须填写'
	)));
}

$orangeData = postData(array(
	'event' => 'platformRegister',
	'channelId' => $channelId,
	'username' => $user,
	'password' => md5($pwd . $gameSecret),
	'createdTime' => time()
));

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
			'myu'=> 'appstore_'.$user,
			'userStatus' => $orangeData['userInfo']['userStatus'],
			'specialUser' => $orangeData['userInfo']['specialUser']
		));
	}
}

?>
