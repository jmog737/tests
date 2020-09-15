<?php
if(!isset($_SESSION)) 
  { 
  session_start(); 
} 
/**
******************************************************
*  @file busquedas.php
*  @brief Formulario para ejecutar consultas.
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
    <?php require_once('header.php');
    if (isset($_SESSION['user_id'])) 
      {
      require_once("data/pdo.php");

      $consultarProductos = "select idprod, nombre_plastico as nombre from productos order by nombre_plastico asc";
      $stmt = $pdo->query($consultarProductos);
      
      $productos = array();
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        $productos[] = $row;
      }
      
      $consultarEntidades = "select distinct entidad from productos order by entidad asc, nombre_plastico asc";
      $stmt1 = $pdo->query($consultarEntidades);

      $entidades = array();
      while ($row = $stmt1->fetch(PDO::FETCH_ASSOC)){
        $entidades[] = $row['entidad'];
      }
      
      $consultarUsuarios = "select iduser, apellido, nombre from usuarios order by sector asc, apellido asc, nombre asc";
      $stmt2 = $pdo->query($consultarUsuarios);
      
      $usuarios = array();
      while (($fila = $stmt2->fetch(PDO::FETCH_ASSOC)) != NULL) { 
        $usuarios[] = $fila;
      }
      
    ?>
    <main>
      <div id='main-content' class='container-fluid'>
          <h2 id="titulo" class="encabezado">BÚSQUEDAS</h2>
          <h3>Seleccione el tipo de consulta a ejecutar.</h3>

          <div id='fila' class='row col-md-12 col-sm-12'>
          </div>
      </div>
    </main>
    <?php 
    }
    else {

    }        
    ?>      
    
    <?php require_once('footer.php');?>
  </body>
  
</html>