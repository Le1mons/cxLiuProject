<?php
/*
是否沙盒模式
开发和提审时，启用沙盒模式
正式上线时，关闭沙盒模式
*/

//setFile('iappaylog.txt',json_encode($_REQUEST));

$SANDBOX = false;
$_ProductCFG = array(
	'gold6' => array(6) //money
	,'gold30' => array(30)
	,'gold68' => array(68)
	,'gold128' => array(128)
	,'gold198' => array(198)
	,'gold328' => array(328)
	,'gold648' => array(648)

	,'yueka' => array(30)
	,'zhizunka' => array(98)

	,'libao1' => array(1)
	,'libao3' => array(3)
	,'libao6' => array(6)
);

//响应接口
$saleid=r("orderid");
$checkkey=_r("data");

function iapReturnData($arr){
	we( json_encode($arr) );
}

//如果参数有误
if($saleid=='' || $checkkey=='') iapReturnData(array('s'=>0,'retry'=>false,'d'=>'参数不完整'));	
//验证订单状态
$order = getOrder($saleid);
if(!$order) iapReturnData(array('s'=>0,'retry'=>false,'d'=>'订单不存在'));	
if($order['state']==2) iapReturnData(array('s'=>0,'retry'=>false,'d'=>'该订单已支付完成'));

//更新data1
try {
	DB::exesql(DB::update("paylist",array('data1'=>$checkkey),"orderid='".$saleid."'"));
}catch(Exception $e){} 


//与苹果APPSTORE交互
function getReceiptData($receipt, $isSandbox = false){
	if ($isSandbox) {
		$endpoint = 'https://sandbox.itunes.apple.com/verifyReceipt';
	}else{
		$endpoint = 'https://buy.itunes.apple.com/verifyReceipt';
	}

	$postData = json_encode(
		array('receipt-data' => $receipt)
	);

	$ch = curl_init();
	$timeout = 300;
	curl_setopt($ch, CURLOPT_URL, $endpoint);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 1); //post到https
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

	$response = curl_exec($ch);
	$errno    = curl_errno($ch);
	$errmsg   = curl_error($ch);
	curl_close($ch);
	
	if(isn($response))return false;
	
	//记录IAP返回值
	try {
		global $saleid;
		DB::exesql(DB::update("paylist",array('data2'=>$response),"orderid='".$saleid."'"));
	}catch(Exception $e){} 

	$data = json_decode($response);
	/*
	21000 App Store无法读取你提供的JSON数据
	21002 收据数据不符合格式
	21003 收据无法被验证
	21004 你提供的共享密钥和账户的共享密钥不一致
	21005 收据服务器当前不可用
	21006 收据是有效的，但订阅服务已经过期。当收到这个信息时，解码后的收据信息也包含在返回内容中
	21007 收据信息是测试用（sandbox），但却被发送到产品环境中验证
	21008 收据信息是产品环境中使用，但却被发送到测试环境中验证
	
	如果连接的是正式服务器，且返回值是21007，则启用沙盒模式再次判断
	*/
	if($isSandbox==false && $data->status==21007){
		return getReceiptData($receipt,true);
	}
	
	if($data->status!=0){
		return -1;
	}
	
	return array(
		'quantity'=>  $data->receipt->quantity,
		'product_id'=>  $data->receipt->product_id,
		'transaction_id'=>  $data->receipt->transaction_id,
		'purchase_date'=>  $data->receipt->purchase_date,
		'app_item_id'=>  $data->receipt->app_item_id,
		'bid'=>  $data->receipt->bid,
		'bvrs'=>  $data->receipt->bvrs
	);
}

$info=getReceiptData($checkkey,$SANDBOX);

//订单状态有误
if (!$info){
	iapReturnData(array('s'=>0,'retry'=>true,'d'=>'订单验证失败 若你确定已扣费 请联系客服'));	
}
if($info==-1){
	iapReturnData(array('s'=>0,'retry'=>false,'d'=>'非法订单'));
}


global $_ProductCFG;
if (!$_ProductCFG[$info['product_id']]){
	//检测产品ID是否正确，产品ID不存在
	iapReturnData(array('s'=>0,'retry'=>false,'d'=>'错误的产品'));	
}else{
	//产品正确，则更新价格和钻石
	$proConf = $_ProductCFG[$info['product_id']];

	DB::exesql(DB::update("paylist",array(
		'money'=>$proConf[0]*100,
		'proid'=>$info['product_id'],
	),"orderid='".$saleid."'"));	
}



//通知游戏接口记录订单信息
$result=completeOrderByOrderId($saleid,$info['transaction_id']);
$result = (int)$result;
if ($result==1){
	iapReturnData(array('s'=>1,'retry'=>false,'d'=>'购买成功'));
}else{
	iapReturnData(array('s'=>0,'retry'=>true,'d'=>'发放物品失败'));
}
?>