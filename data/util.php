<?php
function flashMessages() {
	//flash message in case of error:
	if ( isset($_SESSION['error']) ) {
    echo '<p class="flashError">'.$_SESSION['error']."</p>";
    unset($_SESSION['error']);
	}
	//flash message in case of success:
	if ( isset($_SESSION['success']) ) {
    echo '<p class="flashSuccess">'.$_SESSION['success']."</p>";
    unset($_SESSION['success']);
	}
}

function validarCamposAgregar() {
	if ((strlen($_POST['fecha']) < 1) || (strlen($_POST['tipo']) < 1) || (strlen($_POST['hint']) < 1) || (strlen($_POST['cantidad']) < 1)) {
    return "Salvo comentarios, se requieren todos los campos.";
  }
  $cantidad = (int)$_POST["cantidad"];
  
	if ($_POST["cantidad"] < 1){
		return "La cantidad de tarjetas debe ser mayor a 0.";
	}
	else {
		return true; 
	}	 
}

function validarCamposEditar(){
	if ( (strlen($_POST['fecha']) < 1) || (strlen($_POST['tipo']) < 1) || (strlen($_POST['estado']) < 1) ) {
    return "Salvo comentarios, se requieren todos los campos.";
  }
	else {
		return true; 
	}	 
}

function sort_by_pos ($a, $b) {
		return $a['pos'] - $b['pos'];
}

function formatearFecha($fecha, $destino){
	$separador = '';
	$nuevoSeparador = '';
	if ($destino === "db"){
		$separador = "/";
		$nuevoSeparador = "-";
	}
	else {
		$separador = "-";
		$nuevoSeparador = "/";
	}
	$splitted = explode($separador, $fecha);
	$fechaFormateada = $splitted[2].$nuevoSeparador.$splitted[1].$nuevoSeparador.$splitted[0];
	return $fechaFormateada;
}