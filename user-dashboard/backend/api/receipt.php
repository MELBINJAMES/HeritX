<?php
include __DIR__ . '/../../../admin/public/api/db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    die("Invalid Receipt ID");
}

// Fetch Payment Details
$stmt = $conn->prepare("
    SELECT p.*, u.name as user_name, u.email 
    FROM payments p 
    JOIN users u ON p.user_id = u.id 
    WHERE p.id = ?
");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$payment = $result->fetch_assoc();

if (!$payment) {
    die("Receipt not found");
}

// Format Date
$date = date("d F Y, h:i A", strtotime($payment['transaction_date']));
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt #<?php echo $payment['id']; ?> - HeritX</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f4f4f4; padding: 40px; }
        .receipt-container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; letter-spacing: 2px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; color: #777; font-size: 0.9em; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .label { font-size: 0.85em; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .value { font-size: 1.1em; font-weight: bold; color: #333; }
        .amount-box { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; border: 1px dashed #ddd; margin-bottom: 30px; }
        .amount-val { font-size: 2.5em; font-weight: bold; color: #1a1a1a; margin: 10px 0; }
        .status { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
        .paid { background: #dcfce7; color: #166534; }
        .refunded { background: #dbeafe; color: #1e40af; }
        .footer { text-align: center; font-size: 0.85em; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
        .print-btn { display: block; width: 100%; padding: 15px; background: #1a1a1a; color: white; border: none; border-radius: 8px; font-size: 1em; cursor: pointer; margin-top: 20px; transition: background 0.2s; }
        .print-btn:hover { background: #333; }
        @media print {
            body { background: white; padding: 0; }
            .receipt-container { box-shadow: none; padding: 0; }
            .print-btn { display: none; }
        }
    </style>
</head>
<body>

    <div class="receipt-container">
        <div class="header">
            <h1>HeritX Rentals</h1>
            <p>Payment Receipt</p>
        </div>

        <div class="info-grid">
            <div>
                <div class="label">Billed To</div>
                <div class="value"><?php echo htmlspecialchars($payment['user_name']); ?></div>
                <div style="font-size: 0.9em; color: #666;"><?php echo htmlspecialchars($payment['email']); ?></div>
            </div>
            <div style="text-align: right;">
                <div class="label">Receipt No</div>
                <div class="value">#TXN-<?php echo str_pad($payment['id'], 6, '0', STR_PAD_LEFT); ?></div>
                <div style="margin-top: 10px;">
                    <span class="status <?php echo strtolower($payment['status']); ?>">
                        <?php echo $payment['status']; ?>
                    </span>
                </div>
            </div>
        </div>

        <div class="amount-box">
            <div class="label">Total Amount Paid</div>
            <div class="amount-val">₹<?php echo number_format($payment['amount'], 2); ?></div>
            <div class="label">For: <?php echo ucfirst($payment['payment_type']); ?></div>
        </div>

        <div class="info-grid">
            <div>
                <div class="label">Transaction Date</div>
                <div class="value"><?php echo $date; ?></div>
            </div>
            <div style="text-align: right;">
                <div class="label">Payment Method</div>
                <div class="value">Online / Verified</div>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing HeritX. This is a computer-generated receipt.</p>
            <p>HeritX Rentals, Kerala - Support: help@heritx.com</p>
        </div>

        <button class="print-btn" onclick="downloadPDF()">Download PDF</button>

         <!-- Go Back Link -->
         <div style="text-align: center; margin-top: 15px;">
            <a href="javascript:window.close()" style="color: #666; text-decoration: none; font-size: 0.9em;">Close Window</a>
        </div>
    </div>

    <!-- html2pdf Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script>
        function downloadPDF() {
            const element = document.querySelector('.receipt-container');
            const opt = {
                margin:       10,
                filename:     'HeritX_Receipt_<?php echo $payment['id']; ?>.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Hide button before print
            const btn = document.querySelector('.print-btn');
            btn.style.display = 'none';

            html2pdf().set(opt).from(element).save().then(() => {
                // Show button again after print
                btn.style.display = 'block';
            });
        }
        
        // Auto-download on load (optional, but requested "will be a pdf file")
        // document.addEventListener('DOMContentLoaded', () => {
        //    downloadPDF();
        // });
    </script>
</body>
</html>
