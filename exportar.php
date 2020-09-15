<?php
if(!isset($_SESSION)) 
  { 
  session_start(); 
} 

//error_reporting(NULL);
//ini_set('error_reporting', NULL);
//ini_set('display_errors',0);
if(isset($_SESSION['tiempo']) ) {
  require_once('data/pdo.php');
  require_once('generarExcel.php');
  require_once('generarPdfs.php');

//phpinfo();
//***************************** DESTINATARIOS CORREOS ***********************************************************************************************
//$paraListados = array();
//$copiaListados = array();
//$ocultosListados = array();

//**************** PRUEBAS ************************************************************
//$copiaListados['Juan Martín Ortega'] = "juanortega@emsa.com.uy";
//**************** FIN PRUEBAS ********************************************************

//****************************************************IMPORTANTE:************************************************************************************
//                                              SETEO DE LAS CARPETAS
//// AHORA SE SETEAN EN EL CONFIG.PHP
//***************************************************************************************************************************************************

//********************************************* Defino tamaño de la celda base: c1, y el número ************************************************
$c1 = 18;
$h = 6;
$hHeader = 30;
$orientacion = 'P';
$textoMarcaAgua = 'CONFIDENCIAL';
$textoLegal = utf8_decode("EMSA S.A. informa y hace de conocimiento de nuestros clientes, la exclusión de responsabilidades frente a casos de daño, robo, incendio o catástrofe que pudiesen estropear el stock de tarjetas de vuestra propiedad que se encuentran resguardadas en nuestra bóveda. Esto no afectará en absoluto la calidad y prestancia de nuestra operativa diaria y de los protocolos administrativos y de seguridad que se cumplen actualmente. El alcance ofrecido en nuestro servicio es pura y exclusivamente para la reserva y utilización del espacio físico y el control diario en la producción de embosados a través de los informes respectivos, coordinados previamente con el cliente. Esta comunicación es a modo informativo y las cláusulas respectivas serán anexadas a los contratos existentes o futuros. Agradecemos en forma insistente la comprensión y preferencia que ante todo siguen teniendo para con nuestros servicios.");
//******************************************************** FIN tamaños de celdas ***************************************************************

//******************************************************** INICIO Hora y título ****************************************************************
$fecha = date('d/m/Y');
$hora = date('H:i');
//********************************************************** FIN Hora y título *****************************************************************

$indice = $_POST["indice"];
$id = $_POST["idTipo_$indice"];

$query = $_POST["query_$indice"];//echo "$query<br>";
$consultaCSV = $_POST["consultaCSV_$indice"];

if (isset($_POST["subtotales_$indice"])){
  $subtotales = (array)json_decode($_POST["subtotales_$indice"]);
}

$tipoConsulta = strip_tags($_POST["tipoConsulta_$indice"]);
$parteTipo = stripos($tipoConsulta, ": ");
if ($parteTipo !== false){
  $parte2 = explode(": ", $tipoConsulta);
  $tempParte2 = explode("/", $parte2[1]);
  $añoCorto = substr($tempParte2[2], 2, 2);
  $fechaTemp0 = $tempParte2[0].$tempParte2[1].$añoCorto;
  $ultimaParte = utf8_decode("al_".$fechaTemp0);
}

$radio = strip_tags($_POST["radio_$indice"]);

if (stripos($tipoConsulta, "MOVIMIENTOS") !== FALSE){
  $buscarTipo = stripos($tipoConsulta, "(inc. AJUSTES)");
  $tipo = '';
  if ($buscarTipo !== false){
    $tipo = 'todos';
  }
  else {
    $buscarTipo1 = stripos($tipoConsulta, "todos los tipos");
    if ($buscarTipo1 !== false){
      $tipo = 'Clientes';
    }
    else {
      $tempTipo = explode("del tipo ", "$tipoConsulta");
      $temp11 = $tempTipo[1];
      $tempTipo1 = explode(" ", $temp11);
      $tipo = $tempTipo1[0];
      if ($tipo === 'AJUSTE'){
        if (($tempTipo1[1] === 'Retiro')||($tempTipo1[1] === 'Ingreso')){
          $tipo = $tipo." ".$tempTipo1[1];
        }
        else {
          $tipo = "Ajustes";
        }
      }
    }
  }
}

//echo "consulta: ".$tipoConsulta."<br>tipo: ".$tipo."<br>";
$mostrar1 = utf8_decode($_POST["mostrar_$indice"]);
$mostrar = preg_split("/-/", $mostrar1);
///*********************************************** NUEVO - Recupero el bit que dice si hay que mostrar o no el campo estado para pasar al excel: ************
$idmovsTemp = array_pop($mostrar);
$mostrarEstado = array_pop($mostrar);
$mostrar[] = $mostrarEstado;
$mostrar[] = $idmovsTemp;

$campos1 = utf8_decode($_POST["campos_$indice"]);
$campos = preg_split("/-/", $campos1);

$largos = $_POST["largos_$indice"];
$temp = explode('-', $largos);
//echo "campos: ".$campos1."<br><br>largos: ".$largos."<br><br>mostrar: ".$mostrar1."<br>";
$x = $_POST["x_$indice"];

$zipSeguridad = $_POST["zip_$indice"];
$planilla = $_POST["planilla_$indice"];
$marcaAgua = $_POST["marcaAgua_$indice"];
$pwdZipManual = $_POST["zipManual_$indice"];
$pwdPlanillaManual = $_POST["planillaManual_$indice"];
//echo "zip: ".$zipSeguridad."<br>zipManual: ".$pwdZipManual."<br>planilla: ".$planilla."<br>planillaManual: ".$pwdPlanillaManual."<br>marca agua: ".$marcaAgua;

if (isset($_POST["idProd_$indice"])){
  $idProd = $_POST["idProd_$indice"];
}

///Caracteres a ser reemplazados en caso de estar presentes en el nombre del producto o la entidad
///Esto se hace para mejorar la lectura (en caso de espacios en blanco), o por requisito para el nombre de la hoja de excel
$aguja = array(0=>" ", 1=>".", 2=>"[", 3=>"]", 4=>"*", 5=>"/", 6=>"\\", 7=>"?", 8=>":", 9=>"_", 10=>"-");
///Para el caso puntual de Henderson & Cia.:
$aguja1 = array(0=>"&");

///Se define el tamaño máximo aceptable para el nombre teniendo en cuenta que el excel admite un máximo de 31 caracteres, y que además, 
///ya se tienen 6 fijos del stock_ (movs_ es uno menos).
$tamMaximoNombreEntidad = 20;
$tamMaximoNombreProducto = 20;

if (isset($_POST["nombreProducto_$indice"])){
  $nombreProducto1 = $_POST["nombreProducto_$indice"];
  $sep = explode("[", $nombreProducto1);
  $entidad0 = trim($sep[1]);
  $nom2 = explode(":", $entidad0);
  $entidad = $nom2[0];
  $tempo = explode("]", $nom2[1]);
  $codigoEMSA = trim($tempo[0]);
  $entidad1 = explode("-", $tempo[1]);
  $nombreProducto = trim($entidad1[3]);
  $nombreProductoMostrar1 = str_replace($aguja, "", $nombreProducto);
  $nombreProductoMostrar = substr($nombreProductoMostrar1, 0, $tamMaximoNombreProducto);
}
if (isset($_POST["entidad_$indice"])){
  $entidad = $_POST["entidad_$indice"];
  $entidadMostrar1 = str_replace($aguja, "", $entidad);
  $entidadMostrar = substr($entidadMostrar1, 0, $tamMaximoNombreEntidad);
  if ($entidad === 'todos') {
    $entidad = 'todas las entidades';
    $entidadMostrar = 'TODOS';
  }
}

///************************************************************ Generación carpeta personalizada para el cliente: *************************
///Acomodo el nombre de la entidad para que no genere problemas durante la creación de la carpeta:
if (isset($entidad)){
  if ($entidad === 'todas las entidades') {
    $entidadCarpeta = 'Todos';
  }
  else {
    $entidadCarpeta = str_replace($aguja, "", ucwords($entidad));
  } 
}
else {
  $entidadCarpeta = "Boveda";
}

$seguir = true;
$rutaCarpetaCliente = $dir.$entidadCarpeta;
if (is_dir($rutaCarpetaCliente)){
  //echo "La carpeta del cliente ya existe.<br>";
}
else {
  $creoCarpeta = mkdir($rutaCarpetaCliente);
  if ($creoCarpeta === FALSE){
    //echo "Error al crear la carpeta.<br>";
    $seguir = false;
  }
  else {
    //echo "Carpeta creada con éxito.<br>";
  }
}

setlocale(LC_ALL, 'es_UY');
$dia = strftime("%d", time());
$mes = substr(ucwords(strftime("%b", time())), 0);
$year = strftime("%Y", time());
$fechaCarpeta = $dia.$mes.$year;

$rutaReporteFecha = $rutaCarpetaCliente."/".$fechaCarpeta;
if (is_dir($rutaReporteFecha)){
  //echo "La carpeta del día ya existe.<br>";
}
else {
  $creoCarpeta0 = mkdir($rutaReporteFecha);
  if ($creoCarpeta0 === FALSE){
   // echo "Error al crear la carpeta del día.<br>";
    $seguir = false;
  }
  else {
   // echo "Carpeta del día creada con éxito.<br>";
  }
}  

switch ($id){
  case "1": if ($entidadCarpeta !== 'Todos'){
              $subRuta = $rutaReporteFecha."/StockENTIDAD";
            }
            else {
              $subRuta = $rutaReporteFecha."/Stock";  
            }
            break;
  case "2": $subRuta = $rutaReporteFecha."/StockPRODUCTOS/".$nombreProductoMostrar;
            break;
  case "3": $subRuta = $rutaReporteFecha;
            break;
  case "4": if ($entidadCarpeta !== 'Todos'){
              $subRuta = $rutaReporteFecha."/MovsENTIDAD";
            }
            else {
              $subRuta = $rutaReporteFecha."/Movs";  
            }           
            break;
  case "5": $subRuta = $rutaReporteFecha."/MovsPRODUCTOS/".$nombreProductoMostrar;
            break;
  default: break;
}

if (is_dir($subRuta)){
  //echo "La carpeta del día ya existe.<br>";
}
else {
  $creoCarpeta0 = mkdir($subRuta, 0777, true);
  if ($creoCarpeta0 === FALSE){
    echo "Error al crear la carpeta del día.<br>";
    $seguir = false;
  }
  else {
   // echo "Carpeta del día creada con éxito.<br>";
  }
} 
///********************************************************** FIN Generación carpeta personalizada para el cliente: ***********************

//echo "id: $id<br>query: $query<br>consultaCSV: $consultaCSV<br>campos: $campos1<br>largos: $largos<br>mostrar: $mostrar1<br>tipoConsulta: $tipoConsulta<br>idProd: $idProd<br>nombreProducto: $nombreProducto<br>entidad: $entidad"
//        . "<br>x: $x<br>inicio: $inicio<br>fin: $fin<br>mes: $mes<br>año: $año<br>tipo: $tipo<br>usuario: $idUser<br>";

$largoCampos = array();
$largoTotal = 0;
$i = 0;
foreach ($temp as $valor) {
  $largo = $c1*$valor;
  array_push($largoCampos, $largo);
  if ($mostrar[$i]) {
    $largoTotal += $largo;
  }
  $i++;
}
array_push($largoCampos, $largoTotal);

switch ($id) {
  case "1": $tituloTabla = "LISTADO DE STOCK";
            $titulo = "STOCK POR ENTIDAD";
            $nombreReporte = "stk_".$entidadMostrar;
//            if ($entidadMostrar === 'TODOS'){
//              $nombreReporte = "stk".$entidadMostrar;
//            }
            $asunto = "Reporte con el Stock de la Entidad";
            $indiceStock = 10;
            break;
  case "2": $tituloTabla = "STOCK DEL PRODUCTO";
            $titulo = "STOCK DEL PRODUCTO";
            $nombreReporte = "stk_".$nombreProductoMostrar;
            $asunto = "Reporte con el stock del Producto";
            $indiceStock = 10;
            break;
  case "3": $tituloTabla = "STOCK TOTAL EN BÓVEDA";
            $titulo = "PLÁSTICOS EN BÓVEDA";
            $nombreReporte = "stk_BOVEDA";
            $asunto = "Reporte con el total de tarjetas en stock";
            $indiceStock = 2;
            break;
  case "4": $tituloTabla = "MOVIMIENTOS DE LA/S ENTIDAD/ES";
            $titulo = "MOVIMIENTOS POR ENTIDAD";
            $asunto = "Reporte con los movimientos de la Entidad";
            $indiceStock = 12;
            $orientacion = 'L';
//            if (isset($inicio)) {
//              $inicioTemp = explode("-", $inicio);
//              $inicioMostrar = $inicioTemp[2]."/".$inicioTemp[1]."/".$inicioTemp[0];
//              $finTemp = explode("-", $fin);
//              $finMostrar = $finTemp[2]."/".$finTemp[1]."/".$finTemp[0];
//            }
            break;
  case "5": $tituloTabla = "MOVIMIENTOS DEL PRODUCTO";
            $titulo = "MOVIMIENTOS POR PRODUCTO";
            $asunto = "Reporte con los movimientos del Producto";
            $indiceStock = 12;
//            if (isset($inicio)) {
//              $inicioTemp = explode("-", $inicio);
//              $inicioMostrar = $inicioTemp[2]."/".$inicioTemp[1]."/".$inicioTemp[0];
//              $finTemp = explode("-", $fin);
//              $finMostrar = $finTemp[2]."/".$finTemp[1]."/".$finTemp[0];
//            }
            break;       
  default: break;
}
  
$subRutita = null;
if (($id === "4")||($id === "5")){
  if ($id === "4") {
    $nombre = $entidadMostrar;
    $subTipo = " POR ENTIDAD";
  }
  else {
    $nombre = $nombreProductoMostrar;
    $subTipo = " DEL PRODUCTO";
  }
  switch ($tipo){
    case "todos": $tit = "MOVIMIENTOS";
                  $nomRep = "tod_";
                  $subRutita = $subRuta."/TODOS";
                  break;
    case "Retiro": $tit = "RETIROS"; 
                   $nomRep = "ret_";
                   $subRutita = $subRuta."/RETIROS";
                   break;
    case "Ingreso": $tit = "INGRESOS";
                    $nomRep = "ing_";
                    $subRutita = $subRuta."/INGRESOS";
                    break;
    case "Renovación": $tit = "RENOVACIONES";
                       $nomRep = "ren_";
                       $subRutita = $subRuta."/RENOVACIONES";
                       break;
    case "Destrucción": $tit = "DESTRUCCIONES";
                        $nomRep = "des_";
                        $subRutita = $subRuta."/DESTRUCCIONES";
                        break;
    case "AJUSTE Retiro": $tit = "AJUSTE Retiros";
                          $nomRep = "ajuRet_";
                          $subRutita = $subRuta."/AJUSTE RETIROS";
                          break;
    case "AJUSTE Ingreso": $tit = "AJUSTE Ingresos";
                           $nomRep = "ajuIng_";
                           $subRutita = $subRuta."/AJUSTE INGRESOS";
                           break;       
    case "Ajustes": $tit = "AJUSTES";
                    $nomRep = "aju_";
                    $subRutita = $subRuta."/AJUSTES";
                    break;   
    case "Clientes": $tit = "MOVIMIENTOS";
                     $nomRep = "mov_";
                     $subRutita = $subRuta."/CLIENTES";
                     break;              
    default: break;
  }
  $titulo = $tit.$subTipo;
  $nombreReporte = $nomRep.$nombre;
}
else {
  if (($radio === "entidadStockViejo")||($radio === "productoStockViejo")){
    $nombreReporte = $nombreReporte."_".$ultimaParte;
  }
}

if ($subRutita !== null){
  if (is_dir($subRutita)){
    //echo "La carpeta del día ya existe.<br>";
  }
  else {
    $creoCarpeta0 = mkdir($subRutita);
    if ($creoCarpeta0 === FALSE){
      //echo "Error al crear la carpeta del día.<br>";
      $seguir = false;
    }
    else {
     // echo "Carpeta del día creada con éxito.<br>";
    }
  } 
}
else {
  $subRutita = $subRuta;
}

//echo "Query: ".$query."<br>";
/// Ejecuto la consulta:
$resultado1 = $pdo->query($query);
//echo "consulta: $query<br>";

$queryTemp = explode('from', $query);
$query1 = "select count(*) from ".$queryTemp[1];
$totalRegistros = $pdo->query($query1)->fetchColumn();

if ($orientacion == 'P'){
  $c1 = 18;
}
else {
  $c1 = 25;
}

//Instancio objeto de la clase:
$pdfResumen = new PDF($orientacion,'mm','A4');
$pdfResumen->AddPage();

///Se AGREGA el autoPageBreak "a mano" para que en la PRIMER página se tome el margen inferior correcto acorde al tamaño del texto legal introducido.
///A partir de la segunda parte, la función Footer calcula el tamaño correcto y hace el salto de página de forma correcta, pero en la primer 
///página aún no se llamó al Footer y hay que setearlo según el texto.
if ($orientacion === 'P'){
  $pdfResumen->SetAutoPageBreak(true, 7.7*$h);
}
else {
  $pdfResumen->SetAutoPageBreak(true, 6*$h);
}

$totalCampos = sizeof($campos);
$pdfResumen->SetWidths($largoCampos);

$filas = array();
$m = 1;
while ($row = $resultado1->fetch(PDO::FETCH_NUM))
  {
  $filas[$m] = $row;
  $m++;
}

$registros = array();
$i = 1;
$total = 0;
foreach($filas as $fila)
  {
  array_unshift($fila, $i);
  $i++;
  //Acumulo el total de plásticos ya sea en stock o movidos:
  if ($radio === 'entidadStockViejo'){
    $total = $total + $subtotales[$fila[1]];//echo $fila[3]." -- ".$subtotales[$fila[1]]."<br>";
  }
  else {
    $total = $total + $fila[$indiceStock];
  }
  $registros[] = $fila;
}
//echo "total: ".$total."<br>";
//echo "<br>CSV: ".$consultaCSV."<br>";
///Ejecuto consulta para la generación del excel:
$resultado2 = $pdo->query($consultaCSV);
$filas1 = array();
$n = 1;
while ($row1 = $resultado2->fetch(PDO::FETCH_NUM))
  {
  $filas1[$n] = $row1;
  $n++;
}
$registros1 = array();
$j = 1;
//$total1 = 0;

foreach($filas1 as $fila)
  {
  if (($id == 4)||($id == 5)){
    $primerColumna = array_shift($fila);
    array_unshift($fila, $j);
    array_unshift($fila, $primerColumna);
    ///Quito la columna de COMENTARIOS pues ya no se muestran en el EXCEL a pedido de Diego:
    ///(primero quito estado que es la última, luego la de comentarios, y finalmente, agrego la de estado nuevamente:
    $estado = array_pop($fila);
    array_pop($fila);
    array_push($fila, $estado);
  }
  else {
    if (($id == 1)||($id == 2)){
      $fechaCreacion = array_pop($fila);
      $coment = array_pop($fila);
      $al2 = array_pop($fila);
      $al1 = array_pop($fila);
      $stock = array_pop($fila);
      
      ///Comento el agregado de la columna con los comentarios del producto pues la misma se quita del EXCEL a pedido de Diego:
      //array_push($fila, $coment);
      
      $idProdTemp = array_shift($fila);
      
      if (($radio === 'entidadStockViejo')||($radio === 'productoStockViejo')){
        $stockTemp = $subtotales[$idProdTemp];//echo "$idProdTemp : $stockTemp<br>";
        array_push($fila, $stockTemp);
      }
      else {
        array_push($fila, $stock);
      }

      array_push($fila, $al1);
      array_push($fila, $al2);
      array_push($fila, $fechaCreacion);
    }
    array_unshift($fila, $j); //echo $coment." - ".$al1." - ".$al2." - ".$stock."<br>";
  }
  $j++;
  //Acumulo el total de plásticos ya sea en stock o movidos:
//  if (($radio === 'entidadStockViejo')||($radio === 'productoStockViejo')){
//    $total1 = $total1 + $subtotales[$fila[1]];
//  }
//  else {
//    $total1 = $total1 + $fila[5];
//  }
  $registros1[] = $fila;
}

//Según el ID, genero los PDFs correspondientes:
switch ($id) {
  case "1": $pdfResumen->tablaStockEntidad($total, false);
            break;
  case "2": $pdfResumen->tablaProducto();
            break;
  case "3": $pdfResumen->tablaStockEntidad($total, true);
            break;
  case "4": $pdfResumen->tablaMovimientos(false);
            break;
  case "5": $pdfResumen->tablaMovimientos(true);
            break;
  default: break;
}    

$timestamp = date('dmy_His');
$nombreArchivo = $nombreReporte."_".$timestamp.".pdf";

/// Si por algún motivo, la creación de alguna de las carpetas dio error, guardo en la carpeta ya configurada y creada que sé existe.
/// Si no hubo problemas en la creación, guardo en la carpeta creada:
if (!($seguir)){
  $salida = $dir.$nombreArchivo;
}
else {
  $salida = $subRutita."/".$nombreArchivo;
  $GLOBALS["dirExcel"] = $subRutita."/";
}


///Guardo el archivo en el disco, y además lo muestro en pantalla:
$pdfResumen->Output($salida, 'F');
$pdfResumen->Output($salida, 'I');

///****************************************************** ESTABLECER CONTRASEÑA PARA EL ZIP  ************************************************
///*********************************** (requerida por el EXCEL, por esto se pone antes de la generación del mismo)  *************************
switch ($zipSeguridad){
  case "nada": $pwdZip = '';
               break;
  case "fecha": $pwdZip = $timestamp; 
                break;
  case "random": $pwdZip = $pwdZipManual;
                 break;
  case "manual": $pwdZip = $pwdZipManual;
                 break;
  default: break;
}
///******************************************************* FIN ESTABLECER CONTRASEÑA PARA EL ZIP ********************************************

///****************************************************************** GENERACIÓN DEL EXCEL **************************************************
///Según el ID, genero los listados en Excel:
switch ($id) {
  case "1": $archivo = generarExcelStock($registros1);
            break;
  case "2": $archivo = generarExcelStock($registros1);
            break;
  case "3": $archivo = generarExcelBoveda($registros1);
            break;
  case "4": $archivo = generarExcelMovimientos($registros1, $mostrarEstado);
            break;
  case "5": $archivo = generarExcelMovimientos($registros1, $mostrarEstado);
            break;
  default: break;
}  
///****************************************************************** FIN GENERACIÓN DEL EXCEL **********************************************

/*
/// Exportación de la consulta a CSV:
$nombreCSV = $nombreReporte.$timestamp."_CSV.csv";
$dirCSV = $dir."/".$nombreCSV;
$exportarCSV = $nombreCampos." union all (".$consultaCSV." into outfile '".$dirCSV."' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\r\n')";
$resultado2 = $pdo->query($exportarCSV);
//echo $exportarCSV;
*/

///************************************************************ GENERACION ZIP FILE *********************************************************
$zip = new ZipArchive;
$nombreZip = $nombreReporte."_".$timestamp.".zip";

/// Si por algún motivo la creación de alguna de las carpetas dio error, guardo en la carpeta ya configurada y creada que sé existe.
/// Si no hubo problemas en la creación, guardo en la carpeta creada:
if (!($seguir)){
  $fileDir = $dir.$nombreZip;
}
else {
  $fileDir = $subRutita."/".$nombreZip;
}

$excel = $dirExcel.$archivo;

if ($zip->open($fileDir, ZIPARCHIVE::CREATE ) !== TRUE) 
    {
    exit("No se pudo abrir el archivo\n");
    } 
//agrego el pdf correspondiente al reporte para EMSA:
$zip->addFile($salida, $nombreArchivo);
$zip->addFile($excel, $archivo);

if ($zipSeguridad !== 'nada'){
  $zip->setPassword($pwdZip);
  $zip->setEncryptionName($archivo, ZipArchive::EM_AES_256);
  $zip->setEncryptionName($nombreArchivo, ZipArchive::EM_AES_256);
}

$zip->close();
///********************************************************** FIN GENERACION ZIP FILE *******************************************************

///************************************************************** ENVÍO DE MAILS ************************************************************
if (isset($mails)){
  $destinatarios = explode(",", $mails);
  foreach ($destinatarios as $valor){
    $para["$valor"] = $valor;
  }
  $asunto = $asunto." (MAIL DE TEST!!!)";

  $cuerpo = utf8_decode("<html><body><h4>Se adjunta el reporte generado del stock</h4></body></html>");
  $respuesta = enviarMail($para, '', '', $asunto, $cuerpo, "REPORTE", $nombreZip, $fileDir);
  echo $respuesta;
}
///************************************************************ FIN ENVÍO DE MAILS **********************************************************
error_reporting(E_ALL);
ini_set('error_reporting', E_ALL);
ini_set('display_errors',1);
}
else {
  echo '<script type="text/javascript">'
  . 'alert("Tú sesión expiró.\n¡Por favor vuelve a loguearte!.");window.close();
    window.location.assign("salir.php");
     </script>';
}
?>
