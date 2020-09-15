<?php
require_once('pdo.php');

$tamPage = $_SESSION["tamPagina"];

$tipo = $_GET["tipo"];

$query = array();
$query = (array)json_decode($_GET["query"],true);

///Comento escritura en el log para evitar sobrecargar el archivo.
//escribirLog($query);
$limite = $tamPage;

$datos = array();
for ($i = 0; $i < count($query); $i++){
  ///Para las consultas de stock, armo consulta para conocer el total de plásticos de la entidad (a mostrar en la última página):
  $datos["$i"]['suma'] = null;
  $datos["$i"]['retiros'] = null;
  $datos["$i"]['renovaciones'] = null;
  $datos["$i"]['destrucciones'] = null;
  $datos["$i"]['ingresos'] = null;
  $datos["$i"]['ajusteRetiros'] = null;
  $datos["$i"]['ajusteIngresos'] = null;
  //escribirLog($query[$i]);
  if ($tipo === 'entidadStock'){
    $temp = explode("where", $query[$i]);
    $test = stripos($temp[1], " and (fecha >");
    if ($test !== false){
      $temp0 = explode(" and (fecha >", $temp[1]);
      $parte1 = $temp0[0];
      $temp1 = explode("order", $temp[1]);
      $parte2 = $temp1[1];
      $consultaSuma = "select sum(stock) as total from productos where ".$parte1." order ".$parte2;
      $query[$i] = $temp[0]."where".$parte1." order ".$parte2;
    }
    else {
      $consultaSuma = "select sum(stock) as total from productos where ".$temp[1];
    }
    $result0 = $pdo->query($consultaSuma);
    while (($fila0 = $result0->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      $datos["$i"]['suma'] = $fila0["total"];
    }
  }
  
  if ($tipo === 'totalStock'){
    $consultaSuma = "select sum(stock) as total from productos where estado='activo'";
    $result0 = $pdo->query($consultaSuma);
    while (($fila0 = $result0->fetch(PDO::FETCH_ASSOC)) != NULL) { 
      $datos["$i"]['suma'] = $fila0["total"];
    }
  }
  
  //if (($tipo === 'entidadMovimiento')||($tipo === 'entidadStockViejo')){
  if ($tipo === 'entidadMovimiento'){ 
    $test = stripos($query[$i], "productos.entidad='");
    $entidad = '';
    if ($test !== false){
      $temp = explode("productos.entidad='", $query[$i]);
      $temp1 = explode("'", $temp[1]);
      $entidad = $temp1[0];
    }
    
    $test1 = stripos($query[$i], "tipo='");
    if ($test1 !== false){
      $temp2 = explode("tipo='", $query[$i]);
      if (isset($temp2[2])){
        $tipo1 = 'ajustes';
      }
      else {
        $temp3 = explode("'", $temp2[1]);
        $tipo1 = $temp3[0];
      } 
    }
    else {
      $test2 = stripos($query[$i], "tipo!='");
      if ($test2 !== false){
        $tipo1 = 'clientes';
      }
      else {
        $tipo1 = 'todos';
      }
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
    
    $estadoMov = '';
    $test21 = stripos($query[$i], "and movimientos.estado='");
    if ($test21 !== false){
      $temp41 = explode("and movimientos.estado='", $query[$i]);
      $temp51 = explode("'", $temp41[1]);
      $estadoMov = " and movimientos.estado='".$temp51[0]."'";
    }  
    
    $consultaRetiros = "select productos.idprod as idprod, sum(cantidad) as retiros from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='retiro'".$fecha.$estadoMov;
    $consultaRenovaciones = "select productos.idprod as idprod, sum(cantidad) as renovaciones from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='renovación'".$fecha.$estadoMov;
    $consultaDestrucciones = "select productos.idprod as idprod, sum(cantidad) as destrucciones from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='destrucción'".$fecha.$estadoMov;
    $consultaIngresos = "select productos.idprod as idprod, sum(cantidad) as ingresos from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='ingreso'".$fecha.$estadoMov;
    $consultaAjusteRetiro = "select productos.idprod as idprod, sum(cantidad) as ajusteRetiros from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='AJUSTE Retiro'".$fecha.$estadoMov;
    $consultaAjusteIngreso = "select productos.idprod as idprod, sum(cantidad) as ajusteIngresos from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='AJUSTE Ingreso'".$fecha.$estadoMov;
    
    if ($entidad !== ''){
      $consultaRetiros = $consultaRetiros." and productos.entidad='".$entidad."'";
      $consultaRenovaciones = $consultaRenovaciones." and productos.entidad='".$entidad."'";
      $consultaDestrucciones = $consultaDestrucciones." and productos.entidad='".$entidad."'";
      $consultaIngresos = $consultaIngresos." and productos.entidad='".$entidad."'";
      $consultaAjusteRetiro = $consultaAjusteRetiro." and productos.entidad='".$entidad."'";
      $consultaAjusteIngreso = $consultaAjusteIngreso." and productos.entidad='".$entidad."'";
    }
    
    $consultaRetiros = $consultaRetiros." group by productos.idprod";
    $consultaRenovaciones = $consultaRenovaciones." group by productos.idprod";
    $consultaDestrucciones = $consultaDestrucciones." group by productos.idprod";
    $consultaIngresos = $consultaIngresos." group by productos.idprod";
    $consultaAjusteRetiro = $consultaAjusteRetiro." group by productos.idprod";
    $consultaAjusteIngreso = $consultaAjusteIngreso." group by productos.idprod";
    
    if (($tipo1 === 'Retiro')||($tipo1 === 'todos')||($tipo1 === 'clientes')){
      $resultRetiros = $pdo->query($consultaRetiros);
      while (($filaRetiros = $resultRetiros->fetch(PDO::FETCH_ASSOC)) != NULL) {
        $idprod = $filaRetiros["idprod"];
        $datos["$i"]["retiros"][$idprod] = $filaRetiros["retiros"];
        //$datos["$i"]["retiros"][$idprod] = $consultaRetiros;
      }
    }
    if (($tipo1 === 'Renovación')||($tipo1 === 'todos')||($tipo1 === 'clientes')){
      $resultRenovaciones = $pdo->query($consultaRenovaciones);
      while (($filaRenovaciones = $resultRenovaciones->fetch(PDO::FETCH_ASSOC)) != NULL) {
        $idprod = $filaRenovaciones["idprod"];
        $datos["$i"]["renovaciones"][$idprod] = $filaRenovaciones["renovaciones"];
      }
    }
    if (($tipo1 === 'Destrucción')||($tipo1 === 'todos')||($tipo1 === 'clientes')){
      $resultDestrucciones = $pdo->query($consultaDestrucciones);
      while (($filaDestrucciones = $resultDestrucciones->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaDestrucciones["idprod"];
        $datos["$i"]["destrucciones"][$idprod] = $filaDestrucciones["destrucciones"];
      }
    }
    if (($tipo1 === 'Ingreso')||($tipo1 === 'todos')||($tipo1 === 'clientes')){
      $resultIngresos = $pdo->query($consultaIngresos);
      while (($filaIngresos = $resultIngresos->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaIngresos["idprod"];
        $datos["$i"]["ingresos"][$idprod] = $filaIngresos["ingresos"];
      } 
    }
    if (($tipo1 === 'AJUSTE Retiro')||($tipo1 === 'todos')||($tipo1 === 'ajustes')){
      $resultAjusteRetiros = $pdo->query($consultaAjusteRetiro);
      while (($filaAjusteRetiros = $resultAjusteRetiros->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaAjusteRetiros["idprod"];
        $datos["$i"]["ajusteRetiros"][$idprod] = $filaAjusteRetiros["ajusteRetiros"];
      } 
    }
    if (($tipo1 === 'AJUSTE Ingreso')||($tipo1 === 'todos')||($tipo1 === 'ajustes')){
      $resultAjusteIngresos = $pdo->query($consultaAjusteIngreso);
      while (($filaAjusteIngresos = $resultAjusteIngresos->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaAjusteIngresos["idprod"];
        $datos["$i"]["ajusteIngresos"][$idprod] = $filaAjusteIngresos["ajusteIngresos"];
      } 
    }
  }
  
  //if (($tipo === 'productoMovimiento')||($tipo === 'productoStockViejo')){
  if ($tipo === 'productoMovimiento'){
    $test = stripos($query[$i], "where idprod=");
    $idprod = '';
    if ($test !== false){
      $temp = explode("where idprod=", $query[$i]);
      $temp1 = explode(" ", $temp[1]);
      $idprod = $temp1[0];
    }
    
    $test1 = stripos($query[$i], "tipo='");
    if ($test1 !== false){
      $temp2 = explode("tipo='", $query[$i]);
      if (isset($temp2[2])){
        $tipo2 = 'ajustes';
      }
      else {
        $temp3 = explode("'", $temp2[1]);
        $tipo2 = $temp3[0];
      } 
    }
    else {
      $test2 = stripos($query[$i], "tipo!='");
      if ($test2 !== false){
        $tipo2 = 'clientes';
      }
      else {
        $tipo2 = 'todos';
      } 
    }
    
    $estadoMov = '';
    $test21 = stripos($query[$i], "and movimientos.estado='");
    if ($test21 !== false){
      $temp41 = explode("and movimientos.estado='", $query[$i]);
      $temp51 = explode("'", $temp41[1]);
      $estadoMov = " and movimientos.estado='".$temp51[0]."'";
    }  
    
    //$datos["$i"]["queryTest"][$idprod] = $query[$i];
    //$datos["$i"]["tipo"][$idprod] = $tipo2;
    
    $fecha = '';
    $test3 = stripos($query[$i], "and (fecha >");
    if ($test3 !== false){
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
   
    if (($tipo2 === 'Retiro')||($tipo2 === 'todos')||($tipo2 === 'clientes')){
      $consultaRetiros = "select productos.idprod as idprod, sum(cantidad) as retiros from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='retiro' and productos.idprod='".$idprod."'".$fecha.$estadoMov." group by productos.idprod";
      $resultRetiros = $pdo->query($consultaRetiros);
      while (($filaRetiros = $resultRetiros->fetch(PDO::FETCH_ASSOC)) != NULL) {
        $idprod = $filaRetiros["idprod"];
        $datos["$i"]["retiros"][$idprod] = $filaRetiros["retiros"];
      }
    }  
    if (($tipo2 === 'Renovación')||($tipo2 === 'todos')||($tipo2 === 'clientes')){  
      $consultaRenovaciones = "select productos.idprod as idprod, sum(cantidad) as renovaciones from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='renovación' and productos.idprod='".$idprod."'".$fecha.$estadoMov." group by productos.idprod";
      $resultRenovaciones = $pdo->query($consultaRenovaciones);
      while (($filaRenovaciones = $resultRenovaciones->fetch(PDO::FETCH_ASSOC)) != NULL) {
        $idprod = $filaRenovaciones["idprod"];
        $datos["$i"]["renovaciones"][$idprod] = $filaRenovaciones["renovaciones"];
      }
    }   
    if (($tipo2 === 'Destrucción')||($tipo2 === 'todos')||($tipo2 === 'clientes')){
      $consultaDestrucciones = "select productos.idprod as idprod, sum(cantidad) as destrucciones from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='destrucción' and productos.idprod='".$idprod."'".$fecha.$estadoMov." group by productos.idprod";
      $resultDestrucciones = $pdo->query($consultaDestrucciones);
      while (($filaDestrucciones = $resultDestrucciones->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaDestrucciones["idprod"];
        $datos["$i"]["destrucciones"][$idprod] = $filaDestrucciones["destrucciones"];
      }
    }
    if (($tipo2 === 'Ingreso')||($tipo2 === 'todos')||($tipo2 === 'clientes')){
      $consultaIngresos = "select productos.idprod as idprod, sum(cantidad) as ingresos from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='ingreso' and productos.idprod='".$idprod."'".$fecha.$estadoMov." group by productos.idprod";
      $resultIngresos = $pdo->query($consultaIngresos);
      while (($filaIngresos = $resultIngresos->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaIngresos["idprod"];
        $datos["$i"]["ingresos"][$idprod] = $filaIngresos["ingresos"];
      } 
    }
    if (($tipo2 === 'AJUSTE Retiro')||($tipo2 === 'todos')||($tipo2 === 'ajustes')){
      $consultaAjusteRetiro = "select productos.idprod as idprod, sum(cantidad) as ajusteRetiros from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='AJUSTE Retiro' and productos.idprod='".$idprod."'".$fecha.$estadoMov." group by productos.idprod";
      $resultAjusteRetiros = $pdo->query($consultaAjusteRetiro);
      while (($filaAjusteRetiros = $resultAjusteRetiros->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaAjusteRetiros["idprod"];
        $datos["$i"]["ajusteRetiros"][$idprod] = $filaAjusteRetiros["ajusteRetiros"];
      } 
    }
    if (($tipo2 === 'AJUSTE Ingreso')||($tipo2 === 'todos')||($tipo2 === 'ajustes')){  
      $consultaAjusteIngresos = "select productos.idprod as idprod, sum(cantidad) as ajusteIngresos from productos inner join movimientos on movimientos.producto=productos.idprod where tipo='AJUSTE Ingreso' and productos.idprod='".$idprod."'".$fecha.$estadoMov." group by productos.idprod";
      $resultAjusteIngresos = $pdo->query($consultaAjusteIngresos);
      while (($filaAjusteIngresos = $resultAjusteIngresos->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $idprod = $filaAjusteIngresos["idprod"];
        $datos["$i"]["ajusteIngresos"][$idprod] = $filaAjusteIngresos["ajusteIngresos"];
      } 
    }
  }

  ///Ejecuto consulta "total" para concer el total de datos a devolver
  ///Sin embargo, sólo consulto el total de registros para que sea más rápido:
  $totalConsulta[$i] = '';
  $test4 = stripos($query[$i], "from");
  if ($test4 !== false){
    $temp = explode("from", $query[$i]);
    $totalConsulta[$i] = "select count(*) as total from ".$temp[1];
  }
  $result1 = $pdo->query($totalConsulta[$i]);
  while (($fila1 = $result1->fetch(PDO::FETCH_ASSOC)) != NULL) { 
    $datos["$i"]['totalRows'] = $fila1["total"];
  }
    
  ///Recupero primera página para mostrar:
  $query[$i] = $query[$i]." limit ".$limite;
  $result = $pdo->query($query[$i]);
  
  while (($fila = $result->fetch(PDO::FETCH_ASSOC)) != NULL) { 
    $datos["$i"]['resultado'][] = $fila;
  }
  
}

///Devuelvo total de registros y datos SOLO de la primera página:
$json = json_encode($datos);
echo $json;
?>