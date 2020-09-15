<?php
/**
******************************************************
*  @file generarPdfs.php
*  @brief Archivo con las funciones que generan los archivos PDF.
*  @author Juan Martín Ortega
*  @version 1.0
*  @date Noviembre 2017
*
*******************************************************/
require_once("css/colores.php");
require_once("data/mc_table.php");

class PDF extends PDF_MC_Table
  {
  ///Constantes usadas por las funciones de ajuste de las imágenes:
  const DPI_150 = 150;
  const DPI_300 = 300;
  const MM_IN_INCH = 25.4;
  const A4_HEIGHT = 297;
  const A4_WIDTH = 210;
  // tweak these values (in pixels)
//  const A4_WIDTH_PX_150 = 1240;
//  const A4_HEIGHT_PX_150 = 1754;
//  const A4_WIDTH_PX_300 = 2480;
//  const A4_HEIGHT_PX_300 = 3508;
  const LOGO_WIDTH_MM = 50;
  const LOGO_HEIGHT_MM = 20;
  const FOTO_WIDTH_MM = 60;
  const FOTO_HEIGHT_MM = 37.84;
  
  ///Variable usada por las funciones de generación de las marcas de agua:
  var $angle=0;
   
  //Cabecera de página
  function Header()
    {
    global $fecha, $hora, $titulo, $x, $hFooter, $marcaAgua, $textoMarcaAgua, $orientacion, $tipoConsulta;// $hHeader;
    
    $anchoPage = $this->GetPageWidth();
    $anchoDia = 20;
    $xLogo = 2;
    $yLogo = 2;
    
    //Agrego logo de EMSA:
    $logo = 'images/logotipo.jpg';
    if (file_exists($logo)){
      list($nuevoAncho, $nuevoAlto) = $this->resizeToFit($logo, self::LOGO_WIDTH_MM, self::LOGO_HEIGHT_MM);
    }
    $q1 = stripos($tipoConsulta, " de todos los tipos (inc. AJUSTES)");
    if ($q1 !== FALSE) {
      if (stripos($titulo, "(TODOS)") === FALSE){
        ///$titulo = $titulo." (TODOS)";
        /// Se cambia el nombre del encabezado a pedido de Diego:
        $titulo = "REPORTE INTERNO";
      }
    }
    
    $anchoTitle = $anchoPage - $anchoDia - $nuevoAncho - 2*$xLogo;
    
    //echo "pagina: $ancho<br>ancho logo: ".$anchoLogoPx."<br>alto: ".$altoLogoPx."<br>ancho logo mm: ".$anchoLogoMm."<br>alto mm: ".$altoLogoMm."<br><br>";
    $this->Image($logo, $xLogo, $yLogo, $nuevoAncho, $nuevoAlto);
    $this->setY($yLogo+1);
    $this->setX($nuevoAncho+$xLogo);
    
    $this->SetTextColor(0, 0, 0);
    $this->SetFillColor(colorTituloHeader[0], colorTituloHeader[1], colorTituloHeader[2]);
    //Defino características para el título y agrego el título:
    $this->SetFont('Arial', 'BU', 18);
    $this->Cell($anchoTitle, $nuevoAlto-1, strtoupper(utf8_decode($titulo)), 0, 0, 'C', false);
    
    $this->setY($yLogo+1);
    $xFecha = $nuevoAncho+$anchoTitle+$xLogo;
    $this->setX($xFecha);
    
    $this->SetFont('Arial');
    $this->SetFontSize(10);
    
    $this->Cell($anchoDia, $nuevoAlto-5, $fecha, 0, 0, 'C',false);
    
    $this->setY($yLogo+6);
    $this->setX($xFecha);
    
    $this->SetFont('Arial');
    $this->SetFontSize(10);   
    
    $this->Cell($anchoDia, 5, $hora, 0, 0, 'C', false);

    ///*************************** AGREGADO DE UNA MARCA DE AGUA: *********************************************
    if ($marcaAgua !== "false") {
      $this->SetTextColor(colorMarcaAgua[0],colorMarcaAgua[1],colorMarcaAgua[2]);
      //Put the watermark
      if ($orientacion === 'P'){
        $this->SetFont('Arial','B',120); 
        $this->RotatedText(25,290,$textoMarcaAgua,56);
      }
      else {
        $this->SetFont('Arial','B',120);
        $this->RotatedText(20,200,$textoMarcaAgua,33);
      }   
    }
    ///************************ FIN AGREGADO DE UNA MARCA DE AGUA *********************************************
    
    
    ///******************************* TEST AGREGADO RECTÁNGULO: **********************************************
    
    ///********************************************************************************************************
    $anchoRect = 0.97*$anchoPage;
    $xRect = round((($anchoPage - $anchoRect)/2), 2);
    $this->Rect($xRect, $yLogo+ self::LOGO_HEIGHT_MM-2, $anchoRect, $this->GetPageHeight()-self::LOGO_HEIGHT_MM-6, 'D');
    ///********************************************************************************************************
    
    ///******************************** FIN AGREGADO RECTÁNGULO: **********************************************
    
    //Dejo el cursor donde debe empezar a escribir:
    $this->Ln(18);
    $this->setX($x);
    }

  //Pie de página
  function Footer()
    {
    global $h, $hFooter, $textoLegal;
        
    $this->SetFont('Arial', 'I', 7);
    $this->SetTextColor(0);
    $this->SetFillColor(colorTextoLegal[0], colorTextoLegal[1], colorTextoLegal[2]);
    $anchoPagina = $this->GetPageWidth();
    $anchoTipoFooter = 0.9*$anchoPagina;
    $xFooter = ($anchoPagina - $anchoTipoFooter)/2; 
    
    $nbTextoLegal = $this->NbLines($anchoTipoFooter,$textoLegal);
    $hTextoLegal=$h*$nbTextoLegal;

    $hFooter = $hTextoLegal + $h;
    $this->SetY(-$hFooter);
    $this->setX($xFooter);
    if ($nbTextoLegal > 1){
      $this->MultiCell($anchoTipoFooter, $h, $textoLegal, 'BT', 'L', false);
    }
    else {
      $this->Cell($anchoTipoFooter, $hTextoLegal, $textoLegal, 0, 'BT', 'L', false);
    }
    $this->setX($xFooter);
    $this->SetFont('Arial', 'I', 8);
    $this->SetTextColor(0);
    $this->Cell($anchoTipoFooter, $h, 'Pag. ' . $this->PageNo(), 0, 0, 'C', false);
    }

  //Tabla tipo listado para el stock de una o todas las entidades, o también para el total de plásticos en bóveda:
  function tablaStockEntidad($total, $tipo)
    {
    global $x,$h, $hFooter, $totalCampos, $totalRegistros;
    global $registros, $subtotales, $campos, $largoCampos, $tituloTabla, $tipoConsulta, $entidad, $mostrar;
    
    $tamTabla = $largoCampos[$totalCampos];
    $anchoPagina = $this->GetPageWidth();
    $anchoTipo = 0.8*$anchoPagina;
    
    $x = round((($anchoPagina-$tamTabla)/2), 2);
    $xTipo = round((($anchoPagina - $anchoTipo)/2), 2);
    
    $tamEntidad = $this->GetStringWidth($entidad);    
    
    //Defino color para los bordes:
    $this->SetDrawColor(0, 0, 0);
    //Defino grosor de los bordes:
    $this->SetLineWidth(.3);
    
    ///***************************************************************** TITULO *************************************************************
    //Defino tipo de letra y tamaño para el Título:
    $this->SetFont('Courier', 'B', 12);
    //$this->SetY(20);

    //$tipoTotal = "Stock de $entidad";
    $tipoTotal = $tipoConsulta;
    $tam = $this->GetStringWidth($tipoTotal);
    $xInicio = $xTipo + (($anchoTipo-$tam)/2);
    $this->SetX($xInicio);

    $nbTitulo = $this->NbLines($anchoTipo,$tipoTotal);
    $hTitulo=$h*$nbTitulo;
    
    //Save the current position
    $x1=$this->GetX();
    $y=$this->GetY();
    $tam1 = $this->GetStringWidth("Stock de ");
    
    $fraccionado = false;
    $parteTipo = stripos($tipoTotal, ": ");
    if ($parteTipo !== false){
      $parte2 = explode(": ", $tipoTotal);
      $ultimaParte = utf8_decode(" al día: ".$parte2[1]);
      $fraccionado = true;
      $tamUlitmaParte = $this->GetStringWidth($ultimaParte);
    }
    
    $dia = date('d');
    $mes = date('m');
    $año = date('y');
    $fecha = $dia.'/'.$mes.'/'.$año;
    if ($tipo) {
      ///Si es Total de stock en bóveda, le agrego itálica a todo el título:
      $this->SetFont('Courier', 'BI', 12);
      $this->SetTextColor(0);
      $this->SetX($xTipo);
      $this->MultiCell($anchoTipo, $h, utf8_decode($tipoConsulta."al: ".$fecha), 0, 'C', 0);
    }
    else {
      if ($nbTitulo > 1) {
        $this->SetTextColor(0);
        $this->Cell($tam1,$h, "Stock de ",0, 0, 'R', 0);
        $this->SetTextColor(255, 0, 0);
        $this->SetFont('Courier', 'BI', 12);
        $tamNombre1 = $this->GetStringWidth($entidad);
        $this->Cell($tamNombre1,$h, utf8_decode($entidad),0, 0,'L', 0);
        $this->SetTextColor(0);
        if ($fraccionado){
          $this->Cell($tamUlitmaParte,$h, $ultimaParte,0, 0, 'L', 0);
        }
      }
      else {
        $this->SetTextColor(0);
        $this->Cell($tam1,$hTitulo, "Stock de",0, 0,'R', 0);
        $this->SetTextColor(255, 0, 0);
        $this->SetFont('Courier', 'BI', 12);
        $tamNombre1 = $this->GetStringWidth($entidad);
        $this->Cell($tamNombre1,$hTitulo, utf8_decode($entidad),0, 0,'L', 0);
        $this->SetTextColor(0);
        if ($fraccionado){
          $this->Cell($tamUlitmaParte,$hTitulo, $ultimaParte,0, 0, 'L', 0);
        }
      }  
    }
    ///************************************************************** FIN TITULO ************************************************************
    
    $this->Ln(7);
    $y = $this->GetY();
    
    ///***************************************************************** SUB-TITULO **********************************************************
    ///Agrego el total de registros afectados sólo para el caso de que se trate de una entidad y no de un producto:
    if (!$tipo){
      $this->SetFont('Courier', 'BI', 11);
      $mensajeTotal = "Total de productos:";
      $tam2 = $this->GetStringWidth($mensajeTotal);
      $tam3 = $this->GetStringWidth($totalRegistros);
      $xMensajeTotal =($anchoPagina - $tam2 - $tam3)/2;
      $this->SetX($xMensajeTotal);
      $this->Cell($tam2,$h, $mensajeTotal,0, 0, 'R', 0);
      $this->SetTextColor(255, 0, 0);
      $this->SetFont('Courier', 'BI', 14);
      $this->Cell($tam3,$h, $totalRegistros,0, 0,'L', 0);
      $this->SetTextColor(0);
      $this->Ln(10);
      $y = $this->GetY();
    }
    ///************************************************************** FIN SUB-TITULO *********************************************************
    
    
    
    //************************************** TÍTULO TABLA ***********************************************************************************
    $this->SetX($x);
    //Defino color de fondo para el título de la tabla:
    $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
    //Defino el color del texto para el título de la tabla:
    $this->SetTextColor(255, 255, 255);
    ///Agrego el rectángulo con el borde redondeado:
    $this->RoundedRect($x, $y, $largoCampos[$totalCampos], $h, 3.5, '12', 'DF');
    //Escribo el título:
    $this->Cell($largoCampos[$totalCampos], $h, utf8_decode($tituloTabla), 0, 0, 'C', 0);
    $this->Ln();
    //**************************************  FIN TÍTULO TABLA ******************************************************************************
    
    ///************************************************************** INICIO CAMPOS *********************************************************
    //Restauro color de fondo y tipo de letra para los nombres de los campos (que será el mismo que para la fila con el total):
    $indiceStock = '';
    $indiceEntidad = '';
    $indiceMensaje = '';
    $indiceCodEMSA = '';
    $indiceCodOrigen = '';
    $indiceUltMov = '' ;
    $indiceAlarma1 = '';
    $indiceAlarma2 = '';
    $indiceFechaCreacion = '';
    $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
    $this->SetTextColor(255, 255, 255);
    $this->SetX($x);
    $this->SetFont('Courier', 'B', 10);
    foreach ($campos as $i => $dato) {
      if ($mostrar[$i]) {
        $this->Cell($largoCampos[$i], $h, $campos[$i], 'LRBT', 0, 'C', true);
        if ($campos[$i] === 'Stock') {
          $indiceStock = $i;
          if (!($tipo)){
            $indiceAlarma1 = $i + 1;
            $indiceAlarma2 = $i + 2;
          }
        }
        
        if ($campos[$i] === 'Mensaje') {
          $indiceMensaje = $i;
        }
        if ($campos[$i] === utf8_decode('Cód. EMSA')) {
          $indiceCodEMSA = $i;
        }
        if ($campos[$i] === utf8_decode('Cód. Origen')) {
          $indiceCodOrigen = $i;
        }
        if ($campos[$i] === utf8_decode('Últ. Mov.')) {
          $indiceUltMov = $i;
        }
        if ($campos[$i] === 'Fecha Creación') {
          $indiceFechaCreacion = $i;
        }
      }
    }
    ///************************************************************** FIN CAMPOS ************************************************************  
    
    ///************************************************************ COMIENZO DATOS **********************************************************
    $this->Ln();
    $this->SetX($x);
    $this->SetFont('Courier', '', 9);    
    $fill = 1;
    foreach ($registros as $dato) {
      ///******* Calculo el alto de la fila según el dato más largo: ************************************************************************
      $nb=0;
      $h0 = 0;
      for($i=0;$i<count($dato);$i++) {
        $dat = '';
        $tamDat = 0;
        $this->SetFont('Courier', '', 9);
        $dat = trim(utf8_decode($dato[$i]));
        if ($i === $indiceUltMov) {
          $separo = explode(" ", $dat);
          $dat = $separo[0];
        }
        
        $tamDat = $this->GetStringWidth($dat);
        $w1 = $largoCampos[$i];
        if ($mostrar[$i]){
          $nb=max($nb,$this->NbLines($w1,$dat));
        }
      }
      $h0=$h*$nb;
      ///******************** FIN Cálculo del alto de la fila *******************************************************************************
      
      //Issue a page break first if needed
      //$this->CheckPageBreak($h0);
      
      ///*-******************************************** ENCABEZADO DE PÁGINA ****************************************************************
      if($this->GetY()+$h0>$this->PageBreakTrigger){
        $this->AddPage($this->CurOrientation);
        $this->SetAutoPageBreak(true, $hFooter);
        ///***************************************************************** TITULO ************************************************************
        //Defino tipo de letra y tamaño para el Título:
        $this->SetFont('Courier', 'B', 12);
        //$this->SetY(20);

        //$tipoTotal = "Stock de $entidad";
        $tipoTotal = $tipoConsulta;
        $tam = $this->GetStringWidth($tipoTotal);
        $xInicio = $xTipo + (($anchoTipo-$tam)/2);
        $this->SetX($xInicio);

        $nbTitulo = $this->NbLines($anchoTipo,$tipoTotal);
        $hTitulo=$h*$nbTitulo;

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        $tam1 = $this->GetStringWidth("Stock de ");

        $fraccionado = false;
        $parteTipo = stripos($tipoTotal, ": ");
        if ($parteTipo !== false){
          $parte2 = explode(": ", $tipoTotal);
          $ultimaParte = utf8_decode(" al día: ".$parte2[1]);
          $fraccionado = true;
          $tamUlitmaParte = $this->GetStringWidth($ultimaParte);
        }

        if ($tipo) {
          ///Si es Total de stock en bóveda, le agrego itálica a todo el título:
          $this->SetFont('Courier', 'BI', 12);
          $this->SetTextColor(0);
          $this->SetX($xTipo);
          $this->MultiCell($anchoTipo, $h, utf8_decode($tipoConsulta), 0, 'C', 0);
        }
        else {
          if ($nbTitulo > 1) {
            $this->SetTextColor(0);
            $this->Cell($tam1,$h, "Stock de ",0, 0, 'R', 0);
            $this->SetTextColor(255, 0, 0);
            $this->SetFont('Courier', 'BI', 12);
            $tamNombre1 = $this->GetStringWidth($entidad);
            $this->Cell($tamNombre1,$h, utf8_decode($entidad),0, 0,'L', 0);
            $this->SetTextColor(0);
            if ($fraccionado){
              $this->Cell($tamUlitmaParte,$h, $ultimaParte,0, 0, 'L', 0);
            }
          }
          else {
            $this->SetTextColor(0);
            $this->Cell($tam1,$hTitulo, "Stock de",0, 0,'R', 0);
            $this->SetTextColor(255, 0, 0);
            $this->SetFont('Courier', 'BI', 12);
            $tamNombre1 = $this->GetStringWidth($entidad);
            $this->Cell($tamNombre1,$hTitulo, utf8_decode($entidad),0, 0,'L', 0);
            $this->SetTextColor(0);
            if ($fraccionado){
              $this->Cell($tamUlitmaParte,$hTitulo, $ultimaParte,0, 0, 'L', 0);
            }
          }  
        }


        ////*****************************************************************************************************************************************************
        /*
//Defino tipo de letra y tamaño para el Título:
        $this->SetFont('Courier', 'B', 12);
        $this->SetTextColor(0);
        $this->SetY(25);
        $this->SetX($xInicio);

        if ($tipo) {
          ///Si es Total de stock en bóveda, le agrego itálica a todo el título:
        $this->SetFont('Courier', 'BI', 12);
        $this->SetTextColor(0);
        $this->SetX($xTipo);
        $this->MultiCell($anchoTipo, $h, utf8_decode($tipoConsulta), 0, 'C', 0);
        }
        else {
          if ($nbTitulo > 1) {
            $this->Cell($tam1,$h, "Stock de:",0, 0, 'R', 0);
            $this->SetTextColor(255, 0, 0);
            $this->Cell($tamEntidad,$h, $entidad."(cont.)",0, 0,'L', 0);
            $this->SetTextColor(0);
          }
          else {
            $this->Cell($tam1,$hTitulo, "Stock de:",0, 0,'R', 0);
            $this->SetTextColor(255, 0, 0);
            $this->Cell($tamEntidad,$hTitulo, $entidad."(cont.)",0, 0,'L', 0);
            $this->SetTextColor(0);
          }  
        }
        */
        $this->Ln(10);
        $y = $this->GetY();
        ///************************************************************** FIN TITULO ************************************************************
        
        //Restauro color de fondo y tipo de letra para los nombres de los campos (que será el mismo que para la fila con el total):
        $this->SetTextColor(255, 255, 255);
        $this->SetFont('Courier');
        $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
        $this->SetX($x);
        $y = $this->GetY();
        
        ///Agrego el rectángulo con el borde redondeado:
        $this->RoundedRect($x, $y, $largoCampos[$totalCampos], $h, 3.2, '12', 'DF');
        
        $this->SetX($x); 
        
        ///Restauro fuente para la fila con los campos:
        $this->SetFont('Courier', 'B', 10);
        foreach ($campos as $i => $dato1) {
          if ($mostrar[$i]) {
            $this->Cell($largoCampos[$i], $h, $campos[$i], 'LRBT', 0, 'C', true);
            if ($campos[$i] === 'Stock') {
              $indiceStock = $i;
            }
            if ($campos[$i] === 'Entidad') {
              $indiceEntidad = $i;
            }
            if ($campos[$i] === 'Mensaje') {
              $indiceMensaje = $i;
            }
            if ($campos[$i] === utf8_decode('Últ. Mov.')) {
              $indiceUltMov = $i;
            }
          }
        }

        $this->Ln();
        $this->SetX($x);
        //$this->SetFont('Courier', '', 9); 
      }
      ///********************************************** FIN ENCABEZADO DE PÁGINA ************************************************************
      $this->setFillColor(colorFondoRegistro[0], colorFondoRegistro[1], colorFondoRegistro[2]);

      ///Escribo las celdas con los datos para la fila:
      for($i=0;$i<count($dato);$i++)
        {
        if ($mostrar[$i]) {         
          $w = $largoCampos[$i];
          $this->SetFont('Courier', '', 9);
          $datito = trim(utf8_decode($dato[$i]));
          
          if ($i === $indiceCodEMSA) {
            if (($datito === '')||($datito === null)){
              $datito = 'NO Ingresado';
            }
          }
          
          if ($i === $indiceCodOrigen) {
            if (($datito === '')||($datito === null)){
              $datito = 'NO Ingresado';
            }
          }
          
          if ($i === $indiceFechaCreacion) {
            if (($datito === '')||($datito === null)){
              $datito = 'NO Ingresada';
            }
            else {
              $datito1 = explode('-', $datito);
              $datito = $datito1[2]."/".$datito1[1]."/".$datito1[0];
            }
          }
          
          if ($i === $indiceUltMov) {
            if ($datito !== ''){
              $separo = explode(" ", $datito);
              $tempDatito = $separo[0];
              if (isset($separo[1])){
                $datito = $tempDatito;
              }
              else {
                $datito1 = explode('-', $tempDatito);
                $datito = $datito1[2]."/".$datito1[1]."/".$datito1[0];
              }
            }
          }
          $tamDat1 = $this->GetStringWidth($datito);
          $nb1 = $this->NbLines($w, $datito);

          //Save the current position
          $x1=$this->GetX();
          $y=$this->GetY();
          
          if ($fill) {
            $f = 'F';
          }
          else {
            $f = '';
          }
          //Draw the border
          $this->Rect($x1,$y,$w,$h0, $f);
          //$this->RoundedRect($x1,$y,$w,$h0, 3.5, '1234', $f);
          
          if ($i === $indiceStock) {//echo "indStock: ".$indiceStock."<br>indAl1: ".$indiceAlarma1."<br>indAl2: ".$indiceAlarma2."<br>";
            if ($tipo){
              /// seteo color de stock regular (verde):
              $this->SetFillColor(colorStockRegular[0], colorStockRegular[1], colorStockRegular[2]);
              $fill = 1;
              $datito = number_format($dato[$indiceStock], 0, ",", ".");
              $a = 'R';
              $fillActual = $fill;
              $this->SetFont('Courier', 'BI', 12);
            }
            else {
              //Detecto si el stock actual está o no por debajo del valor de alarma. En base a eso elijo el color de fondo del stock:
              if (isset($dato[$indiceAlarma1])){
                $alarma1 = $dato[$indiceAlarma1];
              }
              if (isset($dato[$indiceAlarma2])){
                $alarma2 = $dato[$indiceAlarma2];
              }

              if (!isset($subtotales[$dato[1]])){
                $stock = $dato[$indiceStock];
              }
              else {
                $stock = $subtotales[$dato[1]];
              }
              $datito = number_format($stock, 0, ",", ".");
              $a = 'C';
              $fillActual = $fill;
              $this->SetFont('Courier', 'BI', 12);            
              if (($stock < $alarma1) && ($stock > $alarma2)){
                /// seteo color alarma de Advertencia (amarilla):
                $this->SetFillColor(colorStockAlarma1[0], colorStockAlarma1[1], colorStockAlarma1[2]);
                $this->SetTextColor(0);
                $fill = 1;
              }
              else {
                if ($stock < $alarma2){
                  /// seteo color de alarma Crítica (roja):
                  $this->SetFillColor(colorStockAlarma2[0], colorStockAlarma2[1], colorStockAlarma2[2]);
                  $this->SetTextColor(255);
                  $fill = 1;
                }
                else {
                  //$this->SetFillColor(colorBordeRedondeado[0], colorBordeRedondeado[1], colorBordeRedondeado[2]);
                  /// seteo color de stock regular (verde):
                  $this->SetFillColor(colorStockRegular[0], colorStockRegular[1], colorStockRegular[2]);
                  $this->SetTextColor(0);
                  $fill = 1;
                }
              } 
            } 
          }
          else {
            if ($i === $indiceEntidad) {
              $a = 'L';
            }
            else 
              {
              $a = 'C';
            }
            //$datito = utf8_decode($dato[$i]);
            /// Resaltado en AMARILLO del comentario que tiene el patrón: DIF
            if ($i === $indiceMensaje) {
              $patron = "dif";
              $buscar = stripos($datito, $patron);
              if ($buscar !== FALSE){
                $this->SetFillColor(colorComDiff[0], colorComDiff[1], colorComDiff[2]);
                $fill = 1;
              }
              else 
                {
                /// Resaltado en VERDE del comentario que tiene el patrón: STOCK
                $patron = "stock";
                $buscar = stripos($datito, $patron);
                if ($buscar !== FALSE){
                  $this->SetFillColor(colorComStock[0], colorComStock[1], colorComStock[2]);
                  $fill = 1;
                }
                else 
                  {
                  /// Resaltado en ROJO SUAVE del comentario que tiene el patrón: PLASTICO con o sin tilde
                  $patron = "plastico";
                  $patron1 = utf8_decode("plástico");
                  $buscar = stripos($datito, $patron);
                  $buscar1 = stripos($datito, $patron1);
                  if (($buscar !== FALSE)||($buscar1 !== FALSE)){
                    $this->SetFillColor(colorComPlastico[0], colorComPlastico[1], colorComPlastico[2]);
                    $fill = 1;
                  }
                  else 
                    {
                    $this->setFillColor(colorComRegular[0], colorComRegular[1], colorComRegular[2]);
                  }
                }
              }
            }
            if ($i === $indiceUltMov) {
              $separo = explode(" ", $datito);
              $datito = $separo[0];
            }
            
            $this->SetFont('Courier', '', 9);
            $this->SetTextColor(0);
          }
          
          $h1 = $h0/$nb1;
          
          //Print the text
          if ($nb1 > 1) {
            $this->MultiCell($w, $h1, $datito,1, $a, $fill);
          }
          else {
            $this->MultiCell($w, $h0, $datito,1, $a, $fill);
          }  
          
          if ($i === $indiceStock) {
            $fill = $fillActual;
          }
          //Put the position to the right of the cell
          $this->SetXY($x1+$w,$y);
        }
      }
      //Go to the next line
      $this->Ln($h0);
      $this->SetX($x);
      $fill = $fillActual;
      if ($fill === 1) {
        $fill = 0;
      }
      else {
        $fill = 1;
      }
    }
    
    ///****************************************************************** TOTAL *************************************************************
    ///Si existe el total (es decir, si no es el listado de total en bóveda, lo muestro:
    if ($total !== -1) {
      //Agrego fila final de la tabla con el total de plásticos:
      $this->SetFont('Courier', 'B', 12);
      $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
      $this->SetTextColor(255, 255, 255);
      
      $largoParaTotal = $largoCampos[$indiceStock];
      if ($tipo) {
        $largoTemp = $largoCampos[$totalCampos] - $largoParaTotal;
      }
      else {
        $largoTemp = $largoCampos[$totalCampos] - $largoParaTotal;
      }
      $this->Cell($largoTemp, $h, 'TOTAL:', 1, 0, 'C', true);
      $this->SetFont('Courier', 'BI', 14);
      $this->SetTextColor(255,0,0);
      $this->SetFillColor(colorTotal[0], colorTotal[1], colorTotal[2]);
      if ($tipo) {
        $this->Cell($largoParaTotal, $h, number_format($total, 0, ",", "."), 1, 0, 'C', true);
      }
      else {
        $this->Cell($largoParaTotal, $h, number_format($total, 0, ",", "."), 1, 0, 'C', true);
      }
    }
    ///***************************************************************** FIN TOTAL **********************************************************
    
    ///******************************************************* BORDE REDONDEADO DE CIERRE ***************************************************
    $this->Ln();
    $y = $this->GetY();
    $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
    ///Agrego el rectángulo con el borde redondeado:
    $this->RoundedRect($x, $y, $largoCampos[$totalCampos], $h, 3.5, '34', 'DF');
    ///***************************************************** FIN BORDE REDONDEADO DE CIERRE *************************************************
  }
  
  ///Función para generar los PDFs correspondientes a consultas de MOVIMIENTOS, ya sean de entidad o de productos:
  function tablaMovimientos($tablaProducto) 
    {
    global $h, $hFooter, $x, $totalCampos, $c1, $totalRegistros;
    global $registros, $campos, $largoCampos, $rutaFotos, $tituloTabla, $tipoConsulta, $codigoEMSA, $mostrar;
       
    $anchoPagina = $this->GetPageWidth();
    $anchoTipo = 0.8*$anchoPagina;

    //Defino color para los bordes:
    $this->SetDrawColor(0, 0, 0);
    //Defino grosor de los bordes:
    $this->SetLineWidth(.3);
    
    ///************************************************************* TITULO *****************************************************************
    //Defino tipo de letra y tamaño para el Título:
    $this->SetFont('Courier', 'B', 12);
    //Defino el color para el texto:
    $this->SetTextColor(0);
    
    $subTitulo = trim(utf8_decode($tipoConsulta));
    
    ///**************************** Separo el subtítulo para poder resaltear el nombre de la entidad o el producto según corresponda *********
    ///Como NO se puede cambiar el formato dentro del MultiCell (o Cell), lo que se hace es al menos ponerlo en mayúsculas *******************
    if ($tablaProducto){
      $temp0 = explode("Movimientos del producto ", $subTitulo);
    }  
    else {
      $temp0 = explode("Movimientos de ", $subTitulo);
    }
    
    $q1 = stripos($temp0[1], " de todos los tipos (inc. AJUSTES)");
    if ($q1 !== FALSE) {
      $temp1 = explode(" de todos los tipos (inc. AJUSTES)", $temp0[1]);
      $nombre1 = strtoupper($temp1[0]);
      $mostrarResumenProducto = true;
      $tipoMov = 'Todos';
    }
    else { 
      $q2 = stripos($temp0[1], " de todos los tipos");
      if ($q2 !== FALSE) {
        $temp1 = explode(" de todos los tipos", $temp0[1]);
        $nombre1 = strtoupper($temp1[0]);
        $mostrarResumenProducto = true;
        $tipoMov = 'Clientes';
      }
      else {
        $t0 = stripos($temp0[1], " del tipo Retiro");
        if ($t0 !== FALSE){
          $tipoMov = "Retiros";
        }
        else {
          $t1 = stripos($temp0[1], "del tipo Ingreso");
          if ($t1 !== FALSE){
            $tipoMov = "Ingresos";
          }
          else {
            $t2 = stripos($temp0[1], utf8_decode("del tipo Renovación"));
            if ($t2 !== FALSE){
              $tipoMov = "Renovaciones";
            }
            else {
              $t3 = stripos($temp0[1], utf8_decode("del tipo Destrucción"));
              if ($t3 !== FALSE){
                $tipoMov = "Destrucciones";
              }
              else {
                $t4 = stripos($temp0[1], " del tipo AJUSTE Retiro");
                if ($t4 !== FALSE){
                  $tipoMov = "AJUSTE Retiros";
                }
                else {
                  $t5 = stripos($temp0[1], " del tipo AJUSTE Ingreso");
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
        $temp1 = explode(" del tipo", $temp0[1]);
        $nombre1 = strtoupper($temp1[0]);
        $mostrarResumenProducto = false;
      } 
    }
    
    if ($tablaProducto){
      $subTitulo = "Movimientos del producto ".$nombre1;
    }
    else {
      $subTitulo = "Movimientos de ".$nombre1;
    }
    if (($q1 !== FALSE)||($q2 !== FALSE)) {
      $subTitulo = $subTitulo." de todos los tipos".$temp1[1];
    }
    else {
      $subTitulo = $subTitulo." del tipo".$temp1[1];
    }
    ///************************* FIN Separo el subtítulo para poder resaltear el nombre de la entidad o el producto según corresponda *********  

    $tam1 = $this->GetStringWidth($subTitulo);
    if ($tam1 < $anchoTipo){
      $anchoSubTitulo = 1.05*$tam1;
    }
    else {
      $anchoSubTitulo = $anchoTipo;
    }
    $xTipo = round((($anchoPagina - $anchoSubTitulo)/2), 2);
    //$xTipo = round((($anchoPagina - $anchoTipo)/2), 2);
    //$this->SetY(20);
    //$anchoSubTitulo = $anchoTipo;
    
    $nbSubTitulo = $this->NbLines($anchoSubTitulo,$subTitulo);
    $hSubTitulo=$h*$nbSubTitulo;
    
//    if ($tam1 < $anchoTipo){
//      $xTipo = round((($anchoPagina - $tam1)/2), 2);
//      $anchoSubTitulo = 1.05*$tam1;
//    }
    $this->SetX($xTipo);

    $this->SetFillColor(colorSubtitulo[0], colorSubtitulo[1], colorSubtitulo[2]);
    if ($nbSubTitulo > 1) {
      $this->MultiCell($anchoSubTitulo,$h, $subTitulo,0,'C', 1);
      $this->Ln(2);

//      $y = $this->GetY();
//      $this->MultiCell($tamPrimeraParte,$h, $primeraParte,0, 'C', 0);
//      $this->SetTextColor(255, 0, 0);
//      $xProd = $xTipo+$tamPrimeraParte;
//      $this->SetX($xProd);
//      $this->SetY($y);
//      $this->MultiCell($tamProdu,$h, $produ,0, 'C', 0);
//      $this->SetTextColor(0);
//      $xSegundaParte = $xTipo+$tamPrimeraParte+$tamProdu;
//      $this->SetX($xSegundaParte);
//      $this->SetY($y);
//      $this->MultiCell($tamSegundaParte,$h, $segundaParte,0, 'C', 0);
    }
    else {
      $this->Cell($anchoSubTitulo,$hSubTitulo, $subTitulo,0, 0,'C', 1);
      $this->Ln(8);
//      $this->Cell($tamPrimeraParte,$hSubTitulo, $primeraParte, 0, 0, 'R', 0);
//      $this->SetTextColor(255, 0, 0);
//      $this->Cell($tamProdu,$hSubTitulo, $produ, 0, 0, 'L', 0);
//      $this->SetTextColor(0);
//      $this->Cell($tamSegundaParte,$h, $segundaParte, 0, 0, 'L', 0);
    }
    ///*********************** FIN TEST para resaltar el nombre ******************************
    ///************************************************************ FIN TITULO **************************************************************
    
    
    
    ///***************************************************************** SUB-TITULO **********************************************************
    $this->SetFont('Courier', 'BI', 11);
    $mensajeTotal = "Total de movimientos:";
    $tam2 = $this->GetStringWidth($mensajeTotal);
    $tam3 = $this->GetStringWidth($totalRegistros);
    $totalRegistros = number_format($totalRegistros, 0, ",", ".");
    $xMensajeTotal =($anchoPagina - $tam2 - $tam3)/2;
    $this->SetX($xMensajeTotal);
    $this->Cell($tam2,$h, $mensajeTotal,0, 0, 'R', 0);
    $this->SetTextColor(255, 0, 0);
    $this->SetFont('Courier', 'BI', 14);
    $this->Cell($tam3,$h, $totalRegistros,0, 0,'L', 0);
    $this->SetTextColor(0);
    ///************************************************************** FIN SUB-TITULO *********************************************************
    
    $this->Ln(10);
    
    //************************************************************** INICIO TABLA PRODUCTO **************************************************
    if ($tablaProducto) {
      $cCampo = 2.2*$c1;
      $cResto = 4*$c1;
      $cFoto = 3.4*$c1;
      $nombre = trim(utf8_decode($registros[0][3]));
      $entidad = trim(utf8_decode($registros[0][2]));
      $tamEntidad = $this->GetStringWidth($entidad);
      $tamNombre = $this->GetStringWidth($nombre);
      if ((($tamNombre) || ($tamEntidad)) < $cResto) {
        $cResto = 1.52*$tamNombre;
      }
      
      $tamTabla = $cCampo + $cResto;

      $x = ($anchoPagina-$tamTabla)/2;
      $xTipo = ($anchoPagina - $anchoTipo)/2;

      //Defino color para los bordes:
      $this->SetDrawColor(0, 0, 0);
      //Defino grosor de los bordes:
      $this->SetLineWidth(.3);
      
      ///*****************************************************************  FOTO ************************************************************
      ///Agrego un snapshot de la tarjeta debajo de la tabla (si es que existe!!):
      $foto = $registros[0][8];
      if (($foto !== '')&&($foto !== null)){
        $rutita = $rutaFotos."/".$foto;
        if (file_exists($rutita)){
          list($anchoFoto, $altoFoto) = $this->resizeToFit($rutita, self::FOTO_WIDTH_MM, self::FOTO_HEIGHT_MM);

          $xFoto = ($anchoPagina - $anchoFoto)/2;
          $this->SetX($xFoto);
          $yFoto = $this->GetY();
          $this->Image($rutita, $xFoto, $yFoto, $anchoFoto, $altoFoto);
          $this->Ln($altoFoto+8);
        }
      }
      ///***************************************************************  FIN FOTO **********************************************************
      
      ///*************************************************************** INICIO TITULO ******************************************************
      $this->SetX($x);
      $y = $this->GetY();
      //Defino tipo de letra y tamaño para el Título:
      $this->SetFont('Courier', 'B', 12);
      ///Título de la tabla:
      $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
      $this->SetTextColor(255, 255, 255);
      ///Agrego el rectángulo con el borde redondeado:
      $this->RoundedRect($x, $y, $tamTabla, $h, 3.5, '12', 'DF');
      //Escribo el título:
      $this->Cell($tamTabla, $h, "DETALLES DEL PRODUCTO", 0, 0, 'C', 0);
      $this->Ln();
      ///***************************************************************  FIN TÍTULO ********************************************************

      ///**************************************************************  INICIO CAMPOS ******************************************************
      //Restauro color de fondo y tipo de letra para el contenido:
      $this->SetTextColor(0);
      $this->SetFont('Courier');
      $this->SetX($x);
      ///**************************************************************** CAMPO NOMBRE ******************************************************
      $nbNombre = $this->NbLines($cResto,$nombre);
      $h0=$h*$nbNombre;

      $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
      
      $this->SetTextColor(255, 255, 255);
      $this->SetFont('Courier', 'B', 10);
      $this->Cell($cCampo, $h0, "Nombre:", 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      //Save the current position
      $x1=$this->GetX();
      $y=$this->GetY();
      //Draw the border
      $this->Rect($x1,$y,$cResto,$h0);
      //Print the text
      if ($nbNombre > 1) {
        $this->MultiCell($cResto,$h, $nombre,'LRT','C', 0);
        }
      else {
        $this->MultiCell($cResto,$h0, $nombre,1,'C', 0);
        }  

      //Put the position to the right of the cell
      $this->SetXY($x,$y+$h0);
      ///************************************************************* FIN CAMPO NOMBRE *****************************************************

      ///*************************************************************** CAMPO ENTIDAD ******************************************************
      $nbEntidad = $this->NbLines($cResto, $entidad);
      $h0=$h*$nbEntidad;

      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h0, "Entidad:", 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      //Save the current position
      $x1=$this->GetX();
      $y=$this->GetY();
      //Draw the border
      $this->Rect($x1,$y,$cResto,$h0);
      //Print the text
      if ($nbEntidad > 1) {
        $this->MultiCell($cResto,$h, $entidad,'LRT','C', 0);
        }
      else {
        $this->MultiCell($cResto,$h, $entidad,1,'C', 0);
        }  

      //Put the position to the right of the cell
      $this->SetXY($x,$y+$h0);
      ///************************************************************* FIN CAMPO ENTIDAD ****************************************************
      
      ///************************************************************* CAMPO CODIGO EMSA ****************************************************
      if (($codigoEMSA === '')||($codigoEMSA === null)) {
        $codigoEMSA = 'No Ingresado';
      }
      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h, utf8_decode("Cód. EMSA:"), 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      $this->Cell($cResto, $h, $codigoEMSA, 'LRBT', 0, 'C', false);
      $this->Ln();
      $this->SetX($x);
      ///************************************************************ FIN CAMPO CODIGO EMSA *************************************************
      
      ///************************************************************** CAMPO CODIGO ORIGEN *************************************************
      $codigoOrigen = $registros[0][6];
      if (($codigoOrigen === '')||($codigoOrigen === null)) {
        $codigoOrigen = 'No Ingresado';
      }
      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h, utf8_decode("Cód. Origen:"), 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      $this->Cell($cResto, $h, $codigoOrigen, 'LRBT', 0, 'C', false);
      $this->Ln();
      $this->SetX($x);
      ///************************************************************ FIN CAMPO CODIGO ORIGEN ***********************************************
      
      ///*********************************************************** CAMPO FECHA CREACION ***************************************************
      $fechaCreacion = $registros[0][14];
      if (($fechaCreacion === '')||($fechaCreacion === null)) {
        $fechaCreacion = 'No Ingresada';
      }
      else {
        $fechaTemp = explode('-', $fechaCreacion);
        $fechaCreacion = $fechaTemp[2].'/'.$fechaTemp[1].'/'.$fechaTemp[0];
      }
      $this->SetTextColor(255, 255, 255);
      $this->SetFont('Courier', 'B', 10);
      $this->Cell($cCampo, $h, utf8_decode("Fecha de Creación:"), 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      $this->Cell($cResto, $h, $fechaCreacion, 'LRBT', 0, 'C', false);
      $this->Ln();
      $this->SetX($x);
      ///************************************************************ FIN CAMPO FECHA CREACION **********************************************
      
      ///***************************************************************** CAMPO BIN ********************************************************
      $bin = $registros[0][4];
      if (($bin === '')||($bin === null)) {
        $bin = 'N/D o N/C';
      }
      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h, "BIN:", 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      $this->Cell($cResto, $h, $bin, 'LRBT', 0, 'C', false);
      $this->Ln();
      $this->SetX($x);
      ///*************************************************************** FIN CAMPO BIN ******************************************************
      
      ///************************************************************** CAMPO CONTACTO ******************************************************
      $contacto = $registros[0][7];
      if (($contacto === '')||($contacto === null)) {
        $contacto = '';
      }
      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h, "Contacto:", 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      $this->Cell($cResto, $h, $contacto, 'LRBT', 0, 'C', false);
      $this->Ln();
      $this->SetX($x);      
      ///************************************************************ FIN CAMPO CONTACTO ****************************************************
      
      ///************************************************************* CAMPO COMENTARIOS ****************************************************
      $comentarios = trim(utf8_decode($registros[0][13]));
      if (($comentarios === '')||($comentarios === null)) {
        $comentarios = '';
      }
      $nbComment = $this->NbLines($cResto,$comentarios);
      $h0=$h*$nbComment;

      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h0, "Comentarios:", 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      //Save the current position
      $x1=$this->GetX();
      $y=$this->GetY();
      //Draw the border
      $this->Rect($x1,$y,$cResto,$h0);
      
      /// Resaltado en AMARILLO del comentario que tiene el patrón: DIF
      $patron = "dif";
      $buscar = stripos($comentarios, $patron);
      if ($buscar !== FALSE){
        $this->SetFillColor(colorComDiff[0], colorComDiff[1], colorComDiff[2]);
        $fill = 1;
      }
      else 
        {
        /// Resaltado en VERDE del comentario que tiene el patrón: STOCK
        $patron = "stock";
        $buscar = stripos($comentarios, $patron);
        if ($buscar !== FALSE){
          $this->SetFillColor(colorComStock[0], colorComStock[1], colorComStock[2]);
          $fill = 1;
        }
        else 
          {
          /// Resaltado en ROJO SUAVE del comentario que tiene el patrón: PLASTICO con o sin tilde
          $patron = "plastico";
          $patron1 = utf8_decode("plástico");
          $buscar = stripos($comentarios, $patron);
          $buscar1 = stripos($comentarios, $patron1);
          if (($buscar !== FALSE)||($buscar1 !== FALSE)){
            $this->SetFillColor(colorComPlastico[0], colorComPlastico[1], colorComPlastico[2]);
            $fill = 1;
          }
          else 
            {
            /// Resaltado en GRIS del comentario que no cumple con ninguno de los patrones, pero que NO es nulo
            if (($comentarios !== '')){
              $this->setFillColor(colorComRegular[0], colorComRegular[1], colorComRegular[2]);
              $fill = 1;
            }
            else {
              $fill = 0;
            }
          }
        }
      }
      
      //Print the text
      if ($nbComment > 1) {
        $this->MultiCell($cResto,$h, $comentarios,'LRT','C', $fill);
        }
      else {
        $this->MultiCell($cResto,$h, $comentarios,1,'C', $fill);
        } 
        
      /// Restauro color de fondo para los nombres de los campos:  
      $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);  
      //Put the position to the right of the cell
      $this->SetXY($x,$y+$h0);
      ///*********************************************************** FIN CAMPO COMENTARIOS **************************************************
      
      ///************************************************************* CAMPO ULT. MOV. ******************************************************
      $ultimoMovimiento = trim(utf8_decode($registros[0][9]));
      if (($ultimoMovimiento === '')||($ultimoMovimiento === null)) {
        $ultimoMovimiento = '';
      }
      $nbUltimo = $this->NbLines($cResto,$ultimoMovimiento);
      $h0=$h*$nbUltimo;

      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h0, utf8_decode("Último Movimiento:"), 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', '', 9);
      $this->SetTextColor(0);
      //Save the current position
      $x1=$this->GetX();
      $y=$this->GetY();
      //Draw the border
      $this->Rect($x1,$y,$cResto,$h0);
      //Print the text
      if ($nbUltimo > 1) {
        $this->MultiCell($cResto,$h, $ultimoMovimiento,'LRT','C', 0);
        }
      else {
        $this->MultiCell($cResto,$h, $ultimoMovimiento,1,'C', 0);
        } 
      
      //Put the position to the right of the cell
      $this->SetXY($x,$y+$h0);
      ///*********************************************************** FIN CAMPO ULT. MOV. ****************************************************
      
      ///************************************************************* CAMPO STOCK **********************************************************
      //Detecto si el stock actual está o no por debajo del valor de alarma. En base a eso elijo el color de fondo del stock:
      $alarma1 = $registros[0][11];
      $alarma2 = $registros[0][12];
      $stock = $registros[0][10];

      $this->SetFont('Courier', 'B', 10);
      $this->SetTextColor(255, 255, 255);
      $this->Cell($cCampo, $h, "Stock:", 'LRBT', 0, 'L', true);
      $this->SetFont('Courier', 'BI', 16);
      $this->SetTextColor(0);
      if (($stock < $alarma1) && ($stock > $alarma2)){
        $this->SetFillColor(colorStockAlarma1[0], colorStockAlarma1[1], colorStockAlarma1[2]);
        $this->SetTextColor(0);
      }
      else {
        if ($stock < $alarma2){
          $this->SetFillColor(colorStockAlarma2[0], colorStockAlarma2[1], colorStockAlarma2[2]);
          $this->SetTextColor(255);
        }
        else {
          $this->SetFillColor(colorStockRegular[0], colorStockRegular[1], colorStockRegular[2]);
        }
      }

      $this->Cell($cResto, $h, number_format($stock, 0, ",", "."), 'LRBT', 0, 'C', true);
      $this->Ln();
      ///************************************************************* FIN CAMPO STOCK ******************************************************
      
      ///******************************************************* BORDE REDONDEADO DE CIERRE *************************************************
      $this->SetX($x);
      $y = $this->GetY();
      $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
      ///Agrego el rectángulo con el borde redondeado:
      $this->RoundedRect($x, $y, $tamTabla, $h, 3.5, '34', 'DF');
      $this->Ln(15);
      ///***************************************************** FIN BORDE REDONDEADO DE CIERRE ***********************************************
    }
    //**************************************************************** FIN TABLA PRODUCTO ***************************************************
    
    //*********************************** Comienza generación de la tabla con los movimientos: **********************************************
    $tamTabla = $largoCampos[$totalCampos];
    //$tamNombre = $this->GetStringWidth($nombreProducto); 
    $x = round((($anchoPagina-$tamTabla)/2), 2);
  //echo "tabla: $tamTabla<br>anchoPagina: $anchoPagina<br>x: $x<br>";
    //Defino color para los bordes:
    $this->SetDrawColor(0, 0, 0);
    //Defino grosor de los bordes:
    $this->SetLineWidth(.3);
    
    ///*********************************************************** TÍTULO TABLA MOVIMIENTOS *************************************************
    //Defino tipo de letra y tamaño para el Título:
    $this->SetFont('Courier', 'B', 12);
    //Defino color para el texto:
    $this->SetTextColor(255, 255, 255);  
    $this->SetX($x);
    $y = $this->GetY();
    //Defino color de fondo:
    $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
    ///Agrego el rectángulo con el borde redondeado:
    $this->RoundedRect($x, $y, $largoCampos[$totalCampos], $h, 3.5, '12', 'DF');
    //Escribo el título:
    $this->Cell($largoCampos[$totalCampos], $h, utf8_decode($tituloTabla), 0, 0, 'C', 0);
    $this->Ln();
    ///********************************************************* FIN TÍTULO TABLA MOVIMIENTOS ***********************************************
    
    ///************************************************************ INICIO CAMPOS ***********************************************************
    //Restauro color de fondo y tipo de letra para el contenido:
    $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
    $this->SetX($x);
    $this->SetFont('Courier', 'B', 10);
    
    /// Recupero los índices de cada campo para poder ordenarlos luego:
    foreach ($campos as $i => $dato2) {
      switch ($dato2) {
        case "Id": $indId = $i;
                   break;
        case "IdProd": $indProd = $i;
                       break;
        case "IdMov": $indMov = $i;
                       break;             
        case "Entidad": $indEntidad = $i;
                        break;
        case "Nombre": $indNombre = $i;
                       break;
        case "Fecha": $indFecha = $i;
                      break;
        case "Hora": $indHora = $i;
                     break;
        case "Tipo": $indTipo = $i;
                     break;
        case "Estado":  $indEstadoMov = $i;
                        break;           
        case "Cantidad":  $indCantidad = $i;
                          break;
        case "Comentarios": $indComentarios = $i;
                            break;
        case "BIN": $indBin = $i;
                    break;
        case utf8_decode("Fecha Creación"): $indFechaCreacion = $i;
                                            break;          
        case utf8_decode("Cód. EMSA"): $indCodEMSA = $i;
                                       break;
        case utf8_decode("Cód. Origen"): $indCodOrigen = $i;
                                         break;                 
        case "Contacto":  $indContacto = $i;
                          break;              
        case "Snapshot":  $indSnapshot = $i;
                          break;
        case "Alarma1": $indAlarma1 = $i;
                        break;
        case "Alarma2": $indAlarma2 = $i;
                        break;   
        case utf8_decode("Últ. Mov."):  $indUltMov = $i;
                          break;
        case "Stock": $indStock = $i;
                      break;                 
        case "ComentariosProd": $indComProd = $i;
                                break;  
        default: break;
      }
    }
    
    ///************************************************* INICIO ESCRITURA CAMPOS VISIBLES ***********************************************
    /// Imprimo los nombres de cada campo, siempre y cuando, se hayan marcado como visibles:
    /// Esto hay que hacerlo uno a uno para que queden en el orden requerido que es diferente al de la consulta
    if ($mostrar[$indId]) {
      $this->Cell($largoCampos[$indId], $h, $campos[$indId], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indFecha]) {
      $this->Cell($largoCampos[$indFecha], $h, $campos[$indFecha], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indHora]) {
      $this->Cell($largoCampos[$indHora], $h, $campos[$indHora], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indEntidad]) {
      $this->Cell($largoCampos[$indEntidad], $h, $campos[$indEntidad], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indProd]) {
      $this->Cell($largoCampos[$indProd], $h, $campos[$indProd], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indNombre]) {
      $this->Cell($largoCampos[$indNombre], $h, $campos[$indNombre], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indBin]) {
      $this->Cell($largoCampos[$indBin], $h, $campos[$indBin], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indFechaCreacion]) {
      $this->Cell($largoCampos[$indFechaCreacion], $h, $campos[$indFechaCreacion], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indCodEMSA]) {
      $this->Cell($largoCampos[$indCodEMSA], $h, $campos[$indCodEMSA], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indCodOrigen]) {
      $this->Cell($largoCampos[$indCodOrigen], $h, $campos[$indCodOrigen], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indContacto]) {
      $this->Cell($largoCampos[$indContacto], $h, $campos[$indContacto], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indSnapshot]) {
      $this->Cell($largoCampos[$indSnapshot], $h, $campos[$indSnapshot], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indTipo]) {
      $this->Cell($largoCampos[$indTipo], $h, $campos[$indTipo], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indEstadoMov]) {
      $this->Cell($largoCampos[$indEstadoMov], $h, $campos[$indEstadoMov], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indComentarios]) {
      $this->Cell($largoCampos[$indComentarios], $h, $campos[$indComentarios], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indCantidad]) {
      $this->Cell($largoCampos[$indCantidad], $h, $campos[$indCantidad], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indStock]) {
      $this->Cell($largoCampos[$indStock], $h, $campos[$indStock], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indUltMov]) {
      $this->Cell($largoCampos[$indUltMov], $h, $campos[$indUltMov], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indAlarma1]) {
      $this->Cell($largoCampos[$indAlarma1], $h, $campos[$indAlarma1], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indAlarma2]) {
      $this->Cell($largoCampos[$indAlarma2], $h, $campos[$indAlarma2], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indComProd]) {
      $this->Cell($largoCampos[$indComProd], $h, $campos[$indComProd], 'LRBT', 0, 'C', true);
    }
    if ($mostrar[$indMov]) {
      $this->Cell($largoCampos[$indMov], $h, $campos[$indMov], 'LRBT', 0, 'C', true);
    }
    ///*************************************************** FIN ESCRITURA CAMPOS VISIBLES ************************************************
    
    ///*********************************************************** COMIENZO DATOS ***********************************************************
    $this->Ln();
    $this->SetX($x);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0); 
    ///************************************************************ INICIALIZACIÓN DE CONTADORES ********************************************
    $fill = false;
    $productoViejo = $registros[0][$indProd];
    $subtotalRetiro = 0;
    $subtotalRetiroMostrar = 0;
    $subtotalIngreso = 0;
    $subtotalIngresoMostrar = 0;
    $subtotalReno = 0;
    $subtotalRenoMostrar = 0;
    $subtotalDestruccion = 0;
    $subtotalDestruccionMostrar = 0;
    $subtotalAjusteRetiros = 0;
    $subtotalAjusteRetirosMostrar = 0;
    $subtotalAjusteIngresos = 0;
    $subtotalAjusteIngresosMostrar = 0;
    $totalConsumos = 0;
    $totalConsumosMostrar = 0;
    $totalRetiro = 0;
    $totalIngreso = 0;
    $totalReno = 0;
    $totalDestruccion = 0;
    $totalAjusteRetiros = 0;
    $totalAjusteIngresos = 0;
    ///********************************************************** FIN INICIALIZACIÓN DE CONTADORES ******************************************  
      
    ///*********************************************************** INICIO RECORRIDA REGISTROS ***********************************************
    foreach ($registros as $dato) {
      $idProd = $dato[$indProd];
      $nombre = trim(utf8_decode($dato[$indNombre]));
      $cantidad1 = trim(utf8_decode($dato[$indCantidad]));
      $cantidad = number_format($cantidad1, 0, ",", ".");
      $tipo = trim($dato[$indTipo]);
      
      ///******************************************************* INICIO CÁLCULO DEL ALTO DE LA FILA *****************************************
      //Calculate the height of the row
      $nb=0;
      $h0 = 0;
      for($i=0;$i<count($dato);$i++) {
        $dat = '';
        $tamDat = 0;
        $this->SetFont('Courier', '', 9);
        $dat = trim(utf8_decode($dato[$i]));
        $tamDat = $this->GetStringWidth($dat);
        $w1 = $largoCampos[$i];
        if ($mostrar[$i]){
          $nb=max($nb,$this->NbLines($w1,$dat));
        }
      }
      //En base a la cantidad de líneas requeridas, calculo el alto de la fila;
      $h0=$h*$nb;
      ///*************************************************** FIN INICIO CÁLCULO DEL ALTO DE LA FILA *****************************************
      
      
      ///***************************************************** INICIO CAMBIO DE PRODUCTO ****************************************************
      ///Chequeo si hay o no un cambio de producto.
      ///Si lo hay, imprimo los contadores del producto anterior, los reseteo, y agrego un espacio de separación:
      if ($productoViejo !== $idProd) {
        $productoViejo = $idProd;
        
        ///Solo si la consulta es de TODOS los TIPOS muestro el detalle:
        if ($mostrarResumenProducto){
          
          
          $totalRenglonesResumen = 0;
          if ($subtotalRetiro > 0) {
            $totalRenglonesResumen++;
          }  
          if ($subtotalReno > 0) {
            $totalRenglonesResumen++;
          }  
          if ($subtotalDestruccion > 0) {
            $totalRenglonesResumen++;
          }  
          if ($totalConsumos > 0) {
            $totalRenglonesResumen++;
          }  
          if ($subtotalIngreso > 0) {
            $totalRenglonesResumen++;
          }  
          if ($subtotalAjusteRetiros > 0) {
            $totalRenglonesResumen++;
          } 
          if ($subtotalAjusteIngresos > 0) {
            $totalRenglonesResumen++;
          } 
          
          if ($totalRenglonesResumen > 0){
            if($this->GetY()+($totalRenglonesResumen+1)*$h > $this->PageBreakTrigger){
              $this->AddPage($this->CurOrientation);
              $this->SetAutoPageBreak(true, $hFooter);
            }
          }

          ///***************************************************** INICIO ESCRITURA RESUMEN ***************************************************
          $tamSubTotal = $largoCampos[$indCantidad];// + $largoCampos[$indComentarios];
          $tamTextoSubtotal = $tamTabla-$tamSubTotal;
          
          if ($subtotalRetiro > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, "Total Retiros:",1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorRetiros[0], colorRetiros[1], colorRetiros[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalRetiroMostrar,1,1,'R', true);

            $subtotalRetiro = 0;
            $subtotalRetiroMostrar = 0;
          }

          if ($subtotalReno > 0){
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0); 
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, "Total Renovaciones:",1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorRenos[0], colorRenos[1], colorRenos[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalRenoMostrar,1,1,'R', true);

            $subtotalReno = 0;
            $subtotalRenoMostrar = 0;
          }

          if ($subtotalDestruccion > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, utf8_decode("Total Destrucciones:"),1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorDestrucciones[0], colorDestrucciones[1], colorDestrucciones[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalDestruccionMostrar,1,1,'R', true);

            $subtotalDestruccion = 0;
            $subtotalDestruccionMostrar = 0;
          }

          if ($totalConsumos > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, utf8_decode("Total de Consumos:"),1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorConsumos[0], colorConsumos[1], colorConsumos[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $totalConsumosMostrar,1,1,'R', true);

            $totalConsumos = 0;
            $totalConsumosMostrar = 0;
          }

          if ($subtotalIngreso > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, "Total de Ingresos:",1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorIngresos[0], colorIngresos[1], colorIngresos[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalIngresoMostrar,1,1,'R', true);

            $subtotalIngreso = 0;
            $subtotalIngresoMostrar = 0;
          }
          
          if ($subtotalAjusteRetiros > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, "Total AJUSTE Retiros:",1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorAjusteRetiros[0], colorAjusteRetiros[1], colorAjusteRetiros[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalAjusteRetirosMostrar,1,1,'R', true);

            $subtotalAjusteRetiros = 0;
            $subtotalAjusteRetirosMostrar = 0;
          }
          
          if ($subtotalAjusteIngresos > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, "Total AJUSTE Ingresos:",1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorAjusteIngresos[0], colorAjusteIngresos[1], colorAjusteIngresos[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalAjusteIngresosMostrar,1,1,'R', true);

            $subtotalAjusteIngresos = 0;
            $subtotalAjusteIngresosMostrar = 0;
          }
          ///*************************************************** FIN ESCRITURA RESUMEN ********************************************************
          
          ///******************************************************* BORDE REDONDEADO DE CIERRE ***********************************************
          $this->SetFillColor(colorBordeRedondeado[0], colorBordeRedondeado[1], colorBordeRedondeado[2]);
          $y = $this->GetY();
          ///Agrego el rectángulo con el borde redondeado:
          $this->RoundedRect($x, $y, $largoCampos[$totalCampos], $h, 3.5, '34', 'DF');

          //Genero el espacio en blanco de separación entre los productos:
          $this->Ln(2*$h);
          ///*************************************************** FIN BORDE REDONDEADO DE CIERRE ***********************************************
        }  
        
        ///***************************************** INICIALIZACIÓN CONTADORES PARA NUEVO PRODUCTO ********************************************
        switch ($tipo) {
          case "Ingreso": $subtotalIngreso = $cantidad1;
                          $totalIngreso = $totalIngreso + $cantidad1;
                          $subtotalIngresoMostrar = number_format($subtotalIngreso, 0, ",", ".");
                          break;
          case "Retiro":  $subtotalRetiro = $cantidad1;
                          $totalRetiro = $totalRetiro + $cantidad1;
                          $subtotalRetiroMostrar = number_format($subtotalRetiro, 0, ",", ".");
                          break;
          case "Renovación":  $subtotalReno = $cantidad1;
                              $totalReno = $totalReno + $cantidad1;
                              $subtotalRenoMostrar = number_format($subtotalReno, 0, ",", ".");
                              break;
          case "Destrucción": $subtotalDestruccion = $cantidad1;
                              $totalDestruccion = $totalDestruccion + $cantidad1;
                              $subtotalDestruccionMostrar = number_format($subtotalDestruccion, 0, ",", ".");
                              break;
          case "AJUSTE Retiro": $subtotalAjusteRetiros = $cantidad1;
                                $totalAjusteRetiros = $totalAjusteRetiros + $cantidad1;
                                $subtotalAjusteRetirosMostrar = number_format($subtotalAjusteRetiros, 0, ",", ".");
                                break;
          case "AJUSTE Ingreso": $subtotalAjusteIngresos = $cantidad1;
                                 $totalAjusteIngresos = $totalAjusteIngresos + $cantidad1;
                                 $subtotalAjusteIngresosMostrar = number_format($subtotalAjusteIngresos, 0, ",", ".");
                                 break;
          default: break;
        }
        $totalConsumos = $subtotalRetiro + $subtotalReno + $subtotalDestruccion;
        $totalConsumosMostrar = number_format($totalConsumos, 0, ",", ".");
        ///*************************************** FIN INICIALIZACIÓN CONTADORES PARA NUEVO PRODUCTO ******************************************
        //$this->CheckPageBreak($h);  
        if ($mostrarResumenProducto){
          ///********************************************************* AGREGADO DEL ENCABEZADO ************************************************
          ///Chequeo si en lo que resta de página entra al menos el primer registro del producto cosa de que no quede sólo el encabezado con 
          ///los campos. Si NO entra, genero una nueva página y agrego el encabezado de la tabla:
          if($this->GetY()+$h+$h0>$this->PageBreakTrigger){
            $this->AddPage($this->CurOrientation);
            $this->SetAutoPageBreak(true, $hFooter);
            ///************************************************************* TITULO ***********************************************************
            $this->SetFont('Courier', 'B', 12);
            $this->SetTextColor(0);
            $this->SetY(25);
            $this->SetFillColor(colorSubtitulo[0], colorSubtitulo[1], colorSubtitulo[2]);

            $sub2 = $subTitulo."(cont.)";
            $tamSub2 = $this->GetStringWidth($sub2);
            if ($tamSub2 < $anchoTipo){
              $anchoSubTitulo = 1.05*$tamSub2;
            }
            else {
              $anchoSubTitulo = $anchoTipo;
            }
            $xTipo = round((($anchoPagina - $anchoSubTitulo)/2), 2);
            $this->SetX($xTipo);

            $nbSubTitulo1 = $this->NbLines($anchoSubTitulo,$sub2);
            $hSubTitulo1=$h*$nbSubTitulo1;

            if ($nbSubTitulo1 > 1) {
              $this->MultiCell($anchoSubTitulo,$h, $sub2,0, 'C', 1);
            }
            else {
              $this->Cell($anchoSubTitulo,$hSubTitulo1, $sub2,0,0,'C', 1);
              $this->Ln();
            }
            $this->Ln();
            ///************************************************************ FIN TITULO ********************************************************
          }
          ///******************************************************* FIN AGREGADO DEL ENCABEZADO **********************************************
          //
          ///******************************************************** INICIO CAMPOS NUEVO PRODUCTO ********************************************
          /// Recupero los índices de cada campo para poder ordenarlos luego:
          foreach ($campos as $i => $dato3) {
            switch ($dato3) {
              case "Id": $indId = $i;
                         break;
              case "IdProd": $indProd = $i;
                             break;
              case "IdMov": $indMov = $i;
                             break;             
              case "Entidad": $indEntidad = $i;
                              break;
              case "Nombre": $indNombre = $i;
                             break;
              case "Fecha": $indFecha = $i;
                            break;
              case "Hora": $indHora = $i;
                           break;
              case "Tipo": $indTipo = $i;
                           break;
              case "Estado": $indEstadoMov = $i;
                             break;
              case "Cantidad":  $indCantidad = $i;
                                break;
              case "Comentarios": $indComentarios = $i;
                                  break;
              case "BIN": $indBin = $i;
                          break;
              case utf8_decode("Fecha Creación"): $indFechaCreacion = $i;
                                                  break;          
              case utf8_decode("Cód. EMSA"): $indCodEMSA = $i;
                                break;
              case utf8_decode("Cód. Origen"): $indCodOrigen = $i;
                                  break;                 
              case "Contacto":  $indContacto = $i;
                                break;              
              case "Snapshot":  $indSnapshot = $i;
                                break;
              case "Alarma1": $indAlarma1 = $i;
                              break;
              case "Alarma2": $indAlarma2 = $i;
                              break;   
              case utf8_decode("Últ. Mov."):  $indUltMov = $i;
                                break;
              case "Stock": $indStock = $i;
                            break;                 
              case "ComentariosProd": $indComProd = $i;
                                      break;  
              default: break;
            }
          }
    
          $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
          $this->SetTextColor(255, 255, 255);
          $this->SetFont('Courier', 'B', 10);
          $y = $this->GetY();
          $this->SetX($x);
          ///***************************************************** BORDE INICIO NUEVO PRODUCTO ************************************************
          ///Agrego el rectángulo con el borde redondeado:
          $this->RoundedRect($x, $y, $largoCampos[$totalCampos], $h, 3.2, '12', 'DF');
          $this->SetX($x); 
          ///************************************************** FIN BORDE INICIO NUEVO PRODUCTO ***********************************************

          ///************************************************* INICIO ESCRITURA CAMPOS VISIBLES ***********************************************
          /// Imprimo los nombres de cada campo, siempre y cuando, se hayan marcado como visibles:
          /// Esto hay que hacerlo uno a uno para que queden en el orden requerido que es diferente al de la consulta
          if ($mostrar[$indId]) {
            $this->Cell($largoCampos[$indId], $h, $campos[$indId], 0, 0, 'C', false);
          }
          if ($mostrar[$indFecha]) {
            $this->Cell($largoCampos[$indFecha], $h, $campos[$indFecha], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indHora]) {
            $this->Cell($largoCampos[$indHora], $h, $campos[$indHora], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indEntidad]) {
            $this->Cell($largoCampos[$indEntidad], $h, $campos[$indEntidad], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indProd]) {
            $this->Cell($largoCampos[$indProd], $h, $campos[$indProd], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indNombre]) {
            $this->Cell($largoCampos[$indNombre], $h, $campos[$indNombre], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indBin]) {
            $this->Cell($largoCampos[$indBin], $h, $campos[$indBin], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indFechaCreacion]) {
            $this->Cell($largoCampos[$indFechaCreacion], $h, $campos[$indFechaCreacion], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indCodEMSA]) {
            $this->Cell($largoCampos[$indCodEMSA], $h, $campos[$indCodEMSA], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indCodOrigen]) {
            $this->Cell($largoCampos[$indCodOrigen], $h, $campos[$indCodOrigen], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indContacto]) {
            $this->Cell($largoCampos[$indContacto], $h, $campos[$indContacto], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indSnapshot]) {
            $this->Cell($largoCampos[$indSnapshot], $h, $campos[$indSnapshot], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indTipo]) {
            $this->Cell($largoCampos[$indTipo], $h, $campos[$indTipo], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indEstadoMov]) {
            $this->Cell($largoCampos[$indEstadoMov], $h, $campos[$indEstadoMov], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indComentarios]) {
            $this->Cell($largoCampos[$indComentarios], $h, $campos[$indComentarios], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indCantidad]) {
            $this->Cell($largoCampos[$indCantidad], $h, $campos[$indCantidad], 0, 0, 'C', false);
          }
          if ($mostrar[$indStock]) {
            $this->Cell($largoCampos[$indStock], $h, $campos[$indStock], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indUltMov]) {
            $this->Cell($largoCampos[$indUltMov], $h, $campos[$indUltMov], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indAlarma1]) {
            $this->Cell($largoCampos[$indAlarma1], $h, $campos[$indAlarma1], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indAlarma2]) {
            $this->Cell($largoCampos[$indAlarma2], $h, $campos[$indAlarma2], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indComProd]) {
            $this->Cell($largoCampos[$indComProd], $h, $campos[$indComProd], 'LRBT', 0, 'C', true);
          }
          if ($mostrar[$indMov]) {
            $this->Cell($largoCampos[$indMov], $h, $campos[$indMov], 'LRBT', 0, 'C', true);
          }
          ///*************************************************** FIN ESCRITURA CAMPOS VISIBLES ************************************************
          $this->Ln();
          $this->SetX($x);
          $this->SetFont('Courier', '', 9);
          $this->SetTextColor(0); 
        }
        ///********************************************************** FIN CAMPOS NUEVO PRODUCTO ***********************************************
      ///****************************************************** FIN CAMBIO DE PRODUCTO ********************************************************
      }
      else {
      ///************************************************************ INCIO ACTUALIZACIÓN CONTADORES ****************************************** 
        switch ($tipo) {
          case "Ingreso": $subtotalIngreso = $subtotalIngreso + $cantidad1;
                          $totalIngreso = $totalIngreso + $cantidad1;
                          $subtotalIngresoMostrar = number_format($subtotalIngreso, 0, ",", ".");
                          break;
          case "Retiro":  $subtotalRetiro = $subtotalRetiro + $cantidad1;
                          $totalRetiro = $totalRetiro + $cantidad1;
                          $subtotalRetiroMostrar = number_format($subtotalRetiro, 0, ",", ".");
                          break;
          case "Renovación":  $subtotalReno = $subtotalReno + $cantidad1;
                              $totalReno = $totalReno + $cantidad1;
                              $subtotalRenoMostrar = number_format($subtotalReno, 0, ",", ".");
                              break;
          case "Destrucción": $subtotalDestruccion = $subtotalDestruccion + $cantidad1;
                              $totalDestruccion = $totalDestruccion + $cantidad1;
                              $subtotalDestruccionMostrar = number_format($subtotalDestruccion, 0, ",", ".");
                              break;
          case "AJUSTE Retiro": $subtotalAjusteRetiros = $subtotalAjusteRetiros + $cantidad1;
                                $totalAjusteRetiros = $totalAjusteRetiros + $cantidad1;
                                $subtotalAjusteRetirosMostrar = number_format($subtotalAjusteRetiros, 0, ",", ".");
                                break;
          case "AJUSTE Ingreso": $subtotalAjusteIngresos = $subtotalAjusteIngresos + $cantidad1;
                                 $totalAjusteIngresos = $totalAjusteIngresos + $cantidad1;
                                 $subtotalAjusteIngresosMostrar = number_format($subtotalAjusteIngresos, 0, ",", ".");
                                 break;                  
          default: break;
        }
        if (($tipo !== 'Ingreso')&&($tipo !== 'AJUSTE Retiro')&&($tipo !== 'AJUSTE Ingreso')) {
          $totalConsumos = $totalConsumos + $cantidad1;
          $totalConsumosMostrar = number_format($totalConsumos, 0, ",", ".");
        }       
      }
      ///************************************************************** FIN ACTUALIZACIÓN CONTADORES ****************************************
      
      
      ///*********************************************** COMIENZO MANEJO DE DATOS DEL REGISTRO **********************************************       
      /// CAMBIO el CheckPageBreak, por uno personalizado que además de agregar la página, agrega el encabezado:
      //Issue a page break first if needed
      //$this->CheckPageBreak($h0);
      ///********************************************************* AGREGADO DEL ENCABEZADO **************************************************
      if($this->GetY()+$h0>$this->PageBreakTrigger){
        $this->AddPage($this->CurOrientation);
        $this->SetAutoPageBreak(true, $hFooter);
        ///************************************************************* TITULO *************************************************************
        $this->SetFont('Courier', 'B', 12);
        $this->SetTextColor(0);
        $this->SetY(25);
        $this->SetFillColor(colorSubtitulo[0], colorSubtitulo[1], colorSubtitulo[2]);
        
        $sub3 = $subTitulo."(cont.)";
        $tamSub3 = $this->GetStringWidth($sub3);
        if ($tamSub3 < $anchoTipo){
          $anchoSubTitulo = 1.05*$tamSub3;
        }
        else {
          $anchoSubTitulo = $anchoTipo;     
        }
        $xTipo = round((($anchoPagina - $anchoSubTitulo)/2), 2);
        $this->SetX($xTipo);
        
        $nbSubTitulo3 = $this->NbLines($anchoSubTitulo,$sub3);
        $hSubTitulo3=$h*$nbSubTitulo3;
          
        if ($nbSubTitulo3 > 1) {
          $this->MultiCell($anchoSubTitulo,$h, $sub3,0, 'C', 1);
        }
        else {
          $this->Cell($anchoSubTitulo,$hSubTitulo3, $sub3,0,0,'C', 1);
          $this->Ln();
        }
        $this->Ln();
        ///************************************************************ FIN TITULO **********************************************************
        $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
        $this->SetTextColor(255, 255, 255);
        $this->SetFont('Courier', 'B', 10);
        $this->SetX($x);
        
        ///******************************************************** INICIO CAMPOS  **********************************************************
        /// Recupero los índices de cada campo para poder ordenarlos luego:
        foreach ($campos as $i => $dato1) {
          switch ($dato1) {
            case "Id": $indId = $i;
                       break;
            case "IdProd": $indProd = $i;
                           break;
            case "IdMov": $indMov = $i;
                           break;             
            case "Entidad": $indEntidad = $i;
                            break;
            case "Nombre": $indNombre = $i;
                           break;
            case "Fecha": $indFecha = $i;
                          break;
            case "Hora": $indHora = $i;
                         break;
            case "Tipo": $indTipo = $i;
                         break;
            case "Estado": $indEstadoMov = $i;
                           break;
            case "Cantidad":  $indCantidad = $i;
                              break;
            case "Comentarios": $indComentarios = $i;
                                break;
            case "BIN": $indBin = $i;
                        break;
            case utf8_decode("Fecha Creación"): $indFechaCreacion = $i;
                                                break;          
            case utf8_decode("Cód. EMSA"): $indCodEMSA = $i;
                              break;
            case utf8_decode("Cód. Origen"): $indCodOrigen = $i;
                                break;                 
            case "Contacto":  $indContacto = $i;
                              break;              
            case "Snapshot":  $indSnapshot = $i;
                              break;
            case "Alarma1": $indAlarma1 = $i;
                            break;
            case "Alarma2": $indAlarma2 = $i;
                            break;   
            case utf8_decode("Últ. Mov."):  $indUltMov = $i;
                              break;
            case "Stock": $indStock = $i;
                          break;                 
            case "ComentariosProd": $indComProd = $i;
                                    break;  
            default: break;
          }
        }
        ///************************************************* INICIO ESCRITURA CAMPOS VISIBLES ***********************************************
        /// Imprimo los nombres de cada campo, siempre y cuando, se hayan marcado como visibles:
        /// Esto hay que hacerlo uno a uno para que queden en el orden requerido que es diferente al de la consulta
        if ($mostrar[$indId]) {
          $this->Cell($largoCampos[$indId], $h, $campos[$indId], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indFecha]) {
          $this->Cell($largoCampos[$indFecha], $h, $campos[$indFecha], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indHora]) {
          $this->Cell($largoCampos[$indHora], $h, $campos[$indHora], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indEntidad]) {
          $this->Cell($largoCampos[$indEntidad], $h, $campos[$indEntidad], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indProd]) {
          $this->Cell($largoCampos[$indProd], $h, $campos[$indProd], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indNombre]) {
          $this->Cell($largoCampos[$indNombre], $h, $campos[$indNombre], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indBin]) {
          $this->Cell($largoCampos[$indBin], $h, $campos[$indBin], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indFechaCreacion]) {
          $this->Cell($largoCampos[$indFechaCreacion], $h, $campos[$indFechaCreacion], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indCodEMSA]) {
          $this->Cell($largoCampos[$indCodEMSA], $h, $campos[$indCodEMSA], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indCodOrigen]) {
          $this->Cell($largoCampos[$indCodOrigen], $h, $campos[$indCodOrigen], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indContacto]) {
          $this->Cell($largoCampos[$indContacto], $h, $campos[$indContacto], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indSnapshot]) {
          $this->Cell($largoCampos[$indSnapshot], $h, $campos[$indSnapshot], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indTipo]) {
          $this->Cell($largoCampos[$indTipo], $h, $campos[$indTipo], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indEstadoMov]) {
          $this->Cell($largoCampos[$indEstadoMov], $h, $campos[$indEstadoMov], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indComentarios]) {
          $this->Cell($largoCampos[$indComentarios], $h, $campos[$indComentarios], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indCantidad]) {
          $this->Cell($largoCampos[$indCantidad], $h, $campos[$indCantidad], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indStock]) {
          $this->Cell($largoCampos[$indStock], $h, $campos[$indStock], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indUltMov]) {
          $this->Cell($largoCampos[$indUltMov], $h, $campos[$indUltMov], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indAlarma1]) {
          $this->Cell($largoCampos[$indAlarma1], $h, $campos[$indAlarma1], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indAlarma2]) {
          $this->Cell($largoCampos[$indAlarma2], $h, $campos[$indAlarma2], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indComProd]) {
          $this->Cell($largoCampos[$indComProd], $h, $campos[$indComProd], 'LRBT', 0, 'C', true);
        }
        if ($mostrar[$indMov]) {
          $this->Cell($largoCampos[$indMov], $h, $campos[$indMov], 'LRBT', 0, 'C', true);
        }
        ///*************************************************** FIN ESCRITURA CAMPOS VISIBLES ************************************************
        
        $this->Ln();
        $this->SetX($x);
        $this->SetFont('Courier', '', 9);
        $this->SetTextColor(0); 
        ///********************************************************** FIN CAMPOS  ***********************************************************
      }
      ///******************************************************* FIN AGREGADO DEL ENCABEZADO ************************************************
      
      ///Color para el resaltado de los registros:
      $this->setFillColor(colorFondoRegistro[0], colorFondoRegistro[1], colorFondoRegistro[2]);

      ///*********************************************************** MUESTRO LOS DATOS ******************************************************
      
      ///************************************************************* CAMPO ID *************************************************************
      /// Chequeo si se tiene que mostrar el campo Id, y de ser así lo muestro:
      if ($mostrar[$indId]) 
        {
        $w = $largoCampos[$indId];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indId])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indId])),'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indId])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///*********************************************************** FIN CAMPO ID ***********************************************************
      
      ///*********************************************************** CAMPO IDPROD ***********************************************************
      /// Chequeo si se tiene que mostrar el campo IdProd, y de ser así lo muestro:
      if ($mostrar[$indProd]) 
        {
        $w = $largoCampos[$indProd];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indProd])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indProd])),'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indProd])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************* FIN CAMPO IDPROD *********************************************************
      
      ///************************************************************* CAMPO FECHA **********************************************************
      /// Chequeo si se tiene que mostrar el campo Fecha, y de ser así lo muestro:
      if ($mostrar[$indFecha]) 
        {
        $w = $largoCampos[$indFecha];
        $fecha = $dato[$indFecha];
        $nb1 = $this->NbLines($w,$fecha);

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, $fecha,'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, $fecha,1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///*********************************************************** FIN CAMPO FECHA ********************************************************
      
      ///************************************************************* CAMPO HORA ***********************************************************
      /// Chequeo si se tiene que mostrar el campo Hora, y de ser así lo muestro:
      if ($mostrar[$indHora]) 
        {
        $w = $largoCampos[$indHora];
        $hora = $dato[$indHora];
        $nb1 = $this->NbLines($w,$hora);

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, $hora,'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, $hora,1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///*********************************************************** FIN CAMPO HORA *********************************************************
      
      ///************************************************************* CAMPO ENTIDAD ********************************************************
      /// Chequeo si se tiene que mostrar el campo Entidad, y de ser así lo muestro:
      if ($mostrar[$indEntidad]) 
        {
        $w = $largoCampos[$indEntidad];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indEntidad])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indEntidad])),1,'C', $fill);
        }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indEntidad])),1,'C', $fill);
        }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///*********************************************************** FIN CAMPO ENTIDAD ******************************************************
      
      ///************************************************************* CAMPO NOMBRE *********************************************************
      /// Chequeo si se tiene que mostrar el campo Nombre, y de ser así lo muestro:
      if ($mostrar[$indNombre]) 
        {
        $w = $largoCampos[$indNombre];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indNombre])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indNombre])),1,'C', $fill);
        }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indNombre])),1,'C', $fill);
        }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///*********************************************************** FIN CAMPO NOMBRE *******************************************************
      
      ///************************************************************** CAMPO BIN ***********************************************************
      /// Chequeo si se tiene que mostrar el campo Bin, y de ser así lo muestro:
      if ($mostrar[$indBin]) 
        {
        $w = $largoCampos[$indBin];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indBin])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indBin])),1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indBin])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///************************************************************ FIN CAMPO BIN *********************************************************
      
      ///********************************************************* CAMPO FECHA CREACION *****************************************************
      /// Chequeo si se tiene que mostrar el campo Fecha de Creación, y de ser así lo muestro:
      if ($mostrar[$indFechaCreacion]) 
        {
        $w = $largoCampos[$indFechaCreacion];
        $fechaCreacion1 = trim(utf8_decode($dato[$indFechaCreacion]));
        if (($fechaCreacion1 === '')||($fechaCreacion1 === null)) {
          $fechaCreacion = 'No Ingresada';
        }
        else {
          $fechaTemp = explode('-', $fechaCreacion1);
          $fechaCreacion = $fechaTemp[2].'/'.$fechaTemp[1].'/'.$fechaTemp[0];
        }
        $nb1 = $this->NbLines($w,$fechaCreacion);

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, $fechaCreacion,1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, $fechaCreacion,1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///******************************************************* FIN CAMPO FECHA CREACION ***************************************************
      
      ///********************************************************** CAMPO CODIGO EMSA *******************************************************
      /// Chequeo si se tiene que mostrar el campo Codigo EMSA, y de ser así lo muestro:
      if ($mostrar[$indCodEMSA]) 
        {
        $codEMSA = trim(utf8_decode($dato[$indCodEMSA]));
        if (($codEMSA == '')||($codEMSA == null))
          {
          $codEMSA = 'NO ingresado';
        }
        
        $w = $largoCampos[$indCodEMSA];
        $nb1 = $this->NbLines($w, $codEMSA);

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, $codEMSA,1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, $codEMSA,1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///******************************************************* FIN CAMPO CODIGO EMSA ******************************************************
      
      ///******************************************************** CAMPO CODIGO ORIGEN *******************************************************
      /// Chequeo si se tiene que mostrar el campo Codigo Origen, y de ser así lo muestro:
      if ($mostrar[$indCodOrigen]) 
        {
        $w = $largoCampos[$indCodOrigen];
        $codOrigen = trim(utf8_decode($dato[$indCodOrigen]));
        if (($codOrigen == '')||($codOrigen == null))
          {
          $codOrigen = 'NO ingresado';
        }
        $nb1 = $this->NbLines($w, $codOrigen);

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, $codOrigen,1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, $codOrigen,1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************** FIN CAMPO CODIGO ORIGEN *************************************************
      
      ///********************************************************* CAMPO ULT. MOV. **********************************************************
      /// Chequeo si se tiene que mostrar el campo Ult. Mov., y de ser así lo muestro:
      if ($mostrar[$indUltMov]) 
        {
        $w = $largoCampos[$indUltMov];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indUltMov])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indUltMov])),1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indUltMov])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///******************************************************** FIN CAMPO ULT. MOV. *******************************************************
      
      ///*********************************************************** CAMPO CONTACTO *********************************************************
      /// Chequeo si se tiene que mostrar el campo Contacto, y de ser así lo muestro:
      if ($mostrar[$indContacto]) 
        {
        $w = $largoCampos[$indContacto];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indContacto])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indContacto])),1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indContacto])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************** FIN CAMPO CONTACTO ******************************************************
      
      ///************************************************************ CAMPO SNAPSHOT ********************************************************
      /// Chequeo si se tiene que mostrar el campo Snapshot, y de ser así lo muestro:
      if ($mostrar[$indSnapshot]) 
        {
        $w = $largoCampos[$indSnapshot];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indSnapshot])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indSnapshot])),'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indSnapshot])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************** FIN CAMPO SNAPSHOT ******************************************************
      
      ///********************************************************* CAMPO COMPROD ************************************************************
      /// Chequeo si se tiene que mostrar el campo ComProd, y de ser así lo muestro:
      if ($mostrar[$indComProd]) 
        {
        $w = $largoCampos[$indComProd];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indComProd])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indComProd])),1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indComProd])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************* FIN CAMPO COMPROD ********************************************************
      
      ///************************************************************ CAMPO TIPO ************************************************************
      /// Chequeo si se tiene que mostrar el campo Tipo, y de ser así lo muestro:
      if ($mostrar[$indTipo]) 
        {
        $w = $largoCampos[$indTipo];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indTipo])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indTipo])),1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indTipo])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************** FIN CAMPO TIPO **********************************************************
      
      ///*********************************************************** CAMPO ESTADO ***********************************************************
      /// Chequeo si se tiene que mostrar el campo Estado, y de ser así lo muestro:
      if ($mostrar[$indEstadoMov]) 
        {
        $w = $largoCampos[$indEstadoMov];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indEstadoMov])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indEstadoMov])),'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indEstadoMov])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************* FIN CAMPO ESTADO *********************************************************
      
      ///******************************************************** CAMPO COMENTARIOS *********************************************************
      /// Chequeo si se tiene que mostrar el campo Comentarios, y de ser así lo muestro:
      if ($mostrar[$indComentarios]) 
        {
        $w = $largoCampos[$indComentarios];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indComentarios])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indComentarios])),1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indComentarios])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///******************************************************** CAMPO COMENTARIOS *********************************************************
      
      ///********************************************************** CAMPO CANTIDAD **********************************************************
      /// Chequeo si se tiene que mostrar el campo Cantidad, y de ser así lo muestro:
      if ($mostrar[$indCantidad]) 
        {
        $w = $largoCampos[$indCantidad];
        $cantidad1 = trim(utf8_decode($dato[$indCantidad]));
        $cantidad = number_format($cantidad1, 0, ",", ".");
        $nb1 = $this->NbLines($w,$cantidad);

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        $this->SetFont('Courier', 'BI', 14);
        $this->SetTextColor(255,0,0);
        
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, $cantidad,1,'R', $fill);
          }
        else {
          $this->MultiCell($w,$h0, $cantidad,1,'R', $fill);
          } 
        
        $this->SetFont('Courier', '', 9);
        $this->SetTextColor(0);  
          
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///******************************************************** FIN CAMPO CANTIDAD ********************************************************
      
      ///*********************************************************** CAMPO STOCK ************************************************************
      /// Chequeo si se tiene que mostrar el campo Stock, y de ser así lo muestro:
      if ($mostrar[$indStock]) 
        {
        $w = $largoCampos[$indStock];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indStock])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indStock])),1,'C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indStock])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************* FIN CAMPO STOCK **********************************************************
      
      ///********************************************************** CAMPO ALARMA1 ***********************************************************
      /// Chequeo si se tiene que mostrar el campo Alarma1, y de ser así lo muestro:
      if ($mostrar[$indAlarma1]) 
        {
        $w = $largoCampos[$indAlarma1];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indAlarma1])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indAlarma1])),'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indAlarma1])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///******************************************************* FIN CAMPO ALARMA1 **********************************************************
      
      ///********************************************************** CAMPO ALARMA2 ***********************************************************
      /// Chequeo si se tiene que mostrar el campo Alarma2, y de ser así lo muestro:
      if ($mostrar[$indAlarma2]) 
        {
        $w = $largoCampos[$indAlarma2];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indAlarma2])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indAlarma2])),'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indAlarma2])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///******************************************************* FIN CAMPO ALARMA2 **********************************************************
      
      ///************************************************************ CAMPO IDMOV ***********************************************************
      /// Chequeo si se tiene que mostrar el campo IdMov, y de ser así lo muestro:
      if ($mostrar[$indMov]) 
        {
        $w = $largoCampos[$indMov];
        $nb1 = $this->NbLines($w,trim(utf8_decode($dato[$indMov])));

        //Save the current position
        $x1=$this->GetX();
        $y=$this->GetY();
        
        if ($fill) {
          $f = 'F';
        }
        else {
          $f = '';
        }
        //Draw the border
        $this->Rect($x1,$y,$w,$h0, $f);
        $h1 = $h0/$nb1;
        //Print the text
        if ($nb1 > 1) {
          $this->MultiCell($w,$h1, trim(utf8_decode($dato[$indMov])),'LRT','C', $fill);
          }
        else {
          $this->MultiCell($w,$h0, trim(utf8_decode($dato[$indMov])),1,'C', $fill);
          }  
        //Put the position to the right of the cell
        $this->SetXY($x1+$w,$y);
      }
      ///********************************************************** FIN CAMPO IDMOV *********************************************************
      
      ///********************************************************** FIN MUESTRO LOS CAMPOS **************************************************
      
      ///Hago el salto de línea, seteo el cursos a la posición inicial, y permuto el valor de relleno:
      //Go to the next line
      $this->Ln($h0);
      $this->SetX($x);
      $fill = !$fill;
    }
    ///********************************************************** FIN RECORRIDA REGISTROS *************************************************** 
    //Issue a page break first if needed
    //$this->CheckPageBreak($h);
    ///********************************************************* AGREGADO DEL ENCABEZADO ****************************************************
    if($this->GetY()+$h>$this->PageBreakTrigger){
      $this->AddPage($this->CurOrientation);
      $this->SetAutoPageBreak(true, $hFooter);
      ///************************************************************* TITULO ***************************************************************
      $this->SetFont('Courier', 'B', 12);
      $this->SetTextColor(0);
      $this->SetY(25);
      $this->SetFillColor(colorSubtitulo[0], colorSubtitulo[1], colorSubtitulo[2]);
      
      $sub4 = $subTitulo."(cont.)";
      $tamSub4 = $this->GetStringWidth($sub4);
      if ($tamSub4 < $anchoTipo){
        $anchoSubTitulo = 1.05*$tamSub4;
      }
      else {
        $anchoSubTitulo = $anchoTipo;
      }
      $xTipo = round((($anchoPagina - $anchoSubTitulo)/2), 2);
      $this->SetX($xTipo);
       
      $nbSubTitulo4 = $this->NbLines($anchoSubTitulo,$sub4);
      $hSubTitulo4=$h*$nbSubTitulo4;
      
      if ($nbSubTitulo4 > 1) {
        $this->MultiCell($anchoSubTitulo,$h, $sub4,0, 'C', 1);
      }
      else {
        $this->Cell($anchoSubTitulo,$hSubTitulo4, $sub4,0,0,'C', 1);
        $this->Ln();
      }
      $this->Ln();
      ///************************************************************ FIN TITULO ************************************************************
    }
    ///******************************************************** FIN AGREGADO DEL ENCABEZADO *************************************************
    
    ///********************************************************* AGREGADO DEL RESUMEN FINAL *************************************************
    $tamSubTotal = $largoCampos[$indCantidad];// + $largoCampos[$indComentarios];
    $tamTextoSubtotal = $tamTabla-$tamSubTotal;
    ///******************************************************* FIN AGREGADO DEL RESUMEN FINAL ***********************************************
    if ($mostrarResumenProducto){
      ///***************************************************** INICIO RESUMEN DEL ÚLTIMO PRODUCTO *******************************************
      $totalRenglonesUltProducto = 0;
      if ($subtotalRetiro > 0) {
        $totalRenglonesUltProducto++;
      }  
      if ($subtotalReno > 0) {
        $totalRenglonesUltProducto++;
      }  
      if ($subtotalDestruccion > 0) {
        $totalRenglonesUltProducto++;
      }  
      if ($totalConsumos > 0) {
        $totalRenglonesUltProducto++;
      }  
      if ($subtotalIngreso > 0) {
        $totalRenglonesUltProducto++;
      }  
      if ($subtotalAjusteRetiros > 0) {
        $totalRenglonesUltProducto++;
      }  
      if ($subtotalAjusteIngresos > 0) {
        $totalRenglonesUltProducto++;
      }  
      
      if ($totalRenglonesUltProducto > 0){
        if($this->GetY()+($totalRenglonesUltProducto+1)*$h > $this->PageBreakTrigger){
          $this->AddPage($this->CurOrientation);
          $this->SetAutoPageBreak(true, $hFooter);
        }
      }
      ///Agrego el resumen para el último producto dado que no habrá nuevo cambio de producto:
      if ($subtotalRetiro > 0) {
        $this->SetFont('Courier', 'B', 9);
        $this->SetTextColor(0);  
        $this->SetX($x);
        $this->Cell($tamTextoSubtotal,$h, "Total Retiros:",1,0,'C', false);

        $this->SetFont('Courier', 'BI', 14);
        $this->setFillColor(colorRetiros[0], colorRetiros[1], colorRetiros[2]);
        $this->SetTextColor(0);  
        $this->Cell($tamSubTotal,$h, $subtotalRetiroMostrar,1,1,'R', true);

        $subtotalRetiro = 0;
        $subtotalRetiroMostrar = 0;
      }

      if ($subtotalReno > 0){
        $this->SetFont('Courier', 'B', 9);
        $this->SetTextColor(0); 
        $this->SetX($x);
        $this->Cell($tamTextoSubtotal,$h, "Total Renovaciones:",1,0,'C', false);

        $this->SetFont('Courier', 'BI', 14);
        $this->setFillColor(colorRenos[0], colorRenos[1], colorRenos[2]);
        $this->SetTextColor(0);  
        $this->Cell($tamSubTotal,$h, $subtotalRenoMostrar,1,1,'R', true);

        $subtotalReno = 0;
        $subtotalRenoMostrar = 0;
      }

      if ($subtotalDestruccion > 0) {
        $this->SetFont('Courier', 'B', 9);
        $this->SetTextColor(0);  
        $this->SetX($x);
        $this->Cell($tamTextoSubtotal,$h, utf8_decode("Total Destrucciones:"),1,0,'C', false);

        $this->SetFont('Courier', 'BI', 14);
        $this->setFillColor(colorDestrucciones[0], colorDestrucciones[1], colorDestrucciones[2]);
        $this->SetTextColor(0);  
        $this->Cell($tamSubTotal,$h, $subtotalDestruccionMostrar,1,1,'R', true);

        $subtotalDestruccion = 0;
        $subtotalDestruccionMostrar = 0;
      }

      if ($totalConsumos > 0) {
        $this->SetFont('Courier', 'B', 9);
        $this->SetTextColor(0);  
        $this->SetX($x);
        $this->Cell($tamTextoSubtotal,$h, utf8_decode("Total de Consumos:"),1,0,'C', false);

        $this->SetFont('Courier', 'BI', 14);
        $this->setFillColor(colorConsumos[0], colorConsumos[1], colorConsumos[2]);
        $this->SetTextColor(0);  
        $this->Cell($tamSubTotal,$h, $totalConsumosMostrar,1,1,'R', true);

        $totalConsumos = 0;
        $totalConsumosMostrar = 0;
      }

      if ($subtotalIngreso > 0) {
        $this->SetFont('Courier', 'B', 9);
        $this->SetTextColor(0);  
        $this->SetX($x);
        $this->Cell($tamTextoSubtotal,$h, "Total de Ingresos:",1,0,'C', false);

        $this->SetFont('Courier', 'BI', 14);
        $this->setFillColor(colorIngresos[0], colorIngresos[1], colorIngresos[2]);
        $this->SetTextColor(0);  
        $this->Cell($tamSubTotal,$h, $subtotalIngresoMostrar,1,1,'R', true);

        $subtotalIngreso = 0;
        $subtotalIngresoMostrar = 0;
      }
      
      if ($subtotalAjusteRetiros > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, "Total AJUSTE Retiros:",1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorAjusteRetiros[0], colorAjusteRetiros[1], colorAjusteRetiros[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalAjusteRetirosMostrar,1,1,'R', true);

            $subtotalAjusteRetiros = 0;
            $subtotalAjusteRetirosMostrar = 0;
          }
          
      if ($subtotalAjusteIngresos > 0) {
            $this->SetFont('Courier', 'B', 9);
            $this->SetTextColor(0);  
            $this->SetX($x);
            $this->Cell($tamTextoSubtotal,$h, "Total AJUSTE Ingresos:",1,0,'C', false);

            $this->SetFont('Courier', 'BI', 14);
            $this->setFillColor(colorAjusteIngresos[0], colorAjusteIngresos[1], colorAjusteIngresos[2]);
            $this->SetTextColor(0);  
            $this->Cell($tamSubTotal,$h, $subtotalAjusteIngresosMostrar,1,1,'R', true);

            $subtotalAjusteIngresos = 0;
            $subtotalAjusteIngresosMostrar = 0;
          }
      ///***************************************************** FIN RESUMEN DEL ÚLTIMO PRODUCTO **********************************************
    }
    else {
      $this->SetFont('Courier', 'B', 9);
      $this->SetTextColor(0);  
      $this->SetX($x);
      switch ($tipoMov){
        case "Retiros": $total = $totalRetiro;
                        $this->setFillColor(colorRetiros[0], colorRetiros[1], colorRetiros[2]);
                        break;
        case "Ingresos": $total = $totalIngreso;
                         $this->setFillColor(colorIngresos[0], colorIngresos[1], colorIngresos[2]);
                         break;
        case "Renovaciones": $total = $totalReno;
                             $this->setFillColor(colorRenos[0], colorRenos[1], colorRenos[2]);
                             break;
        case "Destrucciones": $total = $totalDestruccion;
                              $this->setFillColor(colorDestrucciones[0], colorDestrucciones[1], colorDestrucciones[2]);
                              break;
        case "AJUSTE Ingresos": $total = $totalAjusteIngresos;
                                $this->setFillColor(colorAjusteIngresos[0], colorAjusteIngresos[1], colorAjusteIngresos[2]);
                                break;
        case "AJUSTE Retiros": $total = $totalAjusteRetiros;
                               $this->setFillColor(colorAjusteRetiros[0], colorAjusteRetiros[1], colorAjusteRetiros[2]);
                               break;             
        default: break;                  
      }
      if ($tipoMov === 'Ajustes'){
        $totalMostrar1 = number_format($totalAjusteRetiros, 0, ",", ".");
        $this->Cell($tamTextoSubtotal,$h, "Total AJUSTE Retiros:",1,0,'C', false);
        $this->SetFont('Courier', 'BI', 14);
        $this->setFillColor(colorAjusteRetiros[0], colorAjusteRetiros[1], colorAjusteRetiros[2]);
        $this->SetTextColor(0);  
        $this->Cell($largoCampos[$indCantidad],$h, $totalMostrar1,1,1,'R', true);
        
        $this->SetFont('Courier', 'B', 9);
        $this->SetTextColor(0);  
        $this->SetX($x);
        $totalMostrar2 = number_format($totalAjusteIngresos, 0, ",", ".");
        $this->Cell($tamTextoSubtotal,$h, utf8_decode("Total AJUSTE Ingresos:"),1,0,'C', false);
        $this->SetFont('Courier', 'BI', 14);
        $this->setFillColor(colorAjusteIngresos[0], colorAjusteIngresos[1], colorAjusteIngresos[2]);
        $this->SetTextColor(0);  
        $this->Cell($largoCampos[$indCantidad],$h, $totalMostrar2,1,1,'R', true);
      }
      else {
        $totalMostrar = number_format($total, 0, ",", ".");
        $this->Cell($tamTextoSubtotal,$h, utf8_decode("Total $tipoMov:"),1,0,'C', false);
        $this->SetFont('Courier', 'BI', 14);
        $this->SetTextColor(0);  
        $this->Cell($largoCampos[$indCantidad],$h, $totalMostrar,1,1,'R', true);
      }   
    }
    ///*********************************************************** BORDE FINAL **************************************************************
    $y = $this->GetY();
    $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
    ///Agrego el rectángulo con el borde redondeado:
    $this->RoundedRect($x, $y, $tamTabla, $h, 3.5, '34', 'DF');
    ///********************************************************* FIN BORDE FINAL ************************************************************
  }
  ///*********************************************************** FIN movimientos ************************************************************
  
  //Tabla tipo listado con el detalle del producto:
  function tablaProducto()
    {
    global $h, $c1;
    global $registros, $subtotales, $tipoConsulta, $codigoEMSA, $bin, $rutaFotos, $nombreProducto;
    
    $cCampo = 2.2*$c1;
    $cResto = 4*$c1;
    $cFoto = 3.4*$c1;
    
    $entidad = trim(utf8_decode($registros[0][2]));
    $nombre = trim(utf8_decode($registros[0][3]));
    $bin = $registros[0][4];
    $codigoOrigen = $registros[0][6];
    $contacto = $registros[0][7];
    $foto = $registros[0][8];
    $ultimoMovimiento = trim(utf8_decode($registros[0][9]));
    $fechaCreacion = $registros[0][14];
    $idprod = $registros[0][1];
    
    if (!isset($subtotales[$idprod])){
      $stock = $registros[0][10];  
    }
    else {
      $stock = $subtotales[$idprod];
    }
    $alarma1 = $registros[0][11];
    $alarma2 = $registros[0][12];    
    $comentarios = trim(utf8_decode($registros[0][13]));
    
    $tamEntidad = $this->GetStringWidth($entidad);
    $tamNombre = $this->GetStringWidth($nombre);
    $tamCodigo = $this->GetStringWidth($codigoEMSA);
    if ((($tamNombre) || ($tamEntidad)) < $cResto) {
      $cResto = 1.52*$tamCodigo;
    }
    
    $tamTabla = $cCampo + $cResto;
    $anchoPagina = $this->GetPageWidth();
    $anchoTipo = 0.8*$anchoPagina;
    
    $x = ($anchoPagina-$tamTabla)/2;
    $xTipo = ($anchoPagina - $anchoTipo)/2;

    //Defino color para los bordes:
    $this->SetDrawColor(0, 0, 0);
    //Defino grosor de los bordes:
    $this->SetLineWidth(.3);
    
    ///*************************************************************** INICIO TITULO *********************************************************
    //Defino tipo de letra y tamaño para el Título:
    $this->SetFont('Courier', 'B', 12);
    //Establezco las coordenadas del borde de arriba a la izquierda de la tabla:
    //$this->SetY(20);
    
    //$tipoTotal = "Stock del producto $nombre";
    $tipoTotal = $tipoConsulta;
    $tam = $this->GetStringWidth($tipoTotal);
    $xInicio = $xTipo + (($anchoTipo-$tam)/2);
    $this->SetX($xInicio);
    
    $nbTitulo = $this->NbLines($anchoTipo,$tipoTotal);
    $hTitulo=$h*$nbTitulo;
    
    //Save the current position
    $x1=$this->GetX();
    $y=$this->GetY();
    
    $tam1 = $this->GetStringWidth("Stock del producto ");
    $fraccionado = false;
    $parteTipo = stripos($tipoTotal, ": ");
    if ($parteTipo !== false){
      $parte2 = explode(": ", $tipoTotal);
      $ultimaParte = utf8_decode(" al día: ".$parte2[1]);
      $fraccionado = true;
      $tamUlitmaParte = $this->GetStringWidth($ultimaParte);
    }
    //echo "tam: $tam<br>ultima: $ultimaParte<br>tamUltima: $tamUlitmaParte<br>nombre: $tamNombre";
    //Print the text
    if ($nbTitulo > 1) {
      //$this->MultiCell($anchoTipo,$h, trim(utf8_decode($tipoConsulta)),0,'C', 0);
      $this->Cell($tam1,$h, "Stock del producto",0, 0, 'R', 0);
      $this->SetTextColor(255, 0, 0);
      $this->SetFont('Courier', 'BI', 12);
      $tamNombre1 = $this->GetStringWidth($nombre);
      $this->Cell($tamNombre1,$h, utf8_decode($nombreProducto),0, 0,'L', 0);
      $this->SetTextColor(0);
      if ($fraccionado){
        $this->Cell($tamUlitmaParte,$h, $ultimaParte,0, 0, 'L', 0);
      } 
    }
    else {
      //$this->MultiCell($anchoTipo,$h, trim(utf8_decode($tipoConsulta)),0,'C', 0);
      $this->Cell($tam1,$hTitulo, "Stock del producto",0, 0,'R', 0);
      $this->SetTextColor(255, 0, 0);
      $this->SetFont('Courier', 'BI', 12);
      $tamNombre1 = $this->GetStringWidth($nombre);
      $this->Cell($tamNombre1,$h, utf8_decode($nombreProducto),0, 0,'L', 0);
      $this->SetTextColor(0);
      if ($fraccionado){
        $this->Cell($tamUlitmaParte,$hTitulo, $ultimaParte,0, 0, 'L', 0);
      } 
    }  
    
    $this->SetXY($x,$y+$hTitulo);
    ///**************************************************************** FIN TITULO ***********************************************************
    
    ///***************************************************************** FOTO ****************************************************************
    ///Agrego un snapshot de la tarjeta debajo de la tabla (si es que existe!!):
    if (($foto !== null) && ($foto !== '')) {
      $this->Ln(3);
      $rutita = $rutaFotos."/".$foto;
      if (file_exists($rutita)){
        list($anchoFoto, $altoFoto) = $this->resizeToFit($rutita, self::FOTO_WIDTH_MM, self::FOTO_HEIGHT_MM);
        $xFoto = ($anchoPagina - $anchoFoto)/2;
        $this->SetX($xFoto);
        $yFoto = $this->GetY();
        $this->Image($rutita, $xFoto, $yFoto, $anchoFoto, $altoFoto);
        $this->Ln($altoFoto-3);
      }   
    }
    ///*************************************************************** FIN FOTO **************************************************************
    $this->Ln(8);
    ///************************************************************* TÍTULO TABLA ************************************************************
    $this->SetX($x);
    $y = $this->GetY();
    ///Título de la tabla:
    $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
    $this->SetTextColor(255, 255, 255);
    ///Agrego el rectángulo con el borde redondeado:
    $this->RoundedRect($x, $y, $tamTabla, $h, 3.5, '12', 'DF');
    //Escribo el título:
    $this->Cell($tamTabla, $h, "DETALLES DEL PRODUCTO", 0, 0, 'C', 0);
    $this->Ln();
    ///************************************************************** FIN TÍTULO TABLA ********************************************************
    
    //Restauro color de fondo y tipo de letra para el contenido:
    $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
    $this->SetTextColor(255, 255, 255);
    $this->SetFont('Courier', '', 9);
    $this->SetX($x);
    
    ///**************************************************************** CAMPO NOMBRE **********************************************************
    $nbNombre = $this->NbLines($cResto,$nombre);
    $h0=$h*$nbNombre;
    
    $this->SetFont('Courier', 'B', 10);
    $this->Cell($cCampo, $h0, "Nombre:", 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    //Save the current position
    $x1=$this->GetX();
    $y=$this->GetY();
    //Draw the border
    $this->Rect($x1,$y,$cResto,$h0);
    //Print the text
    if ($nbNombre > 1) {
      $this->MultiCell($cResto,$h, $nombre,'LRT','C', 0);
      }
    else {
      $this->MultiCell($cResto,$h0, $nombre,1,'C', 0);
      }  
      
    //Put the position to the right of the cell
    $this->SetXY($x,$y+$h0);
    ///**************************************************************** FIN CAMPO NOMBRE ******************************************************
    
    ///**************************************************************** CAMPO ENTIDAD *********************************************************
    $nb = $this->NbLines($cResto, $entidad);
    $h0=$h*$nb;
    
    $this->SetFont('Courier', 'B', 10);
    $this->SetTextColor(255, 255, 255);
    $this->Cell($cCampo, $h0, "Entidad:", 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    //Save the current position
    $x1=$this->GetX();
    $y=$this->GetY();
    //Draw the border
    $this->Rect($x1,$y,$cResto,$h0);
    //Print the text
    if ($nb > 1) {
      $this->MultiCell($cResto,$h, $entidad,'LRT','C', 0);
      }
    else {
      $this->MultiCell($cResto,$h, $entidad,1,'C', 0);
      }  
      
    //Put the position to the right of the cell
    $this->SetXY($x,$y+$h0);
    ///**************************************************************** FIN CAMPO ENTIDAD *****************************************************
    
    ///************************************************************** CAMPO CODIGO EMSA *******************************************************
    if (($codigoEMSA === '')||($codigoEMSA === null)) {
      $codigoEMSA = 'No Ingresado';
    }
    $this->SetTextColor(255, 255, 255);
    $this->SetFont('Courier', 'B', 10);
    $this->Cell($cCampo, $h, utf8_decode("Código EMSA:"), 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    $this->Cell($cResto, $h, $codigoEMSA, 'LRBT', 0, 'C', false);
    $this->Ln();
    $this->SetX($x);
    ///************************************************************* FIN CAMPO CODIGO EMSA ****************************************************
    
    ///************************************************************ CAMPO CODIGO ORIGEN *******************************************************
    if (($codigoOrigen === '')||($codigoOrigen === null)) {
      $codigoOrigen = 'No Ingresado';
    }
    $this->SetTextColor(255, 255, 255);
    $this->SetFont('Courier', 'B', 10);
    $this->Cell($cCampo, $h, utf8_decode("Código Origen:"), 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    $this->Cell($cResto, $h, $codigoOrigen, 'LRBT', 0, 'C', false);
    $this->Ln();
    $this->SetX($x);
    ///************************************************************ FIN CAMPO CODIGO ORIGEN ***************************************************
    
    ///*********************************************************** CAMPO FECHA CREACION *******************************************************
    if (($fechaCreacion === '')||($fechaCreacion === null)) {
      $fechaCreacion = 'No Ingresada';
    }
    else {
      $fechaTemp = explode('-', $fechaCreacion);
      $fechaCreacion = $fechaTemp[2].'/'.$fechaTemp[1].'/'.$fechaTemp[0];
    }
    $this->SetTextColor(255, 255, 255);
    $this->SetFont('Courier', 'B', 10);
    $this->Cell($cCampo, $h, utf8_decode("Fecha de Creación:"), 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    $this->Cell($cResto, $h, $fechaCreacion, 'LRBT', 0, 'C', false);
    $this->Ln();
    $this->SetX($x);
    ///************************************************************ FIN CAMPO FECHA CREACION **************************************************
    
    ///**************************************************************** CAMPO BIN *************************************************************
    if (($bin === '')||($bin === null)) {
      $bin = 'N/D o N/C';
    }
    $this->SetFont('Courier', 'B', 10);
    $this->SetTextColor(255, 255, 255);
    $this->Cell($cCampo, $h, "BIN:", 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    $this->Cell($cResto, $h, $bin, 'LRBT', 0, 'C', false);
    $this->Ln();
    $this->SetX($x);
    ///**************************************************************** FIN CAMPO BIN *********************************************************
    
    ///**************************************************************** CAMPO CONTACTO ********************************************************
    if (($contacto === '')||($contacto === null)) {
      $contacto = '';
    }
    $this->SetFont('Courier', 'B', 10);
    $this->SetTextColor(255, 255, 255);
    
    $this->Cell($cCampo, $h, "Contacto:", 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    $this->Cell($cResto, $h, $contacto, 'LRBT', 0, 'C', false);
    $this->Ln();
    $this->SetX($x);  
    ///**************************************************************** FIN CAMPO CONTACTO ****************************************************
    
    ///**************************************************************** CAMPO COMENTARIOS *****************************************************
    if (($comentarios === '')||($comentarios === null)) {
      $comentarios = '';
    }
    $nbComment = $this->NbLines($cResto,$comentarios);
    $h0=$h*$nbComment;
    
    $this->SetFont('Courier', 'B', 10);
    $this->SetTextColor(255, 255, 255);
    $this->Cell($cCampo, $h0, "Comentarios:", 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    //Save the current position
    $x1=$this->GetX();
    $y=$this->GetY();
    //Draw the border
    $this->Rect($x1,$y,$cResto,$h0);
    
    /// Resaltado en AMARILLO del comentario que tiene el patrón: DIF
    $patron = "dif";
    $buscar = stripos($comentarios, $patron);
    if ($buscar !== FALSE){
      $this->SetFillColor(colorComDiff[0], colorComDiff[1], colorComDiff[2]);
      $fill = 1;
    }
    else 
      {
      /// Resaltado en VERDE del comentario que tiene el patrón: STOCK
      $patron = "stock";
      $buscar = stripos($comentarios, $patron);
      if ($buscar !== FALSE){
        $this->SetFillColor(colorComStock[0], colorComStock[1], colorComStock[2]);
        $fill = 1;
      }
      else 
        {
        /// Resaltado en ROJO SUAVE del comentario que tiene el patrón: PLASTICO con o sin tilde
        $patron = "plastico";
        $patron1 = utf8_decode("plástico");
        $buscar = stripos($comentarios, $patron);
        $buscar1 = stripos($comentarios, $patron1);
        if (($buscar !== FALSE)||($buscar1 !== FALSE)){
          $this->SetFillColor(colorComPlastico[0], colorComPlastico[1], colorComPlastico[2]);
          $fill = 1;
        }
        else 
          {
          /// Resaltado en GRIS del comentario que no cumple con ninguno de los patrones, pero que NO es nulo
          if (($comentarios !== '')){
            $this->setFillColor(colorComRegular[0], colorComRegular[1], colorComRegular[2]);
            $fill = 1;
          }
          else {
            $fill = 0;
          }
        }
      }
    }
    
    //Print the text
    if ($nbComment > 1) {
      $this->MultiCell($cResto,$h, $comentarios,'LRT','C', $fill);
      }
    else {
      $this->MultiCell($cResto,$h, $comentarios,1,'C', $fill);
      } 
      
    //Put the position to the right of the cell
    $this->SetXY($x,$y+$h0);
    ///Restauro color de fondo de los campos: 
    $this->SetFillColor(colorCampos[0], colorCampos[1], colorCampos[2]);
    ///**************************************************************** FIN CAMPO COMENTARIOS *************************************************
    
    ///**************************************************************** CAMPO ULT. MOV ********************************************************
    if (($ultimoMovimiento === '')||($ultimoMovimiento === null)) {
      $ultimoMovimiento = '';
    }
    $nbMov = $this->NbLines($cResto,$ultimoMovimiento);
    $h0=$h*$nbMov;
    
    $this->SetFont('Courier', 'B', 10);
    $this->SetTextColor(255, 255, 255);
    $this->Cell($cCampo, $h0, utf8_decode("Último Movimiento:"), 'LRBT', 0, 'L', true);
    $this->SetFont('Courier', '', 9);
    $this->SetTextColor(0);
    //Save the current position
    $x1=$this->GetX();
    $y=$this->GetY();
    //Draw the border
    $this->Rect($x1,$y,$cResto,$h0);
    //Print the text
    if ($nbMov > 1) {
      $this->MultiCell($cResto,$h, $ultimoMovimiento,'LRT','C', 0);
      }
    else {
      $this->MultiCell($cResto,$h, $ultimoMovimiento,1,'C', 0);
      } 
      
    //Put the position to the right of the cell
    $this->SetXY($x,$y+$h0);
    ///**************************************************************** FIN CAMPO ULT. MOV ****************************************************
    
    ///**************************************************************** CAMPO STOCK ***********************************************************
    //Detecto si el stock actual está o no por debajo del valor de alarma. En base a eso elijo el color de fondo del stock:       
    $this->SetFont('Courier', 'B', 10);
    $this->SetTextColor(255, 255, 255);
    $this->Cell($cCampo, $h, "Stock:", 'LRBT', 0, 'L', true);
    $this->SetTextColor(0);
    $this->SetFont('Courier', 'BI', 16);
    if (($stock < $alarma1) && ($stock > $alarma2)){
      $this->SetFillColor(colorStockAlarma1[0], colorStockAlarma1[1], colorStockAlarma1[2]);
      $this->SetTextColor(0);
    }
    else {
      if ($stock < $alarma2){
        $this->SetFillColor(colorStockAlarma2[0], colorStockAlarma2[1], colorStockAlarma2[2]);
        $this->SetTextColor(255);
      }
      else {
        $this->SetFillColor(colorStockRegular[0], colorStockRegular[1], colorStockRegular[2]);
      }
    }
    $this->Cell($cResto, $h, number_format($stock, 0, ",", "."), 'LRBT', 0, 'C', true);
    $this->Ln();
    $this->SetX($x);
    ///**************************************************************** FIN CAMPO STOCK *******************************************************
    
    ///***************************************************** BORDE REDONDEADO DE CIERRE *******************************************************
    $y = $this->GetY();
    $this->SetFillColor(colorTituloTabla[0], colorTituloTabla[1], colorTituloTabla[2]);
    ///Agrego el rectángulo con el borde redondeado:
    $this->RoundedRect($x, $y, $tamTabla, $h, 3.5, '34', 'DF');
    ///***************************************************** FIN BORDE REDONDEADO DE CIERRE ***************************************************
  }
  
  ///Función auxiliar para redondear los bordes de las tablas.
  ///Está sacada del script: Rounded Rectangle
  function RoundedRect($x, $y, $w, $h, $r, $corners = '1234', $style = '')
    {
    $k = $this->k;
    $hp = $this->h;
    if($style=='F')
        $op='f';
    elseif($style=='FD' || $style=='DF')
        $op='B';
    else
        $op='S';
    $MyArc = 4/3 * (sqrt(2) - 1);
    $this->_out(sprintf('%.2F %.2F m',($x+$r)*$k,($hp-$y)*$k ));

    $xc = $x+$w-$r;
    $yc = $y+$r;
    $this->_out(sprintf('%.2F %.2F l', $xc*$k,($hp-$y)*$k ));
    if (strpos($corners, '2')===false)
        $this->_out(sprintf('%.2F %.2F l', ($x+$w)*$k,($hp-$y)*$k ));
    else
        $this->_Arc($xc + $r*$MyArc, $yc - $r, $xc + $r, $yc - $r*$MyArc, $xc + $r, $yc);

    $xc = $x+$w-$r;
    $yc = $y+$h-$r;
    $this->_out(sprintf('%.2F %.2F l',($x+$w)*$k,($hp-$yc)*$k));
    if (strpos($corners, '3')===false)
        $this->_out(sprintf('%.2F %.2F l',($x+$w)*$k,($hp-($y+$h))*$k));
    else
        $this->_Arc($xc + $r, $yc + $r*$MyArc, $xc + $r*$MyArc, $yc + $r, $xc, $yc + $r);

    $xc = $x+$r;
    $yc = $y+$h-$r;
    $this->_out(sprintf('%.2F %.2F l',$xc*$k,($hp-($y+$h))*$k));
    if (strpos($corners, '4')===false)
        $this->_out(sprintf('%.2F %.2F l',($x)*$k,($hp-($y+$h))*$k));
    else
        $this->_Arc($xc - $r*$MyArc, $yc + $r, $xc - $r, $yc + $r*$MyArc, $xc - $r, $yc);

    $xc = $x+$r ;
    $yc = $y+$r;
    $this->_out(sprintf('%.2F %.2F l',($x)*$k,($hp-$yc)*$k ));
    if (strpos($corners, '1')===false)
    {
        $this->_out(sprintf('%.2F %.2F l',($x)*$k,($hp-$y)*$k ));
        $this->_out(sprintf('%.2F %.2F l',($x+$r)*$k,($hp-$y)*$k ));
    }
    else
        $this->_Arc($xc - $r, $yc - $r*$MyArc, $xc - $r*$MyArc, $yc - $r, $xc, $yc - $r);
    $this->_out($op);
  }

  ///Función auxiliar para redondear los bordes de las tablas.
  ///Está sacada del script: Rounded Rectangle
  function _Arc($x1, $y1, $x2, $y2, $x3, $y3)
    {
    $h = $this->h;
    $this->_out(sprintf('%.2F %.2F %.2F %.2F %.2F %.2F c ', $x1*$this->k, ($h-$y1)*$this->k,
        $x2*$this->k, ($h-$y2)*$this->k, $x3*$this->k, ($h-$y3)*$this->k));
  }
  
  ///Función auxiliar que ajusta el tamaño de la imagen a los parámetros de ancho y alto pasados:
  function resizeToFit($imgFilename, $ancho, $alto) {
    $imageInfo = getimagesize($imgFilename);
    $salida = array();
    if ($imageInfo === FALSE){
      $salida[] = null;
      $salida[] = null;
    }
    else {
      $anchoImgPx = $imageInfo[0];
      $altoImgPx = $imageInfo[1];
      ///Convierto de px a mm (usando los DPI estipulados):
      $anchoImgMm = $anchoImgPx*self::MM_IN_INCH/self::DPI_300;
      $altoImgMm = $altoImgPx*self::MM_IN_INCH/self::DPI_300;

      $widthScale = $ancho / $anchoImgMm;
      $heightScale = $alto / $altoImgMm;
      $scale = min($widthScale, $heightScale);
      $salida[] = round($scale * $anchoImgMm);
      $salida[] = round($scale * $altoImgMm);
    }
    return $salida;       
  }  
    
  ///Función auxiliar usada para generar las marcas de agua:
  ///Sacada del script: PDF_Rotate
  function Rotate($angle,$x=-1,$y=-1)
    {
    if($x==-1)
        $x=$this->x;
    if($y==-1)
        $y=$this->y;
    if($this->angle!=0)
        $this->_out('Q');
    $this->angle=$angle;
    if($angle!=0)
      {
      $angle*=M_PI/180;
      $c=cos($angle);
      $s=sin($angle);
      $cx=$x*$this->k;
      $cy=($this->h-$y)*$this->k;
      $this->_out(sprintf('q %.5F %.5F %.5F %.5F %.2F %.2F cm 1 0 0 1 %.2F %.2F cm',$c,$s,-$s,$c,$cx,$cy,-$cx,-$cy));
    }
  }
  
  ///Función auxiliar para generar las marcas de agua:
  ///Sacada del script: PDF_Rotate
  function RotatedText($x,$y,$txt,$angle)
    {
    //Text rotated around its origin
    $this->Rotate($angle,$x,$y);
    $this->Text($x,$y,$txt);
    $this->Rotate(0);
  }

  ///Función auxiliar usada para generar las marcas de agua:
  ///Sacada del script: PDF_Rotate
  function _endpage()
    {
    if($this->angle!=0)
      {
      $this->angle=0;
      $this->_out('Q');
    }
    parent::_endpage();
  }  
    
}