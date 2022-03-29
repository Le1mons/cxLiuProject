<?php
include_once ROOT."homm/orangeSDK.php";

$sql = "select * from paylist where up2orange=0 and state=2 limit 3";
$rss = DB::getArray($sql);

echo "start";
foreach($rss as $rs){
	$orangeData = postData(array(
		'event' => 'yijiePayment',
		'serverId' => $rs['serverid'],
		'accountId' => $rs['binduid'],
		'amount' => ($rs['money']/100),
		'roleId' => $rs['uid'],
		'roleName' => $rs['role'],
		'roleLevel' => $rs['rolelv'],
		'gameOrderId' => $rs['orderid'],
		'transactionId' => $rs['payorder'],
		'createdTime' => $rs['ctime']
	));
	
	if( (int)$orangeData['code']==0){
		DB::exe("update paylist set up2orange=1 where orderid='{$rs['orderid']}'");
	}
}
?>