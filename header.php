<!--<header class="fixed-top">-->
<header>
	<div class="container-fluid" id="header-div">
		<div class="row" id="contenedor">
			<div id="logo" class="col-2">
				<!-- <a href='index.php' title="Ir al Inicio"> -->
					<img src="images/logo-emsa.png" alt="Company Logo">
				<!-- </a> -->
			</div>
			<div id="titulo" class="col">
				<!-- <a href='index.php' title="Ir al Inicio"><h1>STOCK MANAGEMENT</h1></a> -->
				<h1>STOCK MANAGEMENT</h1>
			</div>
		</div>		
 </div>
</header>	

<?php
	if (isset($_SESSION['user_id'])) 
		{
?>
		<nav> 
			<ul class="nav nav-pills nav-justified">
				<li class="nav-item">
					<a class="nav-link <?= $home ?>" href="index.php">HOME</a>
				</li>
				<li class="nav-item">
					<a class="nav-link <?= $addMovement ?>" href="addMovement.php">Agregar</a>
				</li>
				<li class="nav-item">
					<a class="nav-link <?= $find ?>" href="buscar.php">Buscar</a>
				</li>
				<li class="nav-item">
					<a class="nav-link <?= $stats ?>" href="estadisticas.php">Estad&iacute;sticas</a>
				</li>
			</ul>
		</nav><!-- #header-nav -->	
	<?php
	}
	else {
	?>  

	<?php
	}
	?>  
		
	
<!--<script lang="javasript/text">
    var dir = window.location.pathname;
    var temp = dir.split("/");
    var tam = temp.length;
    var pagina = temp[tam-1];
    if (pagina !== 'index.php'){
      verificarSesion('', 's');
      var duracion0 = <?php echo DURACION ?>;
      /// Se agrega un tiempo extra cosa de estar seguro que venció el tiempo (si queda en el límite habrá veces 
      ///que lo detecta y otras que no teniendo que esperar nuevamente un tiempo de DURACION para volver a probar
      var tiempoChequeo = parseInt(duracion0*1000, 10)+2000;
      
      setInterval(function(){
        verificarSesion('¡Llamé desde setInterval!', 'n');
      }, tiempoChequeo);
    }
  </script>-->




