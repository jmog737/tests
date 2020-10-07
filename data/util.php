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

function nivelAlarma($stock, $a1, $a2){
	// Resaltado del stock según los niveles de las alarmas:
	if (($stock < $a1) && ($stock > $a2)){
		return 'alarma1';
	}
	else {
		if ($stock < $a2) {
			return 'alarma2';
		}
		else {
			return 'sinAlarma';
		}  
	}
	// FIN Resaltado del stock según los niveles de las alarmas
}

function tipoComm($com){
	if (($com !== '')&&($com !== null)){
		/// Resaltado en AMARILLO del comentario que tiene el patrón: DIF
		if (strpos($com, "dif") !== FALSE){
			return "resaltarDiferencia";
		}
		else {
			/// Resaltado en VERDE del comentario que tiene el patrón: STOCK
			if (strpos($com, "stock") !== FALSE){
				return "resaltarStock";
			}
			else {
				/// Resaltado en ROJO SUAVE del comentario que tiene el patrón: PLASTICO con o sin tilde
				if ((strpos($com, "plastico") !== FALSE) || (strpos($com, "plástico") !== FALSE)) {
					return "resaltarPlastico";
				}
				else {
					/// Resaltado general en caso de tener un comentario que no cumpla con ninguno de los patrones anteriores
					return "resaltarComentario";
				}
			}            
		}
	} 
}