<?php
require_once 'pdo.php';

$query = $_GET["query"];
$stmt = $pdo->query($query);

$queryTemp = explode('from', $query);
$query1 = "select count(*) from ".$queryTemp[1];

$datos = array();
$datos['rows'] = $pdo->query($query1)->fetchColumn();
while (($fila = $stmt->fetch(PDO::FETCH_ASSOC)) != NULL) { 
  $datos['resultado'][] = $fila;
}

$json = json_encode($datos);
echo $json;
?>