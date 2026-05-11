# PharmaGo

PharmaGo is a healthcare platform that connects users with nearby pharmacies in a faster and more accessible way.

The platform allows users to:
- Request medicines
- Reserve limited-stock medicines
- Ask health-related questions directly to pharmacies

PharmaGo consists of:
- A React Native mobile application for users
- A React + TypeScript web dashboard for pharmacies
- A Firebase backend infrastructure

---
# Features

## User Mobile Application

### Authentication
- User registration and login
- Password reset
- Persistent authentication sessions

### Medicine Requests
Users can:
- Create medicine requests
- Upload medicine images
- Send to specific pharmacies depending on locations
- Receive pharmacy replies in real time

### Medicine Reservations
Users can:
- Reserve available medicines
- Track reservation status
- Cancel reservations
- Reactivate requests after cancellation

### Questions System
Users can:
- Ask pharmacies health-related questions
- Optionally stay anonymous
- Receive replies from pharmacies
- Reply back to pharmacies

### Profile Management
Users can:
- Edit personal information
- See purchase/reservation history
- Easy access to favorited pharmacies

---
## Pharmacy Web Dashboard

### Authentication
- Pharmacy registration and login
- Role-based access control

### Pharmacy Verification System
Pharmacies submit:
- Owner name
- Guild/license ID
- Verification documents

Verification statuses:
- Unverified
- Pending
- Verified
- Rejected

Verification is done by Gemini. For testing purposes, there is a cheat code to get verified immediately: TEST_VERIFY.
Only verified and active pharmacies are visible to users.

### Medicine Requests Management
Pharmacies can:
- View active medicine requests
- Reply to requests
- Confirm or cancel user reservations
- Track reserved requests
- Enter passcode to ensure pickup of reserved medicine

### Questions Management
Pharmacies can:
- View user questions
- Reply to questions

### Pharmacy Profile Management
Pharmacies can:
- Edit pharmacy information
- Update operating hours
- Manage active/inactive status
- Update location -- only one location per account

---
# Tech Stack

## Frontend

### Mobile App
- React Native
- Expo
- TypeScript

### Web Dashboard
- React
- TypeScript
- CSS Modules

---
## Backend & Infrastructure

- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions
- Firebase Storage


---
# Real-Time Functionality

PharmaGo heavily uses Firestore real-time listeners (`onSnapshot`) for:
- Live medicine requests
- Real-time pharmacy replies
- Reservation updates
- Profile updates
- Verification status updates

This allows fast UI updates without requiring page refreshes.
