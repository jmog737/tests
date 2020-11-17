<?php
session_start();
require_once "data/pdo.php";
require_once "data/util.php";

// If the user is not logged in, go back to index.php
if (!isset($_SESSION['user_id'])) {
	$mensaje = "Usuario <strong>NO</strong> logueado!.<br>ACCESO DENEGADO.<br><br>";
	$link = "<a href='login.php'>Ingresar</a>";
	$mensaje .= $link;
  die($mensaje);
  return;
}

// Consulta para recupear el listado de entidades
if (!(isset($_POST['btnFindStock']))){
  $consultarEntidades = "select distinct entidad from productos order by entidad asc, nombre_plastico asc";
  $stmt = $pdo->query($consultarEntidades);
  $entidades = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
else { 
  //Recupero los parámetros pasados:
  if ((isset($_POST['origen'])) && (isset($_POST['fecha']))){
    $origen = $_POST['origen'];
    $fecha = $_POST['fecha'];
    ($origen === "producto") ? $idprod = $_POST['hint'] : $entidad = $_POST['entidad'];
    ($fecha === "actual") ? $dia = date('Y-m-d') : $dia = $_POST['dia'];
    $hoy = date('Y-m-d');
    ($dia === $hoy) ? $hora = " (".date('H:i').")" : $hora = '';
    
    //Consultas para el STOCK ACTUAL y la recuperación del resto de los DATOS del/de los productos
    switch ($origen){
      case "entidad": $totalEntidad = 0;
                      $sqlEntidad = "SELECT idprod, entidad, nombre_plastico, bin, codigo_emsa, codigo_origen, snapshot, ultimoMovimiento, comentarios, stock, alarma1, alarma2 from productos";
                      if ($entidad !== "todos") {
                        $sqlEntidad .= " where  estado='activo' and entidad=:ent order by idprod asc";
                        $stmt = $pdo->prepare($sqlEntidad);
                        $stmt->execute(array(
                                      ':ent' => $entidad
                                      ));
                      }
                      else {
                        $sqlEntidad .= " where estado='activo' order by entidad asc, idprod asc";
                        $stmt = $pdo->prepare($sqlEntidad);
                        $stmt->execute();
                      }              
                      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                      $stockEnts = array();
                      foreach ($rows as $ind => $f){
                        $stockEnts[$f['idprod']] = (int)($f['stock']);
                        $totalEntidad = $totalEntidad + (int)($f['stock']);
                      }
                    break;
      case "producto":  $sqlProducto = "select entidad, nombre_plastico, bin, codigo_emsa, codigo_origen, snapshot, ultimoMovimiento, comentarios, stock, alarma1, alarma2 from productos where idprod=:id";
                        $stmt = $pdo->prepare($sqlProducto);
                        $stmt->execute(array(
                                      ':id' => $idprod,
                                      ));
                        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $row = $rows[0]; 
                        break;
      case "boveda": break;                                
    }

    //Consultas para el STOCK ANTERIOR
    if ($fecha !== 'actual'){
      //Caso PRODUCTO
      if ($origen === 'producto'){
        $movsProducto = "SELECT idprod, tipo, sum(cantidad) as suma from movimientos inner join productos on movimientos.producto=productos.idprod where fecha > :dia and movimientos.producto = :id group by tipo";
        $stmt = $pdo->prepare($movsProducto);
        $stmt->execute(array(
                      ':dia' => $dia, 
                      ':id' => $idprod
                      ));
        $movsProd = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $sumar = 0;
        $restar = 0;
        $stockDia = $row['stock'];
        if (count($movsProd) > 0){
          foreach ($movsProd as $type){
            switch ($type['tipo']){
              case 'Retiro':  $sumar = $sumar + $type['suma'];
                              break;
              case 'Ingreso': $restar = $restar + $type['suma'];   
                              break;
              case 'Renovación':$sumar = $sumar + $type['suma'];
                                break;
              case 'Destrucción':$sumar = $sumar + $type['suma'];
                                 break;
              case 'AJUSTE Retiro': $sumar = $sumar + $type['suma'];
                                    break;
              case 'AJUSTE Ingreso':$restar = $restar + $type['suma'];
                                    break;  
              default: break;                    
            } 
          }
          $stockDia = $row['stock'] + $sumar - $restar;
        }
      }
      //CASO ENTIDAD
      else {
        //reseteo el acumulador para el total de la entidad para no usar el stock actual
        $totalEntidad = 0;
        $movsEntidad = "SELECT idprod, tipo, sum(cantidad) as suma from movimientos inner join productos on productos.idprod = movimientos.producto where productos.estado='activo' and fecha > :dia and entidad = :ent group by idprod, tipo order by idprod";
        $stmt = $pdo->prepare($movsEntidad);
        $stmt->execute(array(
                      ':dia' => $dia, 
                      ':ent' => $entidad
                      ));
        $movsEnt = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $sumar = array();
        $restar = array();
        foreach ($movsEnt as $j => $fila){
          if (!isset($sumar[$fila['idprod']])){
            $sumar[$fila['idprod']] = 0;
          }
          if (!isset($restar[$fila['idprod']])){
            $restar[$fila['idprod']] = 0;
          } 
          switch ($fila['tipo']){
            case 'Retiro':  $sumar[$fila['idprod']] = $sumar[$fila['idprod']] + $fila['suma'];
                            break;
            case 'Ingreso': $restar[$fila['idprod']] = $restar[$fila['idprod']] + $fila['suma'];   
                            break;
            case 'Renovación':$sumar[$fila['idprod']] = $sumar[$fila['idprod']] + $fila['suma'];
                              break;
            case 'Destrucción':$sumar[$fila['idprod']] = $sumar[$fila['idprod']] + $fila['suma'];
                              break;
            case 'AJUSTE Retiro': $sumar[$fila['idprod']] = $sumar[$fila['idprod']] + $fila['suma'];
                                  break;
            case 'AJUSTE Ingreso':$restar[$fila['idprod']] = $restar[$fila['idprod']] + $fila['suma'];
                                  break;  
            default: break;                    
          }
        }
        foreach ($stockEnts as $i => $val){ 
          //inicializo contadores para el caso no haya habido movimientos de ese producto
          if (!isset($sumar[$i])){
            $sumar[$i] = 0;
          }
          if (!isset($restar[$i])){
            $restar[$i] = 0;
          }
          //echo "id: ".$i." - actual: ".$stockEnts[$i]." - sumar: ".$sumar[$i]." - restar: ".$restar[$i]."<br>";
          //actualizo el stock al día pedido
          $stockEnts[$i] = (int)$stockEnts[$i] + (int)$sumar[$i] - (int)$restar[$i];
          $totalEntidad = $totalEntidad + $stockEnts[$i];
        }
        unset($sumar);
        unset($restar);
      }                   
    }
    //configuración de los campos a mostrar
    $mostrarEntidades = array(array ("pos" => 2, "tabla" => "productos", "campo" => "nombre_plastico", 
                             "align" => "left", "mostrar" => true),
                              array ("pos" => 1, "tabla" => "productos", "campo" => "entidad", "align" => "left", "mostrar" => true),
                              array ("pos" => 3, "tabla" => "productos", "campo" => "bin", "align" => "center", "mostrar" => true),
                              array ("pos" => 6, "tabla" => "productos", "campo" => "snapshot", "align" => "center", "mostrar" => true),
                              array ("pos" => 4, "tabla" => "productos", "campo" => "codigo_emsa", "align" => "center", "mostrar" => true),
                              array ("pos" => 7, "tabla" => "productos", "campo" => "ultimoMovimiento", "align" => "center", "mostrar" => true),
                              array ("pos" => 5, "tabla" => "productos", "campo" => "codigo_origen", "align" => "center", "mostrar" => true),
                              array ("pos" => 9, "tabla" => "productos", "campo" => "stock", "align" => "center", "mostrar" => true),
                              array ("pos" => 10, "tabla" => "productos", "campo" => "alarma1", "align" => "center", "mostrar" => false),
                              array ("pos" => 11, "tabla" => "productos", "campo" => "alarma2", "align" => "center", "mostrar" => false),
                              array ("pos" => 8, "tabla" => "productos", "campo" => "comentarios", "align" => "center", "mostrar" => true)
                            ); 
    $movsData = file_get_contents("data/confProductos.json");
    $tblProds = json_decode($movsData, true);
    uasort($mostrarEntidades, 'sort_by_pos');
  }                          
}

?>

<!DOCTYPE html>
<html lang="esp">

<?php
$title = "CONSULTA STOCK";	
require_once ('head.php');
?>
  <body>
		<?php
		$findStock = "active";
		require_once ('header.php');
		?>
		<main>
			<div class="container">
			<?php
      //si vengo del post, muestro resultado. De lo contrario el form
      if (isset($_POST['btnFindStock'])){
        flashMessages();  
        if (count($rows) > 0) {
          ///diferencio si mostrar stock de 1 producto, de 1 entidad o el de la bóveda
          switch ($origen) {
            case "entidad": $titulo = "Stock de <span class='entidad'>".$entidad."</span> al día: ".formatearFecha($dia, 'screen').$hora;
                            echo "<h2>".$titulo."</h2>";
                            echo "<h3>Total de productos: <span class='totProd'>".count($rows)."</span></h3>";

                            $i = 1;
                            echo '<table class="tblHor">  
                                  <caption>'.$titulo.'</caption>
                                    <thead>
                                      <tr>
                                        <th>Item</th>';	
                            $totalCampos = 0;
                            foreach ($mostrarEntidades as $i => $header) {			
                              if ($header["mostrar"] === true){             
                                echo "<th>".$tblProds[$header["campo"]]["nombreMostrar"]."</th>";
                                $totalCampos = $totalCampos + 1;
                              }					
                            }
                            echo '	</tr>
                                  </thead>';
                            echo '<tbody>';
                            $j = 1;	
                            foreach ( $rows as $row ) {
                              echo "<tr>
                                      <td style='text-align:center'>".$j."</td>";
                              foreach ($mostrarEntidades as $i => $campo) {
                                if ($campo["mostrar"] === true){
                                  if (($campo["campo"] === "codigo_emsa") || ($campo["campo"] === "codigo_origen")){
                                    if ($row[$campo["campo"]] === ''){
                                      $row[$campo["campo"]] = 'NO Ingresado';
                                    };
                                  }
                                  if ($campo["campo"] === "bin"){
                                    if ($row[$campo["campo"]] === ''){
                                      $row[$campo["campo"]] = 'N/D o N/C';
                                    };
                                  }
                                  if ($campo["campo"] === "snapshot"){
                                    if (!file_exists($rutaFotos."/".$row[$campo["campo"]])){
                                      $row[$campo["campo"]] = 'N/D';
                                    };
                                  } 
                                  if ($campo["campo"] === "stock"){
                                    $claseAlarma = nivelAlarma($row[$campo["campo"]], $row['alarma1'], $row['alarma2']);
                                    echo "<td class='".$claseAlarma."' style='text-align: ".$campo["align"]."'>".number_format($stockEnts[$row['idprod']], 0, ',', '.')."</td>";
                                  }
                                  else {
                                    if ($campo["campo"] === "comentarios"){
                                      $claseComm = tipoComm($row[$campo["campo"]]);
                                      echo "<td class='".$claseComm."' style='text-align: ".$campo["align"]."'>".$row[$campo["campo"]]."</td>";
                                    }
                                    else {
                                      echo "<td style='text-align: ".$campo["align"]."'>".$row[$campo["campo"]]."</td>";
                                    }
                                  }
                                }
                              }
                              echo '</tr>';
                              $j = $j + 1;
                            }
                            echo '<tr>
                                    <td class="tituloTotal" colspan="'.$totalCampos.'">TOTAL</td>
                                    <td class="total">'.number_format($totalEntidad, 0, ',', '.').'</td>
                                  </tr>';
                            echo '</tbody>';
                            echo '</table>';
                            break;
            case "producto":  // Tabla para mostrar el stock del producto seleccionado:
                              $titulo = "Stock de <span class='producto'>".$row['nombre_plastico']."</span> al día: ".formatearFecha($dia, 'screen').$hora;
                              echo "<h2>".$titulo."</h2>";
                              echo '<table class="tblVer tblStock">  
                                    <caption>'.$titulo.'</caption>';
                              foreach ($mostrarEntidades as $i => $campo) {			
                                if ($campo["mostrar"] === true){             
                                  echo "<tr>
                                          <th>".$tblProds[$campo["campo"]]["nombreMostrar"]."</th>";
                                  switch($campo["campo"]){
                                    case "codigo_emsa":
                                    case "codigo_origen": if ($row[$campo["campo"]] === ''){
                                                            $row[$campo["campo"]] = 'NO Ingresado';
                                                          };
                                                          echo "<td>".$row[$campo["campo"]]."</td>";
                                                          break;
                                    case "bin": if ($row[$campo["campo"]] === ''){
                                                  $row[$campo["campo"]] = 'N/D o N/C';
                                                };
                                                echo "<td>".$row[$campo["campo"]]."</td>"; 
                                                break;
                                    case "snapshot":  if (!file_exists($rutaFotos."/".$row[$campo["campo"]])){
                                                        $row[$campo["campo"]] = 'N/D';
                                                      };
                                                      echo "<td>".$row[$campo["campo"]]."</td>";
                                                      break;
                                    case "stock": if ($fecha !== 'actual'){
                                                    $stock = $stockDia;
                                                  }
                                                  else {
                                                    $stock = $row[$campo["campo"]];
                                                  };
                                                  $claseAlarma = nivelAlarma($stock, $row['alarma1'], $row['alarma2']);
                                                  echo "<td class='".$claseAlarma."'>".number_format($stock, 0, ',', '.')."</td>";
                                                  break;
                                    case "comentarios": $claseComm = tipoComm($row[$campo["campo"]]);
                                                        echo "<td class='".$claseComm."'>".$row[$campo["campo"]]."</td>";   
                                                        break;           
                                    default:  echo "<td>".$row[$campo["campo"]]."</td>";
                                              break;              
                                  }
                                  echo "</tr>";
                                }					
                              }
                              echo '</table>'; 
                              break;
            case "boveda": break;                                  

          } 
        }
        echo "<br>";
        echo "<a href='findStock.php' style='display:block'>Volver a stock</a>";
      }
      else {
      ?>
        <h1>Consultar stock</h1>

        <form id="frmFindStock" name="frmFindStock" method="post" class="stock" action="findStock.php">
          <div class="form-group row">
            <div class="col-1">
              <div class="form-check">
                <input class="form-check-input" checked type="radio" name="origen" id="rdoEntidad" value="entidad">
              </div>
            </div>
            <label class="col-sm-3 col-form-label-lg" for="rdoEntidad">Entidad</label>    
            <div class="form-group col-8">     
              <select class="form-control form-control-sm" name="entidad" id="entidad">
                <option value="todos">Todos</option>
                <?php
                  foreach ($entidades as $entidad){
                    echo "<option value='".$entidad['entidad']."'>".$entidad['entidad']."</option>";
                  }
                ?>
              </select>
            </div>   
          </div>

          <div class="form-group row">
            <div class="col-1">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="origen" id="rdoProducto" value="producto">
              </div>
            </div>
            <label class="col-sm-3 col-form-label-lg" for="rdoProducto">Producto</label>    
            <div class="form-group col-8">     
              <input type="text" name="producto" id="producto" onkeyup='showHint(this.value, "#resumen", "")' class="form-control form-control-sm" size="30" title="Ingresar el producto" placeholder="Producto">
			
              <p id="resumen" title="Contenedor para los datos de resumen">
              </p>
            </div>   
          </div>

          <div class="form-group row">
            <div class="col-1">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="origen" id="rdoBoveda" value="boveda">
              </div>  
            </div>
            <label class="form-check-label" for="rdoBoveda">Total en b&oacute;veda</label>
          </div>

          <hr>
          <div class="frmHeader">FECHA</div>

          <div class="form-group">
          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" checked type="radio" name="fecha" id="rdoActual" value="actual">
              <label class="form-check-label" for="rdoActual">Actual</label>
            </div>
          </div>
          </div>

          <div class="form-group row">
            <div class="col-1">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="fecha" id="rdoFecha" value="fecha">
              </div>
            </div>
            <label class="col-sm-3 col-form-label-lg" for="rdoFecha">Fecha</label>    
            <div class="form-group col-8">     
              <input type="date" class="form-control form-control-sm" id="dia" name="dia" min="2017-09-01" value="<?= date('Y-m-d') ?>" title="Ingresar la fecha del movimiento" placeholder="Seleccione la fecha">
            </div>   
          </div>
          <div class="text-center" id="btnContainer">
            <button type="submit" id="btnFindStock" name="btnFindStock" class="btn btn-primary">Consultar</button>
          </div>
        </form>
        <br>
        <a href='index.php' style='display:block'>Volver a inicio</a>
      <?php
      }		
			?>
			</div>
		</main>
		<?php
			require_once ('footer.php');
		?>
	</body>
</html>