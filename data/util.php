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

/*function validarMovimiento(){
	//recupero parámetros:
	$stock = (int)$_POST["stock"];
	$cantidad = (int)$_POST["cantidad"];
	
	/// Si el movimiento NO es una devolución, calculo el nuevo stock. 
  /// De serlo, NO se quita de stock pues las tarjetas se reponen (igualmente, por ahora no existe el tipo "Devolución"):
	if (($tipo !== 'Ingreso') && ($tipo !== 'AJUSTE Ingreso')){
		$stock -= $cantidad;
	}
	if (($tipo === 'Ingreso') || ($tipo === 'AJUSTE Ingreso')) {
		$stock += $cantidad;
	}

	///VER MOVIMIENTO REPETIDO
	
	if ($stock <0) {
		return "No hay stock suficiente para realizar el movimiento.";
	}
	else {
		return true;
	}
	
	
	
}*/

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