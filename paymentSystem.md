saya ingin buatkan dengan landing pages seperti traveloka dengan room list dan lainnya

jadi saya sudah membuat backend menggunakan golang api, sekarang saya mau membuat front end dari api itu untuk tenant, buatkan dengan react chakra UI jsx, buatkan dengan rapih dan configurasi agar dapat dijalankan dengan laravel, kita tidak perlu implementasi dari backend laravel buatkan untuk register dapat memilih koordinat dengan react leaflet
buatkan front end dengan centralized API jadi jika sewaktu waktu api berubah maka tinggal ubah api itu contoh
http://localhost:8001

ini http://localhost:8001 dilakukan centralized agar gampang diubah atau di atur satu ini berdapampak semua

Rusunawa API Documentation
This document provides a comprehensive guide to the Rusunawa (dormitory management) API, covering the complete flow for tenants and administrators.

Table of Contents
Tenant Flow
Authentication
Profile Management
Room Management
Booking Management
Payment System
Document Management
Issue Reporting

Tenant Flow
Tenant Authentication
1. Register
Endpoint: POST /v1/tenant/auth/register

Description: Register a new tenant

Request:
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe",
  "gender": "L",
  "phone": "08123456789",
  "address": "Jl. Student No. 123",
  "home_latitude": -6.193125,
  "home_longitude": 106.821810,
  "nim": "12345678",
  "type_id": 1
}

response
{
  "tenant": {
    "tenant_id": 123,
    "user_id": 456,
    "type_id": 1,
    "gender": "L",
    "phone": "08123456789",
    "address": "Jl. Student No. 123",
    "nim": "12345678",
    "home_latitude": -6.193125,
    "home_longitude": 106.821810,
    "distance_to_campus": 2.5,
    "created_at": "2023-07-15T10:30:00Z",
    "updated_at": "2023-07-15T10:30:00Z",
    "user": {
      "user_id": 456,
      "role_id": 3,
      "full_name": "John Doe",
      "email": "student@example.com",
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z",
      "role": {
        "role_id": 3,
        "name": "tenant"
      }
    },
    "tenant_type": {
      "type_id": 1,
      "name": "mahasiswa"
    }
  },
  "status": {
    "status": "success",
    "message": "Registration successful. Please verify your email."
  }
}
2. Verify Email
Endpoint: POST /v1/tenant/auth/verify-email

Description: Verify tenant's email address using token sent to their email

Request:
{
  "token": "ABCDEF123456"
}
response
{
  "status": "success",
  "message": "Email verified successfully. You can now log in."
}
3. Resend Verification Email
Endpoint: POST /v1/tenant/auth/resend-verification

Description: Resend verification email if not received or expired

Request:
{
  "email": "student@example.com"
}
response
{
  "status": "success",
  "message": "Verification email has been resent. Please check your inbox."
}
4. Login
Endpoint: POST /v1/tenant/auth/login

Description: Authenticate tenant and get access token

Request:

{
  "email": "student@example.com",
  "password": "password123"
}
response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant": {
    "tenant_id": 123,
    "user_id": 456,
    "type_id": 1,
    "gender": "L",
    "phone": "08123456789",
    "address": "Jl. Student No. 123",
    "nim": "12345678",
    "home_latitude": -6.193125,
    "home_longitude": 106.821810,
    "distance_to_campus": 2.5,
    "created_at": "2023-07-15T10:30:00Z",
    "updated_at": "2023-07-15T10:30:00Z",
    "user": {
      "user_id": 456,
      "role_id": 3,
      "full_name": "John Doe",
      "email": "student@example.com"
    },
    "tenant_type": {
      "type_id": 1, 
      "name": "mahasiswa"
    }
  },
  "status": {
    "status": "success",
    "message": "Login successful"
  }
}
1. Get Tenant Profile
Endpoint: GET /v1/tenants/{tenant_id}

Description: Retrieve tenant profile information

Response:
{
  "tenant": {
    "tenant_id": 123,
    "user_id": 456,
    "type_id": 1,
    "gender": "L",
    "phone": "08123456789",
    "address": "Jl. Student No. 123",
    "nim": "12345678",
    "home_latitude": -6.193125,
    "home_longitude": 106.821810,
    "distance_to_campus": 2.5,
    "created_at": "2023-07-15T10:30:00Z",
    "updated_at": "2023-07-15T10:30:00Z",
    "user": {
      "user_id": 456,
      "role_id": 3,
      "full_name": "John Doe",
      "email": "student@example.com",
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z"
    },
    "tenant_type": {
      "type_id": 1,
      "name": "mahasiswa"
    }
  },
  "status": {
    "status": "success",
    "message": "Tenant retrieved successfully"
  }
}
2. Update Tenant Profile
Endpoint: PUT /v1/tenants/{tenant_id}

Description: Update tenant profile information

Request:
{
  "full_name": "John Smith Doe",
  "email": "student@example.com",
  "phone": "08123456789",
  "address": "Jl. Student No. 456",
  "gender": "L",
  "type_id": 1
}
response
{
  "tenant": {
    "tenant_id": 123,
    "user_id": 456,
    "type_id": 1,
    "gender": "L",
    "phone": "08123456789",
    "address": "Jl. Student No. 456",
    "nim": "12345678",
    "home_latitude": -6.193125,
    "home_longitude": 106.821810,
    "distance_to_campus": 2.5,
    "created_at": "2023-07-15T10:30:00Z",
    "updated_at": "2023-07-15T11:45:00Z",
    "user": {
      "user_id": 456,
      "role_id": 3,
      "full_name": "John Smith Doe",
      "email": "student@example.com"
    },
    "tenant_type": {
      "type_id": 1,
      "name": "mahasiswa"
    }
  },
  "status": {
    "status": "success",
    "message": "Tenant updated successfully"
  }
}
3. Update Tenant Location
Endpoint: PUT /v1/tenants/{tenant_id}/location

Description: Update tenant home location coordinates

Request:
{
  "home_latitude": -6.195125,
  "home_longitude": 106.823810
}
response
{
  "tenant": {
    "tenant_id": 123,
    "home_latitude": -6.195125,
    "home_longitude": 106.823810,
    "distance_to_campus": 2.7
  },
  "status": {
    "status": "success",
    "message": "Tenant location updated successfully"
  }
}
4. Update Student ID (NIM)
Endpoint: PUT /v1/tenants/{tenant_id}/nim

Description: Update tenant student ID number

Request:
{
  "nim": "87654321"
}
response
{
  "tenant": {
    "tenant_id": 123,
    "nim": "87654321",
    "updated_at": "2023-07-15T12:30:00Z"
  },
  "status": {
    "status": "success",
    "message": "Student ID updated successfully"
  }
}
Room Management
1. Get All Rooms
Endpoint: GET /v1/rooms

Description: Get list of available rooms with filtering options

Parameters:

classification: Room classification (e.g., "perempuan", "laki_laki", "VIP")
rental_type: Rental type (e.g., "harian", "bulanan")
page: Page number for pagination
limit: Number of items per page
Response:
{
  "rooms": [
    {
      "room_id": 1,
      "name": "Room A101",
      "classification_id": 1,
      "rental_type_id": 2,
      "rate_id": 5,
      "rate": 750000,
      "capacity": 2,
      "description": "Comfortable room with two beds",
      "created_at": "2023-01-15T10:00:00Z",
      "updated_at": "2023-01-15T10:00:00Z",
      "classification": {
        "classification_id": 1,
        "name": "laki_laki"
      },
      "rental_type": {
        "rental_type_id": 2,
        "name": "bulanan"
      },
      "amenities": [
        {
          "room_id": 1,
          "feature_id": 3,
          "quantity": 2,
          "feature": {
            "feature_id": 3,
            "name": "Single Bed",
            "description": "Standard single bed"
          }
        },
        {
          "room_id": 1,
          "feature_id": 5,
          "quantity": 1,
          "feature": {
            "feature_id": 5,
            "name": "Study Desk",
            "description": "Wooden study desk"
          }
        }
      ]
    }
  ],
  "total_count": 56,
  "status": {
    "status": "success",
    "message": "Rooms retrieved successfully"
  }
}
2. Get Room by ID
Endpoint: GET /v1/rooms/{room_id}

Description: Get details of a specific room

Response:
{
  "room": {
    "room_id": 1,
    "name": "Room A101",
    "classification_id": 1,
    "rental_type_id": 2,
    "rate_id": 5,
    "rate": 750000,
    "capacity": 2,
    "description": "Comfortable room with two beds",
    "created_at": "2023-01-15T10:00:00Z",
    "updated_at": "2023-01-15T10:00:00Z",
    "classification": {
      "classification_id": 1,
      "name": "laki_laki"
    },
    "rental_type": {
      "rental_type_id": 2,
      "name": "bulanan"
    },
    "amenities": [
      {
        "room_id": 1,
        "feature_id": 3,
        "quantity": 2,
        "feature": {
          "feature_id": 3,
          "name": "Single Bed",
          "description": "Standard single bed"
        }
      },
      {
        "room_id": 1,
        "feature_id": 5,
        "quantity": 1,
        "feature": {
          "feature_id": 5,
          "name": "Study Desk",
          "description": "Wooden study desk"
        }
      }
    ],
    "occupants": [
      {
        "booking_id": 301,
        "tenant_id": 42,
        "name": "Ahmad Rizal",
        "email": "ahmad@example.com",
        "gender": "L",
        "check_in": "2023-07-01T08:00:00Z",
        "check_out": "2023-08-01T12:00:00Z",
        "status": "approved",
        "payment_status": "paid"
      }
    ]
  },
  "status": {
    "status": "success",
    "message": "Room retrieved successfully"
  }
}
3. Get Rooms by Gender
Endpoint: GET /v1/rooms/by-gender/{gender}

Description: Get list of rooms filtered by gender (L/P)

Parameters:

gender: "L" for male, "P" for female
classification: (optional) Additional room classification
rental_type: (optional) Rental type (e.g., "harian", "bulanan")
page: Page number for pagination
limit: Number of items per page
Response: Similar to Get All Rooms, but filtered by gender.

4. Get Rooms by Student Type
Endpoint: GET /v1/rooms/by-student-type/{tenant_type}

Description: Get list of rooms filtered by tenant type

Parameters:

tenant_type: "mahasiswa" or "non_mahasiswa"
rental_type: (optional) Rental type
page: Page number for pagination
limit: Number of items per page
Response: Similar to Get All Rooms, but filtered by tenant type.
1. Create a Booking
Endpoint: POST /v1/bookings

Description: Create a new room booking

Request:
{
  "tenant_id": 123,
  "room_id": 1,
  "check_in_date": "2023-08-10T14:00:00Z",
  "check_out_date": "2023-09-10T12:00:00Z"
}
response
{
  "booking": {
    "booking_id": 501,
    "tenant_id": 123,
    "room_id": 1,
    "check_in_date": "2023-08-10T14:00:00Z",
    "check_out_date": "2023-09-10T12:00:00Z",
    "total_amount": 750000,
    "status": "pending",
    "created_at": "2023-07-15T14:30:00Z",
    "updated_at": "2023-07-15T14:30:00Z",
    "payment_status": "unpaid",
    "room": {
      "room_id": 1,
      "name": "Room A101",
      "classification": {
        "classification_id": 1,
        "name": "laki_laki"
      },
      "rental_type": {
        "rental_type_id": 2,
        "name": "bulanan"
      },
      "rate": 750000
    },
    "tenant": {
      "tenant_id": 123,
      "user": {
        "full_name": "John Doe",
        "email": "student@example.com"
      }
    }
  },
  "status": {
    "status": "success",
    "message": "Booking created successfully. Please complete the payment."
  }
}
2. Get Tenant Bookings
Endpoint: GET /v1/tenants/{tenant_id}/bookings

Description: Get bookings made by a specific tenant

Parameters:

status: (optional) Filter by booking status
page: Page number for pagination
limit: Number of items per page
Response:
{
  "bookings": [
    {
      "booking_id": 501,
      "tenant_id": 123,
      "room_id": 1,
      "check_in_date": "2023-08-10T14:00:00Z",
      "check_out_date": "2023-09-10T12:00:00Z",
      "total_amount": 750000,
      "status": "pending",
      "created_at": "2023-07-15T14:30:00Z",
      "updated_at": "2023-07-15T14:30:00Z",
      "payment_status": "unpaid",
      "room": {
        "room_id": 1,
        "name": "Room A101"
      }
    },
    {
      "booking_id": 486,
      "tenant_id": 123,
      "room_id": 5,
      "check_in_date": "2023-06-10T14:00:00Z",
      "check_out_date": "2023-07-10T12:00:00Z",
      "total_amount": 750000,
      "status": "completed",
      "created_at": "2023-05-15T11:20:00Z",
      "updated_at": "2023-07-10T12:10:00Z",
      "payment_status": "paid",
      "room": {
        "room_id": 5,
        "name": "Room A105"
      }
    }
  ],
  "total_count": 2,
  "status": {
    "status": "success",
    "message": "Bookings retrieved successfully"
  }
}
3. Get Booking Details
Endpoint: GET /v1/bookings/{booking_id}

Description: Get details of a specific booking

Response:
{
  "booking": {
    "booking_id": 501,
    "tenant_id": 123,
    "room_id": 1,
    "check_in_date": "2023-08-10T14:00:00Z",
    "check_out_date": "2023-09-10T12:00:00Z",
    "total_amount": 750000,
    "status": "pending",
    "created_at": "2023-07-15T14:30:00Z",
    "updated_at": "2023-07-15T14:30:00Z",
    "payment_status": "unpaid",
    "room": {
      "room_id": 1,
      "name": "Room A101",
      "classification": {
        "classification_id": 1,
        "name": "laki_laki"
      },
      "rental_type": {
        "rental_type_id": 2,
        "name": "bulanan"
      },
      "rate": 750000
    },
    "tenant": {
      "tenant_id": 123,
      "user": {
        "full_name": "John Doe",
        "email": "student@example.com"
      }
    },
    "approvals": [],
    "payments": [],
    "invoice": {
      "invoice_id": 301,
      "invoice_number": "INV-2023-0301",
      "total_amount": 750000,
      "status": "unpaid",
      "due_date": "2023-07-22T00:00:00Z"
    }
  },
  "status": {
    "status": "success",
    "message": "Booking retrieved successfully"
  }
}
4. Get Booking Payment Status
Endpoint: GET /v1/bookings/{booking_id}/payment-status

Description: Check payment status of a specific booking

Response:
{
  "payment_status": "partially_paid",
  "total_amount": 750000,
  "paid_amount": 250000,
  "pending_amount": 500000,
  "last_payment_date": "2023-07-16T09:45:00Z",
  "payments": [
    {
      "payment_id": 201,
      "amount": 250000,
      "status": "verified",
      "payment_method": "manual",
      "payment_date": "2023-07-16T09:45:00Z"
    }
  ],
  "status": {
    "status": "success",
    "message": "Booking payment status retrieved successfully"
  }
}
Payment System
1. Manual Payment
a. Create Payment
Endpoint: POST /v1/payments

Description: Create a new payment record for manual payment

Request:
{
  "booking_id": 501,
  "tenant_id": 123,
  "invoice_id": 301,
  "amount": 750000,
  "payment_method": "manual",
  "payment_channel": "bank_transfer",
  "notes": "BCA Transfer on July 16"
}
{
  "payment": {
    "payment_id": 202,
    "booking_id": 501,
    "tenant_id": 123,
    "invoice_id": 301,
    "amount": 750000,
    "status": "pending",
    "payment_method": "manual",
    "payment_channel": "bank_transfer",
    "notes": "BCA Transfer on July 16",
    "created_at": "2023-07-16T10:15:00Z",
    "updated_at": "2023-07-16T10:15:00Z"
  },
  "status": {
    "status": "success",
    "message": "Payment created successfully"
  }
}
b. Upload Payment Proof
Endpoint: POST /v1/payments/{payment_id}/proof

Description: Upload proof of payment for manual payment

Request: (multipart/form-data)

{
  "fileName": "string",
  "fileType": "string",
  "content": "string", base64
  "bankName": "string",
  "accountNumber": "string",
  "accountHolderName": "string",
  "transferDate": "2025-06-09T15:13:22.010Z",
  "notes": "string"
}
Response:
{
  "proof": {
    "proofId": 0,
    "paymentId": 0,
    "fileUrl": "string",
    "fileName": "string",
    "fileType": "string",
    "thumbnailUrl": "string",
    "bankName": "string",
    "accountNumber": "string",
    "accountHolderName": "string",
    "transferDate": "2025-06-09T15:13:22.181Z",
    "notes": "string",
    "uploadedAt": "2025-06-09T15:13:22.181Z"
  },
  "status": {
    "message": "string",
    "status": "string"
  }

  2. Midtrans Payment
a. Generate SNAP Token
Endpoint: POST /v1/midtrans/snap-token

Description: Generate a Midtrans SNAP token for frontend integration

Request:
{
  "booking_id": 501,
  "invoice_id": 301,
  "customer_details": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "student@example.com",
    "phone": "08123456789",
    "address": "Jl. Student No. 123",
    "city": "Jakarta",
    "postal_code": "12345",
    "country": "Indonesia"
  }
}
response
{
  "status": "success",
  "message": "SNAP token generated successfully",
  "data": {
    "token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "expiry_time": "2023-07-16T11:30:00Z"
  }
}
b. Initiate Direct Payment
Endpoint: POST /v1/midtrans/initiate

Description: Initiate a direct payment with Midtrans (alternative to SNAP)

Request:
{
  "booking_id": 501,
  "invoice_id": 301,
  "amount": 750000,
  "payment_type": "bank_transfer",
  "customer_details": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "student@example.com",
    "phone": "08123456789"
  },
  "order_id": "",
  "items": [
    {
      "id": "ROOM-A101",
      "name": "Room A101 Monthly Rental",
      "price": 750000,
      "quantity": 1
    }
  ]
}
Response:
{
  "data": {
    "transaction_id": "9aed5972-5b6a-464b-8c06-bc8f0123459d",
    "payment_url": "https://app.sandbox.midtrans.com/v2/bank-transfer/bca/12345",
    "status": "pending",
    "created_at": "2023-07-16T10:30:00Z"
  },
  "message": "Payment initiated successfully",
  "status": "success"
}
c. Check Payment Status
Endpoint: GET /v1/midtrans/status/{order_id}

Description: Check status of a Midtrans payment by order ID

Response:
{
  "status": "success",
  "message": "Payment status retrieved successfully",
  "data": {
    "transaction_status": "settlement",
    "fraud_status": "accept",
    "amount": 750000,
    "payment_type": "bank_transfer",
    "transaction_time": "2023-07-16T10:35:00Z",
    "raw_response": {
      "status_code": "200",
      "transaction_id": "9aed5972-5b6a-464b-8c06-bc8f0123459d",
      "gross_amount": "750000.00",
      "bank": "bca",
      "order_id": "ORDER-501-301",
      "payment_type": "bank_transfer",
      "transaction_status": "settlement",
      "transaction_time": "2023-07-16 10:35:00"
    }
  }
}
3. Invoice Management
a. Get Invoice
Endpoint: GET /v1/invoices/{invoice_id}

Description: Get invoice details

Response:
{
  "invoice": {
    "invoice_id": 301,
    "booking_id": 501,
    "tenant_id": 123,
    "invoice_number": "INV-2023-0301",
    "total_amount": 750000,
    "status": "unpaid",
    "issue_date": "2023-07-15T14:35:00Z",
    "due_date": "2023-07-22T00:00:00Z",
    "notes": "Monthly room rental",
    "created_at": "2023-07-15T14:35:00Z",
    "updated_at": "2023-07-15T14:35:00Z",
    "payment_method": "",
    "items": [
      {
        "item_id": 401,
        "invoice_id": 301,
        "description": "Room A101 rental (Aug 10 - Sep 10)",
        "quantity": 1,
        "unit_price": 750000,
        "total": 750000,
        "created_at": "2023-07-15T14:35:00Z"
      }
    ]
  },
  "status": {
    "status": "success",
    "message": "Invoice retrieved successfully"
  }
}
b. Get Tenant Invoices
Endpoint: GET /v1/tenants/{tenant_id}/invoices

Description: Get all invoices for a specific tenant

Parameters:

status: (optional) Filter by invoice status
page: Page number for pagination
limit: Number of items per page
Response:
{
  "invoices": [
    {
      "invoice_id": 301,
      "booking_id": 501,
      "tenant_id": 123,
      "invoice_number": "INV-2023-0301",
      "total_amount": 750000,
      "status": "unpaid",
      "issue_date": "2023-07-15T14:35:00Z",
      "due_date": "2023-07-22T00:00:00Z",
      "notes": "Monthly room rental",
      "created_at": "2023-07-15T14:35:00Z",
      "updated_at": "2023-07-15T14:35:00Z"
    },
    {
      "invoice_id": 287,
      "booking_id": 486,
      "tenant_id": 123,
      "invoice_number": "INV-2023-0287",
      "total_amount": 750000,
      "status": "paid",
      "issue_date": "2023-05-15T11:25:00Z",
      "due_date": "2023-05-22T00:00:00Z",
      "paid_date": "2023-05-17T09:30:00Z",
      "notes": "Monthly room rental",
      "created_at": "2023-05-15T11:25:00Z",
      "updated_at": "2023-05-17T09:30:00Z",
      "payment_method": "bank_transfer"
    }
  ],
  "total_count": 2,
  "status": {
    "status": "success",
    "message": "Tenant invoices retrieved successfully"
  }
}
c. Get Tenant Payment History
Endpoint: GET /v1/tenants/{tenant_id}/payment-history

Description: Get comprehensive payment history for a tenant

Parameters:

page: Page number for pagination
limit: Number of items per page
Response:
{
  "payments": [
    {
      "payment_id": 202,
      "booking_id": 501,
      "invoice_id": 301,
      "amount": 750000,
      "status": "pending",
      "payment_method": "manual",
      "payment_channel": "bank_transfer",
      "created_at": "2023-07-16T10:15:00Z"
    },
    {
      "payment_id": 189,
      "booking_id": 486,
      "invoice_id": 287,
      "amount": 750000,
      "status": "verified",
      "payment_method": "manual",
      "payment_channel": "bank_transfer",
      "payment_date": "2023-05-17T09:25:00Z",
      "created_at": "2023-05-17T09:20:00Z"
    }
  ],
  "invoices": [
    {
      "invoice_id": 301,
      "booking_id": 501,
      "invoice_number": "INV-2023-0301",
      "total_amount": 750000,
      "status": "unpaid",
      "issue_date": "2023-07-15T14:35:00Z",
      "due_date": "2023-07-22T00:00:00Z"
    },
    {
      "invoice_id": 287,
      "booking_id": 486,
      "invoice_number": "INV-2023-0287",
      "total_amount": 750000,
      "status": "paid",
      "issue_date": "2023-05-15T11:25:00Z",
      "due_date": "2023-05-22T00:00:00Z",
      "paid_date": "2023-05-17T09:30:00Z"
    }
  ],
  "total_count": 2,
  "status": {
    "status": "success",
    "message": "Tenant payment history retrieved successfully"
  }
}
Document Management
1. Upload Approval Document
Endpoint: POST /v1/tenants/{tenant_id}/documents

Description: Upload approval document required for tenant verification

Request: (multipart/form-data)

doc_type_id: 1 (1 for KTP, 2 for SURAT_PERJANJIAN)
file_name: "ktp_john_doe.jpg"
file_type: "image/jpeg"
content: (binary file content) // "binary" or "base64"
description: "KTP for verification"
is_image: true

{
    "content": "YQQvDgGDZbgkKps0M6roMzC/+Mt8KDJL",
    "description": "ut eiusmod in ad sit",
    "doc_type_id": 1495881594,
    "file_name": "non velit commodo",
    "file_type": "ipsum anim consequat laborum",
    "is_image": false,
    "tenant_id": -89519734
}

Response:
{
  "document": {
    "doc_id": 201,
    "tenant_id": 123,
    "doc_type_id": 1,
    "file_url": "https://storage.example.com/documents/ktp_john_doe_123.jpg",
    "file_name": "ktp_john_doe.jpg",
    "file_type": "image/jpeg",
    "status": "pending",
    "uploaded_at": "2023-07-16T11:30:00Z",
    "created_at": "2023-07-16T11:30:00Z",
    "updated_at": "2023-07-16T11:30:00Z",
    "document_type": {
      "doc_type_id": 1,
      "type": "KTP",
      "name": "Kartu Tanda Penduduk"
    },
    "is_image": true,
    "image_width": 1600,
    "image_height": 900,
    "thumbnail_url": "https://storage.example.com/documents/thumb_ktp_john_doe_123.jpg"
  },
  "status": {
    "status": "success",
    "message": "Document uploaded successfully"
  }
}
2. Get Tenant Documents
Endpoint: GET /v1/tenants/{tenant_id}/documents

Description: Get all documents uploaded by a tenant

Parameters:

document_type: (optional) Filter by document type
page: Page number for pagination
limit: Number of items per page
Response:
{
  "documents": [
    {
      "doc_id": 201,
      "tenant_id": 123,
      "doc_type_id": 1,
      "file_url": "https://storage.example.com/documents/ktp_john_doe_123.jpg",
      "file_name": "ktp_john_doe.jpg",
      "file_type": "image/jpeg",
      "status": "pending",
      "notes": "",
      "uploaded_at": "2023-07-16T11:30:00Z",
      "created_at": "2023-07-16T11:30:00Z",
      "updated_at": "2023-07-16T11:30:00Z",
      "document_type": {
        "doc_type_id": 1,
        "type": "KTP",
        "name": "Kartu Tanda Penduduk"
      },
      "is_image": true,
      "thumbnail_url": "https://storage.example.com/documents/thumb_ktp_john_doe_123.jpg"
    }
  ],
  "total_count": 1,
  "status": {
    "status": "success",
    "message": "Documents retrieved successfully"
  }
}
3. Get Document Image
Endpoint: GET /v1/documents/{document_id}/image

Description: Get document image with optional format and sizing

Parameters:

format: (optional) "jpeg", "webp", "png"
encoding: (optional) "binary", "base64"
max_width: (optional) Maximum width to resize to
max_height: (optional) Maximum height to resize to
Response: The image binary data with appropriate Content-Type header, or:
{
  "content": "base64_encoded_string_if_encoding_is_base64",
  "file_type": "image/jpeg",
  "content_encoding": "base64",
  "metadata": {
    "width": 800,
    "height": 450,
    "format": "jpeg",
    "size_bytes": 125000,
    "has_thumbnail": true
  },
  "status": {
    "status": "success",
    "message": "Document image retrieved successfully"
  }
}
4. Sign Policy Agreement
Endpoint: POST /v1/tenants/{tenant_id}/policies/sign

Description: Sign a policy agreement required for tenancy

Request:
{
  "policy_id": "housing-policy-2023",
  "policy_version": "1.2",
  "agreed": true,
  "signed_at": "2023-07-16T11:45:00Z"
}
response
{
  "agreement": {
    "id": "housing-policy-2023-123-1.2",
    "tenant_id": 123,
    "policy_id": "housing-policy-2023",
    "policy_name": "Housing Policies and Rules",
    "policy_version": "1.2",
    "signed": true,
    "signed_at": "2023-07-16T11:45:00Z",
    "expires_at": "2024-07-16T11:45:00Z"
  },
  "status": {
    "status": "success",
    "message": "Policy agreement signed successfully"
  }
}
5. Verify Document Status
Endpoint: GET /v1/documents/{document_id}/verify

Description: Check verification status of a document

Response:
{
  "document": {
    "doc_id": 201,
    "status": "pending",
    "notes": "",
    "approved_by_user_id": 0,
    "approved_at": null
  },
  "status": {
    "status": "success",
    "message": "Document status retrieved successfully"
  }
}
ssue Reporting
1. Report an Issue
Endpoint: POST /v1/issues

Description: Report an issue or problem with the room

Request: (multipart/form-data)

booking_id: 501
reported_by_user_id: 456
description: "Water leakage from bathroom ceiling"
file_name: "water_leak.jpg" (optional)
file_type: "image/jpeg" (optional)
content: (binary file content) (optional)
Response:
{
  "issue": {
    "issue_id": 101,
    "booking_id": 501,
    "reported_by": 456,
    "description": "Water leakage from bathroom ceiling",
    "status": "open",
    "reported_at": "2023-07-16T12:15:00Z",
    "image_file_url": "https://storage.example.com/issues/issue_101_water_leak.jpg",
    "image_file_type": "image/jpeg",
    "image_thumbnail_url": "https://storage.example.com/issues/thumb_issue_101_water_leak.jpg",
    "has_image_attachment": true,
    "reporter": {
      "user_id": 456,
      "full_name": "John Doe",
      "email": "student@example.com"
    }
  },
  "status": {
    "status": "success",
    "message": "Issue reported successfully"
  }
}
2. Get Issue Details
Endpoint: GET /v1/issues/{issue_id}

Description: Get details of a specific issue

Response:
{
  "issue": {
    "issue_id": 101,
    "booking_id": 501,
    "reported_by": 456,
    "description": "Water leakage from bathroom ceiling",
    "status": "in_progress",
    "reported_at": "2023-07-16T12:15:00Z",
    "image_file_url": "https://storage.example.com/issues/issue_101_water_leak.jpg",
    "image_file_type": "image/jpeg",
    "image_thumbnail_url": "https://storage.example.com/issues/thumb_issue_101_water_leak.jpg",
    "has_image_attachment": true,
    "reporter": {
      "user_id": 456,
      "full_name": "John Doe",
      "email": "student@example.com"
    }
  },
  "status": {
    "status": "success",
    "message": "Issue retrieved successfully"
  }
}
3. Get Issue Image
Endpoint: GET /v1/issues/{issue_id}/image

Description: Get the image attached to an issue with optional formatting

Parameters:

format: (optional) "jpeg", "webp", "png"
encoding: (optional) "binary", "base64"
max_width: (optional) Maximum width to resize to
max_height: (optional) Maximum height to resize to
Response: The image binary data with appropriate Content-Type header, or:
{
  "image_content": "base64_encoded_string_if_encoding_is_base64",
  "file_type": "image/jpeg",
  "content_encoding": "base64",
  "metadata": {
    "width": 800,
    "height": 600,
    "format": "jpeg",
    "size_bytes": 150000,
    "has_thumbnail": true
  },
  "status": {
    "status": "success",
    "message": "Issue image retrieved successfully"
  }
}