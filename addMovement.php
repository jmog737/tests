<?php
session_start(); 
require_once "data/pdo.php";
require_once "data/util.php";

/*if(!isset($_SESSION)) 
  { 
  session_start(); 
} */

if (!isset($_SESSION['user_id'])) {
  die("ACCESO DENEGADO.");
  return;
}

// If the user requested logout go back to index.php
if (isset($_POST['cancel'])) {
  header('Location: index.php');
  return;
}

///Comprobación de lo recibido:
//echo "Fecha: ".$_POST['fecha']."<br>Producto: ".$_POST['nombreProd']." (".$_POST['hint'].")<br>Tipo: ".$_POST['tipo']."<br>Cantidad: ".$_POST['cantidad']."<br>Stock: ".$_POST['stock']."<br>Alarma 1: ".$_POST['al1']."<br>Alarma 2: ".$_POST['al2']."<br>Comentarios: ".$_POST['comentarios'];

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
$title = "AGREGAR MOVIMIENTO - STOCK";
require_once ('head.php');
?>
  <body>
	<?php
	$addMovement = "active";
  require_once ('header.php');
	?>
	<main>	
  <div class="container">

    <h1>AGREGAR MOVIMIENTO</h1>

    <?php flashMessages(); ?>

    <form method="post" action="addMovement.php" onload="ocultarResumen()">
			
      <label for="fecha">Fecha:</label>
      <input type="date" name="fecha" id="fecha" min="2017-09-01" value="<?= date('Y-m-d') ?>" title="Ingresar la fecha del movimiento"><br>
	
      <label for="producto">Producto:</label>
      <input type="text" name="producto" id="producto" onkeyup='showHint(this.value, "#resumen", "")' size="30" title="Ingresar el producto" placeholder="Producto">
			
			<p id="resumen" title="Contenedor para los datos de resumen">
			</p>
			
      <label for="tipo">Tipo:</label>
      <select id="tipo" name="tipo" title="Seleccionar el tipo de movimiento">
				<option value="Retiro" selected>Retiro</option>
				<option value="Ingreso">Ingreso</option>
				<option value="Renovación">Renovación</option>
				<option value="Destrucción">Destrucción</option>
				<option value="AJUSTE Ingreso">AJUSTE Ingreso</option>
				<option value="AJUSTE Retiro">AJUSTE Retiro</option>
			</select><br>
	
      <label for="cantidad">Cantidad:</label>
      <input type="number" min=1 name="cantidad" id="cantidad" title="Ingresar una cantidad mayor a 0" placeholder="Cantidad"><br>
	
      <label for="comentarios">Comentarios:</label><br>
      <textarea name="comentarios" id="comentarios" rows="4" cols="40" title="Ingresar el comentario" placeholder="Comentarios"></textarea><br>
			
			<div class="text-center" id="btnContainer">
				<input type="submit" id="agregarMovimiento" name="agregarMovimiento" class="btn btn-success text-center" onclick="return validarAgregar()" value="Agregar" title="Agregar el movimiento"/>
				<input type="submit" name="cancel" value="Cancelar" class="btn btn-danger text-center" title="Cancelar el agregado del movimiento"/>
			</div>
    </form>  
  </div>
	</main>	
	<?php
	require_once ('footer.php');
	?>
</body>
</html>