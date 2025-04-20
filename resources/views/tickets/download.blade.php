<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Movie Ticket - {{ $reservation->screening->film->title }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .ticket-container {
            max-width: 800px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .ticket-header {
            background: linear-gradient(to right, #e31937, #b71c1c);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .ticket-logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .ticket-title {
            font-size: 28px;
            margin: 10px 0;
        }
        .ticket-body {
            padding: 20px;
        }
        .ticket-section {
            margin-bottom: 25px;
        }
        .ticket-section-title {
            font-size: 18px;
            font-weight: bold;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
            color: #b71c1c;
        }
        .ticket-detail {
            display: flex;
            margin-bottom: 8px;
        }
        .ticket-label {
            width: 140px;
            font-weight: bold;
        }
        .ticket-value {
            flex: 1;
        }
        .ticket-confirmation {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
        }
        .confirmation-code {
            font-size: 24px;
            font-weight: bold;
            color: #b71c1c;
            letter-spacing: 2px;
        }
        .ticket-footer {
            background-color: #f9f9f9;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .barcode {
            text-align: center;
            margin: 20px 0;
        }
        .barcode img {
            max-width: 90%;
            height: auto;
        }
        .print-button {
            display: block;
            margin: 20px auto;
            background: #b71c1c;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .print-button:hover {
            background: #e31937;
        }
        @media print {
            body {
                background-color: white;
            }
            .ticket-container {
                box-shadow: none;
                margin: 0;
                max-width: 100%;
            }
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <div class="ticket-header">
            <div class="ticket-logo">CINEVERSE</div>
            <h1 class="ticket-title">{{ $reservation->screening->film->title }}</h1>
        </div>

        <div class="ticket-body">
            <div class="ticket-confirmation">
                <div>Confirmation Code</div>
                <div class="confirmation-code">{{ $reservation->confirmation_code }}</div>
            </div>

            <div class="ticket-section">
                <div class="ticket-section-title">Screening Details</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Date:</div>
                    <div class="ticket-value">{{ \Carbon\Carbon::parse($reservation->screening->start_time)->format('l, F j, Y') }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Time:</div>
                    <div class="ticket-value">{{ \Carbon\Carbon::parse($reservation->screening->start_time)->format('g:i A') }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Room:</div>
                    <div class="ticket-value">{{ $reservation->screening->room }}</div>
                </div>
            </div>

            <div class="ticket-section">
                <div class="ticket-section-title">Seat Information</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Seats:</div>
                    <div class="ticket-value">{{ $seatsList }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Number of Seats:</div>
                    <div class="ticket-value">{{ count($reservation->seats) }}</div>
                </div>
            </div>

            <div class="ticket-section">
                <div class="ticket-section-title">Price Information</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Price per Seat:</div>
                    <div class="ticket-value">${{ number_format($reservation->screening->price, 2) }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Total Amount:</div>
                    <div class="ticket-value">${{ number_format(count($reservation->seats) * $reservation->screening->price, 2) }}</div>
                </div>
            </div>

            @if($reservation->guest_name || $reservation->user_id)
            <div class="ticket-section">
                <div class="ticket-section-title">Customer Information</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Name:</div>
                    <div class="ticket-value">{{ $reservation->guest_name ?? 'Registered User' }}</div>
                </div>
                @if($reservation->guest_email)
                <div class="ticket-detail">
                    <div class="ticket-label">Email:</div>
                    <div class="ticket-value">{{ $reservation->guest_email }}</div>
                </div>
                @endif
                @if($reservation->guest_phone)
                <div class="ticket-detail">
                    <div class="ticket-label">Phone:</div>
                    <div class="ticket-value">{{ $reservation->guest_phone }}</div>
                </div>
                @endif
            </div>
            @endif

            <div class="barcode">
                <img src="data:image/png;base64,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" alt="Barcode">
            </div>
        </div>

        <div class="ticket-footer">
            <p>This ticket is your admission pass. Please present this ticket at the entrance.</p>
            <p>© {{ date('Y') }} CineVerse. All rights reserved.</p>
        </div>
    </div>

    <button class="print-button" onclick="window.print()">Print Ticket</button>
</body>
</html>
