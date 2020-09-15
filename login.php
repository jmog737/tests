<?php
session_start();
require_once "data/pdo.php";
require_once "data/util.php";

/*if(!isset($_SESSION)) 
  { 
  session_start(); 
}*/ 
unset($_SESSION['username']);
unset($_SESSION['user_id']);

if (isset($_POST['cancel'])) {
  // Redirect the browser to index.php
  header("Location: index.php");
  return;
}

if ( isset($_POST["usuario"]) && isset($_POST["pwd"]) ) {
  try {
    $userDB = trim($_POST['usuario']);
    $pwDB = trim($_POST['pwd']);
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=controlstock;charset=utf8','conectar', 'conectar');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
      $_SESSION['error'] = "¡Error!: ".$e->getMessage();
      return;
  }
  
  $sql = "SELECT COUNT(*) FROM appusers WHERE user = '$userDB'";
  $resultado = $pdo->query($sql);
  if ($resultado !== false) {
    /* Comprobar el número de filas que coinciden con la sentencia SELECT */
    if ($resultado->fetchColumn() > 0) {
      $stmt = $pdo->query("SELECT id_usuario, user, password, historialGeneral, historialProducto, tamPagina, limiteSelects FROM appusers WHERE user = '$userDB'");
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      
      if ($row['password'] === sha1($pwDB)){
        $_SESSION['tiempo'] = time();
        //Si el usuario existe, seteo las variables de sesión y cookies (user_id y username), y lo redirijo a la página principal:
        $_SESSION['user_id'] = $row['id_usuario'];
        $_SESSION['username'] = $row['user'];
        ///Recupero los parámetros del usuario:
        if (($row['historialGeneral'] !== '')&&($row['historialGeneral'] !== null)){
          $_SESSION["limiteHistorialGeneral"] = $row['historialGeneral'];
        }
        if (($row['historialProducto'] !== '')&&($row['historialProducto'] !== null)){
          $_SESSION["limiteHistorialProducto"] = $row['historialProducto'];
        }
        if (($row['tamPagina'] !== '')&&($row['tamPagina'] !== null)){
          $_SESSION["tamPagina"] = $row['tamPagina'];
        }
        if (($row['limiteSelects'] !== '')&&($row['limiteSelects'] !== null)){
          $_SESSION["limiteSelects"] = $row['limiteSelects'];
        }
        require_once('data/config.php');
        setcookie('tiempo', time(), time()+TIEMPOCOOKIE);
        $_SESSION["success"] = "- Bienvenid@ ".strtoupper($row['user'])." -";
        header( 'Location: index.php' ) ;
        return;
      }
      /* Hay usuarios coincidentes, pero no con esa contraseña */
      else {
        $_SESSION['error'] = "Lo siento <font class='usuarioIndex'>".strtoupper($userDB)."</font>, la contraseña ingresada no es correcta.<br>";
        header('Location: login.php');
        return;
      }     
    }
    /* No coincide ningua fila; no hay usuarios */
    else {
      $_SESSION['error'] = "Lo siento, <font class='usuarioIndex'>".strtoupper($userDB)."</font> NO está habilitado para ingresar al programa.<br>";
      header('Location: login.php');
      return;
    }
  }
}
else {
  if (isset($_SESSION['user_id'])) 
    {
    header('Location: index.php');
    return;
  }
}

// Fall through into the View
?>

<!DOCTYPE html>
<html>

<?php	
$title = "INGRESO - STOCK";	
require_once ('head.php');
?>
  <body>
		<?php
		require_once ('header.php');
		?>
		<main>
			<div class="container">
			<h1>Por favor, ingrese al sistema</h1>

			<?php flashMessages(); ?>

			<form method="POST" action="login.php">
				<label for="usuario">Usuario:</label>
				<input type="text" name="usuario" id="usuario" class="agrandar"><br/>
				
				<label for="pwd">Password:</label>
				<input type="password" name="pwd" id="pwd" class="agrandar"><br/>
				
				<div class="text-center">
					<input type="submit" onclick="return doValidate();" value="Ingresar" class="btn btn-success">
					<input type="submit" name="cancel" value="Cancelar" class="btn btn-danger">
				</div>
			</form>


			<script>
				function doValidate() {
					console.log('Validating...');
					try {
							user = document.getElementById('usuario').value;
							pw = document.getElementById('pwd').value;
							console.log("Validating addr="+user+" pw="+pw);
							if (user == null || user == "" || pw == null || pw == "") {
								alert("Se deben completar ambos campos.");
								return false;
							}
							return true;
					} catch(e) {
							return false;
					}
					return false;
				}
			</script>

			</div>
		</main>
		<?php
		require_once ('footer.php');
		?>
	</body>
</html>