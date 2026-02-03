<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "Heritx";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Starting migration...\n";

    // Add columns if they don't exist
    $cols = ["dos", "donts"];
    foreach ($cols as $col) {
        $check = $conn->query("SHOW COLUMNS FROM items LIKE '$col'");
        if ($check->rowCount() == 0) {
            $conn->exec("ALTER TABLE items ADD COLUMN $col TEXT");
            echo "Added column: $col\n";
        } else {
            echo "Column $col already exists.\n";
        }
    }

    // Update existing items with some sample Do's and Don'ts
    $updates = [
        ['id' => 1, 'dos' => "Hang in a dry place\nDust regularly with a soft cloth", 'donts' => "Do not expose to direct sunlight for long\nDo not wash with water"],
        ['id' => 2, 'dos' => "Dry clean only\nStore in a cool dry place", 'donts' => "Do not machine wash\nDo not use bleach"],
        ['id' => 3, 'dos' => "Clean with Pitambari or tamarind\nUse good quality oil", 'donts' => "Do not drop\nDo not leave soot uncleaned"],
        ['id' => 4, 'dos' => "Handle with extreme care\nStore in a trunk with silica gel", 'donts' => "Do not fold the headgear\nDo not wash at home"],
    ];

    foreach ($updates as $upd) {
        $stmt = $conn->prepare("UPDATE items SET dos = :dos, donts = :donts WHERE id = :id");
        $stmt->execute($upd);
        echo "Updated item ID: " . $upd['id'] . "\n";
    }

    echo "Migration completed successfully!\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn = null;
?>
