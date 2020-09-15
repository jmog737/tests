<?php
if(!isset($_SESSION)) 
  { 
  session_start(); 
} 
/**
******************************************************
*  @file moviemiento.php
*  @brief Form para agregar un movimiento.
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