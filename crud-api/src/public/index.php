<?php

$uriPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicRoot = realpath(__DIR__);
$requestedFile = $uriPath !== null ? realpath($publicRoot . $uriPath) : false;

$isSafeStaticFile = $uriPath !== '/'
    && $requestedFile !== false
    && $publicRoot !== false
    && str_starts_with($requestedFile, $publicRoot . DIRECTORY_SEPARATOR)
    && is_file($requestedFile);

if ($isSafeStaticFile) {
    return false; // php -S serve o arquivo estático diretamente
}

require_once __DIR__ . '/../config/config.php';
// require_once __DIR__ . '/openapi.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

in_array($origin, $allowedOrigins) ?
    header("Access-Control-Allow-Origin: $origin") : null;
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = strtok($_SERVER['REQUEST_URI'], '?');

match ($uri) {
    '/api/users' => require __DIR__ . '/../src/api.php',
    default => notFound(),
};

function notFound(): void
{
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}