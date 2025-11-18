<?php
session_start();

// Verificar que el usuario esté logueado
if (!isset($_SESSION['cliente_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// Verificar que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener datos JSON del body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
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
$numero_factura = $data['numero_factura'] ?? '';
$total = $data['total'] ?? 0;
$medio_pago = $data['medio_pago'] ?? '';
$productos = json_encode($data['productos'] ?? []);

try {
    // Insertar el pedido
    $sql = "INSERT INTO pedidos (cliente_id, numero_factura, total, medio_pago, estado, productos) 
            VALUES (?, ?, ?, ?, 'Completado', ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$cliente_id, $numero_factura, $total, $medio_pago, $productos]);
    
    $pedido_id = $pdo->lastInsertId();
    
    // Respuesta exitosa
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'pedido_id' => $pedido_id,
        'numero_factura' => $numero_factura
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar pedido: ' . $e->getMessage()]);
}
?>