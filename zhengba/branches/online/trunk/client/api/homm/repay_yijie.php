<?php
$sql = "select * from paylist where state=1";
$rss = DB::getArray($sql);

foreach($rss as $rs){
	$result=completeOrderByOrderId($rs['orderid'],$rs['payorder']);
	$result = (int)$result;
	echo $rs['orderid'].'='.$result.'<br/>';
}
?>