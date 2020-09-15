<?php
if(!isset($_SESSION)) 
  { 
  session_start(); 
} 
/**
******************************************************
*  @file producto.php
*  @brief Form para agregar/editar un producto.
*  @author Juan Martín Ortega
*  @version 1.0
*  @date Setiembre 2017
*
*******************************************************/
?>
<!DOCTYPE html>
<html>
  <?php require_once('head.php');?>
  
  <body>
    <?php require('header.php');
    if (isset($_SESSION['user_id'])) 
      {
    ?>
    <main>
      <div id='main-content' class='container-fluid'>
        <h2 id="titulo" class="encabezado">PRODUCTOS</h2>
        <div id='fila' class='row'>

          <div id='selector' class='col-md-6 col-sm-12'></div>
          <div id='content' class='col-md-6 col-sm-12'></div>
        </div>
      </div>
    </main>
    <?php 
    }
    else {

    }        
    ?>  
      
    <?php require('footer.php');?>
  </body>
  
</html>