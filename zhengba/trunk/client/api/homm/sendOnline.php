<?php
include_once ROOT."homm/orangeSDK.php";

$sid = r('sid');
$online = r('online');

if(isn($sid) || isn($online))exit("online or sid is null");

$orangeData = postData(array(
	'event' => 'pushOnline',
	'data' => array(
		'serverId' => $sid,
		'onlineCount' => $online,
	),
	'createdTime' => time()
));

echo json_encode($orangeData);
?>