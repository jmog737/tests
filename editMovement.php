<?php
require_once "data/pdo.php";
require_once "data/util.php";

session_start();

// If the user is not logged in, go back to index.php
if (!isset($_SESSION['user_id'])) {
  die("ACCESO DENEGADO.");
  return;
}

// If the user requested logout, go back to index.php
if (isset($_POST['btnCancelar'])) {
  header('Location: index.php');
  return;
}

//Input data validation and SQL update if everything is OK
if (isset($_POST['fecha']) && isset($_POST['estado']) && isset($_POST['tipo'])) {
  //Valido el movimiento
  $mensaje = validarCamposEditar();
  if (is_string($mensaje)) {
    $_SESSION['error'] = $mensaje;
    header("Location: editMovement.php");
    return; 
  }
  
  $fecha = $_POST['fecha'];
  $estado = $_POST["estado"];
  $tipo = $_POST["tipo"];
  $cantidad = $_POST['cant'];
  $comentarios = $_POST["comentarios"];

  $msgError = '';
  if ($estado === "OK"){
    $statusClass = "estadoOK";
  }
  else {
    $statusClass = "estadoError";
    $msgError = " (NO se muestra por ser error)";
  }

  $sqlUpdate = "UPDATE movimientos set fecha=:fch, tipo=:tipo, comentarios=:comm, estado=:st where idmov=:id";
  $stmt = $pdo->prepare($sqlUpdate);
  $stmt->execute(array(
    ':id' => $_POST['idprod'],
    ':fch' => $_POST['fecha'],
    ':tipo' => $_POST['tipo'],
    ':comm' => $_POST['comentarios'],
    ':st' => $_POST['estado']
  ));

  $fechaMostrar = formatearFecha($fecha, "screen");

  $_SESSION['success'] = "Edici&oacute;n exitosa:<br>".$fechaMostrar.": <span class='tipoExito'>" . $tipo . "</span> de <span class='cantidadExito'>" . number_format($cantidad, 0, ',', '.') . "</span> <span class='productoExito'>\"" . $_POST['ent'] . " - " . $_POST['nom'] . "\"</span><br>Estado: <span class='".$statusClass."'>".$estado.$msgError."</span>";

  header("Location: index.php");
  return;
}

// Guardian: Make sure that id is present before running the query
if (!isset($_REQUEST['idprod'])) {
  $_SESSION['error'] = "No se detect&oacute; ning&uacute;n id.";
  header('Location: index.php');
  return;
}

/// Proceso el GET:
// Obtener los datos del movimiento
$sqlMov = "SELECT productos.nombre_plastico, productos.entidad, productos.bin, productos.snapshot, productos.codigo_emsa, productos.codigo_origen, movimientos.tipo, movimientos.cantidad, movimientos.fecha, movimientos.hora, movimientos.estado, movimientos.comentarios FROM movimientos inner join productos on productos.idprod=movimientos.producto where movimientos.idmov = :id";
$stmt = $pdo->prepare($sqlMov);
$stmt->execute(array(":id" => $_REQUEST["idprod"]));
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row === false) {
  $_SESSION['error'] = "No se pudo cargar el registro.";
  header('Location: index.php');
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
  $comentarios = $row['comentarios'];

  $optRetiro = 'disabled';
  $optIngreso = 'disabled';
  $optDest = 'disabled';
  $optReno = 'disabled';
  $optAJURet = 'disabled';
  $optAJUIng = 'disabled';
  switch ($tipo) {
    case 'Retiro':
      $optRetiro = "selected";
      $optAJURet = "enabled";
      $optReno = "enabled";
      $optDest = "enabled";
      break;
    case 'Ingreso':
      $optIngreso = "selected";
      $optAJUIng = "enabled";
      break;
    case 'Renovaci&oacute;n':
      $optReno = "selected";
      $optAJURet = "enabled";
      $optRetiro = "enabled";
      $optDest = "enabled";
      break;
    case 'AJUSTE Retiro':
      $optAJURet = "selected";
      $optRetiro = "enabled";
      $optReno = "enabled";
      $optDest = "enabled";
      break;
    case 'AJUSTE Ingreso':
      $optAJUIng = "selected";
      $optIngreso = "enabled";
      break;
    case 'Destrucci&oacute;n':
      $optDest = "selected";
      $optAJURet = "enabled";
      $optReno = "enabled";
      $optRetiro = "enabled";
      break;
    default:
      break;
  }

  $estOK = '';
  $estErr = '';
  if ($estado === 'OK') {
    $estOK = "selected";
  } else {
    $estErr = "selected";
  }
}

?>

<!DOCTYPE html>
<html lang="esp">

<?php
$title = "EDITAR MOVIMIENTO - STOCK";
require_once('head.php');
?>

<body>
  <?php
  require_once('header.php');
  ?>
  <main>
    <div class="container">

      <h1>EDITAR MOVIMIENTO</h1>

      <?php flashMessages(); ?>
      
      <form method="post" name="frmEditMovement" id="frmEditMovement" class="editar" action="editMovement.php">
        <label for="fecha">Fecha:</label>
        <input type="date" name="fecha" id="fecha" min="2017-09-01" value="<?= $fecha ?>" title="Fecha del movimiento"><br>

        <label for="hora">Hora:</label>
        <input type="text" name="hora" id="hora" readonly tabindex="-1" value="<?= $hora ?>" title="Hora del movimiento. NO se puede cambiar."><br>
 
        <label for="estado">Estado:</label>
        <select id="estado" name="estado" title="Estado del movimiento">
          <option value="OK" <?= $estOK ?>>OK</option>
          <option value="Error" <?= $estErr ?>>Error</option>
        </select><br>

        <label for="entidad">Entidad:</label>
        <input type="text" name="entidad" id="entidad" readonly tabindex="-2" value="<?= $entidad ?>" title="Entidad. NO se puede cambiar." placeholder="Entidad"><br>

        <label for="producto">Producto:</label>
        <input type="text" name="producto" id="producto" readonly tabindex="-3" value="<?= $nombre ?>" title="Producto. NO se puede cambiar." placeholder="Producto"><br>

        <label for="codigo">C&oacute;digo:</label>
        <input type="text" name="codigo" id="codigo" readonly tabindex="-4" value="<?= $codEmsa ?>" title="Código. NO se puede cambiar." placeholder="C&oacute;digo"><br>

        <label for="tipo">Tipo:</label>
        <select id="tipo" name="tipo" title="Tipo de movimiento">
          <option value="Retiro" <?= $optRetiro ?>>Retiro</option>
          <option value="Ingreso" <?= $optIngreso ?>>Ingreso</option>
          <option value="Renovación" <?= $optReno ?>>Renovación</option>
          <option value="Destrucción" <?= $optDest ?>>Destrucción</option>
          <option value="AJUSTE Ingreso" <?= $optAJUIng ?>>AJUSTE Ingreso</option>
          <option value="AJUSTE Retiro" <?= $optAJURet ?>>AJUSTE Retiro</option>
        </select><br>

        <label for="cantidad">Cantidad:</label>
        <input type="number" min=1 name="cantidad" id="cantidad" readonly tabindex="-5" value="<?= $cantidad ?>" title="Cantidad de tarjetas a mover. NO se puede cambiar." placeholder="Cantidad"><br>

        <label for="comentarios">Comentarios:</label><br>
        <textarea name="comentarios" id="comentarios" rows="4" cols="40" title="Comentarios" placeholder="Comentarios"><?= $comentarios ?></textarea><br>

        <div class="text-center" id="btnContainer">
          <input type="submit" onclick="return validarEditar(false)" name="btnEdit" class="btn btn-primary text-center" value="Editar" title="Editar el movimiento" />
          <input type="submit" name="btnCancelar" value="Cancelar" class="btn btn-danger text-center" title="Cancelar la edici&oacute;n del movimiento" />
        </div>
        
        <input type="hidden" id="idprod" name="idprod" value="<?= $_REQUEST['idprod'] ?>">
        <input type="hidden" id="fechaVieja" name="fechaVieja" value="<?= $fecha ?>">
        <!-- Agrego entidad, cantidad y nombre para evitar hacer una consulta extra: -->
        <input type="hidden" id='ent' name="ent" value="<?= $entidad ?>">
        <input type="hidden" id="nom" name="nom" value="<?= $nombre ?>">
        <input type="hidden" id="cant" name="cant" value="<?= $cantidad ?>">
      </form>
      <div class="captionContainer">
			  <span>Formulario para editar el movimiento</span>
		  </div> 
    </div>
  </main>

  <?php
  require_once('footer.php');
  ?>

</body>

</html>