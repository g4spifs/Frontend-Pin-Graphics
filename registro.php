<?php

// 1. Iniciar la sesión 
session_start();

// 2. Verificar que los datos lleguen por POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: registro.html');
    exit;
}

// 3. Conexión a la DB
$db_host = 'localhost';
$db_name = 'pin_graphics';
$db_user = 'root';
$db_pass = '';
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: ". $e->getMessage());
}

// 4. Recoger y limpiar datos
$nombre = $_POST['nombre'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$password_confirm = $_POST['password_confirm'] ?? '';

// 5. Validaciones
if (empty($nombre) || empty($email) || empty($password)) {
    header('Location: registro.html?error=3'); // Campos vacíos
    exit;
}
if ($password !== $password_confirm) {
    header('Location: registro.html?error=1'); // Contraseñas no coinciden
    exit;
}

// 6. Hashear la contraseña 
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 7. Insertar en la base de datos
try {
    $sql = "INSERT INTO clientes (nombre, email, password) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nombre, $email, $hashed_password]);

    //Redirigir a la página de ingreso con mensaje de éxito
    header('Location: login.html?exito=1');
    exit;

} catch (PDOException $e) {
    // Manejar error si el email ya existe (código de error 23000)
    if ($e->getCode() == 23000) {
        header('Location: registro.html?error=2'); // Email duplicado
    } else {
        // Otro error
        header('Location: registro.html?error=99' . $e->getMessage());
    }
    exit;
}
?>