<?php
session_start();
require_once "data/pdo.php";
require_once "data/util.php";

$consultarUltimos = "SELECT productos.nombre_plastico, productos.entidad, productos.bin, productos.snapshot, productos.codigo_emsa, productos.codigo_origen, movimientos.idmov, movimientos.tipo, movimientos.cantidad, movimientos.fecha, movimientos.hora, movimientos.estado, movimientos.comentarios FROM movimientos inner join productos on productos.idprod=movimientos.producto where movimientos.estado='OK' order by fecha desc, hora desc limit 10";
$mostrarUltimos = array(array ("pos" => 4, "tabla" => "productos", "campo" => "nombre_plastico", "align" => "left", "mostrar" => true),
												array ("pos" => 3, "tabla" => "productos", "campo" => "entidad", "align" => "left", "mostrar" => true),
												array ("pos" => 5, "tabla" => "productos", "campo" => "bin", "align" => "center", "mostrar" => false),
												array ("pos" => 8, "tabla" => "productos", "campo" => "snapshot", "align" => "center", "mostrar" => false),
												array ("pos" => 6, "tabla" => "productos", "campo" => "codigo_emsa", "align" => "center", "mostrar" => false),
												array ("pos" => 7, "tabla" => "productos", "campo" => "codigo_origen", "align" => "center", "mostrar" => false),
												array ("pos" => 13, "tabla" => "movimientos", "campo" => "idmov", "align" => "left", "mostrar" => false),
												array ("pos" => 1, "tabla" => "movimientos", "campo" => "fecha", "align" => "center", "mostrar" => true),
												array ("pos" => 2, "tabla" => "movimientos", "campo" => "hora", "align" => "center", "mostrar" => true),
												array ("pos" => 9, "tabla" => "movimientos", "campo" => "tipo", "align" => "left", "mostrar" => true),
												array ("pos" => 12, "tabla" => "movimientos", "campo" => "estado", "align" => "center", "mostrar" => false),
												array ("pos" => 10, "tabla" => "movimientos", "campo" => "cantidad", "align" => "right", "mostrar" => true),
												array ("pos" => 11, "tabla" => "movimientos", "campo" => "comentarios", "align" => "center", "mostrar" => true)
												);
$stmt = $pdo->query($consultarUltimos);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!isset($_SESSION['user_id'])) {
	$notLoggedIn = true;
} else {
	$notLoggedIn = false;
}

$movsData = file_get_contents("data/confMovimientos.json");
$tblMovs = json_decode($movsData, true);

$movsData = file_get_contents("data/confProductos.json");
$tblProds = json_decode($movsData, true);

uasort($mostrarUltimos, 'sort_by_pos');

?>

<!DOCTYPE html>
<html lang="esp">

<?php
$title = "STOCK";	
require_once ('head.php');
?>
  <body>
		<?php
		$home = "active";
		require_once ('header.php');
		?>
		<main>
			<div class="container">
			<h1>&Uacute;ltimos 10 movimientos agregados</h1>

			<?php
			//Link to add a new profile in case the user is logged in
			if ($notLoggedIn === FALSE) {
			?>		
				<a href="addMovement.php">Agregar Movimiento</a>
			<?php	
			}
							
			//Links to Log In in case the user is not logged in, and to Log Out if it is
			echo "<p>";	
			if ($notLoggedIn === TRUE) {
				echo '<a href="login.php">Ingresar</a>';
			}	else {
				echo '<a href="logout.php">Salir</a>';
				}
			echo '</p>';
				
			flashMessages();
			
			if (count($rows) > 0) {	
				$i = 1;
				echo '<table class="tblHor">  
							<caption>Tabla con los &uacute;ltimos movimientos</caption>
								<thead>
									<tr>';	
				foreach ($mostrarUltimos as $i => $header) {			
					if ($header["mostrar"] === true){
						if ($header["tabla"] === "productos"){
							$tabla = $tblProds;
						}
						else {
							$tabla = $tblMovs;
						}
						echo "<th>".$tabla[$header["campo"]]["nombreMostrar"]."</th>";
					}					
				}
				echo '	</tr>
							</thead>';
				echo '<tbody>';	
				foreach ( $rows as $row ) {
					echo "<tr href='editMovement.php?idprod=".$row['idmov']."'>";
					foreach ($mostrarUltimos as $i => $campo) {
						if ($campo["mostrar"] === true){
							if ($campo["tabla"] === "productos"){
								$tabla = $tblProds;
							}
							else {
								$tabla = $tblMovs;
							}		
							if ($campo["campo"] === "fecha"){
								$fechaTemp = explode("-", $row[$campo["campo"]]); 
								$row[$campo["campo"]] = $fechaTemp[2]."/".$fechaTemp[1]."/".$fechaTemp[0];
							}
							
							if ($campo["campo"] === "cantidad"){
								echo "<td title='Click para EDITAR' style='text-align: ".$campo["align"]."'><a target='_blank' href='editMovement.php?idprod=".$row['idmov']."'>".number_format($row[$campo["campo"]], 0, ',', '.')."</a></td>";
							}
							else {
								echo "<td style='text-align: ".$campo["align"]."'>".htmlentities($row[$campo["campo"]])."</td>";
							}
						}
					}
					echo '</tr>';
				}
				echo '</tbody>';
				echo '</table>';
			}
			?>
			</div>
		</main>
		<?php
			require_once ('footer.php');
		?>
	</body>
</html>