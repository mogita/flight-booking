The candidate should create a simplified flight booking application using React.js for the frontend and Node.js with Express for the backend. The application should allow users to search for flights based on date, source, and destination, display the results in a sortable manner, and collect passenger details on a booking page.

Functional Requirements:

1. Flight Search:

A user interface (React) with input fields for:
- Departure Date
- Source City/Airport
- Destination City/Airport
- A "Search" button.
    - Search should be server side, along with pagination
- API should handle search and return the results in paginated manner
    - Date picker should be implemented.
    - Ability to book round trip
- Form validation for date, source, and destination.

2. Flight Listing:

- Each flight should display:
    - Airline
    - Flight Number
    - Departure Time
    - Arrival Time
    - Price
- Sorting: Allow users to sort the flight list by:
    - Price (Ascending/Descending)
    - Departure Time (Ascending/Descending)
    - Arrival Time (Ascending/Descending)
    - Sort should happen in server side. API should handle the sorting.
- Display "No flights found" message when no flights match the search criteria.

3. Booking Page:

- When a user selects a flight, they should be redirected to a booking page.
- The booking page should display the flight details (Airline, Flight Number, Departure/Arrival Times, Price).
- The booking page should include a form to collect passenger details:
    - Full Name
    - Email Address
    - Phone Number (optional)
    - Other necessary fields
    - A "Book Flight" button.
- Basic form validation on passenger details.
- On successful submission (no actual booking needs to occur), display a confirmation message.

"Please create a flight booking application according to the specifications outlined above. You are free to use any libraries or frameworks you deem necessary, but please justify your choices in the README.md file. Pay close attention to code quality, error handling, and the overall user experience. Once you have completed the application, please upload the code to a Git repository and share the link with us."