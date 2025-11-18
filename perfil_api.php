<?php
session_start();

// Verificar que el usuario esté logueado
if (!isset($_SESSION['cliente_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$db_host = 'localhost';
$db_name = 'pin_graphics';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$cliente_id = $_SESSION['cliente_id'];

// Obtener datos del cliente
$stmt = $pdo->prepare("SELECT id, nombre, email, foto_perfil, created_at FROM clientes WHERE id = ?");
$stmt->execute([$cliente_id]);
$cliente = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$cliente) {
    http_response_code(404);
    echo json_encode(['error' => 'Cliente no encontrado']);
    exit;
}

// Obtener pedidos del cliente
$stmt = $pdo->prepare("
    SELECT id, numero_factura, fecha, total, medio_pago, estado 
    FROM pedidos 
    WHERE cliente_id = ? 
    ORDER BY fecha DESC 
    LIMIT 10
");
$stmt->execute([$cliente_id]);
$pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calcular estadísticas
$stmt = $pdo->prepare("SELECT COUNT(*) as total_pedidos, COALESCE(SUM(total), 0) as total_gastado FROM pedidos WHERE cliente_id = ?");
$stmt->execute([$cliente_id]);
$stats = $stmt->fetch(PDO::FETCH_ASSOC);

// Preparar respuesta
$respuesta = [
    'cliente' => $cliente,
    'pedidos' => $pedidos,
    'stats' => $stats
];

header('Content-Type: application/json');
echo json_encode($respuesta);
?>