<?php
//require_once("sesiones.php");
if(!isset($_SESSION)) 
  { 
  session_start(); 
} 
require_once("config.php");

function escribirLog($query){ 
  global $dirLog;
  //recupero la fecha actual para generar nombre del archivo:
  $hoy = getdate();
  //$fecha = $hoy['mday'].$hoy['month'].$hoy['year'];

  if (strlen($hoy['hours']) === 1) {
    $hora = "0".$hoy['hours'];
  }
  else {
    $hora = $hoy['hours'];
  }
  if (strlen($hoy['minutes']) === 1) {
    $min = "0".$hoy['minutes'];
  }
  else {
    $min = $hoy['minutes'];
  }
  if (strlen($hoy['seconds']) === 1) {
    $sec = "0".$hoy['seconds'];
  }
  else {
    $sec = $hoy['seconds'];
  }
  $horaLog = $hora.":".$min.":".$sec;

  setlocale(LC_ALL, 'es_UY');
  $dia = strftime("%d", time());
  $mes = ucwords(strftime("%B", time()));
  $year = strftime("%Y", time());
  $fecha = $dia.$mes.$year;
  
  //armo nombre del arhivo según fecha y hora actuales:
  $archivo = $dirLog."log_".$fecha.".txt";//."@".$hora;
  $query = "[".$_SESSION['username']."] ".$horaLog." - ".$query."\r\n";
  
  /// *********** ** AGREGADO PARA ESCRIBIR LINEAS AL INICIO EN LUGAR DE AL FINAL *******************************
  /// Chequeo primero si el archivo existe, si es así recupero contenido y agrego consulta al inicio. De lo contrario
  /// agrego solo la consulta.
  if (file_exists($archivo)){
    //guardo en otra variable el contenido actual
    $get = file_get_contents($archivo);
    //creo una variable con el nuevo+actual
    $nuevo = $query.$get;
    //borro el texto
    unlink($archivo);
  }
  else {
    $nuevo = $query;
  }
  /// *********    FIN AGREGADO PARA ESCRIBIR LINEAS AL INICIO EN LUGAR DE AL FINAL *****************************
  
  $gestor = fopen($archivo, "cb");
  if (!$gestor)
    {
    $mensaje = "No se puede ABRIR el archivo ($archivo). Por favor verifique.";
    exit;
  }
  else {
    if (fwrite($gestor, $nuevo) === FALSE)
      {
      $mensaje = "No se puede ESCRIBIR en el archivo ($archivo). Por favor verifique.";
      exit;
    }
    else
      {
      $mensaje = "¡¡¡PROCESO CORRECTO!!!";
    }
    fclose($gestor);    
  } 
}

?>