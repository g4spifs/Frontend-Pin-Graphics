<?php

// 1. Iniciar la sesión
session_start();

// 2. Verificar que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.html');
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
    header('Location: login.html?error=2');
    exit;
}

// 4. Obtener datos del formulario
$email_or_username = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Validar que no estén vacíos
if (empty($email_or_username) || empty($password)) {
    header('Location: login.html?error=1');
    exit;
}

$login_exitoso = false;

// 5. Buscar en la tabla de ADMINS (usuarios)
try {
    $sql = "SELECT * FROM usuarios WHERE username = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email_or_username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si encontramos un admin y la contraseña es correcta
    if ($admin && password_verify($password, $admin['password'])) {
        // Login como ADMIN
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $admin['username'];
        
        // Redirigir al panel de admin
        header('Location: admin.php');
        exit;
    }

} catch (PDOException $e) {
    // Error en la consulta de admin, pero seguimos intentando con cliente
}

// 6. Buscar en la tabla de CLIENTES
try {
    $sql = "SELECT * FROM clientes WHERE email = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email_or_username]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si encontramos un cliente y la contraseña es correcta
    if ($cliente && password_verify($password, $cliente['password'])) {
        // Login como CLIENTE
        $_SESSION['cliente_id'] = $cliente['id'];
        $_SESSION['cliente_nombre'] = $cliente['nombre'];
        
        // Redirigir a la página principal
        header('Location: index.html');
        exit;
    }

} catch (PDOException $e) {
    header('Location: login.html?error=2');
    exit;
}

// 7. Si llegamos aquí, es porque no se encontró ni admin ni cliente
// O la contraseña es incorrecta
header('Location: login.html?error=1');
exit;

?>