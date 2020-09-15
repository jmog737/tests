<?php
session_start();
unset($_SESSION['username']);
unset($_SESSION['user_id']);
session_destroy();
setcookie('tiempo', time(), time()-1);
header('Location: index.php');
?>  
