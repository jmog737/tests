<?php
require_once ("pdo.php");

$tamPage = $_SESSION["tamPagina"];

$tipo = $_GET["tipo"];

$query = (array)json_decode($_GET["query"],true);

$limite = $tamPage;

$datos = array();
for ($i = 0; $i < count($query); $i++){
  ///Comento escritura en el log para evitar sobrecargar el archivo.
  //escribirLog($query);
  ///Para las consultas de stock, armo consulta para conocer el total de plásticos de la entidad (a mostrar en la última página):
  $datos["$i"]["suma"] = 0;
  $datos["$i"]['retiros'] = null;
  $datos["$i"]['renovaciones'] = null;
  $datos["$i"]['destrucciones'] = null;
  $datos["$i"]['ingresos'] = null;
  $datos["$i"]['stockViejo'] = null;
  $idprods = Array();

  if ($tipo === 'entidadStockViejo'){
    $test = stripos($query[$i], "productos.entidad='");
    $entidad = '';
    if ($test !== false){
      $temp = explode("productos.entidad='", $query[$i]);
      $temp1 = explode("'", $temp[1]);
      $entidad = $temp1[0];
    }
    $fecha = '';
    $test2 = stripos($query[$i], "and (fecha >");
    if ($test2 !== false){
      $temp4 = explode("and (fecha >", $query[$i]);
      $temp5 = explode(" order", $temp4[1]);
      $fecha = " and (fecha >".$temp5[0];
    }
    else {
      $test3 = stripos($query[$i], "and (fecha =");
      if ($test3 !== false){
        $temp6 = explode("and (fecha =", $query[$i]);
        $temp7 = explode(" order", $temp6[1]);
        $fecha = " and (fecha =".$temp7[0];
      }
    }
    ///**** Se agregan opciones para tener en cuenta los tipos 'AJUSTE Retiro' y 'AJUSTE Ingreso' dado que también influyen en el stock
    ///**** Sin embargo, NO se filtra por el estado del movimiento como sí se hace en selectQueryJSON dado que para calcular el stock viejo, ES REQUISITO tener en cuenta
    ///**** también los movimientos "erróneos" dado que se compensan con el movimiento de ajuste añadido:
    $consultaRetiros = "select productos.idprod as idprod, sum(cantidad) as retiros from productos inner join movimientos on movimientos.producto=productos.idprod where productos.estado='activo' and (tipo='retiro' or tipo='AJUSTE Retiro')".$fecha;
    $consultaRenovaciones = "select productos.idprod as idprod, sum(cantidad) as renovaciones from productos inner join movimientos on movimientos.producto=productos.idprod where productos.estado='activo' and tipo='renovación'".$fecha;
    $consultaDestrucciones = "select productos.idprod as idprod, sum(cantidad) as destrucciones from productos inner join movimientos on movimientos.producto=productos.idprod where productos.estado='activo' and tipo='destrucción'".$fecha;
    $consultaIngresos = "select productos.idprod as idprod, sum(cantidad) as ingresos from productos inner join movimientos on movimientos.producto=productos.idprod where productos.estado='activo' and (tipo='ingreso' or tipo='AJUSTE Ingreso')".$fecha;
    
    if ($entidad !== ''){
      $consultaRetiros = $consultaRetiros." and productos.entidad='".$entidad."'";
      $consultaRenovaciones = $consultaRenovaciones." and productos.entidad='".$entidad."'";
      $consultaDestrucciones = $consultaDestrucciones." and productos.entidad='".$entidad."'";
      $consultaIngresos = $consultaIngresos." and productos.entidad='".$entidad."'";
    }
    
    $consultaRetiros = $consultaRetiros." group by productos.idprod";
    $consultaRenovaciones = $consultaRenovaciones." group by productos.idprod";
    $consultaDestrucciones = $consultaDestrucciones." group by productos.idprod";
    $consultaIngresos = $consultaIngresos." group by productos.idprod";

    $resultRetiros = $pdo->query($consultaRetiros);
    while (($filaRetiros = $resultRetiros->fetch(PDO::FETCH_ASSOC)) != NULL) {
      $idprod = $filaRetiros["idprod"];
      $datos["$i"]["retiros"][$idprod] = $filaRetiros["retiros"];
    }

    $resultRenovaciones = $pdo->query($consultaRenovaciones);
    while (($filaRenovaciones = $resultRenovaciones->fetch(PDO::FETCH_ASSOC)) != NULL) {
      $idprod = $filaRenovaciones["idprod"];
      $datos["$i"]["renovaciones"][$idprod] = $filaRenovaciones["renovaciones"];
    }

    $resultDestrucciones = $pdo->query($consultaDestrucciones);
    while (($filaDestrucciones = $resultDestrucciones->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      $idprod = $filaDestrucciones["idprod"];
      $datos["$i"]["destrucciones"][$idprod] = $filaDestrucciones["destrucciones"];
    }

    $resultIngresos = $pdo->query($consultaIngresos);
    while (($filaIngresos = $resultIngresos->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      $idprod = $filaIngresos["idprod"];
      $datos["$i"]["ingresos"][$idprod] = $filaIngresos["ingresos"];
    } 
    
    ///Ejecuto consulta "total" para concer el total de datos a devolver
    ///Sin embargo, sólo consulto el total de registros para que sea más rápido:
    if ($test !== false){
      $totalConsulta[$i] = "select count(*) as total from productos where estado='activo' and entidad='".$entidad."'";
    }
    else {
      $totalConsulta[$i] = "select count(*) as total from productos where estado='activo'";
    }
    
    $result1 = $pdo->query($totalConsulta[$i]);
    while (($fila1 = $result1->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      $datos["$i"]['totalRows'] = $fila1["total"];
    }

    ///Recupero primera página para mostrar:
    if ($test !== false){
      $query[$i] = "select idprod, entidad, nombre_plastico, bin, codigo_emsa, codigo_origen, contacto, snapshot, ultimoMovimiento, stock, alarma1, alarma2, comentarios, fechaCreacion from productos where entidad='".$entidad."' and estado='activo' order by entidad asc, codigo_emsa asc, nombre_plastico asc, idprod asc";// limit ".$limite;
    }
    else {
      $query[$i] = "select idprod, entidad, nombre_plastico, bin, codigo_emsa, codigo_origen, contacto, snapshot, ultimoMovimiento, stock, alarma1, alarma2, comentarios, fechaCreacion from productos where estado='activo' order by entidad asc, codigo_emsa asc, nombre_plastico asc, idprod asc";
    }
    
    $result = $pdo->query($query[$i]);
    $stockActual = Array();
    while (($fila = $result->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      $idprod1 = $fila["idprod"];
      $stockActual[$idprod1] = $fila["stock"];
      $datos["$i"]["resultado"][] = $fila;
    }
    
    foreach($stockActual as $produ => $valor){
      if (!(isset($totalConsumos[$produ]))){
        $totalConsumos[$produ] = 0;
      }
//      if (!(isset($datos["$i"]["suma"]))){
//        $datos["$i"]["suma"] = 0;
//      }
//      if (!(isset($datos["$i"]["stockViejo"][$produ]))){
//        $datos["$i"]["stockViejo"][$produ] = 0;
//      }
      if (!(isset($datos["$i"]["retiros"][$produ]))){
        $datos["$i"]["retiros"][$produ] = 0;
      }
      if (!(isset($datos["$i"]["renovaciones"][$produ]))){
        $datos["$i"]["renovaciones"][$produ] = 0;
      }
      if (!(isset($datos["$i"]["destrucciones"][$produ]))){
        $datos["$i"]["destrucciones"][$produ] = 0;
      }
      if (!(isset($datos["$i"]["ingresos"][$produ]))){
        $datos["$i"]["ingresos"][$produ] = 0;
      }
      $totalConsumos[$produ] = $datos["$i"]["retiros"][$produ] + $datos["$i"]["renovaciones"][$produ] + $datos["$i"]["destrucciones"][$produ];
      $datos["$i"]["stockViejo"][$produ] = $valor + $totalConsumos[$produ] - $datos["$i"]["ingresos"][$produ];
      $datos["$i"]["suma"] += $datos["$i"]["stockViejo"][$produ]; 
    }
    $datos["$i"]["query"] = $query[$i];
    //$datos["$i"]["stockViejo"][$produ] = (string)($datos["$i"]["stockViejo"][$produ]);
   // $datos["$i"]["suma"] = (string)($datos["$i"]["suma"]);
  }
  
  if ($tipo === 'productoStockViejo'){
    $test = stripos($query[$i], "where idprod=");
    $idprod = '';
    if ($test !== false){
      $temp = explode("where idprod=", $query[$i]);
      $temp1 = explode(" ", $temp[1]);
      $idprod = $temp1[0];
    }    
    $fecha = '';
    $test2 = stripos($query[$i], "and (fecha >");
    if ($test2 !== false){
      $temp4 = explode("and (fecha >", $query[$i]);
      $temp5 = explode(" order", $temp4[1]);
      $fecha = " and (fecha >".$temp5[0];
    }
    else {
      $test3 = stripos($query[$i], "and (fecha =");
      if ($test3 !== false){
        $temp6 = explode("and (fecha =", $query[$i]);
        $temp7 = explode(" order", $temp6[1]);
        $fecha = " and (fecha =".$temp7[0];
      }
    }
    
    ///**** Se agregan opciones para tener en cuenta los tipos 'AJUSTE Retiro' y 'AJUSTE Ingreso' dado que también influyen en el stock
    ///**** Sin embargo, NO se filtra por el estado del movimiento como sí se hace en selectQueryJSON dado que para calcular el stock viejo, ES REQUISITO tener en cuenta
    ///**** también los movimientos "erróneos" dado que se compensan con el movimiento de ajuste añadido:
    $consultaRetiros = "select productos.idprod as idprod, sum(cantidad) as retiros from productos inner join movimientos on movimientos.producto=productos.idprod where (tipo='retiro' or tipo='AJUSTE Retiro') and productos.idprod=".$idprod.$fecha."group by productos.idprod";
    $resultRetiros = $pdo->query($consultaRetiros);
    while (($filaRetiros = $resultRetiros->fetch(PDO::FETCH_ASSOC)) != NULL) {
      //$idprod = $filaRetiros["idprod"];
      $datos["$i"]["retiros"][$idprod] = $filaRetiros["retiros"];
    }

    $consultaRenovaciones = "select productos.idprod as idprod, sum(cantidad) as renovaciones from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='renovación' and productos.idprod=".$idprod.$fecha."group by productos.idprod";
    $resultRenovaciones = $pdo->query($consultaRenovaciones);
    while (($filaRenovaciones = $resultRenovaciones->fetch(PDO::FETCH_ASSOC)) != NULL) {
      //$idprod = $filaRenovaciones["idprod"];
      $datos["$i"]["renovaciones"][$idprod] = $filaRenovaciones["renovaciones"];
    }

    $consultaDestrucciones = "select productos.idprod as idprod, sum(cantidad) as destrucciones from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='destrucción' and productos.idprod=".$idprod.$fecha."group by productos.idprod";
    $resultDestrucciones = $pdo->query($consultaDestrucciones);
    while (($filaDestrucciones = $resultDestrucciones->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      //$idprod = $filaDestrucciones["idprod"];
      $datos["$i"]["destrucciones"][$idprod] = $filaDestrucciones["destrucciones"];
    }

    ///**** Se agregan opciones para tener en cuenta los tipos 'AJUSTE Retiro' y 'AJUSTE Ingreso' dado que también influyen en el stock:
    $consultaIngresos = "select productos.idprod as idprod, sum(cantidad) as ingresos from productos inner join movimientos on movimientos.producto=productos.idprod where (tipo='ingreso' or tipo='AJUSTE Ingreso') and productos.idprod=".$idprod.$fecha."group by productos.idprod";
    $resultIngresos = $pdo->query($consultaIngresos);
    while (($filaIngresos = $resultIngresos->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      //$idprod = $filaIngresos["idprod"];
      $datos["$i"]["ingresos"][$idprod] = $filaIngresos["ingresos"];
    } 

    ///Recupero primera página para mostrar:
    $query[$i] = "select idprod, entidad, nombre_plastico, bin, codigo_emsa, codigo_origen, contacto, snapshot, ultimoMovimiento, stock, alarma1, alarma2, comentarios as prodcom, fechaCreacion from productos where idprod=".$idprod;
    $result = $pdo->query($query[$i]);

    while (($fila = $result->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      $stockActual[$idprod] = $fila['stock'];
      $datos["$i"]['resultado'][] = $fila;
    }
    
    foreach($stockActual as $produ => $valor){
//      if (!(array_key_exists($index , $datos["$i"]["retiros"]))){
//        $datos["$i"]["retiros"][$index] = 0;
//      }
//      if (!(array_key_exists($index , $datos["$i"]["renovaciones"]))){
//        $datos["$i"]["renovaciones"][$index] = 0;
//      }
//      if (!(array_key_exists($index , $datos["$i"]["destrucciones"]))){
//        $datos["$i"]["destrucciones"][$index] = 0;
//      }
//      if (!(array_key_exists($index , $datos["$i"]["ingresos"]))){
//        $datos["$i"]["ingresos"][$index] = 0;
//      }
      if (!(isset($datos["$i"]["retiros"][$produ]))){
        $datos["$i"]["retiros"][$produ] = 0;
      }
      if (!(isset($datos["$i"]["renovaciones"][$produ]))){
        $datos["$i"]["renovaciones"][$produ] = 0;
      }
      if (!(isset($datos["$i"]["destrucciones"][$produ]))){
        $datos["$i"]["destrucciones"][$produ] = 0;
      }
      if (!(isset($datos["$i"]["ingresos"][$produ]))){
        $datos["$i"]["ingresos"][$produ] = 0;
      }
      $totalConsumos[$produ] = $datos["$i"]["retiros"][$produ] + $datos["$i"]["renovaciones"][$produ] + $datos["$i"]["destrucciones"][$produ];
      $datos["$i"]["stockViejo"][$produ] = $valor + $totalConsumos[$produ] - $datos["$i"]["ingresos"][$produ];
      $datos["$i"]['suma'] = $datos["$i"]['suma'] + $datos["$i"]["stockViejo"][$produ];
      $datos["$i"]['totalRows'] = 1;
      $datos["$i"]['query'] = $query[$i];
    }
  }  
  
}

///Devuelvo total de registros y datos SOLO de la primera página:
$json = json_encode($datos);
//escribirLog($json);
//$json = '[{"suma":"23810"]';
echo $json;

?>