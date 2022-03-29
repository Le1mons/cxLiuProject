<?php
header("Content-type: text/html; charset=utf-8");

$txt = _r('txt');
$submit = r('submit');


function check(){
	global $txt;
	$files = array();
	if(is_file($txt)){
		$files[] = $txt;
	}
	if(is_dir($txt)){
		$res=array();
		$files = listDir($txt,'json');
	}
	if(count($files)==0){
		we('没有找到json文件');	
	}
	
	foreach($files as $f){
		xjson($f);	
	}
}

function xjson($file){
	$cont = getFile($file);
	if(indexOf($cont,'TextObjectData')==-1){
		return;	
	}
	
	echo '<br/>'.$file.'<br/><div style="margin:5px 0">';
	$json = json_decode($cont,true);
	
	if( ! $json['Version'] ){
		return;	
	}
	
	we($cont);
	
	echo '</div>';
}

function xobject($o,$parent){
	if($o['ctype']=='TextObjectData'){
		$color = RGBToHex($o['CColor']);
		echo "<span class='dot xx' style='background-color:{$color};' >{$o['LabelText']} ". $parent.$o['Name'] ."</span> " ;//<font color='{$color}'></font>
	}
	if($o['Children']){
		foreach($o['Children'] as $c){
			xobject($c , $parent.$o['Name'].'.' );	
		}
	}
}

function RGBToHex($rgb){
	$rgbArray = array(255,255,255);
	if(isset($rgb['R']))$rgbArray[0]=$rgb['R'];
	if(isset($rgb['G']))$rgbArray[1]=$rgb['G'];
	if(isset($rgb['B']))$rgbArray[2]=$rgb['B'];

    $hexColor = "#";
    $hex = array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
	
    for ($i = 0; $i < 3; $i++) {
		$r = null;
		$c = $rgbArray[$i];
		$hexAr = array();
		
		while ($c > 16) {
			$r = $c % 16;
			$c = ($c / 16) >> 0;
			array_push($hexAr, $hex[$r]);
		}
		
		array_push($hexAr, $hex[$c]);
		$ret = array_reverse($hexAr);
		$item = implode('', $ret);
		$item = str_pad($item, 2, '0', STR_PAD_LEFT);
		$hexColor .= $item;
    }
    return $hexColor;
}


?>
<style>
.dot{ padding:5px; margin:5px; display:inline-block;}
.xx{color:#fff;text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;
-webkit-text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;
-moz-text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;}
body{ font-family:Arial; font-size:12px;}
</style>
<form id="form1" name="form1" method="post" action="">
  输入要分析的文件或者目录：
  <label for="txt"></label>
  <input name="txt" type="text"  value="<?=$txt?>" id="txt" size="50" />
  <input type="submit" name="submit" id="submit" value="提交" />
</form>

<?php
if(!isn($txt) && !isn($submit)){
	echo "<hr/>";
	check();
}
?>