<?php
  if (isset($_SESSION["username"])){
    $user = $_SESSION["username"];
    $estilos = 'styles_'.$user.'.php';
  }  
  if (!isset($_SESSION["username"])||(!file_exists("css/".$estilos))){
    $estilos = 'styles.php';
  }
  $estilos = 'styles.css';
  require 'vendor/autoload.php';
  require_once 'data/config.php';
?>
<head>
  <link href='images/card31v1.png' rel='shortcut icon' type='image/png'>
  <link href='images/card31v1.png' rel='icon' type='image/png'>
	
	<form style='display: none'>
		<input id="tamPagina" name="tamPagina" type="text" value="<?php echo $_SESSION["tamPagina"] ?>" style="color: black; display: none">
		<input id="limiteSeleccion" name="limiteSeleccion" type="text" value="<?php echo $limiteSeleccion ?>" style="color: black; display: none">
		<input id="limiteSelects" name="limiteSelects" type="text" value="<?php echo $_SESSION["limiteSelects"] ?>" style="color: black; display: none">
		<input id="limiteHistorialProducto" name="limiteHistorialProducto" type="text" value="<?php echo $_SESSION["limiteHistorialProducto"] ?>" style="color: black; display: none">
		<input id="limiteHistorialGeneral" name="limiteHistorialGeneral" type="text" value="<?php echo $_SESSION["limiteHistorialGeneral"] ?>" style="color: black; display: none">
		<input id="duracionSesion" name="duracionSesion" type="text" value="<?php echo DURACION?>" style="color: black; display: none">
	</form>
	
  <title><?= $title ?></title>
	
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <meta http-equiv='X-UA-Compatible' content='IE=edge'>
	
  <link rel='stylesheet' href='vendor/twitter/bootstrap/dist/css/bootstrap.min.css'>
  <link rel='stylesheet' href="css/<?php echo $estilos ?>" >
	
  <script src="vendor/components/jquery/jquery.min.js"></script>
  <script src='js/popper.min.js'></script>
  <script src='vendor/twitter/bootstrap/dist/js/bootstrap.min.js'></script>  
  <script src='js/misjs.js' type="text/javaScript"></script>
	
</head>

