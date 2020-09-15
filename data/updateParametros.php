<?php
require_once("pdo.php");
require_once ("escribirLog.php");

$query = "update appusers";

$newPageSize = $_GET["tamPagina"];
$newSelectSize = $_GET["tamSelects"];
$newHistoryProducto = $_GET["tamHistorialProducto"];
$newHistoryGeneral = $_GET["tamHistorialGeneral"];

$cambioPagina = false;
$cambioLimiteSelects = false;
$cambioHistoryProducto = false;
$cambioHistoryGeneral = false;

if ($newPageSize !== "-1"){
  $_SESSION["tamPagina"] = $newPageSize;
  $queryPage = " tamPagina=".$newPageSize;
  $cambioPagina = true;
}

if ($newSelectSize !== "-1"){
  $_SESSION["limiteSelects"] = $newSelectSize;
  $queryLimiteSelects = " limiteSelects=".$newSelectSize;
  $cambioLimiteSelects = true;
}

if ($newHistoryProducto !== "-1"){
  $_SESSION["limiteHistorialProducto"] = $newHistoryProducto;
  $queryProducto = " historialProducto=".$newHistoryProducto;
  $cambioHistoryProducto = true;
}

if ($newHistoryGeneral !== "-1"){
  $_SESSION["limiteHistorialGeneral"] = $newHistoryGeneral;
  $queryGeneral = " historialGeneral=".$newHistoryGeneral;
  $cambioHistoryGeneral = true;
}


if ($cambioPagina){
  $query = $query." set".$queryPage;
}

if ($cambioHistoryProducto){
  if ($cambioPagina){
    $query = $query.",".$queryProducto;
  }
  else {
    $query = $query." set".$queryProducto;
  }
}

if ($cambioHistoryGeneral){
  if (($cambioPagina)||($cambioHistoryProducto)){
    $query = $query.",".$queryGeneral;
  }
  else {
    $query = $query." set".$queryGeneral;
  }
}

if ($cambioLimiteSelects){
  if (($cambioPagina)||($cambioHistoryProducto)||($cambioHistoryGeneral)){
    $query = $query.",".$queryLimiteSelects;
  }
  else {
    $query = $query." set".$queryLimiteSelects;
  }
}

$query = $query." where id_usuario=".$_SESSION['user_id'];

if ($cambioPagina || $cambioHistoryGeneral || $cambioHistoryProducto || $cambioLimiteSelects){
  $result1 = $pdo->query($query);
  if ($result1 !== FALSE) {
    $datos["resultadoDB"] = "OK";
  }
  else {
    $datos["resultadoDB"] = "ERROR";
  }
}
else {
  $datos["resultadoDB"] = "ERROR";
}

//$datos["resultadoDB"] = $query;
$json = json_encode($datos);
echo $json;
?>