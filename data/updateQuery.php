<?php
require_once ("pdo.php");
require_once ("escribirLog.php");

$queries = (array)json_decode($_GET["query"],true);
$tam = count($queries);

$log = $_GET["log"];

$queryInsert = $queries[0];

if ($tam > 1){
  $queryUpdate = $queries[1];
}


$result = $pdo->query($queryInsert);
$dato = array();
if ($result !== FALSE) {
  if ($log === "SI") {
    escribirLog($queryInsert);
  }  
  if ($tam > 1){
    $result1 = $pdo->query($queryUpdate);
    if ($result1 !== FALSE) {
      if ($log === "SI") {
        //escribirLog($queryUpdate);
      }
      $dato["resultado"] = "OK";
    }  
    else {
      $dato["resultado"] = "ERROR UPDATE; pero el INSERT YA se hizo";
    } 
  }
  else {
    $dato["resultado"] = "OK";
  }
}
else {
  $dato["resultado"] = "ERROR INSERT";
}

$json = json_encode($dato);

echo $json;
?>