<?php
/*//Input data validation and SQL insert if everything is OK
if ((isset($_POST['first_name']) && isset($_POST['last_name']) && isset($_POST['email']) && isset($_POST['headline']) && isset($_POST['summary']))) {
  
  //Valido el profile
  $mensaje = validateProfile();
  if (is_string($mensaje)) {
    $_SESSION['error'] = $mensaje;
    header("Location: edit.php?profile_id=".$_REQUEST['profile_id']);
    return; 
  }

  //Valido las posiciones
  $mensaje = validatePosition();
  if (is_string($mensaje)) {
    $_SESSION['error'] = $mensaje;
    header("Location: edit.php?profile_id=".$_REQUEST['profile_id']);
    return; 
  }

  //Valido las educations
  $mensaje = validateEducation();
  if (is_string($mensaje)) {
    $_SESSION['error'] = $mensaje;
    header("Location: edit.php?profile_id=".$_REQUEST['profile_id']);
    return; 
  }

  //Actualizo profile
  $sqlProfile = "UPDATE profile SET first_name = :fn,
  last_name = :ln, email = :em, headline = :hl, summary = :sm  
  WHERE profile_id = :pid and user_id = :uid";
  $stmt = $pdo->prepare($sqlProfile);
  $stmt->execute(array(
      ':fn' => $_POST['first_name'],
      ':ln' => $_POST['last_name'],
      ':em' => $_POST['email'],
      ':hl' => $_POST['headline'],
      ':sm' => $_POST['summary'],
      ':pid' => $_POST['profile_id'], 
      ':uid' => $_SESSION['user_id']));
  
  //Delete corresponding positions for that profile
  $sqlDeletePositions = "DELETE FROM position WHERE profile_id = :pid";
  $stmt = $pdo->prepare($sqlDeletePositions);
  $stmt->execute(array(':pid' => $_REQUEST['profile_id']));

  //Add the new positions
  insertPositions($pdo, $profile_id);

  //Delete corresponding educations for that profile
  $sqlDeleteEducation = "DELETE FROM education WHERE profile_id = :pid";
  $stmt = $pdo->prepare($sqlDeleteEducation);
  $stmt->execute(array(':pid' => $_REQUEST['profile_id']));

  //Add the new educations
  insertEducations($pdo, $profile_id);

  $_SESSION['success'] = 'Profile updated';
  header( 'Location: index.php' ) ;
  return;              
}
   
$positions = loadPositions($pdo, $_REQUEST['profile_id']);
$educations = loadEducations($pdo, $_REQUEST['profile_id']);*/
   

require_once "data/pdo.php";
require_once "data/util.php";

session_start(); 

if (!isset($_SESSION['user_id'])) {
  die("ACCESO DENEGADO.");
  return;
}

// If the user requested logout go back to index.php
if (isset($_POST['cancel'])) {
  header('Location: index.php');
  return;
}

// Guardian: Make sure that profile_id is present
if (!isset($_REQUEST['id'])) {
  $_SESSION['error'] = "No se detect&oacute; ning&uacute;n id.";
  header('Location: index.php');
  return;
}

$idprod = $_GET["id"];

$sqlMov = "SELECT productos.nombre_plastico, productos.entidad, productos.bin, productos.snapshot, productos.codigo_emsa, productos.codigo_origen, movimientos.tipo, movimientos.cantidad, movimientos.fecha, movimientos.hora, movimientos.estado, movimientos.comentarios FROM movimientos inner join productos on productos.idprod=movimientos.producto where movimientos.idmov = :id";
$stmt = $pdo->prepare($sqlMov);
$stmt->execute(array(":id" => $idprod));
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ( $row === false ) {
  $_SESSION['error'] = 'No se pudo cargar el registro.';
  header( 'Location: index.php' ) ;
  return;
} else {
  $entidad = htmlentities($row['entidad']);
  $nombre = htmlentities($row['nombre_plastico']);
  $bin = htmlentities($row['bin']);
  $snapshot = htmlentities($row['snapshot']);
  $codEmsa = htmlentities($row['codigo_emsa']);
	$codOrigen = htmlentities($row['codigo_origen']);
	$tipo = htmlentities($row['tipo']);
	$fecha = htmlentities($row['fecha']);
	$hora = htmlentities($row['hora']);
	$cantidad = htmlentities($row['cantidad']);
	$estado = htmlentities($row['estado']);
	$comentarios = htmlentities($row['comentarios']);
	
	switch ($tipo){
		case 'Retiro':
		case 'Ingreso':
		case 'Renovación':
		case 'AJUSTE Retiro':
		case 'AJUSTE Ingreso':
		case 'Destrucción':
		default: break;	
	}
	
	$estOK = '';
	$estErr = '';
	if ($estado === 'OK'){
		$estOK = "selected";
	}
	else {
		$estErr = "selected";
	}
}

//Input data validation and SQL insert if everything is OK
if (isset($_POST['fecha']) && isset($_POST['hint']) && isset($_POST['tipo']) && isset($_POST['cantidad']) && isset($_POST['stock']) && isset($_POST['al1']) && isset($_POST['al2'])) {
  
	$fecha = $_POST['fecha'];
	$idprod = (int)$_POST["hint"];
	$cantidad = (int)$_POST["cantidad"];
	$stock = (int)$_POST["stock"];
	$al1 = (int)$_POST["al1"];
	$al2 = (int)$_POST["al2"];
	$tipo = $_POST["tipo"];
	$comentarios = $_POST["comentarios"];
	$nombreCompleto = $_POST["nombreProd"];
	
	$nomTemp = explode(" --- ", $nombreCompleto);
	$nombre = $nomTemp[1];
	$entTemp = explode(":", $nomTemp[0]);
	$entidad = substr($entTemp[0], 1);
	
	$nuevoStock = $stock;
	
	/// Si el movimiento NO es una devolución, calculo el nuevo stock. 
  /// De serlo, NO se quita de stock pues las tarjetas se reponen (igualmente, por ahora no existe el tipo "Devolución"):
	if (($tipo !== 'Ingreso') && ($tipo !== 'AJUSTE Ingreso')){
		$nuevoStock -= $cantidad;
	}
	if (($tipo === 'Ingreso') || ($tipo === 'AJUSTE Ingreso')) {
		$nuevoStock += $cantidad;
	}

	///VER MOVIMIENTO REPETIDO
	//$prof_id = $pdo->lastInsertId();
	
	if ($nuevoStock <0) {
		$_SESSION['error'] = "No hay suficiente stock para realizar el movimiento:<br><span class='tipoError'>".$tipo."</span> de <span class='cantidadError'>".number_format($cantidad, 0, ',', '.')."</span> <span class='productoError'>\"".$entidad." - ".$nombre."\"</span><br>Stock Actual: ".number_format($stock, 0, ',', '.');
		header("Location: addMovement.php");
    return; 
	}
	
	$hora = date('H:i:s');
	
  $sqlAdd = "INSERT INTO movimientos (producto, fecha, hora, tipo, cantidad, comentarios, estado, fabricante, control1, control2) 
          VALUES (:pid, :fch, :hr, :tipo, :cant, :com, :st, :fbr, :ctr1, :ctr2)";
  $stmt = $pdo->prepare($sqlAdd);
  $stmt->execute(array(
      ':pid' => $_POST['hint'],
      ':fch' => $_POST['fecha'],
      ':hr' => $hora,
      ':tipo' => $_POST['tipo'],
      ':cant' => $_POST['cantidad'], 
      ':com' => $_POST['comentarios'],
			':st' => "OK",
			':fbr' => "N/C",
			':ctr1' => $_SESSION['user_id'],
			':ctr2' => 2)				 
  );
	
	$fechaMostrar = formatearFecha($fecha, "screen");
	$ultimoMovimiento = $fechaMostrar." ".$hora." - ".$tipo.": ".$cantidad;
  $sqlUpdate = "update productos set stock= :stk, ultimoMovimiento= :ult where idprod= :id";
  $stmt = $pdo->prepare($sqlUpdate);
	$stmt->execute(array(
		'stk' => $nuevoStock,
		'ult' => $ultimoMovimiento,
		'id'  => $idprod
	));
   
  $_SESSION['success'] = "Movimiento exitoso:<br><span class='tipoExito'>".$tipo."</span> de <span class='cantidadExito'>".number_format($cantidad, 0, ',', '.')."</span> <span class='productoExito'>\"".$entidad." - ".$nombre."\"</span><br>Nuevo stock: ".number_format($nuevoStock, 0, ',', '.');
	
	$avisar = '';
	if (($nuevoStock <= $al1) && ($nuevoStock > $al2)) {
		$avisar = "<span class='a1'>El stock qued&oacute; en el nivel de advertencia (<".$al1." tarjetas).</span>";
	}
	if ($nuevoStock <= $al2) {
		$avisar = "<span class='a2'>El stock qued&oacute; por debajo del nivel cr&iacute;tico (<".$al2." tarjetas).</span>";;
	}
	if ($avisar !== ''){
		$_SESSION['success'] = $_SESSION['success']."<br>".$avisar;
	}
	
  header("Location: index.php");
  return;   
}

?>

<!DOCTYPE html>
<html>

<?php
$title = "EDITAR MOVIMIENTO - STOCK";
require_once ('head.php');
?>
  <body>
	<?php
	//$editMovement = "active";
  require_once ('header.php');
	?>
	<main>	
  <div class="container">

    <h1>EDITAR MOVIMIENTO</h1>

    <?php flashMessages(); ?>

    <form method="post" action="editMovement.php">
			
      <label for="fecha">Fecha:</label>
      <input type="date" name="fecha" id="fecha" min="2017-09-01" value="<?= $fecha ?>" title="Fecha del movimiento"><br>
			
			<label for="hora">Hora:</label>
      <input type="text" name="hora" id="hora" value="<?= $hora ?>" title="Hora del movimiento"><br>
			
			<label for="estado">Estado:</label>
      <select id="estado" name="estado" title="Estado del movimiento">
				<option value="OK" <?= $estOK ?>>OK</option>
				<option value="Error" <?= $estErr ?>>Error</option>
			</select><br>
	
			<label for="entidad">Entidad:</label>
      <input type="text" name="entidad" id="entidad"  value="<?= $entidad ?>" title="Entidad" placeholder="Entidad"><br>
			
      <label for="producto">Producto:</label>
      <input type="text" name="producto" id="producto"  value="<?= $nombre ?>" title="Producto" placeholder="Producto"><br>
			
			<label for="codigo">C&oacute;digo:</label>
      <input type="text" name="codigo" id="codigo"  value="<?= $codEmsa ?>" title="Código" placeholder="C&oacute;digo"><br>
			
      <label for="tipo">Tipo:</label>
      <select id="tipo" name="tipo" title="Tipo de movimiento">
				<option value="Retiro" <?= $ret ?>>Retiro</option>
				<option value="Ingreso" <?= $fecha ?>>Ingreso</option>
				<option value="Renovación" <?= $fecha ?>>Renovación</option>
				<option value="Destrucción" <?= $fecha ?>>Destrucción</option>
				<option value="AJUSTE Ingreso" <?= $fecha ?>>AJUSTE Ingreso</option>
				<option value="AJUSTE Retiro" <?= $fecha ?>>AJUSTE Retiro</option>
			</select><br>
	
      <label for="cantidad">Cantidad:</label>
      <input type="number" min=1 name="cantidad" id="cantidad" value="<?= $cantidad ?>" title="Cantidad de tarjetas a mover" placeholder="Cantidad"><br>
	
      <label for="comentarios">Comentarios:</label><br>
      <textarea name="comentarios" id="comentarios" value="<?= $comentarios ?>" rows="4" cols="40" title="Comentarios" placeholder="Comentarios"></textarea><br>
			
			<div class="text-center" id="btnContainer">
				<input type="submit" id="editarMovimiento" name="editarMovimiento" class="btn btn-success text-center" onclick="return validarAgregar()" value="Editar" title="Editar el movimiento"/>
				<input type="submit" name="cancel" value="Cancelar" class="btn btn-danger text-center" title="Cancelar la edici&oacute;n del movimiento"/>
			</div>
    </form>  
  </div>
	</main>	
	<?php
	require_once ('footer.php');
	?>
</body>
</html>