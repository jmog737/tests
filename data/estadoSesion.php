<?php
session_start(); 
require_once('config.php');

$cookie = $_GET['c'];
if ($cookie === 's'){
  setcookie('tiempo', time(), time()+TIEMPOCOOKIE);
}  

$myObj = new stdClass();

//Comprobamos si esta definida la sesión 'tiempo'.
if(isset($_SESSION['tiempo']) && isset($_COOKIE['tiempo'])) {
  $myObj->duracion = DURACION;
  //Calculamos tiempo de vida inactivo.
  $vida_session = time() - $_SESSION['tiempo'];
  
  //Compraración para redirigir página, si la vida de sesión sea mayor a el tiempo insertado en inactivo.
  if($vida_session > DURACION)
    {
    if (isset($_SESSION['username'])){
      $myObj->oldUser = strtoupper($_SESSION['username']);
    }
    else {
      $myObj->oldUser = 'ERROR';
    }
    
    $myObj->oldTime = substr($_SESSION['tiempo'], -3);
    $myObj->user = "TIMEOUT";
    $myObj->time = time();
    //$myObj->time = time();////***************** a cambiar por 0. Es solo para pruebas ****************
    $myObj->user_id = 0;
    $myObj->sesion = 'expirada';
  } 
  else {
    $myObj->oldUser = $_SESSION['username'];
    $myObj->oldTime = substr($_SESSION['tiempo'], -3);
    $myObj->user = $_SESSION['username'];
    $myObj->user_id = $_SESSION['user_id'];
    //Activamos sesion tiempo.
    $_SESSION['tiempo'] = time();  
    $myObj->time = $_SESSION['tiempo'];
    $myObj->sesion = 'activa';
  }
}
else {
  $myObj->time = 0;
  $myObj->user = '';
  $myObj->sesion = '';
  $myObj->user_id = 0;
  $myObj->oldUser = $_SESSION['username'];
  $myObj->oldTime = 0;
  $myObj->sesion = '';
  $myObj->duracion = 0;
  $myObj->sesion = 'expirada';
  if (!isset($_COOKIE['tiempo'])){
    $myObj->user = 'COOKIE';
  }
}

//if (isset($_COOKIE['tiempo'])){
//  $myObj->user = 'COOKIE SETEADA';
//}
//else {
//  $myObj->user = 'COOKIE EXPIRADA';
//}

$myJSON = json_encode($myObj);

echo $myJSON;
?>