<?php
/**
******************************************************
*  @file generarExcel.php
*  @brief Archivo con las funciones que generan los archivos de excel.
*  @author Juan Martín Ortega
*  @version 1.0
*  @date Noviembre 2017
*
*******************************************************/
require 'vendor/autoload.php';
require_once("data/config.php");
require_once("css/colores.php");

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

///*********************************************************************** FIN SETEO DE CARPETAS **************************************************************
$textoLegalExcel = "EMSA S.A. informa y hace de conocimiento de nuestros clientes, la exclusión de responsabilidades frente a casos de daño, robo, incendio o catástrofe que pudiesen estropear el stock de tarjetas de vuestra propiedad que se encuentran resguardadas en nuestra bóveda. \nEsto no afectará en absoluto la calidad y prestancia de nuestra operativa diaria y de los protocolos administrativos y de seguridad que se cumplen actualmente. \nEl alcance ofrecido en nuestro servicio es pura y exclusivamente para la reserva y utilización del espacio físico y el control diario en la producción de embosados a través de los informes respectivos, coordinados previamente con el cliente. \nEsta comunicación es a modo informativo y las cláusulas respectivas serán anexadas a los contratos existentes o futuros. \nAgradecemos en forma insistente la comprensión y preferencia que ante todo siguen teniendo para con nuestros servicios.";

function generarExcelStock($reg) {
  global $nombreReporte, $zipSeguridad, $planilla, $pwdPlanillaManual, $pwdZip, $tipoConsulta, $textoLegalExcel;
  //include_once("css/colores.php");
  //global $colorFondoCampos, $colorFondoTextoLegal, $colorTotal, $colorFondoTotal, $colorStock, $colorFondoStockRegular, $colorFondoStockAlarma1, $colorFondoStockAlarma2;
  //global $colorBordeRegular, $colorComRegular, $colorTabStock, $colorBordeTitulo, $colorFondoTitulo, $colorComStock, $colorComDiff, $colorComPlastico;
  //include_once('css/colores.php');
  //$textoLegal = "EMSA S.A. informa y hace de conocimiento de nuestros clientes, la exclusión de responsabilidades frente a casos de daño, robo, incendio o catástrofe que pudiesen estropear el stock de tarjetas de vuestra propiedad que se encuentran resguardadas en nuestra bóveda. Esto no afectará en absoluto la calidad y prestancia de nuestra operativa diaria y de los protocolos administrativos y de seguridad que se cumplen actualmente. El alcance ofrecido en nuestro servicio es pura y exclusivamente para la reserva y utilización del espacio físico y el control diario en la producción de embosados a través de los informes respectivos, coordinados previamente con el cliente. Esta comunicación es a modo informativo y las cláusulas respectivas serán anexadas a los contratos existentes o futuros. Agradecemos en forma insistente la comprensión y preferencia que ante todo siguen teniendo para con nuestros servicios.";
  $spreadsheet = new Spreadsheet();

  $locale = 'es_UY'; 
  $validLocale = \PhpOffice\PhpSpreadsheet\Settings::setLocale($locale); 
  if (!$validLocale) { echo 'Unable to set locale to '.$locale." - reverting to en_us<br />\n"; }

  // Set document properties
  $spreadsheet->getProperties()->setCreator("Juan Martín Ortega")
                               ->setLastModifiedBy("Juan Martín Ortega")
                               ->setTitle("Stock")
                               ->setSubject("Datos exportados")
                               ->setDescription("Archivo excel con el resultado de la consulta realizada.")
                               ->setKeywords("stock excel php")
                               ->setCategory("Resultado");

  /// Declaro hoja activa:
  $hoja = $spreadsheet->getSheet(0);
  
  ///Trabajo con el nombre para la hoja activa debido a la limitante del largo (31 caracteres):
  ///Además, ya se tienen 8 de la fecha a la cual se consultó el stock
  
  $timestamp = date('dmy_His');
  $timestampCorto = date('dmy');
  
  $test = stripos($nombreReporte, "_al_");
  if ($test !== false){
    $nombreReporteTemp = explode("_al_", $nombreReporte);
    $parte1 = $nombreReporteTemp[0];
    if (strlen($parte1) >= 26){
      $parte1Nuevo = substr($parte1, 0, 25);
    }
    else {
      $parte1Nuevo = $parte1;
    }
    $fecha = $nombreReporteTemp[1];
    $nombreReporte1 = $parte1Nuevo."_".$fecha;
  }
  else {
    $nombreReporte1 = $nombreReporte."_".$timestampCorto;
  }
  $hoja->setTitle($nombreReporte1);
  $hoja->getTabColor()->setRGB($GLOBALS["colorTabStock"]);
  
  $buscar = stripos($tipoConsulta, 'producto');
  if ($buscar !== FALSE){
    $tipoProducto = true;
  }
  else {
    $tipoProducto = false;
  }
  
  $colId = 'A';
  $colEntidad = chr(ord($colId)+1);
  $colNombre = chr(ord($colId)+2);
  $colBin = chr(ord($colId)+3);
  if ($tipoProducto){
    $colFechaCreacion = chr(ord($colId)+4);
    $colCodEMSA = chr(ord($colId)+5);
    $colCodOrigen = chr(ord($colId)+6);
    $colStock = chr(ord($colId)+7);
    $colAl1 = chr(ord($colId)+8);
    $colAl2 = chr(ord($colId)+9); 
    
  }
  else {
    $colCodEMSA = chr(ord($colId)+4);
    $colCodOrigen = chr(ord($colId)+5);
    //$colComent = chr(ord($colId)+6);
    $colStock = chr(ord($colId)+6);
    $colAl1 = chr(ord($colId)+7);
    $colAl2 = chr(ord($colId)+8); 
    $colFechaCreacion = chr(ord($colId)+9);
  }
  
  
  
  $filaEncabezado = '3';
  $filaUnoDatos = $filaEncabezado + 1;
  
  ///*************************************** INICIO formato tipo consulta ******************************
  $hoja->mergeCells($colId.'1:'.$colStock.'1');
  $hoja->setCellValue($colId."1", $tipoConsulta);
  
  /// Formato del mensaje con el tipo de consulta:
  $mensajeTipo = $colId.'1:'.$colStock.'1';

  $styleMensajeTipo = array(
      'font' => array(
          'bold' => true,
          'underline' => true,
        ),
      'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeTitulo"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTitulo"]),
          'fillType' => 'solid',
        ),
      );
  $hoja->getStyle($mensajeTipo)->applyFromArray($styleMensajeTipo);
  ///***************************************** FIN formato tipo consulta *******************************
  
  if ($tipoProducto){
    // Agrego los títulos:
  $spreadsheet->setActiveSheetIndex(0)
              ->setCellValue($colId.$filaEncabezado, 'Id')
              ->setCellValue($colEntidad.$filaEncabezado, 'Entidad')
              ->setCellValue($colNombre.$filaEncabezado, 'Nombre')
              ->setCellValue($colBin.$filaEncabezado, 'BIN')
              ->setCellValue($colFechaCreacion.$filaEncabezado, 'Fecha de Creación')
              ->setCellValue($colCodEMSA.$filaEncabezado, 'Cód. EMSA')
              ->setCellValue($colCodOrigen.$filaEncabezado, 'Cód. Origen')
              //->setCellValue($colComent.'1', 'Comentarios')
              ->setCellValue($colStock.$filaEncabezado, 'Stock');
  }
  else {
    // Agrego los títulos:
    $spreadsheet->setActiveSheetIndex(0)
              ->setCellValue($colId.$filaEncabezado, 'Id')
              ->setCellValue($colEntidad.$filaEncabezado, 'Entidad')
              ->setCellValue($colNombre.$filaEncabezado, 'Nombre')
              ->setCellValue($colBin.$filaEncabezado, 'BIN')
              ->setCellValue($colCodEMSA.$filaEncabezado, 'Cód. EMSA')
              ->setCellValue($colCodOrigen.$filaEncabezado, 'Cód. Origen')
              //->setCellValue($colComent.'1', 'Comentarios')
              ->setCellValue($colStock.$filaEncabezado, 'Stock');
  }
  
  /// Formato de los títulos:
  $header = $colId.$filaEncabezado.':'.$colStock.$filaEncabezado;
  $styleHeader = array(
    'fill' => array(
        'color' => array('rgb' => $GLOBALS["colorFondoCampos"]),
        'fillType' => 'solid',
      ),
    'font' => array(
        'bold' => true,
      ),
    'alignment' => array(
        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
      ),
  );
  $hoja->getStyle($header)->applyFromArray($styleHeader);

  /// Datos de los campos:
  foreach ($reg as $i => $dato) {
    $fechaCreacion = array_pop($dato);
    if (($fechaCreacion === '')||($fechaCreacion === null)){
      $fechaCreacion = 'NO Ingresada';
    }
    else {
      $fechaTemp = explode('-', $fechaCreacion);
      $fechaCreacion = $fechaTemp[2].'/'.$fechaTemp[1].'/'.$fechaTemp[0];
    }
    
    $al2 = array_pop($dato);
    $al1 = array_pop($dato);
    $stock = (integer)array_pop($dato);

    $codOrigen = array_pop($dato);
    if (($codOrigen === null)||($codOrigen === '')){
      $codOrigen = 'NO ingresado';
    }
    $codEMSA = array_pop($dato);
    if (($codEMSA === null)||($codEMSA === '')){
      $codEMSA = 'NO ingresado';
    }
    $codBin = array_pop($dato);
    if (($codBin === null)||($codBin === '')){
      $codBin = 'ND o NC';
    }
    
    array_push($dato, $codBin);
    if ($tipoProducto){
      array_push($dato, $fechaCreacion);
    }
    array_push($dato, $codEMSA);
    array_push($dato, $codOrigen);
    array_push($dato, $stock);
    array_push($dato, $al1);
    array_push($dato, $al2);
    
    /// Acomodo el índice pues empieza en 0, y en el 1 están los nombres de los campos:
    $i = $i + $filaEncabezado + 1;
    $celda = $colId.$i;
    $hoja->fromArray($dato, '""', $celda, true);
  }

  /// Agrego línea con el total del stock:
  $j = $i+1;
  $hoja->mergeCells($colId.$j.':'.$colCodOrigen.$j.'');
  $hoja->setCellValue($colId.$j.'', 'TOTAL');
  $celdaTotalTarjetas = $colStock.$j;
  ///Se comenta agregado de línea con el total pasado dado que ahora el total se calcula usando una fórmula de excel:
  //$hoja->setCellValue($celdaTotalTarjetas, $total);
  $hoja->setCellValue($celdaTotalTarjetas, '=sum('.$colStock.$filaUnoDatos.':'.$colStock.$i.')');

  ///*********************************************** TEST TEXTO LEGAL **************************************** 
  /// Agrego línea con el texto legal:
  $k = $i+4;
  $l = $k+3;
  $hoja->mergeCells($colId.$k.':'.$colStock.$l.'');
  $hoja->setCellValue($colId.$k.'', $textoLegalExcel);
  $celdaTextoLegal = ''.$colId.$k.':'.$colStock.$l.'';
  ///******************************************** FIN TEST TEXTO LEGAL ***************************************
  
  ///********************************************* FORMATO TEXTO LEGAL ****************************************
  /// Defino el formato para el texto legal:
  $styleTextoLegal = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTextoLegal"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'italic' => true,
          'size' => 10,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
      ),
    'borders' => array(
          'allBorders' => array(
            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
            
          ),
      ),
  );
  $hoja->getStyle($celdaTextoLegal)->applyFromArray($styleTextoLegal);
  ///********************************************* FIN FORMATO TEXTO LEGAL ***********************************
  
  /// Defino el formato para la celda con el total de tarjetas:
  $styleTotalPlasticos = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTotal"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'italic' => true,
          'size' => 14,
          'color' => array('rgb' => $GLOBALS["colorTotal"]),
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_BOTTOM,
      ),
      'numberFormat' => array(
          'formatCode' => '#,###0',
      ),
  );
  $hoja->getStyle($celdaTotalTarjetas)->applyFromArray($styleTotalPlasticos);

  /// Defino el formato para la celda con el texto "Total":
  $styleTextoTotal = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoCampos"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'size' => 14,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getRowDimension($j)->setRowHeight(18);
  $hoja->getStyle(''.$colId.$j.'')->applyFromArray($styleTextoTotal);


  /// Defino el formato para la columna con el STOCK:
  $styleColumnaStock = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoStockRegular"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'size' => 11,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'numberFormat' => array(
          'formatCode' => '['.$GLOBALS["colorStock"].']#,##0',
      ),
  );
  $rangoStock = ''.$colStock.$filaUnoDatos.':'.$colStock.$i.'';
  $hoja->getStyle($rangoStock)->applyFromArray($styleColumnaStock);

  /// Defino estilos para las alarmas 1 y 2:
  $styleAl1 = array(
      'fill' => array(
          'color' => array ('rgb' => $GLOBALS["colorFondoStockAlarma1"]),
          'fillType' => 'solid',
      ),
  );

  $styleAl2 = array(
      'fill' => array(
          'color' => array ('rgb' => $GLOBALS["colorFondoStockAlarma2"]),
          'fillType' => 'solid',
      ),
  );

  /// Aplico color de fondo de la columna de stock según el valor y las alarmas para dicho produco:
  for ($k = $filaUnoDatos; $k <= $i; $k++) {
    $al1 = $colAl1.$k;
    $al2 = $colAl2.$k;
    $celda = $colStock.$k;
    $valorAlarma1 = $hoja->getCell($al1)->getValue();
    $valorAlarma2 = $hoja->getCell($al2)->getValue();
    $valorCelda = $hoja->getCell($celda)->getValue();
    if (($valorCelda > $valorAlarma2) && ($valorCelda < $valorAlarma1)){
      $hoja->getStyle($celda)->applyFromArray($styleAl1);
    }

    if ($valorCelda < $valorAlarma2) {
      $hoja->getStyle($celda)->applyFromArray($styleAl2);
    }
    /// Borro el contenido de las alarmas que vienen en la consulta:
    $hoja->setCellValue($al1, '');
    $hoja->setCellValue($al2, ''); 
  }  

  /// Defino estilos para resaltar los comentarios:
  $styleDif = array(
      'fill' => array(
          'color' => array ('rgb' => $GLOBALS["colorComDiff"]),
          'fillType' => 'solid',
      ),
  );

  $styleStock = array(
      'fill' => array(
          'color' => array ('rgb' => $GLOBALS["colorComStock"]),
          'fillType' => 'solid',
      ),
  );

  $stylePlastico = array(
      'fill' => array(
          'color' => array ('rgb' => $GLOBALS["colorComPlastico"]),
          'fillType' => 'solid',
      ),
  );

  $styleComentario = array(
      'fill' => array(
          'color' => array ('rgb' => $GLOBALS["colorComRegular"]),
          'fillType' => 'solid',
      ),
  );

 ///Comento la parte del coloreado de los comentarios dado que ya NO se muestran los comentarios: 
 /* 
  /// Aplico color de fondo de la columna de comentarios según el mismo:
  for ($k = 2; $k <= $i; $k++) {
    $celda = $colComent.$k;
    $valorCelda = $hoja->getCell($celda)->getValue();

    $patron = "dif";
    $buscar = stripos($valorCelda, $patron);
    if ($buscar !== FALSE){
      $hoja->getStyle($celda)->applyFromArray($styleDif);
    }
    else {
      $patron = "stock";
      $buscar = stripos($valorCelda, $patron);
      if ($buscar !== FALSE){
        $hoja->getStyle($celda)->applyFromArray($styleStock);
      }
      else {
        $patron = "plastico";
        $patron1 = "plástico";
        $buscar = stripos($valorCelda, $patron);
        $buscar1 = stripos($valorCelda, $patron1);
        if (($buscar !== FALSE)||($buscar1 !== FALSE)){
          $hoja->getStyle($celda)->applyFromArray($stylePlastico);
        }
        else {
          if (($valorCelda !== null)&&($valorCelda !== '')){
            $hoja->getStyle($celda)->applyFromArray($styleComentario);
          }
        }
      }
    } 
  }  
*/

  /// Defino el rango de celdas con datos para poder darle formato a todas juntas:
  $rango = $colId.$filaEncabezado.":".$colStock.$j;
  /// Defino el formato para las celdas:
  $styleGeneral = array(
      'borders' => array(
          'allBorders' => array(
              'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
              'color' => array('rgb' => $GLOBALS["colorBordeRegular"]),
          ),
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
      )
  );
  $hoja->getStyle($rango)->applyFromArray($styleGeneral);

  /// Ajusto el auto size para que las celdas no se vean cortadas:
  for ($col = ord(''.$colId.''); $col <= ord(''.$colStock.''); $col++)
    {
    $hoja->getColumnDimension(chr($col))->setAutoSize(true);   
  }
  
  switch ($planilla){
    case "nada": break;
    case "misma": if ($zipSeguridad !== 'nada') {
                    $pwdPlanilla = $pwdZip;
                  }
                  break;
    case "fecha": $pwdPlanilla = $timestamp; 
                  break;
    case "random": $pwdPlanilla = $pwdPlanillaManual;
                   break;
    case "manual": $pwdPlanilla = $pwdPlanillaManual;
                   break;
    default: break;
  } 
  if ((($planilla !== "nada")&&($planilla !== 'misma'))||(($planilla === "misma")&&($zipSeguridad !== "nada"))){
    ///Agrego protección para la hoja activa:
    $hoja->getProtection()->setPassword($pwdPlanilla);
    $hoja->getProtection()->setSheet(true);
  }
  
  // Se guarda como Excel 2007:
  $writer = new Xlsx($spreadsheet);
  
  $nombreArchivo = $nombreReporte."_".$timestamp.".Xlsx";
  $salida = $GLOBALS["dirExcel"]."/".$nombreArchivo;
  $writer->save($salida);

  return $nombreArchivo;
}

function generarExcelBoveda($registros) {
  global $nombreReporte, $zipSeguridad, $planilla, $pwdPlanillaManual, $pwdZip, $tipoConsulta, $textoLegalExcel;
//  global $colorBordeTitulo, $colorFondoTitulo, $colorTabBoveda, $colorFondoCampos, $colorFondoTextoLegal, $colorTotal, $colorFondoTotal, $colorBordeRegular, $colorStockBoveda, $colorFondoStockBoveda;
  $spreadsheet = new Spreadsheet();

  $locale = 'es_UY'; 
  $validLocale = \PhpOffice\PhpSpreadsheet\Settings::setLocale($locale); 
  if (!$validLocale) { echo 'Unable to set locale to '.$locale." - reverting to en_us<br />\n"; }


  // Set document properties
  $spreadsheet->getProperties()->setCreator("Juan Martín Ortega")
                               ->setLastModifiedBy("Juan Martín Ortega")
                               ->setTitle("StockBoveda")
                               ->setSubject("Datos exportados")
                               ->setDescription("Archivo excel con el total de plásticos en bóveda.")
                               ->setKeywords("stock excel php")
                               ->setCategory("Resultado");

  /// Declaro hoja activa:
  $hoja = $spreadsheet->getSheet(0);

  $timestamp = date('dmy_His');
  $timestampCorto = date('dmy');
  $dia = date('d');
  $mes = date('m');
  $año = date('y');
  $fecha = $dia.'/'.$mes.'/'.$año;
  
  $hoja->setTitle($nombreReporte."_".$timestampCorto);
  $hoja->getTabColor()->setRGB($GLOBALS["colorTabBoveda"]);

  $filaEncabezado = '3';
  $filaUnoDatos = $filaEncabezado + 1;
  
  ///*************************************** INICIO formato tipo consulta ******************************
  $hoja->mergeCells('A1:C1');
  $hoja->setCellValue('A1', $tipoConsulta." al: ".$fecha);
  /// Formato del mensaje con el tipo de consulta:
  $mensajeTipo = 'A1:C1';

  $styleMensajeTipo = array(
      'font' => array(
          'bold' => true,
          'underline' => true,
        ),
      'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeTitulo"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTitulo"]),
          'fillType' => 'solid',
        ),
      );
  $hoja->getStyle($mensajeTipo)->applyFromArray($styleMensajeTipo);
  ///***************************************** FIN formato tipo consulta *******************************
  
  // Agrego los títulos:
  $spreadsheet->setActiveSheetIndex(0)
              ->setCellValue('A'.$filaEncabezado, 'Id')
              ->setCellValue('B'.$filaEncabezado, 'Entidad')
              ->setCellValue('C'.$filaEncabezado, 'Stock');
  
  /// Formato de los títulos:
  $header = 'A'.$filaEncabezado.':C'.$filaEncabezado;
  $styleHeader = array(
    'fill' => array(
        'color' => array('rgb' => $GLOBALS["colorFondoCampos"]),
        'fillType' => 'solid',
      ),
    'font' => array(
        'bold' => true,
      ),
    'alignment' => array(
        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
      ),
  );
  $hoja->getStyle($header)->applyFromArray($styleHeader);

  /// Datos de los campos:
  foreach ($registros as $i => $dato) {
    /// Acomodo el índice pues empieza en 0, y en el 1 están los nombres de los campos:
    $i = $i + $filaUnoDatos;
    $celda = 'A'.$i;
    $hoja->fromArray($dato, ' ', $celda);
  }

  /// Agrego línea con el total del stock:
  $j = $i+1;
  $hoja->mergeCells('A'.$j.':B'.$j.'');
  $hoja->setCellValue('A'.$j.'', 'TOTAL');
  $celdaTotalTarjetas = "C".$j;
  ///Se comenta agregado de línea con el total pasado dado que ahora el total se calcula usando una fórmula de excel:
  //$hoja->setCellValue($celdaTotalTarjetas, $total);
  $hoja->setCellValue($celdaTotalTarjetas, '=sum(C'.$filaUnoDatos.':C'.$i.')');

  ///*********************************************** TEST TEXTO LEGAL **************************************** 
  /// Agrego línea con el texto legal:
  $k = $i+4;
  $l = $k+3;
  $hoja->mergeCells('A'.$k.':'.'M'.$l.'');
  $hoja->setCellValue('A'.$k.'', $textoLegalExcel);
  $celdaTextoLegal = 'A'.$k.':'.'M'.$l.'';
  ///******************************************** FIN TEST TEXTO LEGAL ***************************************
  
  ///********************************************* FORMATO TEXTO LEGAL ****************************************
  /// Defino el formato para el texto legal:
  $styleTextoLegal = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTextoLegal"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'italic' => true,
          'size' => 10,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
      ),
    'borders' => array(
          'allBorders' => array(
            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,  
          ),
      ),
  );
  $hoja->getStyle($celdaTextoLegal)->applyFromArray($styleTextoLegal);
  ///********************************************* FIN FORMATO TEXTO LEGAL ***********************************
  
  
  /// Defino el formato para la celda con el total de tarjetas:
  $styleTotalPlasticos = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTotal"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'italic' => true,
          'size' => 14,
          'color' => array('rgb' => $GLOBALS["colorTotal"]),
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_BOTTOM,
      ),
      'numberFormat' => array(
          'formatCode' => '#,###0',
      ),
  );
  $hoja->getStyle($celdaTotalTarjetas)->applyFromArray($styleTotalPlasticos);

  /// Defino el formato para la celda con el texto "Total":
  $styleTextoTotal = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoCampos"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'size' => 14,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getRowDimension($j)->setRowHeight(18);
  $hoja->getStyle('A'.$j.'')->applyFromArray($styleTextoTotal);


  /// Defino el formato para la columna con el STOCK:
  $styleColumnaStock = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoStockBoveda"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'italic' => true,
          'size' => 11,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'numberFormat' => array(
          'formatCode' => '['.$GLOBALS["colorStockBoveda"].']#,##0',
      ),
  );
  
  /// Ajusto el auto size para que las celdas no se vean cortadas:
  for ($col = ord('a'); $col <= ord('c'); $col++)
    {
    $hoja->getColumnDimension(chr($col))->setAutoSize(true);   
  }

  /// Defino el rango de celdas con datos para poder darle formato a todas juntas:
  $rango = "A".$filaEncabezado.":C".$j;
  /// Defino el formato para las celdas:
  $styleGeneral = array(
      'borders' => array(
          'allBorders' => array(
              'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
              'color' => array('rgb' => $GLOBALS["colorBordeRegular"]),
          ),
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
      )
  );
  $hoja->getStyle($rango)->applyFromArray($styleGeneral);

  $rangoStock = 'C'.$filaUnoDatos.':C'.$i.'';
  $hoja->getStyle($rangoStock)->applyFromArray($styleColumnaStock);
  
  switch ($planilla){
    case "nada": break;
    case "misma": if ($zipSeguridad !== 'nada') {
                    $pwdPlanilla = $pwdZip;
                  }
                  break;
    case "fecha": $pwdPlanilla = $timestampCorto; 
                  break;
    case "random": $pwdPlanilla = $pwdPlanillaManual;
                   break;
    case "manual": $pwdPlanilla = $pwdPlanillaManual;
                   break;
    default: break;
  } 
  if ((($planilla !== "nada")&&($planilla !== 'misma'))||(($planilla === "misma")&&($zipSeguridad !== "nada"))){
    ///Agrego protección para la hoja activa:
    $hoja->getProtection()->setPassword($pwdPlanilla);
    $hoja->getProtection()->setSheet(true);
  }
  
  // Se guarda como Excel 2007:
  $writer = new Xlsx($spreadsheet);

  $nombreArchivo = $nombreReporte."_".$timestamp.".Xlsx";
  $salida = $GLOBALS["dirExcel"]."/".$nombreArchivo;
  $writer->save($salida);

  return $nombreArchivo;
}

function generarExcelMovimientos($registros, $mostrarEstado) {
  global $nombreReporte, $zipSeguridad, $planilla, $pwdPlanillaManual, $pwdZip, $tipoConsulta, $textoLegalExcel;
  include_once('css/colores.php');
//  global $colorTabMovimientos, $colorBordeTitulo, $colorFondoTitulo, $colorFondoCampos, $colorFondoTextoLegal, $colorBordeRegular; 
//  global $colorBordeResumen, $colorFondoCamposResumen, $colorCategorias, $colorFondoConsumos, $colorFondoIngresos, $colorFondoTotalConsumos, $colorFondoTotalIngresos;
//  global $colorFondoFecha, $colorFondoStockRegular, $colorStock, $colorTotalesCategoria, $colorTextoTotalesCategoria, $colorFondoTotalesCategoria;
//  global $colorConsumos, $colorIngresos, $colorConsumosTotal, $colorIngresosTotal;
//  global $colorAjustesRetiros, $colorAjustesIngresos, $colorFondoAjustesRetiros, $colorFondoAjustesIngresos, $colorAjustesRetirosTotal, $colorAjustesIngresosTotal, $colorFondoAjustesRetirosTotal, $colorFondoAjustesIngresosTotal;
  $spreadsheet = new Spreadsheet();

  $locale = 'es_UY'; 
  $validLocale = \PhpOffice\PhpSpreadsheet\Settings::setLocale($locale); 
  if (!$validLocale) { echo 'Unable to set locale to '.$locale." - reverting to en_us<br />\n"; }

  ///**************************************** PARAMETROS BASICOS ***************************************
  // Set document properties
  $spreadsheet->getProperties()->setCreator("Juan Martín Ortega")
                               ->setLastModifiedBy("Juan Martín Ortega")
                               ->setTitle("Movimientos")
                               ->setSubject("Datos exportados")
                               ->setDescription("Archivo excel con el resultado de la consulta realizada.")
                               ->setKeywords("movimientos excel php")
                               ->setCategory("Resultado");

  //$spreadsheet->getDefaultStyle()->getFont()->setName('Courier New');
  
  /// Declaro hoja activa:
  $hoja = $spreadsheet->getSheet(0);

  $timestamp = date('dmy_His');
  $timestampCorto = date('dmy');
  
  $hoja->setTitle($nombreReporte."_".$timestampCorto);
  $hoja->getTabColor()->setRGB($GLOBALS["colorTabMovimientos"]);
  ///************************************ FIN PARAMETROS BASICOS ***************************************

  $buscar = stripos($tipoConsulta, 'producto');
  if ($buscar !== FALSE){
    $tipoProducto = true;
  }
  else {
    $tipoProducto = false;
  }
  
  $colId = 'A';
  $colFecha = chr(ord($colId)+1);
  $colHora = chr(ord($colId)+2);
  $colEntidad = chr(ord($colId)+3);
  $colNombre = chr(ord($colId)+4);
  $colBin = chr(ord($colId)+5);
  
  if ($tipoProducto){
    $colFechaCreacion = chr(ord($colId)+6);
    $colCodEMSA = chr(ord($colId)+7);
    $colCodOrigen = chr(ord($colId)+8);
    //$colFechaCreacion = chr(ord($colId)+8);
    $colTipo = chr(ord($colId)+9);
    if ($mostrarEstado){
      $colEstado = chr(ord($colId)+10);
      $colCantidad = chr(ord($colId)+11);
    }
    else {
      $colCantidad = chr(ord($colId)+10);
    }
  }
  else {
    $colCodEMSA = chr(ord($colId)+6);
    $colCodOrigen = chr(ord($colId)+7);
    //$colFechaCreacion = chr(ord($colId)+8);
    $colTipo = chr(ord($colId)+8);
    if ($mostrarEstado){
      $colEstado = chr(ord($colId)+9);
      $colCantidad = chr(ord($colId)+10);
    }
    else {
      $colCantidad = chr(ord($colId)+9);
    }
  }
  
  
  //$colComent = chr(ord($colId)+10);
  $colVacia1 = chr(ord($colCantidad)+1);
  
  $colNombreTotales = chr(ord($colCantidad)+2);
  $colRetiros = chr(ord($colCantidad)+3);
  $colRenos = chr(ord($colCantidad)+4);
  $colDestrucciones = chr(ord($colCantidad)+5);
  $colConsumos = chr(ord($colCantidad)+6);
  $colIngresos = chr(ord($colCantidad)+7);
  $colAjuRetiros = chr(ord($colCantidad)+8);
  $colAjuIngresos = chr(ord($colCantidad)+9);
  
  $filaEncabezado = '3';
  $filaUnoDatos = $filaEncabezado + 1;
  
  ///**   ********************************* TEST EXTRACCIÓN TIPO CONSULTA ******************************
  $tipoConsulta1 = utf8_decode($tipoConsulta);
  $q1 = stripos($tipoConsulta1, " de todos los tipos (inc. AJUSTES)");
  if ($q1 !== FALSE) {
    $temp1 = explode(" de todos los tipos (inc. AJUSTES)", $tipoConsulta1);
    $nombre1 = strtoupper($temp1[0]);
    $mostrarResumenProducto = true;
    $tipoMov = 'Todos';
  }
  else { 
    $q2 = stripos($tipoConsulta, " de todos los tipos");
    if ($q2 !== FALSE) {
      $temp1 = explode(" de todos los tipos", $tipoConsulta1);
      $nombre1 = strtoupper($temp1[0]);
      $mostrarResumenProducto = true;
      $tipoMov = 'Clientes';
    }
    else {
      $t0 = stripos($tipoConsulta1, " del tipo Retiro");
      if ($t0 !== FALSE){
        $tipoMov = "Retiros";
      }
      else {
        $t1 = stripos($tipoConsulta1, "del tipo Ingreso");
        if ($t1 !== FALSE){
          $tipoMov = "Ingresos";
        }
        else {
          $t2 = stripos($tipoConsulta1, utf8_decode("del tipo Renovación"));
          if ($t2 !== FALSE){
            $tipoMov = "Renovaciones";
          }
          else {
            $t3 = stripos($tipoConsulta1, utf8_decode("del tipo Destrucción"));
            if ($t3 !== FALSE){
              $tipoMov = "Destrucciones";
            }
            else {
              $t4 = stripos($tipoConsulta1, " del tipo AJUSTE Retiro");
              if ($t4 !== FALSE){
                $tipoMov = "AJUSTE Retiros";
              }
              else {
                $t5 = stripos($tipoConsulta1, " del tipo AJUSTE Ingreso");
                if ($t5 !== FALSE){
                  $tipoMov = "AJUSTE Ingresos";
                }
                else {
                  $tipoMov = "Ajustes";
                }
              }
            }
          }  
        }
      }
    } 
  }  
  ///************************************* FIN TEST EXTRACCIÓN TIPO CONSULTA ***************************
  
  
  ///*************************************** INICIO formato tipo consulta ******************************
  $hoja->mergeCells($colId.'1:'.$colCantidad.'1');
  $hoja->setCellValue($colId."1", $tipoConsulta);
  /// Formato del mensaje con el tipo de consulta:
  $mensajeTipo = $colId.'1:'.$colCantidad.'1';

  $styleMensajeTipo = array(
      'font' => array(
          'bold' => true,
          'underline' => true,
        ),
      'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeTitulo"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTitulo"]),
          'fillType' => 'solid',
        ),
      );
  $hoja->getStyle($mensajeTipo)->applyFromArray($styleMensajeTipo);
  ///***************************************** FIN formato tipo consulta *******************************
  
  
  ///**************************************** INICIO formato encabezado ********************************
  // Agrego los títulos:
  if ($tipoProducto){
    $spreadsheet->setActiveSheetIndex(0)
              ->setCellValue($colId.$filaEncabezado, 'Id')
              ->setCellValue($colFecha.$filaEncabezado, 'Fecha')
              ->setCellValue($colHora.$filaEncabezado, 'Hora')
              ->setCellValue($colEntidad.$filaEncabezado, 'Entidad')
              ->setCellValue($colNombre.$filaEncabezado, 'Nombre')
              ->setCellValue($colBin.$filaEncabezado, 'BIN')
              ->setCellValue($colFechaCreacion.$filaEncabezado, 'Fecha de Creación')
              ->setCellValue($colCodEMSA.$filaEncabezado, 'Cód. EMSA')
              ->setCellValue($colCodOrigen.$filaEncabezado, 'Cód. Origen')
              ->setCellValue($colTipo.$filaEncabezado, 'Tipo')              
              ->setCellValue($colCantidad.$filaEncabezado, 'Cantidad')
              /*->setCellValue($colComent.'1', 'Comentarios')*/;
  }
  else {
    $spreadsheet->setActiveSheetIndex(0)
              ->setCellValue($colId.$filaEncabezado, 'Id')
              ->setCellValue($colFecha.$filaEncabezado, 'Fecha')
              ->setCellValue($colHora.$filaEncabezado, 'Hora')
              ->setCellValue($colEntidad.$filaEncabezado, 'Entidad')
              ->setCellValue($colNombre.$filaEncabezado, 'Nombre')
              ->setCellValue($colBin.$filaEncabezado, 'BIN')
              ->setCellValue($colCodEMSA.$filaEncabezado, 'Cód. EMSA')
              ->setCellValue($colCodOrigen.$filaEncabezado, 'Cód. Origen')
              ->setCellValue($colTipo.$filaEncabezado, 'Tipo')              
              ->setCellValue($colCantidad.$filaEncabezado, 'Cantidad')
              /*->setCellValue($colComent.'1', 'Comentarios')*/;
  }
  
  
  if ($mostrarEstado){
    $spreadsheet->setActiveSheetIndex(0)->setCellValue($colEstado.$filaEncabezado, 'Estado');
  }
  
  /// Formato de los títulos:
  $header = $colId.$filaEncabezado.':'.$colCantidad.$filaEncabezado;
  $styleHeader = array(
      'font' => array(
          'bold' => true,
        ),
      'alignment' => array(
          'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
        ),
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoCampos"]),
          'fillType' => 'solid',
        ),
      );
  $hoja->getStyle($header)->applyFromArray($styleHeader);
  ///******************************************** FIN formato encabezado *******************************
  
  ///*************************************** ESCRIBO DATOS *********************************************
  //var_dump($registros);
  /// Datos de los campos:
  foreach ($registros as $i => $dato) {
    ///Elimino el primer elemento del array dado que se agregó idprod como primer elemento para no tener
    ///problemas con los nombres de producto repetidos. El array con los idprod queda en $dato1:
    $dato1 = array_shift($dato);

    $estado = array_pop($dato);
    $cantidad = array_pop($dato);
    $tipo = array_pop($dato);
    $fechaCreacion1 = array_pop($dato);
    if (($fechaCreacion1 === '')||($fechaCreacion1 === null)) {
      $fechaCreacion = 'No Ingresada';
    }
    else {
      $fechaTemp = explode('-', $fechaCreacion1);
      $fechaCreacion = $fechaTemp[2].'/'.$fechaTemp[1].'/'.$fechaTemp[0];
    }
    
    $codOrigen = array_pop($dato);
    if (($codOrigen === null)||($codOrigen === '')){
      $codOrigen = 'NO ingresado';
    }

    $codEMSA = array_pop($dato);
    if (($codEMSA === null)||($codEMSA === '')){
      $codEMSA = 'NO ingresado';
    }
    
    $bin = array_pop($dato); 
    if (($bin === null)||($bin === '')){
      $bin = 'ND o NC';
    }
    
    array_push($dato, $bin);
    if ($tipoProducto){
      array_push($dato, $fechaCreacion);
    }
    array_push($dato, $codEMSA);
    array_push($dato, $codOrigen);
    array_push($dato, $tipo);
    if ($mostrarEstado){
      array_push($dato, $estado);
    }
    array_push($dato, $cantidad);
    /// Acomodo el índice pues empieza en 0, y en el 1 están los nombres de los campos:
    $i = $i + $filaEncabezado + 1;
    $celda = $colId.$i;
    $hoja->fromArray($dato, ' ', $celda);
  }
  $j = $i+1;
  ///*************************************** FIN ESCRIBO DATOS *****************************************
  
  ///*********************************************** TEST TEXTO LEGAL **************************************** 
  /// Agrego línea con el texto legal:
  $k = $i+3;
  $l = $k+3;
  $hoja->mergeCells($colId.$k.':'.$colCantidad.$l.'');
  $hoja->setCellValue($colId.$k.'', $textoLegalExcel);
  $celdaTextoLegal = ''.$colId.$k.':'.$colCantidad.$l.'';
  ///******************************************** FIN TEST TEXTO LEGAL ***************************************
  
  ///********************************************* FORMATO TEXTO LEGAL ****************************************
  /// Defino el formato para el texto legal:
  $styleTextoLegal = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTextoLegal"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'italic' => true,
          'size' => 10,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
      ),
    'borders' => array(
          'allBorders' => array(
            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,      
          ),
      ),
  );
  $hoja->getStyle($celdaTextoLegal)->applyFromArray($styleTextoLegal);
  ///********************************************* FIN FORMATO TEXTO LEGAL ***********************************
  
  
  ///************************************ MUESTRO TOTALES **********************************************
  $colFinal = '';
  if (($tipoMov === 'AJUSTE Retiros')||($tipoMov === 'AJUSTE Ingresos')||($tipoMov === 'Ajustes')||($tipoMov === 'Todos')){
    $colFinal = $colAjuIngresos;
    $hoja->setCellValue($colAjuRetiros.'2', 'Ajustes Retiros');
    $hoja->setCellValue($colAjuIngresos.'2', 'Ajustes Ingresos');
  }
  else {
    $colFinal = $colIngresos;
  }
  
  $hoja->mergeCells($colNombreTotales.'1:'.$colFinal.'1');
  $hoja->setCellValue($colNombreTotales."1", "TOTALES");
  $hoja->setCellValue($colNombreTotales."2", "Nombre");
  $hoja->setCellValue($colRetiros."2", "Retiros");
  $hoja->setCellValue($colRenos."2", "Renovaciones");
  $hoja->setCellValue($colDestrucciones.'2', 'Destrucciones');
  $hoja->setCellValue($colConsumos.'2', 'Consumos');
  $hoja->setCellValue($colIngresos.'2', 'Ingresos');
  
  $resumen = Array();
  $ids = Array();
  $id = '';
  foreach ($registros as $datito){
    $idprod = $datito[0];
    $nombre = $datito[5];
    $tipo = $datito[10];
    $cantidad = $datito[11];
    //echo "idprod: $idprod - nombre: $nombre - tipo: $tipo - cantidad: $cantidad<br>";
    if (!(isset($resumen["$idprod"]['retiros']))){
      $resumen["$idprod"]['retiros'] = 0;
    }
    if (!(isset($resumen["$idprod"]['renos']))){
      $resumen["$idprod"]['renos'] = 0;
    }
    if (!(isset($resumen["$idprod"]['destrucciones']))){
      $resumen["$idprod"]['destrucciones'] = 0;
    }
    if (!(isset($resumen["$idprod"]['ingresos']))){
      $resumen["$idprod"]['ingresos'] = 0;  
    }
    if (!(isset($resumen["$idprod"]['ajustesRetiros']))){
      $resumen["$idprod"]['ajustesRetiros'] = 0;  
    }
    if (!(isset($resumen["$idprod"]['ajustesIngresos']))){
      $resumen["$idprod"]['ajustesIngresos'] = 0;  
    }
    switch ($tipo){
      case 'Retiro':  $resumen["$idprod"]['retiros'] = $resumen["$idprod"]['retiros'] + $cantidad;//echo "en retiros: $idprod - $cantidad<br>";
                      break;
      case 'Renovación':  $resumen["$idprod"]['renos'] = $resumen["$idprod"]['renos'] + $cantidad;//echo "en renos: $idprod - $cantidad<br>";
                          break;
      case 'Destrucción': $resumen["$idprod"]['destrucciones'] = $resumen["$idprod"]['destrucciones'] + $cantidad;//echo "en destru: $idprod - $cantidad<br>"; 
                          break;
      case 'Ingreso': $resumen["$idprod"]['ingresos'] = $resumen["$idprod"]['ingresos'] + $cantidad;//echo "en ingresos: $idprod - $cantidad<br>"; 
                      break;
      case 'AJUSTE Retiro': $resumen["$idprod"]['ajustesRetiros'] = $resumen["$idprod"]['ajustesRetiros'] + $cantidad;//echo "en ingresos: $idprod - $cantidad<br>"; 
                      break;
      case 'AJUSTE Ingreso': $resumen["$idprod"]['ajustesIngresos'] = $resumen["$idprod"]['ajustesIngresos'] + $cantidad;//echo "en ingresos: $idprod - $cantidad<br>"; 
                      break;              
      default: break;
    }
    if ($id !== $idprod){
       $ids[] = $idprod;
       $id = $idprod;
       $resumen["$idprod"]['nombre'] = $nombre;
    }
  }
  
  $n = 3;
  foreach ($ids as $id1){
    if ((!isset($resumen["$id1"]['retiros']))) {
      $resumen["$id1"]['retiros'] = 0;
    }
    if ((!isset($resumen["$id1"]['ingresos']))) {
      $resumen["$id1"]['ingresos'] = 0;
    }
    if ((!isset($resumen["$id1"]['renos']))) {
      $resumen["$id1"]['renos'] = 0;
    }
    if ((!isset($resumen["$id1"]['destrucciones']))) {
      $resumen["$id1"]['destrucciones'] = 0;
    }
    if ((!isset($resumen["$id1"]['ajustesIngresos']))) {
      $resumen["$id1"]['ajustesIngresos'] = 0;
    }
    if ((!isset($resumen["$id1"]['ajustesRetiros']))) {
      $resumen["$id1"]['ajustesRetiros'] = 0;
    }
    $hoja->setCellValue($colNombreTotales.$n, $resumen["$id1"]['nombre']);
    $hoja->setCellValue($colRetiros.$n, $resumen["$id1"]['retiros']);
    $hoja->setCellValue($colRenos.$n, $resumen["$id1"]['renos']);
    $hoja->setCellValue($colDestrucciones.$n, $resumen["$id1"]['destrucciones']);
    $hoja->setCellValue($colConsumos.$n,'='.$colRetiros.$n.'+'.$colRenos.$n.'+'.$colDestrucciones.$n);
    $hoja->setCellValue($colIngresos.$n, $resumen["$id1"]['ingresos']);
    if ($colFinal === $colAjuIngresos){
      $hoja->setCellValue($colAjuRetiros.$n, $resumen["$id1"]['ajustesRetiros']);
      $hoja->setCellValue($colAjuIngresos.$n, $resumen["$id1"]['ajustesIngresos']);
    } 
    $n++;
  }
  $finDatos = $n - 1;
  
  ///Línea con el total por categoría y totales generales:
  $hoja->setCellValue($colNombreTotales.$n, "TOTALES");
  $hoja->setCellValue($colRetiros.$n, '=SUM('.$colRetiros.'3:'.$colRetiros.$finDatos.')');
  $hoja->setCellValue($colRenos.$n, '=SUM('.$colRenos.'3:'.$colRenos.$finDatos.')');
  $hoja->setCellValue($colDestrucciones.$n, '=SUM('.$colDestrucciones.'3:'.$colDestrucciones.$finDatos.')');
  $hoja->setCellValue($colConsumos.$n, '=SUM('.$colConsumos.'3:'.$colConsumos.$finDatos.')');
  $hoja->setCellValue($colIngresos.$n, '=SUM('.$colIngresos.'3:'.$colIngresos.$finDatos.')');
  if ($colFinal === $colAjuIngresos){
    $hoja->setCellValue($colAjuRetiros.$n, '=SUM('.$colAjuRetiros.'3:'.$colAjuRetiros.$finDatos.')');
    $hoja->setCellValue($colAjuIngresos.$n, '=SUM('.$colAjuIngresos.'3:'.$colAjuIngresos.$finDatos.')');
  }
  
  ///************************************* Formato Título Resumen **************************************
  $header1 = $colNombreTotales.'1:'.$colFinal.'1';
  $styleTituloTotales = array(
      'font' => array(
          'bold' => true,
          'underline' => true,
        ),
      'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoCampos"]),
          'fillType' => 'solid',
        ),
      );
  $hoja->getStyle($header1)->applyFromArray($styleTituloTotales);
  ///*********************************** FIN Formato Título Resumen ************************************
  
  ///************************************ Formato nombre CAMPOS ****************************************
  $nombreCampos = $colNombreTotales.'2:'.$colFinal.'2';
  $styleCamposTotales = array(
    'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoCamposResumen"]),
          'fillType' => 'solid',
        ),
    'font' => array(
        'bold' => true,
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getStyle($nombreCampos)->applyFromArray($styleCamposTotales);
  ///************************************ FIN Formato nombre CAMPOS ************************************
  
  ///************************************ Formato Nombre Productos *************************************
  $nombreProductos = $colNombreTotales.'3:'.$colNombreTotales.$finDatos;
  $styleNombreProductos = array(
    'font' => array(
        'bold' => true,
        'italic' => true,
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getStyle($nombreProductos)->applyFromArray($styleNombreProductos);
  ///********************************** FIN Formato Nombre Productos ***********************************
  
  ///************************************ Formato Totales Categoría ************************************
  $rangoTotales = $colRetiros.'3:'.$colDestrucciones.$n;
  $styleTotales = array(
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ),  
    'numberFormat' => array(
        'formatCode' => '['.$GLOBALS["colorCategorias"].']#,##0',
      ),
  );
  $hoja->getStyle($rangoTotales)->applyFromArray($styleTotales);
  ///********************************** FIN Formato Totales Categoría **********************************
  
  ///***************************************** Formato Consumos ****************************************
  $rangoConsumos = $colConsumos.'3:'.$colConsumos.$finDatos;
  $styleConsumos = array(
    'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoConsumos"]),
          'fillType' => 'solid',
        ),
    'font' => array(
        'bold' => true,
        'size' => 13,
        'color' => array('rgb' => $GLOBALS["colorConsumos"]),
      ),
    'numberFormat' => array(
        'formatCode' => '#,##0',
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getStyle($rangoConsumos)->applyFromArray($styleConsumos);
  ///*************************************** FIN Formato Consumos **************************************
  
  ///***************************************** Formato Ingresos ****************************************
  $rangoIngresos = $colIngresos.'3:'.$colIngresos.$finDatos;
  $resaltarIngresos = array(
    'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoIngresos"]),
          'fillType' => 'solid',
        ),
    'font' => array(
        'bold' => true,
        'size' => 13,
      'color' => array('rgb' => $GLOBALS["colorIngresos"]),
      ),
    'numberFormat' => array(
        'formatCode' => '#,##0',
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getStyle($rangoIngresos)->applyFromArray($resaltarIngresos);
  ///*************************************** FIN Formato Ingresos **************************************
  
  if ($colFinal === $colAjuIngresos){
    ///************************************** Formato Ajuste Retiros *************************************
    $rangoAjuRetiros = $colAjuRetiros.'3:'.$colAjuRetiros.$finDatos;
    $resaltarAjuRetiros = array(
      'fill' => array(
            'color' => array('rgb' => $GLOBALS["colorFondoAjustesRetiros"]),
            'fillType' => 'solid',
          ),
      'font' => array(
          'bold' => true,
          'size' => 13,
        'color' => array('rgb' => $GLOBALS["colorAjustesRetiros"]),
        ),
      'numberFormat' => array(
          'formatCode' => '#,##0',
        ),
      'borders' => array(
                'allBorders' => array(
                  'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                  'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                  ),
                ), 
      'alignment' => array(
           'wrap' => true,
           'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
           'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
        ),
    );
    $hoja->getStyle($rangoAjuRetiros)->applyFromArray($resaltarAjuRetiros);
    ///************************************ FIN Formato Ajuste Retiros ***********************************

    ///************************************** Formato Ajuste Ingresos ************************************
    $rangoAjuIngresos = $colAjuIngresos.'3:'.$colAjuIngresos.$finDatos;
    $resaltarAjuIngresos = array(
      'fill' => array(
            'color' => array('rgb' => $GLOBALS["colorFondoAjustesIngresos"]),
            'fillType' => 'solid',
          ),
      'font' => array(
          'bold' => true,
          'size' => 13,
          'color' => array('rgb' => $GLOBALS["colorAjustesIngresos"]),
        ),
      'numberFormat' => array(
          'formatCode' => '#,##0',
        ),
      'borders' => array(
                'allBorders' => array(
                  'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                  'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                  ),
                ), 
      'alignment' => array(
           'wrap' => true,
           'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
           'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
        ),
    );
    $hoja->getStyle($rangoAjuIngresos)->applyFromArray($resaltarAjuIngresos);
    ///************************************ FIN Formato Ajuste Ingresos **********************************
  }
  
  ///*************************************** Formato Palabra TOTAL *************************************
  $rangoTotal = $colNombreTotales.$n;
  $resaltarPalabraTotal = array(
    'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoCampos"]),
          'fillType' => 'solid',
        ),
    'font' => array(
        'bold' => true,
        'size' => 13,
      ),
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
  );
  $hoja->getStyle($rangoTotal)->applyFromArray($resaltarPalabraTotal);
  ///************************************* FIN Formato Palabra TOTAL ***********************************
  
  ///************************************** Formato Consumos Total *************************************
  $rangoConsumosTotal = $colConsumos.$n;
  $colorConsumosTotal = array(
    'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTotalConsumos"]),
          'fillType' => 'solid',
        ),
    'font' => array(
        'bold' => true,
        'size' => 13,
        'italic' => true,
        'color' => array('rgb' => $GLOBALS["colorConsumosTotal"]),
      ),
    'numberFormat' => array(
        'formatCode' => '#,##0',
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getStyle($rangoConsumosTotal)->applyFromArray($colorConsumosTotal);
  ///*********************************** FIN Formato Consumos Total ************************************
  
  ///************************************** Formato Ingresos Total *************************************
  $rangoIngresosTotal = $colIngresos.$n;
  $resaltarIngresosTotal = array(
    'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTotalIngresos"]),
          'fillType' => 'solid',
        ),
    'font' => array(
        'bold' => true,
        'size' => 13,
        'italic' => true,
        'color' => array('rgb' => $GLOBALS["colorIngresosTotal"]),
      ),
    'numberFormat' => array(
        'formatCode' => '#,##0',
      ),
    'borders' => array(
              'allBorders' => array(
                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                ),
              ), 
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getStyle($rangoIngresosTotal)->applyFromArray($resaltarIngresosTotal);
  ///************************************* FIN Formato Ingresos Total **********************************
  
  if ($colFinal === $colAjuIngresos){
    ///********************************** Formato Ajustes Retiros Total **********************************
    $rangoAjuRetirosTotal = $colAjuRetiros.$n;
    $formatoAjuRetirosTotal = array(
      'fill' => array(
            'color' => array('rgb' => $GLOBALS["colorFondoAjustesRetirosTotal"]),
            'fillType' => 'solid',
          ),
      'font' => array(
          'bold' => true,
          'size' => 13,
          'italic' => true,
          'color' => array('rgb' => $GLOBALS["colorAjustesRetirosTotal"]),
        ),
      'numberFormat' => array(
          'formatCode' => '#,##0',
        ),
      'borders' => array(
                'allBorders' => array(
                  'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                  'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                  ),
                ), 
      'alignment' => array(
           'wrap' => true,
           'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
           'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
        ),
    );
    $hoja->getStyle($rangoAjuRetirosTotal)->applyFromArray($formatoAjuRetirosTotal);
    ///******************************* FIN Formato Ajustes Retiros Total *********************************

    ///********************************** Formato Ajustes Ingresos Total *********************************
    $rangoAjuIngresosTotal = $colAjuIngresos.$n;
    $formatoAjuIngresosTotal = array(
      'fill' => array(
            'color' => array('rgb' => $GLOBALS["colorFondoAjustesIngresosTotal"]),
            'fillType' => 'solid',
          ),
      'font' => array(
          'bold' => true,
          'size' => 13,
          'italic' => true,
          'color' => array('rgb' => $GLOBALS["colorAjustesIngresosTotal"]),
        ),
      'numberFormat' => array(
          'formatCode' => '#,##0',
        ),
      'borders' => array(
                'allBorders' => array(
                  'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
                  'color' => array('rgb' => $GLOBALS["colorBordeResumen"]),
                  ),
                ), 
      'alignment' => array(
           'wrap' => true,
           'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
           'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
        ),
    );
    $hoja->getStyle($rangoAjuIngresosTotal)->applyFromArray($formatoAjuIngresosTotal);
    ///******************************* FIN Formato Ajustes Ingresos Total ********************************
  }
  
  ///************************************** Formato Muestro TOTALES ************************************
  $rangoTotalGeneral = $colRetiros.$n.':'.$colDestrucciones.$n;
  $resaltarTotalGeneral = array(
    'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoTotalesCategoria"]),
          'fillType' => 'solid',
        ),
    'font' => array(
        'bold' => true,
        'size' => 13,
        'color' => array('rgb' => $GLOBALS["colorTextoTotalesCategoria"]),
        'italic' => true,
      ),//
    'numberFormat' => array(
        'formatCode' => '#,##0',
      ),
    'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
  );
  $hoja->getStyle($rangoTotalGeneral)->applyFromArray($resaltarTotalGeneral);
  ///************************************ FIN Formato MUESTRO TOTALES *************************************
  
  /*
  /// Agrego línea con el total del stock:
  $j = $i+1;
  $hoja->mergeCells('A'.$j.':D'.$j.'');
  $hoja->setCellValue('A'.$j.'', 'TOTAL');
  $celdaTotalTarjetas = "E".$j;
  $hoja->setCellValue($celdaTotalTarjetas, $total);


  /// Defino el formato para la celda con el total de tarjetas:
  $styleTotalPlasticos = array(
      'fill' => array(
          'color' => array('rgb' => 'F3FF00'),
          'type' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'italic' => true,
          'size' => 14,
          'color' => array('rgb' => 'ff0000'),
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => 'center',
         'vertical' => 'bottom',
      ),
      'numberformat' => array(
          'code' => '#,###0',
      ),
  );
  $hoja->getStyle($celdaTotalTarjetas)->applyFromArray($styleTotalPlasticos);

  /// Defino el formato para la celda con el texto "Total":
  $styleTextoTotal = array(
      'fill' => array(
          'color' => array('rgb' => 'AEE2FA'),
          'type' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'size' => 14,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => 'center',
         'vertical' => 'middle',
      ),
  );
  $hoja->getRowDimension($j)->setRowHeight(18);
  $hoja->getStyle('A'.$j.'')->applyFromArray($styleTextoTotal);
  */

  ///*********************************** Formato para la CANTIDAD: ****************************************
  $styleColumnaCantidad = array(
      'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoStockRegular"]),
          'fillType' => 'solid',
      ),
      'font' => array(
          'bold' => true,
          'size' => 12,
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'numberFormat' => array(
         'formatCode' => '['.$GLOBALS["colorStock"].']#,##0',
      ),
  );
  $rangoStock = $colCantidad.$filaUnoDatos.':'.$colCantidad.$i.'';
  $hoja->getStyle($rangoStock)->applyFromArray($styleColumnaCantidad);
  ///*********************************** FIN Formato para la CANTIDAD ************************************
  
  ///*********************************** Formato para la FECHA: ****************************************
  $styleColumnaFecha = array(
        'fill' => array(
          'color' => array('rgb' => $GLOBALS["colorFondoFecha"]),
          'fillType' => 'solid',
      ),
      'alignment' => array(
         'wrap' => true,
         'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
         'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      ),
      'numberFormat' => array(
          'formatCode' => 'DD/MM/YYYY',
      ),
  );
  $rangoFecha = $colFecha.$filaUnoDatos.':'.$colFecha.$i.'';
  $hoja->getStyle($rangoFecha)->applyFromArray($styleColumnaFecha);
  ///*********************************** FIN Formato para la FECHA: ************************************
  
  ///**************************************** FORMATO GENERAL: *****************************************
  /// Defino el rango de celdas con datos para poder darle formato a todas juntas:
  $rango = $colId.$filaEncabezado.":".$colCantidad.$i;
  /// Defino el formato para las celdas:
  $styleGeneral = array(
      'borders' => array(
            'allBorders' => array(
            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
            'color' => array('rgb' => $GLOBALS["colorBordeRegular"]),
          ),
      ),
      'alignment' => array(
        'wrap' => true,
        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
        'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      )
  );
  $hoja->getStyle($rango)->applyFromArray($styleGeneral);
  ///**************************************** FIN FORMATO GENERAL: *************************************

  ///**************************************** INICIO AJUSTE ANCHO COLUMNAS *****************************
  /// Ajusto el auto size para que las celdas no se vean cortadas:
  for ($col = ord($colId); $col <= ord($colFinal); $col++)
    {
    $hoja->getColumnDimension(chr($col))->setAutoSize(TRUE);
  }
  ///Elimino seteo de ajuste máximo en caso de ser muy grande del campo COMENTARIOS pues ya NO se muestra el mismo:
  
  ///Se agrega seteo fijo de la columna de separación entre los movimientos y los totales:
  $hoja->calculateColumnWidths();
  $hoja->getColumnDimension($colVacia1)->setAutoSize(false);
  $hoja->getColumnDimension($colVacia1)->setWidth(2);
  ///****************************************** FIN AJUSTE ANCHO COLUMNAS ******************************
  
  switch ($planilla){
    case "nada": break;
    case "misma": if ($zipSeguridad !== 'nada') {
                    $pwdPlanilla = $pwdZip;
                  }
                  break;
    case "fecha": $pwdPlanilla = $timestampCorto; 
                  break;
    case "random": $pwdPlanilla = $pwdPlanillaManual;
                   break;
    case "manual": $pwdPlanilla = $pwdPlanillaManual;
                   break;
    default: break;
  } 
  if ((($planilla !== "nada")&&($planilla !== 'misma'))||(($planilla === "misma")&&($zipSeguridad !== "nada"))){
    ///Agrego protección para la hoja activa:
    $hoja->getProtection()->setPassword($pwdPlanilla);
    $hoja->getProtection()->setSheet(true);
  }
  
  /// Se guarda como Excel 2007:
  $writer = new Xlsx($spreadsheet);

  $nombreArchivo = $nombreReporte."_".$timestamp.".Xlsx";
  $salida = $GLOBALS["dirExcel"]."/".$nombreArchivo;
  $writer->save($salida);

  return $nombreArchivo;
}
