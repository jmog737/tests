<?php
if(!isset($_SESSION)) 
  {
  //Reanudamos la sesión:
  session_start(); 
}
/*!
  @file colores.php
  @brief Archivo que contiene las constantes predefinidas con los colores usados para generar los pdfs. \n
  @version v.1.0.
  @author Juan Martín Ortega
 */

//$testColor = array(255, 180, 203);
//$colorHexa = sprintf("#%02x%02x%02x", $testColor[0], $testColor[1], $testColor[2]);echo "testColor: $testColor<br>colorHexa: $colorHexa<br>";
///**************************************************** COLORES PDFs *************************************************************
///Color para la marca de agua:
define("colorMarcaAgua", array(255,180,203));
///Color para el título del Header:
define("colorTituloHeader", array(120, 200, 120));
///Color para el texto legal en el footer:
define("colorTextoLegal", array(234, 229, 227));

///Color Título de la tabla:
define("colorTituloTabla", array(2, 49, 136));

///Color Subtítulo:
define("colorSubtitulo", array(134, 144, 144));

///Borde redondeado intermedio:
define("colorBordeRedondeado", array(157, 176, 243));
define("colorCampos", array(157, 176, 243));
define("colorFondoRegistro", array(220, 223, 232));

///Colores para los comentarios:
define("colorComPlastico", array(234, 140, 160));
define("colorComStock", array(4, 255, 20));
define("colorComDiff", array(255, 255, 51));
define("colorComRegular", array(220, 223, 232));

///Colores para el stock:
define("colorStockAlarma1", array(255, 255, 51));
define("colorStockAlarma2", array(231, 56, 67));
define("colorStockRegular", array(113, 236, 113));

///Retiros, Renovaciones, Destrucciones, Consumos, Ingresos, AjusteRetiros, y AjusteIngresos:
define("colorRetiros", array(157, 176, 243));
define("colorRenos", array(157, 176, 243));
define("colorDestrucciones", array(157, 176, 243));
define("colorConsumos", array(75, 90, 243));
define("colorIngresos", array(39, 222, 93));
define("colorAjusteRetiros", array(162, 92, 243));
define("colorAjusteIngresos", array(255, 193, 104));

define("colorPromedio", array(249, 143, 8));

define("colorTotal", array(0, 255, 255));
///********************************************************** FIN COLORES PDFs **************************************************



///****************************************************** COLORES para las GRAFICAS *********************************************
$colorRetirosGrafica = array(17, 17, 204);
$colorRenosGrafica = array(240, 138, 29);
$colorDestruccionesGrafica = array(255, 7, 25);
$colorIngresosGrafica = array(25, 82, 46);
$colorAjusteRetirosGrafica = array(162, 92, 243);
$colorAjusteIngresosGrafica = array(255, 193, 104);
$colorPromedio = array(249, 143, 8);
$colorNombreEjeX = 'white';
$colorNombreEjeY = 'white';
$colorEjeX = 'white';
$colorEjeY = 'white';
$colorFrame = 'red';
$colorBordeRetiros = 'white';
$colorBordeIngresos = 'white';
$colorBordeRenos = 'white';
$colorBordeDestrucciones = 'white';
$colorBordeAjusteRetiros = 'white';
$colorBordeAjusteIngresos = 'white';

$colorTituloLeyenda = 'red';
$colorFondoTituloLeyenda1 = '#ac90d4';
$colorFondoTituloLeyenda2 = '#0ca0d4';

$colorShadowLeyenda = '#e2bd6e@1';
$colorFondoLeyenda = 'white';
$colorTextoLeyenda = 'blue';
$colorBordeLeyenda = 'white';

$colorLeyendaRetiros = '#023184:0.98';
$colorFondoLeyendaRetiros1 = 'navajowhite1';
$colorFondoLeyendaRetiros2 = 'white';

$colorLeyendaRenos = '#023184:0.98';
$colorFondoLeyendaRenos1 = 'navajowhite1';
$colorFondoLeyendaRenos2 = 'white';

$colorLeyendaDestrucciones = '#023184:0.98';
$colorFondoLeyendaDestrucciones1 = 'navajowhite1';
$colorFondoLeyendaDestrucciones2 = 'white';

$colorLeyendaIngresos = '#258246:0.98';
$colorFondoLeyendaIngresos1 = 'navajowhite1';
$colorFondoLeyendaIngresos2 = 'white';

$colorLeyendaAjusteRetiros = '#a25cf3:0.98';
$colorFondoLeyendaAjusteRetiros1 = 'navajowhite1';
$colorFondoLeyendaAjusteRetiros2 = 'white';

$colorLeyendaAjusteIngresos = '#a25cf3:0.98';
$colorFondoLeyendaAjusteIngresos1 = 'navajowhite1';
$colorFondoLeyendaAjusteIngresos2 = 'white';

$colorLeyendaConsumos = 'red:0.98';
$colorFondoLeyendaConsumos1 = 'navajowhite1';
$colorFondoLeyendaConsumos2 = 'white';

$colorGradiente1 = '#02bd6e';
$colorGradiente2 = '#023184:0.98';

///Colores para la gráfica tipo torta (cuando es por producto).
///El orden es: retiros, ingresos, renos, destrucciones, ajuste retiros y ajuste ingresos:
$coloresTorta = array('blue','forestgreen','#ff9600', 'red', '#a25cf3', '#ffc168');
$colorPorcentajes = 'blue';
$colorBackgroundTorta = 'ivory3';
$colorShadowLeyendaPie = '#e2bd6e@1';
$colorTituloLeyendaPie = 'red';
$colorFondoTituloLeyendaPie1 = '#b19dda';
$colorFondoTituloLeyendaPie2 = '#7c90d4';

///***************************************************** FIN COLORES para las GRAFICAS *******************************************



///************************************************************* COLORES EXCEL ***************************************************
///NOTA: SOLO ACEPTA EN FORMATO HEXA (Salvo en formato de números)
$colorTabStock = '023184';
$colorTabBoveda = '46A743';
$colorTabMovimientos = 'E02309';

$colorBordeTitulo = '023184';
$colorFondoTitulo = sprintf("%02x%02x%02x", colorSubtitulo[0], colorSubtitulo[1], colorSubtitulo[2]);
//$colorFondoTitulo = '4acba7';

$colorFondoCampos = 'AEE2FA';
$colorFondoTextoLegal = 'DFDFDF';

$colorTotal = 'ff0000';
$colorFondoTotal = 'f3FF00';

$colorStock = 'Blue';
$colorFondoStockRegular = 'A9FF96';
$colorFondoStockAlarma1 = 'FAFF98';
$colorFondoStockAlarma2 = 'F94A3F';
$colorStockBoveda = 'Black';
$colorFondoStockBoveda = 'DADADA';

$colorComRegular = 'd3d3d3';
$colorComDiff = 'ffff00';
$colorComStock = '38ff1d';
$colorComPlastico = 'FF9999';

$colorBordeRegular = '023184';
$colorFondoCamposResumen = 'b3a8ac';
$colorBordeResumen = '023184';
$colorCategorias = 'Blue';
$colorConsumos = 'ff0000';
$colorFondoConsumos = 'ffff99';
$colorIngresos = 'ff0000';
$colorFondoIngresos = 'cefdd5';
$colorFondoTotalesCategoria = '888888';
$colorTextoTotalResumen = 'Red';
$colorTextoTotalesCategoria = 'ff0000';
$colorTotalesCategoria = 'Red';
$colorConsumosTotal = 'ff0000';
$colorFondoTotalConsumos = 'feff00';
$colorIngresosTotal = 'ff0000';
$colorFondoTotalIngresos = '00ff11';
$colorFondoFecha = 'A9FF96';
$colorAjustesRetiros = 'ff0000';
$colorAjustesIngresos = 'ff0000';
$colorFondoAjustesRetiros = 'd5baf5';
$colorFondoAjustesIngresos = 'ffe5bf';
$colorAjustesRetirosTotal = 'ff0000';
$colorAjustesIngresosTotal = 'ff0000';
$colorFondoAjustesRetirosTotal = 'a25cf3';
$colorFondoAjustesIngresosTotal = 'ffc168';

///************************************************************ FIN COLORES EXCEL *************************************************

?>
