<?php
require_once "pdo.php";
require_once "util.php";

session_start();

if (!isset($_SESSION['user_id'])) {
  die("ACCESS DENIED.");
  return;
}

// If the user requested logout go back to index.php
if (isset($_POST['cancel'])) {
  header('Location: index.php');
  return;
}

// Guardian: Make sure that profile_id is present
if (!isset($_REQUEST['profile_id'])) {
  $_SESSION['error'] = "Missing profile_id";
  header('Location: index.php');
  return;
}

$stmt = $pdo->prepare("SELECT * FROM profile where profile_id = :xyz and user_id = :uid");
$stmt->execute(array(":xyz" => $_REQUEST['profile_id'], ":uid" => $_SESSION['user_id']));
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ( $row === false ) {
  $_SESSION['error'] = 'Could not load profile.';
  header( 'Location: index.php' ) ;
  return;
} else {
  $fn = htmlentities($row['first_name']);
  $ln = htmlentities($row['last_name']);
  $em = htmlentities($row['email']);
  $hl = htmlentities($row['headline']);
  $sm = htmlentities($row['summary']);
  $profile_id = $row['profile_id'];
}

//Input data validation and SQL insert if everything is OK
if ((isset($_POST['first_name']) && isset($_POST['last_name']) && isset($_POST['email']) && isset($_POST['headline']) && isset($_POST['summary']))) {
  
  $mensaje = validateProfile();
  if (is_string($mensaje)) {
    $_SESSION['error'] = $mensaje;
    header("Location: edit.php?profile_id=".$_REQUEST['profile_id']);
    return; 
  }

  $mensaje = validatePosition();
  if (is_string($mensaje)) {
    $_SESSION['error'] = $mensaje;
    header("Location: edit.php?profile_id=".$_REQUEST['profile_id']);
    return; 
  }

  $sqlProfile = "UPDATE profile SET first_name = :fn,
  last_name = :ln, email = :em, headline = :hl, summary = :sm  
  WHERE profile_id = :pid and user_id = :uid";
  $stmt = $pdo->prepare($sqlProfile);
  $stmt->execute(array(
      ':fn' => $_POST['first_name'],
      ':ln' => $_POST['last_name'],
      ':em' => $_POST['email'],
      ':hl' => $_POST['headline'],
      ':sm' => $_POST['summary'],
      ':pid' => $_POST['profile_id'], 
      ':uid' => $_SESSION['user_id']));
  
  //Borro las posiciones correspondientes a ese profile que haya
  $sqlBorrar = "DELETE from position where profile_id = :pid";
  $stmt = $pdo->prepare($sqlBorrar);
  $stmt->execute(array(':pid' => $_REQUEST['profile_id']));

  $ranking = 1;
  for ($i=1; $i<=9; $i++) {
    if (!isset($_POST['year'.$i])) continue;
    if (!isset($_POST['desc'.$i])) continue;
    $year = $_POST['year'.$i];
    $desc = $_POST['desc'.$i];
    $sqlPosition = "INSERT INTO position (profile_id, ranking, year, description) 
            VALUES (:pid, :rk, :yr, :dc)";
    $stmt = $pdo->prepare($sqlPosition);
    $stmt->execute(array(
        ':pid' => $profile_id,
        ':rk' => $ranking,
        ':yr' => $year,
        ':dc' => $desc)
    );
    $ranking++;
  }

  $_SESSION['success'] = 'Profile updated';
  header( 'Location: index.php' ) ;
  return;              
}
   
if ($row['user_id'] != $_SESSION['user_id']){
  $_SESSION['error'] = 'This user has no the rights to perform this action.';
  header( 'Location: index.php' ) ;
  return;
}

$positions = loadPositions($pdo, $_REQUEST['profile_id']);
   
?>

<!DOCTYPE html>
<html>

<head>
  <?php require_once "jquery_bootstrap.php"; ?>
  <title>Juan Martin Ortega's Profile Edit</title>
  <meta charset="utf-8">
</head>

<body>
  <div class="container">

    <h1>Editing Profile for <?= $_SESSION['name'] ?></h1>

    <?php flashMessages(); ?>

    <form method="post" action="edit.php">
      <label for="fn">First Name:</label>
      <input type="text" name="first_name" id="fn" value="<?= $fn ?>" size="60"><br>
      <label for="ln">Last Name:</label>
      <input type="text" name="last_name" id="ln" value="<?= $ln ?>" size="60"><br>
      <label for="em">Email:</label>
      <input type="text" name="email" id="em" value="<?= $em ?>" size="30"><br>
      <label for="hl">Headline:</label><br>
      <input type="text" name="headline" id="hl" value="<?= $hl ?>" size="80"><br>
      <label for="sm">Summary:</label><br>
      <textarea name="summary" id="summary" rows="8" cols="80"><?= $sm ?></textarea><br>
      <input type="hidden" name="profile_id" value="<?= $profile_id ?>">

      <label for="addPos">Position:</label>
      <input type="submit" name="addPos" id="addPos" value="+"><br>
      <div id="position_fields">
        <?php
        foreach ($positions as $j => $row) {
          $i = $j + 1;
          echo '<div id="position'.$i.'">
                  <label for="year'.$i.'">Year:</label><br>
                  <input type="text" name="year'.$i.'" value="'.htmlentities($row["year"]).'"><input type="button" value="-" onclick="$(\'#position'.$i.'\').remove();return false;"><br>
                  <label for="desc'.$i.'">Description:</label><br>
                  <textarea name="desc'.$i.'" rows="8" cols="80">'.htmlentities($row["description"]).'</textarea><br>
                </div>';
        }
        ?>
      </div>

      <input type="submit" value="Save"/>
      <input type="submit" name="cancel" value="Cancel"/>
    </form> 

    <script type="text/javascript">
      countPos = <?= count($positions);?>;
      $(document).ready(function(){
        window.console && console.log('Document ready called');
        $("#addPos").click(function(event){
          event.preventDefault();
        if (countPos >= 9) {
          alert('Maximun of 9 position entries exceeded!');
          return;
        }
        countPos++;
        window.console && console.log('Adding position '+countPos);
        $("#position_fields").append(
          '<div id="position'+countPos+'"><label for="year'+countPos+'">Year:</label><br><input type="text" name="year'+countPos+'" value=""><input type="button" value="-" onclick="$(\'#position'+countPos+'\').remove();return false;"><br><label for="desc'+countPos+'">Description:</label><br><textarea name="desc'+countPos+'" rows="8" cols="80"></textarea><br></div>');
        })     
      });
    </script> 
   
  </div>
</body>
</html>