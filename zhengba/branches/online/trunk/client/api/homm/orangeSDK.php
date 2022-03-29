<?php
$gameId = "888";
$URL = "sdk.yxorange.com";
$gameSecret = "EuT2GB0C9ZeLKYALFbPbYXSwFS%osrAxfTSlUjnu";

function postData($arr){
	global $gameId,$URL;
	$arr['gameId'] = $gameId;
	$arr['sign'] = sign($arr);

	$data_string = json_encode($arr);
	$ch = curl_init($URL);
	curl_setopt($ch, CURLOPT_POST, true);
	
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		'Content-Type: application/json',
		'Content-Length: ' . strlen($data_string))
	);
	$result = curl_exec($ch);
	$res = json_decode($result,true);

	$logFile = @fopen("log/". date("Y_m_d") ."_orangeSDK.txt",'a+');
	fwrite($logFile,$data_string."\r\n".$result."\r\n\r\n");
	fclose($logFile);

	return $res;
}

function sign($arr){
	global $gameSecret;
	$d = array(
		"event"=>$arr['event'],
		"createdTime"=>$arr['createdTime'],
		"gameId" => $arr['gameId'],
		"gameSecret"=> $gameSecret
	);
	$d2 = array();
	foreach($d as $k=>$v){
		$d2[] = $k.'='.$v;
	}
	$str = implode('&',$d2);
	return strtoupper(MD5($str));
}

?>
