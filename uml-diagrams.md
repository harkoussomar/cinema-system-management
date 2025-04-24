# CineVerse UML Diagrams

This document contains detailed UML diagrams for the CineVerse cinema management system.

## Use Case Diagram

```mermaid
flowchart TD
    %% Actors - represented as stick figures with labels
    Customer([Customer])
    Admin([Admin])
    PaymentService([Payment Service])
    IdentityProvider([Identity Provider])
    OmdbApi([OMDB API])

    %% Use Case System Boundary
    subgraph CineVerse Cinema Management System
        %% Authentication Use Cases
        UC1((Login))
        UC2((Register))
        UC3((Manage Profile))

        %% Customer Use Cases
        UC4((Browse Films))
        UC5((Search Films))
        UC6((View Film Details))
        UC7((Select Screening))
        UC8((Select Seats))
        UC9((Make Reservation))
        UC10((Complete Checkout))
        UC11((View Reservations))
        UC12((Cancel Reservation))

        %% Admin Use Cases
        UC13((Manage Films))
        UC14((Manage Screenings))
        UC15((Manage Theaters))
        UC16((Manage Reservations))
        UC17((View Reports))
        UC18((Generate Sales Report))
        UC19((Generate Attendance Report))

        %% System Service Use Cases
        UC20((Process Payment))
        UC21((Send Notifications))
        UC22((Fetch Film Data))

        %% Admin Authentication Gate
        UCGate((Admin Authentication))
    end

    %% Customer Relationships - solid lines for direct association
    Customer --- UC2
    Customer --- UC1
    Customer --- UC3
    Customer --- UC4
    Customer --- UC5
    Customer --- UC6
    Customer --- UC7
    Customer --- UC9
    Customer --- UC11

    %% Admin Relationships - solid lines for direct association
    Admin --- UC1
    Admin --- UCGate

    %% Admin Operations - all require authentication
    UCGate --> UC13
    UCGate --> UC14
    UCGate --> UC15
    UCGate --> UC16
    UCGate --> UC17
    UCGate --> UC3

    %% External Service Relationships
    PaymentService --- UC20
    IdentityProvider --- UC1
    OmdbApi --- UC22

    %% Include Relationships - dotted lines with <<include>> stereotype
    UC9 -..-> |<<include>>| UC7
    UC9 -..-> |<<include>>| UC8
    UC9 -..-> |<<include>>| UC10
    UC10 -..-> |<<include>>| UC20

    %% Login required for admin operations
    UCGate -..-> |<<include>>| UC1

    UC13 -..-> |<<include>>| UC22

    UC17 -..-> |<<include>>| UC18
    UC17 -..-> |<<include>>| UC19

    %% Extend Relationships - dotted lines with <<extend>> stereotype
    UC11 -..-> |<<extend>>| UC12

    %% Communication/Uses Relationships
    UC21 -.-> |<<communicates>>| UC10
    UC20 -.-> |<<uses>>| PaymentService
```

## Class Diagram

```mermaid
classDiagram
    %% User Classes
    class User {
        -int id
        -string name
        -string email
        -string password
        -timestamp email_verified_at
        -string remember_token
        -timestamps created_at, updated_at
        +register()
        +login()
        +logout()
        +updateProfile()
    }

    class Admin {
        -int id
        -int user_id
        -string role
        -timestamps created_at, updated_at
        +manageFilms()
        +manageScreenings()
        +manageTheaters()
        +viewReports()
        +manageReservations()
    }

    class Customer {
        -int id
        -int user_id
        -string phone
        -timestamps created_at, updated_at
        +browseFilms()
        +makeReservation()
        +viewReservations()
        +cancelReservation()
    }

    %% Content Management Classes
    class Film {
        -int id
        -string title
        -string description
        -string poster
        -string trailer_url
        -int duration
        -date release_date
        -string genre
        -string director
        -string cast
        -string imdb_id
        -float rating
        -timestamps created_at, updated_at
        +createFilm()
        +updateFilm()
        +deleteFilm()
        +getAllFilms()
        +getFilmDetails()
    }

    class Theater {
        -int id
        -string name
        -string location
        -int capacity
        -string screen_type
        -boolean is_active
        -timestamps created_at, updated_at
        +createTheater()
        +updateTheater()
        +deleteTheater()
        +getAllTheaters()
        +getTheaterDetails()
    }

    class Seat {
        -int id
        -int theater_id
        -string row
        -int number
        -string type
        -boolean is_active
        -timestamps created_at, updated_at
        +createSeat()
        +updateSeat()
        +getSeatsByTheater()
        +checkAvailability()
    }

    class Screening {
        -int id
        -int film_id
        -int theater_id
        -datetime start_time
        -datetime end_time
        -float price
        -boolean is_active
        -timestamps created_at, updated_at
        +createScreening()
        +updateScreening()
        +deleteScreening()
        +getScreeningsByFilm()
        +getAvailableScreenings()
        +getScreeningDetails()
    }

    %% Reservation Classes
    class Reservation {
        -int id
        -int customer_id
        -int screening_id
        -string status
        -float total_amount
        -string reference_number
        -timestamps created_at, updated_at
        +createReservation()
        +updateReservation()
        +cancelReservation()
        +getCustomerReservations()
        +getReservationDetails()
    }

    class ReservationSeat {
        -int id
        -int reservation_id
        -int seat_id
        -float price
        -timestamps created_at, updated_at
        +addSeatToReservation()
        +removeSeatFromReservation()
        +getSeatsByReservation()
    }

    class Payment {
        -int id
        -int reservation_id
        -float amount
        -string payment_method
        -string transaction_id
        -string status
        -timestamps created_at, updated_at
        +processPayment()
        +updatePaymentStatus()
        +getPaymentDetails()
    }

    %% Service Classes
    class OmdbApiService {
        -string api_key
        -string base_url
        +fetchFilmDetails()
        +searchFilms()
    }

    class NotificationService {
        +sendConfirmationEmail()
        +sendReminder()
        +sendCancellationNotice()
    }

    class ReportService {
        +generateSalesReport()
        +generateReservationsReport()
        +generateOccupancyReport()
    }

    %% Relationships
    User <|-- Admin : extends
    User <|-- Customer : extends

    Customer "1" -- "0..*" Reservation : makes
    Reservation "1" -- "1..*" ReservationSeat : contains
    Reservation "1" -- "0..1" Payment : has

    Film "1" -- "0..*" Screening : scheduled in
    Theater "1" -- "0..*" Screening : hosts
    Theater "1" -- "0..*" Seat : has

    Screening "1" -- "0..*" Reservation : includes
    Seat "1" -- "0..*" ReservationSeat : reserved as

    OmdbApiService -- Film : provides data for
    NotificationService -- Reservation : sends notifications for
    ReportService -- Screening : generates reports on
```

## Sequence Diagrams

### User Registration and Login

```mermaid
sequenceDiagram
    actor Customer
    participant UI as UI Frontend
    participant Auth as Authentication Controller
    participant User as User Model
    participant DB as Database
    participant Email as Email Service

    Customer->>UI: Enter registration details
    activate UI
    UI->>Auth: Submit registration data
    activate Auth
    Auth->>Auth: Validate input data
    Auth->>User: Create new user
    activate User
    User->>DB: Save user data
    activate DB
    DB-->>User: Confirm save
    deactivate DB
    deactivate User
    Auth->>Email: Send verification email
    activate Email
    Email-->>Customer: Deliver verification email
    deactivate Email
    Auth-->>UI: Return registration success
    deactivate Auth
    UI-->>Customer: Display success message
    deactivate UI

    Customer->>UI: Enter login credentials
    activate UI
    UI->>Auth: Submit login request
    activate Auth
    Auth->>User: Validate credentials
    activate User
    User->>DB: Check credentials
    activate DB
    DB-->>User: Return user data if valid
    deactivate DB
    User-->>Auth: Authentication result
    deactivate User
    Auth-->>UI: Return auth token on success
    deactivate Auth
    UI-->>Customer: Redirect to dashboard
    deactivate UI
```

### Browsing and Searching Films

```mermaid
sequenceDiagram
    actor Customer
    participant UI as UI Frontend
    participant FC as FilmsController
    participant Film as Film Model
    participant OMDB as OMDB API Service
    participant DB as Database

    Customer->>UI: Visit films page
    activate UI
    UI->>FC: Request film listings
    activate FC
    FC->>Film: Get all films
    activate Film
    Film->>DB: Query films
    activate DB
    DB-->>Film: Return film data
    deactivate DB
    Film-->>FC: Return film collection
    deactivate Film
    FC-->>UI: Return paginated films
    deactivate FC
    UI-->>Customer: Display film listings
    deactivate UI

    Customer->>UI: Enter search criteria
    activate UI
    UI->>FC: Send search query
    activate FC
    FC->>Film: Search films
    activate Film
    Film->>DB: Query with search params
    activate DB
    DB-->>Film: Return matching films
    deactivate DB
    Film-->>FC: Return search results
    deactivate Film
    FC-->>UI: Return formatted results
    deactivate FC
    UI-->>Customer: Display search results
    deactivate UI

    Customer->>UI: Click on film
    activate UI
    UI->>FC: Request film details
    activate FC
    FC->>Film: Get film by ID
    activate Film
    Film->>DB: Query film
    activate DB
    DB-->>Film: Return film data
    deactivate DB
    alt Missing detailed info
        Film->>OMDB: Request additional data
        activate OMDB
        OMDB-->>Film: Return additional data
        deactivate OMDB
        Film->>DB: Update film with new data
        activate DB
        DB-->>Film: Confirm update
        deactivate DB
    end
    Film-->>FC: Return complete film data
    deactivate Film
    FC-->>UI: Return film details
    deactivate FC
    UI-->>Customer: Display film details page
    deactivate UI
```

### Making a Reservation

```mermaid
sequenceDiagram
    actor Customer
    participant UI as UI Frontend
    participant SC as ScreeningController
    participant RC as ReservationController
    participant S as Screening Model
    participant R as Reservation Model
    participant RS as ReservationSeat Model
    participant Seat as Seat Model
    participant P as Payment Service
    participant N as Notification Service
    participant DB as Database

    Customer->>UI: Select film
    activate UI
    UI->>SC: Request screenings
    activate SC
    SC->>S: Get screenings by film ID
    activate S
    S->>DB: Query screenings
    activate DB
    DB-->>S: Return screenings data
    deactivate DB
    S-->>SC: Return screenings
    deactivate S
    SC-->>UI: Return available screenings
    deactivate SC
    UI-->>Customer: Display screening options
    deactivate UI

    Customer->>UI: Select screening
    activate UI
    UI->>SC: Request seat availability
    activate SC
    SC->>Seat: Get seats for theater
    activate Seat
    Seat->>DB: Query seats
    activate DB
    DB-->>Seat: Return seats data
    deactivate DB
    Seat-->>SC: Return seats
    deactivate Seat
    SC->>RS: Get reserved seats
    activate RS
    RS->>DB: Query reservation seats
    activate DB
    DB-->>RS: Return reserved seats
    deactivate DB
    RS-->>SC: Return occupied seats
    deactivate RS
    SC-->>UI: Return seat availability map
    deactivate SC
    UI-->>Customer: Display seat selection
    deactivate UI

    Customer->>UI: Select seats
    activate UI
    UI->>RC: Create reservation
    activate RC
    RC->>R: Initialize reservation
    activate R
    R->>DB: Save reservation
    activate DB
    DB-->>R: Confirm save
    deactivate DB
    R-->>RC: Return reservation
    deactivate R
    loop For each selected seat
        RC->>RS: Add seat to reservation
        activate RS
        RS->>DB: Save reservation seat
        activate DB
        DB-->>RS: Confirm save
        deactivate DB
        RS-->>RC: Confirm seat added
        deactivate RS
    end
    RC-->>UI: Return reservation summary
    deactivate RC
    UI-->>Customer: Display reservation summary
    deactivate UI

    Customer->>UI: Proceed to payment
    activate UI
    UI->>RC: Process payment
    activate RC
    RC->>P: Initialize payment
    activate P
    P->>P: Process payment transaction
    P-->>RC: Return payment result
    deactivate P
    alt Payment successful
        RC->>R: Update reservation status
        activate R
        R->>DB: Update reservation
        activate DB
        DB-->>R: Confirm update
        deactivate DB
        R-->>RC: Confirm status update
        deactivate R
        RC->>N: Send confirmation
        activate N
        N-->>Customer: Send confirmation email
        deactivate N
    else Payment failed
        RC->>R: Update reservation status
        activate R
        R->>DB: Update reservation
        activate DB
        DB-->>R: Confirm update
        deactivate DB
        R-->>RC: Confirm status update
        deactivate R
    end
    RC-->>UI: Return payment result
    deactivate RC
    UI-->>Customer: Display confirmation or error
    deactivate UI
```

### Admin Film Management

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI
    participant FC as FilmController
    participant Film as Film Model
    participant OMDB as OMDB API Service
    participant DB as Database

    Admin->>UI: Navigate to films management
    activate UI
    UI->>FC: Request films list
    activate FC
    FC->>Film: Get all films
    activate Film
    Film->>DB: Query films
    activate DB
    DB-->>Film: Return films data
    deactivate DB
    Film-->>FC: Return films collection
    deactivate Film
    FC-->>UI: Return paginated films
    deactivate FC
    UI-->>Admin: Display films table
    deactivate UI

    Admin->>UI: Click create new film
    activate UI
    UI-->>Admin: Display film form
    Admin->>UI: Enter film details
    alt Search OMDB
        Admin->>UI: Search by title
        UI->>FC: Search OMDB
        activate FC
        FC->>OMDB: Query film data
        activate OMDB
        OMDB-->>FC: Return matched films
        deactivate OMDB
        FC-->>UI: Return search results
        deactivate FC
        UI-->>Admin: Display results
        Admin->>UI: Select film from results
        UI->>FC: Get film details from OMDB
        activate FC
        FC->>OMDB: Get detailed data
        activate OMDB
        OMDB-->>FC: Return detailed data
        deactivate OMDB
        FC-->>UI: Return pre-filled form
        deactivate FC
        UI-->>Admin: Display pre-filled form
    end
    Admin->>UI: Submit film form
    UI->>FC: Create film
    activate FC
    FC->>Film: Create new film
    activate Film
    Film->>DB: Save film data
    activate DB
    DB-->>Film: Confirm save
    deactivate DB
    Film-->>FC: Return new film
    deactivate Film
    FC-->>UI: Return success response
    deactivate FC
    UI-->>Admin: Display success message
    deactivate UI

    Admin->>UI: Click edit film
    activate UI
    UI->>FC: Get film details
    activate FC
    FC->>Film: Find film by ID
    activate Film
    Film->>DB: Query film
    activate DB
    DB-->>Film: Return film data
    deactivate DB
    Film-->>FC: Return film data
    deactivate Film
    FC-->>UI: Return film details
    deactivate FC
    UI-->>Admin: Display edit form
    deactivate UI

    Admin->>UI: Update film details
    activate UI
    UI->>FC: Update film
    activate FC
    FC->>Film: Update film
    activate Film
    Film->>DB: Update film data
    activate DB
    DB-->>Film: Confirm update
    deactivate DB
    Film-->>FC: Return updated film
    deactivate Film
    FC-->>UI: Return success response
    deactivate FC
    UI-->>Admin: Display success message
    deactivate UI

    Admin->>UI: Click delete film
    activate UI
    UI->>FC: Delete film request
    activate FC
    FC->>Film: Delete film
    activate Film
    Film->>DB: Delete film data
    activate DB
    DB-->>Film: Confirm deletion
    deactivate DB
    Film-->>FC: Return deletion status
    deactivate Film
    FC-->>UI: Return success response
    deactivate FC
    UI-->>Admin: Display success message
    deactivate UI
```

### Admin Screening Management

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI
    participant SC as ScreeningController
    participant S as Screening Model
    participant F as Film Model
    participant T as Theater Model
    participant DB as Database

    Admin->>UI: Navigate to screenings
    activate UI
    UI->>SC: Request screenings list
    activate SC
    SC->>S: Get all screenings
    activate S
    S->>DB: Query screenings
    activate DB
    DB-->>S: Return screenings data
    deactivate DB
    S-->>SC: Return screenings collection
    deactivate S
    SC-->>UI: Return paginated screenings
    deactivate SC
    UI-->>Admin: Display screenings table
    deactivate UI

    Admin->>UI: Click create screening
    activate UI
    UI->>SC: Get films and theaters
    activate SC
    SC->>F: Get all films
    activate F
    F->>DB: Query films
    activate DB
    DB-->>F: Return films data
    deactivate DB
    F-->>SC: Return films collection
    deactivate F
    SC->>T: Get all theaters
    activate T
    T->>DB: Query theaters
    activate DB
    DB-->>T: Return theaters data
    deactivate DB
    T-->>SC: Return theaters collection
    deactivate T
    SC-->>UI: Return films and theaters
    deactivate SC
    UI-->>Admin: Display screening form
    deactivate UI

    Admin->>UI: Enter screening details
    activate UI
    Admin->>UI: Submit screening form
    UI->>SC: Create screening
    activate SC
    SC->>S: Create new screening
    activate S
    S->>DB: Save screening data
    activate DB
    DB-->>S: Confirm save
    deactivate DB
    S-->>SC: Return new screening
    deactivate S
    SC-->>UI: Return success response
    deactivate SC
    UI-->>Admin: Display success message
    deactivate UI

    Admin->>UI: Click edit screening
    activate UI
    UI->>SC: Get screening details
    activate SC
    SC->>S: Find screening by ID
    activate S
    S->>DB: Query screening
    activate DB
    DB-->>S: Return screening data
    deactivate DB
    S-->>SC: Return screening data
    deactivate S
    SC-->>UI: Return screening details
    deactivate SC
    UI-->>Admin: Display edit form
    deactivate UI

    Admin->>UI: Update screening details
    activate UI
    UI->>SC: Update screening
    activate SC
    SC->>S: Update screening
    activate S
    S->>DB: Update screening data
    activate DB
    DB-->>S: Confirm update
    deactivate DB
    S-->>SC: Return updated screening
    deactivate S
    SC-->>UI: Return success response
    deactivate SC
    UI-->>Admin: Display success message
    deactivate UI

    Admin->>UI: Click delete screening
    activate UI
    UI->>SC: Delete screening request
    activate SC
    SC->>S: Delete screening
    activate S
    S->>DB: Delete screening data
    activate DB
    DB-->>S: Confirm deletion
    deactivate DB
    S-->>SC: Return deletion status
    deactivate S
    SC-->>UI: Return success response
    deactivate SC
    UI-->>Admin: Display success message
    deactivate UI
```

### Admin Reporting

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI
    participant RC as ReportController
    participant RS as ReportService
    participant R as Reservation Model
    participant S as Screening Model
    participant DB as Database

    Admin->>UI: Navigate to reports dashboard
    activate UI
    UI->>RC: Request dashboard data
    activate RC
    RC->>RS: Generate dashboard summary
    activate RS
    RS->>R: Get sales data
    activate R
    R->>DB: Query reservations
    activate DB
    DB-->>R: Return reservations data
    deactivate DB
    R-->>RS: Return sales figures
    deactivate R
    RS->>S: Get occupancy data
    activate S
    S->>DB: Query screenings
    activate DB
    DB-->>S: Return screenings data
    deactivate DB
    S-->>RS: Return occupancy rates
    deactivate S
    RS-->>RC: Return dashboard summary
    deactivate RS
    RC-->>UI: Return dashboard data
    deactivate RC
    UI-->>Admin: Display dashboard
    deactivate UI

    Admin->>UI: Select report parameters
    activate UI
    UI->>RC: Request specific report
    activate RC
    RC->>RS: Generate detailed report
    activate RS
    RS->>DB: Execute complex report queries
    activate DB
    DB-->>RS: Return report data
    deactivate DB
    RS-->>RC: Return formatted report
    deactivate RS
    RC-->>UI: Return report data
    deactivate RC
    UI-->>Admin: Display report visualization
    deactivate UI

    Admin->>UI: Click export report
    activate UI
    UI->>RC: Request report export
    activate RC
    RC->>RS: Format report for export
    activate RS
    RS-->>RC: Return exportable data
    deactivate RS
    RC-->>UI: Return download URL
    deactivate RC
    UI-->>Admin: Download report file
    deactivate UI
```

### Customer Viewing Reservations

```mermaid
sequenceDiagram
    actor Customer
    participant UI as UI Frontend
    participant RC as ReservationController
    participant R as Reservation Model
    participant S as Screening Model
    participant F as Film Model
    participant DB as Database

    Customer->>UI: Navigate to my reservations
    activate UI
    UI->>RC: Request customer reservations
    activate RC
    RC->>R: Get reservations by customer
    activate R
    R->>DB: Query reservations
    activate DB
    DB-->>R: Return reservations data
    deactivate DB
    R->>S: Get screenings for reservations
    activate S
    S->>DB: Query screenings
    activate DB
    DB-->>S: Return screenings data
    deactivate DB
    S->>F: Get films for screenings
    activate F
    F->>DB: Query films
    activate DB
    DB-->>F: Return films data
    deactivate DB
    F-->>S: Return film data
    deactivate F
    S-->>R: Return screening with film data
    deactivate S
    R-->>RC: Return complete reservation data
    deactivate R
    RC-->>UI: Return formatted reservations
    deactivate RC
    UI-->>Customer: Display reservations list
    deactivate UI

    Customer->>UI: Click on reservation
    activate UI
    UI->>RC: Request reservation details
    activate RC
    RC->>R: Get reservation by ID
    activate R
    R->>DB: Query reservation and related data
    activate DB
    DB-->>R: Return detailed reservation data
    deactivate DB
    R-->>RC: Return reservation details
    deactivate R
    RC-->>UI: Return formatted details
    deactivate RC
    UI-->>Customer: Display reservation details
    deactivate UI

    Customer->>UI: Click cancel reservation
    activate UI
    UI->>RC: Cancel reservation request
    activate RC
    RC->>R: Cancel reservation
    activate R
    R->>DB: Update reservation status
    activate DB
    DB-->>R: Confirm update
    deactivate DB
    R-->>RC: Return updated reservation
    deactivate R
    RC-->>UI: Return success response
    deactivate RC
    UI-->>Customer: Display confirmation
    deactivate UI
```
